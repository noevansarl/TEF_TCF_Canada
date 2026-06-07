import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuthStore } from '../store/authStore'

const CATEGORIES = [
  {
    id: 'start',
    icon: '🚀',
    title: 'Démarrage rapide',
    articles: [
      {
        q: 'Comment créer mon compte ?',
        a: `Rendez-vous sur la page d'inscription et renseignez votre email et mot de passe. La confirmation est immédiate. Vous pouvez aussi vous connecter avec Google ou Apple. Aucune carte bancaire n'est requise pour le compte gratuit.`,
      },
      {
        q: 'Comment choisir entre TCF Canada et TEF Canada ?',
        a: `Les deux examens sont reconnus par IRCC. Le TCF Canada (2h22) est plus court et l'épreuve orale dure seulement 12 minutes. Le TEF Canada (3h15) est plus complet à l'oral (35 min). Pour le PEQ, vérifiez les exigences du MIFI. Consultez notre page de comparaison pour plus de détails.`,
      },
      {
        q: 'Comment utiliser le test diagnostique ?',
        a: `Après votre inscription, le test diagnostique évalue votre niveau en CO et CE sur 20 questions. Il prend environ 15 minutes et permet de personnaliser votre parcours d'apprentissage. Il est recommandé de le passer dès votre première connexion.`,
      },
      {
        q: 'La plateforme est-elle disponible sur mobile ?',
        a: `Oui. L'application iOS et Android est disponible sur l'App Store et Google Play. Sur le web, la plateforme est entièrement responsive. L'application mobile permet également l'accès hors connexion avec les plans payants.`,
      },
    ],
  },
  {
    id: 'modules',
    icon: '📚',
    title: "Modules d'entraînement",
    articles: [
      {
        q: 'Combien de questions y a-t-il au TCF Canada ?',
        a: `Le TCF Canada comprend : 39 QCM de Compréhension de l'Oral (35 min), 39 QCM de Compréhension des Écrits (35 min), 3 tâches d'Expression Écrite (60 min) et 3 tâches d'Expression Orale (12 min). Durée totale : 2h22.`,
      },
      {
        q: 'Combien de fois puis-je écouter un document audio (CO) ?',
        a: `Exactement comme lors du vrai examen : 2 écoutes maximum par document pour le TCF Canada, 1 à 2 écoutes pour le TEF Canada selon la consigne. Le compteur est bloquant et validé côté serveur.`,
      },
      {
        q: 'Comment fonctionne le minuteur de session ?',
        a: `Le minuteur est identique à l'examen officiel et bloque automatiquement la session à expiration. Il n'est pas possible de le mettre en pause ou de prolonger la durée, exactement comme lors du vrai examen. Une alerte visuelle s'affiche dans les 5 dernières minutes.`,
      },
      {
        q: 'Comment naviguer entre les questions ?',
        a: `En mode entraînement, vous pouvez revenir en arrière et modifier vos réponses. En mode simulation officielle, la navigation arrière est désactivée pour reproduire les conditions réelles d'examen.`,
      },
      {
        q: 'Mes réponses sont-elles sauvegardées si je perds la connexion ?',
        a: `Oui. Sur l'application mobile avec un plan payant, les sessions continuent hors ligne et se synchronisent automatiquement à la reconnexion. Sur le web, les réponses sont sauvegardées localement toutes les 30 secondes.`,
      },
    ],
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'Correction IA et humaine',
    articles: [
      {
        q: 'Comment fonctionne la correction IA de l\'Expression Écrite ?',
        a: `Votre rédaction est analysée par GPT-4o sur 5 critères officiels CECRL : respect de la tâche, cohérence et cohésion, richesse lexicale, correction morphosyntaxique, et respect des conventions. Vous recevez un score et des suggestions d'amélioration pour chaque critère en moins de 20 secondes.`,
      },
      {
        q: 'Comment fonctionne la correction de l\'Expression Orale ?',
        a: `Votre enregistrement est transcrit automatiquement par OpenAI Whisper, puis analysé par GPT-4o sur les mêmes critères que l'EE. Vous recevez la transcription de votre discours ainsi que le retour détaillé en moins de 30 secondes.`,
      },
      {
        q: 'Quel est le délai de la correction humaine ?',
        a: `Les corrections humaines par nos experts certifiés CECRL sont rendues sous 48h pour l'Expression Écrite et 72h pour l'Expression Orale, week-ends compris. En cas de dépassement de délai dû à notre faute, vous recevez un avoir de 100%.`,
      },
      {
        q: 'Que faire si je pense que ma correction IA est incorrecte ?',
        a: `La correction IA est une évaluation automatique et peut parfois manquer de nuances. Vous pouvez demander une correction humaine experte pour obtenir un avis certifié. Contactez-nous via WhatsApp ou email si vous estimez qu'une correction IA est manifestement incorrecte.`,
      },
    ],
  },
  {
    id: 'subscription',
    icon: '💳',
    title: 'Abonnements et paiements',
    articles: [
      {
        q: 'Quels sont les moyens de paiement acceptés ?',
        a: `Nous acceptons : Visa, Mastercard, American Express (via Stripe), Orange Money, MTN Mobile Money, Moov, Wave (via FedaPay pour l'Afrique francophone), et PayPal. Les prix pour l'Afrique subsaharienne sont affichés en FCFA avec une réduction de 40%.`,
      },
      {
        q: 'Puis-je changer de plan en cours de mois ?',
        a: `Oui. La mise à niveau (upgrade) est immédiate et le prix est calculé au prorata. La rétrogradation (downgrade) prend effet à la prochaine date de renouvellement. Vous ne perdez jamais les jours déjà payés.`,
      },
      {
        q: 'Comment obtenir une facture ou un reçu ?',
        a: `Vos factures sont disponibles dans la section "Historique de paiements" de votre profil. Vous pouvez les télécharger en PDF. Pour une facture avec TVA (pour entreprises ou institutions), contactez notre support.`,
      },
      {
        q: 'Y a-t-il une réduction pour les étudiants ?',
        a: `Oui, -30% sur tous les plans avec un justificatif étudiant valide (carte étudiante, certificat de scolarité). Envoyez votre justificatif à etudiant@ayeprep.com pour activer la réduction sur votre compte.`,
      },
      {
        q: 'Quelle est la politique de remboursement ?',
        a: `Remboursement intégral dans les 14 jours suivant votre premier paiement, sans condition. Au-delà, pas de remboursement partiel. Pour les packs à durée limitée, remboursement sous 24h si aucune fonctionnalité n'a été utilisée. Consultez notre page politique de remboursement pour les détails complets.`,
      },
    ],
  },
  {
    id: 'privacy',
    icon: '🔒',
    title: 'Compte et données personnelles',
    articles: [
      {
        q: 'Comment supprimer mon compte (droit à l\'effacement RGPD) ?',
        a: `Rendez-vous dans Profil → Paramètres → Supprimer mon compte. Cette action est irréversible et supprime toutes vos données personnelles dans les 30 jours. Vos données analytiques sont conservées sous forme anonymisée pour nos statistiques. Votre abonnement Stripe est automatiquement annulé.`,
      },
      {
        q: 'Comment télécharger mes données (droit de portabilité) ?',
        a: `Dans Profil → Paramètres → Mes données, vous pouvez télécharger un export complet de vos données au format JSON : profil, historique de sessions, scores, corrections, et préférences. Le délai de traitement est de 72h.`,
      },
      {
        q: 'Comment changer mon email ou mon mot de passe ?',
        a: `Dans Profil → Paramètres → Sécurité. La modification d'email nécessite une confirmation par l'ancienne adresse. En cas de perte de mot de passe, utilisez "Mot de passe oublié" sur la page de connexion.`,
      },
      {
        q: 'Où sont hébergées mes données ?',
        a: `Vos données sont hébergées sur des serveurs en Europe (Frankfurt, Allemagne) via Supabase, conformément au RGPD. Les fichiers audio (Expression Orale) sont stockés sur Cloudflare R2 (infrastructure mondiale). Nous ne vendons jamais vos données à des tiers.`,
      },
    ],
  },
]

