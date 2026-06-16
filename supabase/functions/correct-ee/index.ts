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

    const systemPrompt = `Tu es un correcteur expert intraitable et officiel pour les examens linguistiques TCF Canada et TEF Canada. Ton rôle est d'évaluer sévèrement des productions écrites.

Critères d'évaluation officiels :
1. respect_tache : Le sujet est-il respecté ? Le nombre de mots est-il atteint ? Le registre (formel/informel) est-il adapté ?
2. coherence : Les idées sont-elles bien enchaînées ? Utilisation pertinente de connecteurs logiques.
3. lexique : Richesse, précision et orthographe lexicale. Sanctionne les répétitions et le vocabulaire pauvre.
4. morphosyntaxe : Conjugaison, accords, grammaire, syntaxe des phrases. Sois TRÈS SÉVÈRE sur les erreurs grammaticales basiques.
5. conventions : Ponctuation, mise en page.

${body.test_type === 'TCF_CANADA'
  ? 'BARÈME TCF : Note CHAQUE critère de 0 à 4 points (score maximum de chaque critère = 4). Le score_global doit être la somme exacte des 5 critères sur 20.'
  : 'BARÈME TEF : Note CHAQUE critère de 0 à 90 points (score maximum de chaque critère = 90). Le score_global doit être la somme exacte des 5 critères sur 450.'}

RÈGLE D'ÉVALUATION NCLC :
Le "nclc_estime" doit OBLIGATOIREMENT être au format numérique exact (ex: "NCLC 4", "NCLC 5", "NCLC 6", "NCLC 7", "NCLC 8", "NCLC 9", "NCLC 10", "NCLC 11", "NCLC 12"). N'utilise JAMAIS de lettres (B1, B2, etc.) pour ce champ.

Retourne UNIQUEMENT un JSON valide respectant STRICTEMENT cette structure :
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
  "nclc_estime": "NCLC X"
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

    const { count, error: updateError } = await supabase
      .from('answers')
      .update({ user_answer: body.text, auto_feedback: feedback })
      .eq('id', body.answer_id)
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

    return new Response(JSON.stringify(feedback), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('correct-ee error:', error)
    return new Response(JSON.stringify({ error: 'Correction failed' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
