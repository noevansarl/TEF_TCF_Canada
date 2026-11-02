// Colonnes de public.questions lisibles par les comptes clients (migration 025).
// Le corrigé (correct_answer, explanation, model_answer, correction_grid) n'est
// jamais chargé pendant une session : il est servi après la fin de la session
// par la fonction get_session_review(), ou par submit_diagnostic().
// ⚠ select('*') sur questions est refusé par la base pour un client.
export const QUESTION_PUBLIC_COLUMNS =
  'id, module, test_type, level, question_text, audio_url, audio_duration_s, max_listens, ' +
  'passage_text, options, theme, sub_theme, difficulty_score, is_active, is_premium, ' +
  'is_topical, topical_badge, task_type, target_words'
