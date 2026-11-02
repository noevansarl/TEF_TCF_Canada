import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0'
import Stripe from 'https://esm.sh/stripe@14.25.0'
import { isAfricaDiscountCountry } from '../_shared/africa.ts'

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

// Identifiants de prix Stripe — aucun fallback : un prix manquant doit échouer explicitement
const PRICES: Record<string, Record<string, string | undefined>> = {
  essentiel: {
    monthly: Deno.env.get('STRIPE_PRICE_ESSENTIEL_MONTHLY'),
    yearly: Deno.env.get('STRIPE_PRICE_ESSENTIEL_YEARLY'),
  },
  avance: {
    monthly: Deno.env.get('STRIPE_PRICE_AVANCE_MONTHLY'),
    yearly: Deno.env.get('STRIPE_PRICE_AVANCE_YEARLY'),
  },
  premium: {
    monthly: Deno.env.get('STRIPE_PRICE_PREMIUM_MONTHLY'),
    yearly: Deno.env.get('STRIPE_PRICE_PREMIUM_YEARLY'),
  },
}

const PACK_PRICES: Record<string, string | undefined> = {
  bronze: Deno.env.get('STRIPE_PRICE_PACK_BRONZE'),
  silver: Deno.env.get('STRIPE_PRICE_PACK_SILVER'),
  gold: Deno.env.get('STRIPE_PRICE_PACK_GOLD'),
  platinum: Deno.env.get('STRIPE_PRICE_PACK_PLATINUM'),
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
    const { plan, period, pack, user_id, return_url } = body

    if (user_id !== authUser.id) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }
    // Validation de l'URL de retour (anti open-redirect) : l'origine doit être
    // exactement autorisée (startsWith acceptait https://ayeprep.com.evil.com)
    let returnOrigin: string
    try {
      returnOrigin = new URL(String(return_url)).origin
    } catch {
      return new Response('Invalid return URL', { status: 400, headers: corsHeaders })
    }
    if (!ALLOWED_ORIGINS.includes(returnOrigin)) {
      return new Response('Invalid return URL', { status: 400, headers: corsHeaders })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })

    // ── CASE 1: PACK CHECKOUT (SINGLE PAYMENT) ─────────────────────
    if (pack) {
      if (!Object.keys(PACK_PRICES).includes(pack)) {
        return new Response('Invalid pack ID', { status: 400, headers: corsHeaders })
      }

      const priceId = PACK_PRICES[pack]
      if (!priceId) {
        console.error(`STRIPE_PRICE_PACK_${pack.toUpperCase()} non configuré`)
        return new Response(JSON.stringify({ error: 'Configuration serveur manquante' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { user_id, pack_id: pack, price_id: priceId },
        success_url: `${returnOrigin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnOrigin}/subscribe`,
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
      if (!priceId) {
        console.error(`Prix Stripe non configuré pour ${plan}/${period}`)
        return new Response(JSON.stringify({ error: 'Configuration serveur manquante' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      // Pays lu dans le profil (plus depuis la requête) pour le tarif Afrique
      const { data: profile } = await supabase
        .from('users')
        .select('country')
        .eq('id', authUser.id)
        .maybeSingle()
      // Le pays du profil n'est qu'une déclaration : la réduction est confirmée
      // (ou retirée avant le premier prélèvement) par stripe-webhook d'après le
      // pays de facturation de la carte.
      const discounts: { coupon: string }[] = []
      if (isAfricaDiscountCountry(profile?.country)) {
        const africaCoupon = Deno.env.get('STRIPE_COUPON_AFRICA40')
        if (africaCoupon) discounts.push({ coupon: africaCoupon })
      }
      const africaDiscount = discounts.length > 0 ? 'true' : 'false'

      // Essai gratuit : uniquement pour un premier abonnement
      const { count: previousSubscriptions } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser.id)
      const trialDays = (previousSubscriptions ?? 0) === 0 ? 7 : undefined

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        // Stripe refuse discounts + allow_promotion_codes dans la même session
        ...(discounts.length > 0 ? { discounts } : { allow_promotion_codes: true }),
        subscription_data: {
          ...(trialDays ? { trial_period_days: trialDays } : {}),
          metadata: { user_id, plan, period, africa_discount: africaDiscount }
        },
        metadata: { user_id, plan, period, price_id: priceId, africa_discount: africaDiscount },
        success_url: `${returnOrigin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnOrigin}/subscribe`,
        // Adresse de facturation exigée pour vérifier l'éligibilité au tarif Afrique
        billing_address_collection: discounts.length > 0 ? 'required' : 'auto',
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
