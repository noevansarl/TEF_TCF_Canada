import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

interface HistoryItem {
  id: string
  module: 'EE' | 'EO'
  test_type: 'TCF_CANADA' | 'TEF_CANADA'
  global_score: number
  completed_at: string
  user: {
    full_name: string
    email: string
  }
}

export default function ExpertHistory() {
  const { user } = useAuthStore()
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        const { data, error: fetchErr } = await supabase
          .from('expert_corrections')
          .select(`
            id,
            module,
            test_type,
            global_score,
            completed_at,
            user:user_id ( full_name, email )
          `)
          .eq('expert_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })

        if (fetchErr) throw fetchErr
        setHistoryItems((data || []) as any)
      } catch (err: unknown) {
        console.error(err)
        setError((err as Error).message || "Erreur lors du chargement de l'historique.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user])

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
          Historique des <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Évaluations</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1.5">
          Consultez l'historique complet de vos corrections finalisées.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <svg className="animate-spin w-8 h-8 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          {historyItems.length === 0 ? (
            <div className="p-16 text-center text-slate-400 select-none">
              <span className="text-5xl block mb-4">📜</span>
              <p className="font-bold text-slate-800 text-lg">Vous n'avez pas encore finalisé de correction.</p>
              <p className="text-xs text-slate-500 mt-1">Les corrections terminées s'afficheront ici.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-extrabold bg-slate-50/40">
                    <th className="py-4.5 px-6">Candidat</th>
                    <th className="py-4.5 px-6">Type d'épreuve</th>
                    <th className="py-4.5 px-6">Date de correction</th>
                    <th className="py-4.5 px-6 text-center">Score attribué</th>
                    <th className="py-4.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 text-slate-700">
                  {historyItems.map((item) => (
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
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">{formatDate(item.completed_at)}</td>
                      <td className="py-4 px-6 text-center font-bold text-[#1B3A6B] text-base">
                        {item.global_score} / 100
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/expert/correct/${item.id}`}
                          className="inline-block text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all border border-slate-200/60 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Consulter
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
