export type Module = 'CO' | 'CE' | 'EE' | 'EO'
export type TestType = 'TCF_CANADA' | 'TEF_CANADA'
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type SessionType = 'TRAINING' | 'SIMULATION' | 'DIAGNOSTIC'
export type SubscriptionTier = 'gratuit' | 'essentiel' | 'avance' | 'premium' | 'institutionnel'

export interface CorrectionCriterion {
  max_score: number
  description?: string
}

export interface CorrectionGrid {
  respect_tache?: CorrectionCriterion
  coherence?: CorrectionCriterion
  lexique?: CorrectionCriterion
  morphosyntaxe?: CorrectionCriterion
  conventions?: CorrectionCriterion
}

export interface Question {
  id: string
  module: Module
  test_type: TestType | 'BOTH'
  level: Level
  question_text: string
  audio_url?: string
  passage_text?: string
  options?: Record<string, string>    // { A: '...', B: '...', C: '...', D: '...' }
  correct_answer?: string
  model_answer?: string
  explanation: string
  theme: string
  difficulty_score: number
  max_listens?: number
  task_type?: string
  target_words?: { min: number; max: number }
  audio_duration_s?: number
  correction_grid?: CorrectionGrid
}

export interface Session {
  id: string
  user_id: string
  session_type: SessionType
  module: Module | 'FULL_TCF' | 'FULL_TEF'
  test_type?: TestType
  started_at: string
  completed_at?: string
  duration_seconds?: number
  score_auto?: number
  nclc_estimate?: string
  status: 'in_progress' | 'completed' | 'abandoned'
}

export interface FeedbackCriterion {
  score: number
  commentaire: string
}

export interface AutoFeedback {
  criteres: {
    respect_tache:  FeedbackCriterion
    coherence:      FeedbackCriterion
    lexique:        FeedbackCriterion
    morphosyntaxe:  FeedbackCriterion
    conventions:    FeedbackCriterion
  }
  score_global: number
  suggestions: string[]
  points_forts: string[]
  resume: string
  nclc_estime: string
}
