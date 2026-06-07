import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuthStore } from '../store/authStore'

const TCF = {
  nom: 'TCF Canada',
  couleur: 'from-blue-600 to-indigo-650',
  textCouleur: 'text-blue-400',
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
  couleur: 'from-amber-600 to-orange-650',
  textCouleur: 'text-orange-400',
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

      <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans text-slate-100 pb-16">
        {/* Decorative Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

        {/* Header */}
        <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-850 px-6 py-4 sticky top-0 z-40 relative z-10 select-none">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Logo />
            <Link to="/register" className="px-4.5 py-2 bg-gradient-to-r from-blue-600 to-sky-500 rounded-xl text-xs font-extrabold text-white hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all">
              Commencer gratuitement →
            </Link>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
          <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-blue-450 hover:text-blue-300 font-bold transition-colors select-none mb-6">
            ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
          </Link>
          
          {/* Hero */}
          <div className="text-center mb-12 select-none">
            <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4 border border-blue-500/20">
              Guide comparatif 2026
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-display mb-4">
              TCF Canada vs TEF Canada
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Comparaison complète et officielle des deux examens de français reconnus par IRCC pour l'immigration au Canada. Durées, formats, scores, reconnaissance — tout ce que vous devez savoir.
            </p>
          </div>

          {/* Cards résumé */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[TCF, TEF].map(exam => (
              <div key={exam.nom} className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all hover:border-slate-700/80">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r ${exam.couleur} text-white`}>
                    {exam.nom}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-6">{exam.organisme}</p>
                <div className="space-y-3.5 text-sm font-semibold border-b border-slate-800 pb-6 mb-6">
                  <div className="flex justify-between items-center text-slate-450">
                    <span>Durée totale</span>
                    <span className="text-white font-bold">{exam.duree_totale}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-450">
                    <span>Délai résultats</span>
                    <span className="text-white font-bold">{exam.resultats}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-450">
                    <span>Validité</span>
                    <span className="text-white font-bold">{exam.validite}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Idéal pour</p>
                  <ul className="space-y-2">
                    {exam.ideal.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-xs text-slate-350 font-medium">
                        <span className="text-emerald-400 font-bold flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Tableau comparatif */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-3xl shadow-xl overflow-hidden mb-12">
            <div className="p-6 border-b border-slate-800/80">
              <h2 className="text-lg font-bold text-white font-display">Tableau comparatif détaillé</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Critère</th>
                    <th className="px-6 py-4 text-xs font-bold text-blue-400 uppercase tracking-wider">TCF Canada</th>
                    <th className="px-6 py-4 text-xs font-bold text-orange-400 uppercase tracking-wider">TEF Canada</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.label} className={`border-b border-slate-850/60 font-semibold text-xs transition-colors hover:bg-slate-900/20 ${i % 2 === 0 ? 'bg-slate-900/10' : 'bg-slate-950/20'}`}>
                      <td className="px-6 py-4 text-slate-300 font-bold">{row.label}</td>
                      <td className="px-6 py-4 text-slate-400 font-medium">{row.tcf}</td>
                      <td className="px-6 py-4 text-slate-400 font-medium">{row.tef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Points clés */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-950/15 border border-blue-500/15 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500/10 text-blue-400 text-xs font-bold px-3.5 py-1.5 rounded-bl-2xl border-l border-b border-blue-500/10 select-none">
                Durée
              </div>
              <div className="text-3xl mb-4">⏱️</div>
              <h3 className="font-bold text-white mb-2 font-display">Durée</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Le <strong>TCF Canada</strong> (2h22) est plus court que le <strong>TEF Canada</strong> (3h15), notamment grâce à l'épreuve orale de seulement 12 minutes.
              </p>
            </div>
            <div className="bg-orange-950/15 border border-orange-500/15 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-500/10 text-orange-400 text-xs font-bold px-3.5 py-1.5 rounded-bl-2xl border-l border-b border-orange-500/10 select-none">
                Format
              </div>
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="font-bold text-white mb-2 font-display">Format</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Le <strong>TEF Canada</strong> offre plus de temps à l'écrit (CE 60 min vs 35 min) et une épreuve orale plus complète (4 tâches vs 3).
              </p>
            </div>
            <div className="bg-emerald-950/15 border border-emerald-500/15 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-bl-2xl border-l border-b border-emerald-500/10 select-none">
                Reconnaissance
              </div>
              <div className="text-3xl mb-4">✅</div>
              <h3 className="font-bold text-white mb-2 font-display">Reconnaissance</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Les <strong>deux examens</strong> sont pleinement reconnus par IRCC. Certains programmes spécifiques (comme le PEQ au Québec) peuvent parfois recommander l'un plutôt que l'autre.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-6 mb-12 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 font-display">Questions fréquentes</h2>
            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <details key={i} className="group border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
                  <summary className="flex justify-between items-center px-5 py-4 cursor-pointer font-bold text-slate-200 hover:bg-slate-900/40 list-none select-none text-xs">
                    {item.q}
                    <span className="text-blue-400 font-bold text-lg group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-1 text-slate-400 text-xs font-semibold leading-relaxed border-t border-slate-900/50">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* CTA final */}
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl pointer-events-none select-none"></div>
            <h3 className="text-2xl font-black text-white mb-3 font-display">Préparez les deux avec une seule plateforme</h3>
            <p className="text-slate-350 text-sm max-w-xl mx-auto mb-6 font-semibold leading-relaxed">
              ayePREP couvre TCF Canada et TEF Canada avec des simulations officielles, des corrections intelligentes par IA et des sujets d'actualité. Commencez gratuitement.
            </p>
            <div className="flex flex-wrap gap-4 justify-center relative z-10 select-none">
              <Link to="/register" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-500 rounded-xl text-xs font-extrabold text-white hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all">
                Essai gratuit
              </Link>
              <Link to="/calculateur-nclc" className="px-6 py-3 bg-slate-900/60 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all hover:bg-slate-800">
                Calculateur NCLC →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
