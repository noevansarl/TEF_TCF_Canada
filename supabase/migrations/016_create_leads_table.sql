-- Migration 016: Table pour collecter les prospects (Lead Magnets / Simulateurs)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    target_exam TEXT DEFAULT 'TCF_CANADA',
    target_nclc TEXT DEFAULT 'NCLC 9',
    source TEXT DEFAULT 'lead_magnet_modal',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide par email et date
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Sécurité RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Permettre l'insertion publique anonyme (pour les visiteurs téléchargeant le guide sans compte)
CREATE POLICY "Public anonymous insert on leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permettre la lecture uniquement aux administrateurs
CREATE POLICY "Admins can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);
