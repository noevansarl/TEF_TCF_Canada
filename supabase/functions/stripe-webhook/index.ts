import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const PLAN_MAP: Record<string, string> = {
  'price_essentiel_monthly': 'essentiel',
  'price_essentiel_yearly':  'essentiel',
  'price_avance_monthly':    'avance',
  'price_avance_yearly':     'avance',
  'price_premium_monthly':   'premium',
  'price_premium_yearly':    'premium',
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
        const plan = PLAN_MAP[priceId ?? ''] ?? 'essentiel'

        if (!userId) {
          console.error('Missing user_id in checkout session metadata')
          break
        }

        if (session.mode === 'subscription' && session.subscription) {
          const subId = session.subscription as string

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
