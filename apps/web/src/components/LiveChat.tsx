import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

declare global {
  interface Window {
    $crisp: any[]
    CRISP_WEBSITE_ID: string
  }
}

export function LiveChat() {
  const { user, role } = useAuthStore()

  useEffect(() => {
    // Récupérer la clé Crisp dans les variables d'environnement
    const websiteId = import.meta.env.VITE_CRISP_WEBSITE_ID
    if (!websiteId) {
      console.warn("VITE_CRISP_WEBSITE_ID n'est pas défini dans le fichier d'environnement. Le chat Crisp ne sera pas chargé.")
      return
    }

    window.$crisp = []
    window.CRISP_WEBSITE_ID = websiteId

    // Envoyer des informations utilisateur à Crisp pour personnaliser le support
    if (user) {
      window.$crisp.push(['set', 'user:email', [user.email]])
      window.$crisp.push(['set', 'user:nickname', [user.email.split('@')[0]]])
      window.$crisp.push(['set', 'session:data', [[
        ['user_id', user.id],
        ['role', role]
      ]]])
    }

    // Chargement asynchrone du script Crisp officiel
    const d = document
    const s = d.createElement('script')
    s.src = 'https://client.crisp.chat/l.js'
    s.async = true
    d.getElementsByTagName('head')[0].appendChild(s)

    // Nettoyage lors du démontage du composant (évite les duplications)
    return () => {
      const script = d.querySelector('script[src="https://client.crisp.chat/l.js"]')
      if (script) script.remove()
      const chatbox = d.getElementById('crisp-chatbox')
      if (chatbox) chatbox.remove()
    }
  }, [user, role])

  return null
}
