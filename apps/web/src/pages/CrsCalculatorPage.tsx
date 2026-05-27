import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// ── Types et Interfaces ────────────────────────────────────────────────
interface CrsInputs {
  hasSpouse: boolean
  age: number
  education: string
  canadianWorkYears: number
  foreignWorkYears: number
  frenchListening: number  // NCLC 4 à 10
  frenchReading: number
  frenchWriting: number
  frenchSpeaking: number
  englishListening: number // CLB 0 à 10
  englishReading: number
  englishWriting: number
  englishSpeaking: number
  spouseEducation: string
  spouseCanadianWorkYears: number
  spouseLanguageLevel: number // CLB/NCLC moyen
  hasSiblingInCanada: boolean
  canadianStudy: 'none' | '1-2years' | '3+years'
  arrangedEmployment: 'none' | 'teer123' | 'teer00'
  provincialNomination: boolean
}

const DEFAULT_INPUTS: CrsInputs = {
  hasSpouse: false,
  age: 28,
  education: 'bachelors',
  canadianWorkYears: 0,
  foreignWorkYears: 2,
  frenchListening: 0,  // Non évalué ou inférieur à NCLC 4
  frenchReading: 0,
  frenchWriting: 0,
  frenchSpeaking: 0,
  englishListening: 7, // CLB 7 par défaut
  englishReading: 7,
  englishWriting: 7,
  englishSpeaking: 7,
  spouseEducation: 'none',
  spouseCanadianWorkYears: 0,
  spouseLanguageLevel: 0,
  hasSiblingInCanada: false,
  canadianStudy: 'none',
  arrangedEmployment: 'none',
  provincialNomination: false
}

// ── Barèmes Officiels IRCC (2026) ──────────────────────────────────────
const AGE_TABLE: Record<number, { single: number; spouse: number }> = {
  17: { single: 0, spouse: 0 },
  18: { single: 99, spouse: 90 },
  19: { single: 105, spouse: 95 },
  20: { single: 110, spouse: 100 },
  21: { single: 110, spouse: 100 },
  22: { single: 110, spouse: 100 },
  23: { single: 110, spouse: 100 },
  24: { single: 110, spouse: 100 },
  25: { single: 110, spouse: 100 },
  26: { single: 110, spouse: 100 },
  27: { single: 110, spouse: 100 },
  28: { single: 110, spouse: 100 },
  29: { single: 110, spouse: 100 },
  30: { single: 105, spouse: 95 },
  31: { single: 99, spouse: 90 },
  32: { single: 94, spouse: 85 },
  33: { single: 88, spouse: 80 },
  34: { single: 83, spouse: 75 },
  35: { single: 77, spouse: 70 },
  36: { single: 72, spouse: 65 },
  37: { single: 66, spouse: 60 },
  38: { single: 61, spouse: 55 },
  39: { single: 55, spouse: 50 },
  40: { single: 50, spouse: 45 },
  41: { single: 39, spouse: 35 },
  42: { single: 28, spouse: 25 },
  43: { single: 17, spouse: 15 },
  44: { single: 6, spouse: 5 }
}

const EDUCATION_TABLE: Record<string, { single: number; spouse: number }> = {
  none: { single: 0, spouse: 0 },
  highschool: { single: 30, spouse: 28 },
  diploma1yr: { single: 90, spouse: 84 },
  diploma2yr: { single: 98, spouse: 91 },
  bachelors: { single: 120, spouse: 112 },
  two_degrees: { single: 128, spouse: 119 },
  masters: { single: 135, spouse: 126 },
  phd: { single: 150, spouse: 140 }
}

const SPOUSE_EDUCATION_TABLE: Record<string, number> = {
  none: 0,
  highschool: 2,
  diploma1yr: 6,
  diploma2yr: 7,
  bachelors: 8,
  two_degrees: 9,
  masters: 9,
  phd: 10
}

