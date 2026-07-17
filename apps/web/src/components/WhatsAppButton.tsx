import { useEffect, useState } from 'react'

export function WhatsAppButton() {
  const [visible, setVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [hasNotification, setHasNotification] = useState(true)

  // Affiche le bouton après 3 secondes pour ne pas être intrusif
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [])

  const handleSend = () => {
    const textToSend = userInput.trim() || 'Bonjour ! Je souhaite des informations sur la préparation au TCF/TEF Canada.'
    const encoded = encodeURIComponent(textToSend)
    window.open(`https://wa.me/22890116744?text=${encoded}`, '_blank', 'noopener,noreferrer')
    setUserInput('')
    setIsOpen(false)
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen)
    if (hasNotification) {
      setHasNotification(false)
    }
  }

  if (!visible) return null

  return (
    <>
      {/* Fenêtre de Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[320px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* En-tête vert premium */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/logoayePREP.png" 
                  alt="ayePREP Support" 
                  className="w-10 h-10 rounded-full bg-white object-contain border border-emerald-500/20"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Support ayePREP</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                  <span className="text-[11px] text-emerald-100 font-medium">En ligne</span>
                </div>
              </div>
            </div>
            
            {/* Bouton de fermeture */}
            <button 
              onClick={() => setIsOpen(false)}
              className="text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
              aria-label="Fermer le chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Corps de la conversation */}
          <div className="bg-slate-950 p-4 flex-1 min-h-[180px] flex flex-col justify-end space-y-3 relative overflow-hidden">
            {/* Décoration en arrière-plan (Style bulles WhatsApp) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#25d366_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Bulle de message de l'agent */}
            <div className="self-start bg-slate-800 border border-slate-700/60 text-slate-100 p-3 rounded-2xl rounded-tl-none shadow-md max-w-[85%] relative z-10">
              <p className="text-xs font-medium leading-relaxed">
                Bonjour ! 👋 Comment pouvons-nous vous aider aujourd'hui à préparer votre TCF ou TEF Canada ?
              </p>
              <span className="text-[9px] text-slate-400 mt-1 block text-right font-medium">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Formulaire d'envoi */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 relative z-10">
            <input
              type="text"
              placeholder="Écrivez votre message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              onClick={handleSend}
              className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-md"
              aria-label="Envoyer sur WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transform rotate-45 translate-x-px -translate-y-px">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bouton de déclenchement Flottant */}
      <button
        onClick={handleButtonClick}
        aria-label="Contacter le support client"
        title="Besoin d'aide ? Contactez-nous"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 relative cursor-pointer"
        style={{ backgroundColor: '#25D366' }}
      >
        {/* Icône WhatsApp */}
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>

        {/* Indicateur de notification en ligne animée */}
        {hasNotification ? (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-bold items-center justify-center">1</span>
          </span>
        ) : (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
        )}
      </button>
    </>
  )
}

