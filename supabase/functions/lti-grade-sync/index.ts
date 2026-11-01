import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0'
import { escapeXml, isSafeOutcomeUrl, oauthSignature, percentEncode, sha1Base64 } from '../_shared/lti.ts'

// ── Envoi d'une note vers le LMS (LTI 1.1 Basic Outcomes) ─────────────
// Appelants autorisés :
//  - Edge Functions (score-qcm) avec la clé service_role
//  - un expert / admin connecté (éditeur de correction)
// L'URL de retour et le sourcedId viennent de lti_session_outcomes, écrite par
// lti-launch au moment du lancement signé : jamais de données client.

const ALLOWED_ORIGINS = ['https://ayeprep.com', 'https://www.ayeprep.com', 'http://localhost:5173']

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function buildGradeRequest(url: string, sourcedId: string, score: number, consumerKey: string, secret: string) {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
  <imsx_POXHeader>
    <imsx_POXRequestHeaderInfo>
      <imsx_version>V1.0</imsx_version>
      <imsx_messageIdentifier>${crypto.randomUUID()}</imsx_messageIdentifier>
    </imsx_POXRequestHeaderInfo>
  </imsx_POXHeader>
  <imsx_POXBody>
    <replaceResultRequest>
      <resultRecord>
        <sourcedGUID>
          <sourcedId>${escapeXml(sourcedId)}</sourcedId>
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

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomUUID().replace(/-/g, ''),
    oauth_version: '1.0',
    oauth_body_hash: await sha1Base64(body),
  }
  // Les paramètres de la query string de l'URL font partie de la signature
  const signed: Record<string, string> = { ...oauthParams }
  for (const [k, v] of new URL(url).searchParams.entries()) signed[k] = v
  oauthParams.oauth_signature = await oauthSignature('POST', url, signed, secret)

  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ')

  return { body, headers: { 'Authorization': authHeader, 'Content-Type': 'application/xml' } }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey)

  // ── Authentification ─────────────────────────────────────────────────
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Unauthorized' }, 401)
  if (token !== serviceKey) {
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return json({ error: 'Unauthorized' }, 401)
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (!profile || !['expert', 'admin'].includes(profile.role)) return json({ error: 'Forbidden' }, 403)
  }

  try {
    const { session_id } = await req.json()
    if (typeof session_id !== 'string' || !UUID_RE.test(session_id)) return json({ error: 'session_id invalide' }, 400)

    const { data: outcome } = await supabase
      .from('lti_session_outcomes')
      .select('institution_id, outcome_service_url, result_sourcedid')
      .eq('session_id', session_id)
      .maybeSingle()
    if (!outcome) return json({ message: 'Not an LTI session, skipping grade sync' })

    if (!isSafeOutcomeUrl(outcome.outcome_service_url)) {
      console.error('URL de retour LTI refusée:', outcome.outcome_service_url)
      return json({ error: 'URL de retour LTI invalide' }, 400)
    }

    const { data: cred } = await supabase
      .from('institution_lti_credentials')
      .select('consumer_key, shared_secret')
      .eq('institution_id', outcome.institution_id)
      .eq('enabled', true)
      .maybeSingle()
    if (!cred) return json({ error: 'Intégration LTI désactivée' }, 409)

    const { data: session } = await supabase
      .from('sessions')
      .select('score_auto, score_expert')
      .eq('id', session_id)
      .single()
    if (!session) return json({ error: 'Session not found' }, 404)

    const rawScore = session.score_expert ?? session.score_auto ?? 0
    const normalized = Math.min(Math.max(Number(rawScore) / 100, 0), 1)

    const request = await buildGradeRequest(
      outcome.outcome_service_url, outcome.result_sourcedid, normalized, cred.consumer_key, cred.shared_secret,
    )
    const response = await fetch(outcome.outcome_service_url, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      redirect: 'manual', // pas de redirection vers une autre cible
    })
    if (!response.ok) {
      console.error(`LMS HTTP ${response.status}:`, (await response.text()).slice(0, 500))
      return json({ error: 'Le LMS a refusé la note' }, 502)
    }

    await supabase.from('lti_session_outcomes')
      .update({ synced_at: new Date().toISOString() })
      .eq('session_id', session_id)

    return json({ success: true, score_sent: normalized })
  } catch (error) {
    console.error('LTI grade sync error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
})
