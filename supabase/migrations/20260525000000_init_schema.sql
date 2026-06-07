-- ================================================
-- ayePREP — Schéma PostgreSQL 15
-- Supabase Cloud — eu-central-1
-- Version: 2.0
-- ================================================

-- ----------------------
-- Extensions
-- ----------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Recherche textuelle
-- Note: 'vector' extension is excluded if not pre-installed, or we can use standard PG schema.
-- Let's enable it as per spec, but add fallback or catch if it fails.
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector (embeddings futurs)

-- ----------------------
-- USERS (profils utilisateurs)
-- ----------------------
-- Note: auth.users is managed by Supabase, we create public.users
CREATE TABLE IF NOT EXISTS public.users (
  id                      UUID PRIMARY KEY, -- Will be set via trigger on auth.users or upserted
  email                   TEXT UNIQUE NOT NULL,
  full_name               TEXT NOT NULL CHECK (char_length(full_name) >= 2),
  avatar_url              TEXT,
  country                 TEXT NOT NULL,
  phone                   TEXT,
  level_assessed          TEXT CHECK (level_assessed IN ('A1','A2','B1','B2','C1','C2')),
  target_test             TEXT CHECK (target_test IN ('TCF_CANADA','TEF_CANADA','BOTH')),
  exam_date               DATE CHECK (exam_date >= CURRENT_DATE),
  role                    TEXT DEFAULT 'user' CHECK (role IN ('user','expert','admin')),
  subscription_tier       TEXT DEFAULT 'gratuit'
                              CHECK (subscription_tier IN 
                                ('gratuit','essentiel','avance','premium','institutionnel')),
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id      TEXT UNIQUE,
  revenuecat_app_user_id  TEXT UNIQUE,
  xp_points               INTEGER DEFAULT 0 CHECK (xp_points >= 0),
  streak_days             INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  longest_streak          INTEGER DEFAULT 0,
  last_activity_at        TIMESTAMPTZ,
  notifications_enabled   BOOLEAN DEFAULT true,
  daily_reminder_hour     INTEGER DEFAULT 9 CHECK (daily_reminder_hour BETWEEN 0 AND 23),
  offline_mode_enabled    BOOLEAN DEFAULT false,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_country ON public.users(country);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON public.users(subscription_tier, subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON public.users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON public.users;
CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------
-- QUESTIONS (banque de 2000+ sujets)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module           TEXT NOT NULL CHECK (module IN ('CO','CE','EE','EO')),
  test_type        TEXT NOT NULL CHECK (test_type IN ('TCF_CANADA','TEF_CANADA','BOTH')),
  level            TEXT NOT NULL CHECK (level IN ('A2','B1','B2','C1','C2')),
  question_text    TEXT NOT NULL CHECK (char_length(question_text) >= 10),
  audio_url        TEXT,                        -- Cloudflare CDN URL
  audio_cdn_path   TEXT,                        -- Chemin brut R2
  audio_duration_s INTEGER,                     -- Durée en secondes
  max_listens      INTEGER DEFAULT 2
                       CHECK (max_listens IN (1,2)),
  passage_text     TEXT,                        -- Texte CE à lire
  options          JSONB,                       -- {"A":"...","B":"...","C":"...","D":"..."}
  correct_answer   TEXT CHECK (correct_answer IN ('A','B','C','D')),
  model_answer     TEXT,                        -- Réponse modèle (EE/EO)
  correction_grid  JSONB,                       -- Grille critères par épreuve
  explanation      TEXT NOT NULL,
  theme            TEXT NOT NULL,               -- thème pédagogique
  sub_theme        TEXT,
  source_type      TEXT DEFAULT 'original'
                       CHECK (source_type IN ('original','adapted')),
  difficulty_score INTEGER CHECK (difficulty_score BETWEEN 1 AND 10),
  times_used       INTEGER DEFAULT 0,
  times_correct    INTEGER DEFAULT 0,
  success_rate     FLOAT GENERATED ALWAYS AS (
                     CASE WHEN times_used = 0 THEN NULL
                          ELSE times_correct::FLOAT / times_used
                     END
                   ) STORED,
  is_active        BOOLEAN DEFAULT true,
  is_premium       BOOLEAN DEFAULT false,
  created_by       UUID REFERENCES public.users(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_module_level ON public.questions(module, level, is_active);
CREATE INDEX IF NOT EXISTS idx_questions_test_type ON public.questions(test_type, module, level);
CREATE INDEX IF NOT EXISTS idx_questions_theme ON public.questions USING gin(theme gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty_score, module, level);

DROP TRIGGER IF EXISTS trg_questions_updated ON public.questions;
CREATE TRIGGER trg_questions_updated
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------
-- SESSIONS (entraînements et simulations)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_type      TEXT NOT NULL CHECK (session_type IN ('TRAINING','SIMULATION','DIAGNOSTIC')),
  module            TEXT NOT NULL CHECK (module IN ('CO','CE','EE','EO','FULL_TCF','FULL_TEF')),
  test_type         TEXT CHECK (test_type IN ('TCF_CANADA','TEF_CANADA')),
  level             TEXT CHECK (level IN ('B1','B2','C1','C2','MIXED')),
  question_ids      UUID[] NOT NULL DEFAULT '{}',   -- Ordre des questions
  started_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  duration_seconds  INTEGER CHECK (duration_seconds >= 0),
  max_duration_s    INTEGER NOT NULL,               -- Durée allouée (validation serveur)
  score_auto        FLOAT CHECK (score_auto BETWEEN 0 AND 100),
  score_expert      FLOAT,
  nclc_estimate     TEXT CHECK (nclc_estimate IN ('A1','A2','B1','B2','C1','C2')),
  clb_estimate      TEXT,
  xp_earned         INTEGER DEFAULT 0,
  status            TEXT DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress','completed','abandoned','expired')),
  device_type       TEXT CHECK (device_type IN ('web','ios','android')),
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON public.sessions(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_module_type ON public.sessions(module, test_type, session_type);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON public.sessions(user_id, completed_at DESC) 
  WHERE status = 'completed';

-- ----------------------
-- ANSWERS (réponses par question)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.answers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_id         UUID NOT NULL REFERENCES public.questions(id),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_answer         TEXT,                     -- Réponse QCM (A/B/C/D) ou texte EE
  audio_storage_path  TEXT,                     -- Chemin Supabase Storage (EO)
  audio_url           TEXT,                     -- URL signée (EO)
  audio_transcript    TEXT,                     -- Transcription Whisper (EO)
  is_correct          BOOLEAN,                  -- NULL pour EE/EO
  time_spent_seconds  INTEGER,
  listen_count        INTEGER DEFAULT 0,        -- Nb d'écoutes (CO)
  auto_feedback       JSONB,                    -- JSON GPT-4o par critère
  expert_feedback     TEXT,
  expert_score        FLOAT,
  is_flagged          BOOLEAN DEFAULT false,    -- Signalé pour révision
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answers_session ON public.answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_question ON public.answers(user_id, question_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_answers_session_question ON public.answers(session_id, question_id);

-- ----------------------
-- SUBSCRIPTIONS (abonnements)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan                 TEXT NOT NULL CHECK (plan IN 
                           ('essentiel','avance','premium','institutionnel')),
  billing_period       TEXT NOT NULL CHECK (billing_period IN ('monthly','quarterly','yearly')),
  stripe_sub_id        TEXT UNIQUE,
  stripe_price_id      TEXT,
  revenuecat_id        TEXT UNIQUE,
  platform             TEXT CHECK (platform IN ('web','ios','android')),
  status               TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','cancelled','past_due','trialing','paused')),
  trial_end            TIMESTAMPTZ,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at           TIMESTAMPTZ NOT NULL,
  cancelled_at         TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  amount_paid          NUMERIC(10,2) NOT NULL,
  currency             TEXT DEFAULT 'EUR' CHECK (char_length(currency) = 3),
  discount_applied     TEXT,
  metadata             JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_sub_id) WHERE stripe_sub_id IS NOT NULL;

-- ----------------------
-- PURCHASE_HISTORY (achats unitaires)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.purchase_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_type     TEXT NOT NULL CHECK (product_type IN (
                       'simulation_tcf','simulation_tef',
                       'correction_ee','correction_eo',
                       'pack_simulations','pack_corrections')),
  quantity         INTEGER DEFAULT 1,
  unit_price       NUMERIC(10,2) NOT NULL,
  total_price      NUMERIC(10,2) NOT NULL,
  currency         TEXT DEFAULT 'EUR',
  stripe_payment_id TEXT,
  status           TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','refunded')),
  used_count       INTEGER DEFAULT 0,
  purchased_at     TIMESTAMPTZ DEFAULT now()
);

-- ----------------------
-- EXPERT_CORRECTIONS (corrections humaines)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.expert_corrections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  answer_id        UUID NOT NULL REFERENCES public.answers(id),
  user_id          UUID NOT NULL REFERENCES public.users(id),
  expert_id        UUID REFERENCES public.users(id),
  module           TEXT NOT NULL CHECK (module IN ('EE','EO')),
  test_type        TEXT CHECK (test_type IN ('TCF_CANADA','TEF_CANADA')),
  status           TEXT DEFAULT 'pending'
                       CHECK (status IN ('pending','assigned','in_review','completed','disputed')),
  priority         TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  assigned_at      TIMESTAMPTZ,
  due_at           TIMESTAMPTZ,                -- deadline SLA
  completed_at     TIMESTAMPTZ,
  score_criteria   JSONB,                      -- Scores par critère CECRL
  global_score     FLOAT CHECK (global_score BETWEEN 0 AND 100),
  feedback_text    TEXT,
  suggestions      TEXT[],
  expert_notes     TEXT,                       -- Notes internes expert
  dispute_reason   TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expert_corrections_status ON public.expert_corrections(status, due_at ASC);
CREATE INDEX IF NOT EXISTS idx_expert_corrections_expert ON public.expert_corrections(expert_id, status);

DROP TRIGGER IF EXISTS trg_expert_corrections_updated ON public.expert_corrections;
CREATE TRIGGER trg_expert_corrections_updated
  BEFORE UPDATE ON public.expert_corrections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------
-- BADGES (gamification)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url    TEXT NOT NULL,
  xp_reward   INTEGER DEFAULT 50,
  condition   JSONB NOT NULL,             -- Condition de déverrouillage
  rarity      TEXT DEFAULT 'common'
                  CHECK (rarity IN ('common','rare','epic','legendary')),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES public.badges(id),
  earned_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- ----------------------
-- PROGRESS_STATS (statistiques par module)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.progress_stats (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module              TEXT NOT NULL CHECK (module IN ('CO','CE','EE','EO')),
  test_type           TEXT CHECK (test_type IN ('TCF_CANADA','TEF_CANADA')),
  mastery_score       FLOAT DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  sessions_completed  INTEGER DEFAULT 0,
  questions_answered  INTEGER DEFAULT 0,
  questions_correct   INTEGER DEFAULT 0,
  accuracy_rate       FLOAT GENERATED ALWAYS AS (
                        CASE WHEN questions_answered = 0 THEN 0
                             ELSE questions_correct::FLOAT / questions_answered * 100
                        END
                      ) STORED,
  avg_score           FLOAT,
  best_score          FLOAT,
  total_time_s        INTEGER DEFAULT 0,
  themes_weak         TEXT[],                   -- Thèmes à retravailler
  last_session_at     TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module, test_type)
);

-- ----------------------
-- NOTIFICATIONS (centre de notifications)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN (
                   'correction_ready','streak_reminder','exam_countdown',
                   'badge_earned','subscription_expiring','promo')),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  data         JSONB,
  is_read      BOOLEAN DEFAULT false,
  sent_at      TIMESTAMPTZ,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- ----------------------
-- OFFLINE_CACHE (gestion cache mobile)
-- ----------------------
CREATE TABLE IF NOT EXISTS public.offline_downloads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module       TEXT NOT NULL CHECK (module IN ('CO','CE','EE','EO')),
  test_type    TEXT CHECK (test_type IN ('TCF_CANADA','TEF_CANADA')),
  level        TEXT,
  question_ids UUID[] NOT NULL,
  file_size_mb FLOAT,
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  expires_at   TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  device_id    TEXT,
  UNIQUE(user_id, module, test_type, level)
);

