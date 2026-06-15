import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'

interface QuestionForm {
  id?: string
  module: 'CO' | 'CE' | 'EE' | 'EO'
  test_type: 'TCF_CANADA' | 'TEF_CANADA' | 'BOTH'
  level: 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  question_text: string
  audio_url?: string
  passage_text?: string
  options?: Record<string, string>
  correct_answer?: string
  model_answer?: string
  explanation: string
  theme: string
  difficulty_score: number
  is_active: boolean
  is_premium: boolean
  published_month?: string
  is_topical?: boolean
  topical_badge?: string
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    module: 'ALL',
    level: 'ALL',
    test_type: 'ALL',
    onlyTopical: 'ALL'
  })

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionForm | null>(null)
  
  // Form states
  const [formState, setFormState] = useState<QuestionForm>({
    module: 'CO',
    test_type: 'TCF_CANADA',
    level: 'B2',
    question_text: '',
    audio_url: '',
    passage_text: '',
    options: { A: '', B: '', C: '', D: '' },
    correct_answer: 'A',
    model_answer: '',
    explanation: '',
    theme: '',
    difficulty_score: 5,
    is_active: true,
    is_premium: false,
    published_month: '',
    is_topical: false,
    topical_badge: ''
  })

  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('questions').select('*')
      if (data && !error) {
        setQuestions(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette question ?")) return
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id)
      if (!error) {
        loadQuestions()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleEditOpen = (question: any /* TODO: FIX */) => {
    setEditingQuestion(question)
    setFormState({
      id: question.id,
      module: question.module,
      test_type: question.test_type,
      level: question.level,
      question_text: question.question_text,
      audio_url: question.audio_url || '',
      passage_text: question.passage_text || '',
      options: question.options || { A: '', B: '', C: '', D: '' },
      correct_answer: question.correct_answer || 'A',
      model_answer: question.model_answer || '',
      explanation: question.explanation || '',
      theme: question.theme || '',
      difficulty_score: question.difficulty_score || 5,
      is_active: question.is_active !== false,
      is_premium: question.is_premium === true,
      published_month: question.published_month || '',
      is_topical: question.is_topical === true,
      topical_badge: question.topical_badge || ''
    })
    setShowModal(true)
  }

  const handleCreateOpen = () => {
    setEditingQuestion(null)
    setFormState({
      module: 'CO',
      test_type: 'TCF_CANADA',
      level: 'B2',
      question_text: '',
      audio_url: '',
      passage_text: '',
      options: { A: '', B: '', C: '', D: '' },
      correct_answer: 'A',
      model_answer: '',
      explanation: '',
      theme: '',
      difficulty_score: 5,
      is_active: true,
      is_premium: false,
      published_month: new Date().toISOString().substring(0, 7),
      is_topical: false,
      topical_badge: ''
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation
    if (formState.question_text.length < 10) {
      alert("La question doit faire au moins 10 caractères.")
      return
    }

    try {
      if (editingQuestion?.id) {
        // Update
        const { error } = await supabase
          .from('questions')
          .update(formState)
          .eq('id', editingQuestion.id)
        if (!error) {
          setShowModal(false)
          loadQuestions()
        }
      } else {
        // Insert
        const { error } = await supabase
          .from('questions')
          .insert(formState)
        if (!error) {
          setShowModal(false)
          loadQuestions()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Filtered list
  const filteredQuestions = questions.filter(q => {
    if (filters.module !== 'ALL' && q.module !== filters.module) return false
    if (filters.level !== 'ALL' && q.level !== filters.level) return false
    if (filters.test_type !== 'ALL' && q.test_type !== filters.test_type && q.test_type !== 'BOTH') return false
    if (filters.onlyTopical === 'YES' && !q.is_topical) return false
    if (filters.onlyTopical === 'NO' && q.is_topical) return false
    return true
  })

  // Distribution chart computation
  const getDistributionData = () => {
    const levels = ['A2', 'B1', 'B2', 'C1', 'C2']
    return levels.map(lvl => {
      const count = questions.filter(q => q.level === lvl).length
      return { level: lvl, count }
    })
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

  const isQcm = formState.module === 'CO' || formState.module === 'CE'

  return (
    <div className="space-y-8 select-text">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">
            Banque de <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-slate-550 font-medium mt-1.5">
            Créez, éditez et organisez le matériel d'examen pédagogique.
          </p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 active:scale-95 flex items-center gap-2"
        >
          <span>+ Nouvelle Question</span>
        </button>
      </div>

      {/* Grid distribution chart & statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Filters and questions list */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Filter Module */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Module</label>
              <select
                value={filters.module}
                onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                className="px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-xs text-slate-600 font-bold bg-white transition-all hover:bg-slate-50 cursor-pointer"
              >
                <option value="ALL">Tous les modules</option>
                <option value="CO">Compréhension Orale (CO)</option>
                <option value="CE">Compréhension Écrits (CE)</option>
                <option value="EE">Expression Écrite (EE)</option>
                <option value="EO">Expression Orale (EO)</option>
              </select>
            </div>

            {/* Filter Level */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Niveau</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-xs text-slate-600 font-bold bg-white transition-all hover:bg-slate-50 cursor-pointer"
              >
                <option value="ALL">Tous les niveaux</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>

            {/* Filter Test Type */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Examen</label>
              <select
                value={filters.test_type}
                onChange={(e) => setFilters({ ...filters, test_type: e.target.value })}
                className="px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-xs text-slate-600 font-bold bg-white transition-all hover:bg-slate-50 cursor-pointer"
              >
                <option value="ALL">Tous les tests</option>
                <option value="TCF_CANADA">TCF Canada</option>
                <option value="TEF_CANADA">TEF Canada</option>
              </select>
            </div>

            {/* Filter Topical */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Actualités</label>
              <select
                value={filters.onlyTopical}
                onChange={(e) => setFilters({ ...filters, onlyTopical: e.target.value })}
                className="px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-xs text-slate-600 font-bold bg-white transition-all hover:bg-slate-50 cursor-pointer"
              >
                <option value="ALL">Tous les sujets</option>
                <option value="YES">Sujets d'actualité uniquement</option>
                <option value="NO">Sujets réguliers uniquement</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-450 text-[11px] uppercase font-black tracking-wider">
                  <th className="py-3">Question / Sujet</th>
                  <th className="py-3">Module</th>
                  <th className="py-3">Niveau</th>
                  <th className="py-3">Thème</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-slate-700">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 max-w-[240px] pr-4 font-bold text-slate-800" title={q.question_text}>
                      <div className="flex flex-col gap-1">
                        <span className="truncate">{q.question_text}</span>
                        {q.is_topical && (
                          <span className="inline-flex w-fit items-center text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200/40">
                            🔥 {q.topical_badge || `Nouveau · ${q.published_month || ''}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="font-extrabold text-[10px] bg-blue-50 text-blue-700 border border-blue-200/40 px-2.5 py-0.5 rounded uppercase">
                        {q.module}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-extrabold text-[10px] bg-orange-50 text-orange-700 border border-orange-200/40 px-2 py-0.5 rounded uppercase">
                        {q.level}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-slate-500 font-semibold max-w-[120px] truncate">{q.theme}</td>
                    <td className="py-3.5 text-right space-x-2.5 select-none">
                      <button
                        onClick={() => handleEditOpen(q)}
                        className="text-xs text-blue-600 font-bold hover:text-indigo-650 transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-xs text-red-650 font-bold hover:text-red-800 transition-colors"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredQuestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold italic">
                      Aucune question correspondante.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Balancing Chart */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-lg text-slate-800 font-display">📊 Équilibre de la Banque</h3>
            <p className="text-xs text-slate-450 font-medium">Distribution des questions par niveau d'évaluation CECRL</p>
          </div>
          
          <div className="h-[240px] w-full bg-slate-50/50 p-2 rounded-2xl border border-slate-100/40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDistributionData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="level" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                <Bar dataKey="count" fill="url(#blueIndigoGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="blueIndigoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed space-y-1.5">
            <strong className="text-blue-800 font-bold block">Recommandations d'équilibrage :</strong>
            <p className="font-medium text-slate-500">Assurez-vous de charger un volume suffisant de questions de niveau B2 et C1, qui représentent 80% des demandes de test d'immigration canadienne.</p>
          </div>
        </div>
      </div>

      {/* CRUD Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 transition-all">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1B3A6B] to-indigo-700 p-6 text-white flex justify-between items-center select-none">
              <h3 className="font-black text-lg tracking-tight font-display">
                {editingQuestion ? "Modifier la Question" : "Ajouter une Nouvelle Question"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:opacity-80 text-2xl font-light transition-opacity">×</button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Module */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Module</label>
                  <select
                    value={formState.module}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormState({ ...formState, module: e.target.value as 'CO' | 'CE' | 'EE' | 'EO' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-semibold transition-all bg-slate-50/30 focus:bg-white"
                  >
                    <option value="CO">Oral (CO)</option>
                    <option value="CE">Écrits (CE)</option>
                    <option value="EE">Écrite (EE)</option>
                    <option value="EO">Orale (EO)</option>
                  </select>
                </div>

                {/* Level */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Niveau</label>
                  <select
                    value={formState.level}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormState({ ...formState, level: e.target.value as 'A2' | 'B1' | 'B2' | 'C1' | 'C2' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-semibold transition-all bg-slate-50/30 focus:bg-white"
                  >
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>

                {/* Test type */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Test</label>
                  <select
                    value={formState.test_type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormState({ ...formState, test_type: e.target.value as 'TCF_CANADA' | 'TEF_CANADA' | 'BOTH' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-semibold transition-all bg-slate-50/30 focus:bg-white"
                  >
                    <option value="TCF_CANADA">TCF Canada</option>
                    <option value="TEF_CANADA">TEF Canada</option>
                    <option value="BOTH">Les deux (BOTH)</option>
                  </select>
                </div>
              </div>

              {/* Theme & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thème Pédagogique</label>
                  <input
                    type="text"
                    value={formState.theme}
                    onChange={(e) => setFormState({ ...formState, theme: e.target.value })}
                    required
                    placeholder="ex: Travail et emploi"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-semibold transition-all bg-slate-50/30 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Difficulté (1 à 10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formState.difficulty_score}
                    onChange={(e) => setFormState({ ...formState, difficulty_score: parseInt(e.target.value) || 5 })}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-semibold transition-all bg-slate-50/30 focus:bg-white"
                  />
                </div>
              </div>

              {/* Topical / News Details */}
              <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
                <span className="block text-xs font-black text-blue-800 uppercase tracking-wider mb-1">📅 Actualités &amp; Fraîcheur</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mois de Publication (AAAA-MM)</label>
                    <input
                      type="text"
                      pattern="^[0-9]{4}-[0-9]{2}$"
                      value={formState.published_month}
                      onChange={(e) => setFormState({ ...formState, published_month: e.target.value })}
                      placeholder="ex: 2026-05"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-semibold transition-all bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Badge d'Actualité</label>
                    <input
                      type="text"
                      value={formState.topical_badge}
                      onChange={(e) => setFormState({ ...formState, topical_badge: e.target.value })}
                      placeholder="ex: Nouveau · Mai 2026"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-semibold transition-all bg-white"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formState.is_topical}
                    onChange={(e) => setFormState({ ...formState, is_topical: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-650 uppercase tracking-wide">Marquer comme sujet d'actualité</span>
                </label>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Texte de la Question / Consigne</label>
                <textarea
                  value={formState.question_text}
                  onChange={(e) => setFormState({ ...formState, question_text: e.target.value })}
                  required
                  rows={2}
                  placeholder="Décrivez précisément la question ou le sujet..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-medium transition-all bg-slate-50/30 focus:bg-white"
                />
              </div>

              {/* Specific inputs for CO (Audio) */}
              {formState.module === 'CO' && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">URL du fichier Audio (MP3)</label>
                  <input
                    type="url"
                    value={formState.audio_url}
                    onChange={(e) => setFormState({ ...formState, audio_url: e.target.value })}
                    placeholder="https://example.com/audio.mp3"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-semibold transition-all bg-slate-50/30 focus:bg-white"
                  />
                </div>
              )}

              {/* Specific inputs for CE (Passage Text) */}
              {formState.module === 'CE' && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Texte de passage (Lecture)</label>
                  <textarea
                    value={formState.passage_text}
                    onChange={(e) => setFormState({ ...formState, passage_text: e.target.value })}
                    rows={4}
                    placeholder="Saisissez le texte d'actualité ou administratif à lire..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-medium transition-all bg-slate-50/30 focus:bg-white"
                  />
                </div>
              )}

              {/* QCM Choices (A, B, C, D) */}
              {isQcm && (
                <div className="space-y-3.5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="block text-xs font-black text-blue-800 uppercase tracking-wider mb-1">Options de Réponse (QCM)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-450">{opt}</span>
                        <input
                          type="text"
                          value={formState.options?.[opt] || ''}
                          onChange={(e) => {
                            const opts = { ...formState.options }
                            opts[opt] = e.target.value
                            setFormState({ ...formState, options: opts })
                          }}
                          required={isQcm}
                          placeholder={`Option ${opt}`}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 mt-3">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bonne Réponse</label>
                    <select
                      value={formState.correct_answer}
                      onChange={(e) => setFormState({ ...formState, correct_answer: e.target.value })}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-750 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Model Answer (EE/EO) */}
              {!isQcm && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proposition de Corrigé Type (C2)</label>
                  <textarea
                    value={formState.model_answer}
                    onChange={(e) => setFormState({ ...formState, model_answer: e.target.value })}
                    rows={4}
                    placeholder="Rédigez la réponse idéale attendue pour guider les candidats ou enrichir la correction..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-medium transition-all bg-slate-50/30 focus:bg-white"
                  />
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Explication Pédagogique</label>
                <textarea
                  value={formState.explanation}
                  onChange={(e) => setFormState({ ...formState, explanation: e.target.value })}
                  required
                  rows={2}
                  placeholder="Expliquez pourquoi la réponse est correcte..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 font-medium transition-all bg-slate-50/30 focus:bg-white"
                />
              </div>

              {/* Switches */}
              <div className="flex gap-6 select-none pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_active}
                    onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-650 uppercase tracking-wide">Actif (is_active)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_premium}
                    onChange={(e) => setFormState({ ...formState, is_premium: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-650 uppercase tracking-wide">Premium</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 p-6 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white font-bold rounded-xl shadow-md shadow-indigo-500/10 active:scale-95 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
