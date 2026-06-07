-- ================================================================
-- Migration 010 — Enable Supabase Realtime for B2B Live Classroom
-- ================================================================

-- Add required tables to the supabase_realtime publication to enable WebSocket streaming
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.class_sessions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
