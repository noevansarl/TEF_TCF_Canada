import { Routes, Route, Link, useLocation } from 'react-router-dom'
import ExpertDashboard from './ExpertDashboard'
import ExpertCorrectionEditor from './ExpertCorrectionEditor'
import ExpertHistory from './ExpertHistory'

export default function ExpertLayout() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/expert' && location.pathname.startsWith(path))
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-905 text-white flex flex-col border-r border-slate-800 relative z-20 shadow-xl select-none shrink-0" style={{ backgroundColor: '#0f172a' }}>
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md shadow-orange-500/10">
            E
          </div>
          <div>
            <h2 className="font-black text-lg tracking-tight">Portail Expert</h2>
            <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              ayePREP
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <Link
            to="/expert"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
              location.pathname === '/expert' || location.pathname === '/expert/'
                ? 'bg-gradient-to-r from-amber-500 to-orange-650 text-white shadow-md shadow-orange-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base group-hover:scale-110 duration-200">📋</span>
            <span>File d'attente</span>
          </Link>
          
          <Link
            to="/expert/history"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
              isActive('/expert/history')
                ? 'bg-gradient-to-r from-amber-500 to-orange-650 text-white shadow-md shadow-orange-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base group-hover:scale-110 duration-200">📜</span>
            <span>Historique</span>
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

      {/* Main Expert Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10">
        <Routes>
          <Route path="/" element={<ExpertDashboard />} />
          <Route path="/correct/:id" element={<ExpertCorrectionEditor />} />
          <Route path="/history" element={<ExpertHistory />} />
        </Routes>
      </main>
    </div>
  )
}
