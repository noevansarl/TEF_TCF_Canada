import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  user: { id: string; email: string } | null
  role: 'user' | 'expert' | 'admin'
  initialized: boolean
  setUser: (user: { id: string; email: string } | null, role?: 'user' | 'expert' | 'admin') => void
  setInitialized: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: 'user',
      initialized: false,
      setUser: (user, role = 'user') => set({ user, role }),
      setInitialized: () => set({ initialized: true }),
    }),
    {
      name: 'fa-auth',
      // Ne jamais persister le rôle ni initialized : re-fetchés depuis le serveur à chaque session
      partialize: (state) => ({ user: state.user }),
    }
  )
)

