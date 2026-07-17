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

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    
    // Check if it's a rate limit or server error
    const status = error.status || error.statusCode
    const isRetryable = !status || status === 429 || status >= 500
    if (!isRetryable) throw error

    console.warn(`OpenAI call failed: ${error.message}. Retrying in ${delay}ms... (${retries} retries left)`)
    await new Promise((resolve) => setTimeout(resolve, delay))
    return retryWithBackoff(fn, retries - 1, delay * 2)
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

    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_tier, subscription_expires_at')
      .eq('id', user.id)
      .single()

    const hasStripeAccess = ['avance', 'premium', 'institutionnel'].includes(userProfile?.subscription_tier ?? '')
      && (!userProfile?.subscription_expires_at || new Date(userProfile.subscription_expires_at) > new Date())

    let hasFedaPayAccess = false;
    let activePackInfo = null;

    if (!hasStripeAccess) {
      const { data: activePack } = await supabase
        .from('user_pack_subscriptions')
        .select('id, ai_trials_remaining')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .gt('ai_trials_remaining', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (activePack) {
        hasFedaPayAccess = true;
        activePackInfo = activePack;
      }
    }

    if (!hasStripeAccess && !hasFedaPayAccess) {
      return new Response('Subscription required or AI quota exhausted', { status: 402, headers: corsHeaders })
    }

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

    const transcription = await retryWithBackoff(() => openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'fr',
      response_format: 'verbose_json',
      prompt: "Voici la transcription d'un candidat passant un examen oral de français. Euh, ben, euh, alors, hmm. Ah bon ? Oui, tout à fait.",
      temperature: 0.2,
    }))

    const transcript = transcription.text

    const analysis = await retryWithBackoff(() => openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Tu es un examinateur expert et exigeant pour les épreuves d'Expression Orale du TCF Canada et TEF Canada. Tu évalues la transcription de l'audio d'un candidat.

Critères d'évaluation :
1. respect_tache : Le sujet est-il respecté ? Les actes de parole (informer, convaincre) sont-ils réalisés ?
2. coherence : Le discours est-il fluide et logique ? Y a-t-il beaucoup d'hésitations (euh, bah) qui gênent la compréhension ?
3. lexique : Richesse et variété du vocabulaire oral.
4. morphosyntaxe : Maîtrise de la grammaire à l'oral (accords, syntaxe verbale).
5. phonetique (utilisé ici sous 'conventions') : La prononciation implicite et l'aisance globale.

${test_type === 'TCF_CANADA'
  ? 'BARÈME TCF : Note CHAQUE critère de 0 à 4 points. Le score_global doit être la somme (total sur 20).'
  : 'BARÈME TEF : Note CHAQUE critère de 0 à 90 points. Le score_global doit être la somme (total sur 450).'}

RÈGLE NCLC : Le "nclc_estime" doit être au format "NCLC X" (ex: NCLC 5, NCLC 7). Pas de lettres (A1, B2).`
        },
        {
          role: 'user',
          content: `Tâche : ${task_description}
Test : ${test_type}

Transcription littérale du candidat :
---
${transcript}
---

Retourne UNIQUEMENT un JSON valide avec :
{ "criteres": { "respect_tache": {"score":X,"commentaire":"..."}, "coherence": {"score":X,"commentaire":"..."}, "lexique": {"score":X,"commentaire":"..."}, "morphosyntaxe": {"score":X,"commentaire":"..."}, "conventions": {"score":X,"commentaire":"..."} }, "score_global": X, "suggestions": [...], "points_forts": [...], "resume": "...", "nclc_estime": "NCLC X" }`
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    }))

    let feedback: any
    try {
      feedback = JSON.parse(analysis.choices[0].message.content ?? '{}')
    } catch (e) {
      console.error('Failed to parse GPT-4o JSON response, falling back to raw content:', e)
      feedback = {
        error: "Impossible d'analyser le retour automatique au format structuré.",
        raw_response: analysis.choices[0].message.content
      }
    }

    const { count, error: updateError } = await supabase
      .from('answers')
      .update({ audio_transcript: transcript, auto_feedback: feedback })
      .eq('id', answer_id)
      .eq('user_id', user.id)
      .select('id', { count: 'exact', head: true })

    if (updateError || count === 0) {
      return new Response(JSON.stringify({ error: 'Answer not found or not yours' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (activePackInfo) {
      await supabase.from('user_pack_subscriptions')
        .update({ ai_trials_remaining: activePackInfo.ai_trials_remaining - 1 })
        .eq('id', activePackInfo.id)
    }

    return new Response(JSON.stringify({ transcript, feedback }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('transcribe-eo error:', error)
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
