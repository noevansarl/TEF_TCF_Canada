import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore(state => state.user)
  const setUser = useAuthStore(state => state.setUser)

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            country: 'Canada'
          }
        }
      })
      if (authErr) {
        setError(authErr.message)
      } else if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email! }, 'user')

        // Enregistrer la conversion de parrainage/affilié si présent
        try {
          const clickId = localStorage.getItem('fa_affiliate_click_id')
          if (clickId) {
            await supabase.rpc('convert_affiliate_click', {
              p_click_id: clickId,
              p_user_id: data.user.id
            })
            // Nettoyage après conversion
            localStorage.removeItem('fa_affiliate_code')
            localStorage.removeItem('fa_affiliate_click_id')
            localStorage.removeItem('fa_affiliate_expiry')
          }
        } catch (affErr) {
          console.error("Échec de la conversion de l'affilié:", affErr)
        }

        navigate(from, { replace: true })
      }
    } catch (err: any) {
      setError("Une erreur est survenue lors de l'inscription.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0a1424] px-4 py-12 overflow-hidden">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-slate-300 hover:text-white text-sm font-semibold transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Retour à l'accueil</span>
      </Link>

      {/* Premium Ambient Background (Mesh Gradients) */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#1B3A6B]/40 to-[#2E75B6]/10 blur-[120px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#C55A11]/25 to-[#e06515]/5 blur-[120px] -z-10"></div>
      
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 bg-slate-900/30 backdrop-blur-2xl"
      >
        {/* Left Column - Form */}
        <div className="p-6 sm:p-10 md:p-14 flex flex-col justify-center">
          <div className="mb-10 flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-[#1B3A6B] to-[#2E75B6] rounded-xl shadow-lg shadow-[#1B3A6B]/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-sm tracking-[0.2em] leading-none">FRANCOPHONIE</span>
              <span className="text-[#C55A11] font-bold text-xs tracking-[0.1em] mt-0.5">ACADEMIA</span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Essai gratuit</h2>
            <p className="text-slate-400 text-sm mb-8">Créez votre compte en quelques secondes et commencez à vous entraîner.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl text-sm font-semibold text-center mb-6 select-none"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Nom complet</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 bg-slate-950/60 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C55A11]/60 focus:border-transparent focus:shadow-[0_0_20px_rgba(197,90,17,0.25)] transition-all duration-300 text-sm"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Adresse email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3.5 bg-slate-950/60 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C55A11]/60 focus:border-transparent focus:shadow-[0_0_20px_rgba(197,90,17,0.25)] transition-all duration-300 text-sm"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Mot de passe</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3.5 bg-slate-950/60 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C55A11]/60 focus:border-transparent focus:shadow-[0_0_20px_rgba(197,90,17,0.25)] transition-all duration-300 text-sm"
                  placeholder="•••••••• (6 caractères min)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 border border-transparent text-sm font-extrabold rounded-2xl text-white bg-gradient-to-r from-[#1B3A6B] via-[#2E75B6] to-[#C55A11] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C55A11] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#1B3A6B]/30 font-sans tracking-wide"
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-400">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-bold text-[#C55A11] hover:text-[#e06515] hover:underline transition-all">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Right Column - Brand & Gamified Badge Notification Widget */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-[#1B3A6B]/90 via-[#0d1c33]/95 to-[#060e1a] border-l border-white/10 relative overflow-hidden">
          {/* Internal Glowing Orb */}
          <div className="absolute top-[20%] right-[-20%] w-72 h-72 rounded-full bg-[#C55A11]/15 blur-[60px] pointer-events-none"></div>

          <div className="z-10">
            <span className="text-[#C55A11] text-[10px] font-black uppercase tracking-[0.2em] bg-[#C55A11]/10 px-4 py-2 rounded-full border border-[#C55A11]/20">
              ESSAI SANS CARTE BANCAIRE
            </span>
          </div>

          {/* Gamified Badge Card */}
          <div className="z-10 my-auto py-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-6 space-y-4 shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
              {/* Card light reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-[#C55A11] flex items-center justify-center text-3xl shadow-lg shadow-[#C55A11]/30">
                  🏆
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-sm">Premier Pas !</h4>
                  <p className="text-xs text-slate-400">Prêt à relever le défi</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-xs">
                  <p className="text-[#C55A11] font-bold">Initié du Canada</p>
                  <p className="text-slate-300 text-[10px] mt-0.5">+50 XP · Entraînement C2 débloqué</p>
                </div>
              </div>
              <div className="pt-2 flex justify-between items-center text-xs border-t border-white/5 text-slate-400">
                <span>Objectif : CLB 9+</span>
                <span className="text-white font-semibold">100% Gratuit</span>
              </div>
            </div>
          </div>

          <div className="z-10 space-y-3">
            <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
              Rejoignez plus de <br />5 000 candidats.
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed max-w-xs">
              Accédez immédiatement à vos exercices et évaluez vos chances d'obtenir votre visa canadien.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
