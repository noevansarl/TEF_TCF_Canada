import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuthStore } from '../store/authStore'

// Tables de conversion officielles IRCC (2026)
const TCF_NCLC_TABLE: Record<string, { min: number; max: number; nclc: string; clb: string; cecrl: string }[]> = {
  CO: [
    { min: 0,   max: 180, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 181, max: 225, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 226, max: 269, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 270, max: 309, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 310, max: 348, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 349, max: 382, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 406, max: 458, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 459, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  CE: [
    { min: 0,   max: 180, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 181, max: 225, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 226, max: 268, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 269, max: 309, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 310, max: 347, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 348, max: 382, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 406, max: 453, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 454, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  EE: [
    { min: 0,   max: 180, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 181, max: 225, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 226, max: 270, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 271, max: 309, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 310, max: 348, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 349, max: 382, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 406, max: 457, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 458, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  EO: [
    { min: 0,   max: 180, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 181, max: 225, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 226, max: 270, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 271, max: 309, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 310, max: 348, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 349, max: 382, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 406, max: 457, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 458, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
}

const TEF_NCLC_TABLE: Record<string, { min: number; max: number; nclc: string; clb: string; cecrl: string }[]> = {
  CO: [
    { min: 0,   max: 144, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 145, max: 180, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 181, max: 216, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 217, max: 248, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 249, max: 279, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 280, max: 297, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 298, max: 315, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 316, max: 333, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 334, max: 360, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  CE: [
    { min: 0,   max: 120, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 121, max: 150, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 151, max: 180, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 181, max: 207, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 208, max: 232, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 233, max: 247, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 248, max: 262, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 263, max: 277, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 278, max: 300, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  EE: [
    { min: 0,   max: 120, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 121, max: 150, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 151, max: 180, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 181, max: 207, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 208, max: 232, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 233, max: 247, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 248, max: 262, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 263, max: 277, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 278, max: 300, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  EO: [
    { min: 0,   max: 120, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 121, max: 150, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 151, max: 180, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 181, max: 207, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 208, max: 232, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 233, max: 247, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 248, max: 262, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 263, max: 277, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 278, max: 300, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
}

function getLevel(table: typeof TCF_NCLC_TABLE, module: string, score: number) {
  const rows = table[module] || []
  return rows.find(r => score >= r.min && score <= r.max) || null
}

const levelColor: Record<string, string> = {
  'B1': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'B1+': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'B2': 'bg-blue-100 text-blue-800 border-blue-300',
  'B2+': 'bg-blue-100 text-blue-800 border-blue-300',
  'C1': 'bg-green-100 text-green-800 border-green-300',
  'C1+': 'bg-green-100 text-green-800 border-green-300',
  'C2': 'bg-purple-100 text-purple-800 border-purple-300',
}

const MODULE_LABELS: Record<string, string> = {
  CO: 'Compréhension Orale',
  CE: 'Compréhension Écrite',
  EE: 'Expression Écrite',
  EO: 'Expression Orale',
}

const TCF_MAX: Record<string, number> = { CO: 699, CE: 699, EE: 699, EO: 699 }
const TEF_MAX: Record<string, number> = { CO: 360, CE: 300, EE: 300, EO: 300 }

export default function NclcCalculatorPage() {
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
      const n = r.level?.nclc.replace('NCLC ', '') || '4'
      return parseInt(n)
    })
    return Math.min(...nums)
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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
                      <Logo />
            <Link to="/register" className="text-sm font-semibold text-[#1B3A6B] hover:underline">
              Commencer la préparation →
            </Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none mb-6">
            ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
          </Link>
          {/* Titre SEO */}
          <div className="text-center mb-10">
            <span className="inline-block bg-[#1B3A6B]/10 text-[#1B3A6B] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Outil gratuit — Sans inscription
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Calculateur NCLC / CLB
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Convertissez vos scores <strong>TCF Canada</strong> ou <strong>TEF Canada</strong> en niveaux
              NCLC/CLB officiels reconnus par <strong>IRCC</strong> (Immigration Canada).
              Tables officielles 2026.
            </p>
          </div>

          {/* Sélection type d'examen */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">1. Choisissez votre examen</h2>
            <div className="grid grid-cols-2 gap-3">
              {(['TCF_CANADA', 'TEF_CANADA'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => { setTestType(type); setCalculated(false) }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    testType === type
                      ? 'border-[#1B3A6B] bg-[#1B3A6B]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-bold ${testType === type ? 'text-[#1B3A6B]' : 'text-gray-700'}`}>
                    {type === 'TCF_CANADA' ? 'TCF Canada' : 'TEF Canada'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {type === 'TCF_CANADA'
                      ? 'France Éducation International · Score /699'
                      : 'CCI Paris Île-de-France · Score /360 (CO)'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Saisie des scores */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">2. Entrez vos scores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(MODULE_LABELS).map(([mod, label]) => (
                <div key={mod}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {label}
                    <span className="ml-2 text-xs font-normal text-gray-400">
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 focus:border-[#1B3A6B] text-gray-900"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setCalculated(true)}
              className="mt-6 w-full py-3 bg-[#1B3A6B] text-white rounded-xl font-bold hover:bg-[#152e56] transition-colors"
            >
              Calculer mes niveaux NCLC
            </button>
          </div>

          {/* Résultats */}
          {calculated && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">3. Vos résultats</h2>

              {/* Score global */}
              {allFilled && overallNclc !== null && (
                <div className="text-center bg-[#1B3A6B] text-white rounded-2xl p-6 mb-6">
                  <p className="text-sm font-semibold opacity-75 mb-1">Votre niveau global estimé</p>
                  <p className="text-4xl font-extrabold">NCLC {overallNclc}</p>
                  <p className="text-sm opacity-75 mt-1">
                    (basé sur votre module le plus faible — règle IRCC)
                  </p>
                </div>
              )}

              {/* Résultats par module */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map(({ module, score, level }) => (
                  <div key={module} className="border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {MODULE_LABELS[module]}
                    </p>
                    {score === null ? (
                      <p className="text-gray-400 text-sm italic">Score non saisi</p>
                    ) : level ? (
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-2xl font-extrabold text-[#1B3A6B]">{level.nclc}</p>
                          <p className="text-sm text-gray-500">{level.clb}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${levelColor[level.cecrl] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {level.cecrl}
                        </span>
                      </div>
                    ) : (
                      <p className="text-red-500 text-sm">Score hors plage valide</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tableau de correspondance complet */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Tableau de correspondance complet — {testType === 'TCF_CANADA' ? 'TCF Canada' : 'TEF Canada'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 text-gray-500 font-semibold">NCLC / CLB</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-semibold">CECRL</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-semibold">CO</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-semibold">CE</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-semibold">EE</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">EO</th>
                  </tr>
                </thead>
                <tbody>
                  {['NCLC 4','NCLC 5','NCLC 6','NCLC 7','NCLC 8','NCLC 9','NCLC 10','NCLC 11','NCLC 12'].map((nclc, i) => {
                    const co = table.CO[i], ce = table.CE[i], ee = table.EE[i], eo = table.EO[i]
                    return (
                      <tr key={nclc} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 pr-4 font-bold text-[#1B3A6B]">{nclc}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${levelColor[co?.cecrl] || ''}`}>
                            {co?.cecrl}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-gray-700">{co ? `${co.min}–${co.max}` : '—'}</td>
                        <td className="py-2 pr-4 text-gray-700">{ce ? `${ce.min}–${ce.max}` : '—'}</td>
                        <td className="py-2 pr-4 text-gray-700">{ee ? `${ee.min}–${ee.max}` : '—'}</td>
                        <td className="py-2 text-gray-700">{eo ? `${eo.min}–${eo.max}` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA inscription */}
          <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2E75B6] rounded-2xl p-8 text-white text-center">
            <p className="text-sm font-semibold opacity-75 mb-2">Prêt à atteindre le niveau que vous visez ?</p>
            <h3 className="text-2xl font-extrabold mb-3">
              {calculated && overallNclc
                ? `Vous êtes à NCLC ${overallNclc} — passez au niveau supérieur`
                : 'Commencez votre préparation'}
            </h3>
            <p className="opacity-80 mb-6 text-sm">
              Simulations officielles, correction IA, sujets d'actualité. Accès gratuit immédiat.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/register"
                className="inline-block bg-white text-[#1B3A6B] font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors text-sm"
              >
                Créer mon compte gratuit →
              </Link>
              <Link
                to="/simulateur-crs"
                className="inline-block border border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                Simuler mes points CRS (Entrée Express) 🍁
              </Link>
            </div>
          </div>

          {/* Informations légales */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Les tables de conversion sont basées sur les barèmes officiels IRCC 2026.
            Ce calculateur est fourni à titre indicatif.
            Consultez le site officiel d'<a href="https://www.canada.ca/fr/immigration-refugies-citoyennete.html" target="_blank" rel="noopener noreferrer" className="underline">IRCC</a> pour les informations officielles.
          </p>
        </div>
      </div>
    </>
  )
}
