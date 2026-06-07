import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  user: { id: string; email: string } | null
  role: 'user' | 'expert' | 'admin'
  setUser: (user: { id: string; email: string } | null, role?: 'user' | 'expert' | 'admin') => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: 'user',
      setUser: (user, role = 'user') => set({ user, role })
    }),
    {
      name: 'fa-auth',
      // Ne jamais persister le rôle : il est re-fetché depuis le serveur à chaque session
      partialize: (state) => ({ user: state.user }),
    }
  )
)

