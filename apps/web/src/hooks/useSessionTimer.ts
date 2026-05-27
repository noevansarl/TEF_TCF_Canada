import { useEffect, useRef } from 'react'
import { useSessionStore } from '../store/sessionStore'

export function useSessionTimer() {
  const { isRunning, tick, timeLeft } = useSessionStore()
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000) as unknown as number
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, tick])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const isWarning = timeLeft <= 300  // rouge < 5 min
  const isCritical = timeLeft <= 60  // rouge clignotant < 1 min

  return { timeLeft, formattedTime, isWarning, isCritical }
}
