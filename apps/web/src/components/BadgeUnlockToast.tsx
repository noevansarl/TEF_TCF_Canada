import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '../store/notificationStore'

export function BadgeUnlockToast() {
  const { unlockedBadge, clearBadgeUnlock } = useNotificationStore()

  useEffect(() => {
    if (!unlockedBadge) return

    const timer = setTimeout(() => {
      clearBadgeUnlock()
    }, 5000)
    return () => clearTimeout(timer)
  }, [unlockedBadge, clearBadgeUnlock])

  return (
    <AnimatePresence>
      {unlockedBadge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 40, x: '-50%' }}
          animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-1/2 z-50
                     bg-[#1B3A6B] text-white rounded-2xl shadow-2xl
                     px-6 py-4 flex items-center gap-4 min-w-80 border border-white/10"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl"
          >
            🏅
          </motion.div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#C55A11] mb-0.5">
              Badge débloqué !
            </p>
            <p className="font-bold text-lg leading-tight text-white">{unlockedBadge.name}</p>
            <p className="text-sm text-gray-300">{unlockedBadge.description}</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="ml-auto bg-[#C55A11] text-white rounded-full
                       px-3 py-1.5 text-xs font-extrabold whitespace-nowrap shadow-sm"
          >
            +{unlockedBadge.xp_reward} XP
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default BadgeUnlockToast
