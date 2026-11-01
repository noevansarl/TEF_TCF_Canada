import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0'
import { PACKS, grantPack } from './packs.ts'

// ── Configuration FedaPay ─────────────────────────────────────────────
// Documentation: https://docs.fedapay.com
// L'environnement est déduit de la clé : sk_sandbox_… → sandbox, sk_live_… → production.

export function fedapayKey(): string {
  const key = Deno.env.get('FEDAPAY_SECRET_KEY')
  if (!key) throw new Error('FEDAPAY_SECRET_KEY non configuré')
  return key
}

function fedapayBaseUrl(key: string): string {
  return key.startsWith('sk_sandbox')
    ? 'https://sandbox-api.fedapay.com/v1'
    : 'https://api.fedapay.com/v1'
}

export async function fedapayRequest(path: string, method: 'GET' | 'POST' | 'PUT', body?: unknown) {
  const key = fedapayKey()
  const res = await fetch(`${fedapayBaseUrl(key)}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`FedaPay ${method} ${path} → ${res.status}: ${text}`)
  }
  return text ? JSON.parse(text) : {}
}

// Les réponses FedaPay sont enveloppées : { "v1/transaction": { ... } }
// deno-lint-ignore no-explicit-any
export function unwrapTransaction(data: any): any {
  return data?.['v1/transaction'] ?? data?.transaction ?? data
}

// ── Modes de paiement ─────────────────────────────────────────────────
// Modes "sans redirection" : push USSD envoyé directement sur le téléphone.
export const DIRECT_MODES = new Set([
  'mtn_open',     // MTN Bénin
  'moov',         // Moov Bénin
  'sbin',         // Celtiis Bénin
  'mtn_ci',       // MTN Côte d'Ivoire
  'moov_tg',      // Moov Togo
  'togocel',      // T-Money Togo
  'free_sn',      // Free Sénégal
  'airtel_ne',    // Airtel Niger
  'mtn_open_gn',  // MTN Guinée
])

// Opérateurs non disponibles en mode direct (Orange, Wave…) : le client
// finalise sur la page de paiement sécurisée FedaPay.
export const CHECKOUT_METHODS = new Set([
  'orange_ci', 'wave_ci', 'moov_ci',
  'orange_sn', 'wave_sn',
  'orange_ml', 'moov_ml',
  'mtn_cm', 'orange_cm',
  'checkout',
])

// ── Vérification de signature webhook ─────────────────────────────────
// En-tête X-FEDAPAY-SIGNATURE : "t=<timestamp>,s=<hmac_sha256_hex>"
// Signature = HMAC-SHA256(secret, "<timestamp>.<payload brut>") en hexadécimal.
// Un timestamp de plus de 5 minutes est refusé (anti-rejeu, comme Stripe).
const SIGNATURE_TOLERANCE_S = 300

export async function verifyFedapaySignature(
  rawBody: string,
  header: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  let timestamp: string | null = null
  const signatures: string[] = []
  for (const item of header.split(',')) {
    const idx = item.indexOf('=')
    if (idx === -1) continue
    const k = item.slice(0, idx).trim()
    const v = item.slice(idx + 1).trim()
    if (k === 't') timestamp = v
    if (k === 's') signatures.push(v.toLowerCase())
  }
  if (!timestamp || signatures.length === 0) return false
  if (!/^\d+$/.test(timestamp) || Math.abs(nowSeconds - Number(timestamp)) > SIGNATURE_TOLERANCE_S) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`))
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')

  return signatures.some(sig => timingSafeEqual(sig, expected))
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// ── Synchronisation d'une transaction ─────────────────────────────────
export type SyncResult = {
  status: 'approved' | 'declined' | 'canceled' | 'pending' | 'unknown'
  pack_id?: string
  user_id?: string
}

const PAID_STATUSES = new Set(['approved', 'transferred'])

/**
 * Relit la transaction directement chez FedaPay (source de vérité) puis
 * met à jour payment_attempts et active le pack si le paiement est confirmé.
 * Ne fait jamais confiance au contenu d'un webhook ni à une saisie client.
 */
export async function syncFedapayTransaction(supabase: SupabaseClient, transactionId: string): Promise<SyncResult> {
  const tx = unwrapTransaction(await fedapayRequest(`/transactions/${encodeURIComponent(transactionId)}`, 'GET'))
  const fedaStatus: string = tx?.status ?? 'unknown'

  // Notre propre enregistrement fait foi pour user_id / pack_id
  const { data: attempt, error: attemptError } = await supabase
    .from('payment_attempts')
    .select('user_id, pack_id, amount_xof, status')
    .eq('fedapay_transaction_id', transactionId)
    .maybeSingle()
  if (attemptError) throw attemptError

  const userId: string | undefined = attempt?.user_id ?? tx?.custom_metadata?.user_id
  const packId: string | undefined = attempt?.pack_id ?? tx?.custom_metadata?.pack_id

  if (!userId || !packId) {
    console.error('Transaction FedaPay sans utilisateur/pack associé:', transactionId)
    return { status: 'unknown' }
  }

  if (PAID_STATUSES.has(fedaStatus)) {
    const pack = PACKS[packId]
    if (!pack) {
      console.error('Pack inconnu:', packId)
      return { status: 'unknown' }
    }
    // Anti-fraude : le montant encaissé doit correspondre exactement au prix du pack
    if (Number(tx.amount) !== pack.price_xof) {
      console.error(`Montant suspect pour ${transactionId}: ${tx.amount} vs ${pack.price_xof}`)
      return { status: 'unknown', pack_id: packId, user_id: userId }
    }

    const result = await grantPack(supabase, {
      userId,
      packId,
      paymentMethod:        tx.mode ?? 'mobile_money',
      currency:             'XOF',
      amountPaid:           pack.price_xof,
      fedapayTransactionId: transactionId,
    })
    if (result === 'created') console.log(`✅ Pack ${pack.name} activé via FedaPay pour ${userId}`)

    if (attempt && attempt.status !== 'completed') {
      const { error } = await supabase.from('payment_attempts')
        .update({ status: 'completed' })
        .eq('fedapay_transaction_id', transactionId)
      if (error) throw error
    }
    return { status: 'approved', pack_id: packId, user_id: userId }
  }

  if (fedaStatus === 'declined' || fedaStatus === 'canceled') {
    if (attempt && attempt.status === 'pending') {
      const { error } = await supabase.from('payment_attempts')
        .update({ status: fedaStatus })
        .eq('fedapay_transaction_id', transactionId)
      if (error) throw error
    }
    return { status: fedaStatus, pack_id: packId, user_id: userId }
  }

  return { status: 'pending', pack_id: packId, user_id: userId }
}
