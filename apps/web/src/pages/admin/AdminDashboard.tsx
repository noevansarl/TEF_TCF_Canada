import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    active_24h: 124,
    mrr: 3840,
    sessions_today: 45,
    pending_corrections: 3
  })
  const [pendingCorrections, setPendingCorrections] = useState<any[]>([])
  const [recentSessions, setRecentSessions] = useState<any[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        // In real app, you would query multiple tables. Here we resolve via mock.
        const { data: usersData } = await supabase.from('users').select('*')
        const { data: sessionsData } = await supabase.from('sessions').select('*')

        // Mock pending corrections
        setPendingCorrections([
          { id: 'c-1', user_name: 'Alioune Diop', test_type: 'TCF_CANADA', module: 'EE', submitted_at: new Date(Date.now() - 3600000).toISOString(), status: 'waiting' },
          { id: 'c-2', user_name: 'Marie Dupont', test_type: 'TEF_CANADA', module: 'EO', submitted_at: new Date(Date.now() - 7200000).toISOString(), status: 'waiting' },
          { id: 'c-3', user_name: 'Candidat ayePREP', test_type: 'TCF_CANADA', module: 'EE', submitted_at: new Date(Date.now() - 14400000).toISOString(), status: 'assigned' }
        ])

        // Mock recent sessions
        setRecentSessions([
          { id: 's-101', user_name: 'Marie Dupont', test_type: 'TEF_CANADA', module: 'FULL_TEF', status: 'in_progress', started_at: new Date().toISOString() },
          { id: 's-102', user_name: 'Alioune Diop', test_type: 'TCF_CANADA', module: 'CO', status: 'completed', started_at: new Date(Date.now() - 1800000).toISOString() },
          { id: 's-103', user_name: 'Candidat ayePREP', test_type: 'TCF_CANADA', module: 'FULL_TCF', status: 'completed', started_at: new Date(Date.now() - 7200000).toISOString() }
        ])

        if (usersData && sessionsData) {
          // Adjust stats based on mock counts
          setStats({
            active_24h: usersData.length * 28 + 14,
            mrr: usersData.filter((u: any) => u.subscription_tier !== 'gratuit').length * 29 + 1240,
            sessions_today: sessionsData.length + 32,
            pending_corrections: 3
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <svg className="animate-spin w-8 h-8 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-text">
      {/* Title */}
      <div className="select-none">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">
          Admin <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Dashboard</span>
        </h1>
        <p className="text-slate-550 font-medium mt-1.5">
          Supervisez l'activité globale et gérez les corrections IA / Humaines.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {/* Card 1 */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:border-blue-500/20 hover:shadow-md transition-all">
          <span className="text-3.5xl bg-blue-50 p-3.5 rounded-2xl">👥</span>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Actifs (24h)</span>
            <span className="text-2xl font-black text-slate-800 font-display mt-0.5 block">{stats.active_24h}</span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">+12% vs hier</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:border-emerald-500/20 hover:shadow-md transition-all">
          <span className="text-3.5xl bg-emerald-50 p-3.5 rounded-2xl">💵</span>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">MRR Récurrent</span>
            <span className="text-2xl font-black text-slate-800 font-display mt-0.5 block">{stats.mrr.toLocaleString('fr-FR')} $</span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">+8% ce mois</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:border-purple-500/20 hover:shadow-md transition-all">
          <span className="text-3.5xl bg-purple-50 p-3.5 rounded-2xl">📊</span>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Sessions (Auj)</span>
            <span className="text-2xl font-black text-slate-800 font-display mt-0.5 block">{stats.sessions_today}</span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">+25% d'activité</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:border-orange-500/20 hover:shadow-md transition-all">
          <span className="text-3.5xl bg-orange-50 p-3.5 rounded-2xl">✍️</span>
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">En attente Expert</span>
            <span className="text-2xl font-black text-slate-800 font-display mt-0.5 block">{stats.pending_corrections}</span>
            <span className="text-[11px] text-amber-600 font-bold block mt-0.5">SLA: 48h</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expert Correction Queue */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-3.5 flex justify-between items-center select-none">
            <h3 className="font-extrabold text-base text-slate-800 font-display">✍️ File d'Expression Écrite / Orale</h3>
            <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-2.5 py-0.5 rounded-full border border-orange-200/40 uppercase">Corrections requises</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-450 text-[11px] uppercase font-black tracking-wider">
                  <th className="py-3">Candidat</th>
                  <th className="py-3">Épreuve</th>
                  <th className="py-3">Soumis le</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-slate-700">
                {pendingCorrections.map((pc) => (
                  <tr key={pc.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 font-bold text-slate-800">{pc.user_name}</td>
                    <td className="py-3.5">
                      <span className="font-extrabold text-[10px] bg-purple-50 text-purple-700 border border-purple-250/50 px-2 py-0.5 rounded mr-1.5 uppercase">{pc.module}</span>
                      <span className="text-xs text-slate-500">{pc.test_type === 'TEF_CANADA' ? 'TEF' : 'TCF'}</span>
                    </td>
                    <td className="py-3.5 text-xs text-slate-500 font-medium">
                      {new Date(pc.submitted_at).toLocaleDateString('fr-FR')} {new Date(pc.submitted_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                        pc.status === 'waiting' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 'bg-blue-50 text-blue-700 border-blue-200/50'
                      }`}>
                        {pc.status === 'waiting' ? 'En attente' : 'Assigné'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => alert(`Correction de l'exercice pour ${pc.user_name} (Simulation Expert)`)}
                        className="text-xs bg-[#1B3A6B] hover:bg-[#12274A] text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Évaluer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Session Actions */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3.5 select-none">
            <h3 className="font-extrabold text-base text-slate-800 font-display">📊 Activité Récente</h3>
          </div>
          
          <div className="space-y-3.5">
            {recentSessions.map((rs) => (
              <div key={rs.id} className="flex justify-between items-center gap-3 p-3 rounded-2xl border border-slate-100/60 hover:bg-slate-50/60 hover:border-slate-200/40 transition-all select-none">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-slate-800 block">{rs.user_name}</span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Session · {rs.module.startsWith('FULL_') ? 'Simulation' : rs.module} · {rs.test_type === 'TEF_CANADA' ? 'TEF' : 'TCF'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                  rs.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-250/50' : 'bg-blue-50 text-blue-700 border-blue-200/50'
                }`}>
                  {rs.status === 'completed' ? 'Fini' : 'En cours'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
