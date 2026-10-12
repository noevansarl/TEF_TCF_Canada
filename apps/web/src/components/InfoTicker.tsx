import { useEffect, useState } from 'react'

const MESSAGES: string[] = [
  "💡 Le calculateur NCLC gratuit convertit vos scores TCF/TEF en niveau officiel reconnu par IRCC.",
  "🤖 La correction IA (GPT-4o) analyse votre Expression Écrite sur 5 critères CECRL en moins de 20 secondes.",
  "🎯 Le mode Simulation reproduit les 4 épreuves officielles avec des durées strictement identiques à l'examen.",
  "🗣️ L'Expression Orale est transcrite par Whisper puis corrigée automatiquement — entraînez-vous en conditions réelles.",
  "📊 Suivez votre progression module par module dans l'onglet Progression, jusqu'au niveau NCLC visé.",
  "🗓️ Les parcours adaptatifs 30 ou 60 jours structurent votre révision selon votre date d'examen.",
  "🌍 Paiement Mobile Money disponible (Orange, MTN, Wave, Moov) avec -40% pour l'Afrique subsaharienne.",
  "💳 Remboursé sous 14 jours sans condition ni justification si ayePREP ne vous convient pas.",
  "📱 L'application mobile ayePREP (iOS et Android) permet de réviser hors connexion.",
  "🧮 Le simulateur CRS calcule vos points Entrée Express — jusqu'à 50 points bonus grâce au français.",
]

const INTERVAL_MS = 5000

export function InfoTicker() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % MESSAGES.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="select-none bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 rounded-2xl px-5 py-3 overflow-hidden">
      <p
        key={index}
        className="text-xs md:text-sm text-[#1B3A6B] font-semibold text-center animate-fade-in"
      >
        {MESSAGES[index]}
      </p>
    </div>
  )
}
