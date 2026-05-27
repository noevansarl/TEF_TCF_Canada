-- ================================================================
-- Migration 002 — Améliorations V2 (Mai 2026)
-- Corrections factuelles + nouvelles fonctionnalités
-- ================================================================

-- ── 1. CORRECTION DES QUESTIONS : nombre officiel TCF Canada ────
-- Ajout d'un champ pour valider le nombre de questions par session
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS total_questions INTEGER,
  ADD COLUMN IF NOT EXISTS pack_id VARCHAR(20),
  ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(50);

-- Contrainte sur les durées officielles (TCF Canada 2026)
-- CO = 39 questions · 35 min = 2100 secondes
-- CE = 39 questions · 35 min = 2100 secondes
-- EE =  3 tâches  · 60 min = 3600 secondes
-- EO =  3 tâches  · 12 min =  720 secondes
COMMENT ON COLUMN public.sessions.total_questions IS
  'TCF Canada: CO=39, CE=39, EE=3, EO=3. TEF: CO=60, CE=50, EE=2, EO=4';

-- ── 2. MISE À JOUR QUESTIONS : fraîcheur du contenu ─────────────
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS published_month VARCHAR(7),        -- ex: '2026-05'
  ADD COLUMN IF NOT EXISTS is_topical BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS topical_badge VARCHAR(50),         -- ex: 'Nouveau · Mai 2026'
  ADD COLUMN IF NOT EXISTS difficulty_score NUMERIC(4,2) DEFAULT 50,
  ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Index pour prioriser les sujets récents en premier
CREATE INDEX IF NOT EXISTS idx_questions_recent
  ON public.questions(published_month DESC, is_topical DESC)
  WHERE is_active = true;

-- ── 3. TABLE PACKS À DURÉE LIMITÉE ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.exam_packs (
  id                   VARCHAR(20)   PRIMARY KEY,  -- 'bronze' | 'silver' | 'gold' | 'platinum'
  name                 VARCHAR(50)   NOT NULL,
  price_eur            NUMERIC(8,2)  NOT NULL,
  price_xof            INTEGER       NOT NULL,      -- FCFA (avec réduction Afrique -40%)
  duration_days        INTEGER       NOT NULL,
  ai_trials            INTEGER       NOT NULL,      -- corrections IA EE/EO incluses
  co_tests             INTEGER       NOT NULL,      -- -1 = illimité
  ce_tests             INTEGER       NOT NULL,
  simulations          INTEGER       NOT NULL,
  is_active            BOOLEAN       DEFAULT true,
  created_at           TIMESTAMPTZ   DEFAULT NOW()
);

-- Données initiales des packs
INSERT INTO public.exam_packs (id, name, price_eur, price_xof, duration_days, ai_trials, co_tests, ce_tests, simulations)
VALUES
  ('bronze',   'Pack Découverte',   14.99,  9800,  5,  3,   40,  40,  1),
  ('silver',   'Pack Préparation',  29.99, 19600, 30,  8,  120, 120,  5),
  ('gold',     'Pack Intensif',     49.99, 32700, 60, 15,  300, 300, 12),
  ('platinum', 'Pack Champion',     79.99, 52300, 90, 30,  -1,  -1,  -1)
ON CONFLICT (id) DO UPDATE SET
  price_eur = EXCLUDED.price_eur,
  price_xof = EXCLUDED.price_xof;

-- ── 4. TABLE ABONNEMENTS PACKS (utilisateurs) ───────────────────
CREATE TABLE IF NOT EXISTS public.user_pack_subscriptions (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pack_id              VARCHAR(20)   NOT NULL REFERENCES public.exam_packs(id),
  purchased_at         TIMESTAMPTZ   DEFAULT NOW(),
  expires_at           TIMESTAMPTZ   NOT NULL,
  payment_method       VARCHAR(30),  -- 'stripe' | 'orange_money' | 'mtn_momo' | 'wave'
  payment_currency     VARCHAR(10),  -- 'EUR' | 'XOF'
  amount_paid          NUMERIC(10,2) NOT NULL,
  ai_trials_remaining  INTEGER       NOT NULL,
  co_tests_remaining   INTEGER       NOT NULL,    -- -1 = illimité
  ce_tests_remaining   INTEGER       NOT NULL,
  simulations_remaining INTEGER      NOT NULL,
  status               VARCHAR(20)   DEFAULT 'active', -- 'active' | 'expired' | 'refunded'
  stripe_payment_intent_id VARCHAR(100),
  fedapay_transaction_id   VARCHAR(100),
  created_at           TIMESTAMPTZ   DEFAULT NOW()
);

