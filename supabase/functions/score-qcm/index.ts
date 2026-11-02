import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0'

const ALLOWED_ORIGINS = ['https://ayeprep.com', 'https://www.ayeprep.com', 'http://localhost:5173']

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

interface ScoreRequest {
  session_id: string
  answers: Record<string, string>    // questionId → réponse utilisateur (A–D)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_ANSWERS = 150
const NCLC_RANK: Record<string, number> = { 'C2': 6, 'C1': 5, 'B2+': 4, 'B2': 3, 'B1+': 2, 'B1': 2, 'A2': 1, 'A1': 0 }

// Nombre officiel de questions par épreuve (= contrainte check_question_count)
function officialQuestionCount(module: string, testType: string): number {
  if (testType === 'TEF_CANADA') return module === 'CO' ? 60 : 50
  return 39
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const body: ScoreRequest = await req.json()
    const { session_id, answers } = body
    if (typeof session_id !== 'string' || !UUID_RE.test(session_id)) {
      return new Response('Invalid session_id', { status: 400, headers: corsHeaders })
    }

    // Vérifier que la session appartient à l'utilisateur
    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single()

    if (!session) return new Response('Session not found', { status: 404, headers: corsHeaders })

    // Une session déjà notée ne peut pas être rejouée (XP / score à chaque appel)
    if (session.status !== 'in_progress') {
      return new Response('Session already completed', { status: 409, headers: corsHeaders })
    }

    // Vérifier le délai côté serveur
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(session.started_at).getTime()) / 1000
    )
    if (elapsedSeconds > session.max_duration_s + 30) {
      // Tolérance de 30 secondes pour la latence réseau
      return new Response('Session expired', { status: 410, headers: corsHeaders })
    }

    // ── Réponses soumises : QCM uniquement, format strict ─────────────
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return new Response('Invalid answers', { status: 400, headers: corsHeaders })
    }
    const submitted = Object.entries(answers)
      .filter(([id, value]) => UUID_RE.test(id) && typeof value === 'string' && /^[A-D]$/.test(value))
    if (submitted.length === 0) {
      return new Response('No answers provided', { status: 400, headers: corsHeaders })
    }
    if (submitted.length > MAX_ANSWERS) {
      return new Response('Too many answers', { status: 400, headers: corsHeaders })
    }

    // ── Questions autorisées pour cette session ───────────────────────
    // La session fixe le module et le type d'examen ; si elle a une liste de
    // questions (sélection serveur, LTI), seules celles-ci sont acceptées.
    const isFullSession = String(session.module).startsWith('FULL_')
    const allowedModules = isFullSession ? ['CO', 'CE'] : [session.module]
    const sessionQuestionIds: string[] = Array.isArray(session.question_ids) ? session.question_ids : []
    const sessionQuestionSet = new Set(sessionQuestionIds)

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer, module, test_type')
      .in('id', submitted.map(([id]) => id))
    if (questionsError) throw questionsError

    const testType = session.test_type || 'TCF_CANADA'
    const scorable = (questions ?? []).filter((q: { id: string; module: string; test_type: string; correct_answer: string | null }) =>
      ['CO', 'CE'].includes(q.module)
      && allowedModules.includes(q.module)
      && [testType, 'BOTH'].includes(q.test_type)
      && q.correct_answer
      && (sessionQuestionSet.size === 0 || sessionQuestionSet.has(q.id))
    )
    if (scorable.length === 0) {
      return new Response('No QCM answers for this session', { status: 400, headers: corsHeaders })
    }

    // ── Score par module ──────────────────────────────────────────────
    const answerMap = new Map(submitted)
    const perModule: Record<string, { correct: number; answered: number }> = {}
    const answersToInsert = scorable.map((question: { id: string; module: string; correct_answer: string }) => {
      const userAnswer = answerMap.get(question.id)!
      const isCorrect = userAnswer === question.correct_answer
      perModule[question.module] ??= { correct: 0, answered: 0 }
      perModule[question.module].answered++
      if (isCorrect) perModule[question.module].correct++
      return { session_id, question_id: question.id, user_id: user.id, user_answer: userAnswer, is_correct: isCorrect }
    })

    // Total par module : nombre officiel en simulation, sinon les questions de la
    // session (non répondues = fausses) — répondre à une seule question juste ne
    // donne pas 100 %.
    const moduleTotal = (module: string, answered: number) => {
      if (isFullSession) return Math.max(answered, officialQuestionCount(module, testType))
      return Math.max(answered, sessionQuestionIds.length)
    }

    let correct = 0
    let total = 0
    const moduleResults = Object.entries(perModule).map(([module, stats]) => {
      const moduleTot = moduleTotal(module, stats.answered)
      correct += stats.correct
      total += moduleTot
      const result = testType === 'TEF_CANADA'
        ? calculateTEFScoreAndNCLC(stats.correct, moduleTot, module)
        : calculateTCFScoreAndNCLC(stats.correct, moduleTot, module)
      return { module, correct: stats.correct, total: moduleTot, ...result }
    })

    const scoreRatio = total > 0 ? correct / total : 0
    const xpEarned = Math.round(scoreRatio * 200)  // 0–200 XP

    // NCLC global = le plus faible des modules (comme compute_simulation_nclc)
    const weakest = moduleResults.reduce((min, r) => (NCLC_RANK[r.nclc] < NCLC_RANK[min.nclc] ? r : min))
    const scoring = { score_699: Math.round(scoreRatio * 699), nclc: weakest.nclc }

    // Contraintes de la table sessions :
    //  - score_auto ∈ [0, 100] → pourcentage (le score /699 est renvoyé à part)
    //  - nclc_estimate ∈ A1…C2 → 'B2+' / 'B1+' ramenés à 'B2' / 'B1'
    const scorePercent = Math.round(scoreRatio * 1000) / 10
    const nclcEstimate = scoring.nclc.replace('+', '')

    // Réponses : mise à jour des lignes enregistrées pendant la session
    const { error: answersError } = await supabase
      .from('answers')
      .upsert(answersToInsert, { onConflict: 'session_id,question_id' })
    if (answersError) throw answersError

    // Clôture de la session — conditionnée au statut pour empêcher une double notation
    const { data: updatedSession, error: sessionError } = await supabase
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: elapsedSeconds,
        score_auto: scorePercent,
        nclc_estimate: nclcEstimate,
      })
      .eq('id', session_id)
      .eq('status', 'in_progress')
      .select()
      .maybeSingle()
    if (sessionError) throw sessionError
    if (!updatedSession) {
      return new Response('Session already completed', { status: 409, headers: corsHeaders })
    }

    // Déclencher le sync LTI si c'est une session LMS
    if (updatedSession?.metadata?.lti === true) {
      try {
        await supabase.functions.invoke('lti-grade-sync', {
          body: { session_id }
        })
        console.log(`LTI grade sync triggered for session ${session_id}`)
      } catch (err) {
        console.error(`Failed to trigger LTI grade sync for session ${session_id}:`, err)
      }
    }

    // Mettre à jour XP + streak
    await supabase.rpc('award_session_xp', {
      p_user_id: user.id,
      p_session_id: session_id,
      p_xp: xpEarned,
    })

    // Mettre à jour progress_stats (par module : la table n'accepte que CO/CE/EE/EO)
    for (const r of moduleResults) {
      await updateProgressStats(supabase, user.id, { ...session, module: r.module, test_type: testType }, r.correct, r.total)
    }

    return new Response(JSON.stringify({
      score: scoring.score_699,       // échelle officielle /699
      score_percent: scorePercent,
      correct,
      total,
      xp_earned: xpEarned,
      nclc: scoring.nclc,             // valeur fine (B2+) pour l'affichage
      nclc_estimate: nclcEstimate,    // valeur enregistrée
      modules: moduleResults,
      session_id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('score-qcm error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
    })
  }
})

