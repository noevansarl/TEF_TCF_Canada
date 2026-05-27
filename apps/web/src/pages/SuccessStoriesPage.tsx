import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// ── Témoignages ────────────────────────────────────────────────────────
const STORIES = [
  {
    initials: 'AD',
    name: 'Amadou D.',
    country: '🇸🇳 Sénégal',
    exam: 'TCF Canada',
    score_before: 'B2',
    score_after: 'C1 — NCLC 9',
    duration: '45 jours',
    color: 'bg-blue-600',
    quote: 'La correction IA de mes essais a totalement transformé mon expression écrite. Je n\'aurais jamais atteint C1 sans les feedbacks détaillés sur chaque critère.',
    module_focus: 'EE',
    city: 'Dakar → Montréal',
  },
  {
    initials: 'FT',
    name: 'Fatou T.',
    country: '🇨🇮 Côte d\'Ivoire',
    exam: 'TEF Canada',
    score_before: 'B1',
    score_after: 'B2 — NCLC 7',
    duration: '60 jours',
    color: 'bg-emerald-600',
    quote: 'Les 39 questions chronométrées de CO m\'ont appris à gérer mon stress. L\'application est exactement comme le vrai examen — je savais à quoi m\'attendre.',
    module_focus: 'CO',
    city: 'Abidjan → Québec',
  },
  {
    initials: 'MK',
    name: 'Mohamed K.',
    country: '🇲🇦 Maroc',
    exam: 'TCF Canada',
    score_before: 'C1',
    score_after: 'C2 — NCLC 11',
    duration: '30 jours',
    color: 'bg-purple-600',
    quote: 'Le parcours 30 jours m\'a donné un plan clair chaque matin. Le calculateur NCLC m\'a aidé à comprendre exactement quel score j\'avais besoin pour ma RP.',
    module_focus: 'EO',
    city: 'Casablanca → Ottawa',
  },
  {
    initials: 'BY',
    name: 'Bintou Y.',
    country: '🇬🇳 Guinée',
    exam: 'TCF Canada',
    score_before: 'A2',
    score_after: 'B2 — NCLC 6',
    duration: '90 jours',
    color: 'bg-rose-600',
    quote: 'Je suis arrivée avec un niveau A2. Grâce au pack Champion et aux corrections humaines des experts, j\'ai réussi le TCF Canada en 3 mois. C\'est possible !',
    module_focus: 'Tous modules',
    city: 'Conakry → Montréal',
  },
  {
    initials: 'NB',
    name: 'Nadia B.',
    country: '🇩🇿 Algérie',
    exam: 'TEF Canada',
    score_before: 'B2',
    score_after: 'C1 — NCLC 8',
    duration: '45 jours',
    color: 'bg-teal-600',
    quote: 'Le paiement Mobile Money (Wave) m\'a permis d\'accéder au Pack Intensif sans carte bancaire. Les simulations officielles valent vraiment le prix.',
    module_focus: 'CE + EE',
    city: 'Alger → Laval',
  },
  {
    initials: 'JPC',
    name: 'Jean-Pierre C.',
    country: '🇨🇲 Cameroun',
    exam: 'TCF Canada',
    score_before: 'B1',
    score_after: 'C1 — NCLC 8',
    duration: '60 jours',
    color: 'bg-amber-600',
    quote: 'Les questions sont vraiment proches du vrai examen. J\'ai été surpris de reconnaître des thèmes similaires le jour J. La préparation sur cette plateforme est sérieuse.',
    module_focus: 'CO + CE',
    city: 'Yaoundé → Sherbrooke',
  },
]

// ── Statistiques globales ─────────────────────────────────────────────
const STATS = [
  { value: '94%', label: 'Taux de réussite', icon: '🏆', sub: 'parmi nos utilisateurs actifs' },
  { value: '+1.8', label: 'Niveaux gagnés en moy.', icon: '📈', sub: 'en 45-60 jours de préparation' },
  { value: '4 800+', label: 'Candidats accompagnés', icon: '🌍', sub: '32 pays francophones' },
  { value: 'NCLC 8+', label: 'Score médian obtenu', icon: '⭐', sub: 'seuil recommandé immigration' },
]

