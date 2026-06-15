import { useState, useRef, useEffect } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record'
import { supabase } from '../../lib/supabase'

interface AudioRecorderProps {
  taskIndex: number
  sessionId: string
  taskDurationSeconds: number
  onRecordingComplete: (audioUrl: string) => void
}

export function AudioRecorder({ taskIndex, sessionId, taskDurationSeconds, onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [taskTimeLeft, setTaskTimeLeft] = useState(taskDurationSeconds)
  const waveRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const recordRef = useRef<InstanceType<typeof RecordPlugin> | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!waveRef.current) return
    
    // Create WaveSurfer with specific styling
    wsRef.current = WaveSurfer.create({
      container: waveRef.current,
      height: 64,
      waveColor: '#ef4444',
      progressColor: '#b91c1c',
    })

    // Register RecordPlugin with continuous scrolling waveform enabled
    recordRef.current = wsRef.current.registerPlugin(RecordPlugin.create({
      scrollingWaveform: true,
      renderRecordedAudio: false,
    }))

    // Handle record-start event
    recordRef.current.on('record-start', () => {
      setIsRecording(true)
    })

    // Handle record-end event
    recordRef.current.on('record-end', async (blob) => {
      if (timerRef.current) clearInterval(timerRef.current)
      setIsUploading(true)
      try {
        const filename = `eo/${sessionId}/task_${taskIndex}_${Date.now()}.webm`
        const { data, error } = await supabase.storage
          .from('audio-responses')
          .upload(filename, blob, { contentType: 'audio/webm' })
        
        if (error) throw error
        
        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('audio-responses').getPublicUrl(data.path)
          onRecordingComplete(publicUrl)
        }
      } catch (err: unknown) {
        console.error("Erreur de sauvegarde audio:", err)
        alert("Une erreur est survenue lors de l'enregistrement de votre réponse audio. Veuillez réessayer.")
      } finally {
        setIsUploading(false)
      }
    })

    return () => {
      wsRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTaskTimeLeft(prev => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000) as unknown as number
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      if (!recordRef.current) {
        alert("Le module d'enregistrement n'est pas prêt. Veuillez rafraîchir la page.")
        return
      }
      
      // Request mic permission and start monitoring stream
      await recordRef.current.startMic()
      
      // Begin recording
      await recordRef.current.startRecording()
    } catch (err: unknown) {
      console.error("Microphone access error:", err)
      alert(
        "Impossible d'accéder au microphone. Veuillez vous assurer :\n" +
        "1. Qu'un microphone fonctionnel est bien connecté.\n" +
        "2. Que vous avez autorisé l'accès au microphone dans les paramètres de votre navigateur."
      )
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recordRef.current) {
      recordRef.current.stopRecording()
      recordRef.current.stopMic()
    }
    setIsRecording(false)
  }

  const minutes = Math.floor(taskTimeLeft / 60)
  const seconds = taskTimeLeft % 60

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded-2xl">
      <div className="flex items-center justify-between">
        <span className={`text-2xl font-mono font-bold ${isRecording ? 'text-red-600 animate-pulse' : 'text-primary'}`}>
          {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
        </span>
        {isRecording && (
          <span className="flex items-center gap-2 text-red-600 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"/>
            Enregistrement en cours
          </span>
        )}
      </div>

      <div ref={waveRef} className="min-h-16 bg-white rounded-xl overflow-hidden" />

      <div className="flex justify-center">
        {!isRecording && !isUploading ? (
          <button onClick={startRecording}
            className="flex items-center gap-3 px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all active:scale-95">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <rect x="6" y="4" width="8" height="12" rx="4"/>
            </svg>
            Commencer l'enregistrement
          </button>
        ) : isUploading ? (
          <div className="flex items-center gap-3 text-primary">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Envoi en cours...
          </div>
        ) : (
          <button onClick={stopRecording}
            className="flex items-center gap-3 px-8 py-3 bg-gray-800 text-white rounded-full font-bold hover:bg-gray-900 transition-all">
            Arrêter et envoyer
          </button>
        )}
      </div>
    </div>
  )
}
