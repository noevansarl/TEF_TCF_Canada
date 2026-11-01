-- ================================================================
-- Migration 022 — Correctifs de sécurité Priorité 1 (audit_securite.md)
--   H1 : notation et scores calculés / verrouillés côté serveur
--   H3 : affiliés — seuls nom et moyen de paiement sont modifiables
--   H4 : experts limités à la file d'attente et à leurs corrections
--   H5 : l'accès premium d'un pack expire réellement
--   H6 : crédits IA décomptés atomiquement + limitation de débit
--   H8 : consentements cookies — insertion seule pour les visiteurs
--   M1 : chrono et statut des sessions non modifiables par le client
-- Migration idempotente.
-- ================================================================


-- ── H1 — Estimation NCLC (port SQL de apps/web/src/lib/scoreUtils.ts) ──
CREATE OR REPLACE FUNCTION public.estimate_qcm_nclc(
  p_correct INT, p_total INT, p_module TEXT, p_test_type TEXT
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  WITH s AS (
    SELECT round(CASE WHEN p_total > 0 THEN p_correct::NUMERIC / p_total ELSE 0 END * 699) AS v
  )
  SELECT CASE
    WHEN p_test_type = 'TEF_CANADA' AND p_module = 'CO' THEN CASE
      WHEN v >= 546 THEN 'C2' WHEN v >= 503 THEN 'C1' WHEN v >= 462 THEN 'B2+'
      WHEN v >= 434 THEN 'B2' WHEN v >= 393 THEN 'B1+' WHEN v >= 352 THEN 'B1'
      WHEN v >= 306 THEN 'A2' ELSE 'A1' END
    WHEN p_test_type = 'TEF_CANADA' AND p_module = 'CE' THEN CASE
      WHEN v >= 546 THEN 'C2' WHEN v >= 512 THEN 'C1' WHEN v >= 472 THEN 'B2+'
      WHEN v >= 428 THEN 'B2' WHEN v >= 379 THEN 'B1+' WHEN v >= 330 THEN 'B1'
      WHEN v >= 268 THEN 'A2' ELSE 'A1' END
    WHEN p_module = 'CO' THEN CASE
      WHEN v >= 549 THEN 'C2' WHEN v >= 523 THEN 'C1' WHEN v >= 503 THEN 'B2+'
      WHEN v >= 458 THEN 'B2' WHEN v >= 398 THEN 'B1' WHEN v >= 331 THEN 'A2' ELSE 'A1' END
    WHEN p_module = 'CE' THEN CASE
      WHEN v >= 549 THEN 'C2' WHEN v >= 524 THEN 'C1' WHEN v >= 499 THEN 'B2+'
      WHEN v >= 453 THEN 'B2' WHEN v >= 406 THEN 'B1' WHEN v >= 342 THEN 'A2' ELSE 'A1' END
    ELSE 'A1'
  END
  FROM s;
$$;

-- NCLC global d'une simulation = le plus faible de CO et CE (getGlobalNCLC),
-- ramené aux valeurs autorisées par sessions.nclc_estimate (B2+ → B2, B1+ → B1).
CREATE OR REPLACE FUNCTION public.compute_simulation_nclc(p_session_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_test_type TEXT;
  v_co_correct INT;
  v_ce_correct INT;
  v_co TEXT;
  v_ce TEXT;
  v_rank JSONB := '{"C2":6,"C1":5,"B2+":4,"B2":3,"B1+":2,"B1":2,"A2":1,"A1":0}';
  v_min TEXT;
BEGIN
  SELECT COALESCE(test_type, 'TCF_CANADA') INTO v_test_type
    FROM public.sessions
   WHERE id = p_session_id
     AND (auth.uid() IS NULL OR user_id = auth.uid());  -- sa propre session uniquement
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT count(*) FILTER (WHERE q.module = 'CO' AND a.is_correct),
         count(*) FILTER (WHERE q.module = 'CE' AND a.is_correct)
    INTO v_co_correct, v_ce_correct
    FROM public.answers a
    JOIN public.questions q ON q.id = a.question_id
   WHERE a.session_id = p_session_id;

  v_co := public.estimate_qcm_nclc(v_co_correct, CASE WHEN v_test_type = 'TEF_CANADA' THEN 60 ELSE 39 END, 'CO', v_test_type);
  v_ce := public.estimate_qcm_nclc(v_ce_correct, CASE WHEN v_test_type = 'TEF_CANADA' THEN 50 ELSE 39 END, 'CE', v_test_type);
  v_min := CASE WHEN (v_rank ->> v_co)::INT <= (v_rank ->> v_ce)::INT THEN v_co ELSE v_ce END;

  RETURN replace(v_min, '+', '');
END;
$$;
REVOKE EXECUTE ON FUNCTION public.compute_simulation_nclc(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.compute_simulation_nclc(UUID) TO authenticated, service_role;


-- ── H1 — Réponses : is_correct calculé par le serveur ─────────────────
-- Trigger SECURITY INVOKER : ne s'applique qu'aux requêtes client
-- (anon / authenticated) hors admin. Les Edge Functions (service_role)
-- continuent d'écrire librement (auto_feedback, transcription…).
CREATE OR REPLACE FUNCTION public.enforce_answer_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_correct TEXT;
  v_module  TEXT;
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.user_id          := OLD.user_id;
    NEW.session_id       := OLD.session_id;
    NEW.question_id      := OLD.question_id;
    NEW.auto_feedback    := OLD.auto_feedback;
    NEW.expert_feedback  := OLD.expert_feedback;
    NEW.expert_score     := OLD.expert_score;
    NEW.audio_transcript := OLD.audio_transcript;
  ELSE
    NEW.auto_feedback    := NULL;
    NEW.expert_feedback  := NULL;
    NEW.expert_score     := NULL;
    NEW.audio_transcript := NULL;
  END IF;

  -- La réponse doit appartenir à une session de l'utilisateur
  IF NOT EXISTS (
    SELECT 1 FROM public.sessions s
     WHERE s.id = NEW.session_id AND s.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Session invalide pour cette réponse' USING ERRCODE = '42501';
  END IF;

  SELECT q.correct_answer, q.module INTO v_correct, v_module
    FROM public.questions q WHERE q.id = NEW.question_id;

  NEW.is_correct := CASE
    WHEN v_module IN ('CO', 'CE') AND v_correct IS NOT NULL
      THEN COALESCE(NEW.user_answer = v_correct, false)
    ELSE NULL
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_answers_integrity ON public.answers;
CREATE TRIGGER trg_answers_integrity
  BEFORE INSERT OR UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.enforce_answer_integrity();


-- ── H1 + M1 — Sessions : scores, chrono et statut verrouillés ─────────
CREATE OR REPLACE FUNCTION public.enforce_session_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.score_expert   := NULL;
    NEW.xp_earned      := 0;
    NEW.clb_estimate   := NULL;
    NEW.started_at     := now();
    NEW.created_at     := now();
    NEW.max_duration_s := LEAST(GREATEST(COALESCE(NEW.max_duration_s, 0), 0), 4 * 3600);
    -- Clés réservées au serveur (LTI) retirées des métadonnées client
    NEW.metadata := COALESCE(NEW.metadata, '{}'::JSONB) - 'lti' - 'institution_id'
                    - 'lis_outcome_service_url' - 'lis_result_sourcedid' - 'lti_consumer_key';

    -- Seul le test diagnostique (auto-évaluation, sans XP) est enregistré déjà terminé
    IF NEW.session_type IS DISTINCT FROM 'DIAGNOSTIC' THEN
      NEW.status           := 'in_progress';
      NEW.completed_at     := NULL;
      NEW.duration_seconds := NULL;
      NEW.score_auto       := NULL;
      NEW.nclc_estimate    := NULL;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE : colonnes figées
  NEW.id             := OLD.id;
  NEW.user_id        := OLD.user_id;
  NEW.session_type   := OLD.session_type;
  NEW.module         := OLD.module;
  NEW.test_type      := OLD.test_type;
  NEW.level          := OLD.level;
  NEW.question_ids   := OLD.question_ids;
  NEW.started_at     := OLD.started_at;
  NEW.max_duration_s := OLD.max_duration_s;
  NEW.score_auto     := OLD.score_auto;
  NEW.score_expert   := OLD.score_expert;
  NEW.xp_earned      := OLD.xp_earned;
  NEW.clb_estimate   := OLD.clb_estimate;
  NEW.metadata       := OLD.metadata;
  NEW.created_at     := OLD.created_at;

  IF OLD.status <> 'in_progress' THEN
    -- Session close : plus aucune modification du résultat
    NEW.status           := OLD.status;
    NEW.completed_at     := OLD.completed_at;
    NEW.duration_seconds := OLD.duration_seconds;
    NEW.nclc_estimate    := OLD.nclc_estimate;
  ELSIF NEW.status = 'in_progress' THEN
    NEW.completed_at     := OLD.completed_at;
    NEW.duration_seconds := OLD.duration_seconds;
    NEW.nclc_estimate    := OLD.nclc_estimate;
  ELSIF NEW.status IN ('completed', 'abandoned') THEN
    NEW.completed_at     := now();
    NEW.duration_seconds := GREATEST(0, EXTRACT(EPOCH FROM (now() - OLD.started_at))::INT);
    NEW.nclc_estimate    := CASE
      WHEN NEW.status = 'completed' AND OLD.session_type = 'SIMULATION'
        THEN public.compute_simulation_nclc(OLD.id)
      ELSE OLD.nclc_estimate
    END;
  ELSE
    -- 'expired' ou valeur inconnue : réservé au serveur
    NEW.status           := OLD.status;
    NEW.completed_at     := OLD.completed_at;
    NEW.duration_seconds := OLD.duration_seconds;
    NEW.nclc_estimate    := OLD.nclc_estimate;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sessions_integrity ON public.sessions;
CREATE TRIGGER trg_sessions_integrity
  BEFORE INSERT OR UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_session_integrity();

-- Plus de suppression client des sessions / réponses (historique B2B / LMS)
DROP POLICY IF EXISTS "sessions_own" ON public.sessions;
DROP POLICY IF EXISTS "sessions_own_select" ON public.sessions;
DROP POLICY IF EXISTS "sessions_own_insert" ON public.sessions;
DROP POLICY IF EXISTS "sessions_own_update" ON public.sessions;
CREATE POLICY "sessions_own_select" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions_own_insert" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_own_update" ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "answers_own" ON public.answers;
DROP POLICY IF EXISTS "answers_own_select" ON public.answers;
DROP POLICY IF EXISTS "answers_own_insert" ON public.answers;
DROP POLICY IF EXISTS "answers_own_update" ON public.answers;
CREATE POLICY "answers_own_select" ON public.answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "answers_own_insert" ON public.answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "answers_own_update" ON public.answers FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Statistiques et badges : écrits uniquement par le serveur
DROP POLICY IF EXISTS "progress_stats_own" ON public.progress_stats;
CREATE POLICY "progress_stats_own" ON public.progress_stats FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_badges_own" ON public.user_badges;
CREATE POLICY "user_badges_own" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);


-- ── H4 — Experts ──────────────────────────────────────────────────────
-- Avant : tout expert pouvait tout faire sur toutes les corrections et lire
-- toutes les réponses. Désormais : file d'attente (pending) + ses corrections.
DROP POLICY IF EXISTS "corrections_expert_manage_all" ON public.expert_corrections;

DROP POLICY IF EXISTS "corrections_expert_queue" ON public.expert_corrections;
CREATE POLICY "corrections_expert_queue" ON public.expert_corrections
  FOR SELECT USING (public.is_expert_or_admin() AND status = 'pending');

DROP POLICY IF EXISTS "corrections_expert_claim" ON public.expert_corrections;
CREATE POLICY "corrections_expert_claim" ON public.expert_corrections
  FOR UPDATE
  USING (public.is_expert_or_admin() AND status = 'pending' AND expert_id IS NULL)
  WITH CHECK (expert_id = auth.uid());

-- "corrections_expert" (init) reste : expert assigné ou admin.
DROP POLICY IF EXISTS "corrections_expert" ON public.expert_corrections;
CREATE POLICY "corrections_expert" ON public.expert_corrections
  FOR ALL USING (auth.uid() = expert_id OR public.is_admin())
  WITH CHECK (auth.uid() = expert_id OR public.is_admin());

-- Réponses lisibles par un expert : celles de la file d'attente ou qui lui
-- sont assignées. Responsables d'établissement : réponses de leurs élèves.
DROP POLICY IF EXISTS "answers_expert_corrections" ON public.answers;
CREATE POLICY "answers_expert_corrections" ON public.answers FOR SELECT USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.expert_corrections ec
     WHERE ec.answer_id = answers.id
       AND (ec.expert_id = auth.uid() OR (ec.status = 'pending' AND public.is_expert_or_admin()))
  )
  OR EXISTS (
    SELECT 1 FROM public.institution_students s
     WHERE s.user_id = answers.user_id
       AND public.is_institution_manager(s.institution_id)
  )
);

DROP POLICY IF EXISTS "sessions_institution_managers" ON public.sessions;
CREATE POLICY "sessions_institution_managers" ON public.sessions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.institution_students s
     WHERE s.user_id = sessions.user_id
       AND public.is_institution_manager(s.institution_id)
  )
);

