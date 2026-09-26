-- ================================================================
-- Migration 018 — RPC de prévisualisation des thèmes (catalogue)
-- Le catalogue mobile doit pouvoir afficher les vrais thèmes et le
-- nombre de questions par thème, y compris pour du contenu premium,
-- sans exposer le contenu réel (texte, options, audio) aux comptes
-- non abonnés. La RLS sur "questions" bloque ces lignes entièrement
-- pour un compte gratuit, donc on expose une fonction SECURITY
-- DEFINER qui ne renvoie que l'agrégat theme/count.
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_theme_previews(
  p_module TEXT,
  p_test_type TEXT,
  p_level TEXT
)
RETURNS TABLE (theme TEXT, question_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT theme, count(*) AS question_count
  FROM public.questions
  WHERE module = p_module
    AND test_type = p_test_type
    AND level = p_level
    AND is_active = true
    AND theme IS NOT NULL
  GROUP BY theme
  ORDER BY question_count DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_theme_previews(TEXT, TEXT, TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.get_theme_previews IS
  'Aperçu agrégé (thème + nombre de questions) pour le catalogue mobile, y compris le contenu premium, sans exposer le contenu réel aux comptes non abonnés.';
