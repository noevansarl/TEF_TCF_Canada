import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'
import { PACKS, grantPack } from '../_shared/packs.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// price_id → plan
const getPlanMap = () => {
  const entries: [string | undefined, string][] = [
    [Deno.env.get('STRIPE_PRICE_ESSENTIEL_MONTHLY'), 'essentiel'],
    [Deno.env.get('STRIPE_PRICE_ESSENTIEL_YEARLY'), 'essentiel'],
    [Deno.env.get('STRIPE_PRICE_AVANCE_MONTHLY'), 'avance'],
    [Deno.env.get('STRIPE_PRICE_AVANCE_YEARLY'), 'avance'],
    [Deno.env.get('STRIPE_PRICE_PREMIUM_MONTHLY'), 'premium'],
    [Deno.env.get('STRIPE_PRICE_PREMIUM_YEARLY'), 'premium'],
  ]
  const map: Record<string, string> = {}
  for (const [priceId, plan] of entries) if (priceId) map[priceId] = plan
  return map
}

const SUBSCRIPTION_PLANS = ['essentiel', 'avance', 'premium']

// Statut Stripe → statut table subscriptions
const STATUS_MAP: Record<string, string> = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',   // Stripe relance encore le paiement : accès conservé
  paused: 'paused',
  canceled: 'cancelled',
  unpaid: 'cancelled',
  incomplete_expired: 'cancelled',
}
const ENTITLED = new Set(['active', 'trialing', 'past_due'])

/**
 * Synchronise un abonnement Stripe (création, renouvellement, changement, résiliation)
 * vers les tables subscriptions et users. Idempotent.
 */
async function syncSubscription(supabase: SupabaseClient, sub: Stripe.Subscription, fallbackUserId?: string) {
  const status = STATUS_MAP[sub.status]
  if (!status) {
    // 'incomplete' : premier paiement pas encore effectué → rien à accorder
    console.log(`Abonnement ${sub.id} au statut ${sub.status} — ignoré`)
    return
  }

  let userId = sub.metadata?.user_id || fallbackUserId
  if (!userId) {
    const { data, error } = await supabase.from('users').select('id')
      .eq('stripe_customer_id', sub.customer as string).maybeSingle()
    if (error) throw error
    userId = data?.id
  }
  if (!userId) {
    console.error(`Utilisateur introuvable pour l'abonnement ${sub.id}`)
    return
  }

  const item = sub.items.data[0]
  const price = item?.price
  const plan = getPlanMap()[price?.id ?? '']
  if (!plan) {
    console.error(`Prix inconnu ${price?.id} pour l'abonnement ${sub.id}`)
    return
  }

  const expiresAt = new Date(sub.current_period_end * 1000).toISOString()

  const { error: subError } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    plan,
    billing_period: price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
    stripe_sub_id: sub.id,
    stripe_price_id: price.id,
    platform: 'web',
    status,
    trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    expires_at: expiresAt,
    cancel_at_period_end: sub.cancel_at_period_end,
    cancelled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
    amount_paid: (price.unit_amount ?? 0) / 100,
    currency: (price.currency ?? 'eur').toUpperCase(),
  }, { onConflict: 'stripe_sub_id' })
  if (subError) throw subError

  if (ENTITLED.has(status)) {
    const { error } = await supabase.from('users').update({
      subscription_tier: plan,
      subscription_expires_at: expiresAt,
      stripe_customer_id: sub.customer as string,
    }).eq('id', userId)
    if (error) throw error
  } else {
    // Ne rétrograde que si l'utilisateur est toujours sur un abonnement (pas un pack actif)
    const { error } = await supabase.from('users').update({
      subscription_tier: 'gratuit',
      subscription_expires_at: null,
    }).eq('id', userId).in('subscription_tier', SUBSCRIPTION_PLANS)
    if (error) throw error
  }
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
        const packId = session.metadata?.pack_id

        if (!userId) {
          console.error('Missing user_id in checkout session metadata')
          break
        }

        // ── Achat de pack (paiement unique) ──────────────────────────────
        if (session.mode === 'payment' && packId) {
          if (session.payment_status !== 'paid') {
            console.log(`Session ${session.id} non payée (${session.payment_status}) — ignorée`)
            break
          }
          if (!PACKS[packId]) {
            console.error('Pack inconnu:', packId)
            break
          }
          const result = await grantPack(supabase, {
            userId,
            packId,
            paymentMethod: 'stripe',
            currency: (session.currency ?? '').toUpperCase(),
            amountPaid: (session.amount_total ?? 0) / 100,
            stripePaymentIntentId: session.payment_intent as string,
          })
          if (result === 'created') console.log(`✅ Pack ${packId} activé via Stripe pour user ${userId}`)
        }
        // ── Abonnement ───────────────────────────────────────────────────
        else if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await syncSubscription(supabase, sub, userId)
        }
        break
      }

      // Renouvellement payé → prolonge subscription_expires_at
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          await syncSubscription(supabase, sub)
        }
        break
      }

      // Échec de paiement : Stripe va relancer. On passe en past_due sans couper l'accès ;
      // la coupure intervient via customer.subscription.updated/deleted si les relances échouent.
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const { error } = await supabase.from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_sub_id', invoice.subscription as string)
          if (error) throw error
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscription(supabase, event.data.object as Stripe.Subscription)
        break
      }
    }
  } catch (err) {
    // 500 → Stripe réessaiera automatiquement (traitement idempotent)
    console.error(`Error processing webhook event ${event.type}:`, err)
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