-- ========================
-- Activer RLS sur TOUTES les tables
-- ========================
ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_corrections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_stats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_downloads    ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_expert_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('expert','admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));
DROP POLICY IF EXISTS "users_admin_all" ON public.users;
CREATE POLICY "users_admin_all" ON public.users FOR ALL USING (is_admin());

-- QUESTIONS (lecture conditionnelle selon abonnement)
DROP POLICY IF EXISTS "questions_read_active" ON public.questions;
CREATE POLICY "questions_read_active" ON public.questions FOR SELECT USING (
  is_active = true AND (
    is_premium = false OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND subscription_tier IN ('avance','premium','institutionnel')
        AND (subscription_expires_at IS NULL OR subscription_expires_at > now())
    ) OR
    is_admin()
  )
);
DROP POLICY IF EXISTS "questions_admin_all" ON public.questions;
CREATE POLICY "questions_admin_all" ON public.questions FOR ALL USING (is_admin());

-- SESSIONS
DROP POLICY IF EXISTS "sessions_own" ON public.sessions;
CREATE POLICY "sessions_own" ON public.sessions FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "sessions_admin" ON public.sessions;
CREATE POLICY "sessions_admin" ON public.sessions FOR ALL USING (is_admin());

-- ANSWERS
DROP POLICY IF EXISTS "answers_own" ON public.answers;
CREATE POLICY "answers_own" ON public.answers FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "answers_expert_corrections" ON public.answers;
CREATE POLICY "answers_expert_corrections" ON public.answers FOR SELECT
  USING (is_expert_or_admin());

