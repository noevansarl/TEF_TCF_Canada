import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICES: Record<string, Record<string, string>> = {
  essentiel:  { monthly: 'price_essentiel_monthly', yearly: 'price_essentiel_yearly' },
  avance:     { monthly: 'price_avance_monthly',    yearly: 'price_avance_yearly' },
  premium:    { monthly: 'price_premium_monthly',   yearly: 'price_premium_yearly' },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    const { data: { user: authUser } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '')
    if (!authUser) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const { plan, period, user_id, country, return_url } = await req.json()
    
    if (user_id !== authUser.id) {
      return new Response('Unauthorized user ID mismatch', { status: 403, headers: corsHeaders })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-04-10',
    })

    // Déterminer la réduction géographique
    const discounts = []
    const africaCountries = ['BJ','BF','CM','CI','SN','ML','TG','GN','NE','TD','GA','CG']
    if (africaCountries.includes(country)) {
      const africaCoupon = Deno.env.get('STRIPE_COUPON_AFRICA40')
      if (africaCoupon) {
        discounts.push({ coupon: africaCoupon })
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: PRICES[plan]?.[period] || plan, // Fallback if direct price id passed
        quantity: 1,
      }],
      discounts,
      subscription_data: {
        trial_period_days: 7,     // Essai gratuit 7 jours
        metadata: { user_id, plan, period }
      },
      metadata: { user_id, plan, price_id: PRICES[plan]?.[period] || plan },
      success_url: `${return_url}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${return_url}/subscribe`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      locale: 'fr',
      customer_email: authUser.email,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