-- Index pour vérifier l'abonnement actif d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_user_packs_active
  ON public.user_pack_subscriptions(user_id, expires_at DESC)
  WHERE status = 'active';

-- RLS sur user_pack_subscriptions
ALTER TABLE public.user_pack_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own packs" ON public.user_pack_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ── 5. TABLE PROGRAMME D'AFFILIATION ────────────────────────────
CREATE TABLE IF NOT EXISTS public.affiliates (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID          REFERENCES public.users(id),
  name                 VARCHAR(100)  NOT NULL,
  email                VARCHAR(255)  UNIQUE NOT NULL,
  code                 VARCHAR(20)   UNIQUE NOT NULL,   -- ex: 'MAMADOU15'
  commission_rate      NUMERIC(4,2)  DEFAULT 0.20,      -- 20%
  payment_method       VARCHAR(30),
  total_clicks         INTEGER       DEFAULT 0,
  total_conversions    INTEGER       DEFAULT 0,
  total_earned_eur     NUMERIC(10,2) DEFAULT 0,
  is_active            BOOLEAN       DEFAULT true,
  created_at           TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id         UUID          NOT NULL REFERENCES public.affiliates(id),
  converted_user_id    UUID          NOT NULL REFERENCES public.users(id),
  amount_eur           NUMERIC(8,2)  NOT NULL,
  commission_eur       NUMERIC(8,2)  NOT NULL,
  paid_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ   DEFAULT NOW()
);

-- ── 6. TABLE PARCOURS D'APPRENTISSAGE ───────────────────────────
CREATE TABLE IF NOT EXISTS public.learning_plans (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exam_date            DATE,
  target_level         VARCHAR(5),   -- 'B2' | 'C1' | 'C2'
  current_level        VARCHAR(5),   -- issu du test diagnostique
  plan_duration_days   INTEGER       DEFAULT 30,
  daily_plan           JSONB         NOT NULL DEFAULT '[]',
  completed_days       INTEGER       DEFAULT 0,
  is_active            BOOLEAN       DEFAULT true,
  created_at           TIMESTAMPTZ   DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   DEFAULT NOW()
);

ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plans" ON public.learning_plans
  FOR ALL USING (auth.uid() = user_id);

-- ── 7. TABLE CONSENTEMENT COOKIES (RGPD) ────────────────────────
CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID          REFERENCES public.users(id),
  session_fingerprint  VARCHAR(64),  -- Pour les visiteurs non connectés
  analytics            BOOLEAN       DEFAULT false,
  marketing            BOOLEAN       DEFAULT false,
  decided_at           TIMESTAMPTZ   DEFAULT NOW(),
  ip_address           INET,
  user_agent           TEXT
);

-- ── 8. MISE À JOUR TABLE USERS ───────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS affiliate_code    VARCHAR(50),    -- code de l'affilié qui a référencé
  ADD COLUMN IF NOT EXISTS active_pack_id    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS pack_expires_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_phone    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS target_nclc       INTEGER,        -- niveau NCLC cible (4-12)
  ADD COLUMN IF NOT EXISTS exam_type_pref    VARCHAR(20);    -- 'TCF_CANADA' | 'TEF_CANADA'

-- ── 9. INDEX PERFORMANCES ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_questions_session_select
  ON public.questions(module, test_type, level, is_active, times_used)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_sessions_user_recent
  ON public.sessions(user_id, created_at DESC)
  WHERE status = 'completed';

-- ── 10. COMMENTAIRES ET DOCUMENTATION ────────────────────────────
COMMENT ON TABLE public.exam_packs IS
  'Packs à durée limitée (Bronze/Silver/Gold/Platinum). Alternative aux abonnements mensuels.';
COMMENT ON TABLE public.user_pack_subscriptions IS
  'Abonnements à durée limitée par pack. Décomptage des essais IA inclus.';
COMMENT ON TABLE public.affiliates IS
  'Programme d''affiliation pour influenceurs et partenaires (commission 20%).';
COMMENT ON TABLE public.learning_plans IS
  'Parcours d''apprentissage personnalisé 30/60/90 jours généré après le test diagnostique.';
