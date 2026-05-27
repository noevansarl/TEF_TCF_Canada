import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { useAuthStore } from '../store/authStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  
  const [profile, setProfile] = useState<any>({
    full_name: '',
    email: '',
    target_test: 'TCF_CANADA',
    target_date: '',
    level_assessed: 'C1',
    xp_points: 0,
    offline_mode: false
  })

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .single()

        if (data && !error) {
          // Parse target_date or set default (3 months from now)
          const targetDate = data.target_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          
          setProfile({
            full_name: data.full_name || 'Candidat Francophonie',
            email: data.email || 'candidat@example.com',
            target_test: data.target_test || 'TCF_CANADA',
            target_date: targetDate,
            level_assessed: data.level_assessed || 'C1',
            xp_points: data.xp_points || 0,
            offline_mode: data.offline_mode || false
          })
        }
      } catch (err) {
        console.error("Error loading profile:", err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const userId = userRes.user?.id || 'mock-user-id'

      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          target_test: profile.target_test,
          target_date: profile.target_date,
          offline_mode: profile.offline_mode
        })
        .eq('id', userId)

      if (!error) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error("Error saving profile:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') {
      alert("Veuillez saisir SUPPRIMER pour confirmer.")
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase.functions.invoke('delete-account')
      if (!error) {
        // Sign out on client and redirect
        setUser(null)
        navigate('/')
        alert("Votre compte et toutes vos données personnelles ont été supprimés avec succès.")
      } else {
        alert("Erreur lors de la suppression de votre compte. Veuillez contacter le support.")
      }
    } catch (err) {
      console.error("Error deleting account:", err)
      alert("Une erreur inattendue est survenue.")
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) return <FullPageSpinner />

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans flex justify-center items-start">
      <div className="max-w-2xl w-full space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none">
          ← Retour au tableau de bord
        </Link>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
          
          {/* Profile Header */}
          <div className="bg-[#1B3A6B] p-8 text-white flex flex-col md:flex-row items-center gap-6 select-none">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl font-extrabold border border-white/20">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="text-center md:text-left space-y-1">
              <h1 className="text-2xl font-extrabold">{profile.full_name}</h1>
              <p className="text-sm text-gray-300">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded uppercase font-semibold">
                  Niveau {profile.level_assessed}
                </span>
                <span className="text-xs bg-[#C55A11] px-2.5 py-0.5 rounded font-semibold text-white">
                  {profile.xp_points} XP
                </span>
              </div>
            </div>
          </div>

          {/* Edit Settings Form */}
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Paramètres de Préparation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  Nom Complet
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all text-sm text-gray-700"
                />
              </div>

              {/* Target Test Choice */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  Objectif de Test
                </label>
                <select
                  value={profile.target_test}
                  onChange={(e) => setProfile({ ...profile, target_test: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all text-sm text-gray-700"
                >
                  <option value="TCF_CANADA">TCF Canada</option>
                  <option value="TEF_CANADA">TEF Canada</option>
                </select>
              </div>

              {/* Target Exam Date */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  Date d'Examen Ciblé
                </label>
                <input
                  type="date"
                  value={profile.target_date}
                  onChange={(e) => setProfile({ ...profile, target_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all text-sm text-gray-700"
                />
              </div>

              {/* Level Assessed (Read Only) */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider opacity-60">
                  Niveau Diagnostiqué (CECRL)
                </label>
                <input
                  type="text"
                  value={profile.level_assessed}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed text-sm"
                />
              </div>
            </div>

            {/* Toggle offline mode */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <h4 className="text-sm font-bold text-gray-700">Mode Hors-ligne (PWA)</h4>
                <p className="text-xs text-gray-500">Activer le pré-téléchargement des modules pédagogiques pour vous exercer sans connexion internet.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={profile.offline_mode}
                  onChange={(e) => setProfile({ ...profile, offline_mode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C55A11]"></div>
              </label>
            </div>

            {/* Notifications and status */}
            <div className="flex items-center justify-between pt-4 select-none">
              <div>
                {saveSuccess && (
                  <span className="text-success text-sm font-bold flex items-center gap-1.5 animate-fade-in">
                    ✓ Modifications enregistrées avec succès !
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#1B3A6B] hover:bg-[#12274A] disabled:bg-gray-300 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Danger Zone (Conformité RGPD) */}
        <div className="bg-white rounded-3xl border border-red-100 shadow-md p-8 space-y-4">
          <h3 className="text-lg font-bold text-red-600 border-b border-red-50 pb-2 select-none">Zone de Danger</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <span className="text-sm font-bold text-gray-700 block">Suppression Définitive du Compte</span>
              <p className="text-xs text-gray-500 leading-relaxed">
                Cette action supprimera irrémédiablement votre profil, toutes vos productions écrites/orales, vos scores et vos badges. Conformément à l'Art. 17 du RGPD, toutes vos données personnelles seront effacées.
              </p>
            </div>
            <button
              onClick={() => {
                setDeleteConfirmText('')
                setShowDeleteModal(true)
              }}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm shrink-0 select-none"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border shadow-xl space-y-6">
            <div className="space-y-2 select-none">
              <h3 className="font-extrabold text-xl text-red-600">⚠️ Confirmation Requise</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Êtes-vous absolument sûr ? Cette action est irréversible et détruira toutes vos données de progression.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Veuillez saisir <strong className="text-red-600 select-all font-extrabold">SUPPRIMER</strong> pour confirmer :
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-gray-700"
              />
            </div>

            <div className="flex justify-end gap-3 select-none">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-xl font-bold hover:bg-gray-50 text-gray-600 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER' || deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span>Suppression...</span>
                  </>
                ) : (
                  'Confirmer la suppression'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
