import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Affiliate {
  id: string
  user_id: string | null
  name: string
  email: string
  code: string
  commission_rate: number
  payment_method: string | null
  total_clicks: number
  total_conversions: number
  total_earned_eur: number
  is_active: boolean
  created_at: string
}

interface Conversion {
  id: string
  affiliate_id: string
  converted_user_id: string
  amount_eur: number
  commission_eur: number
  paid_at: string | null
  created_at: string
  affiliates?: {
    name: string
    code: string
  }
}

interface User {
  id: string
  full_name: string | null
  email: string
}

export default function AffiliateManager() {
  const [activeTab, setActiveTab] = useState<'partners' | 'conversions'>('partners')
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')

  // Edit states
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // New partner form modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPartnerUserId, setNewPartnerUserId] = useState('')
  const [newPartnerName, setNewPartnerName] = useState('')
  const [newPartnerCode, setNewPartnerCode] = useState('')
  const [newPartnerCommission, setNewPartnerCommission] = useState(0.20)
  const [newPartnerPaymentMethod, setNewPartnerPaymentMethod] = useState('paypal')
  const [newPartnerEmail, setNewPartnerEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Load dashboard data
  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch affiliates
      const { data: affs, error: affErr } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!affErr && affs) {
        setAffiliates(affs as Affiliate[])
      }

      // Fetch conversions
      const { data: convs, error: convErr } = await supabase
        .from('affiliate_conversions')
        .select(`
          id,
          affiliate_id,
          converted_user_id,
          amount_eur,
          commission_eur,
          paid_at,
          created_at,
          affiliates (
            name,
            code
          )
        `)
        .order('created_at', { ascending: false })

      if (!convErr && convs) {
        setConversions(convs as unknown as Conversion[])
      }

      // Fetch users for binding dropdown
      const { data: usrList } = await supabase
        .from('users')
        .select('id, full_name, email')
      
      if (usrList) {
        setUsers(usrList as User[])
      }

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto-fill email and name if user_id is chosen
  useEffect(() => {
    if (newPartnerUserId) {
      const selectedUser = users.find(u => u.id === newPartnerUserId)
      if (selectedUser) {
        setNewPartnerEmail(selectedUser.email)
        setNewPartnerName(selectedUser.full_name || '')
      }
    }
  }, [newPartnerUserId, users])

  // Handle updates
  const handleUpdateStatus = async (affId: string, currentStatus: boolean) => {
    setUpdatingId(affId)
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ is_active: !currentStatus })
        .eq('id', affId)

      if (!error) {
        setAffiliates(prev =>
          prev.map(a => (a.id === affId ? { ...a, is_active: !currentStatus } : a))
        )
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUpdateCommission = async (affId: string, rate: number) => {
    setUpdatingId(affId)
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ commission_rate: rate })
        .eq('id', affId)

      if (!error) {
        setAffiliates(prev =>
          prev.map(a => (a.id === affId ? { ...a, commission_rate: rate } : a))
        )
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  // Handle manual payout
  const handleMarkAsPaid = async (convId: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_conversions')
        .update({ paid_at: new Date().toISOString() })
        .eq('id', convId)

      if (!error) {
        setConversions(prev =>
          prev.map(c => (c.id === convId ? { ...c, paid_at: new Date().toISOString() } : c))
        )
        // Refresh affiliate totals
        loadData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Create new affiliate account
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    const cleanCode = newPartnerCode.toUpperCase().replace(/[^A-Z0-9]/g, '').trim()
    if (cleanCode.length < 3) {
      setFormError('Le code promo doit comporter au moins 3 caractères alphanumériques.')
      setSubmitting(false)
      return
    }

    if (!newPartnerEmail) {
      setFormError("L'adresse email est requise.")
      setSubmitting(false)
      return
    }

    try {
      // Check code uniqueness
      const { data: existing } = await supabase
        .from('affiliates')
        .select('id')
        .eq('code', cleanCode)
        .maybeSingle()

      if (existing && existing.id) {
        setFormError('Ce code promotionnel est déjà utilisé par un autre affilié.')
        setSubmitting(false)
        return
      }

      // Check user uniqueness
      if (newPartnerUserId) {
        const { data: existingUser } = await supabase
          .from('affiliates')
          .select('id')
          .eq('user_id', newPartnerUserId)
          .maybeSingle()

        if (existingUser && existingUser.id) {
          setFormError('Cet utilisateur est déjà enregistré en tant que partenaire.')
          setSubmitting(false)
          return
        }
      }

      const { error } = await supabase
        .from('affiliates')
        .insert({
          user_id: newPartnerUserId || null,
          name: newPartnerName || 'Nouveau Partenaire',
          email: newPartnerEmail,
          code: cleanCode,
          commission_rate: newPartnerCommission,
          payment_method: newPartnerPaymentMethod,
          is_active: true
        })

      if (error) {
        setFormError(error.message)
      } else {
        setShowAddModal(false)
        setNewPartnerUserId('')
        setNewPartnerName('')
        setNewPartnerCode('')
        setNewPartnerCommission(0.20)
        setNewPartnerPaymentMethod('paypal')
        setNewPartnerEmail('')
        loadData()
      }
    } catch (err: any) {
      setFormError(err.message || 'Erreur interne.')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate stats
  const totalClicks = affiliates.reduce((sum, a) => sum + (a.total_clicks || 0), 0)
  const totalConversions = affiliates.reduce((sum, a) => sum + (a.total_conversions || 0), 0)
  
  const conversionsPaid = conversions.filter(c => c.paid_at !== null)
  const conversionsPending = conversions.filter(c => c.paid_at === null)

  const commissionPaid = conversionsPaid.reduce((sum, c) => sum + (c.commission_eur || 0), 0)
  const commissionPending = conversionsPending.reduce((sum, c) => sum + (c.commission_eur || 0), 0)
  const totalEarned = conversions.reduce((sum, c) => sum + (c.commission_eur || 0), 0)

  // Filter affiliates
  const filteredAffiliates = affiliates.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && a.is_active) ||
      (statusFilter === 'suspended' && !a.is_active)

    return matchesSearch && matchesStatus
  })

  // Conversion lookup details
  const getAffiliateNameForConversion = (c: Conversion) => {
    if (c.affiliates) {
      return `${c.affiliates.name} (${c.affiliates.code})`
    }
    const matchingAff = affiliates.find(a => a.id === c.affiliate_id)
    return matchingAff ? `${matchingAff.name} (${matchingAff.code})` : 'Inconnu'
  }

  if (loading && affiliates.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <svg className="animate-spin w-8 h-8 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-text">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">
            Gestion de l'<span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Affiliation</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1.5">
            Supervisez vos affiliés, ajustez les commissions et gérez les virements mensuels.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-[#1B3A6B] to-indigo-600 hover:from-[#152e56] hover:to-indigo-700 text-white font-extrabold text-sm px-5 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          ➕ Ajouter un Partenaire
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <span className="text-3.5xl bg-blue-50 p-3.5 rounded-2xl">🔗</span>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Visites Partenaires</span>
            <span className="text-2xl font-black text-slate-800 font-display mt-0.5 block">{totalClicks}</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">clics totaux sur liens ref</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <span className="text-3.5xl bg-purple-50 p-3.5 rounded-2xl">🎯</span>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Conversions</span>
            <span className="text-2xl font-black text-slate-800 font-display mt-0.5 block">{totalConversions}</span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
              {totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0'}% de conversion
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <span className="text-3.5xl bg-amber-50 p-3.5 rounded-2xl">⏳</span>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Commissions Dues</span>
            <span className="text-2xl font-black text-amber-700 font-display mt-0.5 block">{commissionPending.toFixed(2)} $</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">en attente de règlement</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <span className="text-3.5xl bg-emerald-50 p-3.5 rounded-2xl">✅</span>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Commissions Payées</span>
            <span className="text-2xl font-black text-emerald-600 font-display mt-0.5 block">{commissionPaid.toFixed(2)} $</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">sur {totalEarned.toFixed(2)} $ accumulés</span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 select-none">
          <button
            onClick={() => setActiveTab('partners')}
            className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'partners'
                ? 'border-[#1B3A6B] text-[#1B3A6B] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🤝 Liste des Partenaires ({affiliates.length})
          </button>
          <button
            onClick={() => setActiveTab('conversions')}
            className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'conversions'
                ? 'border-[#1B3A6B] text-[#1B3A6B] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            💸 Conversions & Versements ({conversions.length})
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6">
          
          {/* TAB 1: PARTNERS */}
          {activeTab === 'partners' && (
            <div className="space-y-6">
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="max-w-md flex-1 relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom, email ou code..."
                    className="w-full px-5 py-3 pl-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all text-sm text-slate-700 bg-slate-50/50 focus:bg-white font-medium"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-bold uppercase select-none">Statut</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs text-slate-600 bg-white font-semibold cursor-pointer hover:bg-slate-50"
                  >
                    <option value="all">Tous les partenaires</option>
                    <option value="active">Actifs seulement</option>
                    <option value="suspended">Suspendus seulement</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-450 text-[11px] uppercase font-black tracking-wider select-none">
                      <th className="py-3">Partenaire / Code</th>
                      <th className="py-3">Moyen de paiement</th>
                      <th className="py-3 text-center">Commission %</th>
                      <th className="py-3 text-center">Clics</th>
                      <th className="py-3 text-center">Conversions</th>
                      <th className="py-3 text-right">Gains totaux</th>
                      <th className="py-3 text-center">Statut</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 text-slate-700">
                    {filteredAffiliates.map((aff) => (
                      <tr key={aff.id} className={`hover:bg-slate-50/40 transition-colors ${!aff.is_active ? 'opacity-70 bg-slate-50/10' : ''}`}>
                        
                        {/* Name & Code */}
                        <td className="py-4 font-sans">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 text-sm block">{aff.name || 'Sans Nom'}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-400">{aff.email}</span>
                              <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-black tracking-wider">{aff.code}</span>
                            </div>
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 text-xs font-semibold text-slate-500 capitalize">
                          {aff.payment_method === 'bank_transfer' ? 'Virement IBAN' : aff.payment_method === 'mobile_money' ? 'Mobile Money' : 'PayPal'}
                        </td>

                        {/* Editable Commission Rate */}
                        <td className="py-4 text-center">
                          <select
                            disabled={updatingId === aff.id}
                            value={aff.commission_rate}
                            onChange={(e) => handleUpdateCommission(aff.id, Number(e.target.value))}
                            className="px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs font-bold text-slate-700 bg-white"
                          >
                            <option value="0.10">10%</option>
                            <option value="0.15">15%</option>
                            <option value="0.20">20%</option>
                            <option value="0.25">25%</option>
                            <option value="0.30">30%</option>
                            <option value="0.40">40%</option>
                            <option value="0.50">50%</option>
                          </select>
                        </td>

                        {/* Clics */}
                        <td className="py-4 text-center font-bold text-slate-700">{aff.total_clicks || 0}</td>

                        {/* Conversions */}
                        <td className="py-4 text-center font-bold text-slate-700">
                          {aff.total_conversions || 0}
                          <span className="text-[10px] text-slate-450 block font-medium">
                            {aff.total_clicks > 0 ? ((aff.total_conversions / aff.total_clicks) * 100).toFixed(1) : '0.0'}%
                          </span>
                        </td>

                        {/* Gains */}
                        <td className="py-4 text-right font-bold text-emerald-600">
                          {(aff.total_earned_eur || 0).toFixed(2)} $
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 text-center select-none">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                            aff.is_active
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {aff.is_active ? 'Actif' : 'Suspendu'}
                          </span>
                        </td>

                        {/* Enable/Disable Toggle */}
                        <td className="py-4 text-right">
                          <button
                            disabled={updatingId === aff.id}
                            onClick={() => handleUpdateStatus(aff.id, aff.is_active)}
                            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm ${
                              aff.is_active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100'
                            }`}
                          >
                            {aff.is_active ? 'Suspendre' : 'Réactiver'}
                          </button>
                        </td>

                      </tr>
                    ))}
                    {filteredAffiliates.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 font-semibold italic">
                          Aucun affilié trouvé dans cette liste.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CONVERSIONS & PAYOUTS */}
          {activeTab === 'conversions' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-450 text-[11px] uppercase font-black tracking-wider select-none">
                      <th className="py-3">Date</th>
                      <th className="py-3">Partenaire Référant</th>
                      <th className="py-3 text-right">Montant Vente</th>
                      <th className="py-3 text-right">Commission Due</th>
                      <th className="py-3 text-center">Versement</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 text-slate-700">
                    {conversions.map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-50/40 transition-colors">
                        
                        {/* Date */}
                        <td className="py-4 text-slate-500 font-medium text-xs whitespace-nowrap">
                          {new Date(conv.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>

                        {/* Affiliate partner */}
                        <td className="py-4 font-bold text-slate-800">
                          {getAffiliateNameForConversion(conv)}
                        </td>

                        {/* Sale Amount */}
                        <td className="py-4 text-right font-semibold text-slate-600">
                          {conv.amount_eur.toFixed(2)} $
                        </td>

                        {/* Commission Amount */}
                        <td className="py-4 text-right font-bold text-emerald-600">
                          +{conv.commission_eur.toFixed(2)} $
                        </td>

                        {/* Payout Status */}
                        <td className="py-4 text-center select-none">
                          {conv.paid_at ? (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-green-200">
                              ✓ Réglé le {new Date(conv.paid_at).toLocaleDateString('fr-FR')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                              ⏳ En attente
                            </span>
                          )}
                        </td>

                        {/* Actions: Mark as Paid */}
                        <td className="py-4 text-right">
                          {!conv.paid_at ? (
                            <button
                              onClick={() => handleMarkAsPaid(conv.id)}
                              className="text-xs bg-[#1B3A6B] hover:bg-[#12274A] text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                              Confirmer le Paiement
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold italic select-none">Aucune action</span>
                          )}
                        </td>

                      </tr>
                    ))}
                    {conversions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold italic">
                          Aucune conversion enregistrée pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none">
          {/* Overlay */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          
          {/* Content */}
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden z-10 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-800 font-display">➕ Nouveau Partenaire Affilié</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-lg transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 border border-red-100 p-3.5 rounded-xl text-xs font-semibold text-center select-text">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="space-y-4">
              
              {/* Optional User association */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Associer à un Utilisateur Existant (Optionnel)
                </label>
                <select
                  value={newPartnerUserId}
                  onChange={(e) => setNewPartnerUserId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-800 bg-white"
                >
                  <option value="">-- Aucun (Partenaire Externe) --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || 'Sans Nom'} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Partner Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nom du Partenaire / Média
                </label>
                <input
                  type="text"
                  required
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="Ex: YouTube Mamadou / Blog TCF"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-800 bg-white"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Adresse Email de Contact
                </label>
                <input
                  type="email"
                  required
                  value={newPartnerEmail}
                  onChange={(e) => setNewPartnerEmail(e.target.value)}
                  placeholder="Ex: contact@mamadou.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Code promo */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Code Promo (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartnerCode}
                    onChange={(e) => setNewPartnerCode(e.target.value)}
                    placeholder="Ex: MAMADOU20"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-800 bg-white uppercase font-bold"
                  />
                </div>

                {/* Taux commission */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Taux de Commission
                  </label>
                  <select
                    value={newPartnerCommission}
                    onChange={(e) => setNewPartnerCommission(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-800 bg-white font-bold"
                  >
                    <option value="0.10">10%</option>
                    <option value="0.15">15%</option>
                    <option value="0.20">20% (Défaut)</option>
                    <option value="0.25">25%</option>
                    <option value="0.30">30%</option>
                    <option value="0.40">40%</option>
                    <option value="0.50">50%</option>
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Moyen de Paiement Préféré
                </label>
                <select
                  value={newPartnerPaymentMethod}
                  onChange={(e) => setNewPartnerPaymentMethod(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-slate-800 bg-white"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Virement Bancaire (IBAN)</option>
                  <option value="mobile_money">Mobile Money (Orange, MTN, Wave)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-[#1B3A6B] to-indigo-600 hover:from-[#152e56] hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
