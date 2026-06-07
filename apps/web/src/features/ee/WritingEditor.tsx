import { useState, useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

interface WritingEditorProps {
  value: string
  onTextChange: (text: string) => void
  targetWordCount: { min: number; max: number }
  placeholder?: string
}

export function WritingEditor({ value, onTextChange, targetWordCount, placeholder }: WritingEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [lastSave, setLastSave] = useState<Date | null>(null)
  const autoSaveRef = useRef<number | null>(null)

  const countWords = (t: string) =>
    t.trim() === '' ? 0 : t.trim().split(/\s+/).length

  // Calculate word count from value and setup autosave on value change
  useEffect(() => {
    const count = countWords(value)
    setWordCount(count)

    // Autosave notification after 15s of typing stop
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      setLastSave(new Date())
    }, 15000) as unknown as number

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [value])

  const isUnder = wordCount < targetWordCount.min
  const isOver = wordCount > targetWordCount.max
  const isGood = !isUnder && !isOver

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          Objectif : {targetWordCount.min}–{targetWordCount.max} mots
        </span>
        {lastSave && (
          <span className="text-xs text-success">
            Sauvegarde automatique effectuée à {lastSave.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={e => onTextChange(e.target.value)}
        placeholder={placeholder || 'Rédigez votre réponse ici...'}
        spellCheck={false}
        className={cn(
          'w-full min-h-[300px] p-4 rounded-xl border-2 font-serif text-base text-slate-900',
          'resize-none focus:outline-none focus:ring-2 transition-colors',
          'bg-white leading-relaxed',
          isGood && 'border-success focus:ring-success/30',
          isUnder && 'border-gray-200 focus:ring-primary/30',
          isOver && 'border-error focus:ring-error/30'
        )}
      />
      <div className="flex justify-end items-center gap-2">
        <span className={cn(
          'text-sm font-bold transition-colors',
          isGood && 'text-success',
          isUnder && 'text-gray-500',
          isOver && 'text-error'
        )}>
          {wordCount} mots
        </span>
        {isOver && (
          <span className="text-xs text-error">
            ({wordCount - targetWordCount.max} mots en trop)
          </span>
        )}
        {isUnder && wordCount > 0 && (
          <span className="text-xs text-gray-500">
            (encore {targetWordCount.min - wordCount} mots requis)
          </span>
        )}
      </div>
    </div>
  )
}

