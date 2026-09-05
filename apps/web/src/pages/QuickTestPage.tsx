import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { SocialShareButtons } from '../components/SocialShareButtons'
import { LeadMagnetModal } from '../components/LeadMagnetModal'
import { trackMarketingEvent } from '../lib/tracking'

// 5 questions démo de niveau B2 — sans auth requise
const DEMO_QUESTIONS = [
  {
    id: 'demo-1',
    module: 'CO',
    question: 'Dans un dialogue, Marie dit à Paul : "Tu aurais pu me prévenir avant de partir !" Quel reproche lui fait-elle ?',
    options: {
      A: "Il est parti sans lui dire au revoir",
      B: "Il ne l'a pas informée de son départ à l'avance",
      C: "Il l'a empêchée de partir avec lui",
      D: "Il est parti trop tôt le matin"
    },
    correct: 'B',
    explanation: "L'expression 'tu aurais pu me prévenir' = reprocher de ne pas avoir informé à l'avance. Le conditionnel passé exprime un regret sur une action qui aurait dû être faite."
  },
  {
    id: 'demo-2',
    module: 'CE',
    question: 'Lisez : "La candidature à l\'immigration doit être soumise dans les délais impartis, faute de quoi elle sera automatiquement rejetée." Que se passe-t-il si la candidature est tardive ?',
    options: {
      A: "Elle est examinée avec une pénalité",
      B: "Elle peut être soumise plus tard moyennant des frais",
      C: "Elle est rejetée sans examen",
      D: "Elle doit être resoumise dans un autre délai"
    },
    correct: 'C',
    explanation: "'Faute de quoi' = sinon. 'Automatiquement rejetée' = sans aucune autre procédure possible. Les délais impartis sont les délais fixés officiellement."
  },
  {
    id: 'demo-3',
    module: 'CE',
    question: 'Dans le texte suivant : "Bien que les résultats soient encourageants, les chercheurs restent prudents quant aux conclusions définitives." Quelle est l\'attitude des chercheurs ?',
    options: {
      A: "Ils sont certains que leurs résultats sont corrects",
      B: "Ils sont déçus par leurs résultats",
      C: "Ils sont satisfaits mais ne tirent pas de conclusions hâtives",
      D: "Ils abandonnent leurs recherches"
    },
    correct: 'C',
    explanation: "'Bien que' introduit une concession — les résultats sont bons MAIS les chercheurs restent mesurés. 'Prudents quant aux conclusions' = ne pas conclure trop vite."
  },
  {
    id: 'demo-4',
    module: 'CO',
    question: 'Une annonce dit : "En raison de travaux sur la ligne 5, les voyageurs sont priés d\'emprunter la ligne 3 jusqu\'à la station Concordia, puis de prendre la navette de remplacement." Que doivent faire les voyageurs ?',
    options: {
      A: "Prendre uniquement la ligne 3 jusqu'à leur destination",
      B: "Attendre la fin des travaux avant de voyager",
      C: "Prendre la ligne 3 puis une navette à partir de Concordia",
      D: "Contacter le service client pour les instructions"
    },
    correct: 'C',
    explanation: "Comprendre une annonce avec une séquence d'actions : d'abord ligne 3 jusqu'à Concordia, ensuite navette de remplacement. Deux étapes successives."
  },
  {
    id: 'demo-5',
    module: 'CE',
    question: 'Extrait : "Le gouvernement a annoncé une hausse de 3% du SMIC, mesure saluité par les syndicats mais jugée insuffisante par les associations de travailleurs précaires." Quel groupe est INSATISFAIT de cette décision ?',
    options: {
      A: "Le gouvernement",
      B: "Les syndicats",
      C: "Les associations de travailleurs précaires",
      D: "Le patronat"
    },
    correct: 'C',
    explanation: "'Jugée insuffisante' = pas assez selon eux = insatisfaction. 'Saluée' par les syndicats = ils approuvent. Les associations de précaires estiment que la hausse n'est pas assez importante."
  }
]

