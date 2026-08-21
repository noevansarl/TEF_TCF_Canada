import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const ALLOWED_ORIGINS = ['https://ayeprep.com', 'https://www.ayeprep.com', 'http://localhost:5173']
const VALID_PLANS = ['essentiel', 'avance', 'premium']
const VALID_PERIODS = ['monthly', 'yearly']

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

const PRICES: Record<string, Record<string, string>> = {
  essentiel: {
    monthly: Deno.env.get('STRIPE_PRICE_ESSENTIEL_MONTHLY') || 'price_essentiel_monthly',
    yearly: Deno.env.get('STRIPE_PRICE_ESSENTIEL_YEARLY') || 'price_essentiel_yearly',
  },
  avance: {
    monthly: Deno.env.get('STRIPE_PRICE_AVANCE_MONTHLY') || 'price_avance_monthly',
    yearly: Deno.env.get('STRIPE_PRICE_AVANCE_YEARLY') || 'price_avance_yearly',
  },
  premium: {
    monthly: Deno.env.get('STRIPE_PRICE_PREMIUM_MONTHLY') || 'price_premium_monthly',
    yearly: Deno.env.get('STRIPE_PRICE_PREMIUM_YEARLY') || 'price_premium_yearly',
  },
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    const { data: { user: authUser } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!authUser) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const body = await req.json()
    const { plan, period, pack, user_id, country, return_url } = body

    if (user_id !== authUser.id) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }
    // Validation de l'URL de retour (anti open-redirect)
    const isAllowedReturn = ALLOWED_ORIGINS.some(o => (return_url ?? '').startsWith(o))
    if (!isAllowedReturn) {
      return new Response('Invalid return URL', { status: 400, headers: corsHeaders })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })

    // ── CASE 1: PACK CHECKOUT (SINGLE PAYMENT) ─────────────────────
    if (pack) {
      const PACK_PRICES: Record<string, string> = {
        bronze: Deno.env.get('STRIPE_PRICE_PACK_BRONZE') || 'price_pack_bronze',
        silver: Deno.env.get('STRIPE_PRICE_PACK_SILVER') || 'price_pack_silver',
        gold: Deno.env.get('STRIPE_PRICE_PACK_GOLD') || 'price_pack_gold',
        platinum: Deno.env.get('STRIPE_PRICE_PACK_PLATINUM') || 'price_pack_platinum',
      }

      if (!Object.keys(PACK_PRICES).includes(pack)) {
        return new Response('Invalid pack ID', { status: 400, headers: corsHeaders })
      }

      const priceId = PACK_PRICES[pack]

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { user_id, pack_id: pack, price_id: priceId },
        success_url: `${return_url}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${return_url}/subscribe`,
        locale: 'fr',
        customer_email: authUser.email,
      })

      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } 
    // ── CASE 2: SUBSCRIPTION CHECKOUT ──────────────────────────────
    else {
      if (!VALID_PLANS.includes(plan) || !VALID_PERIODS.includes(period)) {
        return new Response('Invalid plan or period', { status: 400, headers: corsHeaders })
      }

      const priceId = PRICES[plan][period]
      const discounts: { coupon: string }[] = []
      const africaCountries = ['BJ','BF','CM','CI','SN','ML','TG','GN','NE','TD','GA','CG']
      if (africaCountries.includes(country)) {
        const africaCoupon = Deno.env.get('STRIPE_COUPON_AFRICA40')
        if (africaCoupon) discounts.push({ coupon: africaCoupon })
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        discounts,
        subscription_data: {
          trial_period_days: 7,
          metadata: { user_id, plan, period }
        },
        metadata: { user_id, plan, price_id: priceId },
        success_url: `${return_url}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${return_url}/subscribe`,
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        locale: 'fr',
        customer_email: authUser.email,
      })

      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (err: unknown) {
    console.error('create-checkout error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message || 'Internal server error' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
