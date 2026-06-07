import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Générer et signer la requête LTI Outbound XML pour les notes
async function generateLtiGradeRequest(
  url: string,
  sourcedId: string,
  score: number, // entre 0.0 et 1.0
  consumerKey: string,
  consumerSecret: string
): Promise<{ url: string; headers: Record<string, string>; body: string }> {
  const messageIdentifier = `msg-${Date.now()}`
  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/lti/v1/pox">
  <imsx_POXHeader>
    <imsx_POXRequestHeaderInfo>
      <imsx_version>V1.0</imsx_version>
      <imsx_messageIdentifier>${messageIdentifier}</imsx_messageIdentifier>
    </imsx_POXRequestHeaderInfo>
  </imsx_POXHeader>
  <imsx_POXBody>
    <replaceResultRequest>
      <resultRecord>
        <sourcedGUID>
          <sourcedId>${sourcedId}</sourcedId>
        </sourcedGUID>
        <result>
          <resultScore>
            <language>en</language>
            <textString>${score.toFixed(4)}</textString>
          </resultScore>
        </result>
      </resultRecord>
    </replaceResultRequest>
  </imsx_POXBody>
</imsx_POXEnvelopeRequest>`

  // 1. Calculer le hash SHA-1 du corps XML (OAuth Body Hash extension)
  const encoder = new TextEncoder()
  const bodyBytes = encoder.encode(xmlBody)
  const hashBuffer = await crypto.subtle.digest('SHA-1', bodyBytes)
  const hashBytes = new Uint8Array(hashBuffer)
  let binary = ''
  for (let i = 0; i < hashBytes.byteLength; i++) {
    binary += String.fromCharCode(hashBytes[i])
  }
  const bodyHash = btoa(binary)

  // 2. Paramètres OAuth standard avec body_hash
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: Math.random().toString(36).substring(2, 15),
    oauth_version: '1.0',
    oauth_body_hash: bodyHash,
  }

  // 3. Trier les paramètres et construire la chaîne de requête
  const sortedKeys = Object.keys(oauthParams).sort()
  const paramParts = sortedKeys.map(
    k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`
  )
  const paramString = paramParts.join('&')

  // 4. Construire la base string pour OAuth 1.0
  const parsedUrl = new URL(url)
  const cleanUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`
  const baseString = `POST&${encodeURIComponent(cleanUrl)}&${encodeURIComponent(paramString)}`

  // 5. Clé de signature
  const signingKey = `${encodeURIComponent(consumerSecret)}&`
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
  let binarySig = ''
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binarySig += String.fromCharCode(signatureBytes[i])
  }
  const signature = btoa(binarySig)

  // 6. Ajouter la signature
  oauthParams['oauth_signature'] = signature
  
  // Construire l'en-tête Authorization
  const authHeaderParts = Object.keys(oauthParams).map(
    k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`
  )
  const authHeader = `OAuth ${authHeaderParts.join(', ')}`

  return {
    url,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/xml',
    },
    body: xmlBody,
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Attendre un JSON contenant session_id
    const { session_id } = await req.json()
    if (!session_id) {
      return new Response(JSON.stringify({ error: 'Missing session_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Récupérer la session d'examen
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Vérifier s'il s'agit d'une session LTI
    const metadata = session.metadata || {}
    const outcomeUrl = metadata['lis_outcome_service_url']
    const sourcedId = metadata['lis_result_sourcedid']
    const consumerKey = metadata['lti_consumer_key']

    if (!outcomeUrl || !sourcedId || !consumerKey) {
      return new Response(JSON.stringify({ message: 'Not an LTI session, skipping grade sync' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Récupérer les clés secrètes de l'établissement concerné
    const { data: inst, error: instError } = await supabase
      .from('institutions')
      .select('lti_shared_secret')
      .eq('lti_consumer_key', consumerKey)
      .single()

    if (instError || !inst) {
      throw new Error(`Failed to load LTI secret for consumer key: ${consumerKey}`)
    }

    // 4. Calculer le score normalisé (entre 0.0 et 1.0)
    // score_expert a la priorité sur score_auto
    const rawScore = session.score_expert !== null ? session.score_expert : (session.score_auto || 0)
    const normalizedScore = rawScore / 100 // Convertir de 0-100 à 0-1

    // 5. Générer et signer l'appel XML
    const signedRequest = await generateLtiGradeRequest(
      outcomeUrl,
      sourcedId,
      normalizedScore,
      consumerKey,
      inst.lti_shared_secret
    )

    // 6. Envoyer le score au LMS
    console.log(`Sending score ${normalizedScore} to LMS at ${outcomeUrl}`)
    const response = await fetch(signedRequest.url, {
      method: 'POST',
      headers: signedRequest.headers,
      body: signedRequest.body,
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`LMS returned HTTP status ${response.status}: ${responseText}`)
    }

    console.log(`LMS response:`, responseText)

    // Mettre à jour les métadonnées de la session pour marquer la réussite du sync LTI
    const updatedMetadata = {
      ...metadata,
      lti_synced_at: new Date().toISOString(),
      lti_sync_success: true,
    }

    await supabase
      .from('sessions')
      .update({ metadata: updatedMetadata })
      .eq('id', session_id)

    return new Response(
      JSON.stringify({
        success: true,
        score_sent: normalizedScore,
        lms_response_status: response.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('LTI Grade sync error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