-- Sessions de classe : un responsable ne crée que pour son établissement
DROP POLICY IF EXISTS "Manage class sessions" ON public.class_sessions;
CREATE POLICY "Manage class sessions" ON public.class_sessions
  FOR ALL
  USING (teacher_id = auth.uid() OR public.is_admin())
  WITH CHECK (public.is_admin() OR (teacher_id = auth.uid() AND public.is_institution_manager(institution_id)));


-- ── H3 — Affiliés ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.protect_affiliate_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.commission_rate   := 0.20;
    NEW.total_clicks      := 0;
    NEW.total_conversions := 0;
    NEW.total_earned_eur  := 0;
    NEW.is_active         := true;
    NEW.created_at        := now();
    RETURN NEW;
  END IF;

  -- UPDATE : seuls name et payment_method restent modifiables
  NEW.id                := OLD.id;
  NEW.user_id           := OLD.user_id;
  NEW.email             := OLD.email;
  NEW.code              := OLD.code;
  NEW.commission_rate   := OLD.commission_rate;
  NEW.total_clicks      := OLD.total_clicks;
  NEW.total_conversions := OLD.total_conversions;
  NEW.total_earned_eur  := OLD.total_earned_eur;
  NEW.is_active         := OLD.is_active;
  NEW.created_at        := OLD.created_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_affiliates_protect ON public.affiliates;
