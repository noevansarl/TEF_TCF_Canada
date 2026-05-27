export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          country: string
          phone: string | null
          level_assessed: string | null
          target_test: string | null
          exam_date: string | null
          role: string
          subscription_tier: string
          subscription_expires_at: string | null
          stripe_customer_id: string | null
          revenuecat_app_user_id: string | null
          xp_points: number
          streak_days: number
          longest_streak: number
          last_activity_at: string | null
          notifications_enabled: boolean
          daily_reminder_hour: number
          offline_mode_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      questions: {
        Row: {
          id: string
          module: 'CO' | 'CE' | 'EE' | 'EO'
          test_type: 'TCF_CANADA' | 'TEF_CANADA' | 'BOTH'
          level: 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          question_text: string
          audio_url: string | null
          passage_text: string | null
          options: Record<string, string> | null
          correct_answer: string | null
          explanation: string
          theme: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          session_type: 'TRAINING' | 'SIMULATION' | 'DIAGNOSTIC'
          module: string
          test_type: string | null
          started_at: string
          completed_at: string | null
          duration_seconds: number | null
          score_auto: number | null
          nclc_estimate: string | null
          status: string
        }
      }
      answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          user_id: string
          user_answer: string | null
          is_correct: boolean | null
          auto_feedback: any | null
        }
      }
    }
  }
}