-- EXPERT_CORRECTIONS
DROP POLICY IF EXISTS "corrections_user_view" ON public.expert_corrections;
CREATE POLICY "corrections_user_view" ON public.expert_corrections FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "corrections_expert" ON public.expert_corrections;
CREATE POLICY "corrections_expert" ON public.expert_corrections FOR ALL
  USING (auth.uid() = expert_id OR is_admin());

-- USER_BADGES, PROGRESS_STATS, NOTIFICATIONS, SUBSCRIPTIONS (même pattern)
DROP POLICY IF EXISTS "user_badges_own" ON public.user_badges;
CREATE POLICY "user_badges_own" ON public.user_badges FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "progress_stats_own" ON public.progress_stats;
CREATE POLICY "progress_stats_own" ON public.progress_stats FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "subscriptions_own" ON public.subscriptions;
CREATE POLICY "subscriptions_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "subscriptions_admin" ON public.subscriptions;
CREATE POLICY "subscriptions_admin" ON public.subscriptions FOR ALL USING (is_admin());

-- Calcul niveau NCLC à partir du score
CREATE OR REPLACE FUNCTION get_nclc_level(
  p_score FLOAT,
  p_test_type TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_level TEXT;
BEGIN
  IF p_test_type = 'TCF_CANADA' THEN
    v_level := CASE
      WHEN p_score >= 523 THEN 'C2'
      WHEN p_score >= 457 THEN 'C1'
      WHEN p_score >= 356 THEN 'B2'
      WHEN p_score >= 242 THEN 'B1'
      WHEN p_score >= 181 THEN 'A2'
      ELSE 'A1'
    END;
  ELSIF p_test_type = 'TEF_CANADA' THEN
    v_level := CASE
      WHEN p_score >= 526 THEN 'C2'
      WHEN p_score >= 451 THEN 'C1'
      WHEN p_score >= 361 THEN 'B2'
      WHEN p_score >= 271 THEN 'B1'
      WHEN p_score >= 181 THEN 'A2'
      ELSE 'A1'
    END;
  END IF;
  RETURN v_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Placeholder for check_and_award_badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Implementation logic for checking badges based on badges table rules
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Mise à jour XP et streak après une session
CREATE OR REPLACE FUNCTION award_session_xp(
  p_user_id UUID,
  p_session_id UUID,
  p_xp INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_last_activity TIMESTAMPTZ;
  v_streak INTEGER;
BEGIN
  SELECT last_activity_at, streak_days INTO v_last_activity, v_streak
  FROM public.users WHERE id = p_user_id;

  -- Mise à jour streak
  IF v_last_activity IS NULL OR 
     v_last_activity < (now() - INTERVAL '2 days') THEN
    v_streak := 1;  -- Reset
  ELSIF v_last_activity::DATE < CURRENT_DATE THEN
    v_streak := v_streak + 1;  -- Nouveau jour
  END IF;

  UPDATE public.users
  SET xp_points = xp_points + p_xp,
      streak_days = v_streak,
      longest_streak = GREATEST(longest_streak, v_streak),
      last_activity_at = now()
  WHERE id = p_user_id;

  UPDATE public.sessions
  SET xp_earned = p_xp
  WHERE id = p_session_id;

  -- Vérifier badges
  PERFORM check_and_award_badges(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sélection intelligente des questions (évite les répétitions)
CREATE OR REPLACE FUNCTION select_questions_for_session(
  p_user_id UUID,
  p_module TEXT,
  p_test_type TEXT,
  p_level TEXT,
  p_count INTEGER
)
RETURNS TABLE(question_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT q.id
  FROM public.questions q
  WHERE q.module = p_module
    AND (q.test_type = p_test_type OR q.test_type = 'BOTH')
    AND q.level = p_level
    AND q.is_active = true
    AND q.id NOT IN (
      -- Exclure les 50 dernières questions déjà vues par l'utilisateur
      SELECT a.question_id
      FROM public.answers a
      JOIN public.sessions s ON a.session_id = s.id
      WHERE s.user_id = p_user_id
        AND s.module = p_module
        AND s.created_at > (now() - INTERVAL '30 days')
      ORDER BY a.created_at DESC
      LIMIT 50
    )
  ORDER BY
    -- Prioriser les questions moins vues et avec un taux d'échec élevé
    CASE WHEN q.success_rate IS NULL THEN 0 ELSE q.success_rate END ASC,
    q.times_used ASC,
    random()
  LIMIT p_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------
-- SYSTEM USER SEED FOR RGPD ANONYMIZATION
-- ----------------------------------------------------
INSERT INTO public.users (id, email, full_name, country, role, subscription_tier)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'anonyme@ayeprep.com',
  'Utilisateur Anonyme',
  'Canada',
  'user',
  'gratuit'
) ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------
-- PROFILE SYNC TRIGGER (auth.users -> public.users)
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

