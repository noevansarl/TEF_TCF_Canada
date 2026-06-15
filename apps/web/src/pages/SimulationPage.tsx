import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SimulationPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleStartSimulation = async (isTef: boolean) => {
    setLoading(true)
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const userId = userRes.user?.id || 'mock-user-id'

      const testType = isTef ? 'TEF_CANADA' : 'TCF_CANADA'
      const moduleType = isTef ? 'FULL_TEF' : 'FULL_TCF'

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          module: moduleType,
          session_type: 'SIMULATION',
          test_type: testType,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          max_duration_s: isTef ? 11700 : 8520
        })
        .select()
        .single()

      if (error || !data) {
        // Fallback for mock client or DB offline
        const mockId = isTef ? 'simulation-tef-session' : 'simulation-tcf-session'
        navigate(`/session/${mockId}`)
      } else {
        navigate(`/session/${data.id}`)
      }
    } catch (e) {
      console.error(e)
      const mockId = isTef ? 'simulation-tef-session' : 'simulation-tcf-session'
      navigate(`/session/${mockId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans text-slate-100 relative overflow-hidden pb-16">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-blue-450 hover:text-blue-300 font-bold transition-colors select-none mb-4">
          ← Retour au tableau de bord
        </Link>
        
        {/* Header */}
        <div className="text-center space-y-3 select-none">
          <span className="inline-block bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-orange-500/20">
            Mode Examen Réel
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-display">
            Simulations Officielles
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
            Évaluez votre niveau réel sous les contraintes exactes des épreuves officielles. Plein écran forcé et minuteur bloquant.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-6 bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-3xl shadow-xl">
            <svg className="animate-spin w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-slate-350 font-semibold text-sm">Préparation de la session de simulation...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card TCF Canada */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-8 shadow-xl flex flex-col justify-between hover:border-slate-700/85 transition-all hover:scale-[1.01] hover:shadow-blue-900/5">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-white font-display">TCF Canada</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Test de Connaissance du Français</p>
                  </div>
                  <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-450 font-extrabold px-3 py-1.5 rounded-xl">2h22</span>
                </div>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex justify-between border-b border-slate-850/60 pb-2.5">
                    <span className="text-slate-300">Compréhension de l'Oral (CO)</span>
                    <span className="text-slate-450 font-medium">35 min (39 questions)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850/60 pb-2.5">
                    <span className="text-slate-300">Compréhension des Écrits (CE)</span>
                    <span className="text-slate-450 font-medium">35 min (39 questions)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850/60 pb-2.5">
                    <span className="text-slate-300">Expression Écrite (EE)</span>
                    <span className="text-slate-450 font-medium">60 min (3 tâches)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850/60 pb-2.5">
                    <span className="text-slate-300">Expression Orale (EO)</span>
                    <span className="text-slate-450 font-medium">12 min (3 tâches)</span>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl text-xs text-amber-400 leading-relaxed font-semibold">
                  ⚠️ <strong>Exigences :</strong> Plein écran strict. Pas de possibilité de revenir en arrière entre les modules. Vos réponses orales seront retranscrites et notées par l'IA.
                </div>
              </div>

              <button
                onClick={() => handleStartSimulation(false)}
                className="w-full py-4 mt-8 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-xl shadow-blue-500/10 active:scale-[0.99] transition-all cursor-pointer"
              >
                Lancer la Simulation TCF →
              </button>
            </div>

            {/* Card TEF Canada */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-8 shadow-xl flex flex-col justify-between hover:border-slate-700/85 transition-all hover:scale-[1.01] hover:shadow-orange-900/5">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-white font-display">TEF Canada</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Test d'Évaluation de Français</p>
                  </div>
                  <span className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 font-extrabold px-3 py-1.5 rounded-xl">3h15</span>
                </div>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex justify-between border-b border-slate-850/60 pb-2.5">
                    <span className="text-slate-300">Compréhension de l'Oral (CO)</span>
                    <span className="text-slate-450 font-medium">40 min (40 questions)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850/60 pb-2.5">
                    <span className="text-slate-300">Compréhension des Écrits (CE)</span>
                    <span className="text-slate-450 font-medium">60 min (50 questions)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850/60 pb-2.5">
                    <span className="text-slate-300">Expression Écrite (EE)</span>
                    <span className="text-slate-450 font-medium">60 min (2 tâches)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850/60 pb-2.5">
                    <span className="text-slate-300">Expression Orale (EO)</span>
                    <span className="text-slate-450 font-medium">35 min (2 tâches)</span>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl text-xs text-amber-400 leading-relaxed font-semibold">
                  ⚠️ <strong>Exigences :</strong> Plein écran strict. Minuteur spécifique étendu par rapport au TCF. Correction automatique immédiate par nos modèles de correction fine C2.
                </div>
              </div>

              <button
                onClick={() => handleStartSimulation(true)}
                className="w-full py-4 mt-8 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-xl shadow-orange-500/10 active:scale-[0.99] transition-all cursor-pointer"
              >
                Lancer la Simulation TEF →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
