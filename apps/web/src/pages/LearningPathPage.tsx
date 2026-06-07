import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

// ── Types ──────────────────────────────────────────────────────────────
interface DayTask {
  day: number
  module: 'CO' | 'CE' | 'EE' | 'EO' | 'SIMULATION' | 'REPOS'
  label: string
  duration_min: number
  done: boolean
}

interface LearningPlan {
  id: string
  exam_date: string | null
  target_level: string
  current_level: string
  plan_duration_days: number
  daily_plan: DayTask[]
  completed_days: number
  is_active: boolean
}

// ── Données mock ───────────────────────────────────────────────────────
const MOCK_PLAN: LearningPlan = {
  id: 'plan-mock-1',
  exam_date: '2026-09-15',
  target_level: 'C1',
  current_level: 'B2',
  plan_duration_days: 60,
  completed_days: 12,
  is_active: true,
  daily_plan: [
    { day: 1,  module: 'CO',         label: 'CO — Dialogue au bureau',           duration_min: 30, done: true  },
    { day: 2,  module: 'CE',         label: "CE — Article sur l'immigration",     duration_min: 30, done: true  },
    { day: 3,  module: 'EE',         label: 'EE — Texte argumentatif (B2)',       duration_min: 60, done: true  },
    { day: 4,  module: 'CO',         label: 'CO — Annonce radio',                 duration_min: 30, done: true  },
    { day: 5,  module: 'REPOS',      label: 'Révision + repos',                   duration_min: 15, done: true  },
    { day: 6,  module: 'EO',         label: 'EO — Plaidoyer monologue',           duration_min: 20, done: true  },
    { day: 7,  module: 'SIMULATION', label: 'Mini-simulation CO+CE',              duration_min: 70, done: true  },
    { day: 8,  module: 'CO',         label: 'CO — Conversation professionnelle',  duration_min: 30, done: true  },
    { day: 9,  module: 'CE',         label: 'CE — Texte scientifique (C1)',       duration_min: 30, done: true  },
    { day: 10, module: 'EE',         label: 'EE — Compte rendu (C1)',             duration_min: 60, done: true  },
    { day: 11, module: 'EO',         label: 'EO — Interaction formelle',          duration_min: 20, done: true  },
    { day: 12, module: 'CO',         label: 'CO — Documentaire (C1)',             duration_min: 30, done: true  },
    { day: 13, module: 'CE',         label: 'CE — Rapport annuel',                duration_min: 30, done: false },
    { day: 14, module: 'REPOS',      label: 'Révision semaine 2',                 duration_min: 20, done: false },
    { day: 15, module: 'SIMULATION', label: 'Simulation complète TCF Canada',     duration_min: 142, done: false },
    { day: 16, module: 'EE',         label: 'EE — Lettre formelle (C1)',          duration_min: 60, done: false },
    { day: 17, module: 'CO',         label: 'CO — Interview journalistique',      duration_min: 30, done: false },
    { day: 18, module: 'EO',         label: 'EO — Monologue suivi',               duration_min: 20, done: false },
    { day: 19, module: 'CE',         label: "CE — Article d'opinion complexe",   duration_min: 30, done: false },
    { day: 20, module: 'CO',         label: 'CO — Conférence universitaire',      duration_min: 30, done: false },
    { day: 21, module: 'REPOS',      label: 'Révision + auto-évaluation',         duration_min: 20, done: false },
    { day: 22, module: 'EE',         label: 'EE — Synthèse de documents',        duration_min: 60, done: false },
    { day: 23, module: 'EO',         label: 'EO — Monologue de 3 min',           duration_min: 20, done: false },
    { day: 24, module: 'CO',         label: 'CO — Débat contradictoire',          duration_min: 30, done: false },
    { day: 25, module: 'CE',         label: 'CE — Texte littéraire (C1)',        duration_min: 30, done: false },
    { day: 26, module: 'SIMULATION', label: 'Simulation CO+CE+EE',               duration_min: 125, done: false },
    { day: 27, module: 'EO',         label: 'EO — Interaction + questions',       duration_min: 12, done: false },
    { day: 28, module: 'REPOS',      label: 'Repos complet — recharge',           duration_min: 0,  done: false },
    { day: 29, module: 'CO',         label: 'CO — Émission culturelle',           duration_min: 35, done: false },
    { day: 30, module: 'CE',         label: "CE — Compte rendu d'entreprise",    duration_min: 35, done: false },
  ]
}

