-- ================================================================
-- Migration 019 — RPC pour le test diagnostique gratuit
-- Le test diagnostique (évaluation initiale de niveau) est un outil
-- d'acquisition gratuit, accessible avant tout abonnement. Il doit
-- donc pouvoir piocher de vraies questions CO/CE réelles même si
-- elles sont marquées is_premium=true, sans que la RLS standard ne
-- les bloque pour un compte gratuit ou anonyme.
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_diagnostic_questions(
  p_module TEXT,
  p_test_type TEXT,
  p_limit INT
)
RETURNS TABLE (
  id UUID,
  module TEXT,
  level TEXT,
  question_text TEXT,
  audio_url TEXT,
  passage_text TEXT,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, module, level, question_text, audio_url, passage_text, options, correct_answer, explanation
  FROM public.questions
  WHERE module = p_module
    AND test_type = p_test_type
    AND level IN ('B1', 'B2', 'C1')
    AND is_active = true
    AND correct_answer IS NOT NULL
  ORDER BY random()
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_diagnostic_questions(TEXT, TEXT, INT) TO anon, authenticated;

COMMENT ON FUNCTION public.get_diagnostic_questions IS
  'Questions reelles pour le test diagnostique gratuit (evaluation initiale), accessible sans abonnement.';
