import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Packs — source de vérité unique côté serveur (FedaPay + Stripe)
export interface PackDef {
  name: string
  price_xof: number
  duration_days: number
  ai_trials: number
  co_tests: number      // -1 = illimité
  ce_tests: number
  simulations: number
}

export const PACKS: Record<string, PackDef> = {
  bronze:   { name: 'Pack Découverte',  price_xof: 9800,  duration_days: 5,  ai_trials: 3,  co_tests: 40,  ce_tests: 40,  simulations: 1  },
  silver:   { name: 'Pack Préparation', price_xof: 19600, duration_days: 30, ai_trials: 8,  co_tests: 120, ce_tests: 120, simulations: 5  },
  gold:     { name: 'Pack Intensif',    price_xof: 32700, duration_days: 60, ai_trials: 15, co_tests: 300, ce_tests: 300, simulations: 12 },
  platinum: { name: 'Pack Champion',    price_xof: 52300, duration_days: 90, ai_trials: 30, co_tests: -1,  ce_tests: -1,  simulations: -1 },
}

interface GrantPackInput {
  userId: string
  packId: string
  paymentMethod: string
  currency: string
  amountPaid: number
  fedapayTransactionId?: string
  stripePaymentIntentId?: string
}

/**
 * Active un pack pour un utilisateur après un paiement CONFIRMÉ par le prestataire.
 * Idempotent : l'index unique sur l'identifiant de paiement (migration 020) empêche
 * un double crédit si le webhook est rejoué ou reçu en parallèle.
 * Lève une erreur en cas d'échec DB (l'appelant doit renvoyer 5xx pour provoquer un retry).
 */
export async function grantPack(supabase: SupabaseClient, input: GrantPackInput): Promise<'created' | 'duplicate'> {
  const pack = PACKS[input.packId]
  if (!pack) throw new Error(`Pack inconnu: ${input.packId}`)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + pack.duration_days)

  const { error: subError } = await supabase.from('user_pack_subscriptions').insert({
    user_id:                  input.userId,
    pack_id:                  input.packId,
    expires_at:               expiresAt.toISOString(),
    payment_method:           input.paymentMethod,
    payment_currency:         input.currency,
    amount_paid:              input.amountPaid,
    ai_trials_remaining:      pack.ai_trials,
    co_tests_remaining:       pack.co_tests,
    ce_tests_remaining:       pack.ce_tests,
    simulations_remaining:    pack.simulations,
    status:                   'active',
    fedapay_transaction_id:   input.fedapayTransactionId ?? null,
    stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
  })

  if (subError) {
    if (subError.code === '23505') return 'duplicate' // déjà traité
    throw subError
  }

  const { error: userError } = await supabase.from('users').update({
    active_pack_id:    input.packId,
    pack_expires_at:   expiresAt.toISOString(),
    subscription_tier: input.packId,
  }).eq('id', input.userId)

  if (userError) throw userError

  return 'created'
}