// ── Page ──────────────────────────────────────────────────────────────
export default function SuccessStoriesPage() {
  const { user } = useAuthStore()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 select-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#1B3A6B] font-extrabold text-sm uppercase">
            <svg viewBox="0 0 40 40" className="w-8 h-8">
              <path d="M20 2 L23 12 L33 8 L26 17 L36 22 L26 27 L33 36 L23 32 L20 42 L17 32 L7 36 L14 27 L4 22 L14 17 L7 8 L17 12 Z" fill="#1B3A6B"/>
            </svg>
            Francophonie Academia
          </Link>
          <Link to={user ? "/dashboard" : "/"} className="text-xs text-[#1B3A6B] hover:opacity-80 font-bold flex items-center gap-1">
            ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2a5ba8] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h1 className="text-4xl font-extrabold mb-3">Ils ont réussi leur TCF / TEF Canada</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Des milliers de candidats ont obtenu leur score NCLC cible grâce à notre plateforme.
            Voici leurs histoires.
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-extrabold text-[#1B3A6B]">{s.value}</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{s.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grille de témoignages */}
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">
          Témoignages de nos candidats
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORIES.map(story => (
            <div
              key={story.name}
              className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              {/* En-tête */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-11 h-11 ${story.color} rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0`}>
                  {story.initials}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{story.name}</p>
                  <p className="text-xs text-gray-500">{story.country} · {story.city}</p>
                </div>
              </div>

              {/* Citation */}
              <blockquote className="text-sm text-gray-700 italic flex-1 mb-4 leading-relaxed">
                "{story.quote}"
              </blockquote>

              {/* Résultats */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Examen</span>
                  <span className="font-semibold text-gray-800">{story.exam}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Avant</span>
                  <span className="font-semibold text-amber-600">{story.score_before}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Obtenu</span>
                  <span className="font-semibold text-green-600">{story.score_after}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Préparation</span>
                  <span className="font-semibold text-[#1B3A6B]">{story.duration}</span>
                </div>
              </div>

              {/* Module focus */}
              <div className="mt-3">
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Focus : {story.module_focus}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Note légale */}
        <p className="text-center text-xs text-gray-400 mt-6">
          * Prénoms modifiés. Scores et niveaux vérifiés. Résultats individuels variables selon l'investissement personnel.
        </p>
      </div>

      {/* Parcours types */}
      <div className="bg-white border-y border-gray-200 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
            Parcours les plus courants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                duration: '30 jours',
                title: 'Booster Express',
                desc: 'Déjà B2 ? Visez C1 en 30 jours intensifs avec simulations quotidiennes.',
                level: 'B2 → C1',
                icon: '⚡',
                bg: 'bg-amber-50 border-amber-200',
              },
              {
                duration: '60 jours',
                title: 'Préparation Standard',
                desc: 'Le parcours le plus efficace — 8 semaines de progression constante.',
                level: 'B1 → B2/C1',
                icon: '📚',
                bg: 'bg-blue-50 border-blue-200',
              },
              {
                duration: '90 jours',
                title: 'Transformation Complète',
                desc: 'De A2 à B2 — pour les débutants motivés avec un objectif clair.',
                level: 'A2/B1 → B2',
                icon: '🚀',
                bg: 'bg-green-50 border-green-200',
              },
            ].map(p => (
              <div key={p.title} className={`rounded-2xl border-2 ${p.bg} p-5`}>
                <div className="text-3xl mb-2">{p.icon}</div>
                <div className="text-xs font-bold text-gray-500 mb-1">{p.duration}</div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">{p.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{p.desc}</p>
                <span className="inline-block bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                  {p.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Écrivez votre propre success story
          </h2>
          <p className="text-gray-500 mb-8">
            Rejoignez plus de 4 800 candidats qui ont obtenu leur score NCLC cible.
            Commencez gratuitement — sans carte bancaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-[#1B3A6B] text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-[#152e56] transition-colors"
            >
              Commencer gratuitement →
            </Link>
            <Link
              to="/calculateur-nclc"
              className="border-2 border-[#1B3A6B] text-[#1B3A6B] px-8 py-3.5 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors"
            >
              Calculer mon NCLC cible
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Paiement Mobile Money disponible 🌍 · Orange Money, MTN, Wave
          </p>
        </div>
      </div>
    </div>
  )
}
