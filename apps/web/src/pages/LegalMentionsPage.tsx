import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export default function LegalMentionsPage() {
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
              Mentions Légales
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Dernière mise à jour : 27 Mai 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">1. Éditeur de la plateforme</h2>
            <p>
              Le site internet et l'application mobile <strong>ayePREP</strong> sont édités et gérés par la société :
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Dénomination sociale</strong> : Evans & Partners Ltd (Noevans SRL)</li>
              <li><strong>Siège social</strong> : Montréal, Québec, Canada</li>
              <li><strong>Adresse électronique</strong> : <a href="mailto:contact@ayeprep.com" className="text-[#1B3A6B] font-semibold underline">contact@ayeprep.com</a></li>
              <li><strong>Directeur de la publication</strong> : Directeur général du département linguistique.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">2. Hébergement du site</h2>
            <p>
              L'infrastructure globale, l'hébergement des serveurs d'API et la base de données de la plateforme sont assurés par :
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Hébergeur de la base de données</strong> : Supabase Inc. (serveurs situés en Europe - Francfort, Allemagne pour le respect du RGPD).</li>
              <li><strong>Réseau de distribution (CDN) et stockage de fichiers audio</strong> : Cloudflare Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur la plateforme (textes, questions d'examen types, corrections modèles rédigées, designs de l'interface, marques, logos, et extraits audios originaux) sont la propriété exclusive de ayePREP ou de ses partenaires éditeurs.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est strictement interdite sans l'autorisation écrite préalable de l'éditeur. Le non-respect de cette clause constitue une contrefaçon passible de poursuites judiciaires.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">4. Limitation de responsabilité</h2>
            <p>
              ayePREP met tout en œuvre pour fournir aux candidats des questions d'entraînement et des corrections automatiques par IA conformes aux grilles du TCF/TEF Canada. Toutefois, les estimations de niveaux (NCLC 4 à 10+) et les scores générés par nos algorithmes d'IA sont fournis à titre indicatif pour la préparation.
            </p>
            <p>
              La société ne saurait être tenue pour responsable d'une éventuelle divergence de note ou de résultat lors de l'examen officiel passé par le candidat dans un centre agréé, ni d'éventuels retards d'immigration.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Contact d'assistance légale</h2>
            <p className="text-xs text-gray-500">
              Pour toute réclamation, notification de contenu inapproprié ou demande d'autorisation de reproduction, vous pouvez envoyer un courriel à <a href="mailto:legal@ayeprep.com" className="text-[#1B3A6B] underline font-semibold">legal@ayeprep.com</a>.
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
