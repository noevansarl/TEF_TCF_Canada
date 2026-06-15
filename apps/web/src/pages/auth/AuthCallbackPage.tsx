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
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const next = searchParams.get('next') || '/dashboard'

      if (!accessToken || !refreshToken) {
        setError("Jetons de connexion manquants.")
        return
      }

      try {
        const { data: { session }, error: sessionErr } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionErr || !session?.user) {
          setError(sessionErr?.message || "Échec de l'authentification.")
          return
        }

        // Fetch user profile role
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
        setError("Une erreur est survenue lors de l'authentification automatique.")
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
            Se connecter manuellement
          </button>
        </div>
      </div>
    )
  }

  return <FullPageSpinner />
}
