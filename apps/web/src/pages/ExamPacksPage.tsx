import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuthStore } from '../store/authStore'

const PACKS = [
  {
    id: 'bronze',
    name: 'Pack Découverte',
    emoji: '🥉',
    price_eur: 14.99,
    price_cfa: 9800,
    duration_days: 5,
    ai_trials: 3,
    co_tests: 40,
    ce_tests: 40,
    simulations: 1,
    color: '#CD7F32',
    border: 'border-amber-300/40',
    badge: null,
    desc: 'Idéal pour découvrir la plateforme ou faire une révision de dernière minute avant l\'examen.',
  },
  {
    id: 'silver',
    name: 'Pack Préparation',
    emoji: '🥈',
    price_eur: 29.99,
    price_cfa: 19600,
    duration_days: 30,
    ai_trials: 8,
    co_tests: 120,
    ce_tests: 120,
    simulations: 5,
    color: '#94a3b8',
    border: 'border-slate-300/40',
    badge: 'Populaire',
    desc: 'Un mois de préparation intensive pour maximiser votre score TCF ou TEF Canada.',
  },
  {
    id: 'gold',
    name: 'Pack Intensif',
    emoji: '🥇',
    price_eur: 49.99,
    price_cfa: 32700,
    duration_days: 60,
    ai_trials: 15,
    co_tests: 300,
    ce_tests: 300,
    simulations: 12,
    color: '#F59E0B',
    border: 'border-yellow-300/40',
    badge: 'Meilleure valeur',
    desc: 'Deux mois de préparation complète pour atteindre le niveau C1 ou C2.',
  },
  {
    id: 'platinum',
    name: 'Pack Champion',
    emoji: '💎',
    price_eur: 79.99,
    price_cfa: 52300,
    duration_days: 90,
    ai_trials: 30,
    co_tests: -1, // illimité
    ce_tests: -1,
    simulations: -1,
    color: '#6366f1',
    border: 'border-indigo-300/40',
    badge: 'Tout illimité',
    desc: 'Accès illimité pendant 3 mois pour une préparation sans contraintes jusqu\'à C2.',
  },
]

