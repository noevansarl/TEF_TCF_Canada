import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Après un déploiement, les chunks JS lazy-loadés (React.lazy) d'une page déjà
// ouverte peuvent pointer vers des fichiers qui n'existent plus sur le serveur
// (nouveaux noms de fichiers hashés). Vite déclenche "vite:preloadError" dans
// ce cas : on recharge une seule fois pour récupérer la version à jour, plutôt
// que de laisser l'utilisateur sur un écran d'erreur nécessitant un rechargement manuel.
window.addEventListener('vite:preloadError', () => {
  const alreadyReloaded = sessionStorage.getItem('vite-preload-reloaded')
  if (!alreadyReloaded) {
    sessionStorage.setItem('vite-preload-reloaded', '1')
    window.location.reload()
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Le rendu initial a réussi : on efface le drapeau pour permettre un futur
// rechargement automatique si un nouveau déploiement provoque une nouvelle
// erreur de préchargement plus tard dans la même session d'onglet.
setTimeout(() => sessionStorage.removeItem('vite-preload-reloaded'), 3000)
