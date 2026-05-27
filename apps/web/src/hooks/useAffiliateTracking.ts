/**
 * Hook : détection et stockage du code affilié.
 *
 * Utilisation :
 *   - Appelé une seule fois dans App.tsx (ou LandingPage)
 *   - Lit ?ref=CODE dans l'URL et le persiste dans localStorage
 *   - Envoie un clic au backend (Edge Function track-affiliate)
 *   - Expose `affiliateCode` pour l'utiliser au moment de l'inscription
 *
 * Exemple URL : https://ayeprep.com/?ref=MAMADOU15
 */

import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const STORAGE_KEY    = 'fa_affiliate_code'
const CLICK_ID_KEY   = 'fa_affiliate_click_id'
const EXPIRY_KEY     = 'fa_affiliate_expiry'
const COOKIE_TTL_MS  = 30 * 24 * 60 * 60 * 1000  // 30 jours (standard tracking affilié)

/** Récupère le code affilié stocké (s'il n'est pas expiré). */
export function getStoredAffiliateCode(): string | null {
  try {
    const expiry = localStorage.getItem(EXPIRY_KEY)
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(CLICK_ID_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      return null
    }
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** Récupère l'ID du clic affilié (pour la conversion). */
export function getStoredAffiliateClickId(): string | null {
  try {
    return localStorage.getItem(CLICK_ID_KEY)
  } catch {
    return null
  }
}

/** Efface le code affilié après conversion. */
export function clearAffiliateData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CLICK_ID_KEY)
    localStorage.removeItem(EXPIRY_KEY)
  } catch { /* noop */ }
}

/**
 * Hook principal — à appeler dans App.tsx ou le composant racine.
 * Lit ?ref=CODE, le stocke, et envoie un clic au backend.
 */
export function useAffiliateTracking(): void {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const refCode = searchParams.get('ref') ?? searchParams.get('affiliate')
    if (!refCode) return

    // Normaliser le code (majuscules, caractères alphanumérique uniquement)
    const code = refCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20)
    if (!code) return

    // Ne pas écraser un code existant non expiré (first-click attribution)
    const existing = getStoredAffiliateCode()
    if (existing && existing !== code) return

    // Stocker le code avec TTL
    try {
      localStorage.setItem(STORAGE_KEY, code)
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + COOKIE_TTL_MS))
    } catch { /* noop */ }

    // Envoyer le clic au backend de façon asynchrone (fire and forget)
    sendAffiliateClick(code)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // On ne rerun pas si searchParams change — premier visit only
}

/** Envoie un clic affilié à la Edge Function Supabase. */
async function sendAffiliateClick(code: string): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) return

    const res = await fetch(`${supabaseUrl}/functions/v1/track-affiliate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        page_url:     window.location.href,
        referrer_url: document.referrer || null,
      }),
    })

    if (res.ok) {
      const data: { click_id?: string } = await res.json()
      if (data.click_id) {
        try {
          localStorage.setItem(CLICK_ID_KEY, data.click_id)
        } catch { /* noop */ }
      }
    }
  } catch {
    // Echec silencieux — le tracking n'est pas critique
  }
}
