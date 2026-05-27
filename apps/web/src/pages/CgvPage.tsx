import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 select-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm font-semibold text-[#1B3A6B] hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10 shadow-sm space-y-6 text-gray-800 text-sm md:text-base leading-relaxed">
          
          <div className="border-b border-gray-100 pb-4 select-none">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1B3A6B]">
              Conditions Générales de Vente (CGV)
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Dernière mise à jour : 27 Mai 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">1. Objet et acceptation des conditions</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent toutes les ventes de formules de préparation d'examens et de forfaits d'entraînement (Bronze, Silver, Gold, Platinum) conclues entre la société éditrice de <strong>ayePREP</strong> et le client utilisateur.
            </p>
            <p>
              Toute souscription à un pack payant sur la plateforme web ou sur l'application mobile implique l'acceptation sans réserve par l'utilisateur des présentes CGV.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">2. Description des packs et tarifs</h2>
            <p>
              Les tarifs applicables sont ceux affichés sur la page des prix de notre plateforme au moment de l'achat. Les prix sont exprimés en Euros (€) et/ou en Francs CFA (XOF/XAF) selon le mode de paiement choisi.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Pack Bronze</strong> : Accès aux tests QCM d'entraînement standards.</li>
              <li><strong>Pack Silver</strong> : QCM illimités et évaluations des écrits par IA.</li>
              <li><strong>Pack Gold</strong> : Accès complet incluant les simulations d'Expression Écrite et de Jeu de Rôle Oral Interactif par IA.</li>
              <li><strong>Pack Platinum</strong> : Accès Premium complet avec sessions de correction humaine et tuteurs dédiés.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">3. Modalités de paiement</h2>
            <p>Le paiement s'effectue en ligne via deux canaux sécurisés chiffrés SSL :</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Stripe</strong> : Cartes de crédit internationales (Visa, Mastercard, etc.). Un code promotionnel géographique de -40% (ex: <code>AFRICA40</code>) s'applique automatiquement pour les résidents éligibles.</li>
              <li><strong>FedaPay (Mobile Money)</strong> : MTN, Moov, Wave, Orange Money. Service optimisé pour l'Afrique de l'Ouest (Bénin, Togo, Côte d'Ivoire, Sénégal, Cameroun, Mali).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">4. Droit de rétractation et remboursements</h2>
            <p>
              Conformément à la législation sur la vente de contenus numériques en ligne et de services consommés instantanément, le droit de rétractation ne s'applique pas une fois que l'utilisateur a initié sa première session d'entraînement corrigée par l'IA.
            </p>
            <p>
              Toutefois, ayePREP propose une politique de garantie commerciale « Satisfait ou Remboursé » sous 14 jours si aucune épreuve n'a été commencée, ou en cas de problème technique majeur persistant empêchant l'accès au service. Consultez notre page <Link to="/remboursement" className="text-[#1B3A6B] underline font-semibold">Politique de remboursement</Link> pour initier une demande.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">5. Utilisation de l'IA et limites du service</h2>
            <p>
              Les crédits d'évaluation (tokens de calcul pour l'analyse d'expressions écrites et orales par Whisper / GPT) sont à usage personnel et ne peuvent être transférés ou revendus. Toute tentative d'automatisation ou d'utilisation abusive de l'API de correction entraînera la résiliation immédiate du compte sans remboursement.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Contact Facturation & Support</h2>
            <p className="text-xs text-gray-500">
              Pour toute question relative à vos factures, abonnements ou demande de remboursement, veuillez écrire à : <a href="mailto:billing@francophonie.academia" className="text-[#1B3A6B] underline font-semibold">billing@francophonie.academia</a>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400 select-none">
        <p>© 2026 ayePREP. Tous droits réservés.</p>
      </footer>
    </div>
  )
}
