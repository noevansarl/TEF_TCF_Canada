import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
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
    color: 'from-blue-600 to-indigo-600',
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
    color: 'from-emerald-500 to-teal-600',
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
    color: 'from-purple-600 to-fuchsia-600',
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
    color: 'from-rose-500 to-pink-600',
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
    color: 'from-teal-500 to-cyan-600',
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
    color: 'from-amber-500 to-orange-600',
    quote: 'Les questions sont vraiment proches du vrai examen. J\'ai été surpris de reconnaître des thèmes similaires le jour J. La préparation sur cette plateforme est sérieuse.',
    module_focus: 'CO + CE',
    city: 'Yaoundé → Sherbrooke',
  },
]

// ── Statistiques globales ─────────────────────────────────────────────
const STATS = [
  { value: '94%', label: 'Taux de réussite', icon: '🏆', sub: 'parmi nos utilisateurs actifs' },
  { value: '+1.8', label: 'Niveaux gagnés', icon: '📈', sub: 'en 45-60 jours de révision' },
  { value: '4 800+', label: 'Candidats suivis', icon: '🌍', sub: 'dans 32 pays d\'Afrique/monde' },
  { value: 'NCLC 8+', label: 'Score médian', icon: '⭐', sub: 'seuil recommandé immigration' },
]

export default function SuccessStoriesPage() {
  const { user } = useAuthStore()
  return (
    <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden font-sans">
      {/* Decorative radial glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo />
          <Link to={user ? "/dashboard" : "/"} className="text-xs bg-[#1B3A6B]/5 text-[#1B3A6B] hover:bg-[#1B3A6B]/10 px-4 py-2 rounded-xl font-bold transition-all select-none">
            ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-20 px-6 overflow-hidden">
        {/* Subtle background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-60"></div>
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <span className="inline-block bg-white/10 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 select-none">
            Success Stories · Récits de candidats
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
            Ils ont réussi leur TCF & TEF Canada
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto font-medium">
            Des milliers de candidats ont obtenu leur niveau NCLC cible grâce à nos entraînements officiels et nos corrections par IA. Découvrez leurs parcours.
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 text-center space-y-1">
              <div className="text-2xl filter drop-shadow-sm select-none">{s.icon}</div>
              <div className="text-xl font-black text-slate-950 tracking-tight">{s.value}</div>
              <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{s.label}</div>
              <div className="text-[10px] text-slate-400 font-medium">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grille de témoignages */}
      <div className="max-w-5xl mx-auto py-16 px-4 space-y-8 relative z-10">
        <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight uppercase">
          Témoignages de nos candidats
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORIES.map(story => (
            <div
              key={story.name}
              className="bg-white/95 rounded-3xl border border-slate-200/60 p-6 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* En-tête de carte */}
              <div className="flex items-start gap-3.5 mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${story.color} rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0`}>
                  {story.initials}
                </div>
                <div>
                  <p className="font-black text-slate-950 text-sm leading-snug">{story.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{story.country} · {story.city}</p>
                </div>
              </div>

              {/* Citation */}
              <blockquote className="text-xs text-slate-500 italic flex-1 mb-5 leading-relaxed font-medium">
                "{story.quote}"
              </blockquote>

              {/* Résultats */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-xs select-none">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Examen préparé</span>
                  <span className="font-black text-slate-800">{story.exam}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Niveau initial</span>
                  <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{story.score_before}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Score obtenu</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{story.score_after}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Durée préparation</span>
                  <span className="font-black text-[#1B3A6B]">{story.duration}</span>
                </div>
              </div>

              {/* Module focus badge */}
              <div className="mt-4">
                <span className="inline-block bg-indigo-50/50 text-indigo-700 border border-indigo-100 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Focus : {story.module_focus}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Note légale */}
        <p className="text-center text-[10px] text-slate-400 font-medium select-none">
          * Prénoms modifiés. Niveaux de scores NCLC certifiés et validés. Les résultats individuels dépendent du travail de chaque candidat.
        </p>
      </div>

      {/* Parcours types */}
      <div className="bg-white/80 backdrop-blur-md border-y border-slate-200/50 py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-xl font-black text-slate-900 text-center tracking-tight uppercase">
            Parcours de préparation courants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                duration: '30 jours',
                title: 'Booster Express',
                desc: 'Déjà de niveau B2 ? Visez C1 en 30 jours intensifs avec simulations quotidiennes.',
                level: 'B2 → C1',
                icon: '⚡',
                border: 'border-amber-200',
                bg: 'bg-amber-50/50',
              },
              {
                duration: '60 jours',
                title: 'Préparation Standard',
                desc: 'Le parcours le plus efficace — 8 semaines de progression constante et mesurable.',
                level: 'B1 → B2/C1',
                icon: '📚',
                border: 'border-blue-200',
                bg: 'bg-blue-50/50',
              },
              {
                duration: '90 jours',
                title: 'Transformation Complète',
                desc: 'De A2 à B2 — pour les grands débutants motivés avec un objectif d\'immigration clair.',
                level: 'A2/B1 → B2',
                icon: '🚀',
                border: 'border-emerald-200',
                bg: 'bg-emerald-50/50',
              },
            ].map(p => (
              <div key={p.title} className={`rounded-3xl border-2 ${p.border} ${p.bg} p-6 space-y-3 hover:scale-[1.02] transition-transform duration-300`}>
                <div className="text-3xl filter drop-shadow-sm select-none">{p.icon}</div>
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.duration}</div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">{p.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                <span className="inline-block bg-white text-slate-700 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200">
                  {p.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="py-20 px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-black text-slate-950 tracking-tight leading-none">
            Écrivez votre propre success story
          </h2>
          <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">
            Rejoignez plus de 4 800 candidats qui ont obtenu leur score cible. Commencez gratuitement, sans engagement et sans carte bancaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 select-none">
            <Link
              to="/register"
              className="bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 shadow-md transition-colors"
            >
              Commencer gratuitement →
            </Link>
            <Link
              to="/calculateur-nclc"
              className="bg-white text-slate-800 border-2 border-slate-250 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
            >
              Calculer mon NCLC cible
            </Link>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Paiement Mobile Money disponible en Afrique subsaharienne 🌍
          </p>
        </div>
      </div>
    </div>
  )
}