export default function HelpCenterPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [openCategory, setOpenCategory] = useState<string | null>('start')
  const [openArticle, setOpenArticle] = useState<string | null>(null)

  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    articles: cat.articles.filter(
      a =>
        !search ||
        a.q.toLowerCase().includes(search.toLowerCase()) ||
        a.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => !search || cat.articles.length > 0)

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden font-sans text-slate-800">
      {/* Decorative Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B3A6B]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#C55A11]/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo />
          <Link to="/dashboard" className="text-xs bg-[#1B3A6B]/5 text-[#1B3A6B] hover:bg-[#1B3A6B]/10 px-4 py-2 rounded-xl font-bold transition-all">
            Mon espace
          </Link>
        </div>
      </header>

      {/* Back Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 pt-6 relative z-10">
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors select-none bg-white/50 backdrop-blur-sm border border-slate-200/40 px-3.5 py-1.5 rounded-full shadow-sm hover:shadow">
          <span>←</span>
          <span>{user ? "Retour au tableau de bord" : "Retour à l'accueil"}</span>
        </Link>
      </div>

      {/* Hero / Search Section */}
      <div className="relative overflow-hidden py-16 px-6 z-10">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Centre d'aide <span className="bg-gradient-to-r from-[#1B3A6B] to-indigo-600 bg-clip-text text-transparent">intelligent</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-xl mx-auto mb-8 leading-relaxed">
            Une question ? Saisissez des mots-clés ou explorez nos rubriques d'aide personnalisées.
          </p>
          
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1B3A6B] to-indigo-500 rounded-2xl blur opacity-15 group-focus-within:opacity-30 transition duration-300"></div>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ex: TCF Canada, Correction IA, FedaPay, Remboursement..."
                className="w-full px-6 py-4 pl-12 rounded-2xl bg-white border border-slate-200 text-slate-800 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-all shadow-md"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar catégories */}
          <aside className="md:col-span-1 space-y-6">
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Catégories</h3>
              <nav className="space-y-1">
                {filtered.map(cat => {
                  const isActive = openCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setOpenCategory(cat.id)}
                      className={`w-full text-left px-3 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 group relative ${
                        isActive
                          ? 'bg-[#1B3A6B] text-white shadow-md shadow-[#1B3A6B]/10'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <span className="text-base transition-transform group-hover:scale-110 duration-200">{cat.icon}</span>
                      <span className="truncate">{cat.title}</span>
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/70'
                      }`}>
                        {cat.articles.length}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Contact rapide */}
            <div className="bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 shadow-sm text-sm">
              <p className="font-bold text-slate-800 mb-1">Besoin d'aide directe ?</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Notre équipe est disponible pour répondre à vos questions spécifiques.
              </p>
              <div className="space-y-2.5">
                <a
                  href="https://wa.me/22890116744"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-all border border-emerald-200/50 shadow-sm"
                >
                  <span className="text-lg">💬</span> WhatsApp Support
                </a>
                <a
                  href="mailto:support@ayeprep.com"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all border border-slate-200/50 shadow-sm"
                >
                  <span>✉️</span> Email Support
                </a>
              </div>
            </div>
          </aside>

          {/* Contenu */}
          <main className="md:col-span-3 space-y-8">
            {filtered.map(cat => {
              if (openCategory && cat.id !== openCategory) return null
              return (
                <div key={cat.id} className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 pb-2 border-b border-slate-200/50">
                    <span className="text-3xl">{cat.icon}</span> {cat.title}
                  </h2>
                  <div className="space-y-3.5">
                    {cat.articles.map(article => {
                      const key = `${cat.id}-${article.q}`
                      const isOpen = openArticle === key
                      return (
                        <div
                          key={article.q}
                          className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow ${
                            isOpen
                              ? 'border-[#1B3A6B]/30 ring-1 ring-[#1B3A6B]/5 bg-gradient-to-b from-white to-[#1B3A6B]/[0.01]'
                              : 'border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <button
                            onClick={() => setOpenArticle(isOpen ? null : key)}
                            className="w-full text-left px-6 py-4.5 font-bold text-slate-800 hover:text-[#1B3A6B] flex justify-between items-center gap-4 transition-colors group"
                          >
                            <span className="text-sm md:text-base leading-snug">{article.q}</span>
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 text-xl font-bold flex-shrink-0 transition-all ${
                              isOpen ? 'bg-[#1B3A6B]/10 text-[#1B3A6B] rotate-45' : 'group-hover:bg-slate-100 group-hover:text-slate-600'
                            }`}>
                              +
                            </span>
                          </button>
                          
                          {/* Animated expansion */}
                          <div className={`transition-all duration-300 ease-in-out ${
                            isOpen ? 'max-h-[500px] opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0 pointer-events-none'
                          }`}>
                            <div className="px-6 py-5 text-sm text-slate-600 leading-relaxed bg-[#FDFEFE]">
                              {article.a}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm">
                <p className="text-5xl mb-4 animate-bounce">🔍</p>
                <p className="text-lg font-bold text-slate-800">Aucun résultat pour "{search}"</p>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  Nous n'avons pas trouvé de réponse correspondant à votre recherche. Essayez d'autres mots-clés ou contactez-nous par WhatsApp.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