export default function ExamPacksPage() {
  const { user } = useAuthStore()
  const [currency, setCurrency] = useState<'CAD' | 'CFA'>('CAD')

  const formatPrice = (pack: typeof PACKS[0]) => {
    if (currency === 'CFA') {
      return `${pack.price_cfa.toLocaleString('fr-FR')} FCFA`
    }
    return `${pack.price_eur.toFixed(2).replace('.', ',')} $`
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo />
          {user && (
            <Link to="/dashboard" className="text-xs bg-[#1B3A6B]/5 text-[#1B3A6B] hover:bg-[#1B3A6B]/10 px-4 py-2 rounded-xl font-bold transition-all">
              Mon espace
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10 space-y-12">
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-black uppercase tracking-wider transition-colors select-none">
          ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
        </Link>
        
        {/* Titre */}
        <div className="text-center space-y-4">
          <span className="inline-block bg-[#1B3A6B]/10 text-[#1B3A6B] text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
            Packs à durée limitée · Accès immédiat
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
            Choisissez votre pack de préparation
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto font-medium">
            Accès complet pendant une durée définie. Pas d'abonnement récurrent.
            Activez votre pack et commencez votre entraînement dès aujourd'hui.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center bg-slate-100 border border-slate-200/50 rounded-full p-1 gap-1 shadow-inner">
              <button
                onClick={() => setCurrency('CAD')}
                className={`px-5 py-2 rounded-full text-[11px] font-black tracking-wider uppercase transition-all ${
                  currency === 'CAD' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🇨🇦 CAD
              </button>
              <button
                onClick={() => setCurrency('CFA')}
                className={`px-5 py-2 rounded-full text-[11px] font-black tracking-wider uppercase transition-all ${
                  currency === 'CFA' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🌍 FCFA <span className="text-[10px] font-normal lowercase">(-40%)</span>
              </button>
            </div>
          </div>

          {currency === 'CFA' && (
            <p className="text-xs text-emerald-600 font-bold animate-pulse">
              ✓ Réduction géographique de -40% appliquée · Mobile Money disponible (FedaPay)
            </p>
          )}
        </div>

        {/* Grille des packs */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKS.map(pack => (
            <div
              key={pack.id}
              className={`relative bg-white/95 rounded-3xl border-2 ${pack.border} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group`}
            >
              {pack.badge && (
                <div className="absolute top-0 right-0 left-0 text-center py-1.5 text-[9px] font-black uppercase tracking-widest text-white bg-slate-950 z-10">
                  {pack.badge}
                </div>
              )}

              {/* Decorative top gradient bar */}
              <div 
                className="h-2 w-full"
                style={{ 
                  background: pack.id === 'bronze' 
                    ? 'linear-gradient(to right, #CD7F32, #dca472)' 
                    : pack.id === 'silver' 
                    ? 'linear-gradient(to right, #94a3b8, #cbd5e1)' 
                    : pack.id === 'gold' 
                    ? 'linear-gradient(to right, #F59E0B, #C55A11)' 
                    : 'linear-gradient(to right, #6366f1, #a855f7)'
                }}
              />

              <div className={`${pack.badge ? 'pt-8' : 'pt-6'} px-6 pb-6 flex-1 flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl filter drop-shadow-sm select-none">{pack.emoji}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-black uppercase tracking-wider px-2 py-0.5 rounded-lg">
                    {pack.duration_days} jours
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1 tracking-tight">{pack.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-5 min-h-[48px] font-medium">{pack.desc}</p>

                {/* Prix */}
                <div className="mb-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-baseline gap-1 select-none">
                  <span className="text-2xl font-black text-slate-950 tracking-tight">{formatPrice(pack)}</span>
                  <span className="text-slate-400 text-[10px] font-black">/ {pack.duration_days}j</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 text-xs text-slate-600 mb-6 flex-1 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold select-none">✦</span>
                    <span>{pack.co_tests === -1 ? 'Tests CO illimités' : `${pack.co_tests} tests CO`}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold select-none">✦</span>
                    <span>{pack.ce_tests === -1 ? 'Tests CE illimités' : `${pack.ce_tests} tests CE`}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold select-none">✦</span>
                    <span>{pack.simulations === -1 ? 'Simulations illimitées' : `${pack.simulations} simulation${pack.simulations > 1 ? 's' : ''}`}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold select-none">✦</span>
                    <span>{pack.ai_trials === -1 ? 'Corrections IA illimitées' : `${pack.ai_trials} corrections IA EE/EO`}</span>
                  </li>
                </ul>

                <Link
                  to={user ? `/subscribe?pack=${pack.id}&currency=${currency}` : `/register?pack=${pack.id}`}
                  className={`block w-full text-center py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 ${
                    pack.id === 'silver' || pack.id === 'gold'
                      ? 'bg-slate-950 text-white hover:bg-slate-800 shadow-md'
                      : 'bg-white text-slate-800 border-2 border-slate-200 hover:border-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {user ? 'Activer ce pack' : 'Commencer'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Paiements Afrique */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
            🌍 Opérateurs partenaires — Mobile Money Afrique
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Orange Money', countries: 'Sénégal, Mali, Côte d\'Ivoire...', emoji: '🟠' },
              { name: 'MTN Mobile Money', countries: 'Cameroun, Congo, Bénin...', emoji: '🟡' },
              { name: 'Wave', countries: 'Sénégal, Côte d\'Ivoire', emoji: '🔵' },
              { name: 'Moov Money', countries: 'Bénin, Togo, Burkina Faso...', emoji: '🟣' },
            ].map(method => (
              <div key={method.name} className="bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#1B3A6B]/20 rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-md">
                <div className="text-3xl mb-2">{method.emoji}</div>
                <p className="font-black text-sm text-slate-950">{method.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{method.countries}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            * Les transactions Mobile Money régionales sont sécurisées et traitées par la passerelle de paiement agréée **FedaPay**. 
            Prix réduits automatiquement calculés selon la zone géographique de l'étudiant.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-slate-950">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: 'La durée du pack commence quand ?',
                a: "Immédiatement après le paiement et l'activation. Si vous achetez un pack de 5 jours aujourd'hui, il expire dans 5 jours, même si vous ne vous connectez pas tous les jours."
              },
              {
                q: 'Puis-je acheter plusieurs packs à la suite ?',
                a: "Oui, vous pouvez acheter un nouveau pack avant que le précédent expire. Les durées s'additionnent. Par exemple, achetez Silver + Gold pour 3 mois de préparation continue."
              },
              {
                q: 'Que se passe-t-il si je n\'utilise pas toutes mes corrections IA ?',
                a: "Les corrections IA non utilisées expirent avec le pack. Elles ne sont pas reportables sur un nouveau pack. Planifiez votre préparation pour utiliser toutes les corrections disponibles."
              },
              {
                q: 'Peut-on passer à un abonnement mensuel depuis un pack ?',
                a: "Oui, à tout moment. Si vous souhaitez une préparation continue sans limite de durée, nos abonnements mensuels sont disponibles depuis la page Tarifs."
              },
            ].map((item, i) => (
              <details key={i} className="border border-slate-200/60 rounded-2xl overflow-hidden group transition-all duration-300 open:bg-slate-50/20">
                <summary className="px-5 py-4 cursor-pointer font-bold text-slate-800 hover:bg-slate-50/50 flex justify-between items-center list-none transition-colors">
                  <span className="pr-4">{item.q}</span>
                  <span className="text-[#1B3A6B] font-bold group-open:rotate-45 transition-transform duration-300 text-lg">+</span>
                </summary>
                <div className="px-5 pb-5 text-slate-600 text-xs leading-relaxed border-t border-slate-100/50 pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Note remboursement */}
        <p className="text-center text-xs text-slate-400 mt-6 select-none font-medium">
          Remboursement sous 24h si aucune fonctionnalité n'a été utilisée.{' '}
          <Link to="/remboursement" className="underline hover:text-slate-600 transition-colors">Voir la politique de remboursement →</Link>
        </p>
      </div>
    </div>
  )
}
