import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuthStore } from '../store/authStore'

const TCF = {
  nom: 'TCF Canada',
  couleur: '#1B3A6B',
  organisme: 'France Éducation International (FEI)',
  co: '39 QCM · 35 min',
  ce: '39 QCM · 35 min',
  ee: '3 tâches · 60 min',
  eo: '3 tâches · 12 min',
  duree_totale: '2h22',
  score_max: '699 pts (par épreuve)',
  validite: '2 ans',
  resultats: '15 jours ouvrables',
  centres: 'Centre de langues agréés FEI',
  reconnaissance: 'IRCC, OIIQ, OIIA, universités canadiennes',
  ideal: ['Express Entry (haute priorité)', 'Travailleurs qualifiés', 'Regroupement familial', 'Candidats souhaitant une épreuve orale courte'],
}

const TEF = {
  nom: 'TEF Canada',
  couleur: '#C55A11',
  organisme: 'CCI Paris Île-de-France',
  co: '60 QCM · 40 min',
  ce: '50 QCM · 60 min',
  ee: '2 rédactions · 60 min',
  eo: '4 tâches · 35 min',
  duree_totale: '3h15',
  score_max: '360 pts (CO, CE, EE, EO)',
  validite: '2 ans',
  resultats: '20 jours ouvrables',
  centres: 'Centres CCI Paris agréés',
  reconnaissance: 'IRCC, PEQ, AIIAQ, OIIQ, administrations',
  ideal: ['PEQ (Programme de l\'Expérience Québécoise)', 'Candidats avec fort niveau oral', 'Infirmiers et professionnels de santé', 'Candidats cherchant la même reconnaissance'],
}

const COMPARISON_ROWS = [
  { label: 'Organisme', tcf: TCF.organisme, tef: TEF.organisme },
  { label: 'CO (Compréhension Orale)', tcf: TCF.co, tef: TEF.co },
  { label: 'CE (Compréhension Écrite)', tcf: TCF.ce, tef: TEF.ce },
  { label: 'EE (Expression Écrite)', tcf: TCF.ee, tef: TEF.ee },
  { label: 'EO (Expression Orale)', tcf: TCF.eo, tef: TEF.eo },
  { label: 'Durée totale', tcf: TCF.duree_totale, tef: TEF.duree_totale },
  { label: 'Score maximum', tcf: TCF.score_max, tef: TEF.score_max },
  { label: 'Validité', tcf: TCF.validite, tef: TEF.validite },
  { label: 'Délai résultats', tcf: TCF.resultats, tef: TEF.resultats },
  { label: 'Reconnaissance', tcf: TCF.reconnaissance, tef: TEF.reconnaissance },
]

const FAQ = [
  {
    q: 'TCF Canada et TEF Canada sont-ils reconnus par IRCC ?',
    a: "Oui, les deux examens sont officiellement reconnus par Immigration, Réfugiés et Citoyenneté Canada (IRCC) pour toutes les procédures d'immigration permanente et temporaire."
  },
  {
    q: "Lequel choisir pour le Programme de l'Expérience Québécoise (PEQ) ?",
    a: "Le TEF Canada est généralement préféré pour le PEQ. Vérifiez les exigences spécifiques du programme sur le site du Ministère québécois de l'Immigration (MIFI)."
  },
  {
    q: 'Puis-je passer les deux examens ?',
    a: 'Oui, mais IRCC ne prend en compte que les résultats du même examen pour une même demande. Vous pouvez toutefois choisir le meilleur score entre deux tentatives du même examen.'
  },
  {
    q: 'Les scores sont-ils comparables entre TCF et TEF ?',
    a: "Non, les deux examens utilisent des barèmes différents. Un NCLC 9 TCF ne correspond pas exactement à un NCLC 9 TEF en termes de score brut. La table de conversion NCLC officielle d'IRCC permet la comparaison."
  },
  {
    q: 'Quelle est la différence principale entre les deux ?',
    a: 'Le TCF Canada a une épreuve orale de 12 minutes (3 tâches) contre 35 minutes pour le TEF Canada (4 tâches). Le TCF est souvent jugé plus accessible pour l\'oral, tandis que le TEF offre plus de temps pour montrer ses compétences à l\'écrit (CE 60 min vs 35 min).'
  },
]

