-- ================================================================
-- Migration 013 — Fix suppression cascade auth.users → public.users
-- Évite les profils orphelins dans public.users quand un auth user est supprimé
-- ================================================================

-- Trigger de suppression : quand auth.users supprimé → supprimer public.users
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deleted();
