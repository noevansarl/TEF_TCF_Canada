import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

interface AffiliateRecord {
  id: string
  name: string
  code: string
  commission_rate: number
  total_clicks: number
  total_conversions: number
  total_earned_eur: number
  payment_method: string
  is_active: boolean
}

interface ConversionRecord {
  id: string
  created_at: string
  amount_eur: number
  commission_eur: number
  paid_at: string | null
}

export default function AffiliatePage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [affiliate, setAffiliate] = useState<AffiliateRecord | null>(null)
  const [conversions, setConversions] = useState<ConversionRecord[] | []>([])
  
  // Registration Form States
  const [partnerName, setPartnerName] = useState('')
  const [wantedCode, setWantedCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('paypal')
  const [registering, setRegistering] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  // Copy success feedback
  const [copySuccess, setCopySuccess] = useState(false)

  // Load affiliate details if logged in
  const loadAffiliateData = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!error && data && data.id) {
        setAffiliate(data as AffiliateRecord)
        
        // Fetch conversions
        const { data: convs } = await supabase
          .from('affiliate_conversions')
          .select('*')
          .eq('affiliate_id', data.id)
          .order('created_at', { ascending: false })

        if (convs) {
          setConversions(convs as ConversionRecord[])
        }
      } else {
        setAffiliate(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAffiliateData()
  }, [user])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setRegistering(true)
    setRegError(null)

    const cleanCode = wantedCode.toUpperCase().replace(/[^A-Z0-9]/g, '').trim()
    if (cleanCode.length < 3) {
      setRegError('Le code promotionnel doit contenir au moins 3 caractères alphanumériques.')
      setRegistering(false)
      return
    }

    try {
      // Check code uniqueness (would normally run server side, let's simulate)
      const { data: existing } = await supabase
        .from('affiliates')
        .select('id')
        .eq('code', cleanCode)
        .maybeSingle()

      if (existing && existing.id) {
        setRegError('Ce code est déjà utilisé par un autre partenaire. Veuillez en choisir un autre.')
        setRegistering(false)
        return
      }

      // Insert affiliate
      const { error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          name: partnerName || 'Partenaire Francophonie',
          email: user.email,
          code: cleanCode,
          payment_method: paymentMethod,
        })

      if (error) {
        setRegError(error.message || "Une erreur est survenue lors de l'enregistrement.")
      } else {
        // Reload details
        await loadAffiliateData()
      }
    } catch (err: any) {
      setRegError(err.message || 'Erreur interne.')
    } finally {
      setRegistering(false)
    }
  }

  const copyToClipboard = () => {
    if (!affiliate) return
    const link = `https://francophonie.academia?ref=${affiliate.code}`
    navigator.clipboard.writeText(link)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── 1. ÉTAT VISITEUR NON AUTHENTIFIÉ ──
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header */}
        <header className="bg-white border-b px-4 py-4 select-none">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-[#1B3A6B] font-extrabold text-sm uppercase tracking-wider">
              Francophonie Academia
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 font-bold transition-colors">
                ← Retour à l'accueil
              </Link>
              <Link to="/login?from=/affiliation" className="text-sm font-bold text-[#1B3A6B] hover:underline">
                Se connecter
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2E75B6] text-white py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Programme d'affiliation officiel
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              Recommandez Francophonie Academia & Gagnez 20%
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
              Aidez d'autres candidats à réussir leur TCF / TEF Canada et recevez une commission de 20% sur chaque vente générée grâce à votre lien unique.
            </p>
            <Link
              to="/register?from=/affiliation"
              className="inline-block bg-white text-[#1B3A6B] font-extrabold py-3 px-8 rounded-xl shadow-lg hover:bg-gray-100 transition-colors"
            >
              Rejoindre le programme →
            </Link>
          </div>
        </div>

        {/* Avantages */}
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-12">Pourquoi devenir partenaire ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '💰', title: 'Commissions attractives', desc: 'Touchez 20% de commission récurrente ou forfaitaire sur l\'ensemble de nos abonnements et packs à durée limitée.' },
              { emoji: '⏱️', title: 'Cookie de 30 jours', desc: 'Si un utilisateur clique sur votre lien et achète dans les 30 jours suivants, la commission vous est automatiquement attribuée.' },
              { emoji: '📊', title: 'Dashboard en temps réel', desc: 'Suivez vos clics, le taux de conversion et l\'historique de vos gains directement depuis votre espace personnel.' }
            ].map(col => (
              <div key={col.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center">
                <span className="text-4xl mb-3">{col.emoji}</span>
                <h3 className="font-bold text-gray-950 mb-2">{col.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{col.desc}</p>
              </div>
            ))}
          </div>

          {/* Fonctionnement */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mt-16">
            <h2 className="text-xl font-bold text-gray-950 mb-6 text-center">Comment ça fonctionne ?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <span className="text-lg font-bold text-[#1B3A6B]">1. Créez votre compte</span>
                <p className="text-gray-600 leading-relaxed">Inscrivez-vous gratuitement sur la plateforme et rejoignez le programme en 1 clic.</p>
              </div>
              <div className="space-y-2">
                <span className="text-lg font-bold text-[#1B3A6B]">2. Partagez votre lien</span>
                <p className="text-gray-600 leading-relaxed">Partagez votre lien affilié sur votre chaîne YouTube, vos réseaux sociaux ou dans des groupes de discussion.</p>
              </div>
              <div className="space-y-2">
                <span className="text-lg font-bold text-[#1B3A6B]">3. Recevez vos paiements</span>
                <p className="text-gray-600 leading-relaxed">Chaque mois, vos commissions accumulées sont versées par PayPal, virement bancaire ou Mobile Money.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── 2. ÉTAT AUTHENTIFIÉ MAIS NON INSCRIT À L'AFFILIATION ──
  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none mb-6">
            ← Retour au tableau de bord
          </Link>
          <div className="text-center mb-8 border-b pb-4">
            <span className="text-5xl">🤝</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2 mb-1">Rejoindre le Programme d'Affiliation</h1>
            <p className="text-gray-500">Devenez partenaire Francophonie Academia en quelques secondes.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            {regError && (
              <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-xs font-semibold text-center">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nom du Partenaire / Média</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chaîne YouTube Mamadou / Blog Immigration"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
                  value={partnerName}
                  onChange={e => setPartnerName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Code Promo Souhaité (Alphanumérique)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: MAMADOU15"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white uppercase"
                  value={wantedCode}
                  onChange={e => setWantedCode(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Ce code sera rattaché à votre lien et servira à identifier vos filleuls.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Moyen de paiement favori</label>
                <select
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Virement Bancaire (IBAN)</option>
                  <option value="mobile_money">Mobile Money (Orange, MTN, Wave)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3 bg-[#1B3A6B] hover:bg-[#152e56] text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {registering ? 'Inscription...' : '🚀 Activer mon compte affilié'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── 3. ÉTAT AFFILIÉ INSCRIT (DASHBOARD) ──
  const affiliateUrl = `https://francophonie.academia?ref=${affiliate.code}`
  const conversionRate = affiliate.total_clicks > 0
    ? ((affiliate.total_conversions / affiliate.total_clicks) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none mb-2">
          ← Retour au tableau de bord
        </Link>
        
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Espace Partenaire Affilié</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Bienvenue, <strong>{affiliate.name}</strong> · Code actif : <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">{affiliate.code}</span>
            </p>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Actif
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Clics sur le lien</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{affiliate.total_clicks}</span>
              <span className="text-xs text-gray-500">visites uniques</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Conversions</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1B3A6B]">{affiliate.total_conversions}</span>
              <span className="text-xs text-green-600 font-semibold">{conversionRate}% conv.</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Commissions accumulées</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">{affiliate.total_earned_eur.toFixed(2).replace('.', ',')} $ CAD</span>
              <span className="text-xs text-gray-500">taux : 20%</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Mode de versement</span>
            <div className="mt-2">
              <span className="font-bold text-sm text-gray-900 block capitalize">
                {affiliate.payment_method === 'bank_transfer' ? 'Virement Bancaire' : affiliate.payment_method === 'mobile_money' ? 'Mobile Money' : 'PayPal'}
              </span>
              <span className="text-xs text-gray-500">Versements mensuels</span>
            </div>
          </div>
        </div>

        {/* Link generator box */}
        <div className="bg-gradient-to-r from-[#1B3A6B] to-[#204a87] rounded-3xl p-6 text-white shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold">Votre Lien de Parrainage Affilié</h2>
            <p className="text-blue-150 text-xs mt-0.5">
              Partagez ce lien. Tout achat effectué dans les 30 jours vous octroie 20% de commission.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-mono text-white focus:outline-none"
              value={affiliateUrl}
            />
            <button
              onClick={copyToClipboard}
              className={`px-6 py-3 font-bold text-sm rounded-xl transition-all shadow-sm ${
                copySuccess ? 'bg-green-500 text-white' : 'bg-white text-[#1B3A6B] hover:bg-blue-50'
              }`}
            >
              {copySuccess ? 'Lien copié ! ✓' : 'Copier le lien'}
            </button>
          </div>
        </div>

        {/* Conversions Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 text-lg">Historique des conversions affiliés</h2>
            <span className="text-xs bg-gray-150 text-gray-600 font-bold px-2.5 py-1 rounded-full">
              {conversions.length} transaction{conversions.length > 1 ? 's' : ''}
            </span>
          </div>

          {conversions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Aucune conversion n'a été enregistrée pour le moment. Partagez votre lien pour commencer à accumuler des gains.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600 select-none text-xs tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">ID Conversion</th>
                    <th className="p-4 text-right">Montant de la vente</th>
                    <th className="p-4 text-right">Votre Commission (20%)</th>
                    <th className="p-4 text-center">Statut du versement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {conversions.map((conv) => (
                    <tr key={conv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        {new Date(conv.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-400">
                        {conv.id}
                      </td>
                      <td className="p-4 text-gray-800 font-semibold text-right">
                        {conv.amount_eur.toFixed(2).replace('.', ',')} $ CAD
                      </td>
                      <td className="p-4 font-bold text-emerald-600 text-right">
                        +{conv.commission_eur.toFixed(2).replace('.', ',')} $ CAD
                      </td>
                      <td className="p-4 text-center">
                        {conv.paid_at ? (
                          <span className="inline-block bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                            Payé le {new Date(conv.paid_at).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            En attente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
