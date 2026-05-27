import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

interface StudentRecord {
  id: string
  institution_id: string
  user_id: string
  joined_at: string
  user: {
    id: string
    full_name: string
    email: string
    subscription_tier: string
    xp_points: number
    streak_days: number
    level_assessed: string
    target_test: string
    country: string
    role?: string
  }
}

interface ClassSessionRecord {
  id: string
  institution_id: string
  teacher_id: string
  module: 'CO' | 'CE' | 'SIMULATION'
  status: 'waiting' | 'active' | 'completed'
  total_students: number
  started_at?: string
  completed_at?: string
  created_at: string
}

export default function InstitutionDashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [institution, setInstitution] = useState<any>(null)
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [classSessions, setClassSessions] = useState<ClassSessionRecord[]>([])
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  
  // Live Classroom states
  const [isLiveOpen, setIsLiveOpen] = useState(false)
  const [liveModule, setLiveModule] = useState<'CO' | 'CE' | 'SIMULATION'>('CO')
  const [activeLiveSession, setActiveLiveSession] = useState<ClassSessionRecord | null>(null)
  const [liveStudentsProgress, setLiveStudentsProgress] = useState<any[]>([])
  const [simulationTimer, setSimulationTimer] = useState<NodeJS.Timeout | null>(null)

  // Load dashboard data
  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Fetch institution membership for the current logged-in user
      const { data: membership } = await supabase
        .from('institution_students')
        .select('institution_id')
        .eq('user_id', user?.id)
        .maybeSingle()

      let instQuery = supabase.from('institutions').select('*')
      if (membership) {
        instQuery = instQuery.eq('id', membership.institution_id)
      }
      
      const { data: instData } = await instQuery.single()

      if (instData) {
        setInstitution(instData)

        // 2. Fetch student list with joined user profile details
        const { data: studs } = await supabase
          .from('institution_students')
          .select('*, user:users(*)')
          .eq('institution_id', instData.id)
        
        if (studs) {
          setStudents(studs as StudentRecord[])
        }

        // 3. Fetch class sessions for this institution
        const { data: sessions } = await supabase
          .from('class_sessions')
          .select('*')
          .eq('institution_id', instData.id)
          .order('created_at', { ascending: false })

        if (sessions) {
          setClassSessions(sessions as ClassSessionRecord[])
          const active = sessions.find((s: any) => s.status === 'active')
          if (active) {
            setActiveLiveSession(active as ClassSessionRecord)
            initializeLiveStudents(studs || [])
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    return () => {
      if (simulationTimer) clearInterval(simulationTimer)
    }
  }, [user])

  // Initialize simulated live students for Live Classroom demo
  const initializeLiveStudents = (studentList: any[]) => {
    const list = studentList.map((s, idx) => ({
      id: s.user_id,
      name: s.user?.full_name || `Étudiant ${idx + 1}`,
      progress: 0,
      correctCount: 0,
      wrongCount: 0,
      currentQuestion: 1,
      status: 'active'
    }))
    setLiveStudentsProgress(list)
  }

  // Handle bulk CSV / email import simulation
  const handleBulkImport = async () => {
    setImportError(null)
    const lines = importText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    if (lines.length === 0) {
      setImportError('Veuillez entrer au moins une ligne de données.')
      return
    }

    const studentsToInsert: any[] = []
    
    for (const line of lines) {
      // Support formats: "Email" or "Name,Email"
      let name = ''
      let email = ''
      if (line.includes(',')) {
        const parts = line.split(',')
        name = parts[0].trim()
        email = parts[1].trim()
      } else {
        email = line
        name = email.split('@')[0]
      }

      if (!email.includes('@')) {
        setImportError(`Adresse email invalide : ${line}`)
        return
      }

      const randomUserId = 'u-' + Math.floor(Math.random() * 1000000)
      studentsToInsert.push({
        institution_id: institution.id,
        user_id: randomUserId,
        name,
        email
      })
    }

    try {
      const { error } = await supabase
        .from('institution_students')
        .insert(studentsToInsert)

      if (error) {
        setImportError(error.message || 'Erreur lors de l\'importation.')
      } else {
        setImportText('')
        setIsImportOpen(false)
        await loadData()
      }
    } catch (err: any) {
      setImportError(err.message || 'Erreur lors de l\'importation.')
    }
  }

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Voulez-vous vraiment retirer cet étudiant de l\'établissement ?')) return
    try {
      const { error } = await supabase
        .from('institution_students')
        .delete()
        .eq('id', studentId)

      if (!error) {
        await loadData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Start Live Classroom sync simulation
  const handleStartLiveClassroom = async () => {
    if (!institution) return
    try {
      const { data, error } = await supabase
        .from('class_sessions')
        .insert({
          institution_id: institution.id,
          teacher_id: user?.id || 'mock-user-id',
          module: liveModule,
          status: 'active',
          total_students: students.length,
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!error && data) {
        setActiveLiveSession(data as ClassSessionRecord)
        initializeLiveStudents(students)
        setIsLiveOpen(false)
        
        // Start simulation timer to simulate live student answers every 2 seconds
        const timer = setInterval(() => {
          setLiveStudentsProgress(prev => {
            const maxQ = liveModule === 'CO' ? 39 : liveModule === 'CE' ? 39 : 10
            return prev.map(s => {
              if (s.progress >= 100) return s
              
              const isAnswering = Math.random() > 0.4
              if (!isAnswering) return s

              const nextQ = Math.min(s.currentQuestion + 1, maxQ)
              const wasCorrect = Math.random() > 0.3
              return {
                ...s,
                currentQuestion: nextQ,
                progress: Math.round((nextQ / maxQ) * 100),
                correctCount: s.correctCount + (wasCorrect ? 1 : 0),
                wrongCount: s.wrongCount + (wasCorrect ? 0 : 1),
                status: nextQ === maxQ ? 'completed' : 'active'
              }
            })
          })
        }, 2000)
        setSimulationTimer(timer)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // End Live Classroom
  const handleEndLiveClassroom = async () => {
    if (!activeLiveSession) return
    if (simulationTimer) {
      clearInterval(simulationTimer)
      setSimulationTimer(null)
    }

    try {
      await supabase
        .from('class_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', activeLiveSession.id)

      setActiveLiveSession(null)
      setLiveStudentsProgress([])
      await loadData()
    } catch (e) {
      console.error(e)
    }
  }

  // Export class report as mock CSV
  const handleExportCSV = () => {
    if (!activeLiveSession) return
    const headers = 'Nom,Email,Module,Statut,Corrects,Incorrects,Progres%\n'
    const rows = liveStudentsProgress.map(s => {
      const studentEmail = students.find(stud => stud.user_id === s.id)?.user.email || ''
      return `"${s.name}","${studentEmail}","${activeLiveSession.module}","${s.status}",${s.correctCount},${s.wrongCount},${s.progress}`
    }).join('\n')
    
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `rapport_classe_${activeLiveSession.module.toLowerCase()}_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Filter students based on search query and role
  const filteredStudents = students.filter(s => {
    const query = searchQuery.toLowerCase()
    const matchesQuery = s.user?.full_name?.toLowerCase().includes(query) || s.user?.email?.toLowerCase().includes(query)
    const isStudent = s.user?.role === 'user' || !s.user?.role
    return matchesQuery && isStudent
  })

  // Calculate averages
  const avgXP = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + (s.user?.xp_points || 0), 0) / students.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none">
          ← Retour au tableau de bord
        </Link>
        
        {/* Header Block */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏫</span>
              <h1 className="text-2xl font-extrabold text-[#1B3A6B]">{institution?.name || "Espace Partenaire Établissement"}</h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Tableau de bord Enseignant · Pays : <strong>{institution?.country}</strong> · Formule : <strong>Licence Institutionnelle</strong>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm transition-colors"
            >
              📥 Importer des élèves
            </button>
            {!activeLiveSession ? (
              <button
                onClick={() => setIsLiveOpen(true)}
                className="px-4 py-2.5 bg-[#1B3A6B] hover:bg-[#152e56] text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-1.5"
              >
                <span>⚡ Lancer un Live</span>
              </button>
            ) : (
              <button
                onClick={handleEndLiveClassroom}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-1.5"
              >
                <span>⏹️ Arrêter le Live</span>
              </button>
            )}
          </div>
        </div>

        {/* KPIs Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Élèves enregistrés</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{students.length}</span>
              <span className="text-xs text-gray-500">/ {institution?.max_students || 150} max</span>
            </div>
            <div className="mt-3 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#1B3A6B] h-full transition-all" 
                style={{ width: `${(students.length / (institution?.max_students || 150)) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Maîtrise Moyenne</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">76%</span>
              <span className="text-xs text-emerald-600 font-bold">Niveau C1+</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Moyenne pondérée des sessions CO/CE</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Points d'XP Moyens</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1B3A6B]">{avgXP}</span>
              <span className="text-xs text-gray-500">points / élève</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Indicateur d'activité hebdomadaire</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Statut Live Classroom</span>
            <div className="mt-2 flex items-center gap-2">
              {activeLiveSession ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-base font-extrabold text-red-600 uppercase tracking-wide">
                    Live ({activeLiveSession.module})
                  </span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  <span className="text-base font-extrabold text-gray-500 uppercase tracking-wide">
                    Aucun Live actif
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-2.5">
              {activeLiveSession ? "Session en cours avec la classe" : "Prêt à projeter un examen"}
            </p>
            {classSessions.length > 0 && (
              <p className="text-[10px] text-gray-400 mt-1">
                Simulations terminées : {classSessions.filter(s => s.status === 'completed').length}
              </p>
            )}
          </div>
        </div>

        {/* Live Classroom Screen - Active State */}
        {activeLiveSession && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="inline-block bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full mb-1">
                  🔴 Session collective en direct
                </span>
                <h2 className="text-xl font-extrabold">
                  Suivi Temps Réel — Épreuve {activeLiveSession.module} ({activeLiveSession.module === 'SIMULATION' ? 'Examen complet' : 'QCM'})
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  📊 Exporter les scores (CSV)
                </button>
                <button
                  onClick={handleEndLiveClassroom}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors"
                >
                  Terminer l'examen
                </button>
              </div>
            </div>

            {/* Students Progress Tracker Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStudentsProgress.map(student => (
                <div key={student.id} className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-slate-100">{student.name}</p>
                      <p className="text-slate-400 text-xs">Question active : {student.currentQuestion}</p>
                    </div>
                    {student.status === 'completed' ? (
                      <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded font-bold">
                        Fini
                      </span>
                    ) : (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-bold animate-pulse">
                        En cours
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Complété</span>
                      <span>{student.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-400 h-full transition-all duration-300"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick stats answers */}
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-green-400 font-semibold">✓ {student.correctCount} corrects</span>
                    <span className="text-red-400 font-semibold">✗ {student.wrongCount} fautes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Roster Section */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Roster des candidats enregistrés</h2>
              <p className="text-xs text-gray-500">Gérez vos étudiants et analysez leur niveau estimé avant examen.</p>
            </div>
            
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="🔍 Rechercher un élève..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white text-gray-900"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              {searchQuery ? "Aucun étudiant ne correspond à cette recherche." : "Aucun étudiant rattaché. Importez des adresses emails pour les inviter."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-xs tracking-wider select-none">
                    <th className="p-4">Candidat</th>
                    <th className="p-4">Niveau NCLC estimé</th>
                    <th className="p-4">XP Total</th>
                    <th className="p-4">Assiduité (Streak)</th>
                    <th className="p-4">Date d'adhésion</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-gray-900">{student.user?.full_name}</p>
                          <p className="text-gray-400 text-xs">{student.user?.email}</p>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                          NCLC {student.user?.level_assessed === 'C2' ? '10-12' : student.user?.level_assessed === 'C1' ? '8-9' : '6-7'}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-700">
                        {student.user?.xp_points || 0} XP
                      </td>
                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        🔥 {student.user?.streak_days || 0} jours consécutifs
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {new Date(student.joined_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs p-1"
                          title="Retirer de l'institution"
                        >
                          Désassocier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Bulk Import */}
        {isImportOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border shadow-2xl space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-950">Importer des élèves en masse</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Copiez-collez des adresses emails d'élèves (une par ligne) ou au format CSV `Nom,Email`.
                </p>
              </div>

              {importError && (
                <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-xs font-semibold text-center">
                  {importError}
                </div>
              )}

              <textarea
                rows={6}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Exemple :&#10;Mamadou Cissé,mamadou@gmail.com&#10;aminata@yahoo.fr&#10;Pierre Dupont,pierre@outlook.com"
                className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setIsImportOpen(false); setImportError(null) }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-4 py-2.5 bg-[#1B3A6B] hover:bg-[#152e56] text-white rounded-xl font-bold text-xs transition-colors"
                >
                  Lancer l'importation 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Start Live Classroom */}
        {isLiveOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border shadow-2xl space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-950">Lancer un Live Classroom</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Projetez une épreuve d'examen. Tous les élèves pourront s'y connecter de manière synchronisée.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Choisir le module</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CO', 'CE', 'SIMULATION'] as const).map(mod => (
                    <button
                      key={mod}
                      onClick={() => setLiveModule(mod)}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition-colors ${
                        liveModule === mod
                          ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                          : 'border-gray-200 text-gray-600 hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setIsLiveOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStartLiveClassroom}
                  className="px-4 py-2 bg-[#1B3A6B] hover:bg-[#152e56] text-white rounded-xl font-bold text-xs transition-colors"
                >
                  Lancer l'épreuve 🚀
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