function calculateTEFScoreAndNCLC(correctAnswers: number, totalQuestions: number, module: string): { score_699: number, nclc: string } {
  const scorePercent = totalQuestions > 0 ? (correctAnswers / totalQuestions) : 0;
  const score_699 = Math.round(scorePercent * 699);

  let nclc = 'A1';
  if (module === 'CO') {
    if (score_699 >= 546) nclc = 'C2';
    else if (score_699 >= 503) nclc = 'C1';
    else if (score_699 >= 462) nclc = 'B2+';
    else if (score_699 >= 434) nclc = 'B2';
    else if (score_699 >= 393) nclc = 'B1+';
    else if (score_699 >= 352) nclc = 'B1';
    else if (score_699 >= 306) nclc = 'A2';
  } else if (module === 'CE') {
    if (score_699 >= 546) nclc = 'C2';
    else if (score_699 >= 512) nclc = 'C1';
    else if (score_699 >= 472) nclc = 'B2+';
    else if (score_699 >= 428) nclc = 'B2';
    else if (score_699 >= 379) nclc = 'B1+';
    else if (score_699 >= 330) nclc = 'B1';
    else if (score_699 >= 268) nclc = 'A2';
  }

  return { score_699, nclc };
}

function calculateTCFScoreAndNCLC(correctAnswers: number, totalQuestions: number, module: string): { score_699: number, nclc: string } {
  const scorePercent = totalQuestions > 0 ? (correctAnswers / totalQuestions) : 0;
  const score_699 = Math.round(scorePercent * 699);

  let nclc = 'A1';
  if (module === 'CO') {
    if (score_699 >= 549) nclc = 'C2';
    else if (score_699 >= 523) nclc = 'C1';
    else if (score_699 >= 503) nclc = 'B2+';
    else if (score_699 >= 458) nclc = 'B2';
    else if (score_699 >= 398) nclc = 'B1';
    else if (score_699 >= 331) nclc = 'A2';
  } else if (module === 'CE') {
    if (score_699 >= 549) nclc = 'C2';
    else if (score_699 >= 524) nclc = 'C1';
    else if (score_699 >= 499) nclc = 'B2+';
    else if (score_699 >= 453) nclc = 'B2';
    else if (score_699 >= 406) nclc = 'B1';
    else if (score_699 >= 342) nclc = 'A2';
  }

  return { score_699, nclc };
}

