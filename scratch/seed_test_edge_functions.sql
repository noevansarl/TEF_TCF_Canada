-- ========================================================
-- FRANCOPHONIE ACADEMIA — Données de test pour fonctions Edge
-- Cible: public.users, public.questions, public.sessions, public.answers
-- ========================================================

-- ID de l'utilisateur de test local
-- Remarque : Si vous créez l'utilisateur depuis l'interface d'authentification (ex: http://localhost:5173),
-- remplacez cette valeur par son véritable UUID.
DO $$
DECLARE
    v_user_id UUID := 'c0a80101-0000-0000-0000-000000000001';
    v_session_id UUID := 'b0a80101-0000-0000-0000-000000000001';
    v_question_ee_id UUID := 'd0a80101-0000-0000-0000-000000000001';
    v_question_eo_id UUID := 'd0a80101-0000-0000-0000-000000000002';
    v_answer_ee_id UUID := 'a0a80101-0000-0000-0000-000000000001';
    v_answer_eo_id UUID := 'a0a80101-0000-0000-0000-000000000002';
BEGIN
    -- 1. Insérer l'utilisateur dans auth.users si non présent
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
    ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        'test_candidat@francophonie.academia',
        -- Hash pour 'password123'
        '$2a$10$R9h/l5jDWS2f7MecHk4xqukPZ24eY2lT8LCOtH6H77W1U.X9f1K1C',
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Jean Testeur"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Créer ou mettre à jour le profil de l'utilisateur
    INSERT INTO public.users (
        id, email, full_name, country, subscription_tier, subscription_expires_at, xp_points
    ) VALUES (
        v_user_id,
        'test_candidat@francophonie.academia',
        'Jean Testeur',
        'France',
        'avance',
        NOW() + INTERVAL '1 year',
        150
    ) ON CONFLICT (id) DO UPDATE 
    SET 
        subscription_tier = 'avance',
        subscription_expires_at = NOW() + INTERVAL '1 year';

    -- 3. Insérer un sujet d'Expression Écrite (EE)
    INSERT INTO public.questions (
        id, module, test_type, level, question_text, explanation, theme, difficulty_score, is_active
    ) VALUES (
        v_question_ee_id,
        'EE',
        'TEF_CANADA',
        'B2',
        'Sujet : Pour ou contre le télétravail obligatoire ? Rédigez un texte argumentatif d''au moins 150 mots.',
        'Sujet classique d''évaluation TEF Canada pour valider la structure argumentative et l''usage de connecteurs logiques.',
        'Travail & Société',
        6.00,
        true
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Insérer un sujet d'Expression Orale (EO)
    INSERT INTO public.questions (
        id, module, test_type, level, question_text, explanation, theme, difficulty_score, is_active
    ) VALUES (
        v_question_eo_id,
        'EO',
        'TEF_CANADA',
        'B2',
        'Sujet Section B : Votre ami hésite à faire du bénévolat dans une association. Présentez-lui les avantages et convainquez-le de s''inscrire avec vous.',
        'Sujet d''interaction persuasive évaluant le registre informel, la spontanéité et la variété des arguments.',
        'Bénévolat & Engagement',
        7.00,
        true
    ) ON CONFLICT (id) DO NOTHING;

    -- 5. Créer la session d'entraînement
    INSERT INTO public.sessions (
        id, user_id, session_type, module, test_type, level, max_duration_s, status
    ) VALUES (
        v_session_id,
        v_user_id,
        'TRAINING',
        'EE',
        'TEF_CANADA',
        'B2',
        3600,
        'in_progress'
    ) ON CONFLICT (id) DO NOTHING;

    -- 6. Créer la réponse de test pour l'Expression Écrite (correct-ee)
    INSERT INTO public.answers (
        id, session_id, question_id, user_id, user_answer
    ) VALUES (
        v_answer_ee_id,
        v_session_id,
        v_question_ee_id,
        v_user_id,
        'Texte initial de test en attente de correction.'
    ) ON CONFLICT (id) DO NOTHING;

    -- 7. Créer la réponse de test pour l'Expression Orale (transcribe-eo)
    INSERT INTO public.answers (
        id, session_id, question_id, user_id, audio_storage_path
    ) VALUES (
        v_answer_eo_id,
        v_session_id,
        v_question_eo_id,
        v_user_id,
        'test-recording.webm'
    ) ON CONFLICT (id) DO NOTHING;

END $$;
