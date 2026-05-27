import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { BadgeUnlockToast } from './BadgeUnlockToast'

export default function PrivateLayout() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [isInstitution, setIsInstitution] = useState(false)

  useEffect(() => {
    async function checkInstitution() {
      if (!user) return
      try {
        const { data } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .maybeSingle()

        if (data && data.subscription_tier === 'institutionnel') {
          setIsInstitution(true)
        }
      } catch (e) {
        console.error(e)
      }
    }
    checkInstitution()
  }, [user])

  const handleLogout = () => {
    setUser(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="font-bold text-lg hover:opacity-90 flex items-center gap-2">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 40 40">
                <path d="M20 2 L23 12 L33 8 L26 17 L36 22 L26 27 L33 36 L23 32 L20 42 L17 32 L7 36 L14 27 L4 22 L14 17 L7 8 L17 12 Z"/>
              </svg>
              <span>FRANCOPHONIE ACADEMIA</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link to="/dashboard" className="hover:text-secondary transition-colors font-semibold text-sm">Tableau de bord</Link>
              <Link to="/modules" className="hover:text-secondary transition-colors font-semibold text-sm">Catalogue</Link>
              <Link to="/parcours" className="hover:text-secondary transition-colors font-semibold text-sm">Mon parcours</Link>
              <Link to="/progress" className="hover:text-secondary transition-colors font-semibold text-sm">Progression</Link>
              <Link to="/profile" className="hover:text-secondary transition-colors font-semibold text-sm">Profil</Link>
              <Link to="/affiliation" className="hover:text-secondary transition-colors font-semibold text-sm">Affiliation</Link>
              {isInstitution && (
                <Link to="/institution" className="hover:text-secondary transition-colors font-semibold text-sm text-yellow-300">🏫 Institution</Link>
              )}
            </nav>
          </div>
          <div className="flex gap-4 items-center">
            <span className="hidden sm:inline text-sm opacity-80">{user?.email}</span>
            <button onClick={handleLogout} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-all">Déconnexion</button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <BadgeUnlockToast />
    </div>
  )
}