const MODULE_COLORS: Record<string, string> = {
  CO: 'border-blue-500/20 bg-blue-500/10 text-blue-450',
  CE: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
}

const NCLC_ESTIMATE = [
  { min: 0, max: 1, nclc: 'NCLC 6', message: 'Bon début ! Il y a encore beaucoup à apprendre.', color: 'text-amber-400' },
  { min: 2, max: 2, nclc: 'NCLC 7', message: 'Niveau intermédiaire. Vous progressez bien !', color: 'text-blue-400' },
  { min: 3, max: 3, nclc: 'NCLC 8', message: 'Bon niveau ! Vous êtes sur la bonne voie.', color: 'text-indigo-400' },
  { min: 4, max: 4, nclc: 'NCLC 9', message: 'Très bon niveau ! L\'objectif C1 est proche.', color: 'text-emerald-400' },
  { min: 5, max: 5, nclc: 'NCLC 10+', message: 'Excellent ! Vous avez le niveau C1/C2.', color: 'text-teal-400' },
]

export default function QuickTestPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const question = DEMO_QUESTIONS[currentIndex]
  const selected = answers[question.id]
  const isLast = currentIndex === DEMO_QUESTIONS.length - 1

  const score = DEMO_QUESTIONS.filter(q => answers[q.id] === q.correct).length
  const estimate = NCLC_ESTIMATE.find(e => score >= e.min && score <= e.max) || NCLC_ESTIMATE[0]

  const handleAnswer = (opt: string) => {
    if (selected) return
    setAnswers(prev => ({ ...prev, [question.id]: opt }))
    setShowExplanation(true)
  }

  const next = () => {
    setShowExplanation(false)
    if (isLast) {
      setShowResult(true)
      trackMarketingEvent('quick_test_completed', {
        score,
        estimated_nclc: estimate.nclc
      })
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 relative overflow-hidden">
        {/* Decorative Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

        <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-850 px-6 py-4 sticky top-0 z-40 relative z-10 select-none">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Logo />
            <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="max-w-xl w-full space-y-6">
            {/* Score */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-8 text-center shadow-xl">
              <div className="text-6xl mb-4 select-none">
                {score === 5 ? '🏆' : score >= 3 ? '🎯' : '📚'}
              </div>
              <h1 className="text-2xl font-black text-white font-display mb-2">
                {score} / 5 bonnes réponses
              </h1>
              <p className={`text-xl font-extrabold mb-2 ${estimate.color}`}>
                Estimation : {estimate.nclc}
              </p>
              <p className="text-slate-400 text-sm font-semibold">{estimate.message}</p>

              {/* Barre progression */}
              <div className="mt-6 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-md shadow-blue-500/20"
                  style={{ width: `${(score / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Partage viral sur WhatsApp / Réseaux */}
            <SocialShareButtons
              title="Partager mon résultat au mini-test"
              text={`🍁 J'ai obtenu ${score}/5 au mini-test gratuit TCF/TEF Canada sur ayePREP (niveau estimé : ${estimate.nclc}) ! Testez gratuitement votre niveau de français en 3 minutes :`}
              url="https://ayeprep.com/test-rapide"
            />

            {/* Lead Magnet Checklist */}
            <LeadMagnetModal
              inline={true}
              suggestedNclc={estimate.nclc}
            />

            {/* Résumé des réponses */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-6 shadow-xl">
              <h2 className="font-bold text-white mb-4 font-display text-sm">Détail de vos réponses</h2>
              <div className="space-y-2.5">
                {DEMO_QUESTIONS.map((q, i) => {
                  const userAns = answers[q.id]
                  const correct = userAns === q.correct
                  return (
                    <div key={q.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      correct 
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-450' 
                        : 'bg-rose-500/5 border-rose-500/10 text-rose-450'
                    }`}>
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        correct ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}>
                        {correct ? '✓' : '✗'}
                      </span>
                      <span className="text-xs font-bold">Question {i + 1} — {q.module}</span>
                      {!correct && (
                        <span className="ml-auto text-[10px] bg-slate-950/60 border border-slate-850 text-slate-450 px-2 py-0.5 rounded-md font-semibold">
                          Bonne réponse : {q.correct}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl pointer-events-none select-none"></div>
              <h3 className="text-xl font-black text-white mb-2 font-display">
                {score < 4
                  ? `Passez de ${estimate.nclc} à NCLC 10 avec nous`
                  : 'Atteignez NCLC 12 avec une préparation complète'}
              </h3>
              <p className="text-slate-350 text-xs mb-6 font-semibold leading-relaxed">
                Ce test ne comprend que 5 questions. Notre plateforme complète propose plus de 2 000 sujets officiels, corrections intelligentes par IA et simulations complètes.
              </p>
              <Link
                to="/register"
                className="inline-block bg-gradient-to-r from-blue-600 to-sky-500 text-white font-extrabold text-xs py-3 px-8 rounded-xl hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all select-none uppercase tracking-wider"
              >
                Créer mon compte gratuit →
              </Link>
              <p className="text-[10px] text-slate-550 mt-3 font-semibold select-none">Sans carte bancaire · Accès immédiat</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-850 px-6 py-4 sticky top-0 z-40 relative z-10 select-none">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Accueil
          </Link>
          <span className="text-xs text-slate-450 font-extrabold tracking-wider uppercase">
            Test gratuit · {currentIndex + 1} / {DEMO_QUESTIONS.length}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        {/* Barre de progression */}
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-550"
            style={{ width: `${((currentIndex) / DEMO_QUESTIONS.length) * 100}%` }}
          ></div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
          {/* Header question */}
          <div className="p-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3 mb-4 select-none">
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${MODULE_COLORS[question.module]}`}>
                {question.module === 'CO' ? 'Compréhension Orale' : 'Compréhension Écrite'}
              </span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-850">Niveau B2</span>
            </div>
            <p className="text-white font-bold leading-relaxed text-sm md:text-base font-display">{question.question}</p>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {Object.entries(question.options).map(([key, value]) => {
              let style = 'border-slate-850 bg-slate-950/40 text-slate-300 hover:border-blue-500/40 hover:bg-slate-900/40'
              if (selected) {
                if (key === question.correct) {
                  style = 'border-emerald-500/80 bg-emerald-500/10 text-emerald-450'
                } else if (key === selected) {
                  style = 'border-rose-500/80 bg-rose-500/10 text-rose-450'
                } else {
                  style = 'border-slate-900 bg-slate-950/20 text-slate-500 opacity-50'
                }
              }

              return (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  disabled={!!selected}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 text-xs font-semibold transition-all ${style} disabled:cursor-default cursor-pointer`}
                >
                  <span className="font-extrabold mr-2 text-sm">{key}.</span> {value}
                </button>
              )
            })}
          </div>

          {/* Explication */}
          {showExplanation && (
            <div className={`mx-6 mb-4 p-4 rounded-2xl border ${
              selected === question.correct 
                ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400' 
                : 'bg-orange-500/5 border-orange-500/15 text-orange-400'
            }`}>
              <p className="text-xs font-black mb-1 select-none">
                {selected === question.correct ? '✓ Bravo !' : `✗ La bonne réponse est ${question.correct}.`}
              </p>
              <p className="text-xs font-semibold leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 pb-6 select-none">
            {selected && (
              <button
                onClick={next}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-650 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:opacity-95 shadow-xl shadow-blue-500/10 active:scale-[0.99] transition-all cursor-pointer"
              >
                {isLast ? 'Voir mes résultats →' : 'Question suivante →'}
              </button>
            )}
          </div>
        </div>

        {/* Note bas de page */}
        <p className="text-center text-[10px] text-slate-550 mt-6 font-semibold select-none">
          Test de démonstration — 5 questions représentatives du TCF/TEF Canada.<br/>
          La plateforme complète propose plus de 2 000 questions sur 4 modules.
        </p>
      </div>
    </div>
  )
}
