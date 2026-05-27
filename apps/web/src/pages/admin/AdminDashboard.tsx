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
    <div className="space-y-8 font-sans">
      
      {/* Title */}
      <div className="select-none">
        <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Supervisez l'activité globale et gérez les corrections IA / Humaines.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <span className="text-3xl bg-blue-50 p-3.5 rounded-xl">👥</span>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Actifs (24h)</span>
            <span className="text-2xl font-extrabold text-gray-800">{stats.active_24h}</span>
            <span className="text-xs text-green-500 font-semibold block mt-0.5">+12% vs hier</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <span className="text-3xl bg-green-50 p-3.5 rounded-xl">💵</span>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">MRR Récurrent</span>
            <span className="text-2xl font-extrabold text-gray-800">{stats.mrr.toLocaleString('fr-FR')} $</span>
            <span className="text-xs text-green-500 font-semibold block mt-0.5">+8% ce mois</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <span className="text-3xl bg-purple-50 p-3.5 rounded-xl">📊</span>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Sessions (Aujourd'hui)</span>
            <span className="text-2xl font-extrabold text-gray-800">{stats.sessions_today}</span>
            <span className="text-xs text-green-500 font-semibold block mt-0.5">+25% d'activité</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <span className="text-3xl bg-orange-50 p-3.5 rounded-xl">✍️</span>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">En attente Expert</span>
            <span className="text-2xl font-extrabold text-gray-800">{stats.pending_corrections}</span>
            <span className="text-xs text-orange-500 font-semibold block mt-0.5">SLA critique: 48h</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Expert Correction Queue */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="border-b pb-3 flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-gray-800">✍️ File d'Expression Écrite / Orale</h3>
            <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded">Corrections requises</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-extrabold">
                  <th className="py-3">Candidat</th>
                  <th className="py-3">Épreuve</th>
                  <th className="py-3">Soumis le</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {pendingCorrections.map((pc) => (
                  <tr key={pc.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold">{pc.user_name}</td>
                    <td className="py-3">
                      <span className="font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mr-1.5">{pc.module}</span>
                      <span className="text-xs text-gray-500">{pc.test_type === 'TEF_CANADA' ? 'TEF' : 'TCF'}</span>
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {new Date(pc.submitted_at).toLocaleDateString('fr-FR')} {new Date(pc.submitted_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                        pc.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {pc.status === 'waiting' ? 'En attente' : 'Assigné'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => alert(`Correction de l'exercice pour ${pc.user_name} (Simulation Expert)`)}
                        className="text-xs bg-[#1B3A6B] hover:bg-[#12274A] text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
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
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-extrabold text-lg text-gray-800">📊 Activité Récente</h3>
          </div>
          
          <div className="space-y-4">
            {recentSessions.map((rs) => (
              <div key={rs.id} className="flex justify-between items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-gray-800 block">{rs.user_name}</span>
                  <span className="text-xs text-gray-400">
                    Session · {rs.module.startsWith('FULL_') ? 'Simulation' : rs.module} · {rs.test_type === 'TEF_CANADA' ? 'TEF' : 'TCF'}
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                  rs.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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
