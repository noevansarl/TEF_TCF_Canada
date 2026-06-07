import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = ['https://ayeprep.com', 'https://www.ayeprep.com', 'http://localhost:5173']
const VALID_CURRENCIES = ['EUR', 'XOF']
const VALID_METHODS = ['stripe', 'orange_money', 'mtn_momo', 'wave']

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

const PACKS: Record<string, {
  name: string; price_eur: number; price_xof: number; duration_days: number
  ai_trials: number; co_tests: number; ce_tests: number; simulations: number
}> = {
  bronze:   { name: 'Pack Découverte',  price_eur: 14.99, price_xof: 9800,  duration_days: 5,  ai_trials: 3,  co_tests: 40,  ce_tests: 40,  simulations: 1  },
  silver:   { name: 'Pack Préparation', price_eur: 29.99, price_xof: 19600, duration_days: 30, ai_trials: 8,  co_tests: 120, ce_tests: 120, simulations: 5  },
  gold:     { name: 'Pack Intensif',    price_eur: 49.99, price_xof: 32700, duration_days: 60, ai_trials: 15, co_tests: 300, ce_tests: 300, simulations: 12 },
  platinum: { name: 'Pack Champion',    price_eur: 79.99, price_xof: 52300, duration_days: 90, ai_trials: 30, co_tests: -1,  ce_tests: -1,  simulations: -1 },
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const { pack_id, payment_method, payment_currency, amount_paid, payment_ref } = await req.json()

    // Validation des inputs
    if (!VALID_CURRENCIES.includes(payment_currency)) {
      return new Response(JSON.stringify({ error: 'Invalid currency' }), { status: 400, headers: corsHeaders })
    }
    if (!VALID_METHODS.includes(payment_method)) {
      return new Response(JSON.stringify({ error: 'Invalid payment method' }), { status: 400, headers: corsHeaders })
    }

    const pack = PACKS[pack_id]
    if (!pack) {
      return new Response(JSON.stringify({ error: 'Pack inconnu' }), { status: 400, headers: corsHeaders })
    }

    // Vérification du montant (anti-fraude)
    const expected = payment_currency === 'XOF' ? pack.price_xof : pack.price_eur
    if (Math.abs(amount_paid - expected) > 0.5) {
      return new Response(JSON.stringify({ error: 'Montant invalide' }), { status: 400, headers: corsHeaders })
    }

    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + pack.duration_days)

    const { data: subscription, error: subError } = await supabase
      .from('user_pack_subscriptions')
      .insert({
        user_id: user.id,
        pack_id,
        expires_at: expires_at.toISOString(),
        payment_method: payment_method,
        payment_currency: payment_currency,
        amount_paid,
        ai_trials_remaining: pack.ai_trials,
        co_tests_remaining: pack.co_tests,
        ce_tests_remaining: pack.ce_tests,
        simulations_remaining: pack.simulations,
        status: 'active',
        stripe_payment_intent_id: payment_method === 'stripe' ? payment_ref : null,
        fedapay_transaction_id: payment_method !== 'stripe' ? payment_ref : null,
      })
      .select()
      .single()

    if (subError) throw subError

    await supabase.from('users').update({
      active_pack_id: pack_id,
      pack_expires_at: expires_at.toISOString(),
      subscription_tier: pack_id,
    }).eq('id', user.id)

    return new Response(JSON.stringify({
      success: true,
      subscription_id: subscription.id,
      pack_name: pack.name,
      expires_at: expires_at.toISOString(),
      features: {
        ai_trials: pack.ai_trials,
        co_tests: pack.co_tests === -1 ? 'illimité' : pack.co_tests,
        ce_tests: pack.ce_tests === -1 ? 'illimité' : pack.ce_tests,
        simulations: pack.simulations === -1 ? 'illimité' : pack.simulations,
      },
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (_error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