export default function ComparisonPage() {
  const { user } = useAuthStore()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "TCF Canada vs TEF Canada : Comparaison complète 2026",
        "description": "Différences entre TCF Canada et TEF Canada : durées, nombre de questions, organismes, reconnaissance IRCC. Quel examen choisir pour votre immigration ?",
        "inLanguage": "fr",
        "author": { "@type": "Organization", "name": "ayePREP" }
      })}} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
                      <Logo />
            <Link to="/register" className="text-sm font-semibold text-[#1B3A6B] hover:underline">
              Commencer gratuitement →
            </Link>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none mb-6">
            ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
          </Link>
          {/* Hero */}
          <div className="text-center mb-12">
            <span className="inline-block bg-[#1B3A6B]/10 text-[#1B3A6B] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Guide comparatif 2026
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              TCF Canada vs TEF Canada<br/>
              <span className="text-[#1B3A6B]">Quelle différence ? Lequel choisir ?</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comparaison complète et officielle des deux examens de français reconnus par IRCC pour
              l'immigration au Canada. Durées, formats, scores, reconnaissance — tout ce que vous devez savoir.
            </p>
          </div>

          {/* Cards résumé */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[TCF, TEF].map(exam => (
              <div key={exam.nom} className="bg-white rounded-2xl border-2 p-6 shadow-sm" style={{ borderColor: exam.couleur + '33' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: exam.couleur }}></div>
                  <h2 className="text-xl font-extrabold" style={{ color: exam.couleur }}>{exam.nom}</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4">{exam.organisme}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Durée totale</span><span className="font-bold">{exam.duree_totale}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Délai résultats</span><span className="font-bold">{exam.resultats}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Validité</span><span className="font-bold">{exam.validite}</span></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Idéal pour</p>
                  <ul className="space-y-1">
                    {exam.ideal.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Tableau comparatif */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-12">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Tableau comparatif détaillé</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-500 w-1/3">Critère</th>
                    <th className="text-left px-6 py-3 text-sm font-bold text-[#1B3A6B]">TCF Canada</th>
                    <th className="text-left px-6 py-3 text-sm font-bold text-[#C55A11]">TEF Canada</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700">{row.label}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{row.tcf}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{row.tef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Points clés */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-bold text-blue-900 mb-2">Durée</h3>
              <p className="text-blue-800 text-sm">
                Le <strong>TCF Canada</strong> (2h22) est plus court que le <strong>TEF Canada</strong> (3h15),
                notamment grâce à l'épreuve orale de seulement 12 minutes.
              </p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-orange-900 mb-2">Format</h3>
              <p className="text-orange-800 text-sm">
                Le <strong>TEF Canada</strong> offre plus de temps à l'écrit (CE 60 min vs 35 min)
                et une épreuve orale plus complète (4 tâches vs 3).
              </p>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-bold text-green-900 mb-2">Reconnaissance</h3>
              <p className="text-green-800 text-sm">
                Les <strong>deux examens</strong> sont reconnus par IRCC.
                Certains programmes (PEQ) peuvent favoriser l'un ou l'autre.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
                  <summary className="flex justify-between items-center px-5 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 list-none">
                    {item.q}
                    <span className="text-[#1B3A6B] font-bold text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* CTA final */}
          <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2E75B6] rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-extrabold mb-3">Préparez les deux avec une seule plateforme</h3>
            <p className="opacity-80 mb-6">
              ayePREP couvre TCF Canada et TEF Canada avec des simulations officielles,
              corrections IA et sujets d'actualité. Commencez gratuitement.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="bg-white text-[#1B3A6B] font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors">
                Essai gratuit
              </Link>
              <Link to="/calculateur-nclc" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors">
                Calculateur NCLC →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
