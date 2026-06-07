import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const ALLOWED_ORIGINS = ['https://ayeprep.com', 'https://www.ayeprep.com', 'http://localhost:5173']
const VALID_TEST_TYPES = ['TCF_CANADA', 'TEF_CANADA']

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const body = await req.json()
    const { answer_id, audio_storage_path, task_description, test_type } = body

    // Validation des inputs
    if (typeof answer_id !== 'string' || typeof audio_storage_path !== 'string') {
      return new Response('Invalid input', { status: 400, headers: corsHeaders })
    }
    if (!VALID_TEST_TYPES.includes(test_type)) {
      return new Response('Invalid test_type', { status: 400, headers: corsHeaders })
    }
    // Vérifier que le chemin appartient bien à cet utilisateur (anti path traversal)
    if (!audio_storage_path.startsWith(`eo/${user.id}/`)) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    const { data: audioData, error: storageError } = await supabase.storage
      .from('audio-responses')
      .download(audio_storage_path)

    if (storageError || !audioData) {
      return new Response('Audio not found', { status: 404, headers: corsHeaders })
    }

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

    const analysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `Tu es un correcteur expert TCF/TEF Canada. Tâche : ${task_description}. Test : ${test_type}.\n\nTranscription :\n---\n${transcript}\n---\n\nRetourne un JSON : { "criteres": { "respect_tache": {"score":X,"commentaire":"..."}, "coherence": {"score":X,"commentaire":"..."}, "lexique": {"score":X,"commentaire":"..."}, "morphosyntaxe": {"score":X,"commentaire":"..."}, "conventions": {"score":X,"commentaire":"..."} }, "score_global": X, "suggestions": [...], "points_forts": [...], "resume": "...", "nclc_estime": "B1|B2|C1|C2" }`,
      }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    })

    const feedback = JSON.parse(analysis.choices[0].message.content ?? '{}')

    await supabase.from('answers').update({
      audio_transcript: transcript,
      auto_feedback: feedback,
    }).eq('id', answer_id).eq('user_id', user.id)

    return new Response(JSON.stringify({ transcript, feedback }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (_error) {
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
