import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function CataloguePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loadingModule, setLoadingModule] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(true)
  const [loadingSub, setLoadingSub] = useState(true)
  const [showUpsellModal, setShowUpsellModal] = useState(false)
  const [blockedModule, setBlockedModule] = useState<string | null>(null)

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
        } else {
          setIsPremium(false)
        }
      } catch (err) {
        console.error(err)
        setIsPremium(false)
      } finally {
        setLoadingSub(false)
      }
    }
    checkSubscription()
  }, [user])

  const handleStartSession = async (moduleType: 'CO' | 'CE' | 'EE' | 'EO') => {
    if (!loadingSub && !isPremium && (moduleType === 'EE' || moduleType === 'EO')) {
      setBlockedModule(moduleType)
      setShowUpsellModal(true)
      return
    }
    setLoadingModule(moduleType)
    try {
      const userId = user?.id || 'mock-user-id'

      // Fetch user profile test preference
      const { data: profile } = await supabase
        .from('users')
        .select('target_test, exam_type_pref')
        .eq('id', userId)
        .maybeSingle()

      const prefTest = profile?.exam_type_pref || profile?.target_test || 'TCF_CANADA'
      const testType = prefTest === 'BOTH' ? 'TCF_CANADA' : prefTest

      let maxDuration = 3600
      if (moduleType === 'CO') maxDuration = testType === 'TEF_CANADA' ? 2400 : 2100
      else if (moduleType === 'CE') maxDuration = testType === 'TEF_CANADA' ? 3600 : 2100
      else if (moduleType === 'EE') maxDuration = 3600
      else if (moduleType === 'EO') maxDuration = testType === 'TEF_CANADA' ? 2100 : 720

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          module: moduleType,
          session_type: 'TRAINING',
          test_type: testType,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          max_duration_s: maxDuration
        })
        .select()
        .single()

      if (error || !data) {
        navigate(`/session/${moduleType.toLowerCase()}-session-id`)
      } else {
        navigate(`/session/${data.id}`)
      }
    } catch (e) {
      console.error(e)
      navigate(`/session/${moduleType.toLowerCase()}-session-id`)
    } finally {
      setLoadingModule(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none">
          ← Retour au tableau de bord
        </Link>
        <div className="text-center md:text-left select-none">
          <h1 className="text-3xl font-extrabold text-primary">Catalogue de Préparation</h1>
          <p className="text-gray-500 mt-1">Préparez-vous de manière intensive aux 4 compétences clés du TCF et TEF Canada.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: CO */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max mb-3">Compréhension</span>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Compréhension de l'Oral (CO)</h2>
              <p className="text-gray-600 mb-6 text-sm">Entraînez-vous avec plus de 600 fichiers audio originaux dans les conditions réelles d'examen (accent québécois, parisien, etc.).</p>
            </div>
            <button
              onClick={() => handleStartSession('CO')}
              disabled={loadingModule !== null}
              className="px-4 py-2.5 bg-primary text-white text-center rounded-xl font-bold hover:bg-primary-dark transition-all select-none disabled:opacity-50"
            >
              {loadingModule === 'CO' ? 'Création de la session...' : "Commencer l'épreuve"}
            </button>
          </div>

          {/* Card 2: CE */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max mb-3">Compréhension</span>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Compréhension des Écrits (CE)</h2>
              <p className="text-gray-600 mb-6 text-sm">Textes d'actualité, administratifs et professionnels avec système split-screen. Développez votre vocabulaire académique.</p>
            </div>
            <button
              onClick={() => handleStartSession('CE')}
              disabled={loadingModule !== null}
              className="px-4 py-2.5 bg-primary text-white text-center rounded-xl font-bold hover:bg-primary-dark transition-all select-none disabled:opacity-50"
            >
              {loadingModule === 'CE' ? 'Création de la session...' : "Commencer l'épreuve"}
            </button>
          </div>

          {/* Card 3: EE */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-3 select-none">
                <span className="text-xs bg-secondary/10 text-secondary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max">Expression</span>
                {!loadingSub && !isPremium && (
                  <span className="text-[10px] font-black uppercase bg-amber-500/10 text-[#C55A11] border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    🔒 Premium
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Expression Écrite (EE)</h2>
              <p className="text-gray-600 mb-6 text-sm">Rédigez vos essais, lettres d'opinion ou plaidoyers sur notre éditeur en ligne. Obtenez une correction instantanée détaillée par critère CECRL.</p>
            </div>
            <button
              onClick={() => handleStartSession('EE')}
              disabled={loadingModule !== null}
              className="px-4 py-2.5 bg-secondary text-white text-center rounded-xl font-bold hover:bg-secondary-dark transition-all select-none disabled:opacity-50"
            >
              {loadingModule === 'EE' ? 'Création de la session...' : "Commencer l'épreuve"}
            </button>
          </div>

          {/* Card 4: EO */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-3 select-none">
                <span className="text-xs bg-secondary/10 text-secondary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max">Expression</span>
                {!loadingSub && !isPremium && (
                  <span className="text-[10px] font-black uppercase bg-amber-500/10 text-[#C55A11] border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    🔒 Premium
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Expression Orale (EO)</h2>
              <p className="text-gray-600 mb-6 text-sm">Enregistrez directement vos réponses orales. Notre système Whisper retranscrit votre voix et GPT-4o analyse votre accent, fluidité et lexique.</p>
            </div>
            <button
              onClick={() => handleStartSession('EO')}
              disabled={loadingModule !== null}
              className="px-4 py-2.5 bg-secondary text-white text-center rounded-xl font-bold hover:bg-secondary-dark transition-all select-none disabled:opacity-50"
            >
              {loadingModule === 'EO' ? 'Création de la session...' : "Commencer l'épreuve"}
            </button>
          </div>
        </div>
      </div>

      {/* Upsell Modal */}
      {showUpsellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 border border-slate-100 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#1B3A6B]/5 blur-[80px]"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-amber-500/5 blur-[80px]"></div>
            
            <button 
              onClick={() => setShowUpsellModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full hover:bg-slate-100 transition-colors text-sm"
            >
              ✕
            </button>
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-[#C55A11] flex items-center justify-center text-3xl shadow-lg shadow-orange-500/25">
              💎
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Accès Réservé aux Membres Premium</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Les épreuves d'<strong>{blockedModule === 'EE' ? "Expression Écrite" : "Expression Orale"}</strong> nécessitent des ressources d'évaluation avancées et une correction détaillée par notre IA.
              </p>
              <p className="text-slate-400 text-xs leading-normal">
                Rejoignez la préparation Premium pour soumettre vos réponses et recevoir des analyses exhaustives basées sur les grilles de notation officielles.
              </p>
            </div>
            
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to="/subscribe"
                onClick={() => setShowUpsellModal(false)}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-[#C55A11] to-red-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-center uppercase tracking-wider"
              >
                Débloquer l'accès Premium 🚀
              </Link>
              <button
                onClick={() => setShowUpsellModal(false)}
                className="w-full py-3 text-slate-500 hover:text-slate-700 font-bold text-xs bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-wider"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