// Points par compétence de langue (CO, CE, EE, EO)
function getLanguagePoints(level: number, isFirstLanguage: boolean, hasSpouse: boolean): number {
  if (isFirstLanguage) {
    // Premier choix de langue
    if (level < 4) return 0
    if (level === 4 || level === 5) return 6
    if (level === 6) return hasSpouse ? 8 : 9
    if (level === 7) return hasSpouse ? 16 : 17
    if (level === 8) return hasSpouse ? 22 : 23
    if (level === 9) return hasSpouse ? 29 : 31
    return hasSpouse ? 32 : 34 // NCLC 10+
  } else {
    // Deuxième choix de langue
    if (level < 5) return 0
    if (level === 5 || level === 6) return 1
    if (level === 7 || level === 8) return 3
    return 6 // CLB 9+
  }
}

// Expérience canadienne
function getCanadianWorkPoints(years: number, hasSpouse: boolean): number {
  if (years === 0) return 0
  if (years === 1) return hasSpouse ? 35 : 40
  if (years === 2) return hasSpouse ? 46 : 53
  if (years === 3) return hasSpouse ? 56 : 64
  if (years === 4) return hasSpouse ? 63 : 72
  return hasSpouse ? 70 : 80 // 5 ans+
}

export default function CrsCalculatorPage() {
  const { user } = useAuthStore()
  const [inputs, setInputs] = useState<CrsInputs>(DEFAULT_INPUTS)
  const [calculated, setCalculated] = useState(false)
  const [targetFrenchNclc, setTargetFrenchNclc] = useState(9) // Curseur "Et si..."

  // ── Engine de Calcul CRS ───────────────────────────────────────────────
  const computeScore = (currentInputs: CrsInputs) => {
    const { hasSpouse } = currentInputs

    // 1. Âge
    const agePoints = currentInputs.age >= 45 ? 0 : (AGE_TABLE[currentInputs.age] ? (hasSpouse ? AGE_TABLE[currentInputs.age].spouse : AGE_TABLE[currentInputs.age].single) : 0)

    // 2. Éducation
    const eduPoints = EDUCATION_TABLE[currentInputs.education] ? (hasSpouse ? EDUCATION_TABLE[currentInputs.education].spouse : EDUCATION_TABLE[currentInputs.education].single) : 0

    // 3. Première langue officielle (Français)
    const frL = getLanguagePoints(currentInputs.frenchListening, true, hasSpouse)
    const frR = getLanguagePoints(currentInputs.frenchReading, true, hasSpouse)
    const frW = getLanguagePoints(currentInputs.frenchWriting, true, hasSpouse)
    const frS = getLanguagePoints(currentInputs.frenchSpeaking, true, hasSpouse)
    const frenchTotal = frL + frR + frW + frS

    // 4. Deuxième langue officielle (Anglais)
    const enL = getLanguagePoints(currentInputs.englishListening, false, hasSpouse)
    const enR = getLanguagePoints(currentInputs.englishReading, false, hasSpouse)
    const enW = getLanguagePoints(currentInputs.englishWriting, false, hasSpouse)
    const enS = getLanguagePoints(currentInputs.englishSpeaking, false, hasSpouse)
    const englishTotal = enL + enR + enW + enS

    // 5. Expérience de travail au Canada
    const canadianWorkPoints = getCanadianWorkPoints(currentInputs.canadianWorkYears, hasSpouse)

    // ── Conjoint (Spouse factors) ──
    let spouseTotal = 0
    let spouseEdu = 0
    let spouseLang = 0
    let spouseWork = 0

    if (hasSpouse) {
      spouseEdu = SPOUSE_EDUCATION_TABLE[currentInputs.spouseEducation] || 0
      // Langue conjoint (CLB moyen simplifié)
      spouseLang = currentInputs.spouseLanguageLevel >= 9 ? 20 : (currentInputs.spouseLanguageLevel >= 7 ? 12 : (currentInputs.spouseLanguageLevel >= 5 ? 4 : 0))
      // Expérience conjoint
      spouseWork = currentInputs.spouseCanadianWorkYears >= 3 ? 10 : (currentInputs.spouseCanadianWorkYears === 2 ? 8 : (currentInputs.spouseCanadianWorkYears === 1 ? 5 : 0))
      spouseTotal = spouseEdu + spouseLang + spouseWork
    }

    // ── Facteurs de transférabilité (Max 100 points combinés) ──
    // A. Éducation + Langue
    let eduLangPoints = 0
    const allFrenchNclc7 = currentInputs.frenchListening >= 7 && currentInputs.frenchReading >= 7 && currentInputs.frenchWriting >= 7 && currentInputs.frenchSpeaking >= 7
    const allFrenchNclc9 = currentInputs.frenchListening >= 9 && currentInputs.frenchReading >= 9 && currentInputs.frenchWriting >= 9 && currentInputs.frenchSpeaking >= 9

    const hasDegree = currentInputs.education !== 'none' && currentInputs.education !== 'highschool'
    const hasMultipleDegrees = currentInputs.education === 'two_degrees' || currentInputs.education === 'masters' || currentInputs.education === 'phd'

    if (hasDegree) {
      if (allFrenchNclc9) {
        eduLangPoints = hasMultipleDegrees ? 50 : 25
      } else if (allFrenchNclc7) {
        eduLangPoints = hasMultipleDegrees ? 25 : 13
      }
    }

    // B. Éducation + Expérience canadienne
    let eduCanWorkPoints = 0
    if (hasDegree && currentInputs.canadianWorkYears > 0) {
      if (currentInputs.canadianWorkYears >= 2) {
        eduCanWorkPoints = hasMultipleDegrees ? 50 : 25
      } else {
        eduCanWorkPoints = hasMultipleDegrees ? 25 : 13
      }
    }

    // C. Expérience étrangère + Langue
    let foreignWorkLangPoints = 0
    if (currentInputs.foreignWorkYears > 0) {
      if (allFrenchNclc9) {
        foreignWorkLangPoints = currentInputs.foreignWorkYears >= 3 ? 50 : 25
      } else if (allFrenchNclc7) {
        foreignWorkLangPoints = currentInputs.foreignWorkYears >= 3 ? 25 : 13
      }
    }

    // D. Expérience étrangère + Expérience canadienne
    let foreignCanWorkPoints = 0
    if (currentInputs.foreignWorkYears > 0 && currentInputs.canadianWorkYears > 0) {
      if (currentInputs.canadianWorkYears >= 2) {
        foreignCanWorkPoints = currentInputs.foreignWorkYears >= 3 ? 50 : 25
      } else {
        foreignCanWorkPoints = currentInputs.foreignWorkYears >= 3 ? 25 : 13
      }
    }

    const transferabilityTotal = Math.min(100, eduLangPoints + eduCanWorkPoints + foreignWorkLangPoints + foreignCanWorkPoints)

    // ── Facteurs additionnels (Max 600 points) ──
    let additionalTotal = 0

    // Bonus bilinguisme (Français + Anglais)
    // NCLC 7+ en français est nécessaire pour ce bonus
    if (allFrenchNclc7) {
      const allEnglishClb5 = currentInputs.englishListening >= 5 && currentInputs.englishReading >= 5 && currentInputs.englishWriting >= 5 && currentInputs.englishSpeaking >= 5
      additionalTotal += allEnglishClb5 ? 50 : 25
    }

    // Frère/sœur au Canada
    if (currentInputs.hasSiblingInCanada) additionalTotal += 15

    // Études au Canada
    if (currentInputs.canadianStudy === '1-2years') additionalTotal += 15
    if (currentInputs.canadianStudy === '3+years') additionalTotal += 30

    // Emploi réservé
    if (currentInputs.arrangedEmployment === 'teer123') additionalTotal += 50
    if (currentInputs.arrangedEmployment === 'teer00') additionalTotal += 200

    // Nomination provinciale
    if (currentInputs.provincialNomination) additionalTotal += 600

    additionalTotal = Math.min(600, additionalTotal)

    // Total Global
    const coreCapitalTotal = agePoints + eduPoints + frenchTotal + englishTotal + canadianWorkPoints
    const grandTotal = coreCapitalTotal + spouseTotal + transferabilityTotal + additionalTotal

    return {
      agePoints,
      eduPoints,
      frenchTotal,
      englishTotal,
      canadianWorkPoints,
      spouseTotal,
      transferabilityTotal,
      additionalTotal,
      grandTotal
    }
  }

  const currentScore = computeScore(inputs)

  // Calcul du score simulé
  const simulatedInputs: CrsInputs = {
    ...inputs,
    frenchListening: targetFrenchNclc,
    frenchReading: targetFrenchNclc,
    frenchWriting: targetFrenchNclc,
    frenchSpeaking: targetFrenchNclc
  }
  const simulatedScore = computeScore(simulatedInputs)
  const scoreDiff = simulatedScore.grandTotal - currentScore.grandTotal

  const handleInputChange = (field: keyof CrsInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-5 select-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-sm uppercase tracking-wide">
            <svg viewBox="0 0 40 40" className="w-8 h-8 text-[#2E75B6] fill-current">
              <path d="M20 2 L23 12 L33 8 L26 17 L36 22 L26 27 L33 36 L23 32 L20 42 L17 32 L7 36 L14 27 L4 22 L14 17 L7 8 L17 12 Z" />
            </svg>
            Francophonie Academia
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/calculateur-nclc" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              Convertir TCF/TEF en NCLC
            </Link>
            <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 rounded-xl text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all">
              Créer un compte gratuit
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-blue-450 hover:text-blue-300 font-bold transition-colors select-none mb-6">
          ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
        </Link>
        {/* Titre principal */}
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4 border border-blue-500/20">
            Immigration Canada — Entrée Express 2026
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Simulateur de points CRS / SCG
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Estimez instantanément vos points d'immigration pour le bassin Entrée Express. Découvrez l'impact d'un excellent score en français (TCF/TEF).
          </p>
        </div>

        {/* Section Interactive principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Formulaire de saisie - 2 colonnes sur large */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Profil de base */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold">1</span>
                Informations Personnelles
              </h2>

              <div className="space-y-4">
                {/* Spouse toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                  <div>
                    <p className="text-sm font-bold text-white">Situation familiale</p>
                    <p className="text-xs text-slate-400">Avez-vous un conjoint de fait qui vous accompagne au Canada ?</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('hasSpouse', !inputs.hasSpouse)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      inputs.hasSpouse 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/10' 
                        : 'bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900'
                    }`}
                  >
                    {inputs.hasSpouse ? 'Avec Conjoint' : 'Célibataire'}
                  </button>
                </div>

                {/* Age & Education grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Âge ({inputs.age} ans)</label>
                    <input
                      type="range"
                      min={17}
                      max={50}
                      value={inputs.age}
                      onChange={e => handleInputChange('age', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1.5">
                      <span>17 ans</span>
                      <span className="text-blue-400">{inputs.age} ans</span>
                      <span>50 ans</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Niveau d'études</label>
                    <select
                      value={inputs.education}
                      onChange={e => handleInputChange('education', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                    >
                      <option value="none">Aucun ou inférieur au diplôme d'études secondaires</option>
                      <option value="highschool">Diplôme d'études secondaires (lycée)</option>
                      <option value="diploma1yr">Diplôme d'un an post-secondaire</option>
                      <option value="diploma2yr">Diplôme de deux ans post-secondaire</option>
                      <option value="bachelors">Baccalauréat universitaire (Licence / Bachelor - 3 ans+)</option>
                      <option value="two_degrees">Deux diplômes ou plus (dont un de 3 ans+)</option>
                      <option value="masters">Maîtrise (Master / Bac+5)</option>
                      <option value="phd">Doctorat (Ph.D.)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Expérience de travail */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold">2</span>
                Expérience Professionnelle
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Au Canada</label>
                  <select
                    value={inputs.canadianWorkYears}
                    onChange={e => handleInputChange('canadianWorkYears', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  >
                    <option value={0}>Aucune</option>
                    <option value={1}>1 an</option>
                    <option value={2}>2 ans</option>
                    <option value={3}>3 ans</option>
                    <option value={4}>4 ans</option>
                    <option value={5}>5 ans ou plus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">À l'étranger (Hors Canada)</label>
                  <select
                    value={inputs.foreignWorkYears}
                    onChange={e => handleInputChange('foreignWorkYears', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  >
                    <option value={0}>Aucune</option>
                    <option value={1}>1 an</option>
                    <option value={2}>2 ans</option>
                    <option value={3}>3 ans ou plus</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Compétences Linguistiques */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold">3</span>
                Compétences Linguistiques (Niveaux NCLC/CLB)
              </h2>

              {/* Français (First official language) */}
              <div className="p-5 bg-blue-950/20 border border-blue-550/15 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-blue-300 flex items-center gap-2">
                    🇫🇷 Français (Première langue)
                  </p>
                  <Link to="/calculateur-nclc" className="text-[10px] font-bold text-blue-400 hover:underline">
                    Vous ne connaissez pas vos niveaux ?
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: '🎧 Écoute (CO)', field: 'frenchListening' },
                    { label: '📖 Lecture (CE)', field: 'frenchReading' },
                    { label: '✍️ Écriture (EE)', field: 'frenchWriting' },
                    { label: '🎤 Parole (EO)', field: 'frenchSpeaking' },
                  ].map(item => (
                    <div key={item.field} className="space-y-1">
                      <label className="block text-[10px] font-extrabold text-slate-450 uppercase">{item.label}</label>
                      <select
                        value={inputs[item.field as keyof CrsInputs] as number}
                        onChange={e => handleInputChange(item.field as keyof CrsInputs, parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={0}>Aucun / &lt; NCLC 4</option>
                        <option value={4}>NCLC 4</option>
                        <option value={5}>NCLC 5</option>
                        <option value={6}>NCLC 6</option>
                        <option value={7}>NCLC 7</option>
                        <option value={8}>NCLC 8</option>
                        <option value={9}>NCLC 9</option>
                        <option value={10}>NCLC 10 ou +</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anglais (Second official language) */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                <p className="text-sm font-bold text-slate-300">
                  🇬🇧 Anglais (Deuxième langue)
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: '🎧 Écoute (Listening)', field: 'englishListening' },
                    { label: '📖 Lecture (Reading)', field: 'englishReading' },
                    { label: '✍️ Écriture (Writing)', field: 'englishWriting' },
                    { label: '🎤 Parole (Speaking)', field: 'englishSpeaking' },
                  ].map(item => (
                    <div key={item.field} className="space-y-1">
                      <label className="block text-[10px] font-extrabold text-slate-450 uppercase">{item.label}</label>
                      <select
                        value={inputs[item.field as keyof CrsInputs] as number}
                        onChange={e => handleInputChange(item.field as keyof CrsInputs, parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-700"
                      >
                        <option value={0}>Aucun / &lt; CLB 4</option>
                        <option value={5}>CLB 5</option>
                        <option value={6}>CLB 6</option>
                        <option value={7}>CLB 7</option>
                        <option value={8}>CLB 8</option>
                        <option value={9}>CLB 9 ou +</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Conjoint (Si coché) */}
            {inputs.hasSpouse && (
              <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4 animate-fade-in">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="bg-blue-500/20 text-blue-400 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold">4</span>
                  Profil du Conjoint
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Éducation Conjoint</label>
                    <select
                      value={inputs.spouseEducation}
                      onChange={e => handleInputChange('spouseEducation', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-355 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="none">Aucun / Secondaire</option>
                      <option value="diploma1yr">Diplôme d'un an</option>
                      <option value="diploma2yr">Diplôme de deux ans</option>
                      <option value="bachelors">Licence (Bachelor)</option>
                      <option value="masters">Master</option>
                      <option value="phd">Doctorat (Ph.D.)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expérience Canada Conjoint</label>
                    <select
                      value={inputs.spouseCanadianWorkYears}
                      onChange={e => handleInputChange('spouseCanadianWorkYears', parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-355 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value={0}>Aucune</option>
                      <option value={1}>1 an</option>
                      <option value={2}>2 ans</option>
                      <option value={3}>3 ans ou plus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Niveau de Langue Conjoint</label>
                    <select
                      value={inputs.spouseLanguageLevel}
                      onChange={e => handleInputChange('spouseLanguageLevel', parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-355 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value={0}>Inférieur à NCLC/CLB 5</option>
                      <option value={5}>NCLC/CLB 5 ou 6</option>
                      <option value={7}>NCLC/CLB 7 ou 8</option>
                      <option value={9}>NCLC/CLB 9 ou plus</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Facteurs additionnels */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold">
                  {inputs.hasSpouse ? '5' : '4'}
                </span>
                Facteurs Additionnels (Bonus)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sibling & Nomination */}
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3.5 bg-slate-900/40 rounded-2xl border border-slate-800/80 cursor-pointer select-none">
                    <div>
                      <span className="text-xs font-bold text-white block">Frère / Sœur au Canada</span>
                      <span className="text-[10px] text-slate-500">Résident permanent ou citoyen canadien</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={inputs.hasSiblingInCanada}
                      onChange={e => handleInputChange('hasSiblingInCanada', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-750 bg-slate-900 text-blue-500 focus:ring-0 focus:ring-offset-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-900/40 rounded-2xl border border-slate-800/80 cursor-pointer select-none">
                    <div>
                      <span className="text-xs font-bold text-white block">Désignation Provinciale (PNP)</span>
                      <span className="text-[10px] text-slate-500">Un certificat de nomination provinciale (+600 pts)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={inputs.provincialNomination}
                      onChange={e => handleInputChange('provincialNomination', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-750 bg-slate-900 text-blue-500 focus:ring-0 focus:ring-offset-0"
                    />
                  </label>
                </div>

                {/* Canadian study & Arranged Employment */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Études au Canada</label>
                    <select
                      value={inputs.canadianStudy}
                      onChange={e => handleInputChange('canadianStudy', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="none">Aucun diplôme d'études obtenu au Canada</option>
                      <option value="1-2years">Diplôme ou certificat d'études de 1 ou 2 ans</option>
                      <option value="3+years">Diplôme de 3 ans ou plus (Bachelor, Master, PhD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Offre d'emploi réservé</label>
                    <select
                      value={inputs.arrangedEmployment}
                      onChange={e => handleInputChange('arrangedEmployment', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="none">Aucune offre d'emploi ou non admissible</option>
                      <option value="teer123">Offre d'emploi TEER 1, 2 ou 3 (50 points)</option>
                      <option value="teer00">Offre d'emploi TEER 00 de direction (200 points)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCalculated(true)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl font-extrabold text-sm hover:opacity-95 shadow-xl shadow-blue-600/20 active:scale-[0.99] transition-all"
            >
              Calculer mon score global CRS
            </button>
          </div>

          {/* Panneau de résultats et simulation interactive */}
          <div className="space-y-6">
            
            {/* Résultats du score */}
            {calculated && (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 bg-[#2E75B6]/10 text-[#2E75B6] text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-slate-800">
                  Total
                </div>
                
                <h3 className="font-extrabold text-white text-base mb-4">Votre Score Estimé</h3>
                
                <div className="text-center py-6 bg-slate-900 rounded-2xl border border-slate-800/80 mb-6">
                  <div className="text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    {currentScore.grandTotal}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-1">points sur 1200</div>
                </div>

                {/* Détails par catégorie */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-2">
                    <span>Facteurs humains de base</span>
                    <span className="font-extrabold text-white">{currentScore.agePoints + currentScore.eduPoints + currentScore.frenchTotal + currentScore.englishTotal + currentScore.canadianWorkPoints} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-2">
                    <span>Facteurs conjoint</span>
                    <span className="font-extrabold text-white">{currentScore.spouseTotal} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-2">
                    <span>Transférabilité des compétences</span>
                    <span className="font-extrabold text-white">{currentScore.transferabilityTotal} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-2">
                    <span>Facteurs additionnels / Bonus</span>
                    <span className="font-extrabold text-white">{currentScore.additionalTotal} pts</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 rounded-xl">
                  💡 <strong>Indication :</strong> Le seuil de tirage typique se situe actuellement entre <strong>490 et 540 points</strong>. Les tirages ciblant le français (bilingues) ont souvent des seuils beaucoup plus bas (autour de <strong>360 à 440 points</strong>) !
                </div>
              </div>
            )}

            {/* Simulateur interactif "Et si..." (WOW FACTOR) */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <div>
                  <h3 className="font-extrabold text-white text-sm">Simulateur d'Objectif</h3>
                  <p className="text-[10px] text-slate-450">Découvrez l'effet de votre progression en français</p>
                </div>
              </div>

              {/* Slider de simulation */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-400">Objectif français :</span>
                    <span className="text-blue-400">NCLC {targetFrenchNclc}</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={10}
                    value={targetFrenchNclc}
                    onChange={e => setTargetFrenchNclc(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1">
                    <span>NCLC 4</span>
                    <span>NCLC 7 (Seuil)</span>
                    <span>NCLC 9 (Objectif)</span>
                    <span>NCLC 10</span>
                  </div>
                </div>

                {/* Score gain display */}
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800/80 text-center space-y-1">
                  <p className="text-xs text-slate-400">Votre score estimé avec cet objectif :</p>
                  <p className="text-4xl font-extrabold text-white">
                    {simulatedScore.grandTotal} <span className="text-xs font-bold text-slate-500">pts</span>
                  </p>
                  
                  {scoreDiff > 0 ? (
                    <div className="inline-block mt-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs px-3 py-1 rounded-full animate-bounce">
                      🚀 Gain de +{scoreDiff} points !
                    </div>
                  ) : scoreDiff < 0 ? (
                    <div className="inline-block mt-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold text-xs px-3 py-1 rounded-full">
                      ⚠️ Actuellement configuré à un niveau supérieur
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-2">C'est votre niveau actuel configuré à gauche</p>
                  )}
                </div>

                {/* Explication du gain */}
                {scoreDiff > 0 && (
                  <div className="text-xs text-slate-450 leading-relaxed space-y-2 select-none">
                    <p className="font-bold text-slate-300">Comment ce gain s'explique :</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {targetFrenchNclc >= 7 && (
                        <li><strong>Bonus Bilingue IRCC :</strong> Déblocage automatique de +25 à +50 points additionnels.</li>
                      )}
                      <li><strong>Compétences accrues :</strong> Augmentation des points du capital humain (+31 à +34 points par épreuve).</li>
                      {targetFrenchNclc >= 7 && inputs.education !== 'none' && inputs.education !== 'highschool' && (
                        <li><strong>Transférabilité d'études :</strong> Déblocage de points bonus combinés (+25 à +50 points).</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* CTA direct vers la préparation */}
              <div className="bg-gradient-to-b from-blue-900/30 to-slate-900 border border-blue-500/20 rounded-2xl p-5 text-center space-y-4">
                <div>
                  <p className="text-xs font-bold text-blue-300">Prêt à décrocher votre visa canadien ?</p>
                  <p className="text-[10px] text-slate-400 mt-1">Atteignez le niveau NCLC {targetFrenchNclc === 9 ? '9' : '9 ou plus'} grâce à notre programme de préparation intensif.</p>
                </div>
                <Link
                  to="/register"
                  className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-95 shadow-md shadow-emerald-500/10 transition-all text-center"
                >
                  S'inscrire gratuitement &amp; s'entraîner
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Notes explicatives sur le barème */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-3xl p-6 mt-12 text-xs text-slate-400 space-y-4 select-none">
          <h4 className="font-bold text-white text-sm">À propos du barème de calcul CRS (Comprehensive Ranking System)</h4>
          <p>Le CRS est le système basé sur des points utilisé par le gouvernement canadien pour évaluer et classer les candidats dans le bassin d'Entrée Express. Les points sont calculés en fonction des informations fournies (âge, niveau d'études, compétences linguistiques, expérience de travail).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
            <div>
              <p className="font-bold text-slate-300 mb-1">Règle du Bilinguisme d'Immigration Canada :</p>
              <p>IRCC accorde une importance critique au français. Si vous atteignez un niveau minimum de <strong>NCLC 7 dans les 4 compétences</strong> (Compréhension Orale, Écrite, Expression Écrite, Orale) en français, vous gagnez un bonus automatique de <strong>25 points</strong> (ou <strong>50 points</strong> si vous avez également un score d'anglais de CLB 5 ou supérieur).</p>
            </div>
            <div>
              <p className="font-bold text-slate-300 mb-1">Impact sur la Transférabilité :</p>
              <p>Obtenir un niveau NCLC 9 en français combiné avec un diplôme d'études universitaires ou de l'expérience professionnelle à l'étranger permet de maximiser la section "Transférabilité des compétences", débloquant des dizaines de points supplémentaires essentiels pour être invité.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
