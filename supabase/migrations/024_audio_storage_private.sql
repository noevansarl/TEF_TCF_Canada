-- ================================================================
-- Migration 024 — Bucket audio-responses privé (audit M9)
--   Les enregistrements EO sont des données personnelles (voix).
--   Avant : bucket créé à la main, lecture via URL publique.
--   Après : bucket privé, lecture uniquement via URL signée, accès limité :
--     - écriture : l'élève, dans eo/<session_id>/ d'une de SES sessions en cours
--     - lecture  : l'élève (ses sessions), l'expert chargé de la correction,
--                  l'admin
--   Les Edge Functions (service_role) ne sont pas concernées par ces règles.
-- Migration idempotente.
-- ================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-responses', 'audio-responses', false,
  26214400,  -- 25 Mo (limite de l'API Whisper)
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/aac']
)
ON CONFLICT (id) DO UPDATE
  SET public             = false,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Supprime les règles existantes sur ce bucket (créées depuis le tableau de bord,
-- noms inconnus, potentiellement trop permissives).
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT policyname
      FROM pg_policies
     WHERE schemaname = 'storage'
       AND tablename  = 'objects'
       AND (COALESCE(qual, '') || COALESCE(with_check, '')) LIKE '%audio-responses%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END
$$;

-- Écriture : eo/<session_id>/<fichier>, session de l'utilisateur, encore en cours
CREATE POLICY "audio_responses_insert_own_session" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'audio-responses'
    AND (storage.foldername(name))[1] = 'eo'
    AND EXISTS (
      SELECT 1 FROM public.sessions s
       WHERE s.id::TEXT = (storage.foldername(name))[2]
         AND s.user_id = auth.uid()
         AND s.status = 'in_progress'
    )
  );

-- Lecture (nécessaire pour créer une URL signée)
CREATE POLICY "audio_responses_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'audio-responses'
    AND (
      public.is_admin()
      -- l'élève : fichiers de ses propres sessions
      OR EXISTS (
        SELECT 1 FROM public.sessions s
         WHERE s.id::TEXT = (storage.foldername(name))[2]
           AND s.user_id = auth.uid()
      )
      -- l'expert : fichier d'une réponse en file d'attente ou qui lui est assignée
      OR EXISTS (
        SELECT 1
          FROM public.answers a
          JOIN public.expert_corrections ec ON ec.answer_id = a.id
         WHERE a.audio_storage_path = storage.objects.name
           AND (ec.expert_id = auth.uid() OR (ec.status = 'pending' AND public.is_expert_or_admin()))
      )
    )
  );

-- Pas de règle UPDATE / DELETE : un enregistrement envoyé n'est plus modifiable
-- par le client (suppression RGPD gérée par l'Edge Function delete-account).
