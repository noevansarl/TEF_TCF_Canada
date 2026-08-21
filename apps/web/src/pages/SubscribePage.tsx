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
      supabase.from('users').select('country').eq('id', user.id).maybeSingle().then((res: { data: { country: string | null } | null }) => {
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

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && user && !loadingPlanId) {
      const validPlans = ['essentiel', 'avance', 'premium']
      if (validPlans.includes(planParam)) {
        // Automatically trigger Stripe subscription checkout
        handleStripeSubscription(planParam)
      }
    }
  }, [searchParams, user])

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
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Une erreur est survenue lors de l'appel API.")
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
          customer_name: customerName || user.email || 'Client ayePREP',
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
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Une erreur est survenue lors de l'appel API.")
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
    <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden font-sans py-10 px-4">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-black uppercase tracking-wider transition-colors select-none mb-6">
          ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
        </Link>

        {/* Titre */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Choisissez votre formule</h1>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto">Abonnement récurrent ou pack à durée limitée — sélectionnez le plan adapté à vos objectifs.</p>
        </div>

        {errorMessage && !showFedaModal && (
          <div className="mb-6 max-w-md mx-auto bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-center border border-red-100 animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* Onglets */}
        <div className="flex bg-slate-100 border border-slate-200/50 rounded-full p-1 w-fit mx-auto mb-10 gap-1 shadow-inner select-none">
          <button
            onClick={() => setTab('abonnement')}
            className={`px-6 py-2.5 rounded-full text-xs font-black tracking-wider uppercase transition-all ${
              tab === 'abonnement' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Abonnements mensuels
          </button>
          <button
            onClick={() => setTab('pack')}
            className={`px-6 py-2.5 rounded-full text-xs font-black tracking-wider uppercase transition-all ${
              tab === 'pack' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Packs à durée limitée 🌍
          </button>
        </div>

        {/* ── ONGLET ABONNEMENTS ── */}
        {tab === 'abonnement' && (
          <div className="space-y-8">
            {/* Toggle mensuel / annuel */}
            <div className="flex justify-center">
              <div className="flex bg-slate-100 border border-slate-200/50 rounded-full p-1 gap-1 shadow-inner select-none">
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                    period === 'monthly' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setPeriod('yearly')}
                  className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    period === 'yearly' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Annuel</span>
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">−33%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  className={`bg-white/95 rounded-3xl border-2 p-6 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 ${
                    plan.popular
                      ? 'border-[#1B3A6B] shadow-lg ring-4 ring-[#1B3A6B]/5'
                      : 'border-slate-200/60 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B3A6B] text-white text-[9px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                      Plus populaire
                    </span>
                  )}
                  <h3 className="text-base font-black text-slate-900 mb-1 tracking-tight">{plan.name}</h3>
                  <div className="mb-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-baseline gap-1 select-none">
                    {plan.price_monthly === 0 ? (
                      <span className="text-2xl font-black text-slate-950">0 $</span>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-[#1B3A6B] tracking-tight">
                          {period === 'monthly'
                            ? `${plan.price_monthly.toFixed(2).replace('.', ',')} $`
                            : `${plan.price_yearly.toFixed(2).replace('.', ',')} $`}
                        </span>
                        <span className="text-slate-400 text-[10px] font-black">/mois</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 flex-1 mb-6 text-xs text-slate-600 font-medium">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span className="text-emerald-500 font-bold select-none">✓</span>
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                    {plan.missing.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-slate-300 line-through">
                        <span className="select-none">✗</span>
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleStripeSubscription(plan.id)}
                    disabled={plan.id === 'gratuit' || loadingPlanId !== null}
                    className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 ${
                      plan.popular
                        ? 'bg-slate-950 text-white hover:bg-slate-800 shadow-md'
                        : plan.id === 'gratuit'
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-white text-slate-800 border-2 border-slate-200 hover:border-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    {loadingPlanId === plan.id ? 'Redirection...' : plan.cta}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-center text-[11px] text-slate-400 font-semibold select-none">
              Afrique francophone <strong>−40%</strong> · Étudiants <strong>−30%</strong> ·
              Annulation de l'abonnement en 1 clic
            </p>
          </div>
        )}

        {/* ── ONGLET PACKS ── */}
        {tab === 'pack' && (
          <div className="space-y-8">
            {/* Toggle devise */}
            <div className="flex justify-center">
              <div className="flex bg-slate-100 border border-slate-200/50 rounded-full p-1 gap-1 shadow-inner select-none">
                <button
                  onClick={() => setCurrency('CAD')}
                  className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${currency === 'CAD' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500'}`}
                >
                  🇨🇦 CAD
                </button>
                <button
                  onClick={() => setCurrency('CFA')}
                  className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${currency === 'CFA' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500'}`}
                >
                  🌍 FCFA <span className="text-[10px] font-normal lowercase">(−40%)</span>
                </button>
              </div>
            </div>

            {currency === 'CFA' && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 font-bold text-center animate-fade-in">
                ✓ Prix réduits de 40% pour l'Afrique francophone · Paiement Orange Money, MTN Mobile Money, Wave disponible
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PACKS.map(pack => (
                <div key={pack.id} className="bg-white/95 rounded-3xl border border-slate-200/60 p-6 flex flex-col hover:-translate-y-2 hover:shadow-xl transition-all duration-300 shadow-sm relative group">
                  {/* Top accent line */}
                  <div 
                    className="absolute top-0 right-0 left-0 h-1.5 w-full"
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
                  <div className="text-3xl mb-3 mt-2">{pack.emoji}</div>
                  <h3 className="text-base font-black text-slate-900 mb-1 tracking-tight">Pack {pack.name}</h3>
                  <div className="mb-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-baseline gap-1 select-none">
                    <span className="text-2xl font-black text-slate-950 tracking-tight">
                      {currency === 'CAD'
                        ? `${pack.price_eur.toFixed(2).replace('.', ',')} $`
                        : `${pack.price_cfa.toLocaleString('fr-FR')} FCFA`}
                    </span>
                    <span className="text-slate-400 text-[10px] font-black">/ {pack.days}j</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-6 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✦</span> {pack.days} jours d'accès</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✦</span> {pack.ai} corrections IA EE/EO</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✦</span> Tests CO et CE inclus</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✦</span> Simulations officielles</li>
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
                        alert("Le paiement par Carte Bancaire (CAD) sera bientôt disponible. Pour l'instant, veuillez utiliser le paiement en FCFA via Mobile Money.")
                      }
                    }}
                    className="w-full py-3 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-800 shadow-md transition-all duration-300"
                  >
                    {currency === 'CFA' ? '📱 Payer Mobile Money' : 'Activer ce pack'}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-8 shadow-sm space-y-6">
              <h3 className="font-black text-slate-950">Méthodes de paiement disponibles</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                  { emoji: '🟠', name: 'Orange Money', pays: 'SN, ML, CI...' },
                  { emoji: '🟡', name: 'MTN MoMo', pays: 'CM, CG, BJ...' },
                  { emoji: '🔵', name: 'Wave', pays: 'SN, CI' },
                  { emoji: '💳', name: 'Visa / Mastercard', pays: 'Partout' },
                ].map(m => (
                  <div key={m.name} className="bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#1B3A6B]/20 rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-md">
                    <div className="text-3xl mb-1">{m.emoji}</div>
                    <p className="font-black text-sm text-slate-950">{m.name}</p>
                    <p className="text-slate-400 text-[10px] font-semibold mt-1">{m.pays}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6 select-none font-medium">
              Remboursement sous 24h si aucune fonctionnalité n'a été utilisée.{' '}
              <Link to="/remboursement" className="underline hover:text-slate-600 transition-colors">Politique de remboursement →</Link>
            </p>
          </div>
        )}

        {/* Lien aide */}
        <div className="text-center mt-12 select-none font-medium text-xs">
          <p className="text-slate-400">
            Une question ?{' '}
            <a href="https://wa.me/22890116744" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline">
              💬 WhatsApp
            </a>
            {' '}ou{' '}
            <Link to="/aide" className="text-[#1B3A6B] font-bold hover:underline">Centre d'aide</Link>
          </p>
        </div>
      </div>

      {showFedaModal && selectedPack && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-150 p-8 relative animate-scale-up">
            <button 
              onClick={() => setShowFedaModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors text-xl font-bold"
            >
              &times;
            </button>

            {paymentStep === 'form' && (
              <form onSubmit={handleInitiatePayment} className="space-y-4">
                <div className="text-center mb-6">
                  <span className="text-4xl filter drop-shadow-sm select-none">{selectedPack.emoji}</span>
                  <h3 className="text-xl font-black text-slate-950 mt-2">Paiement Mobile Money</h3>
                  <p className="text-xs text-slate-500 font-black uppercase tracking-wider mt-1 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 inline-block">
                    Pack {selectedPack.name} — {selectedPack.price_cfa.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-xs font-bold text-center border border-red-100">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Votre Nom complet</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-900 bg-white font-medium"
                    placeholder="Jean Dupont"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Pays de l'opérateur</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-900 bg-white font-bold"
                    value={country}
                    onChange={e => handleCountryChange(e.target.value)}
                  >
                    {Object.values(COUNTRY_OPERATORS).map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Opérateur Mobile Money</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-900 bg-white font-bold"
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                  >
                    {(COUNTRY_OPERATORS[country]?.operators || []).map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Numéro de téléphone</label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-500">
                      +{country === 'BJ' ? '229' : country === 'TG' ? '228' : country === 'SN' ? '221' : country === 'CI' ? '225' : country === 'CM' ? '237' : '223'}
                    </span>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-900 bg-white font-medium"
                      placeholder="90116744"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1B3A6B] hover:bg-[#152e56] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50 mt-4 shadow-md"
                >
                  {loading ? 'Initiation...' : '📱 Confirmer le paiement'}
                </button>
              </form>
            )}

            {paymentStep === 'waiting' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 border-4 border-[#1B3A6B] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="text-lg font-black text-slate-950">En attente de validation...</h3>
                <p className="text-xs text-slate-500 px-4 leading-relaxed font-medium">
                  Une notification de débit a été envoyée sur votre téléphone. 
                  Veuillez composer votre code secret PIN pour confirmer le paiement.
                </p>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 font-medium">
                  Ne fermez pas cette page. Nous vérifions le statut en temps réel.
                  {transactionId && <span className="block mt-2 font-mono text-[9px] opacity-75">Réf : {transactionId}</span>}
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center py-8 space-y-4 animate-scale-up">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl mx-auto shadow-sm">
                  ✓
                </div>
                <h3 className="text-xl font-black text-slate-950">Paiement validé !</h3>
                <p className="text-xs text-slate-500 px-4 leading-relaxed font-medium">
                  Félicitations, votre pack <strong>{selectedPack.name}</strong> a été activé avec succès.
                  {transactionId && <span className="block mt-2 text-[10px] text-slate-400 font-mono">Réf : {transactionId}</span>}
                </p>
                <button
                  onClick={() => {
                    setShowFedaModal(false)
                    navigate('/dashboard')
                  }}
                  className="w-full py-3 bg-[#1B3A6B] text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#152e56] transition-colors"
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
                <h3 className="text-xl font-black text-slate-950">Échec du paiement</h3>
                <p className="text-xs text-slate-500 px-4 leading-relaxed font-medium">
                  {errorMessage || "Le paiement n'a pas pu être validé ou a été annulé."}
                </p>
                <button
                  onClick={() => setPaymentStep('form')}
                  className="w-full py-3 bg-slate-100 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showStripeSuccess && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-150 p-8 relative">
            <button 
              onClick={() => {
                setShowStripeSuccess(false)
                navigate('/subscribe', { replace: true })
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors text-xl font-bold"
            >
              &times;
            </button>

            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl mx-auto shadow-sm">
                ✓
              </div>
              <h3 className="text-xl font-black text-slate-950">Abonnement validé !</h3>
              <p className="text-xs text-slate-500 px-4 leading-relaxed font-medium">
                Félicitations, votre abonnement a été activé avec succès. Vous avez désormais un accès complet selon votre formule.
                {stripeSessionId && <span className="block mt-2 text-[10px] text-slate-400 font-mono">Session : {stripeSessionId.substring(0, 20)}...</span>}
              </p>
              <button
                onClick={() => {
                  setShowStripeSuccess(false)
                  navigate('/dashboard')
                }}
                className="w-full py-3 bg-[#1B3A6B] text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#152e56] transition-colors"
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
