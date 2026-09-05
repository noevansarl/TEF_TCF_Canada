import { useState } from 'react'
import { trackMarketingEvent } from '../lib/tracking'

export interface SocialShareProps {
  title?: string
  text: string
  url?: string
  hashtags?: string[]
  className?: string
  compact?: boolean
}

export function SocialShareButtons({
  title = 'Partagez votre résultat',
  text,
  url = typeof window !== 'undefined' ? window.location.href : 'https://ayeprep.com',
  className = '',
  compact = false
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareTextWithUrl = `${text}\n\n👉 ${url}`

  const handleShare = (platform: string, shareLink: string) => {
    trackMarketingEvent('social_share_clicked', { platform, url })
    window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareTextWithUrl)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = shareTextWithUrl
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      trackMarketingEvent('social_share_clicked', { platform: 'clipboard', url })
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error('Erreur copie presse-papier:', err)
    }
  }

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTextWithUrl)}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

  return (
    <div className={`rounded-2xl ${compact ? 'p-3' : 'p-5'} border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm ${className}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${compact ? 'mb-2.5' : 'mb-4'}`}>
        <div>
          <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-black text-slate-900 font-display flex items-center gap-2`}>
            <span className="text-base">🚀</span> {title}
          </h4>
          {!compact && (
            <p className="text-xs text-slate-500 font-medium">
              Aidez d'autres candidats et comparez vos scores dans vos groupes d'entraide !
            </p>
          )}
        </div>
        {copied && (
          <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 animate-fade-in self-start sm:self-auto">
            ✓ Copié !
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* WhatsApp Button (Highlight channel #1) */}
        <button
          type="button"
          onClick={() => handleShare('whatsapp', whatsappUrl)}
          className={`flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white ${compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-2.5 text-xs'} rounded-xl font-black shadow-sm hover:shadow-md transition-all active:scale-95`}
          title="Partager sur WhatsApp"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          WhatsApp
        </button>

        {/* Telegram Button */}
        <button
          type="button"
          onClick={() => handleShare('telegram', telegramUrl)}
          className="flex items-center gap-1.5 bg-[#229ED9] hover:bg-[#1e8bc0] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
          title="Partager sur Telegram"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" />
          </svg>
          Telegram
        </button>

        {/* LinkedIn Button */}
        <button
          type="button"
          onClick={() => handleShare('linkedin', linkedinUrl)}
          className="flex items-center gap-1.5 bg-[#0077B5] hover:bg-[#006396] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
          title="Partager sur LinkedIn"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
          LinkedIn
        </button>

        {/* Facebook Button */}
        <button
          type="button"
          onClick={() => handleShare('facebook', facebookUrl)}
          className="flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
          title="Partager sur Facebook"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
          </svg>
          Facebook
        </button>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all border border-slate-250 active:scale-95 ml-auto sm:ml-0"
          title="Copier le texte et le lien"
        >
          <span>📋</span> {copied ? 'Copié !' : 'Copier'}
        </button>
      </div>
    </div>
  )
}
