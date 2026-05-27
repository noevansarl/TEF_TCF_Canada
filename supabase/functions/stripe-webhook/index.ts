import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const PLAN_MAP: Record<string, string> = {
  'price_essentiel_monthly': 'essentiel',
  'price_essentiel_yearly': 'essentiel',
  'price_avance_monthly': 'avance',
  'price_avance_yearly': 'avance',
  'price_premium_monthly': 'premium',
  'price_premium_yearly': 'premium',
}

serve(async (req: Request) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    // If webhook secret isn't configured, fall back to parsing body for local/testing
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set. Parsing event body without verification.')
      event = JSON.parse(body)
    } else {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const priceId = session.metadata?.price_id
      const plan = PLAN_MAP[priceId || ''] || 'essentiel'

      if (session.mode === 'subscription' && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
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
          amount_paid: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || 'EUR',
          platform: 'web',
        }, { onConflict: 'stripe_sub_id' })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      await supabase.from('users').update({
        subscription_tier: 'gratuit'
      }).eq('stripe_customer_id', customerId)
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

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
