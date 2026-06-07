import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

interface CorrectionItem {
  id: string
  module: 'EE' | 'EO'
  test_type: 'TCF_CANADA' | 'TEF_CANADA'
  status: 'pending' | 'assigned' | 'in_review' | 'completed' | 'disputed'
  priority: 'low' | 'normal' | 'high'
  created_at: string
  due_at: string
  user: {
    full_name: string
    email: string
  }
}

export default function ExpertDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'pending' | 'my_tasks'>('pending')
  const [pendingItems, setPendingItems] = useState<CorrectionItem[]>([])
  const [myTasks, setMyTasks] = useState<CorrectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      // 1. File d'attente (status = 'pending')
      const { data: pendingData, error: pendingErr } = await supabase
        .from('expert_corrections')
        .select(`
          id,
          module,
          test_type,
          status,
          priority,
          created_at,
          due_at,
          user:user_id ( full_name, email )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (pendingErr) throw pendingErr

      // 2. Mes tâches assignées (status = 'assigned' ou 'in_review' ET expert_id = mon_id)
      const { data: myData, error: myErr } = await supabase
        .from('expert_corrections')
        .select(`
          id,
          module,
          test_type,
          status,
          priority,
          created_at,
          due_at,
          user:user_id ( full_name, email )
        `)
        .eq('expert_id', user.id)
        .in('status', ['assigned', 'in_review'])
        .order('due_at', { ascending: true })

      if (myErr) throw myErr

      setPendingItems((pendingData || []) as any)
      setMyTasks((myData || []) as any)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Une erreur est survenue lors du chargement.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [user])

  const handleClaim = async (itemId: string) => {
    if (!user) return
    setActionLoading(itemId)
    try {
      const { error: claimErr } = await supabase
        .from('expert_corrections')
        .update({
          expert_id: user.id,
          status: 'assigned',
          assigned_at: new Date().toISOString(),
          due_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString() // SLA 48h par défaut
        })
        .eq('id', itemId)
        .eq('status', 'pending') // Double-check race condition

      if (claimErr) throw claimErr

      // Refresh listings
      await fetchItems()
      // Rediriger vers l'éditeur de correction
      navigate(`/expert/correct/${itemId}`)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Erreur lors de l'assignation du test.")
    } finally {
      setActionLoading(null)
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200/50'
      case 'normal':
        return 'bg-blue-50 text-blue-700 border-blue-200/50'
      default:
        return 'bg-slate-100 text-slate-650 border-slate-200/50'
    }
  }

  const getModuleBadgeColor = (module: string) => {
    return module === 'EE'
      ? 'bg-purple-50 text-purple-700 border-purple-200/50'
      : 'bg-orange-50 text-orange-700 border-orange-200/50'
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8 select-text">
      <div className="select-none">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Tableau de Bord de <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Correction</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1.5">
          Gerez la file d'attente et évaluez les épreuves d'Expression Écrite et Orale.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex bg-white/50 border border-slate-200/50 p-1 rounded-2xl max-w-md select-none">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'pending'
              ? 'bg-[#1B3A6B] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          File d'attente ({pendingItems.length})
        </button>
        <button
          onClick={() => setActiveTab('my_tasks')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'my_tasks'
              ? 'bg-[#1B3A6B] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Mes corrections ({myTasks.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <svg className="animate-spin w-8 h-8 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          {/* Active Tab View */}
          {activeTab === 'pending' ? (
            pendingItems.length === 0 ? (
              <div className="p-16 text-center text-slate-400 select-none">
                <span className="text-5xl block mb-4 animate-bounce">🎉</span>
                <p className="font-bold text-slate-800 text-lg">Aucune copie en attente de correction !</p>
                <p className="text-xs text-slate-500 mt-1">Revenez plus tard pour de nouvelles soumissions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-extrabold bg-slate-50/40">
                      <th className="py-4.5 px-6">Candidat</th>
                      <th className="py-4.5 px-6">Type d'épreuve</th>
                      <th className="py-4.5 px-6">Soumis le</th>
                      <th className="py-4.5 px-6">Priorité</th>
                      <th className="py-4.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 text-slate-700">
                    {pendingItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">{item.user?.full_name || 'Candidat Anonyme'}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border mr-2 uppercase ${getModuleBadgeColor(item.module)}`}>
                            {item.module}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.test_type === 'TEF_CANADA' ? 'TEF Canada' : 'TCF Canada'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-medium">{formatDate(item.created_at)}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${getPriorityBadgeColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleClaim(item.id)}
                            disabled={actionLoading !== null}
                            className="text-xs bg-[#1B3A6B] hover:bg-[#12274A] text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {actionLoading === item.id ? 'Assignation...' : "S'assigner & Corriger"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            myTasks.length === 0 ? (
              <div className="p-16 text-center text-slate-400 select-none">
                <span className="text-5xl block mb-4">📋</span>
                <p className="font-bold text-slate-800 text-lg">Vous n'avez aucune correction en cours.</p>
                <p className="text-xs text-slate-500 mt-1">Attribuez-vous des tâches depuis l'onglet "File d'attente".</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-extrabold bg-slate-50/40">
                      <th className="py-4.5 px-6">Candidat</th>
                      <th className="py-4.5 px-6">Type d'épreuve</th>
                      <th className="py-4.5 px-6">Écheance SLA</th>
                      <th className="py-4.5 px-6">Statut</th>
                      <th className="py-4.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 text-slate-700">
                    {myTasks.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">{item.user?.full_name || 'Candidat Anonyme'}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border mr-2 uppercase ${getModuleBadgeColor(item.module)}`}>
                            {item.module}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.test_type === 'TEF_CANADA' ? 'TEF Canada' : 'TCF Canada'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-amber-600 font-bold">
                          ⏱️ {formatDate(item.due_at)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                            item.status === 'in_review' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 'bg-blue-50 text-blue-700 border-blue-200/50'
                          }`}>
                            {item.status === 'in_review' ? 'En cours' : 'Assigné'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/expert/correct/${item.id}`}
                            className="inline-block text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Évaluer la copie
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
