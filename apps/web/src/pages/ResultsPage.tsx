import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FullPageSpinner } from '../components/FullPageSpinner'
import confetti from 'canvas-confetti'
import { cn } from '../lib/utils'
import { ProgressRadarChart } from '../features/progression/RadarChart'

interface AnswerWithQuestion {
  id: string
  session_id: string
  question_id: string
  user_answer: string
  is_correct: boolean | null
  audio_transcript?: string
  auto_feedback?: any
  questions: {
    id: string
    module: string
    level: string
    question_text: string
    passage_text?: string
    audio_url?: string
    options?: Record<string, string>
    correct_answer?: string
    explanation: string
    theme: string
    model_answer?: string
  }
}

export default function ResultsPage() {
  const { sessionId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)
  const [answers, setAnswers] = useState<AnswerWithQuestion[]>([])
  const [prevSession, setPrevSession] = useState<any>(null)

  useEffect(() => {
    async function loadResults() {
      if (!sessionId) return
      setLoading(true)
      setError(null)
      try {
        // Fetch session
        const { data: sessionData, error: sessionErr } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (sessionErr || !sessionData) {
          setError("Impossible de charger le récapitulatif de la session.")
          setLoading(false)
          return
        }
        setSession(sessionData)

        // Fetch answers with question details
        const { data: answersData, error: answersErr } = await supabase
          .from('answers')
          .select('*, questions(*)')
          .eq('session_id', sessionId)

        if (answersErr || !answersData) {
          setError("Impossible de charger les détails des réponses.")
          setLoading(false)
          return
        }

        setAnswers(answersData as unknown as AnswerWithQuestion[])

        // Fetch previous completed session for comparison
        try {
          const { data: prevSessions } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', sessionData.user_id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(5)

          if (prevSessions) {
            const others = prevSessions.filter((s: any) => s.id !== sessionId)
            if (others.length > 0) {
              setPrevSession(others[0])
            }
          }
        } catch (e) {
          console.error("Error fetching previous session:", e)
        }

        // Trigger confetti for B2+ level
        const est = sessionData.nclc_estimate || 'C1'
        if (['B2', 'C1', 'C2'].includes(est)) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          })
        }
      } catch (err) {
        setError("Une erreur inattendue est survenue.")
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [sessionId])

  if (loading) return <FullPageSpinner />

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border shadow-md text-center space-y-6">
          <h1 className="text-2xl font-extrabold text-red-600">Erreur</h1>
          <p className="text-gray-600">{error || "Une erreur est survenue."}</p>
          <Link
            to="/dashboard"
            className="block w-full py-2 bg-[#1B3A6B] text-white rounded-lg font-bold hover:bg-[#12274A]"
          >
            Retour au Tableau de Bord
          </Link>
        </div>
      </div>
    )
  }

  const isSimulation = session.session_type === 'SIMULATION' || session.module?.startsWith('FULL_')
  const isExpression = session.module === 'EE' || session.module === 'EO'
  const firstAnswer = answers[0]
  const feedback = firstAnswer?.auto_feedback

  const getPercent = (score: number) => {
    if (score <= 4) return (score / 4) * 100
    if (score <= 20) return (score / 20) * 100
    return score // Out of 100
  }

  const correctCount = answers.filter(a => a.is_correct).length
  const totalCount = answers.length
  
  // XP calculated: for Simulation = 200 XP, QCM = correct * 85, EE/EO = 150 XP
  const xpEarned = isSimulation ? 200 : (isExpression ? 150 : (correctCount * 85))

  // Labels for the 5 CECRL criteria
  const CRITERIA_LABELS: Record<string, string> = {
    respect_tache: "Respect de la consigne",
    coherence: "Cohérence et structure",
    lexique: "Richesse du vocabulaire",
    morphosyntaxe: "Grammaire et syntaxe",
    conventions: "Conventions (format/débit)"
  }

  const getCriteriaColorClass = (score: number) => {
    const pct = getPercent(score)
    if (pct >= 85) return 'bg-success'
    if (pct >= 60) return 'bg-yellow-500'
    return 'bg-error'
  }

  // Calculate scores for radar chart if simulation
  const getSimulationRadarData = () => {
    const coAnswers = answers.filter(a => a.questions?.module === 'CO')
    const ceAnswers = answers.filter(a => a.questions?.module === 'CE')
    const eeAnswer = answers.find(a => a.questions?.module === 'EE')
    const eoAnswer = answers.find(a => a.questions?.module === 'EO')

    const coScore = coAnswers.length > 0 ? Math.round((coAnswers.filter(a => a.is_correct).length / coAnswers.length) * 100) : 85
    const ceScore = ceAnswers.length > 0 ? Math.round((ceAnswers.filter(a => a.is_correct).length / ceAnswers.length) * 100) : 70
    
    const eeScoreGlobal = eeAnswer?.auto_feedback?.score_global
    const eeScore = eeScoreGlobal ? Math.round((eeScoreGlobal / 20) * 100) : 75

    const eoScoreGlobal = eoAnswer?.auto_feedback?.score_global
    const eoScore = eoScoreGlobal ? Math.round((eoScoreGlobal / 20) * 100) : 65

    return [
      { module: 'CO', score: coScore, target: 85 },
      { module: 'CE', score: ceScore, target: 85 },
      { module: 'EE', score: eeScore, target: 85 },
      { module: 'EO', score: eoScore, target: 85 }
    ]
  }

  // Find weakest module
  const getWeakestModuleInfo = () => {
    if (!isSimulation) {
      const scorePct = isExpression 
        ? (feedback?.score_global ? (feedback.score_global / 20) * 100 : 0)
        : (totalCount > 0 ? (correctCount / totalCount) * 100 : 0)
      
      if (scorePct < 80) {
        return {
          module: session.module as 'CO' | 'CE' | 'EE' | 'EO',
          score: scorePct,
          isWeak: true
        }
      }
      return null
    }

    const coAnswers = answers.filter(a => a.questions?.module === 'CO')
    const ceAnswers = answers.filter(a => a.questions?.module === 'CE')
    const eeAnswer = answers.find(a => a.questions?.module === 'EE')
    const eoAnswer = answers.find(a => a.questions?.module === 'EO')

    const coScore = coAnswers.length > 0 ? (coAnswers.filter(a => a.is_correct).length / coAnswers.length) * 100 : 100
    const ceScore = ceAnswers.length > 0 ? (ceAnswers.filter(a => a.is_correct).length / ceAnswers.length) * 100 : 100
    const eeScore = eeAnswer?.auto_feedback?.score_global ? (eeAnswer.auto_feedback.score_global / 20) * 100 : 100
    const eoScore = eoAnswer?.auto_feedback?.score_global ? (eoAnswer.auto_feedback.score_global / 20) * 100 : 100

    const scores = [
      { module: 'CO', score: coScore },
      { module: 'CE', score: ceScore },
      { module: 'EE', score: eeScore },
      { module: 'EO', score: eoScore }
    ]

    scores.sort((a, b) => a.score - b.score)
    const lowest = scores[0]
    
    if (lowest.score < 90) {
      return {
        module: lowest.module as 'CO' | 'CE' | 'EE' | 'EO',
        score: lowest.score,
        isWeak: true
      }
    }
    return null
  }

  const weakestInfo = getWeakestModuleInfo()

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none">
          ← Retour au tableau de bord
        </Link>
        {/* Header Title */}
        <div className="text-center md:text-left select-none space-y-1">
          <h1 className="text-3xl font-extrabold text-[#1B3A6B]">
            {isSimulation ? "Rapport de Simulation Officielle" : "Rapport d'Entraînement"}
          </h1>
          <p className="text-gray-500">
            {isSimulation 
              ? `Session globale ${session.test_type === 'TEF_CANADA' ? 'TEF Canada' : 'TCF Canada'} complétée`
              : "Analyse détaillée de vos performances sur cette épreuve."
            }
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Score / Global Grade */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              {isSimulation ? "Précision Globale" : (isExpression ? "Note Globale IA" : "Score de Précision")}
            </span>
            <span className="text-4xl font-extrabold text-[#1B3A6B]">
              {isSimulation
                ? `${Math.round((answers.filter(a => a.is_correct || (a.auto_feedback?.score_global && a.auto_feedback.score_global >= 15)).length / Math.max(answers.length, 1)) * 100)}%`
                : (isExpression 
                  ? (feedback?.score_global ? `${feedback.score_global} / 20` : 'Évalué')
                  : `${correctCount} / ${totalCount}`
                )
              }
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {isSimulation ? "taux de réussite estimé" : (isExpression ? "basé sur la grille CECRL" : "questions correctes")}
            </span>

            {/* Comparaison historique */}
            {prevSession && (
              <div className="mt-2 text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                {(() => {
                  const currentScore = isSimulation
                    ? Math.round((answers.filter(a => a.is_correct || (a.auto_feedback?.score_global && a.auto_feedback.score_global >= 15)).length / Math.max(answers.length, 1)) * 100)
                    : (isExpression 
                      ? (feedback?.score_global || 0)
                      : (totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0)
                    )
                  
                  const prevScore = isSimulation
                    ? (prevSession.score_auto || 0)
                    : (isExpression 
                      ? (prevSession.score_auto ? Math.round((prevSession.score_auto / 100) * 20) : 0)
                      : (prevSession.score_auto || 0)
                    )

                  const diff = currentScore - prevScore
                  if (diff > 0) return `📈 +${Math.round(diff)}% vs simulation précédente`
                  if (diff < 0) return `📉 ${Math.round(Math.abs(diff))}% vs simulation précédente`
                  return `⚖️ Même score que votre dernier essai`
                })()}
              </div>
            )}
          </div>

          {/* Card 2: NCLC Estimate */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Niveau NCLC Estimé</span>
            <span className="text-4xl font-extrabold text-success">
              {session.nclc_estimate || (isExpression && feedback?.nclc_estime) || 'C1'}
            </span>
            <span className="text-xs text-gray-500 mt-1">équivalence CECRL officielle</span>
          </div>

          {/* Card 3: XP Gained */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Points d'XP Gagnés</span>
            <span className="text-4xl font-extrabold text-[#C55A11]">+{xpEarned} XP</span>
            <span className="text-xs text-gray-500 mt-1">ajoutés à votre progression</span>
          </div>
        </div>

        {/* Banner de partage WhatsApp */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span>💬</span> Partagez vos progrès avec votre communauté
            </h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Aidez d'autres candidats et célébrez vos progrès en partageant votre score estimé de <strong>{session.nclc_estimate || (isExpression && feedback?.nclc_estime) || 'C1'}</strong> sur WhatsApp.
            </p>
          </div>
          <button
            onClick={() => {
              const estimateNclc = session.nclc_estimate || (isExpression && feedback?.nclc_estime) || 'C1'
              const scorePercent = isSimulation
                ? Math.round((answers.filter(a => a.is_correct || (a.auto_feedback?.score_global && a.auto_feedback.score_global >= 15)).length / Math.max(answers.length, 1)) * 100)
                : (isExpression 
                  ? (feedback?.score_global ? Math.round((feedback.score_global / 20) * 100) : 0)
                  : (totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0)
                )
              
              const shareText = `J'ai obtenu une estimation de ${estimateNclc} (${scorePercent}%) lors de ma préparation TCF/TEF Canada sur ayePREP ! Préparez-vous avec moi : https://ayeprep.com`
              window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
            }}
            className="bg-[#25D366] hover:bg-[#1ebd59] text-white px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 shadow-sm"
          >
            Partager sur WhatsApp
          </button>
        </div>

        {/* Section Recommandations / Next Steps */}
        {weakestInfo && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-extrabold text-amber-900 text-lg">
                  Axe d'amélioration prioritaire : {weakestInfo.module}
                </h3>
                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                  Vos résultats montrent que le module <strong>{weakestInfo.module === 'CO' ? 'Compréhension de l\'Oral' : weakestInfo.module === 'CE' ? 'Compréhension des Écrits' : weakestInfo.module === 'EE' ? 'Expression Écrite' : 'Expression Orale'}</strong> est votre point faible sur cette session (précision de {Math.round(weakestInfo.score)}%).
                </p>
              </div>
            </div>
            
            <div className="border-t border-amber-200/60 pt-4">
              <h4 className="font-bold text-amber-950 text-sm mb-3">📋 Plan d'action recommandé ("Next Steps") :</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weakestInfo.module === 'CO' && (
                  <>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 1</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">S'entraîner sur 5 épreuves de Compréhension Orale.</p>
                      </div>
                      <Link to="/modules" className="text-xs font-bold text-[#1B3A6B] hover:underline">Pratiquer le CO →</Link>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 2</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Visionner le guide vidéo méthodologique CO.</p>
                      </div>
                      <Link to="/dashboard" className="text-xs font-bold text-[#1B3A6B] hover:underline">Voir les vidéos →</Link>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 3</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Consulter la fiche d'aide à la Compréhension.</p>
                      </div>
                      <Link to="/aide" className="text-xs font-bold text-[#1B3A6B] hover:underline">Ouvrir le Centre d'aide →</Link>
                    </div>
                  </>
                )}
                {weakestInfo.module === 'CE' && (
                  <>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 1</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Pratiquer 5 exercices avec textes longs de Compréhension Écrite.</p>
                      </div>
                      <Link to="/modules" className="text-xs font-bold text-[#1B3A6B] hover:underline">Pratiquer le CE →</Link>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 2</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Visionner la vidéo 'Lire plus vite' pour le CE.</p>
                      </div>
                      <Link to="/dashboard" className="text-xs font-bold text-[#1B3A6B] hover:underline">Voir les vidéos →</Link>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 3</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Consulter l'article 'Compréhension des Écrits'.</p>
                      </div>
                      <Link to="/aide" className="text-xs font-bold text-[#1B3A6B] hover:underline">Ouvrir le Centre d'aide →</Link>
                    </div>
                  </>
                )}
                {weakestInfo.module === 'EE' && (
                  <>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 1</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Rédiger une nouvelle épreuve EE avec correction IA.</p>
                      </div>
                      <Link to="/dashboard" className="text-xs font-bold text-[#1B3A6B] hover:underline">Lancer une session EE →</Link>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 2</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Étudier le corrigé type (Proposition C2) ci-dessous.</p>
                      </div>
                      <button onClick={() => window.scrollTo({top: document.body.scrollHeight * 0.7, behavior: 'smooth'})} className="text-xs font-bold text-left text-[#1B3A6B] hover:underline">Voir le corrigé type →</button>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 3</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Révisez la structure d'essai argumenté.</p>
                      </div>
                      <Link to="/aide" className="text-xs font-bold text-[#1B3A6B] hover:underline">Ouvrir le Centre d'aide →</Link>
                    </div>
                  </>
                )}
                {weakestInfo.module === 'EO' && (
                  <>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 1</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Lancer une nouvelle épreuve EO pour s'entraîner à parler.</p>
                      </div>
                      <Link to="/dashboard" className="text-xs font-bold text-[#1B3A6B] hover:underline">Lancer une session EO →</Link>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 2</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Analyser votre transcription Whisper ci-dessous.</p>
                      </div>
                      <button onClick={() => window.scrollTo({top: document.body.scrollHeight * 0.6, behavior: 'smooth'})} className="text-xs font-bold text-left text-[#1B3A6B] hover:underline">Analyser mon enregistrement →</button>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-100/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">ÉTAPE 3</span>
                        <p className="text-xs text-amber-900 font-semibold mb-3">Lire les conseils d'Expression Orale.</p>
                      </div>
                      <Link to="/aide" className="text-xs font-bold text-[#1B3A6B] hover:underline">Ouvrir le Centre d'aide →</Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Competencies Radar Chart for Simulation */}
        {isSimulation && (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#1B3A6B] border-b pb-3 select-none">
              Profil de Compétences sur cette Simulation
            </h2>
            <div className="flex justify-center bg-gray-50 p-6 rounded-2xl">
              <ProgressRadarChart data={getSimulationRadarData()} />
            </div>
            <p className="text-center text-xs text-gray-500 leading-relaxed max-w-lg mx-auto">
              Ce radar de performance croise vos réponses aux épreuves de compréhension (CO/CE) et les évaluations automatiques par critère de notre modèle IA sur vos productions d'expression (EE/EO).
            </p>
          </div>
        )}

        {/* Detailed AI Critiques for EE/EO */}
        {isExpression && feedback ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Évaluation Détaillée de l'IA</h2>

            {/* General Feedback Resume */}
            {feedback.resume && (
              <div className="bg-[#1B3A6B]/5 border border-[#1B3A6B]/20 p-5 rounded-2xl">
                <h3 className="font-bold text-[#1B3A6B] mb-2 text-base">Synthèse du Correcteur :</h3>
                <p className="text-gray-700 leading-relaxed text-sm italic">"{feedback.resume}"</p>
              </div>
            )}

            {/* Criteria Breakdown */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-3">Analyse par Critère</h3>
              <div className="space-y-6">
                {Object.entries(feedback.criteres || {}).map(([key, item]: [string, any]) => {
                  const label = CRITERIA_LABELS[key] || key
                  const percent = getPercent(item.score)
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-700">{label}</span>
                        <span className="font-extrabold text-[#1B3A6B] bg-[#1B3A6B]/5 px-2 py-0.5 rounded text-xs">
                          {item.score} / {item.score <= 4 ? '4' : '100'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={cn('h-2.5 rounded-full transition-all duration-500', getCriteriaColorClass(item.score))}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-gray-600 text-sm pl-2 border-l-2 border-gray-200 leading-relaxed">
                        {item.commentaire}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actionable Suggestions */}
            {feedback.suggestions && feedback.suggestions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 text-lg border-b pb-2">💡 Recommandations et Axes d'Amélioration</h3>
                <ul className="space-y-3">
                  {feedback.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                      <span className="text-[#C55A11] shrink-0 font-bold">➜</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* Detailed answers display */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
            {isExpression ? "Votre Production et Corrigé" : "Analyse Question par Question"}
          </h2>

          {answers.length === 0 ? (
            <p className="text-gray-500 text-center py-6 bg-white rounded-2xl border border-dashed">
              Aucun détail disponible pour cette session.
            </p>
          ) : (
            answers.map((answer, index) => {
              const { questions: q } = answer
              if (!q) return null
              return (
                <div key={answer.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                  {/* Task Header */}
                  <div className="flex justify-between items-center border-b pb-3 mb-1 select-none">
                    <span className="text-sm font-bold text-gray-500">
                      Tâche {index + 1} · {q.module} · Niveau {q.level}
                    </span>
                    {q.module === 'EE' || q.module === 'EO' ? (
                      <span className="text-[#1B3A6B] text-xs font-bold bg-[#1B3A6B]/10 px-2.5 py-1 rounded-full uppercase">
                        Évalué par l'IA
                      </span>
                    ) : answer.is_correct ? (
                      <span className="text-success flex items-center gap-1 text-xs font-extrabold bg-success/10 px-2.5 py-1 rounded-full uppercase">
                        ✓ Correct
                      </span>
                    ) : (
                      <span className="text-error flex items-center gap-1 text-xs font-extrabold bg-error/10 px-2.5 py-1 rounded-full uppercase">
                        × Incorrect
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <h3 className="text-base font-bold text-gray-800 leading-snug">
                    {q.question_text}
                  </h3>

                  {/* EE Specific Render */}
                  {q.module === 'EE' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Votre Rédaction :</h4>
                        <p className="font-serif text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                          {answer.user_answer}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* EO Specific Render */}
                  {q.module === 'EO' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider select-none">Votre Enregistrement :</h4>
                        {answer.user_answer && (
                          <audio src={answer.user_answer} controls className="max-w-md w-full h-10" />
                        )}
                        {answer.audio_transcript && (
                          <div className="mt-2 border-t pt-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1 select-none">Transcription Whisper :</span>
                            <p className="text-gray-700 italic leading-relaxed text-sm">
                              "{answer.audio_transcript}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* QCM Options Rendering */}
                  {q.module !== 'EE' && q.module !== 'EO' && q.options && (
                    <div className="grid grid-cols-1 gap-2.5">
                      {Object.entries(q.options).map(([key, val]) => {
                        const isCorrectAnswer = q.correct_answer === key
                        const isUserAnswer = answer.user_answer === key
                        
                        return (
                          <div
                            key={key}
                            className={cn(
                              'flex items-center gap-3 p-3.5 rounded-xl border text-sm transition-all',
                              isCorrectAnswer && 'border-success bg-success/5 text-success font-semibold',
                              isUserAnswer && !isCorrectAnswer && 'border-error bg-error/5 text-error font-semibold',
                              !isCorrectAnswer && !isUserAnswer && 'border-gray-100 bg-white text-gray-600'
                            )}
                          >
                            <span className={cn(
                              'w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs shrink-0',
                              isCorrectAnswer && 'bg-success text-white border-success',
                              isUserAnswer && !isCorrectAnswer && 'bg-error text-white border-error',
                              !isCorrectAnswer && !isUserAnswer && 'border-gray-200 text-gray-400'
                            )}>
                              {key}
                            </span>
                            <span className="text-sm shrink-1">{val}</span>
                            {isCorrectAnswer && <span className="ml-auto text-xs font-extrabold text-success uppercase">Bonne Réponse</span>}
                            {isUserAnswer && !isCorrectAnswer && <span className="ml-auto text-xs font-extrabold text-error uppercase">Votre Choix</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Model Answer (Corrigé type) for EE/EO */}
                  {(q.module === 'EE' || q.module === 'EO') && q.model_answer && (
                    <div className="bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                      <strong className="text-[#1B3A6B] font-bold block mb-1">💡 Proposition de corrigé type (Niveau C2) :</strong>
                      <p className="whitespace-pre-line font-serif text-sm md:text-base leading-relaxed mt-2 text-gray-800">
                        {q.model_answer}
                      </p>
                    </div>
                  )}

                  {/* Standard QCM Pedagogical Explanation */}
                  {q.module !== 'EE' && q.module !== 'EO' && q.explanation && (
                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed mt-2">
                      <strong className="text-orange-800 font-bold block mb-1">Explication Pédagogique :</strong>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Action button */}
        <div className="text-center pt-4 select-none">
          <Link
            to="/dashboard"
            className="inline-flex justify-center items-center px-6 py-3 bg-[#1B3A6B] hover:bg-[#12274A] text-white rounded-xl font-bold shadow-sm transition-all"
          >
            Retourner au Tableau de Bord
          </Link>
        </div>
      </div>
    </div>
  )
}
