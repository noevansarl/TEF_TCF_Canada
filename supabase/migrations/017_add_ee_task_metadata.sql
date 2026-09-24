-- ================================================================
-- Migration 017 — Métadonnées de tâche pour l'expression écrite (EE)
-- Le frontend (SessionPage.tsx) envoie task_type et target_words au
-- correcteur IA (correct-ee), mais ces champs n'existaient que dans
-- les données mock, jamais dans la table réelle : toute vraie question
-- EE était donc systématiquement corrigée comme un "essai" générique
-- de 150-250 mots, quel que soit le format réel du sujet.
-- ================================================================

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS task_type TEXT,
  ADD COLUMN IF NOT EXISTS target_words JSONB;

ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS questions_task_type_check;

ALTER TABLE public.questions
  ADD CONSTRAINT questions_task_type_check
  CHECK (
    task_type IS NULL
    OR module <> 'EE'
    OR task_type IN ('message_informel', 'texte_argumentatif', 'lettre_formelle', 'essai')
  );

COMMENT ON COLUMN public.questions.task_type IS
  'Format de la tâche EE (message_informel/texte_argumentatif/lettre_formelle/essai), doit correspondre à VALID_TASK_TYPES dans supabase/functions/correct-ee/index.ts.';

COMMENT ON COLUMN public.questions.target_words IS
  'Fourchette de mots attendue pour une tâche EE, format {"min": X, "max": Y}. Utilisé par correct-ee pour évaluer le critère respect_tache.';
