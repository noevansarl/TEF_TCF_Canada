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
          started_at: new Date().toISOString()
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
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none">
          ← Retour au tableau de bord
        </Link>
        {/* Header */}
        <div className="text-center space-y-2 select-none">
          <span className="text-xs bg-[#C55A11]/10 text-[#C55A11] px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Mode Examen Réel
          </span>
          <h1 className="text-4xl font-extrabold text-[#1B3A6B]">Simulations Officielles</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Évaluez votre niveau réel sous les contraintes exactes des épreuves officielles. Plein écran forcé et minuteur bloquant.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-white rounded-3xl border shadow-sm">
            <svg className="animate-spin w-10 h-10 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-gray-600 font-medium">Préparation de la session de simulation...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card TCF Canada */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all hover:scale-[1.01]">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1B3A6B]">TCF Canada</h2>
                    <p className="text-sm text-gray-400 font-semibold uppercase mt-0.5">Test de Connaissance du Français</p>
                  </div>
                  <span className="text-xs bg-[#1B3A6B]/10 text-[#1B3A6B] font-bold px-2.5 py-1 rounded-md">2h22</span>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Compréhension de l'Oral (CO)</span>
                    <span className="text-gray-500">35 min (39 questions)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Compréhension des Écrits (CE)</span>
                    <span className="text-gray-500">35 min (39 questions)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Expression Écrite (EE)</span>
                    <span className="text-gray-500">60 min (3 tâches)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Expression Orale (EO)</span>
                    <span className="text-gray-500">12 min (3 tâches)</span>
                  </div>
                </div>

                <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl text-xs text-orange-800 leading-relaxed">
                  <strong>Exigences :</strong> Plein écran strict. Pas de possibilité de revenir en arrière entre les modules. Vos réponses orales seront retranscrites et notées par l'IA.
                </div>
              </div>

              <button
                onClick={() => handleStartSimulation(false)}
                className="w-full py-3.5 mt-8 bg-[#1B3A6B] hover:bg-[#12274A] text-white rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 select-none"
              >
                <span>Lancer la Simulation TCF</span>
                <span>→</span>
              </button>
            </div>

            {/* Card TEF Canada */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all hover:scale-[1.01]">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1B3A6B]">TEF Canada</h2>
                    <p className="text-sm text-gray-400 font-semibold uppercase mt-0.5">Test d'Évaluation de Français</p>
                  </div>
                  <span className="text-xs bg-[#1B3A6B]/10 text-[#1B3A6B] font-bold px-2.5 py-1 rounded-md">3h15</span>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Compréhension de l'Oral (CO)</span>
                    <span className="text-gray-500">40 min (40 questions)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Compréhension des Écrits (CE)</span>
                    <span className="text-gray-500">60 min (50 questions)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Expression Écrite (EE)</span>
                    <span className="text-gray-500">60 min (2 tâches)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Expression Orale (EO)</span>
                    <span className="text-gray-500">35 min (2 tâches)</span>
                  </div>
                </div>

                <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl text-xs text-orange-800 leading-relaxed">
                  <strong>Exigences :</strong> Plein écran strict. Timer spécifique étendu par rapport au TCF. Correction automatique immédiate par nos modèles de correction fine C2.
                </div>
              </div>

              <button
                onClick={() => handleStartSimulation(true)}
                className="w-full py-3.5 mt-8 bg-[#C55A11] hover:bg-[#A84A0D] text-white rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 select-none"
              >
                <span>Lancer la Simulation TEF</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
