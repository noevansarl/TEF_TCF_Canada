import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, mockQuestions } from '../lib/supabase'
import { Timer } from '../components/Timer'
import { AudioPlayer } from '../features/co/AudioPlayer'
import { useSessionStore } from '../store/sessionStore'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { cn } from '../lib/utils'
import { WritingEditor } from '../features/ee/WritingEditor'
import { AudioRecorder } from '../features/eo/AudioRecorder'
import { BadgeUnlockToast } from '../components/BadgeUnlockToast'
import { useNotificationStore } from '../store/notificationStore'
import { BADGES_DEFINITION } from '../lib/badges'
import type { Question } from '../types/models'

function getModuleDuration(module: string, testType: string): number {
  if (module === 'CO') return testType === 'TEF_CANADA' ? 2400 : 2100
  if (module === 'CE') return testType === 'TEF_CANADA' ? 3600 : 2100
  if (module === 'EE') return 3600
  if (module === 'EO') return testType === 'TEF_CANADA' ? 2100 : 720
  return 3600
}

function getModuleQuestionCount(module: string, testType: string): number {
  if (testType === 'TEF_CANADA') {
    if (module === 'CO') return 60
    if (module === 'CE') return 50
    if (module === 'EE') return 2
    if (module === 'EO') return 4
  } else {
    // TCF_CANADA
    if (module === 'CO') return 39
    if (module === 'CE') return 39
    if (module === 'EE') return 3
    if (module === 'EO') return 3
  }
  return 10
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function SessionPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  
  const isNormalExit = useRef(false)

  const {
    currentSession,
    activeModule,
    questions,
    currentIndex,
    answers,
    isRunning,
    startSession,
    transitionSimulationStep,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    endSession,
    abandonSession
  } = useSessionStore()

  const isSimulation = currentSession?.module.startsWith('FULL_')

  // Load session and questions
  useEffect(() => {
    async function loadSessionAndQuestions() {
      if (!sessionId) return
      
      // If the session is already active in the store, use it to prevent re-shuffling on reload
      const sessionStoreState = useSessionStore.getState()
      if (sessionStoreState.currentSession?.id === sessionId && sessionStoreState.questions.length > 0) {
        setIsStarted(!sessionStoreState.currentSession.module.startsWith('FULL_') || sessionStoreState.isRunning)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        // Fetch session details
        const { data: sessionData, error: sessionErr } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (sessionErr || !sessionData) {
          setError("Impossible de charger la session. Veuillez réessayer.")
          setLoading(false)
          return
        }

        // Fetch questions for the session module
        let targetModule = sessionData.module
        if (targetModule.startsWith('FULL_')) {
          targetModule = 'CO'
        }

        const { data: questionsData, error: qErr } = await supabase
          .from('questions')
          .select('*')
          .eq('module', targetModule)
          .in('test_type', [sessionData.test_type || 'TCF_CANADA', 'BOTH'])

        let questionsDataFinal = questionsData
        if (qErr || !questionsData || questionsData.length === 0) {
          console.warn("Falling back to local mock questions due to empty database or query error:", qErr)
          questionsDataFinal = mockQuestions.filter(
            q => q.module === targetModule && 
            (q.test_type === sessionData.test_type || q.test_type === 'BOTH')
          )
        }

        if (!questionsDataFinal || questionsDataFinal.length === 0) {
          setError("Aucune question disponible pour cette épreuve.")
          setLoading(false)
          return
        }

        // Shuffle and slice to match official count
        let selectedQuestions = shuffleArray(questionsDataFinal as Question[])
        const targetCount = sessionData.total_questions || getModuleQuestionCount(targetModule, sessionData.test_type || 'TCF_CANADA')
        if (selectedQuestions.length > targetCount) {
          selectedQuestions = selectedQuestions.slice(0, targetCount)
        }

        // Initialize state inside session store
        const duration = sessionData.max_duration_s || getModuleDuration(targetModule, sessionData.test_type || 'TCF_CANADA')
        startSession(sessionData, selectedQuestions, duration)
        
        // Classic training sessions start immediately; simulations require entering the welcome gate
        setIsStarted(!sessionData.module.startsWith('FULL_'))
      } catch (err) {
        setError("Une erreur inattendue est survenue.")
      } finally {
        setLoading(false)
      }
    }

    loadSessionAndQuestions()
  }, [sessionId, startSession])

  // Handle auto-submission when timer expires (isRunning becomes false in store)
  useEffect(() => {
    if (!loading && questions.length > 0 && !isRunning && currentSession && isStarted) {
      handleFinish(true)
    }
  }, [isRunning, loading, isStarted])

  // Enforce fullscreen for simulation sessions
  useEffect(() => {
    if (!currentSession || !isSimulation || !isStarted) return

    const handleFullscreenChange = () => {
      if (isNormalExit.current) return
      if (!document.fullscreenElement) {
        alert("Attention : Sortir du mode plein écran annule votre session de simulation officielle. Vous allez être redirigé vers le tableau de bord.")
        abandonSession()
        navigate('/dashboard')
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [currentSession, isSimulation, isStarted, abandonSession, navigate])

  // Prompt before window close/reload during active simulation
  useEffect(() => {
    if (!currentSession || !isSimulation || !isStarted) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isNormalExit.current) return
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [currentSession, isSimulation, isStarted])

  const handleFinish = async (isTimeUp = false) => {
    if (submitting) return

    const activeMod = activeModule || 'CO'

    if (!isTimeUp) {
      const confirmMsg = isSimulation
        ? `Voulez-vous vraiment terminer l'épreuve de ${activeMod} et passer à la suite ?`
        : "Voulez-vous vraiment terminer et soumettre vos réponses ?"
      if (!confirm(confirmMsg)) {
        return
      }
    }

    setSubmitting(true)
    endSession() // Stop timer in store

    try {
      if (!currentSession) throw new Error("Aucune session active")

      const { data: userRes } = await supabase.auth.getUser()
      const userId = userRes.user?.id || 'mock-user-id'

      // 1. Save answers of the current active module
      if (activeMod === 'EE') {
        for (const [qId, val] of Object.entries(answers)) {
          const q = questions.find(question => question.id === qId)
          if (!q || q.module !== 'EE') continue
          
          const { data: ansRow, error: ansErr } = await supabase
            .from('answers')
            .upsert({
              session_id: sessionId,
              question_id: qId,
              user_id: userId,
              user_answer: val,
            })
            .select()
            .single()

          if (ansErr) {
            console.error("Erreur de sauvegarde de la réponse:", ansErr)
          }

          const ansId = ansRow?.id || `a-ee-${qId}`
          
          await supabase.functions.invoke('correct-ee', {
            body: {
              answer_id: ansId,
              session_id: sessionId,
              text: val,
              task_type: q.task_type || 'essai',
              test_type: currentSession.test_type || 'TCF_CANADA',
              task_description: q.question_text,
              target_words: q.target_words || { min: 150, max: 250 }
            }
          })
        }
      } else if (activeMod === 'EO') {
        for (const [qId, val] of Object.entries(answers)) {
          const q = questions.find(question => question.id === qId)
          if (!q || q.module !== 'EO') continue

          const audioPath = `eo/${sessionId}/task_${qId}.webm`

          const { data: ansRow, error: ansErr } = await supabase
            .from('answers')
            .upsert({
              session_id: sessionId,
              question_id: qId,
              user_id: userId,
              user_answer: val, // contains the audio Url
              audio_storage_path: audioPath
            })
            .select()
            .single()

          if (ansErr) {
            console.error("Erreur de sauvegarde de la réponse:", ansErr)
          }

          const ansId = ansRow?.id || `a-eo-${qId}`

          await supabase.functions.invoke('transcribe-eo', {
            body: {
              answer_id: ansId,
              audio_storage_path: audioPath,
              task_description: q.question_text,
              test_type: currentSession.test_type || 'TCF_CANADA'
            }
          })
        }
      } else {
        // QCM (CO/CE)
        const answersToInsert = Object.entries(answers).map(([qId, val]) => {
          const q = questions.find(question => question.id === qId)
          if (!q || q.module !== activeMod) return null
          return {
            session_id: sessionId,
            question_id: qId,
            user_id: userId,
            user_answer: val,
            is_correct: val === q.correct_answer
          }
        }).filter(Boolean)

        if (answersToInsert.length > 0) {
          await supabase.from('answers').upsert(answersToInsert)
        }
      }

      // 2. If it is simulation and not the last step, transition to the next épreuve
      if (isSimulation && activeMod !== 'EO') {
        let nextMod: 'CE' | 'EE' | 'EO' = 'CE'
        if (activeMod === 'CO') nextMod = 'CE'
        else if (activeMod === 'CE') nextMod = 'EE'
        else if (activeMod === 'EE') nextMod = 'EO'

        // Fetch questions for the next module
        const { data: nextQuestionsData, error: qErr } = await supabase
          .from('questions')
          .select('*')
          .eq('module', nextMod)
          .in('test_type', [currentSession.test_type || 'TCF_CANADA', 'BOTH'])

        let nextQuestionsDataFinal = nextQuestionsData
        if (qErr || !nextQuestionsData || nextQuestionsData.length === 0) {
          console.warn("Falling back to local mock questions for next module:", nextMod)
          nextQuestionsDataFinal = mockQuestions.filter(
            q => q.module === nextMod && 
            (q.test_type === currentSession.test_type || q.test_type === 'BOTH')
          )
        }

        if (!nextQuestionsDataFinal || nextQuestionsDataFinal.length === 0) {
          throw new Error(`Aucune question pour l'épreuve suivante ${nextMod}`)
        }

        // Shuffle and slice to match official count
        let selectedNextQuestions = shuffleArray(nextQuestionsDataFinal as Question[])
        const targetCount = getModuleQuestionCount(nextMod, currentSession.test_type || 'TCF_CANADA')
        if (selectedNextQuestions.length > targetCount) {
          selectedNextQuestions = selectedNextQuestions.slice(0, targetCount)
        }

        const duration = getModuleDuration(nextMod, currentSession.test_type || 'TCF_CANADA')
        
        // Reset submits states and transition
        setSubmitting(false)
        transitionSimulationStep(nextMod, selectedNextQuestions, duration)
        return
      }

      // 3. Complete the entire session
      if (isSimulation) {
        // Complete simulation session
        await supabase
          .from('sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            nclc_estimate: 'C1'
          })
          .eq('id', sessionId)

        // Trigger a badge unlock for gamification!
        const { triggerBadgeUnlock } = useNotificationStore.getState()
        const marathonBadge = BADGES_DEFINITION.find(b => b.slug === 'marathon')
        if (marathonBadge) {
          triggerBadgeUnlock(marathonBadge)
        }
      } else {
        // Classic session finish
        if (activeMod !== 'EE' && activeMod !== 'EO') {
          // QCM session: CO/CE
          const { error: scoreErr } = await supabase.functions.invoke('score-qcm', {
            body: {
              session_id: sessionId,
              answers: answers
            }
          })

          if (scoreErr) {
            console.error("Erreur de calcul du score:", scoreErr)
          }

          // Trigger "Premier Pas" badge for first completed exercise
          const { triggerBadgeUnlock } = useNotificationStore.getState()
          const firstStepBadge = BADGES_DEFINITION.find(b => b.slug === 'first-step')
          if (firstStepBadge) {
            triggerBadgeUnlock(firstStepBadge)
          }
        } else {
          // EE/EO classic session
          await supabase
            .from('sessions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', sessionId)
        }
      }

      // Safe exit from Fullscreen
      isNormalExit.current = true
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {})
      }

      // Navigate to results report
      navigate(`/results/${sessionId}`, { replace: true })
    } catch (err) {
      console.error("Erreur de soumission:", err)
      isNormalExit.current = true
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {})
      }
      navigate(`/results/${sessionId}`, { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAbandon = () => {
    if (confirm("Voulez-vous vraiment abandonner la session ? Vos progrès seront perdus.")) {
      isNormalExit.current = true
      abandonSession()
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      navigate('/dashboard')
    }
  }

  if (loading) return <FullPageSpinner />

  if (error || !currentSession || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-8 rounded-3xl shadow-xl text-center space-y-6 relative z-10">
          <h1 className="text-2xl font-black text-rose-400 font-display">Erreur</h1>
          <p className="text-slate-400 text-sm font-semibold">{error || "Une erreur est survenue."}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-blue-500/10 transition-all"
          >
            Retour au Tableau de Bord
          </button>
        </div>
      </div>
    )
  }

  // Simulation Startup Screen (Welcome Gate)
  if (isSimulation && !isStarted) {
    const isTef = currentSession.test_type === 'TEF_CANADA'
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="max-w-xl w-full bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-8 rounded-3xl shadow-xl text-center space-y-6 relative z-10">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-3xl select-none">
            🎓
          </div>
          <div className="space-y-3 select-none">
            <h1 className="text-3xl font-black text-white font-display">Simulation Officielle</h1>
            <p className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider w-max mx-auto border ${
              isTef ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {isTef ? 'TEF Canada' : 'TCF Canada'}
            </p>
          </div>
          
          <div className="bg-slate-950/60 p-6 rounded-2xl text-left space-y-4 border border-slate-850">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <span>⚠️ Consignes d'Examen Importantes :</span>
            </h3>
            <ul className="space-y-3 text-xs text-slate-350 font-semibold leading-relaxed">
              <li className="flex gap-2.5">
                <span className="text-blue-400 font-extrabold">1.</span>
                <span>L'examen enchaîne les 4 épreuves : <strong className="text-white">CO → CE → EE → EO</strong> de manière ininterrompue.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-blue-400 font-extrabold">2.</span>
                <span><strong className="text-white">Plein écran obligatoire</strong> : l'activation se fera au démarrage. Toute sortie du plein écran ou tentative de quitter annulera la session immédiatement.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-blue-400 font-extrabold">3.</span>
                <span>Le minuteur est <strong className="text-white">bloquant</strong>. À l'expiration du temps, vos réponses sont enregistrées et l'épreuve suivante démarre sans pause.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-blue-400 font-extrabold">4.</span>
                <span>Assurez-vous que votre casque et votre micro fonctionnent correctement pour les épreuves de CO et d'EO.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              document.documentElement.requestFullscreen()
                .then(() => {
                  setIsStarted(true)
                })
                .catch((err) => {
                  console.error("Fullscreen error", err)
                  setIsStarted(true)
                })
            }}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-extrabold text-sm uppercase tracking-wider hover:opacity-95 shadow-xl shadow-orange-500/15 active:scale-[0.99] transition-all select-none"
          >
            Activer le plein écran & Commencer l'examen
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-slate-950/60 border border-slate-850 hover:bg-slate-900/60 text-slate-400 hover:text-white rounded-2xl font-bold text-xs transition-all select-none"
          >
            Retour au Tableau de Bord
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-850 text-white px-6 py-4 flex justify-between items-center shadow-lg select-none sticky top-0 z-40">
        <div>
          <h1 className="text-lg font-black flex items-center gap-2.5 font-display">
            <span>Session Active : {
              activeModule === 'CO' ? "Compréhension de l'Oral" :
              activeModule === 'CE' ? "Compréhension des Écrits" :
              activeModule === 'EE' ? "Expression Écrite" :
              activeModule === 'EO' ? "Expression Orale" : "Examen"
            }</span>
            <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg uppercase font-extrabold tracking-wider">
              {currentSession.test_type || 'TCF/TEF'}
            </span>
          </h1>
          <span className="text-[10px] text-slate-500 font-semibold">Répondez à toutes les questions dans le temps imparti.</span>
        </div>
        <div className="flex items-center gap-5">
          <Timer />
          <button
            onClick={handleAbandon}
            className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-extrabold hover:bg-rose-500/20 transition-all"
          >
            Quitter
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Question and Options */}
        <section className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-6 rounded-3xl shadow-xl flex-1 flex flex-col">
            {/* Context Badge */}
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-4 mb-4 select-none">
              <span className="text-xs font-bold text-slate-450">
                Question {currentIndex + 1} sur {questions.length}
              </span>
              <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                Niveau {currentQuestion.level}
              </span>
            </div>

            {/* Split Screen for CE, Audio Player for CO, Editor for EE, or Recorder for EO */}
            <div className="flex-1 flex flex-col gap-6">
              {activeModule === 'CO' && currentQuestion.audio_url && (
                <div className="mb-4">
                  <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Écoute du Document</h3>
                  <AudioPlayer
                    key={currentQuestion.id}
                    audioUrl={currentQuestion.audio_url}
                    maxListens={currentQuestion.max_listens || 2}
                    onListensExceeded={() => alert("Nombre maximum d'écoutes atteint pour cette question.")}
                    isSimulation={isSimulation}
                  />
                </div>
              )}

              {activeModule === 'CE' && currentQuestion.passage_text ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-1">
                  {/* Left column: reading text */}
                  <div className="border border-slate-850 bg-slate-950/60 p-5 rounded-2xl overflow-y-auto max-h-[360px] md:max-h-none text-slate-300 leading-relaxed font-serif text-sm">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-3 select-none">Texte de passage</h4>
                    <p className="whitespace-pre-line">{currentQuestion.passage_text}</p>
                  </div>

                  {/* Right column: question text and choices */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white mb-6 leading-snug">
                        {currentQuestion.question_text}
                      </h2>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(currentQuestion.options || {}).map(([key, val]) => {
                          const isSelected = answers[currentQuestion.id] === key
                          return (
                            <button
                              key={key}
                              onClick={() => submitAnswer(currentQuestion.id, key)}
                              className={cn(
                                'flex items-center gap-4 p-3.5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer',
                                isSelected
                                  ? 'border-blue-500/80 bg-blue-500/10 text-blue-300 font-semibold shadow-md shadow-blue-500/5'
                                  : 'border-slate-850 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                              )}
                            >
                              <span className={cn(
                                'w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm shrink-0 transition-colors',
                                isSelected ? 'bg-blue-500 text-white border-blue-500' : 'border-slate-700 text-slate-500'
                              )}>
                                {key}
                              </span>
                              <span className="text-xs font-semibold">{val}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeModule === 'EE' ? (
                <div className="flex-1 flex flex-col gap-4">
                  <h2 className="text-base font-bold text-white leading-snug">
                    {currentQuestion.question_text}
                  </h2>
                  <WritingEditor
                    key={currentQuestion.id}
                    value={answers[currentQuestion.id] || ''}
                    onTextChange={(text) => submitAnswer(currentQuestion.id, text)}
                    targetWordCount={currentQuestion.target_words || { min: 150, max: 250 }}
                    placeholder="Rédigez votre essai ou réponse argumentée ici..."
                  />
                </div>
              ) : activeModule === 'EO' ? (
                <div className="flex-1 flex flex-col gap-4">
                  <h2 className="text-base font-bold text-white leading-snug">
                    {currentQuestion.question_text}
                  </h2>
                  <div className="space-y-4 mt-2">
                    {answers[currentQuestion.id] && (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-emerald-400 font-bold text-xs block">✓ Enregistrement effectué</span>
                          <span className="text-[10px] text-slate-500 font-semibold">Votre audio a été sauvegardé. Vous pouvez ré-enregistrer si besoin.</span>
                        </div>
                        <audio src={answers[currentQuestion.id]} controls className="h-10 shrink-0" />
                      </div>
                    )}
                    <AudioRecorder
                      key={currentQuestion.id}
                      taskIndex={currentIndex + 1}
                      sessionId={sessionId || 'mock-session'}
                      taskDurationSeconds={currentQuestion.audio_duration_s || 120}
                      onRecordingComplete={(audioUrl) => submitAnswer(currentQuestion.id, audioUrl)}
                    />
                  </div>
                </div>
              ) : (
                /* Standard layout for CO or simple questions */
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white mb-6 leading-snug">
                      {currentQuestion.question_text}
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(currentQuestion.options || {}).map(([key, val]) => {
                        const isSelected = answers[currentQuestion.id] === key
                        return (
                          <button
                            key={key}
                            onClick={() => submitAnswer(currentQuestion.id, key)}
                            className={cn(
                              'flex items-center gap-4 p-3.5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer',
                              isSelected
                                ? 'border-blue-500/80 bg-blue-500/10 text-blue-300 font-semibold shadow-md shadow-blue-500/5'
                                : 'border-slate-850 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                            )}
                          >
                            <span className={cn(
                              'w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm shrink-0 transition-colors',
                              isSelected ? 'bg-blue-500 text-white border-blue-500' : 'border-slate-700 text-slate-500'
                            )}>
                              {key}
                            </span>
                            <span className="text-xs font-semibold">{val}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Questions Matrix and Controls */}
        <section className="flex flex-col gap-6">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-4 select-none font-display">Navigation des Questions</h3>
              {/* Question list matrix */}
              <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex
                  const isAnswered = !!answers[q.id]
                  return (
                    <button
                      key={q.id}
                      onClick={() => !isSimulation && goToQuestion(idx)}
                      disabled={isSimulation}
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all border shrink-0',
                        isCurrent && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 scale-105',
                        isAnswered
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-slate-950/60 text-slate-450 border-slate-850 hover:border-slate-700',
                        isSimulation && 'cursor-not-allowed'
                      )}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 select-none">
              <button
                onClick={prevQuestion}
                disabled={isSimulation || currentIndex === 0}
                className="flex-1 py-2.5 px-4 border border-slate-850 bg-slate-950/40 rounded-xl font-bold text-slate-400 disabled:opacity-30 hover:bg-slate-900/40 hover:text-white transition-all text-xs select-none"
              >
                Précédent
              </button>
              <button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1 || (isSimulation && !answers[currentQuestion.id])}
                className="flex-1 py-2.5 px-4 border border-slate-850 bg-slate-950/40 rounded-xl font-bold text-slate-400 disabled:opacity-30 hover:bg-slate-900/40 hover:text-white transition-all text-xs select-none"
              >
                Suivant
              </button>
            </div>

            {/* Finish button */}
            <button
              onClick={() => handleFinish(false)}
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>Calcul du score...</span>
                </>
              ) : (
                'Terminer l\'épreuve'
              )}
            </button>
          </div>
        </section>
      </main>
      <BadgeUnlockToast />
    </div>
  )
}
