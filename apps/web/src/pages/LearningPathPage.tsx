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
  CO:         'bg-blue-100 text-blue-700 border-blue-200',
  CE:         'bg-purple-100 text-purple-700 border-purple-200',
  EE:         'bg-amber-100 text-amber-700 border-amber-200',
  EO:         'bg-rose-100 text-rose-700 border-rose-200',
  SIMULATION: 'bg-[#1B3A6B] text-white border-[#1B3A6B]',
  REPOS:      'bg-green-100 text-green-700 border-green-200',
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
        // Pas encore de plan — afficher le formulaire de création
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

    // Génération du plan journalier (cycle CO·CE·EE·EO·REPOS·CO·SIMU)
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
      current_level: 'B2', // issu du test diagnostique
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
      // Mode mock — afficher directement
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

  // ── Affichage chargement ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Formulaire de création ───────────────────────────────────────────
  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🗺️</div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Mon parcours d'apprentissage</h1>
            <p className="text-gray-500">Créez votre plan personnalisé pour atteindre votre niveau cible.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date de votre examen (optionnel)</label>
              <input
                type="date"
                value={formData.exam_date}
                onChange={e => setFormData(p => ({ ...p, exam_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Niveau NCLC cible</label>
              <select
                value={formData.target_level}
                onChange={e => setFormData(p => ({ ...p, target_level: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
              >
                <option value="B2">B2 — NCLC 6-7</option>
                <option value="C1">C1 — NCLC 8-9 (recommandé immigration)</option>
                <option value="C2">C2 — NCLC 10-12 (excellent)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Durée du parcours</label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setFormData(p => ({ ...p, plan_duration_days: d }))}
                    className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                      formData.plan_duration_days === d
                        ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                        : 'border-gray-200 text-gray-600 hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
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
              className="w-full py-3 bg-[#1B3A6B] text-white rounded-xl font-bold text-sm hover:bg-[#152e56] transition-colors disabled:opacity-60"
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
  const today    = plan.daily_plan.find(d => !d.done) // prochaine tâche
  const weekDays = plan.daily_plan.slice(
    Math.max(0, (plan.completed_days) - 2),
    Math.min(plan.daily_plan.length, (plan.completed_days) + 5)
  )
  const monthDays = plan.daily_plan

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none">
          ← Retour au tableau de bord
        </Link>

        {/* En-tête */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Mon parcours {plan.plan_duration_days} jours</h1>
              <p className="text-gray-500 text-sm mt-1">
                Niveau actuel : <strong className="text-[#1B3A6B]">{plan.current_level}</strong> → cible : <strong className="text-green-600">{plan.target_level}</strong>
                {plan.exam_date && (
                  <span className="ml-3 text-amber-600 font-semibold">
                    📅 Examen dans {daysUntil(plan.exam_date)} jours
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-[#1B3A6B]">{progress}%</div>
              <div className="text-xs text-gray-500">{plan.completed_days}/{plan.plan_duration_days} jours</div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1B3A6B] to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Jours complétés', value: plan.completed_days, icon: '✅' },
              { label: 'Restants', value: plan.plan_duration_days - plan.completed_days, icon: '📅' },
              { label: 'Sessions CO+CE', value: plan.daily_plan.filter(d => (d.module === 'CO' || d.module === 'CE') && d.done).length, icon: '📚' },
              { label: 'Simulations', value: plan.daily_plan.filter(d => d.module === 'SIMULATION' && d.done).length, icon: '🏆' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl">{s.icon}</div>
                <div className="text-xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tâche du jour */}
        {today && (
          <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2a5ba8] rounded-2xl p-6 text-white">
            <p className="text-sm text-blue-200 font-semibold mb-1">🎯 Prochaine étape</p>
            <h2 className="text-xl font-extrabold mb-1">Jour {today.day} — {today.label}</h2>
            <p className="text-blue-200 text-sm mb-4">{today.duration_min} minutes · {today.module}</p>
            <div className="flex gap-3">
              {today.module !== 'REPOS' && today.module !== 'SIMULATION' ? (
                <Link
                  to={`/modules`}
                  className="bg-white text-[#1B3A6B] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
                >
                  Commencer {today.module} →
                </Link>
              ) : today.module === 'SIMULATION' ? (
                <Link
                  to="/simulation"
                  className="bg-white text-[#1B3A6B] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
                >
                  Lancer la simulation →
                </Link>
              ) : null}
              <button
                onClick={() => handleToggleDay(today.day)}
                className="border border-white/40 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
              >
                Marquer comme fait
              </button>
            </div>
          </div>
        )}

        {!today && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-green-800">Parcours terminé !</h2>
            <p className="text-green-600 text-sm mt-1">Vous avez complété les {plan.plan_duration_days} jours. Passez votre examen !</p>
          </div>
        )}

        {/* Vue semaine / mois */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Planning détaillé</h3>
            <div className="flex bg-white border border-gray-200 rounded-full p-1 gap-1">
              <button
                onClick={() => setView('semaine')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === 'semaine' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500'}`}
              >
                Prochain 7 j.
              </button>
              <button
                onClick={() => setView('mois')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === 'mois' ? 'bg-[#1B3A6B] text-white' : 'text-gray-500'}`}
              >
                Tout voir
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {(view === 'semaine' ? weekDays : monthDays).map(task => (
              <div
                key={task.day}
                onClick={() => !task.done && handleToggleDay(task.day)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  task.done
                    ? 'bg-gray-50 border-gray-100 opacity-60'
                    : 'bg-white border-gray-200 hover:border-[#1B3A6B] hover:shadow-sm'
                }`}
              >
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {task.done && <span className="text-white text-xs">✓</span>}
                </div>

                {/* Jour */}
                <div className="w-14 text-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400">J{task.day}</span>
                </div>

                {/* Badge module */}
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${MODULE_COLORS[task.module]}`}>
                  {MODULE_ICONS[task.module]} {task.module}
                </span>

                {/* Label */}
                <span className={`flex-1 text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.label}
                </span>

                {/* Durée */}
                {task.duration_min > 0 && (
                  <span className="text-xs text-gray-400 flex-shrink-0">{task.duration_min} min</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA si pas de pack */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-amber-900">💡 Accélérez votre progression</p>
            <p className="text-sm text-amber-700 mt-0.5">Passez au Pack Intensif pour débloquer les corrections IA EE/EO et les simulations complètes.</p>
          </div>
          <Link
            to="/subscribe?pack=1"
            className="bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-amber-600 transition-colors"
          >
            Voir les packs →
          </Link>
        </div>

      </div>
    </div>
  )
}
