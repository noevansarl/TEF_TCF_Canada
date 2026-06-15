import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface CriteriaScores {
  criterion_1: number // Respect consigne
  criterion_2: number // Cohérence/Organisation
  criterion_3: number // Lexique
  criterion_4: number // Morphosyntaxe
  criterion_5: number // Conventions (EE) ou Prononciation (EO)
}

interface CorrectionDetail {
  id: string
  module: 'EE' | 'EO'
  test_type: 'TCF_CANADA' | 'TEF_CANADA'
  status: 'pending' | 'assigned' | 'in_review' | 'completed' | 'disputed'
  global_score: number | null
  feedback_text: string | null
  suggestions: string[] | null
  expert_notes: string | null
  score_criteria: CriteriaScores | null
  session_id: string
  answer_id: string
  user: {
    id: string
    full_name: string
    email: string
  }
  answer: {
    user_answer: string | null
    audio_url: string | null
    audio_transcript: string | null
    question: {
      question_text: string
    }
  }
}

export default function ExpertCorrectionEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [correction, setCorrection] = useState<CorrectionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [criteria, setCriteria] = useState<CriteriaScores>({
    criterion_1: 10,
    criterion_2: 10,
    criterion_3: 10,
    criterion_4: 10,
    criterion_5: 10
  })
  const [feedbackText, setFeedbackText] = useState('')
  const [suggestionsList, setSuggestionsList] = useState<string[]>([])
  const [newSuggestion, setNewSuggestion] = useState('')
  const [expertNotes, setExpertNotes] = useState('')

  useEffect(() => {
    async function loadCorrection() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const { data, error: fetchErr } = await supabase
          .from('expert_corrections')
          .select(`
            id,
            module,
            test_type,
            status,
            global_score,
            feedback_text,
            suggestions,
            expert_notes,
            score_criteria,
            session_id,
            answer_id,
            user:user_id ( id, full_name, email ),
            answer:answer_id (
              user_answer,
              audio_url,
              audio_transcript,
              question:question_id (
                question_text
              )
            )
          `)
          .eq('id', id)
          .single()

        if (fetchErr) throw fetchErr
        if (!data) throw new Error('Correction introuvable.')

        const detail = data as any as CorrectionDetail
        setCorrection(detail)

        // Initialize form states from DB if they exist
        if (detail.score_criteria) {
          setCriteria(detail.score_criteria)
        }
        if (detail.feedback_text) {
          setFeedbackText(detail.feedback_text)
        }
        if (detail.suggestions) {
          setSuggestionsList(detail.suggestions)
        }
        if (detail.expert_notes) {
          setExpertNotes(detail.expert_notes)
        }
      } catch (err: unknown) {
        console.error(err)
        setError((err as Error).message || 'Erreur lors du chargement de la correction.')
      } finally {
        setLoading(false)
      }
    }

    loadCorrection()
  }, [id])

  const handleCriterionChange = (key: keyof CriteriaScores, value: number) => {
    setCriteria(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleAddSuggestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSuggestion.trim()) return
    setSuggestionsList(prev => [...prev, newSuggestion.trim()])
    setNewSuggestion('')
  }

  const handleRemoveSuggestion = (index: number) => {
    setSuggestionsList(prev => prev.filter((_, i) => i !== index))
  }

  // Score global sur 100 (somme des 5 critères notés chacun sur 20)
  const globalScore = criteria.criterion_1 + criteria.criterion_2 + criteria.criterion_3 + criteria.criterion_4 + criteria.criterion_5

  const handleSaveDraft = async () => {
    if (!id) return
    setSubmitting(true)
    try {
      const { error: updateErr } = await supabase
        .from('expert_corrections')
        .update({
          score_criteria: criteria,
          global_score: globalScore,
          feedback_text: feedbackText,
          suggestions: suggestionsList,
          expert_notes: expertNotes,
          status: 'in_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateErr) throw updateErr
      alert('Brouillon sauvegardé avec succès !')
    } catch (err: unknown) {
      console.error(err)
      alert((err as Error).message || 'Erreur lors de la sauvegarde du brouillon.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitFinal = async () => {
    if (!id || !correction) return
    if (!feedbackText.trim()) {
      alert('Veuillez rédiger un feedback détaillé avant de soumettre la correction.')
      return
    }
    if (suggestionsList.length === 0) {
      alert('Veuillez ajouter au moins une suggestion d\'amélioration pour le candidat.')
      return
    }

    const confirmSubmit = window.confirm(
      'Êtes-vous sûr de vouloir finaliser cette correction ? Le candidat recevra immédiatement ses résultats et le score ne pourra plus être modifié.'
    )
    if (!confirmSubmit) return

    setSubmitting(true)
    try {
      // 1. Mettre à jour expert_corrections
      const { error: updateErr } = await supabase
        .from('expert_corrections')
        .update({
          score_criteria: criteria,
          global_score: globalScore,
          feedback_text: feedbackText,
          suggestions: suggestionsList,
          expert_notes: expertNotes,
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateErr) throw updateErr

      // 2. Calculer le niveau estimé CECRL/NCLC pour la session
      let estimatedLevel = 'A1'
      if (globalScore >= 85) estimatedLevel = 'C2'
      else if (globalScore >= 70) estimatedLevel = 'C1'
      else if (globalScore >= 50) estimatedLevel = 'B2'
      else if (globalScore >= 35) estimatedLevel = 'B1'
      else if (globalScore >= 20) estimatedLevel = 'A2'

      // 3. Mettre à jour la session du candidat
      const { error: sessionErr } = await supabase
        .from('sessions')
        .update({
          score_expert: globalScore,
          nclc_estimate: estimatedLevel,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', correction.session_id)
        .select()
        .single()

      if (sessionErr) throw sessionErr

      // Déclencher le sync LTI si c'est une session LMS
      if (correction.session_id) {
        try {
          const { data: sessionData } = await supabase
            .from('sessions')
            .select('metadata')
            .eq('id', correction.session_id)
            .maybeSingle()

          if (sessionData?.metadata?.lis_outcome_service_url) {
            await supabase.functions.invoke('lti-grade-sync', {
              body: { session_id: correction.session_id }
            })
            console.log('LTI grade sync triggered for expert correction')
          }
        } catch (err) {
          console.error('Failed to trigger LTI grade sync:', err)
        }
      }

      // 4. Envoyer une notification interne au candidat
      const { error: notifErr } = await supabase
        .from('notifications')
        .insert({
          user_id: correction.user.id,
          type: 'correction_ready',
          title: 'Correction expert disponible !',
          body: `Votre épreuve d'${correction.module} (${correction.test_type === 'TEF_CANADA' ? 'TEF' : 'TCF'} Canada) a été corrigée. Note finale : ${globalScore}/100.`,
          data: {
            correction_id: id,
            session_id: correction.session_id,
            global_score: globalScore
          },
          sent_at: new Date().toISOString()
        })

      if (notifErr) throw notifErr

      alert('Correction finalisée et transmise au candidat avec succès !')
      navigate('/expert')
    } catch (err: unknown) {
      console.error(err)
      alert((err as Error).message || 'Erreur lors de la validation finale de la correction.')
    } finally {
      setSubmitting(false)
    }
  }

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

  if (error || !correction) {
    return (
      <div className="space-y-4 font-sans">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-semibold">
          {error || 'Correction introuvable.'}
        </div>
        <Link to="/expert" className="inline-block text-sm text-[#1B3A6B] hover:underline font-bold">
          ← Retour à la file d'attente
        </Link>
      </div>
    )
  }

  const { module, test_type, user: candidate, answer } = correction

  return (
    <div className="space-y-6 font-sans select-text">
      {/* Back link & Actions header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none mb-6">
        <div>
          <Link to="/expert" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors bg-white/50 backdrop-blur-sm border border-slate-200/40 px-3.5 py-1.5 rounded-full shadow-sm hover:shadow">
            <span>←</span> <span>Retour à la file</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Évaluation de {candidate?.full_name || 'Candidat'}
          </h1>
          <p className="text-xs text-slate-550 font-semibold mt-1">
            Épreuve : <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/50 uppercase font-black text-[10px]">{module}</span> · {test_type === 'TEF_CANADA' ? 'TEF Canada' : 'TCF Canada'}
          </p>
        </div>
        
        {correction.status !== 'completed' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={submitting}
              className="px-4.5 py-2.5 border border-slate-250 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition-all shadow-sm disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sauvegarder Brouillon
            </button>
            <button
              onClick={handleSubmitFinal}
              disabled={submitting}
              className="px-4.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-650 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/10 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Valider & Soumettre Final
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column (2/3): Production & Question prompt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question / prompt */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-6 shadow-sm">
            <span className="text-[10px] font-black text-[#1B3A6B] bg-[#1B3A6B]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Consigne du test
            </span>
            <p className="text-slate-800 text-sm leading-relaxed mt-4 font-semibold italic">
              "{answer?.question?.question_text}"
            </p>
          </div>

          {/* Candidate response representation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-sm font-bold text-slate-800">Réponse du Candidat</span>
              {module === 'EE' && answer?.user_answer && (
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">
                  {answer.user_answer.split(/\s+/).filter(Boolean).length} mots
                </span>
              )}
            </div>

            {module === 'EE' ? (
              <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-800 text-sm leading-relaxed font-mono whitespace-pre-wrap select-text shadow-inner">
                {answer?.user_answer || 'Aucun texte soumis.'}
              </div>
            ) : (
              <div className="space-y-5">
                {/* Audio player */}
                {answer?.audio_url ? (
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2.5 shadow-sm">
                    <span className="text-xs text-slate-500 font-bold">Enregistrement audio :</span>
                    <audio src={answer.audio_url} controls className="w-full mt-1.5 focus:outline-none" />
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl text-center text-slate-400 text-sm">
                    Fichier audio manquant ou non stocké.
                  </div>
                )}

                {/* Transcription Whisper */}
                {answer?.audio_transcript && (
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-bold block">Transcription vocale automatique (Whisper) :</span>
                    <div className="p-5 bg-blue-50/30 border border-blue-105/50 rounded-2xl text-slate-700 text-sm leading-relaxed select-text italic">
                      "{answer.audio_transcript}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column (1/3): Rating panel */}
        <div className="space-y-6">
          {/* Global score indicator */}
          <div className="bg-gradient-to-br from-[#1B3A6B] to-indigo-900 text-white p-7 rounded-3xl text-center shadow-lg shadow-indigo-900/10 select-none">
            <span className="text-xs opacity-75 font-semibold block uppercase tracking-wider">Note globale</span>
            <span className="text-5xl font-black block my-2.5">{globalScore} / 100</span>
            <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-bold border border-white/10 uppercase tracking-wide">
              CECRL Estimé : {globalScore >= 85 ? 'C2' : globalScore >= 70 ? 'C1' : globalScore >= 50 ? 'B2' : globalScore >= 35 ? 'B1' : globalScore >= 20 ? 'A2' : 'A1'}
            </span>
          </div>

          {/* Grille d'évaluation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-xs text-slate-400 border-b border-slate-100 pb-2 uppercase tracking-wide">
              Critères CECRL
            </h3>

            {/* Criteria items with styled range selectors */}
            {[
              { id: 'criterion_1', label: '1. Respect de la consigne' },
              { id: 'criterion_2', label: '2. Cohérence & Organisation' },
              { id: 'criterion_3', label: '3. Richesse du lexique' },
              { id: 'criterion_4', label: '4. Morphosyntaxe & Conjugaison' },
              {
                id: 'criterion_5',
                label: module === 'EE' ? '5. Conventions & Orthographe' : '5. Prononciation & Débit'
              }
            ].map(crit => {
              const val = criteria[crit.id as keyof CriteriaScores]
              return (
                <div key={crit.id} className="space-y-2.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{crit.label}</span>
                    <span className="text-[#1B3A6B] bg-[#1B3A6B]/5 px-2 py-0.5 rounded-full border border-slate-200/40">{val} / 20</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    disabled={correction.status === 'completed'}
                    value={val}
                    onChange={e => handleCriterionChange(crit.id as keyof CriteriaScores, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1B3A6B]"
                  />
                </div>
              )
            })}
          </div>

          {/* Feedback & Suggestions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-5">
            <h3 className="font-extrabold text-xs text-slate-400 border-b border-slate-100 pb-2 uppercase tracking-wide">
              Retour Pédagogique
            </h3>

            {/* Feedback text */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500">Feedback détaillé</label>
              <textarea
                disabled={correction.status === 'completed'}
                rows={4}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Rédigez une analyse complète des points forts et des axes de progrès..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 text-xs text-slate-700 leading-relaxed shadow-inner placeholder-slate-400 bg-slate-50/50 focus:bg-white transition-all"
              />
            </div>

            {/* Suggestions list */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-500">Suggestions d'amélioration</label>
              
              {/* Added points */}
              {suggestionsList.length > 0 && (
                <ul className="space-y-2 select-none">
                  {suggestionsList.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl text-xs text-slate-700 border border-slate-200/40">
                      <span className="text-orange-500 font-bold">•</span>
                      <span className="flex-1 leading-relaxed">{sug}</span>
                      {correction.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSuggestion(i)}
                          className="text-slate-400 font-bold hover:text-rose-500 ml-1 px-1 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Add form */}
              {correction.status !== 'completed' && (
                <form onSubmit={handleAddSuggestion} className="flex gap-2">
                  <input
                    type="text"
                    value={newSuggestion}
                    onChange={e => setNewSuggestion(e.target.value)}
                    placeholder="Ex: Revoir l'accord du subjonctif..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 text-xs text-slate-700 transition-all bg-slate-50/50 focus:bg-white shadow-inner"
                  />
                  <button
                    type="submit"
                    className="bg-[#1B3A6B] hover:bg-[#12274A] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Ajouter
                  </button>
                </form>
              )}
            </div>

            {/* Expert internal notes */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-450">Notes internes expert (privé)</label>
              <textarea
                disabled={correction.status === 'completed'}
                rows={2}
                value={expertNotes}
                onChange={e => setExpertNotes(e.target.value)}
                placeholder="Remarques privées de correction..."
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none text-[11px] text-gray-550 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
