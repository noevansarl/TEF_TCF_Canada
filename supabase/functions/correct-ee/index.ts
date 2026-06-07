import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const ALLOWED_ORIGINS = ['https://ayeprep.com', 'https://www.ayeprep.com', 'http://localhost:5173']
const VALID_TASK_TYPES = ['message_informel', 'texte_argumentatif', 'lettre_formelle', 'essai']
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

interface CorrectEERequest {
  answer_id: string
  session_id: string
  text: string
  task_type: 'message_informel' | 'texte_argumentatif' | 'lettre_formelle' | 'essai'
  test_type: 'TCF_CANADA' | 'TEF_CANADA'
  task_description: string
  target_words: { min: number; max: number }
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

    const hasAccess = ['avance', 'premium', 'institutionnel'].includes(userProfile?.subscription_tier ?? '')
      && (!userProfile?.subscription_expires_at || new Date(userProfile.subscription_expires_at) > new Date())

    if (!hasAccess) return new Response('Subscription required', { status: 402, headers: corsHeaders })

    const body: CorrectEERequest = await req.json()

    // Validation stricte des inputs
    if (!VALID_TASK_TYPES.includes(body.task_type) || !VALID_TEST_TYPES.includes(body.test_type)) {
      return new Response('Invalid task_type or test_type', { status: 400, headers: corsHeaders })
    }
    if (typeof body.text !== 'string' || typeof body.answer_id !== 'string') {
      return new Response('Invalid input', { status: 400, headers: corsHeaders })
    }

    const wordCount = body.text.trim() === '' ? 0 : body.text.trim().split(/\s+/).length
    if (wordCount < 10) {
      return new Response(JSON.stringify({ error: 'Text too short' }), { status: 400, headers: corsHeaders })
    }
    if (wordCount > 1500) {
      return new Response(JSON.stringify({ error: 'Text too long' }), { status: 400, headers: corsHeaders })
    }

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

    const systemPrompt = `Tu es un correcteur expert certifié pour les examens TCF Canada et TEF Canada (CECRL niveau B1 à C2). Tu corriges des productions écrites selon les critères officiels du CECRL.

Pour chaque rédaction, tu évalues sur ces 5 critères :
1. respect_tache : Respect de la tâche, du registre et des consignes
2. coherence : Cohérence et cohésion textuelle
3. lexique : Richesse et précision lexicale
4. morphosyntaxe : Correction morphosyntaxique
5. conventions : Conventions d'écriture

${body.test_type === 'TCF_CANADA'
  ? 'Barème TCF : 0 à 4 points par critère (total : /20)'
  : 'Barème TEF : 0 à 100 points par critère'}

Retourne UNIQUEMENT un JSON valide avec cette structure :
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
}`

    const userPrompt = `Tâche : ${body.task_description}\nType : ${body.task_type}\nMots demandés : ${body.target_words.min}–${body.target_words.max}\nMots produits : ${wordCount}\n\nTexte :\n---\n${body.text}\n---`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    })

    const feedback = JSON.parse(completion.choices[0].message.content ?? '{}')

    await supabase.from('answers').update({
      user_answer: body.text,
      auto_feedback: feedback,
    }).eq('id', body.answer_id).eq('user_id', user.id)

    return new Response(JSON.stringify(feedback), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (_error) {
    return new Response(JSON.stringify({ error: 'Correction failed' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
