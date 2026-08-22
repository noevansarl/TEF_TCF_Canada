-- ================================================================
-- Migration 015 — Alter Users Subscription Tier Check
-- Permet aux utilisateurs d'avoir les tiers correspondants aux packs payants
-- ('bronze', 'silver', 'gold', 'platinum') en plus des abonnements standards.
-- ================================================================

-- 1. Supprimer l'ancienne contrainte de validation
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

-- 2. Recréer la contrainte en incluant les nouveaux tiers
ALTER TABLE public.users 
  ADD CONSTRAINT users_subscription_tier_check 
  CHECK (subscription_tier IN ('gratuit', 'essentiel', 'avance', 'premium', 'institutionnel', 'bronze', 'silver', 'gold', 'platinum'));

COMMENT ON CONSTRAINT users_subscription_tier_check ON public.users IS
  'Valide les types d''abonnements et de packs disponibles pour les utilisateurs.';
