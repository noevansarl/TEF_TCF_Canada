import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function CataloguePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loadingModule, setLoadingModule] = useState<string | null>(null)

  const handleStartSession = async (moduleType: 'CO' | 'CE' | 'EE' | 'EO') => {
    setLoadingModule(moduleType)
    try {
      const userId = user?.id || 'mock-user-id'
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          module: moduleType,
          session_type: 'TRAINING',
          test_type: 'TCF_CANADA',
          status: 'in_progress',
          started_at: new Date().toISOString(),
          max_duration_s: moduleType === 'CO' ? 2100 : moduleType === 'CE' ? 2100 : moduleType === 'EE' ? 3600 : 720
        })
        .select()
        .single()

      if (error || !data) {
        navigate(`/session/${moduleType.toLowerCase()}-session-id`)
      } else {
        navigate(`/session/${data.id}`)
      }
    } catch (e) {
      console.error(e)
      navigate(`/session/${moduleType.toLowerCase()}-session-id`)
    } finally {
      setLoadingModule(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none">
          ← Retour au tableau de bord
        </Link>
        <div className="text-center md:text-left select-none">
          <h1 className="text-3xl font-extrabold text-primary">Catalogue de Préparation</h1>
          <p className="text-gray-500 mt-1">Préparez-vous de manière intensive aux 4 compétences clés du TCF et TEF Canada.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: CO */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max mb-3">Compréhension</span>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Compréhension de l'Oral (CO)</h2>
              <p className="text-gray-600 mb-6 text-sm">Entraînez-vous avec plus de 600 fichiers audio originaux dans les conditions réelles d'examen (accent québécois, parisien, etc.).</p>
            </div>
            <button
              onClick={() => handleStartSession('CO')}
              disabled={loadingModule !== null}
              className="px-4 py-2.5 bg-primary text-white text-center rounded-xl font-bold hover:bg-primary-dark transition-all select-none disabled:opacity-50"
            >
              {loadingModule === 'CO' ? 'Création de la session...' : "Commencer l'épreuve"}
            </button>
          </div>

          {/* Card 2: CE */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max mb-3">Compréhension</span>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Compréhension des Écrits (CE)</h2>
              <p className="text-gray-600 mb-6 text-sm">Textes d'actualité, administratifs et professionnels avec système split-screen. Développez votre vocabulaire académique.</p>
            </div>
            <button
              onClick={() => handleStartSession('CE')}
              disabled={loadingModule !== null}
              className="px-4 py-2.5 bg-primary text-white text-center rounded-xl font-bold hover:bg-primary-dark transition-all select-none disabled:opacity-50"
            >
              {loadingModule === 'CE' ? 'Création de la session...' : "Commencer l'épreuve"}
            </button>
          </div>

          {/* Card 3: EE */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <span className="text-xs bg-secondary/10 text-secondary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max mb-3">Expression</span>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Expression Écrite (EE)</h2>
              <p className="text-gray-600 mb-6 text-sm">Rédigez vos essais, lettres d'opinion ou plaidoyers sur notre éditeur en ligne. Obtenez une correction instantanée détaillée par critère CECRL.</p>
            </div>
            <button
              onClick={() => handleStartSession('EE')}
              disabled={loadingModule !== null}
              className="px-4 py-2.5 bg-secondary text-white text-center rounded-xl font-bold hover:bg-secondary-dark transition-all select-none disabled:opacity-50"
            >
              {loadingModule === 'EE' ? 'Création de la session...' : "Commencer l'épreuve"}
            </button>
          </div>

          {/* Card 4: EO */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <span className="text-xs bg-secondary/10 text-secondary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max mb-3">Expression</span>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Expression Orale (EO)</h2>
              <p className="text-gray-600 mb-6 text-sm">Enregistrez directement vos réponses orales. Notre système Whisper retranscrit votre voix et GPT-4o analyse votre accent, fluidité et lexique.</p>
            </div>
            <button
              onClick={() => handleStartSession('EO')}
              disabled={loadingModule !== null}
              className="px-4 py-2.5 bg-secondary text-white text-center rounded-xl font-bold hover:bg-secondary-dark transition-all select-none disabled:opacity-50"
            >
              {loadingModule === 'EO' ? 'Création de la session...' : "Commencer l'épreuve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
