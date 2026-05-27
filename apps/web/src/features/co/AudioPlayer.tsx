import { useState, useRef, useEffect } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { cn } from '../../lib/utils'

interface AudioPlayerProps {
  audioUrl: string
  maxListens: number
  onListensExceeded?: () => void
  isSimulation?: boolean
}

export function AudioPlayer({ audioUrl, maxListens, onListensExceeded, isSimulation = false }: AudioPlayerProps) {
  const [listens, setListens] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const waveRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    if (!waveRef.current) return

    wsRef.current = WaveSurfer.create({
      container: waveRef.current,
      waveColor: '#94a3b8',
      progressColor: '#1B3A6B',
      cursorColor: '#C55A11',
      height: 56,
      barWidth: 3,
      barRadius: 2,
      barGap: 2,
      interact: !isSimulation,
    })

    wsRef.current.load(audioUrl)
    wsRef.current.on('ready', () => {
      setIsLoading(false)
      if (isSimulation) {
        wsRef.current?.play()
        setIsPlaying(true)
        setListens(1)
      }
    })
    wsRef.current.on('finish', () => setIsPlaying(false))

    return () => {
      wsRef.current?.destroy()
    }
  }, [audioUrl, isSimulation])

  const togglePlay = () => {
    if (!wsRef.current) return
    if (isSimulation) return
    if (listens >= maxListens && !isPlaying) {
      onListensExceeded?.()
      return
    }
    if (!isPlaying) {
      setListens(prev => prev + 1)
    }
    wsRef.current.playPause()
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-4">
      <button
        onClick={togglePlay}
        disabled={isSimulation || (listens >= maxListens && !isPlaying)}
        aria-label={isPlaying ? 'Mettre en pause' : 'Lire le document audio'}
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          'bg-primary text-white transition-all duration-200',
          'hover:bg-primary-dark active:scale-95',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          isSimulation && 'opacity-70 cursor-not-allowed hover:bg-primary'
        )}
      >
        {isLoading ? (
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : isPlaying ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-0.5">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
          </svg>
        )}
      </button>

      <div ref={waveRef} className="flex-1" role="img" aria-label="Forme d'onde audio" />

      <div className="flex flex-col items-end gap-1">
        <span className={cn(
          'text-sm font-bold',
          listens >= maxListens ? 'text-error' : 'text-primary'
        )}>
          {listens}/{maxListens}
        </span>
        <span className="text-xs text-gray-500">écoutes</span>
      </div>
    </div>
  )
}
