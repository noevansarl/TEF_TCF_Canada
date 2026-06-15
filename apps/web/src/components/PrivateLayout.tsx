import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { BadgeUnlockToast } from './BadgeUnlockToast'
import { Logo } from './Logo'

export default function PrivateLayout() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [isInstitution, setIsInstitution] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      <header className="sticky top-0 z-45 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-3.5 relative">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo to="/dashboard" />
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">Tableau de bord</Link>
              <Link to="/modules" className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">Catalogue</Link>
              <Link to="/parcours" className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">Mon parcours</Link>
              <Link to="/progress" className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">Progression</Link>
              <Link to="/profile" className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">Profil</Link>
              <Link to="/affiliation" className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">Affiliation</Link>
              {isInstitution && (
                <Link to="/institution" className="text-amber-600 hover:text-amber-700 font-bold text-sm transition-colors flex items-center gap-1">🏫 Institution</Link>
              )}
            </nav>
          </div>
          
          <div className="flex gap-4 items-center">
            <span className="hidden sm:inline text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50">{user?.email}</span>
            <button onClick={() => void handleLogout()} className="hidden sm:block text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm">Déconnexion</button>
            
            {/* Hamburger button on mobile */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/60 p-4 space-y-2 relative z-30 shadow-md">
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">Tableau de bord</Link>
          <Link to="/modules" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">Catalogue</Link>
          <Link to="/parcours" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">Mon parcours</Link>
          <Link to="/progress" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">Progression</Link>
          <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">Profil</Link>
          <Link to="/affiliation" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">Affiliation</Link>
          {isInstitution && (
            <Link to="/institution" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-amber-600 hover:bg-amber-50 font-bold text-sm transition-colors">🏫 Institution</Link>
          )}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <span className="px-4 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg truncate">{user?.email}</span>
            <button onClick={() => { void handleLogout(); setMobileMenuOpen(false); }} className="w-full text-center px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-sm transition-colors">
              Déconnexion
            </button>
          </div>
        </nav>
      )}

      <main className="flex-1 w-full relative z-10">
        <Outlet />
      </main>
      <BadgeUnlockToast />
    </div>
  )
}
