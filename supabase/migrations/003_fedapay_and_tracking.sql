-- ================================================================
-- Migration 003 — FedaPay + Tracking affilié (Mai 2026)
-- ================================================================

-- ── 1. TABLE TENTATIVES DE PAIEMENT ─────────────────────────────────
-- Créée avant l'activation du pack (pending → completed / declined / canceled)
CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pack_id                   VARCHAR(20)   NOT NULL REFERENCES public.exam_packs(id),
  amount_xof                INTEGER       NOT NULL,
  method                    VARCHAR(50)   NOT NULL,   -- 'orange_money_sn', 'mtn_open', 'wave_money'…
  phone_number              VARCHAR(30),
  phone_country             VARCHAR(5),               -- 'SN', 'CI', 'CM'…
  fedapay_transaction_id    VARCHAR(100),
  stripe_payment_intent_id  VARCHAR(100),
  status                    VARCHAR(20)   DEFAULT 'pending',  -- 'pending' | 'completed' | 'declined' | 'canceled'
  created_at                TIMESTAMPTZ   DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   DEFAULT NOW()
);

-- Index pour retrouver les tentatives d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_payment_attempts_user
  ON public.payment_attempts(user_id, created_at DESC);

-- Index pour les webhooks (lookup par transaction_id)
CREATE INDEX IF NOT EXISTS idx_payment_attempts_fedapay
  ON public.payment_attempts(fedapay_transaction_id)
  WHERE fedapay_transaction_id IS NOT NULL;

-- RLS : utilisateur voit ses propres tentatives
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own payment attempts" ON public.payment_attempts;
CREATE POLICY "Users see own payment attempts" ON public.payment_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- ── 2. TABLE CLICS AFFILIÉS (tracking URL ?ref=CODE) ────────────────
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id      UUID        REFERENCES public.affiliates(id),
  affiliate_code    VARCHAR(20) NOT NULL,
  page_url          TEXT,
  referrer_url      TEXT,
  ip_address        INET,
  user_agent        TEXT,
  converted         BOOLEAN     DEFAULT false,       -- true si inscription suivie
  converted_user_id UUID        REFERENCES public.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code
  ON public.affiliate_clicks(affiliate_code, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_unconverted
  ON public.affiliate_clicks(affiliate_code, converted)
  WHERE converted = false;

-- ── 3. ENREGISTREMENT DES CLICS AFFILIÉS (fonction SQL) ──────────────
-- Appelée par l'Edge Function track-affiliate
CREATE OR REPLACE FUNCTION public.track_affiliate_click(
  p_code        VARCHAR,
  p_page_url    TEXT DEFAULT NULL,
  p_referrer    TEXT DEFAULT NULL,
  p_ip          INET DEFAULT NULL,
  p_user_agent  TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_affiliate_id UUID;
  v_click_id     UUID;
BEGIN
  -- Récupérer l'ID de l'affilié
  SELECT id INTO v_affiliate_id
    FROM public.affiliates
   WHERE code = p_code AND is_active = true;

  -- Incrementer le compteur de clics (même si l'affilié n'existe pas)
  IF v_affiliate_id IS NOT NULL THEN
    UPDATE public.affiliates
       SET total_clicks = total_clicks + 1
     WHERE id = v_affiliate_id;
  END IF;

  -- Enregistrer le clic
  INSERT INTO public.affiliate_clicks
    (affiliate_id, affiliate_code, page_url, referrer_url, ip_address, user_agent)
  VALUES
    (v_affiliate_id, p_code, p_page_url, p_referrer, p_ip, p_user_agent)
  RETURNING id INTO v_click_id;

  RETURN v_click_id;
END;
$$;

-- ── 4. FONCTION : convertir un clic affilié en inscription ────────────
CREATE OR REPLACE FUNCTION public.convert_affiliate_click(
  p_click_id    UUID,
  p_user_id     UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_affiliate_id UUID;
  v_code         VARCHAR;
BEGIN
  -- Marquer le clic comme converti
  UPDATE public.affiliate_clicks
     SET converted = true,
         converted_user_id = p_user_id
   WHERE id = p_click_id
     AND converted = false
  RETURNING affiliate_id, affiliate_code INTO v_affiliate_id, v_code;

  IF NOT FOUND THEN RETURN; END IF;

  -- Mettre à jour le profil utilisateur avec le code affilié
  UPDATE public.users
     SET affiliate_code = v_code
   WHERE id = p_user_id AND affiliate_code IS NULL;

  -- Incrémenter le compteur de conversions
  IF v_affiliate_id IS NOT NULL THEN
    UPDATE public.affiliates
       SET total_conversions = total_conversions + 1
     WHERE id = v_affiliate_id;
  END IF;
END;
$$;

-- ── 5. TRIGGER updated_at pour payment_attempts ─────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_attempts_updated_at ON public.payment_attempts;
CREATE TRIGGER trg_payment_attempts_updated_at
  BEFORE UPDATE ON public.payment_attempts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 6. VUE : tableau de bord affilié ────────────────────────────────
CREATE OR REPLACE VIEW public.affiliate_dashboard AS
SELECT
  a.id,
  a.name,
  a.code,
  a.commission_rate,
  a.total_clicks,
  a.total_conversions,
  a.total_earned_eur,
  a.payment_method,
  ROUND(
    CASE WHEN a.total_clicks > 0
    THEN a.total_conversions::NUMERIC / a.total_clicks * 100
    ELSE 0 END, 2
  ) AS conversion_rate_pct,
  a.is_active,
  a.created_at
FROM public.affiliates a;

COMMENT ON TABLE public.payment_attempts IS
  'Tentatives de paiement (Stripe ou FedaPay) avant activation du pack. Idempotence webhook.';
COMMENT ON TABLE public.affiliate_clicks IS
  'Clics sur liens affiliés (?ref=CODE). Tracking pour programme de commissions.';
