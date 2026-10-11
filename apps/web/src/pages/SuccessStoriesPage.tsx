import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuthStore } from '../store/authStore'
import { useDocumentMetadata } from '../hooks/useDocumentMetadata'

// ── Ce qu'on peut garantir dès aujourd'hui (vérifiable, pas des chiffres inventés) ──
const COMMITMENTS = [
  {
    icon: '⏱️',
    title: 'Format strictement officiel',
    desc: "Durées, nombre de questions et structure identiques à l'examen réel : 39 QCM CO (35 min), 39 QCM CE (35 min), tâches EE/EO chronométrées comme le jour J. Aucune approximation.",
  },
  {
    icon: '🤖',
    title: 'Correction IA transparente',
    desc: "L'Expression Écrite est corrigée par GPT-4o sur les 5 critères officiels CECRL. L'Expression Orale est transcrite par Whisper puis analysée. Vous voyez le détail de chaque critère, pas juste une note.",
  },
  {
    icon: '💳',
    title: 'Remboursé sous 14 jours',
    desc: "Sans condition ni justification si ayePREP ne vous convient pas. C'est écrit noir sur blanc dans notre politique, pas une formule marketing.",
  },
  {
    icon: '🆓',
    title: 'Testez avant de payer',
    desc: "Test de niveau et exercices gratuits, sans carte bancaire. Jugez la qualité du contenu par vous-même avant tout engagement.",
  },
  {
    icon: '🔒',
    title: 'Données hébergées en Europe',
    desc: "Conforme RGPD. Vos enregistrements audio et vos rédactions ne sont utilisés que pour vous corriger, jamais revendus.",
  },
  {
    icon: '🌍',
    title: 'Paiement adapté à votre pays',
    desc: "Mobile Money (Orange, MTN, Wave, Moov) en Afrique subsaharienne, carte bancaire ailleurs. Prix ajustés en FCFA.",
  },
]

export default function SuccessStoriesPage() {
  const { user } = useAuthStore()

  useDocumentMetadata({
    title: 'Notre méthode & nos engagements | ayePREP',
    description: "Découvrez comment ayePREP reproduit fidèlement le format officiel du TCF Canada et du TEF Canada, et les garanties concrètes offertes à chaque candidat.",
    url: 'https://ayeprep.com/reussites',
  })

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-60"></div>
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <span className="inline-block bg-white/10 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 select-none">
            Notre méthode · Nos engagements
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
            Une rigueur vérifiable, pas des promesses en l'air
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto font-medium">
            ayePREP vient de lancer. Plutôt que d'afficher des chiffres invérifiables, voici exactement ce qu'on vous garantit dès aujourd'hui — et comment vérifier chaque point vous-même.
          </p>
        </div>
      </div>

      {/* Engagements */}
      <div className="max-w-5xl mx-auto py-16 px-4 space-y-8 relative z-10">
        <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight uppercase">
          Ce qu'on peut vous garantir dès aujourd'hui
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMMITMENTS.map(c => (
            <div
              key={c.title}
              className="bg-white/95 rounded-3xl border border-slate-200/60 p-6 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-3xl mb-3 filter drop-shadow-sm select-none">{c.icon}</div>
              <h3 className="font-black text-slate-950 text-sm leading-snug mb-2">{c.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium flex-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Témoignages à venir */}
      <div className="bg-white/80 backdrop-blur-md border-y border-slate-200/50 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="text-3xl">🌱</div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            Les témoignages arrivent bientôt
          </h2>
          <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">
            ayePREP est une plateforme récente. Plutôt que d'inventer des avis, on préfère attendre d'avoir de vrais retours de candidats à partager ici — avec leur accord explicite. Si vous utilisez déjà ayePREP et souhaitez partager votre expérience, écrivez-nous à{' '}
            <a href="mailto:support@ayeprep.com" className="text-[#1B3A6B] underline font-bold">support@ayeprep.com</a>.
          </p>
        </div>
      </div>

      {/* CTA final */}
      <div className="py-20 px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-black text-slate-950 tracking-tight leading-none">
            Jugez par vous-même
          </h2>
          <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">
            Commencez gratuitement, sans engagement et sans carte bancaire. Remboursé sous 14 jours si ça ne vous convient pas.
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
