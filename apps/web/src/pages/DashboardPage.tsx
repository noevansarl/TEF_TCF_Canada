import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { YouTubeSection } from '../components/YouTubeSection'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loadingModule, setLoadingModule] = useState<string | null>(null)

  const handleStartSession = async (moduleType: 'EE' | 'EO') => {
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
          max_duration_s: moduleType === 'EE' ? 3600 : 720
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
      <main className="max-w-5xl mx-auto space-y-8">
        <div className="select-none">
          <h1 className="text-3xl font-extrabold text-gray-800">Mon Tableau de Bord</h1>
          <p className="text-gray-500 mt-1">Préparez-vous à votre propre rythme et suivez votre évolution vers le niveau C2.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Compréhension */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Compréhension de l'Oral & des Écrits</h2>
              <p className="text-gray-600 mb-6 text-sm">CO & CE illimités avec système d'écoute contrôlé et affichage split-screen.</p>
            </div>
            <Link to="/modules" className="inline-flex items-center gap-1 text-primary font-bold hover:underline select-none">
              Accéder au catalogue CO / CE →
            </Link>
          </div>

          {/* Card 2: Expression Écrite */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Expression Écrite (EE)</h2>
              <p className="text-gray-600 mb-6 text-sm">Rédigez vos essais sur des thèmes canadiens et recevez une notation instantanée sous format officiel.</p>
            </div>
            <button
              onClick={() => handleStartSession('EE')}
              disabled={loadingModule !== null}
              className="inline-flex items-center gap-1 text-primary font-bold hover:underline select-none text-left"
            >
              {loadingModule === 'EE' ? 'Création...' : 'Lancer un entraînement EE →'}
            </button>
          </div>

          {/* Card 3: Expression Orale */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Expression Orale (EO)</h2>
              <p className="text-gray-600 mb-6 text-sm">Enregistrez vos plaidoyers. Transcription automatique Whisper et feedback détaillé GPT-4o.</p>
            </div>
            <button
              onClick={() => handleStartSession('EO')}
              disabled={loadingModule !== null}
              className="inline-flex items-center gap-1 text-primary font-bold hover:underline select-none text-left"
            >
              {loadingModule === 'EO' ? 'Création...' : 'Lancer un entraînement EO →'}
            </button>
          </div>

          {/* Card 4: Simulations & Progrès */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Simulations & Statistiques</h2>
              <p className="text-gray-600 mb-6 text-sm">Passez des simulations complètes chronométrées et visualisez votre progression vers le score requis.</p>
            </div>
            <div className="flex gap-4">
              <Link to="/simulation" className="text-primary font-bold hover:underline select-none">Simulations</Link>
              <span className="text-gray-300">|</span>
              <Link to="/progress" className="text-primary font-bold hover:underline select-none">Statistiques</Link>
            </div>
          </div>
        </div>

        {/* Section de ressources vidéo YouTube */}
        <YouTubeSection />
      </main>
    </div>
  )
}
