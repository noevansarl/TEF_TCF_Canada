import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuthStore } from '../store/authStore'
import { useDocumentMetadata } from '../hooks/useDocumentMetadata'
import { SocialShareButtons } from '../components/SocialShareButtons'
import { LeadMagnetModal } from '../components/LeadMagnetModal'
import { trackMarketingEvent } from '../lib/tracking'

// Tables de conversion officielles IRCC (2026)
const TCF_NCLC_TABLE: Record<string, { min: number; max: number; nclc: string; clb: string; cecrl: string }[]> = {
  CO: [
    { min: 0,   max: 330, nclc: 'NCLC <4', clb: 'CLB <4', cecrl: 'A1/A2' },
    { min: 331, max: 368, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 369, max: 397, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 398, max: 457, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 458, max: 502, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 503, max: 522, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 523, max: 548, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 549, max: 699, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C2' },
  ],
  CE: [
    { min: 0,   max: 341, nclc: 'NCLC <4', clb: 'CLB <4', cecrl: 'A1/A2' },
    { min: 342, max: 374, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 375, max: 405, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 406, max: 452, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 453, max: 498, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 499, max: 523, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 524, max: 548, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 549, max: 699, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C2' },
  ],
  EE: [
    { min: 0,   max: 3,   nclc: 'NCLC <4', clb: 'CLB <4', cecrl: 'A1/A2' },
    { min: 4,   max: 5,   nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 6,   max: 6,   nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 7,   max: 9,   nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 10,  max: 11,  nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 12,  max: 13,  nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 14,  max: 15,  nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 16,  max: 20,  nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C2' },
  ],
  EO: [
    { min: 0,   max: 3,   nclc: 'NCLC <4', clb: 'CLB <4', cecrl: 'A1/A2' },
    { min: 4,   max: 5,   nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 6,   max: 6,   nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 7,   max: 9,   nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 10,  max: 11,  nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 12,  max: 13,  nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 14,  max: 15,  nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 16,  max: 20,  nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C2' },
  ],
}

const TEF_NCLC_TABLE: Record<string, { min: number; max: number; nclc: string; clb: string; cecrl: string }[]> = {
  CO: [
    { min: 0,   max: 144, nclc: 'NCLC <4', clb: 'CLB <4', cecrl: 'A1/A2' },
    { min: 145, max: 180, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 181, max: 216, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 217, max: 248, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 249, max: 279, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 280, max: 297, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 298, max: 315, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 316, max: 333, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C2' },
    { min: 334, max: 341, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 342, max: 360, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  CE: [
    { min: 0,   max: 120, nclc: 'NCLC <4', clb: 'CLB <4', cecrl: 'A1/A2' },
    { min: 121, max: 150, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 151, max: 180, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 181, max: 206, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 207, max: 232, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 233, max: 247, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 248, max: 262, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 263, max: 277, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C2' },
    { min: 278, max: 289, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 290, max: 300, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  EE: [
    { min: 0,   max: 180, nclc: 'NCLC <4', clb: 'CLB <4', cecrl: 'A1/A2' },
    { min: 181, max: 225, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 226, max: 270, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 271, max: 309, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 310, max: 348, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 349, max: 370, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 371, max: 392, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 393, max: 410, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C2' },
    { min: 411, max: 425, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 426, max: 450, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  EO: [
    { min: 0,   max: 180, nclc: 'NCLC <4', clb: 'CLB <4', cecrl: 'A1/A2' },
    { min: 181, max: 225, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 226, max: 270, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 271, max: 309, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 310, max: 348, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 349, max: 370, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 371, max: 392, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 393, max: 410, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C2' },
    { min: 411, max: 425, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 426, max: 450, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
}

function getLevel(table: typeof TCF_NCLC_TABLE, module: string, score: number) {
  const rows = table[module] || []
  return rows.find(r => score >= r.min && score <= r.max) || null
}

const levelColor: Record<string, string> = {
  'A1/A2': 'bg-red-50 text-red-700 border-red-200/50',
  'B1': 'bg-amber-50 text-amber-700 border-amber-200/50',
  'B1+': 'bg-amber-50 text-amber-700 border-amber-200/50',
  'B2': 'bg-blue-50 text-blue-700 border-blue-200/50',
  'B2+': 'bg-blue-50 text-blue-700 border-blue-200/50',
  'C1': 'bg-emerald-50 text-emerald-700 border-emerald-250/50',
  'C1+': 'bg-emerald-50 text-emerald-700 border-emerald-250/50',
  'C2': 'bg-purple-50 text-purple-700 border-purple-250/50',
}

const MODULE_LABELS: Record<string, string> = {
  CO: 'Compréhension Orale',
  CE: 'Compréhension Écrite',
  EE: 'Expression Écrite',
  EO: 'Expression Orale',
}

const TCF_MAX: Record<string, number> = { CO: 699, CE: 699, EE: 20, EO: 20 }
const TEF_MAX: Record<string, number> = { CO: 360, CE: 300, EE: 450, EO: 450 }

export default function NclcCalculatorPage() {
  useDocumentMetadata({
    title: "Calculateur NCLC / CLB — TCF & TEF Canada | ayePREP",
    description: "Convertissez gratuitement vos scores TCF Canada ou TEF Canada en niveaux NCLC/CLB officiels reconnus par IRCC (Immigration Canada).",
  })
  const { user } = useAuthStore()
  const [testType, setTestType] = useState<'TCF_CANADA' | 'TEF_CANADA'>('TCF_CANADA')
  const [scores, setScores] = useState({ CO: '', CE: '', EE: '', EO: '' })
  const [calculated, setCalculated] = useState(false)

  const table = testType === 'TCF_CANADA' ? TCF_NCLC_TABLE : TEF_NCLC_TABLE
  const maxScores = testType === 'TCF_CANADA' ? TCF_MAX : TEF_MAX

  const results = Object.entries(scores).map(([mod, val]) => {
    const score = parseInt(val)
    if (!val || isNaN(score)) return { module: mod, score: null, level: null }
    return { module: mod, score, level: getLevel(table, mod, score) }
  })

  const allFilled = results.every(r => r.score !== null)

  const overallNclc = (() => {
    if (!allFilled) return null
    const nums = results.map(r => {
      const nclcStr = r.level?.nclc || ''
      if (nclcStr.includes('<4')) return 3
      const numOnly = nclcStr.replace(/[^\d]/g, '')
      const parsed = parseInt(numOnly)
      return isNaN(parsed) ? 4 : parsed
    })
    const minNclc = Math.min(...nums)
    return minNclc < 4 ? '< 4' : String(minNclc)
  })()

  return (
    <>
      {/* Schema.org */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Calculateur NCLC TCF TEF Canada",
        "description": "Convertissez vos scores TCF ou TEF Canada en niveaux NCLC/CLB officiels. Gratuit et sans inscription.",
        "url": "https://ayeprep.com/calculateur-nclc",
        "applicationCategory": "EducationalApplication",
        "inLanguage": "fr",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CAD" }
      })}} />

      <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden font-sans text-slate-800">
        {/* Decorative Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 sticky top-0 z-40 relative z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo />
            <Link to="/register" className="text-sm font-bold text-[#1B3A6B] hover:text-indigo-650 transition-colors flex items-center gap-1 select-none">
              Commencer la préparation <span>→</span>
            </Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
          <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:text-indigo-650 font-bold transition-colors select-none mb-6">
            ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
          </Link>
          
          {/* Titre SEO */}
          <div className="text-center mb-10 select-none">
            <span className="inline-block bg-[#1B3A6B]/5 text-[#1B3A6B] border border-[#1B3A6B]/15 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-4">
              Outil gratuit · Sans inscription
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display mb-3">
              Calculateur <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">NCLC / CLB</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Convertissez vos scores <strong>TCF Canada</strong> ou <strong>TEF Canada</strong> en niveaux
              NCLC/CLB officiels reconnus par <strong>IRCC</strong> (Immigration Canada).
              Tables officielles 2026.
            </p>
          </div>

          {/* Sélection type d'examen */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">1. Choisissez votre examen</h2>
            <div className="grid grid-cols-2 gap-3 select-none">
              {(['TCF_CANADA', 'TEF_CANADA'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => { setTestType(type); setCalculated(false) }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    testType === type
                      ? 'border-blue-500 bg-blue-50/30 shadow-md shadow-blue-500/5'
                      : 'border-slate-200 hover:border-slate-350 bg-white/60 hover:bg-white'
                  }`}
                >
                  <p className={`font-black text-sm uppercase tracking-wider ${testType === type ? 'text-[#1B3A6B]' : 'text-slate-700'}`}>
                    {type === 'TCF_CANADA' ? 'TCF Canada' : 'TEF Canada'}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {type === 'TCF_CANADA'
                      ? 'France Éducation International · Score /699'
                      : 'CCI Paris Île-de-France · Score /360 (CO)'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Saisie des scores */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm p-6 mb-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 font-display">2. Entrez vos scores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(MODULE_LABELS).map(([mod, label]) => (
                <div key={mod} className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {label}
                    <span className="ml-1.5 text-[10px] font-bold text-slate-400">
                      (max {maxScores[mod]})
                    </span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={maxScores[mod]}
                    value={scores[mod as keyof typeof scores]}
                    onChange={e => setScores(prev => ({ ...prev, [mod]: e.target.value }))}
                    placeholder={`Score 0–${maxScores[mod]}`}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-750 font-semibold transition-all bg-slate-50/30 focus:bg-white"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setCalculated(true)
                trackMarketingEvent('nclc_calculator_used', {
                  test_type: testType,
                  overall_nclc: overallNclc || 'incomplet'
                })
              }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 active:scale-95 text-sm uppercase tracking-wider"
            >
              Calculer mes niveaux NCLC
            </button>
          </div>

          {/* Résultats */}
          {calculated && (
            <div className="space-y-6 mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 font-display">3. Vos résultats</h2>

                {/* Score global */}
                {allFilled && overallNclc !== null && (
                  <div className="text-center bg-gradient-to-br from-[#1B3A6B] to-indigo-600 text-white rounded-2xl p-6 shadow-md shadow-indigo-500/10">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Votre niveau global estimé</p>
                    <p className="text-5xl font-black font-display tracking-tight">NCLC {overallNclc}</p>
                    <p className="text-xs opacity-80 font-medium mt-1.5">
                      (basé sur votre module le plus faible — règle officielle IRCC)
                    </p>
                  </div>
                )}

                {/* Résultats par module */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map(({ module, score, level }) => (
                    <div key={module} className="border border-slate-200/60 rounded-2xl p-4 bg-white hover:border-blue-500/15 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                        {MODULE_LABELS[module]}
                      </p>
                      {score === null ? (
                        <p className="text-slate-400 text-xs italic font-medium">Score non saisi</p>
                      ) : level ? (
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-2xl font-black text-[#1B3A6B] font-display">{level.nclc}</p>
                            <p className="text-xs text-slate-400 font-semibold">{level.clb}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${levelColor[level.cecrl] || 'bg-gray-105 text-slate-600 border-slate-200'}`}>
                            {level.cecrl}
                          </span>
                        </div>
                      ) : (
                        <p className="text-red-500 text-xs font-bold">Score hors plage valide</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Partage viral sur les réseaux sociaux & WhatsApp */}
              <SocialShareButtons
                title="Partager mon estimation NCLC"
                text={`🍁 J'ai calculé mes scores ${testType === 'TCF_CANADA' ? 'TCF Canada' : 'TEF Canada'} sur ayePREP : niveau global estimé NCLC ${overallNclc || '7'} ! Faites le test gratuitement pour votre dossier d'immigration :`}
                url="https://ayeprep.com/calculateur-nclc"
              />

              {/* Lead Magnet intégré pour capture de prospect */}
              <LeadMagnetModal
                inline={true}
                initialExam={testType}
                suggestedNclc={overallNclc && overallNclc !== '< 4' ? `NCLC ${Math.min(parseInt(overallNclc) + 1, 10)}` : 'NCLC 9'}
              />
            </div>
          )}

          {/* Tableau de correspondance complet */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">
              Tableau de correspondance complet — {testType === 'TCF_CANADA' ? 'TCF Canada' : 'TEF Canada'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-450 text-[11px] uppercase font-black tracking-wider select-none">
                    <th className="text-left py-3 pr-4">NCLC / CLB</th>
                    <th className="text-left py-3 pr-4">CECRL</th>
                    <th className="text-left py-3 pr-4">CO</th>
                    <th className="text-left py-3 pr-4">CE</th>
                    <th className="text-left py-3 pr-4">EE</th>
                    <th className="text-left py-3">EO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 text-slate-700">
                  {['NCLC 4','NCLC 5','NCLC 6','NCLC 7','NCLC 8','NCLC 9','NCLC 10','NCLC 11','NCLC 12'].map((nclc) => {
                    const co = table.CO.find(r => r.nclc === nclc) || (nclc.startsWith('NCLC 1') ? table.CO.find(r => r.nclc === 'NCLC 10') : undefined)
                    const ce = table.CE.find(r => r.nclc === nclc) || (nclc.startsWith('NCLC 1') ? table.CE.find(r => r.nclc === 'NCLC 10') : undefined)
                    const ee = table.EE.find(r => r.nclc === nclc) || (nclc.startsWith('NCLC 1') ? table.EE.find(r => r.nclc === 'NCLC 10') : undefined)
                    const eo = table.EO.find(r => r.nclc === nclc) || (nclc.startsWith('NCLC 1') ? table.EO.find(r => r.nclc === 'NCLC 10') : undefined)
                    return (
                      <tr key={nclc} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-3 pr-4 font-bold text-[#1B3A6B]">{nclc}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${levelColor[co?.cecrl || 'B1'] || ''}`}>
                            {co?.cecrl || '—'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-600 font-semibold text-xs">{co ? `${co.min}–${co.max}` : '—'}</td>
                        <td className="py-3 pr-4 text-slate-600 font-semibold text-xs">{ce ? `${ce.min}–${ce.max}` : '—'}</td>
                        <td className="py-3 pr-4 text-slate-600 font-semibold text-xs">{ee ? `${ee.min}–${ee.max}` : '—'}</td>
                        <td className="py-3 text-slate-600 font-semibold text-xs">{eo ? `${eo.min}–${eo.max}` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA inscription */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 text-white text-center relative z-10 shadow-lg border border-slate-850">
            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">Prêt à atteindre le niveau que vous visez ?</p>
            <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight mb-3">
              {calculated && overallNclc
                ? `Vous êtes à NCLC ${overallNclc} — passez au niveau supérieur`
                : 'Commencez votre préparation'}
            </h3>
            <p className="opacity-80 mb-6 text-sm max-w-lg mx-auto leading-relaxed">
              Profitez de simulations officielles chronométrées, de corrections détaillées par IA, et de sujets d'actualité exclusifs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5 select-none">
              <Link
                to="/register"
                className="inline-block bg-white hover:bg-slate-50 text-slate-900 font-extrabold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 text-sm"
              >
                Créer mon compte gratuit →
              </Link>
              <Link
                to="/simulateur-crs"
                className="inline-block border border-white/20 hover:border-white text-white font-extrabold py-3.5 px-8 rounded-xl transition-all hover:bg-white/5 active:scale-95 text-sm"
              >
                Simuler mes points CRS 🍁
              </Link>
            </div>
          </div>

          {/* Informations légales */}
          <p className="text-center text-xs text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mt-8">
            Les tables de conversion sont basées sur les barèmes officiels IRCC 2026.
            Ce calculateur est fourni à titre indicatif.
            Consultez le site officiel d'<a href="https://www.canada.ca/fr/immigration-refugies-citoyennete.html" target="_blank" rel="noopener noreferrer" className="underline font-bold text-slate-500 hover:text-slate-700 transition-colors">IRCC</a> pour les informations officielles.
          </p>
        </div>
      </div>
    </>
  )
}

