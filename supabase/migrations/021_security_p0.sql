-- ================================================================
-- Migration 021 — Correctifs de sécurité Priorité 0 (audit_securite.md)
--   C1 : colonnes privilégiées de public.users non modifiables par le client
--   C2 : secrets LTI hors de portée des clients + gestion via RPC
--   C3 : données de retour de notes LTI stockées côté serveur uniquement
--   C4 : get_diagnostic_questions plafonnée, sans contenu premium, sans anon
--   H2 : fonctions SECURITY DEFINER internes non appelables par les clients
--   M3 : search_path figé sur les fonctions SECURITY DEFINER
-- Migration idempotente.
-- ================================================================


-- ── C1 — Protection des colonnes privilégiées de public.users ────────
-- La policy users_update_own laisse un utilisateur modifier sa propre ligne.
-- Ce trigger refuse toute modification des colonnes d'abonnement, de rôle,
-- de gamification et de facturation quand la requête vient d'un client
-- (rôles anon / authenticated), sauf pour un admin.
-- SECURITY INVOKER volontaire : current_user reflète l'appelant réel.
-- Les Edge Functions (service_role) et les fonctions SECURITY DEFINER
-- (propriétaire postgres) ne sont pas concernées.
CREATE OR REPLACE FUNCTION public.protect_user_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_old JSONB := to_jsonb(OLD);
  v_new JSONB := to_jsonb(NEW);
  v_col TEXT;
  v_protected TEXT[] := ARRAY[
    'id', 'email', 'role',
    'subscription_tier', 'subscription_expires_at',
    'active_pack_id', 'pack_expires_at',
    'stripe_customer_id', 'revenuecat_app_user_id',
    'xp_points', 'streak_days', 'longest_streak', 'last_activity_at',
    'affiliate_code', 'created_at'
  ];
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  FOREACH v_col IN ARRAY v_protected LOOP
    IF (v_old -> v_col) IS DISTINCT FROM (v_new -> v_col) THEN
      RAISE EXCEPTION 'Modification non autorisée de la colonne users.%', v_col
        USING ERRCODE = '42501';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_protect_privileged ON public.users;
CREATE TRIGGER trg_users_protect_privileged
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_privileged_columns();