CREATE TRIGGER trg_affiliates_protect
  BEFORE INSERT OR UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.protect_affiliate_columns();

DROP POLICY IF EXISTS "affiliates_admin_all" ON public.affiliates;
CREATE POLICY "affiliates_admin_all" ON public.affiliates
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- La vue respecte désormais la RLS de l'appelant
ALTER VIEW public.affiliate_dashboard SET (security_invoker = true);
REVOKE ALL ON public.affiliate_dashboard FROM anon;


-- ── H5 — Accès premium : un pack expire réellement ────────────────────
-- Avant : un tier de pack sans subscription_expires_at donnait un accès
-- permanent. Désormais : pack valide seulement jusqu'à pack_expires_at.
CREATE OR REPLACE FUNCTION public.has_premium_access(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
     WHERE u.id = p_user_id
       AND (
         (u.subscription_tier IN ('essentiel', 'avance', 'premium', 'institutionnel')
           AND (u.subscription_expires_at IS NULL OR u.subscription_expires_at > now()))
         OR
         (u.active_pack_id IN ('bronze', 'silver', 'gold', 'platinum')
           AND u.pack_expires_at > now())
       )
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_premium_access(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_premium_access(UUID) TO authenticated, service_role;

DROP POLICY IF EXISTS "questions_read_active" ON public.questions;
CREATE POLICY "questions_read_active" ON public.questions FOR SELECT USING (
  is_active = true AND (is_premium = false OR public.has_premium_access() OR public.is_admin())
);

-- Remise à 'gratuit' des accès échus (appelée par pg_cron si disponible)
CREATE OR REPLACE FUNCTION public.expire_lapsed_access()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.user_pack_subscriptions
     SET status = 'expired'
   WHERE status = 'active' AND expires_at <= now();

  UPDATE public.users
     SET subscription_tier = 'gratuit',
         subscription_expires_at = NULL,
         active_pack_id = NULL
   WHERE (subscription_tier IN ('bronze', 'silver', 'gold', 'platinum')
           AND (pack_expires_at IS NULL OR pack_expires_at <= now()))
      OR (subscription_tier IN ('essentiel', 'avance', 'premium')
           AND subscription_expires_at IS NOT NULL AND subscription_expires_at <= now());
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.expire_lapsed_access() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'expire-lapsed-access';
    PERFORM cron.schedule('expire-lapsed-access', '15 * * * *', 'SELECT public.expire_lapsed_access()');
  ELSE
    RAISE NOTICE 'pg_cron absent : planifier public.expire_lapsed_access() (Dashboard → Database → Extensions → pg_cron)';
  END IF;
END $$;


-- ── H6 — Crédits IA atomiques + limitation de débit ───────────────────
-- Débite un crédit d'un pack actif AVANT l'appel OpenAI. Renvoie l'id du
-- pack débité, ou NULL si aucun crédit. Verrouillage FOR UPDATE : N appels
-- parallèles ne consomment jamais plus que les crédits disponibles.
CREATE OR REPLACE FUNCTION public.consume_ai_credit(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id
    FROM public.user_pack_subscriptions
   WHERE user_id = p_user_id
     AND status = 'active'
     AND expires_at > now()
     AND ai_trials_remaining > 0
   ORDER BY expires_at ASC
   LIMIT 1
   FOR UPDATE;

  IF v_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.user_pack_subscriptions
     SET ai_trials_remaining = ai_trials_remaining - 1
   WHERE id = v_id;
  RETURN v_id;
END;
$$;

-- Rembourse un crédit si l'appel IA a échoué
CREATE OR REPLACE FUNCTION public.refund_ai_credit(p_pack_subscription_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_pack_subscriptions
     SET ai_trials_remaining = ai_trials_remaining + 1
   WHERE id = p_pack_subscription_id;
$$;

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key           TEXT        NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  hits          INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

-- Compte un appel ; renvoie false si la limite de la fenêtre est dépassée
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key TEXT, p_limit INT, p_window_seconds INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window TIMESTAMPTZ := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  v_hits   INT;
BEGIN
  INSERT INTO public.rate_limits AS r (key, window_start, hits)
  VALUES (p_key, v_window, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING hits INTO v_hits;

  -- Purge opportuniste des fenêtres anciennes
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits WHERE window_start < now() - INTERVAL '2 days';
  END IF;

  RETURN v_hits <= p_limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_ai_credit(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_ai_credit(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_credit(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_ai_credit(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;


-- ── H8 — Consentements cookies ────────────────────────────────────────
DROP POLICY IF EXISTS "cookie_consents_own" ON public.cookie_consents;
DROP POLICY IF EXISTS "cookie_consents_insert" ON public.cookie_consents;
DROP POLICY IF EXISTS "cookie_consents_select_own" ON public.cookie_consents;
DROP POLICY IF EXISTS "cookie_consents_admin" ON public.cookie_consents;
CREATE POLICY "cookie_consents_insert" ON public.cookie_consents
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "cookie_consents_select_own" ON public.cookie_consents
  FOR SELECT USING (user_id IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "cookie_consents_admin" ON public.cookie_consents
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
