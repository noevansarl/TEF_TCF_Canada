-- ================================================================
-- Migration 011 — Policies RLS manquantes (Sécurité)
-- Tables activées RLS sans aucune policy = accès bloqué pour tous
-- ================================================================

-- ── badges (données publiques en lecture) ───────────────────────
DROP POLICY IF EXISTS "badges_public_read" ON public.badges;
CREATE POLICY "badges_public_read" ON public.badges
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "badges_admin_all" ON public.badges;
CREATE POLICY "badges_admin_all" ON public.badges
  FOR ALL USING (is_admin());

-- ── purchase_history ────────────────────────────────────────────
DROP POLICY IF EXISTS "purchases_own" ON public.purchase_history;
CREATE POLICY "purchases_own" ON public.purchase_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_admin" ON public.purchase_history;
CREATE POLICY "purchases_admin" ON public.purchase_history
  FOR ALL USING (is_admin());

-- ── offline_downloads ───────────────────────────────────────────
DROP POLICY IF EXISTS "offline_downloads_own" ON public.offline_downloads;
CREATE POLICY "offline_downloads_own" ON public.offline_downloads
  FOR ALL USING (auth.uid() = user_id);

-- ── exam_packs (catalogue public en lecture) ─────────────────────
ALTER TABLE public.exam_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exam_packs_public_read" ON public.exam_packs;
CREATE POLICY "exam_packs_public_read" ON public.exam_packs
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "exam_packs_admin_all" ON public.exam_packs;
CREATE POLICY "exam_packs_admin_all" ON public.exam_packs
  FOR ALL USING (is_admin());

-- ── cookie_consents ─────────────────────────────────────────────
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cookie_consents_own" ON public.cookie_consents;
CREATE POLICY "cookie_consents_own" ON public.cookie_consents
  FOR ALL USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- ── affiliate_conversions (protéger les données financières) ────
DROP POLICY IF EXISTS "conversions_admin" ON public.affiliate_conversions;
CREATE POLICY "conversions_admin" ON public.affiliate_conversions
  FOR ALL USING (is_admin());
