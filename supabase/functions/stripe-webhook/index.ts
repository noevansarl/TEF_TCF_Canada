import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const getPlanMap = () => {
  const map: Record<string, string> = {}
  
  const em = Deno.env.get('STRIPE_PRICE_ESSENTIEL_MONTHLY') || 'price_essentiel_monthly'
  const ey = Deno.env.get('STRIPE_PRICE_ESSENTIEL_YEARLY') || 'price_essentiel_yearly'
  const am = Deno.env.get('STRIPE_PRICE_AVANCE_MONTHLY') || 'price_avance_monthly'
  const ay = Deno.env.get('STRIPE_PRICE_AVANCE_YEARLY') || 'price_avance_yearly'
  const pm = Deno.env.get('STRIPE_PRICE_PREMIUM_MONTHLY') || 'price_premium_monthly'
  const py = Deno.env.get('STRIPE_PRICE_PREMIUM_YEARLY') || 'price_premium_yearly'

  map[em] = 'essentiel'
  map[ey] = 'essentiel'
  map[am] = 'avance'
  map[ay] = 'avance'
  map[pm] = 'premium'
  map[py] = 'premium'
  
  return map
}

serve(async (req: Request) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  // Signature obligatoire — pas de fallback non sécurisé
  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return new Response('Webhook not configured', { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return new Response(`Webhook Error: ${message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const priceId = session.metadata?.price_id
        const packId = session.metadata?.pack_id

        if (!userId) {
          console.error('Missing user_id in checkout session metadata')
          break
        }

        // ── Case 1: Pack Purchase (CAD Payment via Stripe) ─────────────────
        if (session.mode === 'payment' && packId) {
          const PACKS: Record<string, { duration_days: number; ai_trials: number; co_tests: number; ce_tests: number; simulations: number }> = {
            bronze:   { duration_days: 5,  ai_trials: 3,  co_tests: 40,  ce_tests: 40,  simulations: 1  },
            silver:   { duration_days: 30, ai_trials: 8,  co_tests: 120, ce_tests: 120, simulations: 5  },
            gold:     { duration_days: 60, ai_trials: 15, co_tests: 300, ce_tests: 300, simulations: 12 },
            platinum: { duration_days: 90, ai_trials: 30, co_tests: -1,  ce_tests: -1,  simulations: -1 },
          }

          const pack = PACKS[packId]
          if (pack) {
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + pack.duration_days)

            // Idempotency: verify if already processed
            const { data: existingPack } = await supabase
              .from('user_pack_subscriptions')
              .select('id')
              .eq('stripe_payment_intent_id', session.payment_intent as string)
              .maybeSingle()

            if (!existingPack) {
              await supabase.from('user_pack_subscriptions').insert({
                user_id: userId,
                pack_id: packId,
                expires_at: expiresAt.toISOString(),
                payment_method: 'stripe',
                payment_currency: session.currency?.toUpperCase() ?? 'CAD',
                amount_paid: (session.amount_total ?? 0) / 100,
                ai_trials_remaining: pack.ai_trials,
                co_tests_remaining: pack.co_tests,
                ce_tests_remaining: pack.ce_tests,
                simulations_remaining: pack.simulations,
                status: 'active',
                stripe_payment_intent_id: session.payment_intent as string,
              })

              await supabase.from('users').update({
                active_pack_id: packId,
                pack_expires_at: expiresAt.toISOString(),
                subscription_tier: packId,
              }).eq('id', userId)

              console.log(`✅ Pack ${packId} activé via Stripe pour user ${userId}`)
            }
          }
        }
        // ── Case 2: Subscription Purchase ──────────────────────────────────
        else if (session.mode === 'subscription' && session.subscription) {
          const subId = session.subscription as string
          const planMap = getPlanMap()
          const plan = planMap[priceId ?? ''] ?? 'essentiel'

          // Idempotency check: see if subscription has already been created/activated
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_sub_id', subId)
            .maybeSingle()

          if (existingSub) {
            console.log(`Stripe subscription ${subId} already processed (idempotent ignore)`)
            break
          }

          const sub = await stripe.subscriptions.retrieve(subId)
          const expiresAt = new Date(sub.current_period_end * 1000).toISOString()

          await supabase.from('users').update({
            subscription_tier: plan,
            subscription_expires_at: expiresAt,
            stripe_customer_id: session.customer as string,
          }).eq('id', userId)

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan,
            stripe_sub_id: sub.id,
            stripe_price_id: priceId,
            status: 'active',
            expires_at: expiresAt,
            amount_paid: (session.amount_total ?? 0) / 100,
            currency: session.currency?.toUpperCase() ?? 'EUR',
            platform: 'web',
          }, { onConflict: 'stripe_sub_id' })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await supabase.from('users').update({
          subscription_tier: 'gratuit',
        }).eq('stripe_customer_id', invoice.customer as string)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabase.from('users').update({
          subscription_tier: 'gratuit',
          subscription_expires_at: null,
        }).eq('stripe_customer_id', sub.customer as string)

        await supabase.from('subscriptions').update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        }).eq('stripe_sub_id', sub.id)
        break
      }
    }
  } catch (_err) {
    console.error('Error processing webhook event:', event.type)
    // Retourner 200 quand même pour éviter que Stripe ne retente indéfiniment
    // (les erreurs de traitement sont loggées pour investigation)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
