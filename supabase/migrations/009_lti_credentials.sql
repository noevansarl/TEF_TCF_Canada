-- Migration 009 — LMS / LTI Credentials for Institutions

-- 1. Ajouter les colonnes de configuration LTI à la table public.institutions
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS lti_consumer_key VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS lti_shared_secret VARCHAR(100),
  ADD COLUMN IF NOT EXISTS lti_enabled BOOLEAN DEFAULT false;

-- 2. Créer un index sur la clé de consommation pour accélérer la résolution d'intégration LTI
CREATE INDEX IF NOT EXISTS idx_institutions_lti_key ON public.institutions(lti_consumer_key) WHERE lti_consumer_key IS NOT NULL;

-- 3. Politique RLS pour permettre aux enseignants/admins de modifier les informations de l'établissement
-- Note : L'ancien plan autorisait uniquement SELECT. Nous ajoutons UPDATE pour les enseignants
DROP POLICY IF EXISTS "Update institution details" ON public.institutions;
CREATE POLICY "Update institution details" ON public.institutions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.institution_students
      WHERE institution_students.institution_id = institutions.id 
      AND institution_students.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('expert', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.institution_students
      WHERE institution_students.institution_id = institutions.id 
      AND institution_students.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('expert', 'admin')
    )
  );
