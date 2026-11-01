// ── Utilitaires LTI 1.1 / OAuth 1.0 (HMAC-SHA1) ───────────────────────

// Encodage RFC 3986 exigé par OAuth 1.0 (encodeURIComponent laisse !*'() intacts)
export function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!*'()]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

/** Signature OAuth 1.0 HMAC-SHA1 d'une requête (paramètres hors oauth_signature). */
export async function oauthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
): Promise<string> {
  const paramString = Object.keys(params)
    .filter(k => k !== 'oauth_signature')
    .map(k => [percentEncode(k), percentEncode(params[k])] as const)
    .sort(([ak, av], [bk, bv]) => (ak === bk ? (av < bv ? -1 : 1) : ak < bk ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')

  const parsed = new URL(url)
  const baseUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`
  const baseString = `${method.toUpperCase()}&${percentEncode(baseUrl)}&${percentEncode(paramString)}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`${percentEncode(consumerSecret)}&`),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  return toBase64(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(baseString)))
}

export async function sha1Base64(body: string): Promise<string> {
  return toBase64(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(body)))
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * URL de retour de notes acceptable : HTTPS, port standard, et pas d'hôte
 * local / réseau privé (anti-SSRF).
 */
export function isSafeOutcomeUrl(raw: string): boolean {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  if (url.port && url.port !== '443') return false
  if (url.username || url.password) return false

  const host = url.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    return false
  }
  // IP littérales : refusées (un LMS est joint par son nom de domaine)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[') || host.includes(':')) return false
  if (!host.includes('.')) return false
  return true
}
