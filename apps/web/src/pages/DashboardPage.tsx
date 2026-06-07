import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { YouTubeSection } from '../components/YouTubeSection'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loadingModule, setLoadingModule] = useState<string | null>(null)
  
  // Live Classroom state
  const [activeLiveSession, setActiveLiveSession] = useState<any | null>(null)
  const [joiningLive, setJoiningLive] = useState(false)

  useEffect(() => {
    let activeChannel: any = null

    async function setupRealtimeLive() {
      if (!user) return
      try {
        const { data: studentRecord } = await supabase
          .from('institution_students')
          .select('institution_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (studentRecord) {
          // Initial fetch to check current state
          const { data: liveSession } = await supabase
            .from('class_sessions')
            .select('*')
            .eq('institution_id', studentRecord.institution_id)
            .eq('status', 'active')
            .maybeSingle()

          if (liveSession) {
            setActiveLiveSession(liveSession)
          } else {
            setActiveLiveSession(null)
          }

          // Realtime subscription to class_sessions for this institution
          activeChannel = supabase
            .channel(`student-live-${studentRecord.institution_id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'class_sessions',
                filter: `institution_id=eq.${studentRecord.institution_id}`
              },
              (payload: any) => {
                const newSession = payload.new as any
                if (newSession && newSession.status === 'active') {
                  setActiveLiveSession(newSession)
                } else {
                  setActiveLiveSession(null)
                }
              }
            )
            .subscribe()
        }
      } catch (err) {
        console.error(err)
      }
    }

    setupRealtimeLive()

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel)
      }
    }
  }, [user])

  const handleJoinLiveSession = async () => {
    if (!activeLiveSession || !user) return
    setJoiningLive(true)
    try {
      const moduleType = activeLiveSession.module
      const isSimulation = moduleType === 'SIMULATION'
      
      // Create session
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          module: isSimulation ? 'FULL_TCF' : moduleType,
          session_type: isSimulation ? 'SIMULATION' : 'TRAINING',
          test_type: 'TCF_CANADA',
          status: 'in_progress',
          started_at: new Date().toISOString(),
          max_duration_s: isSimulation ? 2100 : (moduleType === 'EE' ? 3600 : 720),
          metadata: {
            class_session_id: activeLiveSession.id
          }
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        navigate(`/session/${data.id}`)
      }
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la tentative de connexion à l'examen en direct.")
    } finally {
      setJoiningLive(false)
    }
  }

  const handleStartSession = async (moduleType: 'EE' | 'EO') => {
    setLoadingModule(moduleType)
    try {
      const userId = user?.id || 'mock-user-id'

      // Fetch user profile test preference
      const { data: profile } = await supabase
        .from('users')
        .select('target_test, exam_type_pref')
        .eq('id', userId)
        .maybeSingle()

      const prefTest = profile?.exam_type_pref || profile?.target_test || 'TCF_CANADA'
      const testType = prefTest === 'BOTH' ? 'TCF_CANADA' : prefTest

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          module: moduleType,
          session_type: 'TRAINING',
          test_type: testType,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          max_duration_s: moduleType === 'EE' ? 3600 : (testType === 'TEF_CANADA' ? 2100 : 720)
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
    <div className="min-h-screen p-8 relative z-10 select-text">
      <main className="max-w-5xl mx-auto space-y-10">
        <div className="select-none">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">
            Mon Tableau de <span className="bg-gradient-to-r from-[#1B3A6B] to-indigo-600 bg-clip-text text-transparent">Bord</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1.5">
            Préparez-vous à votre propre rythme et suivez votre évolution vers le niveau C2.
          </p>
        </div>

        {/* Live Classroom Alert Banner */}
        {activeLiveSession && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-[#C55A11] rounded-3xl p-7 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-orange-500/15 border border-orange-400/20 relative overflow-hidden group select-none">
            {/* Blinking indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              <span>En Direct</span>
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <span>🏫 Examen de Classe Live</span>
              </h2>
              <p className="text-sm opacity-90 leading-relaxed max-w-xl">
                Votre enseignant vient de lancer une épreuve collective synchronisée de <strong>{activeLiveSession.module}</strong>. Rejoignez-la maintenant pour y participer en temps réel.
              </p>
            </div>
            
            <button
              onClick={handleJoinLiveSession}
              disabled={joiningLive}
              className="px-6 py-3.5 bg-white text-[#C55A11] hover:scale-105 active:scale-95 transition-all rounded-2xl font-black text-sm shadow-md shrink-0 disabled:opacity-50"
            >
              {joiningLive ? 'Connexion...' : 'Rejoindre la Session →'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Compréhension */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:border-indigo-500/20 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <span className="text-2xl bg-indigo-50 text-indigo-600 p-3 rounded-2xl font-bold select-none">🎧</span>
                <h2 className="text-xl font-bold text-slate-800">Compréhension Écrite & Orale</h2>
              </div>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Entraînez-vous de manière illimitée sur des QCM de CO & CE avec système d'écoute contrôlé et affichage divisé (split-screen) pour reproduire fidèlement l'épreuve réelle.
              </p>
            </div>
            <Link to="/modules" className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl transition-all border border-slate-200/50 shadow-sm select-none">
              <span>Accéder au catalogue CO / CE</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Card 2: Expression Écrite */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:border-purple-500/20 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <span className="text-2xl bg-purple-50 text-purple-600 p-3 rounded-2xl font-bold select-none">✍️</span>
                <h2 className="text-xl font-bold text-slate-800">Expression Écrite (EE)</h2>
              </div>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Rédigez vos essais sur des thèmes d'examens canadiens. Recevez une notation instantanée critère par critère par notre IA ou demandez une correction certifiée par nos experts.
              </p>
            </div>
            <button
              onClick={() => handleStartSession('EE')}
              disabled={loadingModule !== null}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-xl transition-all border border-slate-200/50 shadow-sm select-none disabled:opacity-50"
            >
              <span>{loadingModule === 'EE' ? 'Préparation...' : 'Lancer un entraînement EE'}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Card 3: Expression Orale */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:border-orange-500/20 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <span className="text-2xl bg-orange-50 text-orange-600 p-3 rounded-2xl font-bold select-none">🎙️</span>
                <h2 className="text-xl font-bold text-slate-800">Expression Orale (EO)</h2>
              </div>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Enregistrez vos plaidoyers oraux en ligne. Bénéficiez d'une transcription automatique Whisper et d'une analyse rigoureuse d'évaluation IA basée sur les critères officiels.
              </p>
            </div>
            <button
              onClick={() => handleStartSession('EO')}
              disabled={loadingModule !== null}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-bold rounded-xl transition-all border border-slate-200/50 shadow-sm select-none disabled:opacity-50"
            >
              <span>{loadingModule === 'EO' ? 'Préparation...' : 'Lancer un entraînement EO'}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Card 4: Simulations & Progrès */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:border-emerald-500/20 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <span className="text-2xl bg-emerald-50 text-emerald-600 p-3 rounded-2xl font-bold select-none">🏆</span>
                <h2 className="text-xl font-bold text-slate-800">Simulations & Statistiques</h2>
              </div>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Passez de véritables examens blancs chronométrés pour vous tester en conditions réelles et suivez l'évolution détaillée de vos performances à travers vos scores NCLC.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/simulation" className="flex items-center justify-center w-full py-3 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold rounded-xl transition-all border border-slate-200/50 shadow-sm text-sm select-none text-center">
                Simulations
              </Link>
              <Link to="/progress" className="flex items-center justify-center w-full py-3 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold rounded-xl transition-all border border-slate-200/50 shadow-sm text-sm select-none text-center">
                Statistiques
              </Link>
            </div>
          </div>
        </div>

        {/* Section de ressources vidéo YouTube */}
        <YouTubeSection />
      </main>
    </div>
  )
}
