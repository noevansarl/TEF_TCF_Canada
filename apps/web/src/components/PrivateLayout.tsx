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
  const [isPremium, setIsPremium] = useState(false)
  const [loadingSub, setLoadingSub] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function checkSubscription() {
      if (!user) return
      try {
        const { data } = await supabase
          .from('users')
          .select('subscription_tier, subscription_expires_at, active_pack_id, pack_expires_at')
          .eq('id', user.id)
          .maybeSingle()

        if (data) {
          const now = new Date()
          const subTier = data.subscription_tier
          const subExpires = data.subscription_expires_at ? new Date(data.subscription_expires_at) : null
          const packId = data.active_pack_id
          const packExpires = data.pack_expires_at ? new Date(data.pack_expires_at) : null

          const hasValidSub = subTier && 
            ['avance', 'premium', 'institutionnel', 'essentiel', 'bronze', 'silver', 'gold', 'platinum'].includes(subTier) && 
            (!subExpires || subExpires > now)

          const hasValidPack = packId && 
            ['bronze', 'silver', 'gold', 'platinum'].includes(packId) && 
            (packExpires && packExpires > now)

          setIsPremium(!!(hasValidSub || hasValidPack))
          setIsInstitution(subTier === 'institutionnel')
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingSub(false)
      }
    }
    checkSubscription()
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
          
          <div className="flex gap-4 items-center md:border-l md:border-slate-200/80 md:pl-6 md:ml-2 select-none">
            {!loadingSub && isPremium && (
              <span className="hidden sm:flex text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-[#C55A11] border border-amber-500/20 px-2.5 py-1 rounded-lg items-center gap-1 select-none">
                ⭐ Premium
              </span>
            )}
            {!loadingSub && !isPremium && (
              <Link
                to="/subscribe"
                className="bg-slate-900 text-amber-400 border border-amber-500/30 hover:border-amber-400 hover:text-amber-300 hover:bg-slate-850 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] shadow-sm flex items-center gap-1.5"
              >
                <span>💎</span>
                <span>Devenir Premium</span>
              </Link>
            )}
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
          {!loadingSub && !isPremium && (
            <Link 
              to="/subscribe" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#C55A11] to-red-500 text-white font-extrabold text-sm text-center shadow-md select-none animate-pulse-slow"
            >
              💎 Devenir Premium
            </Link>
          )}
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
