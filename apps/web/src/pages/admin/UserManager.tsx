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
    if (tier === 'gratuit') return 'bg-gray-100 text-gray-800'
    if (tier === 'essentiel') return 'bg-blue-100 text-blue-800'
    if (tier === 'avance') return 'bg-purple-100 text-purple-800'
    if (tier === 'premium') return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800' // institutionnel
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Title */}
      <div className="select-none">
        <h1 className="text-3xl font-extrabold text-gray-800">Gestion des Utilisateurs</h1>
        <p className="text-gray-500 mt-1">Supervisez les profils, attribuez les rôles administratifs et modifiez les formules d'accès.</p>
      </div>

      {/* Users table list */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        
        {/* Search Input */}
        <div className="max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all text-sm text-gray-700 font-medium"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-extrabold">
                <th className="py-3">Utilisateur</th>
                <th className="py-3">Rôle</th>
                <th className="py-3">Formule d'Accès</th>
                <th className="py-3 text-center">XP Points</th>
                <th className="py-3 text-center">Streak</th>
                <th className="py-3">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="py-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-800 block text-sm">{u.full_name}</span>
                      <span className="text-xs text-gray-400 font-semibold">{u.email}</span>
                    </div>
                  </td>
                  
                  {/* Role Modification */}
                  <td className="py-4">
                    <select
                      value={u.role}
                      disabled={updatingUserId === u.id}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs text-gray-600 font-semibold bg-white"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="expert">Expert Pédagogique</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </td>

                  {/* Subscription Tier Modification */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <select
                        value={u.subscription_tier}
                        disabled={updatingUserId === u.id}
                        onChange={(e) => handleUpdateTier(u.id, e.target.value)}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] text-xs text-gray-600 font-semibold bg-white"
                      >
                        <option value="gratuit">Gratuit</option>
                        <option value="essentiel">Essentiel</option>
                        <option value="avance">Avancé</option>
                        <option value="premium">Premium</option>
                        <option value="institutionnel">Institutionnel</option>
                      </select>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${getTierBadgeClass(u.subscription_tier)}`}>
                        {u.subscription_tier}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 text-center font-bold text-gray-700">{u.xp_points || 0}</td>
                  <td className="py-4 text-center font-bold text-gray-700">🔥 {u.streak_days || 0}j</td>
                  
                  <td className="py-4 text-xs text-gray-400">
                    {new Date(u.created_at || Date.now()).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400 font-semibold italic">
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
