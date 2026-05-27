import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Configuration FedaPay ─────────────────────────────────────────────
// Documentation: https://docs.fedapay.com/api
const FEDAPAY_API_URL = 'https://api.fedapay.com/v1'

// Packs (source de vérité côté serveur — doit rester en sync avec activate-pack)
const PACKS: Record<string, { name: string; price_xof: number; duration_days: number }> = {
  bronze:   { name: 'Pack Découverte',  price_xof: 9800,  duration_days: 5  },
  silver:   { name: 'Pack Préparation', price_xof: 19600, duration_days: 30 },
  gold:     { name: 'Pack Intensif',    price_xof: 32700, duration_days: 60 },
  platinum: { name: 'Pack Champion',    price_xof: 52300, duration_days: 90 },
}

// ── Méthodes Mobile Money supportées par FedaPay ─────────────────────
// - orange_money_ci / orange_money_ml / orange_money_sn (MOOV/Orange selon pays)
// - mtn_open          (MTN Mobile Money — CM, CG, GH...)
// - moov_money        (Moov Africa — BF, CI, TG...)
// - wave_money        (Wave — SN, CI)
type MobileMoneyMethod =
  | 'orange_money_sn'
  | 'orange_money_ci'
  | 'orange_money_ml'
  | 'mtn_open'
  | 'moov_money'
  | 'wave_money'

interface PaymentRequest {
  pack_id: string
  method: MobileMoneyMethod
  phone_number: string   // Ex: '+221701234567' ou '701234567'
  phone_country: string  // Ex: 'SN', 'CI', 'CM', 'ML'
  customer_name: string
  customer_email: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // ── Auth ────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header requis' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // ── Parsing du body ──────────────────────────────────────────────────
  let body: PaymentRequest
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Body JSON invalide' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { pack_id, method, phone_number, phone_country, customer_name, customer_email } = body

  // ── Validation du pack ────────────────────────────────────────────────
  const pack = PACKS[pack_id]
  if (!pack) {
    return new Response(JSON.stringify({ error: `Pack inconnu: ${pack_id}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // ── Validation du numéro de téléphone ─────────────────────────────────
  const cleanPhone = phone_number.replace(/\s+/g, '').replace(/^00/, '+')
  if (!cleanPhone || cleanPhone.length < 8) {
    return new Response(JSON.stringify({ error: 'Numéro de téléphone invalide' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const fedapayKey = Deno.env.get('FEDAPAY_SECRET_KEY')
  if (!fedapayKey) {
    console.error('FEDAPAY_SECRET_KEY non configuré')
    return new Response(JSON.stringify({ error: 'Configuration serveur manquante' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // ── Création de la transaction FedaPay ───────────────────────────────
  // Ref: https://docs.fedapay.com/api/transactions
  try {
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/fedapay-webhook`
    const returnUrl   = `${Deno.env.get('APP_URL') ?? 'https://francophonia.app'}/paiement-confirme`

    const transactionPayload = {
      description: `${pack.name} — Francophonia`,
      amount: pack.price_xof,
      currency: { iso: 'XOF' },
      callback_url: callbackUrl,
      return_url: returnUrl,
      customer: {
        email: customer_email || user.email,
        name: customer_name,
        phone_number: {
          number: cleanPhone,
          country: phone_country,
        }
      },
      metadata: {
        user_id: user.id,
        pack_id,
        platform: 'web',
      }
    }

    const fedaRes = await fetch(`${FEDAPAY_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fedapayKey}`,
        'Content-Type': 'application/json',
        'X-VERSION': '1.1',
      },
      body: JSON.stringify(transactionPayload)
    })

    if (!fedaRes.ok) {
      const errBody = await fedaRes.text()
      console.error('FedaPay API error:', fedaRes.status, errBody)
      return new Response(
        JSON.stringify({ error: 'Erreur paiement Mobile Money. Vérifiez votre numéro.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const fedaData: any = await fedaRes.json()
    const transaction = fedaData.v1?.transaction ?? fedaData.transaction ?? fedaData

    // ── Déclencher le paiement Mobile Money ─────────────────────────────
    // L'utilisateur reçoit une notification USSD / push sur son téléphone
    const sendPayload = {
      customer: {
        phone_number: {
          number: cleanPhone,
          country: phone_country,
        }
      },
      method,
    }

    const sendRes = await fetch(
      `${FEDAPAY_API_URL}/transactions/${transaction.id}/send_now`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${fedapayKey}`,
          'Content-Type': 'application/json',
          'X-VERSION': '1.1',
        },
        body: JSON.stringify(sendPayload)
      }
    )

    if (!sendRes.ok) {
      const errBody = await sendRes.text()
      console.error('FedaPay send_now error:', sendRes.status, errBody)
      return new Response(
        JSON.stringify({ error: 'Impossible d\'initier le paiement. Vérifiez votre numéro Mobile Money.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Enregistrer la transaction en DB (statut pending) ─────────────────
    await supabase.from('payment_attempts').insert({
      user_id: user.id,
      pack_id,
      amount_xof: pack.price_xof,
      method,
      phone_number: cleanPhone,
      phone_country,
      fedapay_transaction_id: String(transaction.id),
      status: 'pending',
    }).select()

    console.log(`Paiement FedaPay initié: ${transaction.id} — ${pack.name} — ${user.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        message: `Une demande de paiement ${method.replace('_', ' ')} a été envoyée sur votre téléphone. Confirmez avec votre code PIN Mobile Money.`,
        pack: {
          id: pack_id,
          name: pack.name,
          amount_xof: pack.price_xof,
        },
        status: 'pending'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (err) {
    console.error('fedapay-payment error:', err)
    return new Response(
      JSON.stringify({ error: 'Erreur serveur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
