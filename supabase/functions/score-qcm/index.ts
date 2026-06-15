import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  answers: Record<string, string>    // questionId → réponse utilisateur
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

    // Vérifier que la session appartient à l'utilisateur
    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single()

    if (!session) return new Response('Session not found', { status: 404, headers: corsHeaders })

    // Vérifier le délai côté serveur
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(session.started_at).getTime()) / 1000
    )
    if (elapsedSeconds > session.max_duration_s + 30) {
      // Tolérance de 30 secondes pour la latence réseau
      return new Response('Session expired', { status: 410, headers: corsHeaders })
    }

    // Récupérer les bonnes réponses
    const questionIds = Object.keys(answers)
    const { data: questions } = await supabase
      .from('questions')
      .select('id, correct_answer, module')
      .in('id', questionIds)

    if (!questions) return new Response('Questions not found', { status: 404, headers: corsHeaders })

    // Calculer le score
    let correct = 0
    const answersToInsert = []

    for (const question of questions) {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correct_answer

      if (isCorrect) correct++

      answersToInsert.push({
        session_id,
        question_id: question.id,
        user_id: user.id,
        user_answer: userAnswer,
        is_correct: isCorrect,
      })
    }

    const scorePercent = questions.length > 0 ? (correct / questions.length) : 0
    const xpEarned = Math.round(scorePercent * 200)  // 0–200 XP

    let officialScore = Math.round(scorePercent * 100);
    let finalNclc = 'A1';

    if (session.test_type === 'TEF_CANADA') {
      const result = calculateTEFScoreAndNCLC(correct, questions.length, session.module);
      officialScore = result.score_699;
      finalNclc = result.nclc;
    } else {
      // Default to TCF if unknown
      const result = calculateTCFScoreAndNCLC(correct, questions.length, session.module);
      officialScore = result.score_699;
      finalNclc = result.nclc;
    }

    // Insérer les réponses en batch
    await supabase.from('answers').upsert(answersToInsert)

    // Mettre à jour la session
    const { data: updatedSession } = await supabase
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: elapsedSeconds,
        score_auto: officialScore,
        nclc_estimate: finalNclc,
      })
      .eq('id', session_id)
      .select()
      .single()

    // Déclencher le sync LTI si c'est une session LMS
    if (updatedSession?.metadata?.lis_outcome_service_url) {
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

    // Mettre à jour progress_stats
    await updateProgressStats(supabase, user.id, session, correct, questions.length)

    return new Response(JSON.stringify({
      score: officialScore,
      correct,
      total: questions.length,
      xp_earned: xpEarned,
      nclc: updatedSession?.nclc_estimate,
      session_id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (_error) {
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
