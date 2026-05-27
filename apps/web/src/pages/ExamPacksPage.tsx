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
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    badge: null,
    desc: 'Idéal pour découvrir la plateforme ou une révision de dernière minute avant l\'examen.',
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
    border: 'border-slate-300',
    bg: 'bg-slate-50',
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
    border: 'border-yellow-400',
    bg: 'bg-yellow-50',
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
    border: 'border-indigo-300',
    bg: 'bg-indigo-50',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Logo />
          {user && (
            <Link to="/dashboard" className="text-sm text-[#1B3A6B] font-semibold hover:underline">
              Mon espace
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none mb-6">
          ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
        </Link>
        {/* Titre */}
        <div className="text-center mb-10">
          <span className="inline-block bg-[#1B3A6B]/10 text-[#1B3A6B] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            Packs à durée limitée · Accès immédiat
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Choisissez votre pack de préparation
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            Accès complet pendant une durée définie. Pas d'abonnement récurrent.
            Activez votre pack et commencez immédiatement.
          </p>

          <div className="inline-flex items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
            <button
              onClick={() => setCurrency('CAD')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                currency === 'CAD' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🇨🇦 CAD
            </button>
            <button
              onClick={() => setCurrency('CFA')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                currency === 'CFA' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🌍 FCFA <span className="text-xs font-normal">(-40%)</span>
            </button>
          </div>

          {currency === 'CFA' && (
            <p className="text-sm text-green-600 font-semibold mt-2">
              ✓ Prix réduits de 40% pour l'Afrique francophone · Paiement Mobile Money disponible
            </p>
          )}
        </div>

        {/* Grille des packs */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {PACKS.map(pack => (
            <div
              key={pack.id}
              className={`relative bg-white rounded-2xl border-2 ${pack.border} shadow-sm flex flex-col overflow-hidden hover:-translate-y-1 transition-transform`}
            >
              {pack.badge && (
                <div className="absolute top-0 right-0 left-0 text-center py-1.5 text-xs font-extrabold text-white"
                     style={{ backgroundColor: pack.id === 'platinum' ? '#6366f1' : pack.id === 'gold' ? '#F59E0B' : '#1B3A6B' }}>
                  {pack.badge}
                </div>
              )}

              <div className={`${pack.badge ? 'pt-10' : 'pt-6'} px-5 pb-4`}>
                <div className="text-3xl mb-2">{pack.emoji}</div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">{pack.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{pack.desc}</p>

                {/* Prix */}
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-gray-900">{formatPrice(pack)}</span>
                  <span className="text-gray-500 text-sm ml-1">/ {pack.duration_days} jours</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{pack.co_tests === -1 ? 'Tests CO illimités' : `${pack.co_tests} tests CO`}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{pack.ce_tests === -1 ? 'Tests CE illimités' : `${pack.ce_tests} tests CE`}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{pack.simulations === -1 ? 'Simulations illimitées' : `${pack.simulations} simulation${pack.simulations > 1 ? 's' : ''}`}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{pack.ai_trials === -1 ? 'Corrections IA illimitées' : `${pack.ai_trials} corrections IA EE/EO`}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Accès {pack.duration_days} jours</span>
                  </li>
                </ul>
              </div>

              <div className="px-5 pb-5 mt-auto">
                <Link
                  to={user ? `/subscribe?pack=${pack.id}&currency=${currency}` : `/register?pack=${pack.id}`}
                  className="block w-full text-center py-2.5 rounded-xl font-bold text-sm transition-colors"
                  style={{
                    backgroundColor: pack.id === 'silver' || pack.id === 'gold' ? '#1B3A6B' : 'white',
                    color: pack.id === 'silver' || pack.id === 'gold' ? 'white' : '#1B3A6B',
                    border: '2px solid #1B3A6B'
                  }}
                >
                  {user ? 'Activer ce pack →' : 'Commencer →'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Paiements Afrique */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🌍 Paiements disponibles pour l'Afrique francophone
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Orange Money', countries: 'Sénégal, Mali, Côte d\'Ivoire...', emoji: '🟠' },
              { name: 'MTN Mobile Money', countries: 'Cameroun, Congo, Ghana...', emoji: '🟡' },
              { name: 'Wave', countries: 'Sénégal, Côte d\'Ivoire', emoji: '🔵' },
              { name: 'Moov Money', countries: 'Bénin, Togo, Burkina Faso...', emoji: '🟣' },
            ].map(method => (
              <div key={method.name} className="border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{method.emoji}</div>
                <p className="font-bold text-sm text-gray-900">{method.name}</p>
                <p className="text-xs text-gray-500 mt-1">{method.countries}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Paiements Mobile Money traités via FedaPay. Disponibles sur tous les packs.
            Prix en FCFA avec réduction -40% automatique.
          </p>
        </div>

        {/* FAQ rapide */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Questions fréquentes sur les packs</h2>
          <div className="space-y-4 text-sm">
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
              <details key={i} className="border border-gray-100 rounded-xl overflow-hidden group">
                <summary className="px-4 py-3 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 flex justify-between items-center list-none">
                  {item.q}
                  <span className="text-[#1B3A6B] group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-4 text-gray-600">{item.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Note remboursement */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Remboursement sous 24h si aucune fonctionnalité n'a été utilisée.{' '}
          <Link to="/remboursement" className="underline">Voir la politique de remboursement →</Link>
        </p>
      </div>
    </div>
  )
}
