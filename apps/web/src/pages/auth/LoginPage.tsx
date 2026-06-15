import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    setShowResend(false)
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (authErr) {
        if (authErr.message === 'Email not confirmed') {
          setError("Votre adresse e-mail n'a pas encore été validée. Veuillez vérifier votre boîte de réception.")
          setShowResend(true)
        } else if (authErr.message === 'Invalid login credentials') {
          setError('Identifiants de connexion incorrects.')
        } else {
          setError(authErr.message)
        }
      } else if (data?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()
        setUser({ id: data.user.id, email: data.user.email! }, profile?.role || 'user')
        navigate(from, { replace: true })
      }
    } catch (err: unknown) {
      setError("Une erreur est survenue lors de la connexion.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError("Veuillez saisir votre adresse email pour renvoyer le lien.")
      return
    }
    setResendLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (resendErr) {
        setError(resendErr.message)
      } else {
        setSuccessMessage("Un nouvel e-mail de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.")
        setShowResend(false)
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi de l'e-mail de confirmation.")
    } finally {
      setResendLoading(false)
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
              <span className="text-white font-black text-sm tracking-[0.2em] leading-none">ayePREP</span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Bon retour !</h2>
            <p className="text-slate-400 text-sm mb-8">Saisissez vos identifiants pour continuer votre préparation.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl text-sm font-semibold text-center mb-6 select-none flex flex-col items-center gap-3"
            >
              <span>{error}</span>
              {showResend && (
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResend}
                  className="px-4 py-2 bg-gradient-to-r from-[#1B3A6B] to-[#C55A11] hover:scale-[1.02] active:scale-[0.98] text-white rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all duration-300 disabled:opacity-50 shadow-md"
                >
                  {resendLoading ? 'Envoi en cours...' : "Renvoyer le lien de validation"}
                </button>
              )}
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500/10 border border-green-500/20 text-green-200 p-4 rounded-2xl text-sm font-semibold text-center mb-6 select-none"
            >
              {successMessage}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider">Mot de passe</label>
                  <a href="#" className="text-xs text-[#C55A11] hover:text-[#e06515] font-semibold transition-colors">Mot de passe oublié ?</a>
                </div>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3.5 bg-slate-950/60 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C55A11]/60 focus:border-transparent focus:shadow-[0_0_20px_rgba(197,90,17,0.25)] transition-all duration-300 text-sm"
                  placeholder="••••••••"
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
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-400">
            Nouveau sur la plateforme ?{' '}
            <Link to="/register" className="font-bold text-[#C55A11] hover:text-[#e06515] hover:underline transition-all">
              Créer un compte gratuitement
            </Link>
          </p>
        </div>

        {/* Right Column - Brand & Interactive Visual Widget */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-[#1B3A6B]/90 via-[#0d1c33]/95 to-[#060e1a] border-l border-white/10 relative overflow-hidden">
          {/* Internal Glowing Orb */}
          <div className="absolute top-[20%] right-[-20%] w-72 h-72 rounded-full bg-[#C55A11]/15 blur-[60px] pointer-events-none"></div>

          <div className="z-10">
            <span className="text-[#C55A11] text-[10px] font-black uppercase tracking-[0.2em] bg-[#C55A11]/10 px-4 py-2 rounded-full border border-[#C55A11]/20">
              IMMIGRATION CANADA 2026
            </span>
          </div>

          {/* Interactive Mock Dashboard Card */}
          <div className="z-10 my-auto py-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-6 space-y-5 shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
              {/* Card light reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C55A11] to-amber-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-[#C55A11]/30">
                  JD
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Jean Dupont</h4>
                  <p className="text-xs text-slate-400">Candidat TCF Canada</p>
                </div>
                <span className="ml-auto bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Admis C2
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Progression globale</span>
                  <span className="text-[#C55A11] font-bold">NCLC 10</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#1B3A6B] to-[#C55A11] rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Compréhension</p>
                  <p className="text-white font-extrabold mt-0.5">620 / 699</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Expression</p>
                  <p className="text-white font-extrabold mt-0.5">580 / 699</p>
                </div>
              </div>
            </div>
          </div>

          <div className="z-10 space-y-3">
            <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
              Votre score C2 <br />commence ici.
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed max-w-xs">
              Simulez fidèlement les conditions du vrai jour J et maximisez vos points d'immigration Express Entry.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
