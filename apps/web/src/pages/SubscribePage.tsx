import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

const COUNTRY_OPERATORS: Record<string, { name: string, code: string, operators: { label: string, value: string }[] }> = {
  BJ: {
    name: 'Bénin',
    code: 'BJ',
    operators: [
      { label: 'MTN Mobile Money', value: 'mtn_open' },
      { label: 'Moov Money', value: 'moov_money' }
    ]
  },
  TG: {
    name: 'Togo',
    code: 'TG',
    operators: [
      { label: 'Moov Money (T-Money)', value: 'moov_money' }
    ]
  },
  SN: {
    name: 'Sénégal',
    code: 'SN',
    operators: [
      { label: 'Orange Money', value: 'orange_money_sn' },
      { label: 'Wave', value: 'wave_money' }
    ]
  },
  CI: {
    name: 'Côte d\'Ivoire',
    code: 'CI',
    operators: [
      { label: 'Orange Money', value: 'orange_money_ci' },
      { label: 'MTN Mobile Money', value: 'mtn_open' },
      { label: 'Moov Money', value: 'moov_money' },
      { label: 'Wave', value: 'wave_money' }
    ]
  },
  CM: {
    name: 'Cameroun',
    code: 'CM',
    operators: [
      { label: 'MTN Mobile Money', value: 'mtn_open' }
    ]
  },
  ML: {
    name: 'Mali',
    code: 'ML',
    operators: [
      { label: 'Orange Money', value: 'orange_money_ml' }
    ]
  }
}

const PLANS = [
  {
    id: 'gratuit',
    name: 'Gratuit',
    price_monthly: 0,
    price_yearly: 0,
    features: ['10 exercices CO', '10 exercices CE', '1 simulation/mois', 'Test diagnostique'],
    missing: ['Exercices EE/EO', 'Correction IA', 'Mode hors-ligne'],
    cta: 'Plan actuel',
    popular: false,
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    price_monthly: 9.99,
    price_yearly: 6.67,
    features: ['CO illimité + correction IA', 'CE illimité + correction IA', '5 simulations/mois', 'Mode hors-ligne mobile'],
    missing: ['Exercices EE/EO', 'Correction humaine'],
    cta: 'Choisir Essentiel',
    popular: false,
  },
  {
    id: 'avance',
    name: 'Avancé',
    price_monthly: 19.99,
    price_yearly: 13.33,
    features: ['Tous modules illimités', 'Correction IA tous modules', '15 simulations/mois', 'Dashboard progression avancé', 'Mode hors-ligne mobile'],
    missing: ['Correction humaine EE/EO'],
    cta: 'Choisir Avancé',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium+',
    price_monthly: 34.99,
    price_yearly: 23.33,
    features: ['Tout du plan Avancé', 'Simulations illimitées', '8 corrections humaines EE/mois', '8 corrections humaines EO/mois', 'Délai garanti 48h EE / 72h EO', 'Accès bêta nouvelles fonctionnalités'],
    missing: [],
    cta: 'Choisir Premium+',
    popular: false,
  },
]

const PACKS = [
  { id: 'bronze',   name: 'Découverte', price_eur: 14.99, price_cfa: 9800,  days: 5,  ai: 3,  emoji: '🥉' },
  { id: 'silver',   name: 'Préparation', price_eur: 29.99, price_cfa: 19600, days: 30, ai: 8,  emoji: '🥈' },
  { id: 'gold',     name: 'Intensif',   price_eur: 49.99, price_cfa: 32700, days: 60, ai: 15, emoji: '🥇' },
  { id: 'platinum', name: 'Champion',   price_eur: 79.99, price_cfa: 52300, days: 90, ai: 30, emoji: '💎' },
]

