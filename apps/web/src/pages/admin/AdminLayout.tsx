import { Routes, Route, Link, useLocation } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import QuestionManager from './QuestionManager'
import UserManager from './UserManager'
import AffiliateManager from './AffiliateManager'

export default function AdminLayout() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path))
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-905 text-white flex flex-col border-r border-slate-800 relative z-20 shadow-xl select-none shrink-0" style={{ backgroundColor: '#0f172a' }}>
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md shadow-indigo-500/10">
            A
          </div>
          <div>
            <h2 className="font-black text-lg tracking-tight">Portail Admin</h2>
            <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              ayePREP
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
              location.pathname === '/admin' || location.pathname === '/admin/'
                ? 'bg-gradient-to-r from-[#1B3A6B] to-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base group-hover:scale-110 duration-200">📊</span>
            <span>Tableau de Bord</span>
          </Link>
          
          <Link
            to="/admin/questions"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
              isActive('/admin/questions')
                ? 'bg-gradient-to-r from-[#1B3A6B] to-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base group-hover:scale-110 duration-200">📚</span>
            <span>Banque de Questions</span>
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
              isActive('/admin/users')
                ? 'bg-gradient-to-r from-[#1B3A6B] to-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base group-hover:scale-110 duration-200">👥</span>
            <span>Utilisateurs & Droits</span>
          </Link>

          <Link
            to="/admin/affiliates"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
              isActive('/admin/affiliates')
                ? 'bg-gradient-to-r from-[#1B3A6B] to-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base group-hover:scale-110 duration-200">🤝</span>
            <span>Programme Affiliés</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800/80 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors rounded-xl border border-slate-800 text-xs font-bold"
          >
            ← Retour au site principal
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/questions" element={<QuestionManager />} />
          <Route path="/users" element={<UserManager />} />
          <Route path="/affiliates" element={<AffiliateManager />} />
        </Routes>
      </main>
    </div>
  )
}
