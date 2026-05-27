import { useState, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CookieConsent {
  decided: boolean
  analytics: boolean
  marketing: boolean
  setConsent: (prefs: { analytics: boolean; marketing: boolean }) => void
  acceptAll: () => void
  rejectAll: () => void
}

export const useCookieStore = create<CookieConsent>()(
  persist(
    (set) => ({
      decided: false,
      analytics: false,
      marketing: false,
      setConsent: ({ analytics, marketing }) =>
        set({ decided: true, analytics, marketing }),
      acceptAll: () =>
        set({ decided: true, analytics: true, marketing: true }),
      rejectAll: () =>
        set({ decided: true, analytics: false, marketing: false }),
    }),
    { name: 'fa-cookie-consent' }
  )
)

export function CookieBanner() {
  const { decided, analytics, marketing, setConsent, acceptAll, rejectAll } =
    useCookieStore()
  const [showDetails, setShowDetails] = useState(false)
  const [localAnalytics, setLocalAnalytics] = useState(analytics)
  const [localMarketing, setLocalMarketing] = useState(marketing)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted || decided) return null

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 inset-x-0 z-[200] bg-white border-t border-gray-200 shadow-2xl"
    >
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Texte */}
          <div className="flex-1">
            <p className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              🍪 Gestion des cookies
            </p>
            <p className="text-sm text-gray-600">
              Nous utilisons des cookies pour améliorer votre expérience et analyser
              notre trafic.{' '}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[#1B3A6B] underline text-sm"
              >
                {showDetails ? 'Masquer les détails' : 'Personnaliser'}
              </button>
            </p>

            {showDetails && (
              <div className="mt-3 space-y-3">
                {/* Essentiels */}
                <label className="flex items-center gap-3 cursor-not-allowed">
                  <span className="relative inline-block w-10 h-5">
                    <span className="block w-10 h-5 rounded-full bg-[#1B3A6B]"></span>
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow"></span>
                  </span>
                  <span className="text-sm">
                    <strong>Essentiels</strong>{' '}
                    <span className="text-gray-400 text-xs">(toujours activés)</span>
                    <br />
                    <span className="text-gray-500 text-xs">Authentification, session, sécurité</span>
                  </span>
                </label>

                {/* Analytiques */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    role="switch"
                    aria-checked={localAnalytics}
                    onClick={() => setLocalAnalytics(!localAnalytics)}
                    className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${
                      localAnalytics ? 'bg-[#1B3A6B]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      localAnalytics ? 'right-0.5' : 'left-0.5'
                    }`}></span>
                  </button>
                  <span className="text-sm">
                    <strong>Analytiques</strong>
                    <br />
                    <span className="text-gray-500 text-xs">Mixpanel — mesure d'audience anonymisée</span>
                  </span>
                </label>

                {/* Marketing */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    role="switch"
                    aria-checked={localMarketing}
                    onClick={() => setLocalMarketing(!localMarketing)}
                    className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${
                      localMarketing ? 'bg-[#1B3A6B]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      localMarketing ? 'right-0.5' : 'left-0.5'
                    }`}></span>
                  </button>
                  <span className="text-sm">
                    <strong>Marketing</strong>
                    <br />
                    <span className="text-gray-500 text-xs">Publicités personnalisées (Meta, Google Ads)</span>
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex flex-wrap gap-2 md:flex-col md:min-w-[180px]">
            <button
              onClick={acceptAll}
              className="flex-1 md:flex-none py-2 px-4 bg-[#1B3A6B] text-white text-sm font-bold rounded-lg hover:bg-[#152e56] transition-colors"
            >
              Tout accepter
            </button>
            {showDetails ? (
              <button
                onClick={() => setConsent({ analytics: localAnalytics, marketing: localMarketing })}
                className="flex-1 md:flex-none py-2 px-4 border border-[#1B3A6B] text-[#1B3A6B] text-sm font-bold rounded-lg hover:bg-[#1B3A6B]/5 transition-colors"
              >
                Enregistrer mes choix
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 md:flex-none py-2 px-4 border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Personnaliser
              </button>
            )}
            <button
              onClick={rejectAll}
              className="flex-1 md:flex-none py-2 px-4 text-gray-500 text-sm hover:underline"
            >
              Tout refuser
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Consultez notre{' '}
          <a href="/confidentialite" className="underline">
            politique de confidentialité
          </a>{' '}
          et notre{' '}
          <a href="/cookies" className="underline">
            politique de cookies
          </a>
          . Conformément au RGPD et à la directive ePrivacy.
        </p>
      </div>
    </div>
  )
}