// ── Helpers visuels ────────────────────────────────────────────────────
const MODULE_COLORS: Record<string, string> = {
  CO:         'bg-blue-50 text-blue-700 border-blue-150',
  CE:         'bg-purple-50 text-purple-700 border-purple-150',
  EE:         'bg-amber-50 text-amber-700 border-amber-150',
  EO:         'bg-rose-50 text-rose-700 border-rose-150',
  SIMULATION: 'bg-slate-950 text-white border-slate-950',
  REPOS:      'bg-emerald-50 text-emerald-700 border-emerald-150',
}

const MODULE_ICONS: Record<string, string> = {
  CO: '🎧', CE: '📖', EE: '✍️', EO: '🎤', SIMULATION: '🏆', REPOS: '😌'
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const today  = new Date()
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ── Composant principal ─────────────────────────────────────────────────
export default function LearningPathPage() {
  const { user } = useAuthStore()
  const [plan, setPlan]         = useState<LearningPlan | null>(null)
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState<'semaine' | 'mois'>('semaine')
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    exam_date: '',
    target_level: 'C1',
    plan_duration_days: 30,
  })

  // ── Chargement du plan existant ──────────────────────────────────────
  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true)
      if (!user) { setPlan(MOCK_PLAN); setLoading(false); return }

      const { data, error } = await supabase
        .from('learning_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        setPlan(null)
      } else {
        setPlan(data as LearningPlan)
      }
      setLoading(false)
    }
    fetchPlan()
  }, [user])

  // ── Créer un nouveau plan ────────────────────────────────────────────
  const handleCreatePlan = async () => {
    setCreating(true)
    const userId = user?.id || 'mock-user-id'

    const modules: DayTask['module'][] = ['CO', 'CE', 'EE', 'EO', 'REPOS', 'CO', 'SIMULATION']
    const durations: Record<DayTask['module'], number> = {
      CO: 30, CE: 30, EE: 60, EO: 20, REPOS: 15, SIMULATION: 142
    }
    const labels: Record<DayTask['module'], string[]> = {
      CO: ['CO — Dialogue au bureau', 'CO — Annonce radio', 'CO — Entretien professionnel', 'CO — Émission culturelle', 'CO — Débat contradictoire'],
      CE: ['CE — Article immigration', 'CE — Texte scientifique', 'CE — Rapport annuel', "CE — Article d'opinion", 'CE — Texte littéraire'],
      EE: ['EE — Texte argumentatif', 'EE — Lettre formelle', 'EE — Synthèse de documents', 'EE — Compte rendu', 'EE — Essai comparatif'],
      EO: ['EO — Plaidoyer monologue', 'EO — Interaction formelle', 'EO — Monologue de 3 min', 'EO — Questions-réponses', 'EO — Présentation'],
      REPOS: ['Révision + repos', 'Auto-évaluation', 'Révision semaine', 'Repos complet'],
      SIMULATION: ['Simulation CO+CE', 'Simulation complète TCF Canada', 'Mini-simulation EE+EO', 'Simulation TEF Canada'],
    }

    const daily_plan: DayTask[] = Array.from({ length: formData.plan_duration_days }, (_, i) => {
      const mod = modules[i % modules.length]
      const labelList = labels[mod]
      return {
        day: i + 1,
        module: mod,
        label: labelList[Math.floor(i / modules.length) % labelList.length],
        duration_min: durations[mod],
        done: false,
      }
    })

    const newPlan = {
      user_id: userId,
      exam_date: formData.exam_date || null,
      target_level: formData.target_level,
      current_level: 'B2', 
      plan_duration_days: formData.plan_duration_days,
      daily_plan,
      completed_days: 0,
      is_active: true,
    }

    const { data, error } = await supabase
      .from('learning_plans')
      .insert(newPlan)
      .select()
      .single()

    if (!error && data) {
      setPlan(data as LearningPlan)
    } else {
      setPlan({ ...MOCK_PLAN, ...formData, daily_plan, completed_days: 0 })
    }
    setCreating(false)
  }

  // ── Marquer un jour comme fait ───────────────────────────────────────
  const handleToggleDay = async (dayNum: number) => {
    if (!plan) return
    const updated = plan.daily_plan.map(d =>
      d.day === dayNum ? { ...d, done: !d.done } : d
    )
    const completed = updated.filter(d => d.done).length
    setPlan({ ...plan, daily_plan: updated, completed_days: completed })

    if (user && plan.id !== 'plan-mock-1') {
      await supabase
        .from('learning_plans')
        .update({ daily_plan: updated, completed_days: completed })
        .eq('id', plan.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Formulaire de création ───────────────────────────────────────────
  if (!plan) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden font-sans py-12 px-4">
        {/* Decorative Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

        <div className="max-w-lg mx-auto relative z-10 space-y-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-black uppercase tracking-wider transition-colors select-none">
            ← Retour au tableau de bord
          </Link>

          <div className="text-center space-y-2">
            <span className="text-5xl filter drop-shadow-sm select-none">🗺️</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon parcours d'apprentissage</h1>
            <p className="text-slate-500 text-sm font-medium">Créez votre plan personnalisé pour atteindre votre niveau cible.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Date de votre examen (optionnel)</label>
              <input
                type="date"
                value={formData.exam_date}
                onChange={e => setFormData(p => ({ ...p, exam_date: e.target.value }))}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] font-medium text-slate-800 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Niveau NCLC cible</label>
              <select
                value={formData.target_level}
                onChange={e => setFormData(p => ({ ...p, target_level: e.target.value }))}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] font-bold text-slate-800 bg-white"
              >
                <option value="B2">B2 — NCLC 6-7</option>
                <option value="C1">C1 — NCLC 8-9 (recommandé immigration)</option>
                <option value="C2">C2 — NCLC 10-12 (excellent)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Durée du parcours</label>
              <div className="grid grid-cols-3 gap-3">
                {[30, 60, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setFormData(p => ({ ...p, plan_duration_days: d }))}
                    className={`py-3 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all duration-300 ${
                      formData.plan_duration_days === d
                        ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                        : 'border-slate-200 text-slate-500 hover:border-slate-850 hover:text-slate-850'
                    }`}
                  >
                    {d} jours
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreatePlan}
              disabled={creating}
              className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md disabled:opacity-60 mt-4"
            >
              {creating ? 'Génération du plan...' : '🚀 Générer mon parcours personnalisé'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Affichage du plan ────────────────────────────────────────────────
  const progress = Math.round((plan.completed_days / plan.plan_duration_days) * 100)
  const today    = plan.daily_plan.find(d => !d.done) 
  const weekDays = plan.daily_plan.slice(
    Math.max(0, (plan.completed_days) - 2),
    Math.min(plan.daily_plan.length, (plan.completed_days) + 5)
  )
  const monthDays = plan.daily_plan

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden font-sans py-8 px-4">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-black uppercase tracking-wider transition-colors select-none">
          ← Retour au tableau de bord
        </Link>

        {/* En-tête du plan */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Mon parcours {plan.plan_duration_days} jours</h1>
              <p className="text-slate-500 text-xs font-semibold mt-1">
                Niveau actuel : <strong className="text-[#1B3A6B]">{plan.current_level}</strong> · cible : <strong className="text-emerald-600">{plan.target_level}</strong>
                {plan.exam_date && (
                  <span className="ml-3 text-amber-600 font-black">
                    📅 Examen dans {daysUntil(plan.exam_date)} jours
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[#1B3A6B]">{progress}%</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{plan.completed_days}/{plan.plan_duration_days} jours faits</div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1B3A6B] to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Jours complétés', value: plan.completed_days, icon: '✅' },
              { label: 'Restants', value: plan.plan_duration_days - plan.completed_days, icon: '📅' },
              { label: 'Sessions CO+CE', value: plan.daily_plan.filter(d => (d.module === 'CO' || d.module === 'CE') && d.done).length, icon: '📚' },
              { label: 'Simulations', value: plan.daily_plan.filter(d => d.module === 'SIMULATION' && d.done).length, icon: '🏆' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50/50 border border-slate-100 hover:bg-white rounded-2xl p-4 text-center transition-all duration-300">
                <div className="text-2xl mb-1 filter drop-shadow-sm select-none">{s.icon}</div>
                <div className="text-base font-black text-slate-900">{s.value}</div>
                <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tâche du jour */}
        {today && (
          <div className="bg-gradient-to-r from-slate-950 via-[#1B3A6B] to-[#2a5ba8] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mb-1.5">🎯 Étape d'aujourd'hui</p>
            <h2 className="text-lg font-black tracking-tight mb-1">Jour {today.day} — {today.label}</h2>
            <p className="text-blue-100 text-xs mb-5 font-semibold">{today.duration_min} minutes · {today.module}</p>
            <div className="flex flex-wrap gap-3">
              {today.module !== 'REPOS' && today.module !== 'SIMULATION' ? (
                <Link
                  to={`/modules`}
                  className="bg-white text-slate-950 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-50 transition-colors shadow-sm"
                >
                  Commencer {today.module} →
                </Link>
              ) : today.module === 'SIMULATION' ? (
                <Link
                  to="/simulation"
                  className="bg-white text-slate-950 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-50 transition-colors shadow-sm"
                >
                  Lancer la simulation →
                </Link>
              ) : null}
              <button
                onClick={() => handleToggleDay(today.day)}
                className="border-2 border-white/30 text-white px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                Marquer comme fait
              </button>
            </div>
          </div>
        )}

        {!today && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center animate-scale-up">
            <div className="text-5xl mb-2 filter drop-shadow-sm select-none">🎉</div>
            <h2 className="text-lg font-black text-emerald-800">Parcours complété avec succès !</h2>
            <p className="text-emerald-600 text-xs font-semibold mt-1">Vous avez relevé les {plan.plan_duration_days} jours de défi. Vous êtes prêt pour le vrai examen !</p>
          </div>
        )}

        {/* Vue semaine / mois */}
        <div className="space-y-4">
          <div className="flex items-center justify-between select-none">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Planning détaillé</h3>
            <div className="flex bg-slate-100 border border-slate-200/50 rounded-full p-1 gap-1 shadow-inner">
              <button
                onClick={() => setView('semaine')}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-colors ${view === 'semaine' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Prochain 7 j.
              </button>
              <button
                onClick={() => setView('mois')}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-colors ${view === 'mois' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tout voir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(view === 'semaine' ? weekDays : monthDays).map(task => (
              <div
                key={task.day}
                onClick={() => !task.done && handleToggleDay(task.day)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  task.done
                    ? 'bg-slate-50/50 border-slate-100/50 opacity-60'
                    : 'bg-white border-slate-200/80 hover:border-slate-800 hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                }`}>
                  {task.done && <span className="text-white text-[10px] font-black">✓</span>}
                </div>

                {/* Jour */}
                <div className="w-10 text-left flex-shrink-0 select-none">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">J{task.day}</span>
                </div>

                {/* Badge module */}
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border flex-shrink-0 ${MODULE_COLORS[task.module]}`}>
                  {MODULE_ICONS[task.module]} {task.module}
                </span>

                {/* Label */}
                <span className={`flex-1 text-xs font-bold ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.label}
                </span>

                {/* Durée */}
                {task.duration_min > 0 && (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-shrink-0">{task.duration_min} min</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA si pas de pack */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm animate-pulse">
          <div className="flex-1 space-y-1">
            <p className="font-black text-amber-900 text-sm">💡 Accélérez votre progression</p>
            <p className="text-xs text-amber-700 font-semibold leading-relaxed">Débloquez l'accès aux corrections d'Expression Écrite et Orale par IA, aux simulations officielles et à l'accès hors connexion.</p>
          </div>
          <Link
            to="/subscribe?pack=1"
            className="bg-amber-500 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider whitespace-nowrap hover:bg-amber-600 transition-colors shadow-md"
          >
            Débloquer mon plan →
          </Link>
        </div>
      </div>
    </div>
  )
}
