-- ================================================================
-- Migration 007 — Espace Institutionnel & Centre de Langues (B2B)
-- ================================================================

-- 1. Table des Institutions (Centres de langues partenaires)
CREATE TABLE IF NOT EXISTS public.institutions (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(150)  NOT NULL,
  country              VARCHAR(100)  NOT NULL,
  max_students         INTEGER       DEFAULT 100 CHECK (max_students > 0),
  features             JSONB         DEFAULT '{"bulk_import": true, "live_classroom": true}'::jsonb,
  created_at           TIMESTAMPTZ   DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   DEFAULT NOW()
);

-- 2. Table de liaison Utilisateurs <-> Institutions
CREATE TABLE IF NOT EXISTS public.institution_students (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id       UUID          NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id              UUID          NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at            TIMESTAMPTZ   DEFAULT NOW()
);

-- 3. Table des Sessions de Classe Synchronisées (Examens Collectifs Live)
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id       UUID          NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  teacher_id           UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module               VARCHAR(20)   NOT NULL, -- 'CO' | 'CE' | 'SIMULATION'
  status               VARCHAR(20)   DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  total_students       INTEGER       DEFAULT 0,
  started_at           TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ   DEFAULT NOW()
);

-- 4. Activation de la Sécurité RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS

-- Institutions : Tout le monde peut voir s'il y est rattaché (ou les experts/admins)
CREATE POLICY "Select institution membership" ON public.institutions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.institution_students
      WHERE institution_students.institution_id = institutions.id 
      AND institution_students.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('expert', 'admin')
    )
  );

-- Institution Students : Les étudiants voient leur propre appartenance, les profs/admins voient tout
CREATE POLICY "Select students" ON public.institution_students
  FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('expert', 'admin')
    )
  );

CREATE POLICY "Manage student roster" ON public.institution_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('expert', 'admin')
    )
  );

-- Class Sessions : Les profs et élèves de la même école voient les sessions
CREATE POLICY "Select class sessions" ON public.class_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.institution_students
      WHERE institution_students.institution_id = class_sessions.institution_id
      AND institution_students.user_id = auth.uid()
    ) OR teacher_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Manage class sessions" ON public.class_sessions
  FOR ALL USING (
    teacher_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Index pour accélérer les jointures
CREATE INDEX IF NOT EXISTS idx_inst_students_inst ON public.institution_students(institution_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_inst ON public.class_sessions(institution_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_status ON public.class_sessions(status);
