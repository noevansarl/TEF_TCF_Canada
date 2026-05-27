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

  const handleEditOpen = (question: any) => {
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
      <div className="flex items-center justify-center p-12">
        <svg className="animate-spin w-8 h-8 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  const isQcm = formState.module === 'CO' || formState.module === 'CE'

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 select-none">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Banque de Questions</h1>
          <p className="text-gray-500 mt-1">Créez et organisez le matériel d'examen pédagogique.</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="px-5 py-3 bg-[#C55A11] hover:bg-[#A84A0D] text-white rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <span>+ Nouvelle Question</span>
        </button>
      </div>

      {/* Grid distribution chart & statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Filters and questions list */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Filter Module */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Module</label>
              <select
                value={filters.module}
                onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                className="px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs text-gray-600 font-semibold"
              >
                <option value="ALL">Tous les modules</option>
                <option value="CO">Compréhension Oral (CO)</option>
                <option value="CE">Compréhension Écrits (CE)</option>
                <option value="EE">Expression Écrite (EE)</option>
                <option value="EO">Expression Orale (EO)</option>
              </select>
            </div>

            {/* Filter Level */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Niveau</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs text-gray-600 font-semibold"
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
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Examen</label>
              <select
                value={filters.test_type}
                onChange={(e) => setFilters({ ...filters, test_type: e.target.value })}
                className="px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs text-gray-600 font-semibold"
              >
                <option value="ALL">Tous les tests</option>
                <option value="TCF_CANADA">TCF Canada</option>
                <option value="TEF_CANADA">TEF Canada</option>
              </select>
            </div>

            {/* Filter Topical */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Actualités</label>
              <select
                value={filters.onlyTopical}
                onChange={(e) => setFilters({ ...filters, onlyTopical: e.target.value })}
                className="px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs text-gray-600 font-semibold"
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
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-extrabold">
                  <th className="py-3">Question / Sujet</th>
                  <th className="py-3">Module</th>
                  <th className="py-3">Niveau</th>
                  <th className="py-3">Thème</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50">
                    <td className="py-3 max-w-[240px] pr-4 font-medium text-gray-800" title={q.question_text}>
                      <div className="flex flex-col gap-1">
                        <span className="truncate">{q.question_text}</span>
                        {q.is_topical && (
                          <span className="inline-flex w-fit items-center text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                            🔥 {q.topical_badge || `Nouveau · ${q.published_month || ''}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded">
                        {q.module}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-extrabold text-[#C55A11] bg-[#C55A11]/5 px-2 py-0.5 rounded">
                        {q.level}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-500 max-w-[120px] truncate">{q.theme}</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => handleEditOpen(q)}
                        className="text-xs text-[#1B3A6B] font-bold hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-xs text-red-600 font-bold hover:underline"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredQuestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400 font-semibold italic">
                      Aucune question correspondante.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Balancing Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-gray-800">📊 Équilibre de la Banque</h3>
            <p className="text-xs text-gray-400">Distribution des questions par niveau d'évaluation CECRL</p>
          </div>
          
          <div className="h-[240px] w-full bg-gray-50/50 p-2 rounded-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDistributionData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="level" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }} />
                <Bar dataKey="count" fill="#1B3A6B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1B3A6B]/5 border border-[#1B3A6B]/15 p-4 rounded-xl text-xs text-gray-600 leading-relaxed space-y-1.5">
            <strong className="text-[#1B3A6B]">Recommandations d'équilibrage :</strong>
            <p>Assurez-vous de charger un volume suffisant de questions de niveau B2 et C1, qui représentent 80% des demandes de test d'immigration canadienne.</p>
          </div>
        </div>
      </div>

      {/* CRUD Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#1B3A6B] p-6 text-white flex justify-between items-center select-none">
              <h3 className="font-extrabold text-lg">
                {editingQuestion ? "Modifier la Question" : "Ajouter une Nouvelle Question"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:opacity-85 text-xl font-bold">×</button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Module */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Module</label>
                  <select
                    value={formState.module}
                    onChange={(e: any) => setFormState({ ...formState, module: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-gray-700"
                  >
                    <option value="CO">Oral (CO)</option>
                    <option value="CE">Écrits (CE)</option>
                    <option value="EE">Écrite (EE)</option>
                    <option value="EO">Orale (EO)</option>
                  </select>
                </div>

                {/* Level */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Niveau</label>
                  <select
                    value={formState.level}
                    onChange={(e: any) => setFormState({ ...formState, level: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-gray-700"
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
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Test</label>
                  <select
                    value={formState.test_type}
                    onChange={(e: any) => setFormState({ ...formState, test_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-gray-700"
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
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Thème Pédagogique</label>
                  <input
                    type="text"
                    value={formState.theme}
                    onChange={(e) => setFormState({ ...formState, theme: e.target.value })}
                    required
                    placeholder="ex: Travail et emploi"
                    className="w-full px-3 py-2 border rounded-xl text-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Difficulté (1 à 10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formState.difficulty_score}
                    onChange={(e) => setFormState({ ...formState, difficulty_score: parseInt(e.target.value) || 5 })}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-gray-700"
                  />
                </div>
              </div>

              {/* Topical / News Details */}
              <div className="p-4 bg-gray-50 border rounded-2xl space-y-4">
                <span className="block text-xs font-bold text-[#1B3A6B] uppercase mb-1">📅 Actualités &amp; Fraîcheur</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase">Mois de Publication (AAAA-MM)</label>
                    <input
                      type="text"
                      pattern="^[0-9]{4}-[0-9]{2}$"
                      value={formState.published_month}
                      onChange={(e) => setFormState({ ...formState, published_month: e.target.value })}
                      placeholder="ex: 2026-05"
                      className="w-full px-3 py-2 border rounded-xl text-gray-700 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase">Badge d'Actualité</label>
                    <input
                      type="text"
                      value={formState.topical_badge}
                      onChange={(e) => setFormState({ ...formState, topical_badge: e.target.value })}
                      placeholder="ex: Nouveau · Mai 2026"
                      className="w-full px-3 py-2 border rounded-xl text-gray-700 bg-white"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formState.is_topical}
                    onChange={(e) => setFormState({ ...formState, is_topical: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-gray-600 uppercase">Marquer comme sujet d'actualité (is_topical)</span>
                </label>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase">Texte de la Question / Consigne</label>
                <textarea
                  value={formState.question_text}
                  onChange={(e) => setFormState({ ...formState, question_text: e.target.value })}
                  required
                  rows={2}
                  placeholder="Décrivez précisément la question ou le sujet..."
                  className="w-full px-3 py-2 border rounded-xl text-gray-700"
                />
              </div>

              {/* Specific inputs for CO (Audio) */}
              {formState.module === 'CO' && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">URL du fichier Audio (MP3)</label>
                  <input
                    type="url"
                    value={formState.audio_url}
                    onChange={(e) => setFormState({ ...formState, audio_url: e.target.value })}
                    placeholder="https://example.com/audio.mp3"
                    className="w-full px-3 py-2 border rounded-xl text-gray-700"
                  />
                </div>
              )}

              {/* Specific inputs for CE (Passage Text) */}
              {formState.module === 'CE' && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Texte de passage (Lecture)</label>
                  <textarea
                    value={formState.passage_text}
                    onChange={(e) => setFormState({ ...formState, passage_text: e.target.value })}
                    rows={4}
                    placeholder="Saisissez le texte d'actualité ou administratif à lire..."
                    className="w-full px-3 py-2 border rounded-xl text-gray-700"
                  />
                </div>
              )}

              {/* QCM Choices (A, B, C, D) */}
              {isQcm && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border">
                  <span className="block text-xs font-bold text-[#1B3A6B] uppercase mb-1">Options de Réponse (QCM)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-gray-400">{opt}</span>
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
                          className="flex-1 px-3 py-1.5 border rounded-xl text-xs text-gray-700"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 mt-3">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase">Bonne Réponse</label>
                    <select
                      value={formState.correct_answer}
                      onChange={(e) => setFormState({ ...formState, correct_answer: e.target.value })}
                      className="px-3 py-2 border rounded-xl text-xs text-gray-700"
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
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Proposition de Corrigé Type (C2)</label>
                  <textarea
                    value={formState.model_answer}
                    onChange={(e) => setFormState({ ...formState, model_answer: e.target.value })}
                    rows={4}
                    placeholder="Rédigez la réponse idéale attendue pour guider les candidats ou enrichir la correction..."
                    className="w-full px-3 py-2 border rounded-xl text-gray-700"
                  />
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase">Explication Pédagogique</label>
                <textarea
                  value={formState.explanation}
                  onChange={(e) => setFormState({ ...formState, explanation: e.target.value })}
                  required
                  rows={2}
                  placeholder="Expliquez pourquoi la réponse est correcte..."
                  className="w-full px-3 py-2 border rounded-xl text-gray-700"
                />
              </div>

              {/* Switches */}
              <div className="flex gap-6 select-none pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_active}
                    onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-gray-600 uppercase">Actif (is_active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_premium}
                    onChange={(e) => setFormState({ ...formState, is_premium: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-gray-600 uppercase">Premium</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t select-none">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold hover:bg-gray-50 text-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1B3A6B] hover:bg-[#12274A] text-white font-bold rounded-xl shadow-sm"
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
