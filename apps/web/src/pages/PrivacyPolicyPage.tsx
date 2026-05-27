import { Link } from 'react-router-dom'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 select-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#1B3A6B] font-extrabold text-sm uppercase tracking-wide">
            <svg viewBox="0 0 40 40" className="w-8 h-8">
              <path d="M20 2 L23 12 L33 8 L26 17 L36 22 L26 27 L33 36 L23 32 L20 42 L17 32 L7 36 L14 27 L4 22 L14 17 L7 8 L17 12 Z" fill="#1B3A6B"/>
            </svg>
            Francophonie Academia
          </Link>
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
              Politique de Confidentialité
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Dernière mise à jour : 27 Mai 2026 · Conforme RGPD (UE) & LPRPDE / PIPEDA (Canada)
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">1. Préambule et Responsable du traitement</h2>
            <p>
              La plateforme <strong>Francophonie Academia</strong> est engagée dans la protection de la vie privée et des données personnelles de ses utilisateurs. Cette politique détaille la nature des informations que nous collectons, la finalité de leur utilisation, les mesures de sécurité prises pour les protéger, ainsi que les droits d'accès, de portabilité et de suppression dont vous bénéficiez conformément au Règlement Général sur la Protection des Données (RGPD) et à la Loi canadienne sur la protection des renseignements personnels et les documents électroniques (LPRPDE / PIPEDA).
            </p>
            <p>
              Le responsable du traitement des données est identifiable auprès de notre service d'administration à : <a href="mailto:privacy@francophonie.academia" className="text-[#1B3A6B] font-semibold underline">privacy@francophonie.academia</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">2. Données collectées</h2>
            <p>Nous collectons uniquement les informations nécessaires au bon fonctionnement de nos services de préparation linguistique :</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Informations de compte</strong> : Adresse email, mot de passe chiffré, prénom.</li>
              <li><strong>Profil de préparation</strong> : Type d'examen choisi (TCF ou TEF Canada), date de l'examen cible, niveau NCLC visé, langue de préférence.</li>
              <li><strong>Historique académique</strong> : Réponses aux QCM, transcriptions d'essais rédigés (EE), enregistrements audio d'Expression Orale (EO) et scores associés.</li>
              <li><strong>Métadonnées d'usage</strong> : Consentement aux cookies, identifiant de l'appareil pour les notifications push, informations de facturation (gérées de manière sécurisée et chiffrée par nos prestataires Stripe ou FedaPay).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">3. Finalité et base légale du traitement</h2>
            <p>La collecte de vos données repose sur les bases légales suivantes :</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Exécution d'un contrat</strong> : Fourniture de l'accès à la plateforme d'entraînement, correction automatique ou humaine de vos rédactions et enregistrements.</li>
              <li><strong>Consentement explicite (Opt-in)</strong> : Pour l'envoi de lettres d'information pédagogiques, de notifications push de rappel sur votre mobile et l'utilisation de cookies analytiques non-essentiels.</li>
              <li><strong>Obligation légale</strong> : Conservation des factures et historiques de paiement.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">4. Hébergement et transfert des données</h2>
            <p>
              Afin de garantir une sécurité optimale et le respect de la vie privée, les profils utilisateurs et l'historique des sessions sont hébergés sur des serveurs sécurisés en <strong>Europe (Francfort, Allemagne)</strong> via notre infrastructure de base de données (Supabase).
            </p>
            <p>
              Les fichiers d'enregistrement audio liés aux épreuves d'Expression Orale (EO) sont stockés de manière sécurisée et distribuée sur le réseau mondial de stockage Cloudflare R2, avec chiffrement au repos. Les flux d'évaluation IA font appel aux APIs d'OpenAI, traitées de manière confidentielle sans utilisation de vos réponses pour l'entraînement public des modèles tiers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">5. Droits de l'utilisateur (Accès, Portabilité et Effacement)</h2>
            <p>Vous disposez de droits étendus sur le contrôle de vos informations personnelles :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Droit d'accès et de rectification</strong> : Vous pouvez modifier vos informations personnelles directement depuis les réglages de votre profil.</li>
              <li><strong>Droit à la portabilité</strong> : Vous pouvez demander un export complet de vos données pédagogiques et de profil sous format structuré (JSON) via les options de votre espace Profil.</li>
              <li><strong>Droit à l'effacement (Droit à l'oubli)</strong> : Vous pouvez supprimer définitivement votre compte utilisateur depuis votre console de profil. Cette action anonymise instantanément vos épreuves passées afin de préserver nos statistiques globales, supprime définitivement vos enregistrements vocaux, et élimine votre compte d'authentification sous 30 jours.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">6. Sécurité et notification de violation</h2>
            <p>
              Nous mettons en œuvre des mesures de protection physiques, administratives et techniques rigoureuses (protocoles HTTPS, chiffrement des bases de données au repos, restriction d'accès aux seuls experts certifiés pour les corrections humaines). En cas de violation avérée de données personnelles présentant un risque pour vos droits, nous nous engageons à en informer le Commissariat à la protection de la vie privée du Canada (CPVP) ainsi que les utilisateurs concernés dans un délai maximal de 72 heures après constatation.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Contact & Support Confidentialité</h2>
            <p className="text-xs text-gray-500">
              Pour toute question relative à l'exercice de vos droits, vous pouvez contacter notre Responsable de la Protection des Données par courrier électronique à <a href="mailto:privacy@francophonie.academia" className="text-[#1B3A6B] underline font-semibold">privacy@francophonie.academia</a>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400 select-none">
        <p>© 2026 Francophonie Academia. Tous droits réservés.</p>
      </footer>
    </div>
  )
}