export default function SubscribePage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<'abonnement' | 'pack'>(
    searchParams.get('pack') ? 'pack' : 'abonnement'
  )
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [currency, setCurrency] = useState<'CAD' | 'CFA'>('CAD')

  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Payment states
  const [selectedPack, setSelectedPack] = useState<typeof PACKS[0] | null>(null)
  const [showFedaModal, setShowFedaModal] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'form' | 'waiting' | 'success' | 'error'>('form')

  const [country, setCountry] = useState('BJ')
  const [operator, setOperator] = useState('mtn_open')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [showStripeSuccess, setShowStripeSuccess] = useState(false)
  const stripeSessionId = searchParams.get('session_id')

  useEffect(() => {
    if (stripeSessionId) {
      setShowStripeSuccess(true)
    }
  }, [stripeSessionId])

  useEffect(() => {
    if (user) {
      supabase.from('users').select('country').eq('id', user.id).maybeSingle().then((res: any) => {
        const data = res?.data
        if (data?.country) {
          setCountry(data.country)
          const ops = COUNTRY_OPERATORS[data.country]?.operators || []
          if (ops.length > 0) {
            setOperator(ops[0].value)
          }
        }
      })
    }
  }, [user])

  const handleStripeSubscription = async (planId: string) => {
    if (!user) {
      navigate(`/register?plan=${planId}`)
      return
    }
    setLoadingPlanId(planId)
    setErrorMessage(null)
    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: planId,
          period: period,
          user_id: user.id,
          country: country,
          return_url: window.location.origin
        }
      })

      if (functionError || !data) {
        setErrorMessage(functionError?.message || "Impossible de créer la session de paiement Stripe.")
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        setErrorMessage(data.error)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue lors de l'appel API.")
    } finally {
      setLoadingPlanId(null)
    }
  }

  const handleCountryChange = (cCode: string) => {
    setCountry(cCode)
    const ops = COUNTRY_OPERATORS[cCode]?.operators || []
    if (ops.length > 0) {
      setOperator(ops[0].value)
    }
  }

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPack || !user) return
    setLoading(true)
    setErrorMessage(null)

    const prefix = country === 'BJ' ? '229' : country === 'TG' ? '228' : country === 'SN' ? '221' : country === 'CI' ? '225' : country === 'CM' ? '237' : '223'
    const fullPhone = `+${prefix}${phoneNumber.replace(/\s+/g, '')}`

    try {
      const { data, error: functionError } = await supabase.functions.invoke('fedapay-payment', {
        body: {
          pack_id: selectedPack.id,
          method: operator,
          phone_number: fullPhone,
          phone_country: country,
          customer_name: customerName || user.email || 'Client Francophonie',
          customer_email: user.email
        }
      })

      if (functionError || !data) {
        setErrorMessage(functionError?.message || "Impossible d'initier le paiement.")
        setPaymentStep('error')
        setLoading(false)
        return
      }

      if (!data.success) {
        setErrorMessage(data.error || "Impossible d'initier le paiement.")
        setPaymentStep('error')
        setLoading(false)
        return
      }

      setTransactionId(data.transaction_id)
      setPaymentStep('waiting')

      // Commencer la scrutation (polling)
      startPolling(data.transaction_id)
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue lors de l'appel API.")
      setPaymentStep('error')
    } finally {
      setLoading(false)
    }
  }

  const startPolling = (txId: string) => {
    let attemptsCount = 0
    const maxAttempts = 20 // 20 fois 3 secondes = 60 secondes maximum

    const interval = setInterval(async () => {
      attemptsCount++
      if (attemptsCount > maxAttempts) {
        clearInterval(interval)
        setErrorMessage("Le délai de validation a expiré. Si vous avez été débité, veuillez contacter le support.")
        setPaymentStep('error')
        return
      }

      try {
        const { data, error } = await supabase
          .from('payment_attempts')
          .select('status')
          .eq('fedapay_transaction_id', String(txId))
          .maybeSingle()

        if (error) {
          console.error("Erreur lors de la vérification du statut :", error)
          return
        }

        if (data?.status === 'completed') {
          clearInterval(interval)
          setPaymentStep('success')
        } else if (data?.status === 'declined' || data?.status === 'canceled') {
          clearInterval(interval)
          setErrorMessage(data?.status === 'declined' ? "La transaction a été rejetée par l'opérateur." : "La transaction a été annulée.")
          setPaymentStep('error')
        }
      } catch (err) {
        console.error("Erreur polling:", err)
      }
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none mb-6">
          ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
        </Link>

        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Choisissez votre formule</h1>
          <p className="text-gray-500">Abonnement récurrent ou pack à durée limitée — payez ce qui vous convient.</p>
        </div>

        {errorMessage && !showFedaModal && (
          <div className="mb-6 max-w-md mx-auto bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold text-center border border-red-100 animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* Onglets */}
        <div className="flex bg-white border border-gray-200 rounded-full p-1 w-fit mx-auto mb-8 gap-1">
          <button
            onClick={() => setTab('abonnement')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${tab === 'abonnement' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Abonnements mensuels
          </button>
          <button
            onClick={() => setTab('pack')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${tab === 'pack' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Packs à durée limitée 🌍
          </button>
        </div>

        {/* ── ONGLET ABONNEMENTS ── */}
        {tab === 'abonnement' && (
          <>
            {/* Toggle mensuel / annuel */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-white border border-gray-200 rounded-full p-1 gap-1">
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${period === 'monthly' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500'}`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setPeriod('yearly')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${period === 'yearly' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500'}`}
                >
                  Annuel <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">−33%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border-2 p-5 flex flex-col relative ${
                    plan.popular ? 'border-[#1B3A6B] shadow-lg' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B3A6B] text-white text-xs font-bold px-3 py-1 rounded-full">
                      Plus populaire
                    </span>
                  )}
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="mb-4">
                    {plan.price_monthly === 0 ? (
                      <span className="text-3xl font-extrabold text-gray-900">0 $</span>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-[#1B3A6B]">
                          {period === 'monthly'
                            ? `${plan.price_monthly.toFixed(2).replace('.', ',')} $`
                            : `${plan.price_yearly.toFixed(2).replace('.', ',')} $`}
                        </span>
                        <span className="text-gray-500 text-sm">/mois</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2 flex-1 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold flex-shrink-0">✓</span> {f}
                      </li>
                    ))}
                    {plan.missing.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                        <span className="flex-shrink-0">✗</span> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleStripeSubscription(plan.id)}
                    disabled={plan.id === 'gratuit' || loadingPlanId !== null}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                      plan.popular
                        ? 'bg-[#1B3A6B] text-white hover:bg-[#152e56]'
                        : plan.id === 'gratuit'
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : 'border-2 border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white'
                    }`}
                  >
                    {loadingPlanId === plan.id ? 'Redirection...' : plan.cta}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Afrique francophone <strong>−40%</strong> · Étudiants <strong>−30%</strong> ·
              Essai Premium+ 7 jours gratuits · Annulation en 1 clic
            </p>
          </>
        )}

        {/* ── ONGLET PACKS ── */}
        {tab === 'pack' && (
          <>
            {/* Toggle devise */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-white border border-gray-200 rounded-full p-1 gap-1">
                <button
                  onClick={() => setCurrency('CAD')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${currency === 'CAD' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500'}`}
                >
                  🇨🇦 CAD
                </button>
                <button
                  onClick={() => setCurrency('CFA')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${currency === 'CFA' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500'}`}
                >
                  🌍 FCFA <span className="text-xs">(−40%)</span>
                </button>
              </div>
            </div>

            {currency === 'CFA' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 text-center">
                ✓ Prix réduits de 40% pour l'Afrique francophone · Paiement Orange Money, MTN Mobile Money, Wave disponible
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PACKS.map(pack => (
                <div key={pack.id} className="bg-white rounded-2xl border-2 border-gray-200 p-5 flex flex-col hover:-translate-y-1 transition-transform shadow-sm">
                  <div className="text-3xl mb-2">{pack.emoji}</div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">Pack {pack.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-[#1B3A6B]">
                      {currency === 'CAD'
                        ? `${pack.price_eur.toFixed(2).replace('.', ',')} $`
                        : `${pack.price_cfa.toLocaleString('fr-FR')} FCFA`}
                    </span>
                  </div>
                  <ul className="space-y-2 flex-1 mb-4 text-sm text-gray-700">
                    <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> {pack.days} jours d'accès</li>
                    <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> {pack.ai} corrections IA EE/EO</li>
                    <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Tests CO et CE inclus</li>
                    <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Simulations officielles</li>
                  </ul>

                  <button 
                    onClick={() => {
                      if (currency === 'CFA') {
                        if (!user) {
                          navigate(`/register?pack=${pack.id}`)
                          return
                        }
                        setSelectedPack(pack)
                        setCustomerName('')
                        setPhoneNumber('')
                        setPaymentStep('form')
                        setErrorMessage(null)
                        setShowFedaModal(true)
                      } else {
                        // Card checkout
                        alert("Le paiement par Carte Bancaire (CAD) sera bientôt disponible. Pour l'instant, veuillez utiliser le paiement en FCFA via Mobile Money.")
                      }
                    }}
                    className="w-full py-2.5 bg-[#1B3A6B] text-white rounded-xl font-bold text-sm hover:bg-[#152e56] transition-colors"
                  >
                    {currency === 'CFA' ? '📱 Payer Mobile Money' : 'Activer ce pack'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Méthodes de paiement disponibles</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  { emoji: '🟠', name: 'Orange Money', pays: 'SN, ML, CI...' },
                  { emoji: '🟡', name: 'MTN MoMo', pays: 'CM, CG, GH...' },
                  { emoji: '🔵', name: 'Wave', pays: 'SN, CI' },
                  { emoji: '💳', name: 'Visa / Mastercard', pays: 'Partout' },
                ].map(m => (
                  <div key={m.name} className="border border-gray-100 rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{m.emoji}</div>
                    <p className="font-semibold text-gray-800 text-xs">{m.name}</p>
                    <p className="text-gray-400 text-xs">{m.pays}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-gray-400 mt-4">
              Remboursement sous 24h si aucune fonctionnalité n'a été utilisée.{' '}
              <Link to="/remboursement" className="underline">Politique de remboursement →</Link>
            </p>
          </>
        )}

        {/* Lien aide */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500">
            Une question ?{' '}
            <a href="https://wa.me/22890116744" target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
              💬 WhatsApp
            </a>
            {' '}ou{' '}
            <Link to="/aide" className="text-[#1B3A6B] font-semibold hover:underline">Centre d'aide</Link>
          </p>
        </div>
      </div>

      {showFedaModal && selectedPack && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-6 relative">
            <button 
              onClick={() => setShowFedaModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
            >
              &times;
            </button>

            {paymentStep === 'form' && (
              <form onSubmit={handleInitiatePayment} className="space-y-4">
                <div className="text-center mb-6">
                  <span className="text-3xl">{selectedPack.emoji}</span>
                  <h3 className="text-xl font-bold text-gray-950 mt-2">Paiement Mobile Money</h3>
                  <p className="text-sm text-gray-500 font-medium">Pack {selectedPack.name} — {selectedPack.price_cfa.toLocaleString('fr-FR')} FCFA</p>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold text-center border border-red-100">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Votre Nom complet</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
                    placeholder="Jean Dupont"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Pays de l'opérateur</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
                    value={country}
                    onChange={e => handleCountryChange(e.target.value)}
                  >
                    {Object.values(COUNTRY_OPERATORS).map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Opérateur Mobile Money</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                  >
                    {(COUNTRY_OPERATORS[country]?.operators || []).map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Numéro de téléphone</label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500">
                      +{country === 'BJ' ? '229' : country === 'TG' ? '228' : country === 'SN' ? '221' : country === 'CI' ? '225' : country === 'CM' ? '237' : '223'}
                    </span>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
                      placeholder="90116744"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1B3A6B] hover:bg-[#152e56] text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 mt-4"
                >
                  {loading ? 'Initiation...' : '📱 Confirmer le paiement'}
                </button>
              </form>
            )}

            {paymentStep === 'waiting' && (
              <div className="text-center py-8 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B3A6B] mx-auto"></div>
                <h3 className="text-lg font-bold text-gray-900">En attente de validation...</h3>
                <p className="text-sm text-gray-600 px-4">
                  Une notification de débit a été envoyée sur le numéro de téléphone saisi. 
                  Veuillez composer votre code secret PIN pour confirmer le paiement.
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  Ne fermez pas cette page. Nous vérifions le statut en temps réel.
                  {transactionId && <span className="block mt-1 opacity-75 font-mono text-[10px]">Réf : {transactionId}</span>}
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl mx-auto shadow-sm">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-gray-900">Paiement validé !</h3>
                <p className="text-sm text-gray-600 px-4">
                  Félicitations, votre pack <strong>{selectedPack.name}</strong> a été activé avec succès.
                  {transactionId && <span className="block mt-2 text-xs text-gray-400 font-mono">Réf : {transactionId}</span>}
                </p>
                <button
                  onClick={() => {
                    setShowFedaModal(false)
                    navigate('/dashboard')
                  }}
                  className="w-full py-2.5 bg-[#1B3A6B] text-white rounded-xl font-bold text-sm hover:bg-[#152e56] transition-colors"
                >
                  Accéder à mon espace →
                </button>
              </div>
            )}

            {paymentStep === 'error' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-3xl mx-auto shadow-sm">
                  &times;
                </div>
                <h3 className="text-xl font-bold text-gray-900">Échec du paiement</h3>
                <p className="text-sm text-gray-600 px-4">
                  {errorMessage || "Le paiement n'a pas pu être validé ou a été annulé."}
                </p>
                <button
                  onClick={() => setPaymentStep('form')}
                  className="w-full py-2.5 bg-gray-100 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showStripeSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-6 relative">
            <button 
              onClick={() => {
                setShowStripeSuccess(false)
                navigate('/subscribe', { replace: true })
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
            >
              &times;
            </button>

            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl mx-auto shadow-sm">
                ✓
              </div>
              <h3 className="text-xl font-bold text-gray-900">Abonnement validé !</h3>
              <p className="text-sm text-gray-600 px-4">
                Félicitations, votre abonnement a été activé avec succès. Vous avez désormais accès à l'ensemble des fonctionnalités de votre plan.
                {stripeSessionId && <span className="block mt-2 text-xs text-gray-400 font-mono">Session : {stripeSessionId.substring(0, 20)}...</span>}
              </p>
              <button
                onClick={() => {
                  setShowStripeSuccess(false)
                  navigate('/dashboard')
                }}
                className="w-full py-2.5 bg-[#1B3A6B] text-white rounded-xl font-bold text-sm hover:bg-[#152e56] transition-colors"
              >
                Accéder à mon espace →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
