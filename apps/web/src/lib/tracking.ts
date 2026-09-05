import { useCookieStore } from '../components/CookieBanner'

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
  }
}

export type MarketingEventType =
  | 'nclc_calculator_used'
  | 'crs_simulator_used'
  | 'quick_test_completed'
  | 'lead_magnet_downloaded'
  | 'social_share_clicked'
  | 'whatsapp_contact_initiated'
  | 'pricing_plan_selected'
  | 'affiliate_link_clicked'

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Initialise ou charge conditionnellement les pixels marketing (Google Analytics / Meta Pixel)
 * en stricte conformité avec le consentement RGPD / ePrivacy / LPRPDE.
 */
export function syncMarketingPixels(): void {
  const { marketing, analytics } = useCookieStore.getState()

  // Google Analytics / Ads (si consentement analytics ou marketing accordé)
  if (analytics || marketing) {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID
    if (gaId && !document.getElementById('ga-script')) {
      const script = document.createElement('script')
      script.id = 'ga-script'
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      window.gtag = function () {
        window.dataLayer?.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', gaId, { anonymize_ip: true })
    }
  }

  // Meta Pixel (uniquement si consentement marketing explicite)
  if (marketing) {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID
    if (pixelId && !document.getElementById('meta-pixel-script')) {
      const script = document.createElement('script')
      script.id = 'meta-pixel-script'
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `
      document.head.appendChild(script)
    }
  }
}

/**
 * Déclenche un événement de tracking marketing et conversion.
 * Respecte les préférences de l'utilisateur et assure la conformité légale.
 */
export function trackMarketingEvent(
  eventName: MarketingEventType,
  properties: EventProperties = {}
): void {
  const { analytics, marketing } = useCookieStore.getState()

  // Si aucun consentement n'a été accordé, on n'envoie aucune télémétrie externe
  if (!analytics && !marketing) {
    if (import.meta.env.DEV) {
      console.info(`[ayePREP Marketing Event (Opt-out)] ${eventName}:`, properties)
    }
    return
  }

  if (import.meta.env.DEV) {
    console.info(`[ayePREP Marketing Event] ${eventName}:`, properties)
  }

  // Envoi Google Analytics (gtag) si disponible
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, properties)
  }

  // Envoi Meta Pixel (fbq) pour les conversions payantes et leads si marketing accepté
  if (marketing && typeof window.fbq === 'function') {
    if (eventName === 'lead_magnet_downloaded') {
      window.fbq('track', 'Lead', properties)
    } else if (eventName === 'pricing_plan_selected') {
      window.fbq('track', 'InitiateCheckout', properties)
    } else {
      window.fbq('trackCustom', eventName, properties)
    }
  }
}
