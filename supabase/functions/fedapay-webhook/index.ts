import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0'
import { syncFedapayTransaction, verifyFedapaySignature } from '../_shared/fedapay.ts'

// ── Webhook FedaPay ───────────────────────────────────────────────────
// URL à déclarer dans le tableau de bord FedaPay (Paramètres → Webhooks) :
//   https://<project>.supabase.co/functions/v1/fedapay-webhook
// La clé secrète du webhook affichée par FedaPay → secret FEDAPAY_WEBHOOK_SECRET.
//
// Le webhook ne sert que de déclencheur : la transaction est relue chez FedaPay
// (syncFedapayTransaction) et seul ce statut fait foi pour activer un pack.

const HANDLED_EVENTS = new Set([
  'transaction.approved',
  'transaction.transferred',
  'transaction.declined',
  'transaction.canceled',
])

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const webhookSecret = Deno.env.get('FEDAPAY_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('FEDAPAY_WEBHOOK_SECRET non configuré')
    return new Response('Webhook not configured', { status: 500 })
  }

  // Signature obligatoire — pas de fallback non signé
  const signature = req.headers.get('X-FEDAPAY-SIGNATURE')
  const rawBody = await req.text()
  if (!signature || !(await verifyFedapaySignature(rawBody, signature, webhookSecret))) {
    console.error('Signature FedaPay absente ou invalide')
    return new Response('Signature invalide', { status: 401 })
  }

  // deno-lint-ignore no-explicit-any
  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response('Body invalide', { status: 400 })
  }

  const eventName: string = event?.name ?? ''
  if (!HANDLED_EVENTS.has(eventName)) {
    return new Response('Ignoré', { status: 200 })
  }

  // L'entité peut être un objet ou une chaîne JSON selon la version de l'API
  let entity = event.entity ?? event.data?.object ?? event.data ?? {}
  if (typeof entity === 'string') {
    try { entity = JSON.parse(entity) } catch { entity = {} }
  }
  const transactionId = String(entity?.id ?? event.object_id ?? '')
  if (!/^\d{1,20}$/.test(transactionId)) {
    console.error('Webhook FedaPay sans identifiant de transaction exploitable:', eventName)
    return new Response('Transaction manquante — ignoré', { status: 200 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const result = await syncFedapayTransaction(supabase, transactionId)
    console.log(`FedaPay webhook ${eventName} → ${transactionId}: ${result.status}`)
    return new Response('OK', { status: 200 })
  } catch (err) {
    // 500 → FedaPay réessaiera plus tard
    console.error('Erreur traitement webhook FedaPay:', err)
    return new Response('Erreur interne', { status: 500 })
  }
})
