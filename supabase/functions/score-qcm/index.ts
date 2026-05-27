import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScoreRequest {
  session_id: string
  answers: Record<string, string>    // questionId → réponse utilisateur
}

serve(async (req: Request) => {
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

    const scorePercent = questions.length > 0 ? (correct / questions.length) * 100 : 0
    const xpEarned = Math.round(scorePercent * 2)  // 0–200 XP

    // Insérer les réponses en batch
    await supabase.from('answers').upsert(answersToInsert)

    // Mettre à jour la session
    const { data: updatedSession } = await supabase
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: elapsedSeconds,
        score_auto: scorePercent,
        nclc_estimate: calculateNclc(scorePercent),
      })
      .eq('id', session_id)
      .select()
      .single()

    // Mettre à jour XP + streak
    await supabase.rpc('award_session_xp', {
      p_user_id: user.id,
      p_session_id: session_id,
      p_xp: xpEarned,
    })

    // Mettre à jour progress_stats
    await updateProgressStats(supabase, user.id, session, correct, questions.length)

    return new Response(JSON.stringify({
      score: scorePercent,
      correct,
      total: questions.length,
      xp_earned: xpEarned,
      nclc: updatedSession?.nclc_estimate,
      session_id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function calculateNclc(scorePercent: number): string {
  if (scorePercent >= 90) return 'C2'
  if (scorePercent >= 75) return 'C1'
  if (scorePercent >= 60) return 'B2'
  if (scorePercent >= 45) return 'B1'
  if (scorePercent >= 30) return 'A2'
  return 'A1'
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
