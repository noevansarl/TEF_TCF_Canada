-- ================================================================
-- Migration 006 — Contrainte de validation du nombre de questions
-- ================================================================

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS check_question_count;

ALTER TABLE public.sessions ADD CONSTRAINT check_question_count 
  CHECK (
    total_questions IS NULL OR
    (module = 'CO' AND test_type = 'TCF_CANADA' AND total_questions = 39) OR
    (module = 'CE' AND test_type = 'TCF_CANADA' AND total_questions = 39) OR
    (module = 'EO' AND test_type = 'TCF_CANADA' AND total_questions = 3) OR
    (module = 'EE' AND test_type = 'TCF_CANADA' AND total_questions = 3) OR
    (module = 'CO' AND test_type = 'TEF_CANADA' AND total_questions = 60) OR
    (module = 'CE' AND test_type = 'TEF_CANADA' AND total_questions = 50) OR
    (module = 'EO' AND test_type = 'TEF_CANADA' AND total_questions = 4) OR
    (module = 'EE' AND test_type = 'TEF_CANADA' AND total_questions = 2)
  );
