import { useSessionTimer } from '../hooks/useSessionTimer'
import { cn } from '../lib/utils'

interface TimerProps {
  label?: string
  className?: string
}

export function Timer({ label, className }: TimerProps) {
  const { formattedTime, isWarning, isCritical } = useSessionTimer()

  return (
    <div className={cn(
      'flex flex-col items-center font-mono font-bold tabular-nums',
      className
    )}>
      {label && <span className="text-xs text-gray-500 mb-1">{label}</span>}
      <span className={cn(
        'text-2xl transition-colors duration-300',
        isWarning && !isCritical && 'text-orange-600',
        isCritical && 'text-red-600 animate-pulse'
      )}>
        {formattedTime}
      </span>
    </div>
  )
}
