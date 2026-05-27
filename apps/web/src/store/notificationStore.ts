import { create } from 'zustand'
import type { Badge } from '../lib/badges'

interface NotificationStore {
  unlockedBadge: Badge | null
  triggerBadgeUnlock: (badge: Badge) => void
  clearBadgeUnlock: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unlockedBadge: null,
  triggerBadgeUnlock: (badge) => set({ unlockedBadge: badge }),
  clearBadgeUnlock: () => set({ unlockedBadge: null })
}))
