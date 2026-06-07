import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Vérifier la signature OAuth 1.0
async function verifyOauthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string
): Promise<boolean> {
  const receivedSig = params['oauth_signature']
  if (!receivedSig) return false

  // Copier les paramètres et enlever la signature
  const signParams = { ...params }
  delete signParams['oauth_signature']

  // Trier les paramètres par clé et construire la chaîne de requête
  const sortedKeys = Object.keys(signParams).sort()
  const paramParts = sortedKeys.map(
    k => `${encodeURIComponent(k)}=${encodeURIComponent(signParams[k])}`
  )
  const paramString = paramParts.join('&')

  // Construire la base string
  const parsedUrl = new URL(url)
  const cleanUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(cleanUrl)}&${encodeURIComponent(paramString)}`

  // Clé de signature : secret + "&"
  const signingKey = `${encodeURIComponent(consumerSecret)}&`

  const encoder = new TextEncoder()
  const keyData = encoder.encode(signingKey)
  const baseData = encoder.encode(baseString)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, baseData)
  
  const signatureBytes = new Uint8Array(signatureBuffer)
  let binary = ''
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binary += String.fromCharCode(signatureBytes[i])
  }
  const calculatedSig = btoa(binary)

  return calculatedSig === decodeURIComponent(receivedSig) || calculatedSig === receivedSig
}

serve(async (req: Request) => {
  // CORS configuration
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

    // 1. Lire le corps encodé en URL
    const bodyText = await req.text()
    const formParams = new URLSearchParams(bodyText)
    const params: Record<string, string> = {}
    for (const [key, value] of formParams.entries()) {
      params[key] = value
    }

    const consumerKey = params['oauth_consumer_key']
    if (!consumerKey) {
      return new Response('oauth_consumer_key is missing', { status: 400, headers: corsHeaders })
    }

    // 2. Récupérer l'établissement et son secret LTI
    const { data: instData, error: instError } = await supabase
      .from('institutions')
      .select('*')
      .eq('lti_consumer_key', consumerKey)
      .eq('lti_enabled', true)
      .maybeSingle()

    if (instError || !instData) {
      console.error('Institution non trouvée ou LTI désactivé pour la clé:', consumerKey)
      return new Response('Invalid consumer key or LTI disabled', { status: 403, headers: corsHeaders })
    }

    // 3. Reconstruire l'URL de requête pour valider la signature
    const urlObj = new URL(req.url)
    const proto = req.headers.get('x-forwarded-proto') || urlObj.protocol.replace(':', '')
    const host = req.headers.get('x-forwarded-host') || urlObj.host
    const requestUrl = `${proto}://${host}${urlObj.pathname}`

    // 4. Vérifier la signature OAuth 1.0
    const isValid = await verifyOauthSignature('POST', requestUrl, params, instData.lti_shared_secret)
    if (!isValid) {
      console.error('Signature LTI invalide pour le consumer:', consumerKey)
      return new Response('OAuth signature validation failed', { status: 401, headers: corsHeaders })
    }

    // 5. Extraire les détails de l'utilisateur
    const email = params['lis_person_contact_email_primary'] || `${params['user_id']}@lms.partner`
    const givenName = params['lis_person_name_given'] || ''
    const familyName = params['lis_person_name_family'] || ''
    const fullName = params['lis_person_name_full'] || `${givenName} ${familyName}`.trim() || 'LMS Student'

    // 6. Provisionner/trouver l'utilisateur
    let { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    let userId = existingUser?.id

    if (!userId) {
      // Créer un utilisateur dans Supabase Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          country: instData.country || 'Canada',
        }
      })

      if (createError) {
        if (createError.message?.includes('already exists')) {
          const { data: authUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle()
          if (authUser) userId = authUser.id
        }
        if (!userId) throw createError
      } else {
        userId = newUser.user.id
      }
    }

    // Associer l'élève à l'établissement s'il n'y est pas déjà
    const { data: isAssociated } = await supabase
      .from('institution_students')
      .select('id')
      .eq('institution_id', instData.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!isAssociated) {
      await supabase.from('institution_students').insert({
        institution_id: instData.id,
        user_id: userId,
      })
    }

    // 7. Configurer la redirection et l'examen ciblé
    const targetModule = (params['custom_module'] || 'CO').toUpperCase() // ex: CO, CE, EE, EO
    const targetLevel = (params['custom_level'] || 'B2').toUpperCase() // ex: B1, B2, C1
    const classSessionId = params['custom_class_session_id'] || null

    // Créer une session d'examen pré-configurée
    // Nous récupérons un set de questions adapté
    let questionIds: string[] = []
    if (['CO', 'CE'].includes(targetModule)) {
      const { data: questions } = await supabase.rpc('select_questions_for_session', {
        p_user_id: userId,
        p_module: targetModule,
        p_test_type: 'TCF_CANADA',
        p_level: targetLevel,
        p_count: 39,
      })
      if (questions) {
        questionIds = questions.map((q: any) => q.question_id)
      }
    }

    // Insérer la session d'examen
    const ltiMetadata = {
      lis_outcome_service_url: params['lis_outcome_service_url'] || null,
      lis_result_sourcedid: params['lis_result_sourcedid'] || null,
      lti_consumer_key: consumerKey,
      class_session_id: classSessionId,
    }

    const { data: examSession, error: examError } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        session_type: 'SIMULATION',
        module: targetModule,
        test_type: 'TCF_CANADA',
        level: targetLevel,
        max_duration_s: targetModule === 'CO' || targetModule === 'CE' ? 35 * 60 : 60 * 60,
        question_ids: questionIds,
        metadata: ltiMetadata,
        status: 'in_progress',
      })
      .select()
      .single()

    if (examError || !examSession) throw examError

    // 8. Générer une session de connexion sécurisée (JWT) pour le rediriger
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSessionForUser({
      userId
    })

    if (sessionError || !sessionData) throw sessionError

    // 9. Construire l'URL de redirection finale vers l'app React
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
    const redirectUrl = `${appUrl}/auth/callback?access_token=${sessionData.session.access_token}&refresh_token=${sessionData.session.refresh_token}&next=/session/${examSession.id}`

    return new Response(null, {
      status: 303,
      headers: {
        ...corsHeaders,
        Location: redirectUrl,
      },
    })
  } catch (error) {
    console.error('LTI launch function error:', error)
    return new Response(`LTI Launch error: ${error.message}`, { status: 500, headers: corsHeaders })
  }
})