-- ── C2 — Identifiants LTI ─────────────────────────────────────────────
-- Les secrets quittent public.institutions (lisible et modifiable par les
-- membres) pour une table sans aucune policy : seul service_role y accède.
-- Les secrets existants sont considérés comme compromis : ils ne sont PAS
-- recopiés. Chaque établissement doit réactiver LTI (nouveau secret).
CREATE TABLE IF NOT EXISTS public.institution_lti_credentials (
  institution_id  UUID         PRIMARY KEY REFERENCES public.institutions(id) ON DELETE CASCADE,
  consumer_key    VARCHAR(100) NOT NULL UNIQUE,
  shared_secret   TEXT         NOT NULL,
  enabled         BOOLEAN      NOT NULL DEFAULT false,
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE public.institution_lti_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.institution_lti_credentials FROM anon, authenticated;

ALTER TABLE public.institutions DROP COLUMN IF EXISTS lti_shared_secret;
ALTER TABLE public.institutions DROP COLUMN IF EXISTS lti_consumer_key;
UPDATE public.institutions i SET lti_enabled = false
 WHERE i.lti_enabled IS DISTINCT FROM false
   AND NOT EXISTS (SELECT 1 FROM public.institution_lti_credentials c
                    WHERE c.institution_id = i.id AND c.enabled);

-- Comptes ayePREP créés via LTI : identifiés par (établissement, user_id LTI),
-- jamais par l'email transmis par le LMS.
CREATE TABLE IF NOT EXISTS public.lti_user_links (
  institution_id  UUID        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  lti_user_id     TEXT        NOT NULL,
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (institution_id, lti_user_id)
);
ALTER TABLE public.lti_user_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lti_user_links FROM anon, authenticated;

-- Anti-rejeu des lancements LTI (oauth_nonce)
CREATE TABLE IF NOT EXISTS public.lti_nonces (
  institution_id  UUID        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  nonce           TEXT        NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (institution_id, nonce)
);
ALTER TABLE public.lti_nonces ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lti_nonces FROM anon, authenticated;

-- Responsable d'établissement = admin, ou expert membre de l'établissement
CREATE OR REPLACE FUNCTION public.is_institution_manager(p_institution_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1
      FROM public.institution_students s
      JOIN public.users u ON u.id = s.user_id
     WHERE s.institution_id = p_institution_id
       AND s.user_id = auth.uid()
       AND u.role = 'expert'
  );
$$;

-- Lecture de la configuration LTI (responsables uniquement)
CREATE OR REPLACE FUNCTION public.get_institution_lti_config(p_institution_id UUID)
RETURNS TABLE (enabled BOOLEAN, consumer_key TEXT, shared_secret TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  IF NOT public.is_institution_manager(p_institution_id) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT c.enabled, c.consumer_key::TEXT, c.shared_secret
      FROM public.institution_lti_credentials c
     WHERE c.institution_id = p_institution_id;
END;
$$;

-- Activation / désactivation / régénération (identifiants générés côté serveur)
CREATE OR REPLACE FUNCTION public.set_institution_lti(
  p_institution_id UUID,
  p_enabled        BOOLEAN,
  p_regenerate     BOOLEAN DEFAULT false
)
RETURNS TABLE (enabled BOOLEAN, consumer_key TEXT, shared_secret TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_key    TEXT := 'ayeprep-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
  v_secret TEXT := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
BEGIN
  IF NOT public.is_institution_manager(p_institution_id) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.institution_lti_credentials AS c
    (institution_id, consumer_key, shared_secret, enabled, updated_at)
  VALUES (p_institution_id, v_key, v_secret, p_enabled, NOW())
  ON CONFLICT (institution_id) DO UPDATE
    SET enabled       = EXCLUDED.enabled,
        consumer_key  = CASE WHEN p_regenerate THEN EXCLUDED.consumer_key  ELSE c.consumer_key  END,
        shared_secret = CASE WHEN p_regenerate THEN EXCLUDED.shared_secret ELSE c.shared_secret END,
        updated_at    = NOW();

  UPDATE public.institutions SET lti_enabled = p_enabled WHERE id = p_institution_id;

  RETURN QUERY
    SELECT c.enabled, c.consumer_key::TEXT, c.shared_secret
      FROM public.institution_lti_credentials c
     WHERE c.institution_id = p_institution_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_institution_manager(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_institution_lti_config(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_institution_lti(UUID, BOOLEAN, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_institution_manager(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_institution_lti_config(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_institution_lti(UUID, BOOLEAN, BOOLEAN) TO authenticated, service_role;

-- Policies institutions : plus aucune modification par les membres ou les experts
DROP POLICY IF EXISTS "Update institution details" ON public.institutions;
DROP POLICY IF EXISTS "institutions_admin_all" ON public.institutions;
CREATE POLICY "institutions_admin_all" ON public.institutions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Select institution membership" ON public.institutions;
CREATE POLICY "Select institution membership" ON public.institutions
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.institution_students
       WHERE institution_students.institution_id = institutions.id
         AND institution_students.user_id = auth.uid()
    )
  );

-- Liste des élèves : gestion réservée aux admins, lecture aux responsables
DROP POLICY IF EXISTS "Manage student roster" ON public.institution_students;
DROP POLICY IF EXISTS "institution_students_admin_manage" ON public.institution_students;
CREATE POLICY "institution_students_admin_manage" ON public.institution_students
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Select students" ON public.institution_students;
CREATE POLICY "Select students" ON public.institution_students
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_institution_manager(institution_id)
  );


-- ── C3 — Retour de notes LTI ──────────────────────────────────────────
-- URL de retour et sourcedId ne vivent plus dans sessions.metadata (modifiable
-- par l'utilisateur) mais dans une table accessible au seul service_role.
CREATE TABLE IF NOT EXISTS public.lti_session_outcomes (
  session_id           UUID        PRIMARY KEY REFERENCES public.sessions(id) ON DELETE CASCADE,
  institution_id       UUID        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  outcome_service_url  TEXT        NOT NULL,
  result_sourcedid     TEXT        NOT NULL,
  synced_at            TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.lti_session_outcomes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lti_session_outcomes FROM anon, authenticated;


-- ── C4 — Questions du test diagnostique ───────────────────────────────
-- Plafond de 20 questions, contenu gratuit uniquement, comptes connectés.
CREATE OR REPLACE FUNCTION public.get_diagnostic_questions(
  p_module TEXT,
  p_test_type TEXT,
  p_limit INT
)
RETURNS TABLE (
  id UUID,
  module TEXT,
  level TEXT,
  question_text TEXT,
  audio_url TEXT,
  passage_text TEXT,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, module, level, question_text, audio_url, passage_text, options, correct_answer, explanation
  FROM public.questions
  WHERE module = p_module
    AND test_type = p_test_type
    AND level IN ('B1', 'B2', 'C1')
    AND is_active = true
    AND is_premium = false
    AND correct_answer IS NOT NULL
  ORDER BY random()
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 0), 0), 20);
$$;

REVOKE EXECUTE ON FUNCTION public.get_diagnostic_questions(TEXT, TEXT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_diagnostic_questions(TEXT, TEXT, INT) TO authenticated;


-- ── H2 + M3 — Fonctions SECURITY DEFINER ──────────────────────────────
-- Fonctions internes (appelées seulement par les Edge Functions ou par
-- d'autres fonctions) : plus d'EXECUTE pour les clients.
DO $$
DECLARE
  f REGPROCEDURE;
BEGIN
  FOR f IN
    SELECT p.oid::REGPROCEDURE
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('award_session_xp', 'select_questions_for_session',
                         'track_affiliate_click', 'convert_affiliate_click')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;

-- search_path figé sur toutes les fonctions SECURITY DEFINER existantes
DO $$
DECLARE
  f REGPROCEDURE;
BEGIN
  FOR f IN
    SELECT p.oid::REGPROCEDURE
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.prosecdef
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', f);
  END LOOP;
END $$;


-- ── Conversion affiliée à l'inscription (remplace l'appel RPC client) ──
-- Le click_id est transmis dans les métadonnées d'inscription
-- (options.data.affiliate_click_id) et converti ici, côté serveur.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_click TEXT := NEW.raw_user_meta_data->>'affiliate_click_id';
BEGIN
  INSERT INTO public.users (id, email, full_name, country, role, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Candidat ayePREP'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Canada'),
    'user',
    'gratuit'
  )
  ON CONFLICT (id) DO NOTHING;

  IF v_click ~ '^[0-9a-fA-F-]{36}$' THEN
    BEGIN
      PERFORM public.convert_affiliate_click(v_click::UUID, NEW.id);
    EXCEPTION WHEN OTHERS THEN
      -- Une conversion affiliée ne doit jamais bloquer une inscription
      RAISE WARNING 'convert_affiliate_click a échoué: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;
