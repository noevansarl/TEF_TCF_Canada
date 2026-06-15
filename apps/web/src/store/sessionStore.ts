import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, Session, Module } from '../types/models'

interface SessionStore {
  // État courant
  currentSession: Session | null
  activeModule: Module | 'FULL_TCF' | 'FULL_TEF' | null
  questions: Question[]
  currentIndex: number
  answers: Record<string, string>      // questionId → réponse
  timeLeft: number                     // secondes restantes
  isRunning: boolean
  
  // Actions
  startSession: (session: Session, questions: Question[], duration: number) => void
  transitionSimulationStep: (nextModule: Module, nextQuestions: Question[], nextDuration: number) => void
  submitAnswer: (questionId: string, answer: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  goToQuestion: (index: number) => void
  tick: () => void
  endSession: () => void
  abandonSession: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      activeModule: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      timeLeft: 0,
      isRunning: false,

      startSession: (session, questions, duration) => set({
        currentSession: session,
        activeModule: session.module.startsWith('FULL_') ? 'CO' : session.module,
        questions,
        currentIndex: 0,
        answers: {},
        timeLeft: duration,
        isRunning: true
      }),

      transitionSimulationStep: (nextModule, nextQuestions, nextDuration) => set({
        activeModule: nextModule,
        questions: nextQuestions,
        currentIndex: 0,
        timeLeft: nextDuration,
        isRunning: true
      }),

      submitAnswer: (questionId, answer) => set(state => ({
        answers: { ...state.answers, [questionId]: answer }
      })),

      nextQuestion: () => set(state => ({
        currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1)
      })),

      prevQuestion: () => set(state => ({
        currentIndex: Math.max(state.currentIndex - 1, 0)
      })),

      goToQuestion: (index) => set({
        currentIndex: index
      }),

      tick: () => {
        const { timeLeft, endSession } = get()
        if (timeLeft <= 1) {
          endSession()
        } else {
          set(state => ({ timeLeft: state.timeLeft - 1 }))
        }
      },

      endSession: () => set({ isRunning: false }),
      abandonSession: () => set({ 
        currentSession: null, activeModule: null, questions: [], 
        currentIndex: 0, answers: {}, timeLeft: 0, isRunning: false 
      })
    }),
    {
      name: 'fa-session',
      partialize: (state) => ({
        currentSession: state.currentSession,
        activeModule: state.activeModule,
        answers: state.answers,
        currentIndex: state.currentIndex,
        timeLeft: state.timeLeft
      })
    }
  )
)

