-- ================================================================
-- Migration 025 — Bonnes réponses invisibles côté client (audit H1, suite)
--   Avant : questions.correct_answer / explanation lisibles par tout compte
--   (et anon) via l'API : n'importe qui pouvait lire les réponses avant
--   de répondre, ou aspirer la banque de corrigés.
--   Après :
--     - colonnes de corrigé (correct_answer, explanation, model_answer,
--       correction_grid, statistiques) retirées du droit SELECT client
--     - corrigé d'une session disponible uniquement une fois la session
--       terminée, via get_session_review()
--     - test diagnostique noté par le serveur : submit_diagnostic()
--     - une réponse QCM enregistrée n'est plus modifiable (pas d'oracle)
--     - liste admin complète via admin_list_questions()
-- Migration idempotente.
--
-- ⚠ Toute nouvelle colonne de public.questions devra être ajoutée au
--   GRANT SELECT ci-dessous pour être lisible par l'application.
-- ================================================================


-- ── 1. Droits par colonne sur public.questions ────────────────────────
REVOKE SELECT ON public.questions FROM anon, authenticated;
GRANT SELECT (
  id, module, test_type, level, question_text,
  audio_url, audio_cdn_path, audio_duration_s, max_listens,
  passage_text, options, theme, sub_theme, source_type,
  difficulty_score, times_used, is_active, is_premium,
  created_by, created_at, updated_at,
  published_month, is_topical, topical_badge,
  task_type, target_words
) ON public.questions TO anon, authenticated;
-- Non accordées : correct_answer, explanation, model_answer, correction_grid,
-- times_correct, success_rate (lisibles par service_role et les fonctions
-- SECURITY DEFINER ci-dessous).


