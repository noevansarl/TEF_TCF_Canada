-- ================================================================
-- Migration 004 — Ajout de la colonne metadata à la table users (Mai 2026)
-- Requis pour stocker les tokens FCM mobiles et métadonnées d'appareils
-- ================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

COMMENT ON COLUMN public.users.metadata IS
  'Métadonnées utilisateur au format JSON (ex: tokens FCM, préférences additionnelles, historique de connexion)';
