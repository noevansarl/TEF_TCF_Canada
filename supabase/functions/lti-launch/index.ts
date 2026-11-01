import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { isSafeOutcomeUrl, oauthSignature, timingSafeEqual } from '../_shared/lti.ts'

// ── Lancement LTI 1.1 (Moodle, Canvas…) ───────────────────────────────
// Appelé par le navigateur de l'élève via un formulaire POST signé par le LMS.
// Sécurité :
//  - signature OAuth 1.0 vérifiée avec le secret de l'établissement (table
//    institution_lti_credentials, inaccessible aux clients)
//  - anti-rejeu : oauth_timestamp (± 5 min) + oauth_nonce à usage unique
//  - le compte ayePREP est identifié par (établissement, user_id LTI), jamais
//    par l'email envoyé par le LMS : un lancement ne peut pas ouvrir la session
//    d'un compte existant créé hors LTI, ni celle d'un expert / admin
//  - connexion via un lien magique à usage unique (aucun jeton dans l'URL)

const MAX_CLOCK_SKEW_S = 300
const VALID_MODULES = ['CO', 'CE', 'EE', 'EO']
const VALID_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2']

const textResponse = (message: string, status: number) =>
  new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return textResponse('Method not allowed', 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // 1. Paramètres du formulaire LTI
    const formParams = new URLSearchParams(await req.text())
    const params: Record<string, string> = {}
    for (const [key, value] of formParams.entries()) params[key] = value

    const consumerKey = params['oauth_consumer_key']
    const ltiUserId = params['user_id']
    if (!consumerKey || !ltiUserId) return textResponse('Paramètres LTI manquants', 400)
    if (params['oauth_signature_method'] !== 'HMAC-SHA1') return textResponse('Méthode de signature non supportée', 400)

    // 2. Identifiants LTI de l'établissement
    const { data: cred } = await supabase
      .from('institution_lti_credentials')
      .select('institution_id, shared_secret')
      .eq('consumer_key', consumerKey)
      .eq('enabled', true)
      .maybeSingle()
    if (!cred) return textResponse('Clé LTI invalide ou intégration désactivée', 403)

    // 3. Signature : l'URL signée est l'URL publique de la fonction, construite
    //    depuis la configuration (jamais depuis les en-têtes X-Forwarded-*).
    const launchUrl = Deno.env.get('LTI_LAUNCH_URL') ?? `${Deno.env.get('SUPABASE_URL')}/functions/v1/lti-launch`
    const expected = await oauthSignature('POST', launchUrl, params, cred.shared_secret)
    if (!params['oauth_signature'] || !timingSafeEqual(expected, params['oauth_signature'])) {
      console.error('Signature LTI invalide pour la clé', consumerKey)
      return textResponse('Signature LTI invalide', 401)
    }

    // 4. Anti-rejeu
    const timestamp = Number(params['oauth_timestamp'])
    if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > MAX_CLOCK_SKEW_S) {
      return textResponse('Lancement LTI expiré', 401)
    }
    const nonce = params['oauth_nonce']
    if (!nonce || nonce.length > 128) return textResponse('oauth_nonce invalide', 400)
    const { error: nonceError } = await supabase
      .from('lti_nonces')
      .insert({ institution_id: cred.institution_id, nonce })
    if (nonceError) {
      if (nonceError.code === '23505') return textResponse('Lancement LTI déjà utilisé', 401)
      throw nonceError
    }
    // Purge opportuniste des nonces expirés
    await supabase.from('lti_nonces').delete()
      .lt('created_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString())

    const { data: institution } = await supabase
      .from('institutions')
      .select('id, country')
      .eq('id', cred.institution_id)
      .single()
    if (!institution) return textResponse('Établissement introuvable', 403)

    // 5. Compte ayePREP lié à (établissement, user_id LTI)
    const givenName = params['lis_person_name_given'] || ''
    const familyName = params['lis_person_name_family'] || ''
    const fullName = (params['lis_person_name_full'] || `${givenName} ${familyName}`.trim() || 'Élève LMS').slice(0, 120)

    let userId: string | undefined
    let loginEmail: string | undefined

    const { data: link } = await supabase
      .from('lti_user_links')
      .select('user_id')
      .eq('institution_id', institution.id)
      .eq('lti_user_id', ltiUserId)
      .maybeSingle()

    if (link) {
      const { data: linkedUser } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', link.user_id)
        .single()
      if (!linkedUser) return textResponse('Compte introuvable', 403)
      // Un lancement LTI n'ouvre jamais de session à privilèges
      if (linkedUser.role !== 'user') return textResponse('Compte non autorisé via LTI', 403)
      userId = linkedUser.id
      loginEmail = linkedUser.email
    } else {
      // Nouveau compte dédié au LMS, avec un email technique non routable :
      // l'email du LMS n'est jamais utilisé pour retrouver un compte existant.
      const digest = (await sha256Hex(`${institution.id}:${ltiUserId}`)).slice(0, 24)
      loginEmail = `lti-${digest}@lti.ayeprep.com`

      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: loginEmail,
        email_confirm: true,
        user_metadata: { full_name: fullName, country: institution.country || 'Canada', lti: true },
      })
      if (createError || !created?.user) throw createError ?? new Error('Création du compte LTI impossible')
      userId = created.user.id

      const { error: linkError } = await supabase
        .from('lti_user_links')
        .insert({ institution_id: institution.id, lti_user_id: ltiUserId, user_id: userId })
      if (linkError) throw linkError
    }

    // Rattachement à l'établissement (un élève n'appartient qu'à un établissement)
    const { data: membership } = await supabase
      .from('institution_students')
      .select('institution_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (!membership) {
      const { error } = await supabase.from('institution_students')
        .insert({ institution_id: institution.id, user_id: userId })
      if (error) throw error
    } else if (membership.institution_id !== institution.id) {
      return textResponse('Compte rattaché à un autre établissement', 403)
    }

    // 6. Session d'examen
    const targetModule = (params['custom_module'] || 'CO').toUpperCase()
    const targetLevel = (params['custom_level'] || 'B2').toUpperCase()
    if (!VALID_MODULES.includes(targetModule) || !VALID_LEVELS.includes(targetLevel)) {
      return textResponse('Module ou niveau LTI invalide', 400)
    }
    const classSessionId = params['custom_class_session_id'] || null

    let questionIds: string[] = []
    if (['CO', 'CE'].includes(targetModule)) {
      const { data: questions } = await supabase.rpc('select_questions_for_session', {
        p_user_id: userId,
        p_module: targetModule,
        p_test_type: 'TCF_CANADA',
        p_level: targetLevel,
        p_count: 39,
      })
      // deno-lint-ignore no-explicit-any
      if (questions) questionIds = questions.map((q: any) => q.question_id)
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
        metadata: { lti: true, institution_id: institution.id, class_session_id: classSessionId },
        status: 'in_progress',
      })
      .select('id')
      .single()
    if (examError || !examSession) throw examError

    // Retour de notes : stocké côté serveur uniquement (table lti_session_outcomes)
    const outcomeUrl = params['lis_outcome_service_url']
    const sourcedId = params['lis_result_sourcedid']
    if (outcomeUrl && sourcedId) {
      if (!isSafeOutcomeUrl(outcomeUrl) || sourcedId.length > 512) {
        console.error('URL de retour de notes LTI refusée:', outcomeUrl)
      } else {
        const { error } = await supabase.from('lti_session_outcomes').insert({
          session_id: examSession.id,
          institution_id: institution.id,
          outcome_service_url: outcomeUrl,
          result_sourcedid: sourcedId,
        })
        if (error) throw error
      }
    }

    // 7. Connexion par lien magique à usage unique (vérifié par /auth/callback)
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: loginEmail!,
    })
    const tokenHash = linkData?.properties?.hashed_token
    if (linkErr || !tokenHash) throw linkErr ?? new Error('Lien de connexion LTI indisponible')

    const appUrl = Deno.env.get('APP_URL') || 'https://ayeprep.com'
    const redirect = new URL('/auth/callback', appUrl)
    redirect.searchParams.set('token_hash', tokenHash)
    redirect.searchParams.set('type', 'magiclink')
    redirect.searchParams.set('next', `/session/${examSession.id}`)

    return new Response(null, {
      status: 303,
      headers: { Location: redirect.toString(), 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('LTI launch error:', error)
    return textResponse('Erreur lors du lancement LTI', 500)
  }
})
