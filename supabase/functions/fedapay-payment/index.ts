import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PACKS } from '../_shared/packs.ts'
import {
  CHECKOUT_METHODS,
  DIRECT_MODES,
  fedapayKey,
  fedapayRequest,
  syncFedapayTransaction,
  unwrapTransaction,
} from '../_shared/fedapay.ts'

const ALLOWED_ORIGINS = ['https://ayeprep.com', 'https://www.ayeprep.com', 'http://localhost:5173']
const VALID_COUNTRIES = ['BJ', 'TG', 'CI', 'SN', 'ML', 'CM', 'NE', 'GN']

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

// Deux actions :
//  - (défaut) "pay"   : crée la transaction et déclenche le paiement Mobile Money
//  - "check"          : vérifie le statut auprès de FedaPay (utilisé par le polling)
interface PaymentRequest {
  action?: 'pay' | 'check'
  transaction_id?: string
  pack_id: string
  method: string
  phone_number: string   // Ex: '+22997000000'
  phone_country: string  // Ex: 'BJ'
  customer_name: string
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // ── Auth ────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Authorization header requis' }, 401)

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authError || !user) return json({ error: 'Non autorisé' }, 401)

  let body: PaymentRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Body JSON invalide' }, 400)
  }

  try {
    fedapayKey()
  } catch {
    console.error('FEDAPAY_SECRET_KEY non configuré')
    return json({ error: 'Configuration serveur manquante' }, 500)
  }

  // ── Action "check" : statut d'une transaction de l'utilisateur ─────────
  if (body.action === 'check') {
    const txId = String(body.transaction_id ?? '')
    if (!/^\d{1,20}$/.test(txId)) return json({ error: 'transaction_id invalide' }, 400)

    const { data: attempt } = await supabase
      .from('payment_attempts')
      .select('user_id')
      .eq('fedapay_transaction_id', txId)
      .maybeSingle()
    if (!attempt || attempt.user_id !== user.id) return json({ error: 'Transaction introuvable' }, 404)

    try {
      const result = await syncFedapayTransaction(supabase, txId)
      return json({ status: result.status, pack_id: result.pack_id })
    } catch (err) {
      console.error('fedapay check error:', err)
      return json({ error: 'Erreur serveur interne' }, 500)
    }
  }

  // ── Action "pay" ───────────────────────────────────────────────────────
  const { pack_id, method, phone_number, phone_country, customer_name } = body

  const pack = PACKS[pack_id]
  if (!pack) return json({ error: 'Pack inconnu' }, 400)

  const isDirect = DIRECT_MODES.has(method)
  if (!isDirect && !CHECKOUT_METHODS.has(method)) {
    return json({ error: 'Moyen de paiement non supporté' }, 400)
  }

  if (!VALID_COUNTRIES.includes(phone_country)) {
    return json({ error: 'Pays non supporté' }, 400)
  }

  const cleanPhone = String(phone_number ?? '').replace(/\s+/g, '').replace(/^00/, '+')
  if (!/^\+?\d{8,15}$/.test(cleanPhone)) {
    return json({ error: 'Numéro de téléphone invalide' }, 400)
  }

  const appUrl = Deno.env.get('APP_URL') ?? 'https://ayeprep.com'
  const customerPhone = { number: cleanPhone, country: phone_country.toLowerCase() }
  const [firstname, ...rest] = String(customer_name || user.email || 'Client').trim().split(/\s+/)

  try {
    // 1. Création de la transaction
    // callback_url = page où FedaPay renvoie le NAVIGATEUR du client (avec ?id=…&status=…).
    // Le webhook serveur se configure séparément dans le tableau de bord FedaPay.
    const transaction = unwrapTransaction(await fedapayRequest('/transactions', 'POST', {
      description: `${pack.name} — ayePREP`,
      amount: pack.price_xof,
      currency: { iso: 'XOF' },
      callback_url: `${appUrl}/subscribe`,
      customer: {
        firstname: firstname.slice(0, 100),
        lastname: (rest.join(' ') || firstname).slice(0, 100),
        email: user.email,
        phone_number: customerPhone,
      },
      custom_metadata: { user_id: user.id, pack_id },
    }))

    const transactionId = String(transaction?.id ?? '')
    if (!transactionId) throw new Error('Réponse FedaPay sans identifiant de transaction')

    // 2. Enregistrement local AVANT tout paiement : c'est lui qui relie la transaction
    //    à l'utilisateur lors de la confirmation.
    const { error: insertError } = await supabase.from('payment_attempts').insert({
      user_id: user.id,
      pack_id,
      amount_xof: pack.price_xof,
      method,
      phone_number: cleanPhone,
      phone_country,
      fedapay_transaction_id: transactionId,
      status: 'pending',
    })
    if (insertError) throw insertError

    // 3. Jeton de paiement (+ URL de la page de paiement FedaPay)
    const tokenData = await fedapayRequest(`/transactions/${transactionId}/token`, 'POST')
    const token: string = tokenData.token
    const paymentUrl: string = tokenData.url

    // 4. Mode direct : push USSD sur le téléphone du client
    if (isDirect) {
      try {
        await fedapayRequest(`/${method}`, 'POST', { token, phone_number: customerPhone })
        console.log(`Paiement FedaPay initié (push): ${transactionId} — ${pack.name} — ${user.id}`)
        return json({
          success: true,
          mode: 'push',
          transaction_id: transactionId,
          message: 'Une demande de paiement a été envoyée sur votre téléphone. Confirmez avec votre code PIN Mobile Money.',
          pack: { id: pack_id, name: pack.name, amount_xof: pack.price_xof },
          status: 'pending',
        })
      } catch (err) {
        // Le push a échoué : on bascule sur la page de paiement FedaPay plutôt que d'abandonner
        console.error('FedaPay push error, bascule vers la page de paiement:', err)
      }
    }

    console.log(`Paiement FedaPay initié (checkout): ${transactionId} — ${pack.name} — ${user.id}`)
    return json({
      success: true,
      mode: 'checkout',
      transaction_id: transactionId,
      payment_url: paymentUrl,
      message: 'Finalisez votre paiement sur la page sécurisée FedaPay.',
      pack: { id: pack_id, name: pack.name, amount_xof: pack.price_xof },
      status: 'pending',
    })
  } catch (err) {
    console.error('fedapay-payment error:', err)
    return json({ error: 'Impossible d\'initier le paiement Mobile Money. Réessayez plus tard.' }, 502)
  }
})
