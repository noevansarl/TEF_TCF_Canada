import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Webhook FedaPay ───────────────────────────────────────────────────
// FedaPay appelle ce endpoint après confirmation du paiement Mobile Money.
// Documentation: https://docs.fedapay.com/api/webhooks
//
// Événements traités:
//   transaction.approved  → activer le pack
//   transaction.declined  → marquer échec
//   transaction.canceled  → marquer annulé

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-fedapay-signature',
}

const PACKS: Record<string, {
  name: string; price_xof: number; duration_days: number;
  ai_trials: number; co_tests: number; ce_tests: number; simulations: number
}> = {
  bronze:   { name: 'Pack Découverte',  price_xof: 9800,  duration_days: 5,  ai_trials: 3,  co_tests: 40,  ce_tests: 40,  simulations: 1  },
  silver:   { name: 'Pack Préparation', price_xof: 19600, duration_days: 30, ai_trials: 8,  co_tests: 120, ce_tests: 120, simulations: 5  },
  gold:     { name: 'Pack Intensif',    price_xof: 32700, duration_days: 60, ai_trials: 15, co_tests: 300, ce_tests: 300, simulations: 12 },
  platinum: { name: 'Pack Champion',    price_xof: 52300, duration_days: 90, ai_trials: 30, co_tests: -1,  ce_tests: -1,  simulations: -1 },
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // ── Vérification de la signature FedaPay ────────────────────────────
  // FedaPay envoie un header X-FedaPay-Signature avec HMAC-SHA256
  const signature = req.headers.get('X-FedaPay-Signature')
  const webhookSecret = Deno.env.get('FEDAPAY_WEBHOOK_SECRET')

  const rawBody = await req.text()

  if (webhookSecret && signature) {
    try {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      )
      const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0))
      const bodyBytes = new TextEncoder().encode(rawBody)
      const valid = await crypto.subtle.verify('HMAC', key, sigBytes, bodyBytes)

      if (!valid) {
        console.error('Signature FedaPay invalide')
        return new Response('Signature invalide', { status: 401 })
      }
    } catch (e) {
      console.error('Erreur vérification signature:', e)
      return new Response('Erreur signature', { status: 400 })
    }
  }

  // ── Parsing de l'événement ───────────────────────────────────────────
  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response('Body invalide', { status: 400 })
  }

  const { name: eventName, data } = event
  const transaction = data?.object ?? data?.transaction ?? {}

  console.log(`FedaPay webhook: ${eventName}`, { transaction_id: transaction.id })

  // ── transaction.approved : paiement confirmé ─────────────────────────
  if (eventName === 'transaction.approved') {
    const transactionId = String(transaction.id)
    const metadata      = transaction.metadata ?? {}
    const userId        = metadata.user_id
    const packId        = metadata.pack_id
    const amountXof     = transaction.amount

    if (!userId || !packId) {
      console.error('Metadata manquante:', { userId, packId })
      // On retourne 200 pour éviter les retries FedaPay
      return new Response('Metadata manquante — ignoré', { status: 200 })
    }

    const pack = PACKS[packId]
    if (!pack) {
      console.error('Pack inconnu:', packId)
      return new Response('Pack inconnu — ignoré', { status: 200 })
    }

    // Anti-fraude : vérifier le montant
    if (Math.abs(amountXof - pack.price_xof) > 10) {
      console.error(`Montant suspect: ${amountXof} vs ${pack.price_xof}`)
      return new Response('Montant suspect — ignoré', { status: 200 })
    }

    // Idempotence : vérifier si déjà traité
    const { data: existing } = await supabase
      .from('user_pack_subscriptions')
      .select('id')
      .eq('fedapay_transaction_id', transactionId)
      .limit(1)
      .maybeSingle()

    if (existing) {
      console.log('Transaction déjà traitée:', transactionId)
      return new Response('Déjà traité', { status: 200 })
    }

    // Calculer la date d'expiration
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + pack.duration_days)

    // Créer l'abonnement
    const { error: subError } = await supabase
      .from('user_pack_subscriptions')
      .insert({
        user_id:               userId,
        pack_id:               packId,
        expires_at:            expires_at.toISOString(),
        payment_method:        transaction.payment_method?.method_name ?? 'mobile_money',
        payment_currency:      'XOF',
        amount_paid:           amountXof,
        ai_trials_remaining:   pack.ai_trials,
        co_tests_remaining:    pack.co_tests,
        ce_tests_remaining:    pack.ce_tests,
        simulations_remaining: pack.simulations,
        status:                'active',
        fedapay_transaction_id: transactionId,
      })

    if (subError) {
      console.error('Erreur création abonnement:', subError)
      return new Response('Erreur DB', { status: 500 })
    }

    // Mettre à jour le profil utilisateur
    await supabase
      .from('users')
      .update({
        active_pack_id:  packId,
        pack_expires_at: expires_at.toISOString(),
        subscription_tier: packId,
      })
      .eq('id', userId)

    // Mettre à jour payment_attempts si existant
    await supabase
      .from('payment_attempts')
      .update({ status: 'completed' })
      .eq('fedapay_transaction_id', transactionId)

    console.log(`✅ Pack ${pack.name} activé via FedaPay pour user ${userId}`)

    // Optionnel: envoyer notification push / email
    // await supabase.functions.invoke('send-push', { body: { user_id: userId, title: '🎉 Pack activé !', ... }})
  }

  // ── transaction.declined / transaction.canceled ───────────────────────
  if (eventName === 'transaction.declined' || eventName === 'transaction.canceled') {
    const transactionId = String(transaction.id)
    await supabase
      .from('payment_attempts')
      .update({ status: eventName === 'transaction.declined' ? 'declined' : 'canceled' })
      .eq('fedapay_transaction_id', transactionId)

    console.log(`❌ Transaction ${eventName}: ${transactionId}`)
  }

  return new Response('OK', { status: 200 })
})
