import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0'

// ── Contrôle d'accès aux corrections IA (correct-ee, transcribe-eo) ────
// 1. Limitation de débit par utilisateur (protège la facture OpenAI)
// 2. Abonnement actif → accès sans décompte
// 3. Sinon : un crédit de pack est débité ATOMIQUEMENT avant l'appel OpenAI
//    (RPC consume_ai_credit) et remboursé si l'appel échoue.

const AI_CALLS_PER_HOUR = 20
const SUBSCRIPTION_TIERS = ['avance', 'premium', 'institutionnel']

export type AiAccess =
  | { ok: true; packSubscriptionId: string | null }
  | { ok: false; status: 402 | 429; message: string }

export async function authorizeAiCall(supabase: SupabaseClient, userId: string): Promise<AiAccess> {
  const { data: allowed, error: rlError } = await supabase.rpc('check_rate_limit', {
    p_key: `ai:${userId}`,
    p_limit: AI_CALLS_PER_HOUR,
    p_window_seconds: 3600,
  })
  if (rlError) throw rlError
  if (!allowed) return { ok: false, status: 429, message: 'Trop de corrections demandées, réessayez dans une heure.' }

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', userId)
    .single()

  const hasSubscription = SUBSCRIPTION_TIERS.includes(profile?.subscription_tier ?? '')
    && (!profile?.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date())
  if (hasSubscription) return { ok: true, packSubscriptionId: null }

  const { data: packSubscriptionId, error } = await supabase.rpc('consume_ai_credit', { p_user_id: userId })
  if (error) throw error
  if (!packSubscriptionId) return { ok: false, status: 402, message: 'Subscription required or AI quota exhausted' }

  return { ok: true, packSubscriptionId }
}

export async function refundAiCall(supabase: SupabaseClient, access: AiAccess) {
  if (access.ok && access.packSubscriptionId) {
    await supabase.rpc('refund_ai_credit', { p_pack_subscription_id: access.packSubscriptionId })
  }
}
