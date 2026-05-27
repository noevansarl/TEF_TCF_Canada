import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '')
    if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const body = await req.json()
    const { answer_id, audio_storage_path, task_description, test_type } = body

    // 1. Télécharger l'audio depuis Supabase Storage
    const { data: audioData, error: storageError } = await supabase.storage
      .from('audio-responses')
      .download(audio_storage_path)

    if (storageError || !audioData) {
      return new Response('Audio not found', { status: 404, headers: corsHeaders })
    }

    // 2. Transcription Whisper
    const audioFile = new File([audioData], 'recording.webm', { type: 'audio/webm' })
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'fr',
      response_format: 'verbose_json',
      temperature: 0,
    })

    const transcript = transcription.text

    // 3. Analyse GPT-4o de la transcription
    const analysisPrompt = `Tu es un correcteur expert pour les examens d'expression orale 
TCF Canada et TEF Canada. Analyse cette transcription de production orale et évalue-la 
selon les critères CECRL officiels.

Tâche : ${task_description}
Test : ${test_type}

Transcription automatique :
---
${transcript}
---

Retourne un JSON avec la même structure que pour l'Expression Écrite :
{
  "criteres": {
    "respect_tache":  { "score": X, "commentaire": "..." },
    "coherence":      { "score": X, "commentaire": "..." },
    "lexique":        { "score": X, "commentaire": "..." },
    "morphosyntaxe":  { "score": X, "commentaire": "..." },
    "conventions":    { "score": X, "commentaire": "..." }
  },
  "score_global": X,
  "suggestions": ["...", "...", "..."],
  "points_forts": ["..."],
  "resume": "...",
  "nclc_estime": "B1|B2|C1|C2"
}

Tiens compte que c'est une transcription automatique — des erreurs de transcription 
peuvent exister.`

    const analysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    })

    const feedback = JSON.parse(analysis.choices[0].message.content || '{}')

    // 4. Sauvegarder
    await supabase.from('answers').update({
      audio_transcript: transcript,
      auto_feedback: feedback,
    }).eq('id', answer_id).eq('user_id', user.id)

    return new Response(JSON.stringify({ transcript, feedback }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('EO processing error:', error)
    return new Response(JSON.stringify({ error: 'Processing failed', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
