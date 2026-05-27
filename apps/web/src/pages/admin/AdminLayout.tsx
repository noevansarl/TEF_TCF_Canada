import { Routes, Route, Link, useLocation } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import QuestionManager from './QuestionManager'
import UserManager from './UserManager'

export default function AdminLayout() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#1B3A6B] text-white flex flex-col border-r border-[#1B3A6B]/20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C55A11] rounded-lg flex items-center justify-center font-extrabold text-white text-lg">
            A
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-tight">Portail Admin</h2>
            <span className="text-[10px] bg-white/20 text-gray-200 px-2 py-0.5 rounded font-bold uppercase">
              ayePREP
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 select-none">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === '/admin' || location.pathname === '/admin/'
                ? 'bg-[#C55A11] text-white shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📊</span>
            <span>Tableau de Bord</span>
          </Link>
          
          <Link
            to="/admin/questions"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive('/admin/questions')
                ? 'bg-[#C55A11] text-white shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📚</span>
            <span>Banque de Questions</span>
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive('/admin/users')
                ? 'bg-[#C55A11] text-white shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>👥</span>
            <span>Utilisateurs & Droits</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 text-center">
          <Link
            to="/dashboard"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Retour au site principal
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/questions" element={<QuestionManager />} />
          <Route path="/users" element={<UserManager />} />
        </Routes>
      </main>
    </div>
  )
}
