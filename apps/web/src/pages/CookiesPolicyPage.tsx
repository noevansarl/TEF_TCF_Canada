import { Link } from 'react-router-dom'
import { useCookieStore } from '../components/CookieBanner'

export default function CookiesPolicyPage() {
  const { analytics, marketing, setConsent, acceptAll, rejectAll } = useCookieStore()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 select-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#1B3A6B] font-extrabold text-sm uppercase tracking-wide">
            <svg viewBox="0 0 40 40" className="w-8 h-8">
              <path d="M20 2 L23 12 L33 8 L26 17 L36 22 L26 27 L33 36 L23 32 L20 42 L17 32 L7 36 L14 27 L4 22 L14 17 L7 8 L17 12 Z" fill="#1B3A6B"/>
            </svg>
            Francophonie Academia
          </Link>
          <Link to="/" className="text-sm font-semibold text-[#1B3A6B] hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10 shadow-sm space-y-6 text-gray-800 text-sm md:text-base leading-relaxed">
          
          <div className="border-b border-gray-100 pb-4 select-none">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1B3A6B]">
              Politique des Cookies
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Dernière mise à jour : 27 Mai 2026 · Conforme Directive ePrivacy & RGPD
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">1. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie (ou témoin de connexion) est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou smartphone) par le serveur du site web que vous visitez. Il permet au site de mémoriser des informations relatives à votre navigation afin d'améliorer votre expérience utilisateur, d'assurer la sécurité du site ou d'analyser l'audience de nos pages.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">2. Quels cookies utilisons-nous et pourquoi ?</h2>
            <p>Nous classons les cookies déposés sur notre site en trois catégories distinctes :</p>

            {/* Cookies Essentiels */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-[#1B3A6B] text-sm md:text-base">A. Cookies Essentiels (Strictement Nécessaires)</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold uppercase px-2.5 py-0.5 rounded-full">Requis</span>
              </div>
              <p className="text-xs md:text-sm text-gray-600">
                Ces cookies sont indispensables au fonctionnement de base de la plateforme. Ils vous permettent de naviguer sur le site, de rester connecté à votre compte utilisateur de manière sécurisée et de sauvegarder vos choix quant au dépôt des autres cookies. Ils ne peuvent pas être désactivés.
              </p>
              <p className="text-[10px] text-gray-400">Exemples : Jeton de session Supabase (sb-access-token, sb-refresh-token), Cookie Consent Store (fa-cookie-consent).</p>
            </div>

            {/* Cookies Analytiques */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-[#1B3A6B] text-sm md:text-base">B. Cookies Analytiques (Mesure d'audience)</h3>
                <button
                  onClick={() => setConsent({ analytics: !analytics, marketing })}
                  className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full transition-all ${
                    analytics ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {analytics ? 'Activé ✓' : 'Désactivé'}
                </button>
              </div>
              <p className="text-xs md:text-sm text-gray-600">
                Ces cookies collectent des données d'utilisation agrégées et anonymisées (pages les plus consultées, taux de réussite moyen par épreuve, temps d'entraînement, parcours suivi). Ils nous permettent de comprendre le comportement des candidats et d'ajuster nos outils pédagogiques pour améliorer l'expérience générale.
              </p>
              <p className="text-[10px] text-gray-400">Exemples : Tracking Mixpanel anonyme, statistiques d'erreurs d'épreuves.</p>
            </div>

            {/* Cookies Marketing */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-[#1B3A6B] text-sm md:text-base">C. Cookies de Publicité (Marketing)</h3>
                <button
                  onClick={() => setConsent({ analytics, marketing: !marketing })}
                  className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full transition-all ${
                    marketing ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {marketing ? 'Activé ✓' : 'Désactivé'}
                </button>
              </div>
              <p className="text-xs md:text-sm text-gray-600">
                Ces cookies servent à suivre l'efficacité de nos campagnes publicitaires et de notre programme d'affiliation d'influenceurs. Ils permettent d'éviter la diffusion répétée de la même publicité et d'attribuer correctement les commissions du programme de parrainage.
              </p>
              <p className="text-[10px] text-gray-400">Exemples : Meta Pixel tracking d'inscriptions, cookies d'affiliation (attribution 30 jours).</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">3. Comment gérer mes préférences ?</h2>
            <p>
              Lors de votre première visite sur Francophonie Academia, une bannière de consentement vous invite à configurer vos préférences pour les cookies analytiques et marketing.
            </p>
            <p>
              Vous pouvez à tout moment modifier ou retirer votre consentement en utilisant les boutons d'activation ci-dessus, ou en cliquant sur les raccourcis globaux ci-dessous :
            </p>
            <div className="flex flex-wrap gap-2 pt-2 select-none">
              <button
                onClick={acceptAll}
                className="px-5 py-2.5 bg-[#1B3A6B] hover:bg-[#152e56] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Tout autoriser
              </button>
              <button
                onClick={rejectAll}
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                Tout refuser (sauf essentiels)
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">4. Durée de conservation des cookies</h2>
            <p>
              Les cookies analytiques et marketing ont une durée de vie maximale de 13 mois sur votre terminal. Les données associées sont conservées par nos soins sous forme anonyme pour une durée maximale de 24 mois. Les cookies de session essentiels sont automatiquement détruits à la fermeture de votre navigateur.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400 select-none">
        <p>© 2026 Francophonie Academia. Tous droits réservés.</p>
      </footer>
    </div>
  )
}
