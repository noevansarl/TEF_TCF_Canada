import { useState } from 'react'
import { Link } from 'react-router-dom'
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
        a: `Oui, -30% sur tous les plans avec un justificatif étudiant valide (carte étudiante, certificat de scolarité). Envoyez votre justificatif à etudiant@francophonie.academia pour activer la réduction sur votre compte.`,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#1B3A6B] font-extrabold text-sm uppercase">
            <svg viewBox="0 0 40 40" className="w-8 h-8">
              <path d="M20 2 L23 12 L33 8 L26 17 L36 22 L26 27 L33 36 L23 32 L20 42 L17 32 L7 36 L14 27 L4 22 L14 17 L7 8 L17 12 Z" fill="#1B3A6B"/>
            </svg>
            Francophonie Academia
          </Link>
          <Link to="/dashboard" className="text-sm text-[#1B3A6B] font-semibold hover:underline">
            Mon espace
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-4 pb-0">
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none">
          ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold mb-3">Centre d'aide</h1>
          <p className="opacity-80 mb-6">Comment pouvons-nous vous aider ?</p>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-full px-5 py-4 pl-12 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar catégories */}
          <aside className="md:col-span-1">
            <nav className="space-y-1">
              {filtered.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setOpenCategory(cat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                    openCategory === cat.id
                      ? 'bg-[#1B3A6B] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.title}</span>
                  <span className="ml-auto text-xs opacity-60">{cat.articles.length}</span>
                </button>
              ))}
            </nav>

            {/* Contact rapide */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 text-sm">
              <p className="font-semibold text-gray-900 mb-3">Besoin d'aide directe ?</p>
              <a
                href="https://wa.me/22890116744"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 font-semibold hover:underline mb-2"
              >
                <span>💬</span> WhatsApp
              </a>
              <a
                href="mailto:support@francophonie.academia"
                className="flex items-center gap-2 text-[#1B3A6B] font-semibold hover:underline"
              >
                <span>✉️</span> Email support
              </a>
            </div>
          </aside>

          {/* Contenu */}
          <main className="md:col-span-3">
            {filtered.map(cat => {
              if (openCategory && cat.id !== openCategory) return null
              return (
                <div key={cat.id} className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>{cat.icon}</span> {cat.title}
                  </h2>
                  <div className="space-y-3">
                    {cat.articles.map(article => {
                      const key = `${cat.id}-${article.q}`
                      const isOpen = openArticle === key
                      return (
                        <div key={article.q} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => setOpenArticle(isOpen ? null : key)}
                            className="w-full text-left px-5 py-4 font-semibold text-gray-900 hover:bg-gray-50 flex justify-between items-center gap-4"
                          >
                            <span className="text-sm leading-snug">{article.q}</span>
                            <span className={`text-[#1B3A6B] text-xl font-bold flex-shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                              {article.a}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold">Aucun résultat pour "{search}"</p>
                <p className="text-sm mt-2">Essayez d'autres termes ou contactez-nous directement.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