-- ── 2. Clé de correction pour les triggers (schéma non exposé par l'API) ──
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.question_answer_key(p_question_id UUID)
RETURNS TABLE (correct_answer TEXT, module TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.correct_answer, q.module FROM public.questions q WHERE q.id = p_question_id;
$$;
REVOKE EXECUTE ON FUNCTION private.question_answer_key(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.question_answer_key(UUID) TO authenticated, service_role;


-- ── 3. Réponses : is_correct serveur + réponse QCM définitive ─────────
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

  -- La réponse doit appartenir à une session EN COURS de l'utilisateur
  IF NOT EXISTS (
    SELECT 1 FROM public.sessions s
     WHERE s.id = NEW.session_id
       AND s.user_id = NEW.user_id
       AND s.status = 'in_progress'
  ) THEN
    RAISE EXCEPTION 'Session invalide ou terminée pour cette réponse' USING ERRCODE = '42501';
  END IF;

  SELECT k.correct_answer, k.module INTO v_correct, v_module
    FROM private.question_answer_key(NEW.question_id) k;

  IF TG_OP = 'UPDATE' THEN
    NEW.user_id          := OLD.user_id;
    NEW.session_id       := OLD.session_id;
    NEW.question_id      := OLD.question_id;
    NEW.auto_feedback    := OLD.auto_feedback;
    NEW.expert_feedback  := OLD.expert_feedback;
    NEW.expert_score     := OLD.expert_score;
    NEW.audio_transcript := OLD.audio_transcript;
    -- QCM : la première réponse enregistrée est définitive (sinon is_correct,
    -- lisible par l'élève, servirait d'oracle pour trouver la bonne réponse)
    IF v_module IN ('CO', 'CE') AND OLD.user_answer IS NOT NULL THEN
      NEW.user_answer := OLD.user_answer;
    END IF;
  ELSE
    NEW.auto_feedback    := NULL;
    NEW.expert_feedback  := NULL;
    NEW.expert_score     := NULL;
    NEW.audio_transcript := NULL;
  END IF;

  NEW.is_correct := CASE
    WHEN v_module IN ('CO', 'CE') AND v_correct IS NOT NULL
      THEN COALESCE(NEW.user_answer = v_correct, false)
    ELSE NULL
  END;

  RETURN NEW;
END;
$$;


-- ── 4. Corrigé d'une session (après la fin de la session) ─────────────
CREATE OR REPLACE FUNCTION public.get_session_review(p_session_id UUID)
RETURNS TABLE (
  answer_id          UUID,
  session_id         UUID,
  question_id        UUID,
  user_answer        TEXT,
  is_correct         BOOLEAN,
  audio_storage_path TEXT,
  audio_transcript   TEXT,
  auto_feedback      JSONB,
  expert_feedback    TEXT,
  expert_score       FLOAT,
  created_at         TIMESTAMPTZ,
  question           JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_status  TEXT;
  v_uid     UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentification requise' USING ERRCODE = '42501';
  END IF;

  SELECT s.user_id, s.status INTO v_user_id, v_status
    FROM public.sessions s WHERE s.id = p_session_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF NOT (
    -- l'élève, une fois la session terminée
    (v_user_id = v_uid AND v_status <> 'in_progress')
    OR public.is_admin()
    -- responsable de l'établissement de l'élève
    OR EXISTS (
      SELECT 1 FROM public.institution_students st
       WHERE st.user_id = v_user_id AND public.is_institution_manager(st.institution_id)
    )
    -- expert chargé d'une correction de cette session
    OR EXISTS (
      SELECT 1 FROM public.expert_corrections ec
       WHERE ec.session_id = p_session_id
         AND (ec.expert_id = v_uid OR (ec.status = 'pending' AND public.is_expert_or_admin()))
    )
  ) THEN
    IF v_user_id = v_uid THEN
      RAISE EXCEPTION 'Corrigé disponible à la fin de la session' USING ERRCODE = '42501';
    END IF;
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT a.id, a.session_id, a.question_id, a.user_answer, a.is_correct,
         a.audio_storage_path, a.audio_transcript, a.auto_feedback,
         a.expert_feedback, a.expert_score, a.created_at,
         jsonb_build_object(
           'id', q.id, 'module', q.module, 'test_type', q.test_type, 'level', q.level,
           'question_text', q.question_text, 'passage_text', q.passage_text,
           'audio_url', q.audio_url, 'options', q.options, 'theme', q.theme,
           'task_type', q.task_type,
           'correct_answer', q.correct_answer, 'explanation', q.explanation,
           'model_answer', q.model_answer
         )
    FROM public.answers a
    JOIN public.questions q ON q.id = a.question_id
   WHERE a.session_id = p_session_id
   ORDER BY a.created_at, a.id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_session_review(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_session_review(UUID) TO authenticated, service_role;


-- ── 5. Test diagnostique : questions sans corrigé + notation serveur ──
DROP FUNCTION IF EXISTS public.get_diagnostic_questions(TEXT, TEXT, INT);
CREATE FUNCTION public.get_diagnostic_questions(
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
  options JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, module, level, question_text, audio_url, passage_text, options
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

-- Note le test, enregistre la session et le niveau, renvoie le corrigé.
-- p_answers : {"<question_id>": "A", ...} (20 réponses au plus)
CREATE OR REPLACE FUNCTION public.submit_diagnostic(
  p_answers    JSONB,
  p_device     TEXT DEFAULT 'web',
  p_duration_s INT  DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid        UUID := auth.uid();
  v_total      INT;
  v_correct    INT;
  v_level      TEXT;
  v_session_id UUID;
  v_corrections JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentification requise' USING ERRCODE = '42501';
  END IF;
  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'Réponses invalides' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(*) FROM jsonb_object_keys(p_answers)) > 20 THEN
    RAISE EXCEPTION 'Trop de réponses' USING ERRCODE = '22023';
  END IF;
  IF NOT public.check_rate_limit('diagnostic:' || v_uid::TEXT, 10, 3600) THEN
    RAISE EXCEPTION 'Trop de tests diagnostiques, réessayez plus tard' USING ERRCODE = 'P0001';
  END IF;

  -- Seules comptent les questions éligibles au diagnostic (gratuites, QCM)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'question_id', q.id,
           'user_answer', left(e.value, 1),
           'correct_answer', q.correct_answer,
           'explanation', q.explanation,
           'is_correct', COALESCE(left(e.value, 1) = q.correct_answer, false))), '[]'::JSONB)
    INTO v_corrections
    FROM jsonb_each_text(p_answers) e
    JOIN public.questions q
      ON e.key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     AND q.id = e.key::UUID
   WHERE q.module IN ('CO', 'CE')
     AND q.is_active = true
     AND q.is_premium = false
     AND q.correct_answer IS NOT NULL;

  v_total   := jsonb_array_length(v_corrections);
  v_correct := (SELECT count(*) FROM jsonb_array_elements(v_corrections) c WHERE (c ->> 'is_correct')::BOOLEAN);
  IF v_total = 0 THEN
    RAISE EXCEPTION 'Aucune question de diagnostic valide' USING ERRCODE = '22023';
  END IF;

  -- Seuils historiques sur 16 questions (14 → C1, 10 → B2, 5 → B1), proportionnels
  v_level := CASE
    WHEN v_correct * 16 >= 14 * v_total THEN 'C1'
    WHEN v_correct * 16 >= 10 * v_total THEN 'B2'
    WHEN v_correct * 16 >= 5  * v_total THEN 'B1'
    ELSE 'A2'
  END;

  INSERT INTO public.sessions (
    user_id, session_type, module, test_type, level, status, started_at, completed_at,
    duration_seconds, max_duration_s, score_auto, nclc_estimate, device_type
  ) VALUES (
    v_uid, 'DIAGNOSTIC', 'FULL_TCF', 'TCF_CANADA', 'MIXED', 'completed',
    now() - make_interval(secs => LEAST(GREATEST(COALESCE(p_duration_s, 0), 0), 1200)), now(),
    LEAST(GREATEST(COALESCE(p_duration_s, 0), 0), 1200), 1200,
    round((v_correct::NUMERIC / v_total) * 1000) / 10, v_level,
    CASE WHEN p_device IN ('web', 'ios', 'android') THEN p_device ELSE 'web' END
  )
  RETURNING id INTO v_session_id;

  INSERT INTO public.answers (session_id, question_id, user_id, user_answer, is_correct)
  SELECT v_session_id, (c ->> 'question_id')::UUID, v_uid, c ->> 'user_answer', (c ->> 'is_correct')::BOOLEAN
    FROM jsonb_array_elements(v_corrections) c;

  UPDATE public.users SET level_assessed = v_level WHERE id = v_uid;

  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'correct', v_correct,
    'total', v_total,
    'score_percent', round((v_correct::NUMERIC / v_total) * 1000) / 10,
    'level', v_level,
    'corrections', v_corrections
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.submit_diagnostic(JSONB, TEXT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_diagnostic(JSONB, TEXT, INT) TO authenticated;


-- ── 6. Gestion des questions (admin) : lecture complète ───────────────
CREATE OR REPLACE FUNCTION public.admin_list_questions()
RETURNS SETOF public.questions
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Réservé aux administrateurs' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.questions ORDER BY created_at DESC;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_list_questions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_questions() TO authenticated;