async function updateProgressStats(supabase: any, userId: string, 
    session: any, correct: number, total: number) {
  const { data: existing } = await supabase
    .from('progress_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('module', session.module)
    .eq('test_type', session.test_type)
    .maybeSingle()

  const scorePercent = total > 0 ? (correct / total) * 100 : 0
  if (existing) {
    const newAnswered = existing.questions_answered + total
    const newCorrect = existing.questions_correct + correct
    const newMastery = Math.min(
      100,
      existing.mastery_score * 0.7 + scorePercent * 0.3
    )
    await supabase.from('progress_stats').update({
      sessions_completed: existing.sessions_completed + 1,
      questions_answered: newAnswered,
      questions_correct: newCorrect,
      mastery_score: newMastery,
      avg_score: ((existing.avg_score || 0) * existing.sessions_completed + scorePercent) 
                  / (existing.sessions_completed + 1),
      best_score: Math.max(existing.best_score || 0, scorePercent),
      last_session_at: new Date().toISOString(),
    }).eq('user_id', userId).eq('module', session.module).eq('test_type', session.test_type)
  } else {
    await supabase.from('progress_stats').insert({
      user_id: userId,
      module: session.module,
      test_type: session.test_type,
      sessions_completed: 1,
      questions_answered: total,
      questions_correct: correct,
      mastery_score: scorePercent,
      avg_score: scorePercent,
      best_score: scorePercent,
      last_session_at: new Date().toISOString(),
    })
  }
}
