import { useState } from 'react'
import { Link } from 'react-router-dom'

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
    question: 'Extrait : "Le gouvernement a annoncé une hausse de 3% du SMIC, mesure saluée par les syndicats mais jugée insuffisante par les associations de travailleurs précaires." Quel groupe est INSATISFAIT de cette décision ?',
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
  CO: 'bg-blue-100 text-blue-700',
  CE: 'bg-orange-100 text-orange-700',
}

const NCLC_ESTIMATE = [
  { min: 0, max: 1, nclc: 'NCLC 6', message: 'Bon début ! Il y a encore beaucoup à apprendre.', color: 'text-yellow-600' },
  { min: 2, max: 2, nclc: 'NCLC 7', message: 'Niveau intermédiaire. Vous progressez bien !', color: 'text-blue-600' },
  { min: 3, max: 3, nclc: 'NCLC 8', message: 'Bon niveau ! Vous êtes sur la bonne voie.', color: 'text-blue-700' },
  { min: 4, max: 4, nclc: 'NCLC 9', message: 'Très bon niveau ! L\'objectif C1 est proche.', color: 'text-green-600' },
  { min: 5, max: 5, nclc: 'NCLC 10+', message: 'Excellent ! Vous avez le niveau C1/C2.', color: 'text-green-700' },
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
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <Link to="/" className="text-[#1B3A6B] font-bold text-sm flex items-center gap-2">
              ← Retour à l'accueil
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full">
            {/* Score */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center mb-6">
              <div className="text-6xl mb-4">
                {score === 5 ? '🏆' : score >= 3 ? '🎯' : '📚'}
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                {score} / 5 bonnes réponses
              </h1>
              <p className={`text-xl font-bold mb-2 ${estimate.color}`}>
                Estimation : {estimate.nclc}
              </p>
              <p className="text-gray-600">{estimate.message}</p>

              {/* Barre progression */}
              <div className="mt-6 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1B3A6B] rounded-full transition-all duration-1000"
                  style={{ width: `${(score / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Résumé des réponses */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              <h2 className="font-bold text-gray-900 mb-4">Détail de vos réponses</h2>
              <div className="space-y-2">
                {DEMO_QUESTIONS.map((q, i) => {
                  const userAns = answers[q.id]
                  const correct = userAns === q.correct
                  return (
                    <div key={q.id} className={`flex items-center gap-3 p-3 rounded-xl ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {correct ? '✓' : '✗'}
                      </span>
                      <span className="text-sm text-gray-700 line-clamp-1">Question {i + 1} — {q.module}</span>
                      {!correct && (
                        <span className="ml-auto text-xs text-gray-500">Bonne réponse : {q.correct}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2E75B6] rounded-2xl p-8 text-white text-center">
              <h3 className="text-xl font-extrabold mb-2">
                {score < 4
                  ? `Passez de ${estimate.nclc} à NCLC 10 avec nous`
                  : 'Atteignez NCLC 12 avec une préparation complète'}
              </h3>
              <p className="opacity-80 text-sm mb-6">
                Ce test ne comprend que 5 questions. Notre plateforme propose
                2 000+ sujets officiels, corrections IA et simulations complètes.
              </p>
              <Link
                to="/register"
                className="inline-block bg-white text-[#1B3A6B] font-extrabold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
              >
                Créer mon compte gratuit →
              </Link>
              <p className="text-xs opacity-60 mt-3">Sans carte bancaire · Accès immédiat</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-[#1B3A6B] font-bold text-sm">
            ← Accueil
          </Link>
          <span className="text-sm text-gray-500 font-medium">
            Test de niveau gratuit · {currentIndex + 1} / {DEMO_QUESTIONS.length}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Barre de progression */}
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-[#1B3A6B] rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / DEMO_QUESTIONS.length) * 100}%` }}
          ></div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header question */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${MODULE_COLORS[question.module]}`}>
                {question.module === 'CO' ? 'Compréhension Orale' : 'Compréhension Écrite'}
              </span>
              <span className="text-xs text-gray-400">Niveau B2</span>
            </div>
            <p className="text-gray-900 font-medium leading-relaxed">{question.question}</p>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {Object.entries(question.options).map(([key, value]) => {
              let style = 'border-gray-200 text-gray-700 hover:border-[#1B3A6B] hover:bg-[#1B3A6B]/5'
              if (selected) {
                if (key === question.correct) style = 'border-green-500 bg-green-50 text-green-800'
                else if (key === selected) style = 'border-red-400 bg-red-50 text-red-700'
                else style = 'border-gray-100 text-gray-400 opacity-60'
              }

              return (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  disabled={!!selected}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${style} disabled:cursor-default`}
                >
                  <span className="font-bold mr-2">{key}.</span> {value}
                </button>
              )
            })}
          </div>

          {/* Explication */}
          {showExplanation && (
            <div className={`mx-6 mb-4 p-4 rounded-xl text-sm ${
              selected === question.correct ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-orange-50 border border-orange-200 text-orange-800'
            }`}>
              <p className="font-bold mb-1">
                {selected === question.correct ? '✓ Bravo !' : `✗ La bonne réponse est ${question.correct}.`}
              </p>
              <p>{question.explanation}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 pb-6">
            {selected && (
              <button
                onClick={next}
                className="w-full py-3 bg-[#1B3A6B] text-white font-bold rounded-xl hover:bg-[#152e56] transition-colors"
              >
                {isLast ? 'Voir mes résultats →' : 'Question suivante →'}
              </button>
            )}
          </div>
        </div>

        {/* Note bas de page */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Test de démonstration — 5 questions représentatives du TCF/TEF Canada.
          La plateforme complète propose 2 000+ questions sur 4 modules.
        </p>
      </div>
    </div>
  )
}
