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
  essentiel: { monthly: 'price_essentiel_monthly', yearly: 'price_essentiel_yearly' },
  avance:    { monthly: 'price_avance_monthly',    yearly: 'price_avance_yearly' },
  premium:   { monthly: 'price_premium_monthly',   yearly: 'price_premium_yearly' },
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
    const { plan, period, user_id, country, return_url } = body

    // Validation stricte des inputs
    if (!VALID_PLANS.includes(plan) || !VALID_PERIODS.includes(period)) {
      return new Response('Invalid plan or period', { status: 400, headers: corsHeaders })
    }
    if (user_id !== authUser.id) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }
    // Validation de l'URL de retour (anti open-redirect)
    const isAllowedReturn = ALLOWED_ORIGINS.some(o => (return_url ?? '').startsWith(o))
    if (!isAllowedReturn) {
      return new Response('Invalid return URL', { status: 400, headers: corsHeaders })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })

    const discounts: { coupon: string }[] = []
    const africaCountries = ['BJ','BF','CM','CI','SN','ML','TG','GN','NE','TD','GA','CG']
    if (africaCountries.includes(country)) {
      const africaCoupon = Deno.env.get('STRIPE_COUPON_AFRICA40')
      if (africaCoupon) discounts.push({ coupon: africaCoupon })
    }

    const priceId = PRICES[plan][period]
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
  } catch (_error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
