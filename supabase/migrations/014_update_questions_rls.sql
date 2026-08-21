-- ================================================================
-- Migration 014 — Update Questions RLS for FedaPay and Stripe Tiers
-- Permet aux utilisateurs ayant souscrit un pack FedaPay ou un plan Stripe
-- d'accéder correctement aux questions premium (is_premium = true).
-- ================================================================

-- Supprimer la politique existante
DROP POLICY IF EXISTS "questions_read_active" ON public.questions;

-- Créer la politique mise à jour
CREATE POLICY "questions_read_active" ON public.questions FOR SELECT USING (
  is_active = true AND (
    is_premium = false OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND (
          subscription_tier IN ('avance', 'premium', 'institutionnel', 'essentiel', 'bronze', 'silver', 'gold', 'platinum')
          OR active_pack_id IN ('bronze', 'silver', 'gold', 'platinum')
        )
        AND (
          subscription_expires_at IS NULL 
          OR subscription_expires_at > now() 
          OR pack_expires_at > now()
        )
    ) OR
    is_admin()
  )
);

COMMENT ON POLICY "questions_read_active" ON public.questions IS
  'Autorise la lecture des questions premium uniquement pour les abonnés actifs et les packs payants FedaPay/Stripe.';
