import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { FullPageSpinner } from '../../components/FullPageSpinner'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setUser = useAuthStore(state => state.setUser)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const rawNext = searchParams.get('next') || '/dashboard'
      // Bloquer les redirections externes (open redirect)
      const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

      try {
        let session = null

        // 1. Check if Supabase Client already has session (parsed hash or loaded from local)
        const { data: { session: existingSession } } = await supabase.auth.getSession()
        if (existingSession) {
          session = existingSession
        }

        // 2. Check for code exchange (PKCE)
        const code = searchParams.get('code')
        if (!session && code) {
          const { data: { session: exchangeSession }, error: exchangeErr } = 
            await supabase.auth.exchangeCodeForSession(code)
          if (exchangeErr) {
            setError(exchangeErr.message)
            return
          }
          session = exchangeSession
        }

        // 3. Check for query or hash tokens
        let accessToken = searchParams.get('access_token')
        let refreshToken = searchParams.get('refresh_token')

        if (!session && !accessToken && window.location.hash) {
          const hash = window.location.hash.substring(1)
          const hashParams = new URLSearchParams(hash)
          accessToken = hashParams.get('access_token')
          refreshToken = hashParams.get('refresh_token')
        }

        if (!session && accessToken && refreshToken) {
          const { data: { session: setSession }, error: setSessionErr } = 
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
          if (setSessionErr) {
            setError(setSessionErr.message)
            return
          }
          session = setSession
        }

        // 4. Validate session
        if (!session || !session.user) {
          setError("Session de connexion introuvable ou expirée.")
          return
        }

        // 5. Enforce email confirmation check
        if (!session.user.email_confirmed_at) {
          await supabase.auth.signOut()
          setUser(null)
          setError("Votre adresse e-mail n'a pas encore été validée. Veuillez cliquer sur le lien envoyé dans votre boîte de réception.")
          return
        }

        // 6. Fetch user profile role
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        setUser({ id: session.user.id, email: session.user.email! }, profile?.role || 'user')
        
        // Redirect
        navigate(next, { replace: true })
      } catch (err) {
        console.error("Auth callback error:", err)
        setError("Une erreur est survenue lors de la finalisation de votre connexion.")
      }
    }

    handleCallback()
  }, [searchParams, navigate, setUser])

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6">
          <h1 className="text-2xl font-black text-rose-400 font-display">Erreur d'authentification</h1>
          <p className="text-slate-400 text-sm font-semibold">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl font-extrabold text-xs uppercase"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  return <FullPageSpinner />
}
