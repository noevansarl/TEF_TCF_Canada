-- ================================================================
-- Migration 008 — RLS Policies for Expert Corrections
-- ================================================================

-- Permettre aux experts et administrateurs d'effectuer toutes les opérations
-- sur la table expert_corrections (lecture de la file d'attente, attribution, évaluation).
DROP POLICY IF EXISTS "corrections_expert_manage_all" ON public.expert_corrections;
CREATE POLICY "corrections_expert_manage_all" ON public.expert_corrections
  FOR ALL
  USING (is_expert_or_admin());
