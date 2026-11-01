-- ================================================================
-- Migration 023 — Correctifs de sécurité Priorité 2 / hygiène (audit_securite.md)
--   RGPD : suppression de compte sans blocage par clé étrangère
--   M8   : table leads — validation et anti-spam des insertions anonymes
-- Migration idempotente.
-- ================================================================


-- ── RGPD — Clés étrangères vers users / answers ───────────────────────
-- Recrée une FK (table.colonne → cible) avec la règle ON DELETE voulue,
-- quel que soit le nom de la contrainte existante.
CREATE OR REPLACE FUNCTION pg_temp.reset_fk(
  p_table TEXT, p_column TEXT, p_target TEXT, p_on_delete TEXT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_name TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_schema = 'public' AND table_name = p_table AND column_name = p_column) THEN
    RETURN;
  END IF;

  FOR v_name IN
    SELECT c.conname
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
     WHERE c.contype = 'f'
       AND c.conrelid = format('public.%I', p_table)::regclass
       AND a.attname = p_column
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', p_table, v_name);
  END LOOP;

  EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %s ON DELETE %s',
                 p_table, p_table || '_' || p_column || '_fkey', p_column, p_target, p_on_delete);
END;
$$;

SELECT pg_temp.reset_fk('expert_corrections', 'answer_id', 'public.answers(id)', 'CASCADE');
SELECT pg_temp.reset_fk('expert_corrections', 'user_id',   'public.users(id)',   'CASCADE');
SELECT pg_temp.reset_fk('expert_corrections', 'expert_id', 'public.users(id)',   'SET NULL');
SELECT pg_temp.reset_fk('affiliates',         'user_id',   'public.users(id)',   'SET NULL');
SELECT pg_temp.reset_fk('cookie_consents',    'user_id',   'public.users(id)',   'CASCADE');
SELECT pg_temp.reset_fk('affiliate_clicks',   'converted_user_id', 'public.users(id)', 'SET NULL');
SELECT pg_temp.reset_fk('questions',          'created_by', 'public.users(id)',  'SET NULL');


-- ── M8 — Leads ────────────────────────────────────────────────────────
-- Contraintes NOT VALID : appliquées aux nouvelles lignes sans rejeter
-- d'éventuelles lignes historiques.
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_email_format;
ALTER TABLE public.leads ADD CONSTRAINT leads_email_format
  CHECK (char_length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') NOT VALID;

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_fields_length;
ALTER TABLE public.leads ADD CONSTRAINT leads_fields_length
  CHECK (char_length(COALESCE(target_exam, '')) <= 30
     AND char_length(COALESCE(target_nclc, '')) <= 30
     AND char_length(COALESCE(source, '')) <= 60) NOT VALID;

-- Une même adresse ne peut être enregistrée qu'une fois par 24 h ; les
-- insertions anonymes sont plafonnées globalement à 200 par heure.
CREATE OR REPLACE FUNCTION public.throttle_leads()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  NEW.created_at := now();

  IF EXISTS (SELECT 1 FROM public.leads
              WHERE email = NEW.email AND created_at > now() - INTERVAL '24 hours') THEN
    RETURN NULL;  -- doublon récent : ignoré silencieusement
  END IF;

  IF (SELECT count(*) FROM public.leads WHERE created_at > now() - INTERVAL '1 hour') >= 200 THEN
    RAISE EXCEPTION 'Trop de demandes, réessayez plus tard' USING ERRCODE = '54000';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_throttle ON public.leads;
CREATE TRIGGER trg_leads_throttle
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.throttle_leads();
