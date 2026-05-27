import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ProgressRadarChart } from '../features/progression/RadarChart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BADGES_DEFINITION, type Badge } from '../lib/badges'
import { FullPageSpinner } from '../components/FullPageSpinner'

const mockHistoryData = [
  { date: '01 Mai', score: 62 },
  { date: '05 Mai', score: 68 },
  { date: '10 Mai', score: 72 },
  { date: '15 Mai', score: 70 },
  { date: '18 Mai', score: 78 },
  { date: '22 Mai', score: 82 },
  { date: '25 Mai', score: 85 }
]

export default function ProgressionPage() {
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<any>({ xp_points: 1240, streak_days: 7, simulations_completed: 4 })
  const [radarData, setRadarData] = useState<any[]>([])
  const [unlockedBadgeSlugs, setUnlockedBadgeSlugs] = useState<string[]>([])
  const [historyData, setHistoryData] = useState<any[]>(mockHistoryData)

  useEffect(() => {
    async function loadProgressionData() {
      setLoading(true)
      try {
        // 1. Fetch user profile data (XP, streak)
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .single()
        
        if (userData) {
          setUserStats({
            xp_points: userData.xp_points || 0,
            streak_days: userData.streak_days || 0,
            simulations_completed: userData.longest_streak ? Math.round(userData.longest_streak / 3) : 2 // mock correlation
          })
        }

        // 2. Fetch competency stats
        const { data: statsData } = await supabase
          .from('progress_stats')
          .select('*')

        if (statsData && statsData.length > 0) {
          const formatted = statsData.map((s: any) => ({
            module: s.module,
            score: s.mastery_score || 0,
            target: 85
          }))
          setRadarData(formatted)
        } else {
          // Fallback mock
          setRadarData([
            { module: 'CO', score: 85, target: 85 },
            { module: 'CE', score: 70, target: 85 },
            { module: 'EE', score: 75, target: 85 },
            { module: 'EO', score: 65, target: 85 }
          ])
        }

        // 3. Fetch user unlocked badges
        const { data: userBadges } = await supabase
          .from('user_badges')
          .select('*, badges(*)')

        if (userBadges && userBadges.length > 0) {
          const slugs = userBadges.map((ub: any) => ub.badges?.slug || ub.badge_id)
          setUnlockedBadgeSlugs(slugs)
        } else {
          // Fallback mock slugs
          setUnlockedBadgeSlugs(['first-step', 'week-warrior', 'perfectionist'])
        }

        // 4. Fetch actual completed sessions history
        const { data: sessionHistory } = await supabase
          .from('sessions')
          .select('created_at, score_auto')
          .eq('status', 'completed')
          .order('created_at', { ascending: true })

        if (sessionHistory && sessionHistory.length > 0) {
          const formattedHistory = sessionHistory.map((s: any) => {
            const dateObj = new Date(s.created_at)
            const day = String(dateObj.getDate()).padStart(2, '0')
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
            const monthLabel = months[dateObj.getMonth()]
            return {
              date: `${day} ${monthLabel}`,
              score: Math.round(s.score_auto || 70)
            }
          })
          setHistoryData(formattedHistory)
        }
      } catch (err) {
        console.error("Error loading progress page data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadProgressionData()
  }, [])

  if (loading) return <FullPageSpinner />

  // Rarity badges color mapping
  const getBadgeRarityStyles = (rarity: Badge['rarity'], isUnlocked: boolean) => {
    if (!isUnlocked) return 'border-gray-200 bg-gray-50 text-gray-400 opacity-40'
    if (rarity === 'common') return 'border-green-200 bg-green-50/50 text-green-700'
    if (rarity === 'rare') return 'border-blue-200 bg-blue-50/50 text-blue-700'
    if (rarity === 'epic') return 'border-purple-200 bg-purple-50/50 text-purple-700'
    return 'border-yellow-200 bg-yellow-50/50 text-yellow-700'
  }

  const getRarityLabel = (rarity: Badge['rarity']) => {
    if (rarity === 'common') return 'Commun'
    if (rarity === 'rare') return 'Rare'
    if (rarity === 'epic') return 'Épique'
    return 'Légendaire'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="text-center md:text-left select-none space-y-1">
          <h1 className="text-3xl font-extrabold text-[#1B3A6B]">Tableau de Progression</h1>
          <p className="text-gray-500">Visualisez vos performances et badges de préparation.</p>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">XP Cumulé</span>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-[#1B3A6B]">{userStats.xp_points}</span>
              <span className="text-sm font-semibold text-gray-400 ml-1">XP</span>
            </div>
            <span className="text-xs text-gray-400 mt-2 block">Niveau 12 · Prochain niveau à 1500 XP</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Série Actuelle</span>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-[#C55A11]">🔥 {userStats.streak_days}</span>
              <span className="text-sm font-semibold text-gray-400 ml-1">Jours</span>
            </div>
            <span className="text-xs text-gray-400 mt-2 block">Conservez votre rythme d'apprentissage</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Simulations Complètes</span>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-success">🏆 {userStats.simulations_completed}</span>
              <span className="text-sm font-semibold text-gray-400 ml-1">sessions</span>
            </div>
            <span className="text-xs text-gray-400 mt-2 block">Conditions réelles de 2h+</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Taux de Maîtrise</span>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-primary">
                {Math.round(radarData.reduce((acc, curr) => acc + curr.score, 0) / Math.max(radarData.length, 1))}%
              </span>
              <span className="text-sm font-semibold text-gray-400 ml-1">moyen</span>
            </div>
            <span className="text-xs text-gray-400 mt-2 block">Objectif global C2 ({'>='} 85%)</span>
          </div>
        </div>

        {/* Charts Section: Radar and Historical Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1B3A6B]">Équilibre des Compétences</h2>
              <p className="text-xs text-gray-400 mt-0.5">Votre niveau actuel sur les 4 épreuves par rapport à la cible NCLC 10+</p>
            </div>
            <div className="flex justify-center bg-gray-50/50 p-4 rounded-2xl">
              <ProgressRadarChart data={radarData} />
            </div>
          </div>

          {/* Historical Evolution Chart */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1B3A6B]">Évolution Historique</h2>
              <p className="text-xs text-gray-400 mt-0.5">Courbe de progression du taux de maîtrise moyen lors des dernières sessions</p>
            </div>
            <div className="h-[300px] w-full bg-gray-50/50 p-4 rounded-2xl">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    formatter={(value: number) => [`${value}%`, 'Score Moyen']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#1B3A6B" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gamification Badges Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A6B]">Médailles & Badges Académiques</h2>
              <p className="text-sm text-gray-400">Accomplissez des défis pour débloquer des récompenses en XP.</p>
            </div>
            <span className="text-xs font-bold bg-[#C55A11]/10 text-[#C55A11] px-3 py-1 rounded-full uppercase">
              {unlockedBadgeSlugs.length} / {BADGES_DEFINITION.length} débloqués
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {BADGES_DEFINITION.map((badge) => {
              const isUnlocked = unlockedBadgeSlugs.includes(badge.slug)
              return (
                <div 
                  key={badge.slug}
                  className={`p-5 rounded-2xl border text-center transition-all flex flex-col justify-between relative group ${
                    isUnlocked ? 'bg-white shadow-sm border-gray-100 hover:shadow-md' : 'bg-gray-50/50 border-gray-200 select-none'
                  }`}
                >
                  {/* Lock badge label for locked ones */}
                  {!isUnlocked && (
                    <div className="absolute top-3 right-3 text-xs bg-gray-200/60 p-1.5 rounded-full" title="Verrouillé">
                      🔒
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto text-2xl border transition-all ${
                      isUnlocked ? 'bg-[#1B3A6B]/5 border-[#1B3A6B]/20 scale-105 group-hover:rotate-12 duration-300' : 'bg-gray-100 border-gray-200 grayscale'
                    }`}>
                      🏅
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className={`font-bold text-base ${isUnlocked ? 'text-[#1B3A6B]' : 'text-gray-400'}`}>
                        {badge.name}
                      </h4>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md inline-block ${getBadgeRarityStyles(badge.rarity, isUnlocked)}`}>
                        {getRarityLabel(badge.rarity)}
                      </span>
                    </div>

                    <p className={`text-xs ${isUnlocked ? 'text-gray-500' : 'text-gray-400'} leading-relaxed`}>
                      {badge.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center">
                    <span className={`text-xs font-bold ${isUnlocked ? 'text-[#C55A11]' : 'text-gray-400'}`}>
                      +{badge.xp_reward} XP
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
