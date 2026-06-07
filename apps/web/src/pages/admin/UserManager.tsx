import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function UserManager() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('users').select('*')
      if (data && !error) {
        setUsers(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (!error) {
        // Refresh local state
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleUpdateTier = async (userId: string, newTier: string) => {
    setUpdatingUserId(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: newTier })
        .eq('id', userId)

      if (!error) {
        // Refresh local state
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_tier: newTier } : u))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    )
  })

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

  const getTierBadgeClass = (tier: string) => {
    if (tier === 'gratuit') return 'bg-slate-100 text-slate-700 border-slate-200'
    if (tier === 'essentiel') return 'bg-blue-50 text-blue-700 border-blue-250/50'
    if (tier === 'avance') return 'bg-purple-50 text-purple-700 border-purple-250/50'
    if (tier === 'premium') return 'bg-yellow-50 text-yellow-750 border-yellow-250/50'
    return 'bg-emerald-50 text-emerald-700 border-emerald-250/50' // institutionnel
  }

  return (
    <div className="space-y-8 select-text">
      
      {/* Title */}
      <div className="select-none">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">
          Gestion des <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Utilisateurs</span>
        </h1>
        <p className="text-slate-555 font-medium mt-1.5">
          Supervisez les profils, attribuez les rôles administratifs et modifiez les formules d'accès.
        </p>
      </div>

      {/* Users table list */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
        
        {/* Search Input */}
        <div className="max-w-md relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full px-5 py-3.5 pl-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all text-sm text-slate-700 font-medium bg-slate-50/50 focus:bg-white"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-450 text-[11px] uppercase font-black tracking-wider">
                <th className="py-3">Utilisateur</th>
                <th className="py-3">Rôle</th>
                <th className="py-3">Formule d'Accès</th>
                <th className="py-3 text-center">XP Points</th>
                <th className="py-3 text-center">Streak</th>
                <th className="py-3">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4.5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800 block text-sm">{u.full_name || 'Sans Nom'}</span>
                      <span className="text-xs text-slate-400 font-semibold">{u.email}</span>
                    </div>
                  </td>
                  
                  {/* Role Modification */}
                  <td className="py-4.5">
                    <select
                      value={u.role}
                      disabled={updatingUserId === u.id}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs text-slate-600 font-bold bg-white transition-all hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="expert">Expert Pédagogique</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </td>

                  {/* Subscription Tier Modification */}
                  <td className="py-4.5">
                    <div className="flex items-center gap-3">
                      <select
                        value={u.subscription_tier}
                        disabled={updatingUserId === u.id}
                        onChange={(e) => handleUpdateTier(u.id, e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs text-slate-600 font-bold bg-white transition-all hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                      >
                        <option value="gratuit">Gratuit</option>
                        <option value="essentiel">Essentiel</option>
                        <option value="avance">Avancé</option>
                        <option value="premium">Premium</option>
                        <option value="institutionnel">Institutionnel</option>
                      </select>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${getTierBadgeClass(u.subscription_tier)}`}>
                        {u.subscription_tier === 'avance' ? 'Avancé' : u.subscription_tier}
                      </span>
                    </div>
                  </td>

                  <td className="py-4.5 text-center font-bold text-slate-700">{u.xp_points || 0}</td>
                  <td className="py-4.5 text-center font-bold text-slate-700">🔥 {u.streak_days || 0}j</td>
                  
                  <td className="py-4.5 text-xs text-slate-400 font-medium">
                    {new Date(u.created_at || Date.now()).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-semibold italic">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}
