import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuthStore } from '../store/authStore'

export default function RefundPage() {
  const { user } = useAuthStore()
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:opacity-85 font-bold transition-colors select-none mb-6">
          ← {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Politique de remboursement</h1>
        <p className="text-gray-500 text-sm mb-10">Dernière mise à jour : Mai 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">

          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Essai gratuit</h2>
            <p className="text-gray-700">
              Tous les nouveaux comptes bénéficient d'un accès gratuit sans carte bancaire requise.
              L'essai Premium+ de 7 jours peut être annulé à tout moment avant son expiration
              sans aucun frais.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Abonnements mensuels et annuels</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <span><strong>Remboursement intégral dans les 14 jours</strong> suivant votre premier paiement, sans condition ni justification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5">→</span>
                <span><strong>Au-delà de 14 jours</strong> : aucun remboursement partiel pour la période déjà écoulée. L'accès reste actif jusqu'à la fin de la période payée.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">ℹ</span>
                <span>Vous pouvez annuler votre abonnement à tout moment depuis votre espace profil. L'annulation prend effet à la fin de la période en cours.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Packs à durée limitée (Bronze, Silver, Gold)</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <span><strong>Remboursement sous 24h</strong> si aucune fonctionnalité n'a été utilisée après l'achat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5">→</span>
                <span>Si des corrections IA ont été consommées, le remboursement est calculé au prorata du temps restant uniquement.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Corrections humaines expertes</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">✗</span>
                <span>Non remboursables une fois la correction rendue par l'expert.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <span><strong>Garantie délai</strong> : si le délai garanti (48h EE / 72h EO) n'est pas respecté de notre fait, vous recevrez un avoir de 100% sur votre prochain achat de correction.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Procédure de remboursement</h2>
            <p className="text-gray-700 mb-4">Pour demander un remboursement :</p>
            <ol className="space-y-2 text-gray-700 list-decimal list-inside">
              <li>Envoyez un email à <a href="mailto:remboursement@ayeprep.com" className="text-[#1B3A6B] underline">remboursement@ayeprep.com</a></li>
              <li>Indiquez votre email de compte et la raison de la demande</li>
              <li>Délai de traitement : 5 jours ouvrables</li>
              <li>Le remboursement est effectué sur le même moyen de paiement utilisé lors de l'achat</li>
            </ol>
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800">
              💬 Vous pouvez aussi nous contacter directement sur{' '}
              <a href="https://wa.me/22890116744" target="_blank" rel="noopener noreferrer" className="font-bold underline">WhatsApp</a>{' '}
              pour un traitement prioritaire.
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Droit de rétractation (UE)</h2>
            <p className="text-gray-700">
              Conformément à la Directive européenne 2011/83/UE, les consommateurs de l'Union Européenne
              disposent d'un droit de rétractation de 14 jours à compter de la souscription,
              sauf si le service a été pleinement exécuté avec leur accord préalable et exprès.
            </p>
          </section>

        </div>

        <div className="mt-10 p-6 bg-[#1B3A6B]/5 rounded-2xl text-center">
          <p className="text-gray-700 mb-4">Une question sur notre politique ?</p>
          <a
            href="mailto:support@ayeprep.com"
            className="inline-block bg-[#1B3A6B] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#152e56] transition-colors"
          >
            Contacter le support
          </a>
        </div>
      </div>
    </div>
  )
}
