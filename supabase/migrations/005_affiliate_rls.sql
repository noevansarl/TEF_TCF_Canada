-- ================================================================
-- Migration 005 — Sécurisation RLS pour l'Affiliation (Mai 2026)
-- ================================================================

-- Activer RLS sur les tables d'affiliation si ce n'est pas déjà fait
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- ── 1. POLITIQUES POUR LA TABLE public.affiliates ─────────────────
DROP POLICY IF EXISTS "Users see own affiliate account" ON public.affiliates;
CREATE POLICY "Users see own affiliate account"
  ON public.affiliates
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own affiliate account" ON public.affiliates;
CREATE POLICY "Users can create their own affiliate account"
  ON public.affiliates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own affiliate account details" ON public.affiliates;
CREATE POLICY "Users can update their own affiliate account details"
  ON public.affiliates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 2. POLITIQUES POUR LA TABLE public.affiliate_clicks ────────────
DROP POLICY IF EXISTS "Affiliates see clicks of their campaigns" ON public.affiliate_clicks;
CREATE POLICY "Affiliates see clicks of their campaigns"
  ON public.affiliate_clicks
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

-- ── 3. POLITIQUES POUR LA TABLE public.affiliate_conversions ───────
DROP POLICY IF EXISTS "Affiliates see conversions of their campaigns" ON public.affiliate_conversions;
CREATE POLICY "Affiliates see conversions of their campaigns"
  ON public.affiliate_conversions
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );
