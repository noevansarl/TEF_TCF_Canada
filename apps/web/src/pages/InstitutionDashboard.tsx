import { useState, useEffect, useRef } from 'react'
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
  const realtimeChannelRef = useRef<any>(null)

  // LMS Integration states
  const [activeTab, setActiveTab] = useState<'students' | 'lms'>('students')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [ltiEnabled, setLtiEnabled] = useState(false)
  const [consumerKey, setConsumerKey] = useState('')
  const [sharedSecret, setSharedSecret] = useState('')

  // Handle LTI Activation
  const handleToggleLti = async (enabled: boolean) => {
    if (!institution) return
    try {
      let key = consumerKey
      let secret = sharedSecret
      if (enabled && (!key || !secret)) {
        key = `key-${institution.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`
        secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      }

      const { error } = await supabase
        .from('institutions')
        .update({
          lti_enabled: enabled,
          lti_consumer_key: enabled ? key : null,
          lti_shared_secret: enabled ? secret : null
        })
        .eq('id', institution.id)

      if (!error) {
        setLtiEnabled(enabled)
        setConsumerKey(enabled ? key : '')
        setSharedSecret(enabled ? secret : '')
        setInstitution({
          ...institution,
          lti_enabled: enabled,
          lti_consumer_key: enabled ? key : null,
          lti_shared_secret: enabled ? secret : null
        })
      } else {
        alert("Erreur lors de la mise à jour LTI: " + error.message)
      }
    } catch (e: any) {
      alert("Erreur: " + e.message)
    }
  }

  // Regenerate LTI Credentials
  const handleRegenerateLtiKeys = async () => {
    if (!institution) return
    if (!confirm("Voulez-vous vraiment régénérer les clés LTI ? Les connexions LMS existantes cesseront de fonctionner jusqu'à leur mise à jour dans Moodle.")) return
    const key = `key-${institution.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    try {
      const { error } = await supabase
        .from('institutions')
        .update({
          lti_consumer_key: key,
          lti_shared_secret: secret
        })
        .eq('id', institution.id)

      if (!error) {
        setConsumerKey(key)
        setSharedSecret(secret)
        setInstitution({
          ...institution,
          lti_consumer_key: key,
          lti_shared_secret: secret
        })
        alert("Clés LTI régénérées avec succès !")
      }
    } catch (e: any) {
      alert("Erreur: " + e.message)
    }
  }

  // Initialize live students
  const initializeLiveStudents = (studentList: any[]) => {
    const list = studentList.map((s, idx) => ({
      id: s.user_id,
      name: s.user?.full_name || `Étudiant ${idx + 1}`,
      progress: 0,
      correctCount: 0,
      wrongCount: 0,
      currentQuestion: 1,
      status: 'active',
      isReal: false
    }))
    setLiveStudentsProgress(list)
  }

  // Start realtime subscription for live classroom progress
  const startLiveClassroomPolling = (sessionId: string, moduleType: 'CO' | 'CE' | 'SIMULATION', studentList: any[]) => {
    if (simulationTimer) clearInterval(simulationTimer)
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current)
      realtimeChannelRef.current = null
    }

    initializeLiveStudents(studentList)

    // 1. Update simulated progress for mock accounts (Interval only updates mock students)
    const timer = setInterval(() => {
      setLiveStudentsProgress(prev => {
        const maxQ = moduleType === 'CO' ? 39 : moduleType === 'CE' ? 39 : 10
        return prev.map((s: any) => {
          if (s.isReal) return s
          if (s.progress >= 100) return s
          
          const isAnswering = Math.random() > 0.45
          if (!isAnswering) return s

          const nextQ = Math.min(s.currentQuestion + 1, maxQ)
          const wasCorrect = Math.random() > 0.35
          return {
            ...s,
            currentQuestion: nextQ,
            progress: Math.min(Math.round((nextQ / maxQ) * 100), 100),
            correctCount: s.correctCount + (wasCorrect ? 1 : 0),
            wrongCount: s.wrongCount + (wasCorrect ? 0 : 1),
            status: nextQ === maxQ ? 'completed' : 'active'
          }
        })
      })
    }, 4000)

    setSimulationTimer(timer)

    // Helper to fetch real student progression from DB
    const fetchRealProgress = async () => {
      try {
        const { data: realSessions } = await supabase
          .from('sessions')
          .select('id, user_id, status, total_questions')
          .eq('metadata->>class_session_id', sessionId)

        if (realSessions && realSessions.length > 0) {
          const sessionIds = realSessions.map((s: any) => s.id)
          const { data: realAnswers } = await supabase
            .from('answers')
            .select('session_id, is_correct')
            .in('session_id', sessionIds)

          const answersMap: Record<string, { correct: number, wrong: number, total: number }> = {}
          sessionIds.forEach((sid: string) => {
            answersMap[sid] = { correct: 0, wrong: 0, total: 0 }
          })

          realAnswers?.forEach((ans: any) => {
            if (answersMap[ans.session_id]) {
              answersMap[ans.session_id].total += 1
              if (ans.is_correct === true) {
                answersMap[ans.session_id].correct += 1
              } else if (ans.is_correct === false) {
                answersMap[ans.session_id].wrong += 1
              }
            }
          })

          setLiveStudentsProgress(prev => {
            return prev.map(s => {
              const rSession = realSessions.find((rs: any) => rs.user_id === s.id)
              if (!rSession) return s

              const stats = answersMap[rSession.id] || { correct: 0, wrong: 0, total: 0 }
              const maxQ = rSession.total_questions || (moduleType === 'CO' ? 39 : 39)

              return {
                ...s,
                isReal: true,
                currentQuestion: stats.total + 1,
                progress: Math.min(Math.round((stats.total / maxQ) * 100), 100),
                correctCount: stats.correct,
                wrongCount: stats.wrong,
                status: rSession.status === 'completed' || stats.total >= maxQ ? 'completed' : 'active'
              }
            })
          })
        }
      } catch (err) {
        console.error('Error fetching live progress:', err)
      }
    }

    // Load initial real progress
    fetchRealProgress()

    // 2. Set up Supabase Realtime channel to listen to changes on sessions and answers
    const channel = supabase
      .channel(`classroom-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload: any) => {
          const newSession = payload.new as any
          const oldSession = payload.old as any
          const targetSession = newSession || oldSession
          if (targetSession && targetSession.metadata?.class_session_id === sessionId) {
            fetchRealProgress()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'answers' },
        () => {
          fetchRealProgress()
        }
      )
      .subscribe()

    realtimeChannelRef.current = channel
  }

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
        setLtiEnabled(instData.lti_enabled || false)
        setConsumerKey(instData.lti_consumer_key || '')
        setSharedSecret(instData.lti_shared_secret || '')

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
            startLiveClassroomPolling(active.id, active.module, studs || [])
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
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [user])

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

  // Start Live Classroom
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
        setIsLiveOpen(false)
        startLiveClassroomPolling(data.id, liveModule, students)
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
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current)
      realtimeChannelRef.current = null
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

  // Export class report as CSV
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
      <div className="flex items-center justify-center p-24 select-none">
        <svg className="animate-spin w-10 h-10 text-indigo-650" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  // Filter students based on search query
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
    <div className="py-8 px-4 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:text-indigo-650 font-bold transition-colors select-none">
          ← Retour au tableau de bord
        </Link>
        
        {/* Header Block */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl select-none">🏫</span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">{institution?.name || "Espace Partenaire Établissement"}</h1>
            </div>
            <p className="text-slate-550 text-sm mt-1">
              Tableau de bord Enseignant · Pays : <strong>{institution?.country}</strong> · Formule : <strong>Licence Institutionnelle</strong>
            </p>
          </div>
          <div className="flex gap-2.5 select-none">
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-4.5 py-2.5 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
            >
              📥 Importer des élèves
            </button>
            {!activeLiveSession ? (
              <button
                onClick={() => setIsLiveOpen(true)}
                className="px-4.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/10 active:scale-95 flex items-center gap-1.5"
              >
                <span>⚡ Lancer un Live</span>
              </button>
            ) : (
              <button
                onClick={handleEndLiveClassroom}
                className="px-4.5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-red-500/10 active:scale-95 flex items-center gap-1.5"
              >
                <span>Arrêter le Live</span>
              </button>
            )}
          </div>
        </div>

        {/* KPIs Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none relative z-10">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Élèves enregistrés</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 font-display">{students.length}</span>
              <span className="text-xs text-slate-400 font-bold">/ {institution?.max_students || 150} max</span>
            </div>
            <div className="mt-3.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all" 
                style={{ width: `${(students.length / (institution?.max_students || 150)) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Maîtrise Moyenne</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 font-display">76%</span>
              <span className="text-xs text-emerald-600 font-bold">Niveau C1+</span>
            </div>
            <p className="text-[10px] text-slate-450 font-medium mt-3">Moyenne pondérée des sessions CO/CE</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Points d'XP Moyens</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 font-display">{avgXP}</span>
              <span className="text-xs text-slate-450 font-bold">points / élève</span>
            </div>
            <p className="text-[10px] text-slate-450 font-medium mt-3">Indicateur d'activité hebdomadaire</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Statut Live Classroom</span>
            <div className="mt-2 flex items-center gap-2">
              {activeLiveSession ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-lg font-black text-red-600 uppercase tracking-wide font-display">
                    Live ({activeLiveSession.module})
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-lg font-black text-slate-450 uppercase tracking-wide font-display">
                    Aucun Live actif
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-450 font-medium mt-3">
              {activeLiveSession ? "Session en cours avec la classe" : "Prêt à projeter un examen"}
            </p>
            {classSessions.length > 0 && (
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Simulations terminées : {classSessions.filter(s => s.status === 'completed').length}
              </p>
            )}
          </div>
        </div>

        {/* Live Classroom Screen - Active State */}
        {activeLiveSession && (
          <div className="bg-slate-955 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6 relative z-10" style={{ backgroundColor: '#090d16' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="inline-block bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-1">
                  🔴 Session collective en direct
                </span>
                <h2 className="text-xl font-extrabold tracking-tight font-display">
                  Suivi Temps Réel — Épreuve {activeLiveSession.module} ({activeLiveSession.module === 'SIMULATION' ? 'Examen complet' : 'QCM'})
                </h2>
              </div>
              <div className="flex gap-2.5 select-none">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  📊 Exporter les scores (CSV)
                </button>
                <button
                  onClick={handleEndLiveClassroom}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-red-500/10 active:scale-95"
                >
                  Terminer l'examen
                </button>
              </div>
            </div>

            {/* Students Progress Tracker Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStudentsProgress.map(student => (
                <div key={student.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-slate-100">{student.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {student.isReal ? `Enregistré (Q. ${student.currentQuestion})` : `Simulé (Q. ${student.currentQuestion})`}
                      </p>
                    </div>
                    {student.status === 'completed' ? (
                      <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded font-bold uppercase">
                        Fini
                      </span>
                    ) : (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-bold animate-pulse uppercase">
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
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick stats answers */}
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-green-400 font-bold">✓ {student.correctCount} corrects</span>
                    <span className="text-red-400 font-bold">✗ {student.wrongCount} fautes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200/60 select-none gap-2 relative z-10">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 font-extrabold text-sm border-b-2 transition-all ${
              activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            📋 Liste des candidats ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('lms')}
            className={`px-6 py-3 font-extrabold text-sm border-b-2 transition-all ${
              activeTab === 'lms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            🔌 Intégration LMS (Moodle LTI)
          </button>
        </div>

        {/* Tab Panel: Student Roster */}
        {activeTab === 'students' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm relative z-10">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">Roster des candidats enregistrés</h2>
                <p className="text-xs text-slate-455 font-medium mt-0.5">Gérez vos étudiants et analysez leur niveau estimé avant examen.</p>
              </div>
              
              {/* Search Input */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Rechercher un élève..."
                  className="w-full border border-slate-205 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all bg-white text-slate-800"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-semibold italic text-sm">
                {searchQuery ? "Aucun étudiant ne correspond à cette recherche." : "Aucun étudiant rattaché. Importez des adresses emails pour les inviter."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100/60 font-black text-slate-450 text-[11px] uppercase tracking-wider select-none">
                      <th className="p-4">Candidat</th>
                      <th className="p-4">Niveau NCLC estimé</th>
                      <th className="p-4">XP Total</th>
                      <th className="p-4">Assiduité (Streak)</th>
                      <th className="p-4">Date d'adhésion</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 text-slate-700">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{student.user?.full_name}</p>
                            <p className="text-slate-400 text-xs font-semibold mt-0.5">{student.user?.email}</p>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/40 rounded-lg">
                            NCLC {student.user?.level_assessed === 'C2' ? '10-12' : student.user?.level_assessed === 'C1' ? '8-9' : '6-7'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {student.user?.xp_points || 0} XP
                        </td>
                        <td className="p-4 text-slate-550 font-semibold whitespace-nowrap">
                          🔥 {student.user?.streak_days || 0} jours consécutifs
                        </td>
                        <td className="p-4 text-slate-400 text-xs font-medium">
                          {new Date(student.joined_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 text-center select-none">
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-500 hover:text-red-700 font-black text-xs hover:underline p-1"
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
        )}

        {/* Tab Panel: LMS / LTI Integration */}
        {activeTab === 'lms' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-6 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 select-none">
              <div>
                <h2 className="text-xl font-extrabold text-[#1B3A6B] tracking-tight font-display">Configuration LTI (Moodle / Canvas)</h2>
                <p className="text-xs text-slate-450 font-medium mt-1">Connectez votre LMS d'établissement pour synchroniser les inscriptions et les notes automatiquement.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-black px-3 py-1 rounded-full border uppercase ${ltiEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-250/50' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  {ltiEnabled ? 'Actif' : 'Inactif'}
                </span>
                <button
                  onClick={() => handleToggleLti(!ltiEnabled)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    ltiEnabled 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60' 
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md shadow-green-500/10'
                  }`}
                >
                  {ltiEnabled ? 'Désactiver' : 'Activer LTI'}
                </button>
              </div>
            </div>

            {ltiEnabled ? (
              <div className="space-y-6">
                {/* Credentials list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'URL de lancement (Launch URL)', value: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lti-launch`, field: 'launch' },
                    { label: 'Clé client (Consumer Key)', value: consumerKey, field: 'key' },
                    { label: 'Code secret (Shared Secret)', value: sharedSecret, field: 'secret' },
                  ].map(item => (
                    <div key={item.field} className="bg-slate-55/40 rounded-2xl border border-slate-200/60 p-4 relative">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={item.value}
                          className="bg-transparent border-none outline-none text-xs text-slate-800 font-mono w-full select-all font-bold"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.value);
                            setCopiedField(item.field);
                            setTimeout(() => setCopiedField(null), 2000);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                          title="Copier"
                        >
                          {copiedField === item.field ? (
                            <span className="text-[10px] text-green-600 font-black whitespace-nowrap">Copié !</span>
                          ) : (
                            <svg className="w-4 h-4 text-slate-400 hover:text-slate-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end select-none">
                  <button
                    onClick={handleRegenerateLtiKeys}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl font-bold text-xs transition-colors bg-white shadow-sm"
                  >
                    🔄 Régénérer les identifiants LTI
                  </button>
                </div>

                {/* Setup Guide */}
                <div className="bg-blue-50/50 border border-blue-150/40 rounded-2xl p-6 space-y-4">
                  <h3 className="font-extrabold text-sm text-blue-800 flex items-center gap-1.5 select-none">
                    <span>📖</span> Guide d'intégration Moodle (LTI 1.1)
                  </h3>
                  <ol className="text-xs text-slate-600 space-y-3 list-decimal list-inside leading-relaxed font-medium">
                    <li>Connectez-vous à votre espace <strong>Moodle</strong> en tant qu'enseignant ou administrateur.</li>
                    <li>Accédez à votre cours, activez le mode édition et cliquez sur <strong>Ajouter une activité ou une ressource</strong>.</li>
                    <li>Sélectionnez <strong>Outil externe (External Tool)</strong>.</li>
                    <li>Renseignez le nom de l'outil (ex: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800 font-bold">ayePREP</code>).</li>
                    <li>Dans le champ <strong>URL de l'outil</strong>, collez l'URL de lancement ci-dessus.</li>
                    <li>Dans <strong>Clé client (Consumer Key)</strong> et <strong>Code secret (Shared Secret)</strong>, collez les clés générées ci-dessus.</li>
                    <li>
                      Dans l'onglet <strong>Paramètres personnalisés (Custom Parameters)</strong>, vous pouvez ajouter les configurations suivantes (une par ligne) :
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 font-mono text-[10px] text-slate-400 mt-2 space-y-1.5">
                        <p className="text-slate-400 font-medium"># Pour forcer un module spécifique (CO, CE, EE ou EO) :</p>
                        <p className="text-slate-800 font-bold">module=CO</p>
                        <p className="mt-1.5 text-slate-400 font-medium"># Pour forcer un niveau CECRL cible (B1, B2, C1, C2) :</p>
                        <p className="text-slate-800 font-bold">level=C1</p>
                      </div>
                    </li>
                    <li>Enregistrez. Les étudiants qui cliqueront sur ce lien seront automatiquement connectés et leurs résultats d'examen seront renvoyés directement dans le carnet de notes Moodle.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-500 select-none">
                <span className="text-3xl block mb-2">🔌</span>
                <p className="font-bold">L'intégration LTI est actuellement désactivée.</p>
                <p className="text-xs text-slate-400 mt-1">Activez-la pour connecter votre plateforme pédagogique et automatiser le suivi des examens.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal: Bulk Import */}
        {isImportOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 transition-all">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200/60 shadow-2xl space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-display">Importer des élèves en masse</h3>
                <p className="text-xs text-slate-455 font-medium mt-0.5">
                  Copiez-collez des adresses emails d'élèves (une par ligne) ou au format CSV `Nom,Email`.
                </p>
              </div>

              {importError && (
                <div className="bg-red-50 text-red-650 border border-red-100 p-3 rounded-xl text-xs font-bold text-center">
                  {importError}
                </div>
              )}

              <textarea
                rows={6}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Exemple :&#10;Mamadou Cissé,mamadou@gmail.com&#10;aminata@yahoo.fr&#10;Pierre Dupont,pierre@outlook.com"
                className="w-full border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl p-3.5 text-xs focus:outline-none text-slate-800 bg-white font-medium"
              />

              <div className="flex gap-2.5 justify-end select-none">
                <button
                  onClick={() => { setIsImportOpen(false); setImportError(null) }}
                  className="px-4.5 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-xs transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                >
                  Lancer l'importation 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Start Live Classroom */}
        {isLiveOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 transition-all">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200/60 shadow-2xl space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-display">Lancer un Live Classroom</h3>
                <p className="text-xs text-slate-455 font-medium mt-0.5">
                  Projetez une épreuve d'examen. Tous les élèves pourront s'y connecter de manière synchronisée.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">Choisir le module</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CO', 'CE', 'SIMULATION'] as const).map(mod => (
                    <button
                      key={mod}
                      onClick={() => setLiveModule(mod)}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        liveModule === mod
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-500 bg-white'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-2 select-none">
                <button
                  onClick={() => setIsLiveOpen(false)}
                  className="px-4.5 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-xs transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStartLiveClassroom}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10 active:scale-95"
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
