# 🛠️ Manuel de Création, Réalisation, Mise en Œuvre et Déploiement
## Guide Technique Complet — Francophonie Academia

Ce guide fournit une description exhaustive de l'architecture du projet **Francophonie Academia**, des étapes d'installation en environnement de développement, de la configuration de la base de données, de la mise en œuvre des APIs d'IA, et de la procédure complète de déploiement en production.

---

## 1. Structure du Projet (Monorepo)

Le projet est configuré sous forme de monorepo géré avec npm workspaces :

```
TEF_TCF_Canada/
├── apps/
│   ├── web/               # Application Frontend React (Vite + TypeScript)
│   └── mobile/            # Application Mobile Flutter (Dart)
├── packages/
│   ├── shared-types/      # Modèles TypeScript et définitions communes
│   └── content/           # Banque statique et scripts de contenu
├── supabase/
│   ├── migrations/        # Scripts SQL de migration de base de données
│   ├── seed/              # Données de démarrage initiales (ex: questions)
│   └── functions/         # Deno Edge Functions (IA & Paiements)
├── scratch/               # Scripts de test d'API et Webhooks (PowerShell & Node)
├── docs/                  # Manuels d'utilisation et de déploiement
└── package.json           # Configuration du monorepo npm
```

---

## 2. Configuration et Développement Local

### Prérequis
*   **Node.js** (version 18+ recommandée, v22 supportée)
*   **Flutter SDK** (version stable 3.22+)
*   **Docker** (requis pour exécuter Supabase localement)
*   **Supabase CLI** (pour la gestion locale des migrations et fonctions)

### A. Lancement du Web Frontend
1. Installez les dépendances à la racine du projet :
   ```bash
   npm install
   ```
2. Créez un fichier `.env` à la racine (copiez `.env.example`).
3. Lancez le serveur de développement web :
   ```bash
   npm run dev:web
   ```
   L'application est accessible sur `http://localhost:5173`.

### B. Lancement de l'Application Mobile (Flutter)
1. Naviguez dans le répertoire mobile :
   ```bash
   cd apps/mobile
   ```
2. Récupérez les packages de dépendances Flutter :
   ```bash
   flutter pub get
   ```
3. Assurez-vous d'avoir configuré l'émulateur Android/iOS ou branché un appareil de test.
4. Lancez l'application en mode développement :
   ```bash
   flutter run
   ```

---

## 3. Base de données & Supabase Backend

### Exécution de Supabase Localement
1. Démarrez les conteneurs Docker de Supabase :
   ```bash
   supabase start
   ```
2. Cela va automatiquement appliquer l'ensemble des migrations sql présentes dans le dossier `supabase/migrations` et charger les données de seed.

### Migrations SQL Clés
Le schéma de base de données est découpé en plusieurs migrations ordonnées :
*   `20260525000000_init_schema.sql` : Schéma initial (utilisateurs, sessions, questions, réponses).
*   `003_fedapay_and_tracking.sql` : Tables de transactions pour FedaPay et tracking d'affiliation.
*   `005_affiliate_rls.sql` : Stratégies de sécurité (RLS) appliquées aux affiliés.
*   `007_institutional_schema.sql` : Ajout de structures et de relations pour la gestion des écoles partenaires.

---

## 4. Intégration des APIs et Services d'IA

Le moteur d'intelligence artificielle repose sur des fonctions sans serveur (Edge Functions) déployées sur Supabase (Deno runtime).

### A. Évaluation Expression Écrite (`correct-ee`)
*   Reçoit l'ID de session, de question et le texte du candidat.
*   Interroge GPT-4o via l'API OpenAI avec des invites (prompts) structurées selon la grille d'évaluation officielle du CECRL (niveaux NCLC 1 à 10+).
*   Renvoie un retour structuré au format JSON comprenant le score global, les points forts, et des suggestions d'amélioration ciblées.

### B. Transcription et Évaluation Expression Orale (`transcribe-eo`)
*   Récupère le fichier audio M4A stocké dans le bucket Supabase `audio-responses`.
*   Utilise l'API OpenAI Whisper pour transcrire la réponse orale du candidat.
*   Analyse le texte transcrit via GPT-4o et produit une correction détaillée (incluant la prononciation, le vocabulaire et la grammaire).

### C. Gestion du Jeu de Rôle Interactif
*   La méthode `sendRoleplayTurn` dans `supabase_service.dart` gère la communication tour par tour.
*   Pour chaque tour, la réplique orale du candidat est enregistrée via `AudioRecorder`, convertie en texte par Whisper, puis passée à l'Edge fonction qui maintient l'historique complet pour générer la réponse naturelle de l'examinateur.
*   La réponse générée est convertie en voix (Text-to-Speech) et stockée temporairement dans les buckets CDN, pour lecture automatique par le composant `just_audio` côté mobile.

---

## 5. Guide de Déploiement Complet (Production)

### A. Déploiement de la Base de Données Supabase
1. Créez un compte et un projet sur [Supabase Cloud](https://supabase.com).
2. Liez votre dépôt local au projet distant :
   ```bash
   supabase login
   ```
   ```bash
   supabase link --project-ref <votre-project-ref>
   ```
3. Poussez l'intégralité de vos migrations locales vers la base distante :
   ```bash
   supabase db push
   ```
4. Appliquez les données initiales ou seed en important `supabase/seed/questions.sql` dans le SQL Editor de Supabase.

### B. Configuration des Variables d'Environnement Distantes
Dans les paramètres de votre projet Supabase (ou via le CLI), définissez les secrets requis pour les Edge Functions :
```bash
supabase secrets set OPENAI_API_KEY="votre_cle_openai"
supabase secrets set STRIPE_SECRET_KEY="votre_cle_stripe"
supabase secrets set FEDAPAY_SECRET_KEY="votre_cle_fedapay"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="votre_cle_service"
```

### C. Déploiement des Edge Functions
Déployez les fonctions vers Supabase Cloud :
```bash
supabase functions deploy correct-ee
supabase functions deploy transcribe-eo
supabase functions deploy fedapay-payment
```

### D. Déploiement du Web Frontend
L'application web React configurée avec Vite peut être hébergée facilement sur **Vercel**, **Netlify**, ou **Cloudflare Pages**.
1. Reliez votre dépôt GitHub à la plateforme choisie.
2. Définissez la commande de build : `npm run build:web`.
3. Définissez le dossier de sortie : `apps/web/dist`.
4. Ajoutez les variables d'environnement de production correspondantes :
   *   `VITE_SUPABASE_URL`
   *   `VITE_SUPABASE_ANON_KEY`
   *   `VITE_STRIPE_PUBLIC_KEY`

### E. Compilation et Publication Mobile (Flutter)

#### 🤖 Android
1. Créez et configurez le fichier `key.properties` dans `apps/mobile/android/` pour la signature de l'APK de production.
2. Générez le paquet d'application (App Bundle) destiné au Google Play Store :
   ```bash
   cd apps/mobile
   flutter build appbundle --release
   ```
3. Téléversez le fichier généré `build/app/outputs/bundle/release/app-release.aab` dans la console développeur Google Play.

#### 🍏 iOS
1. Ouvrez le projet dans Xcode sur un ordinateur macOS :
   ```bash
   open apps/mobile/ios/Runner.xcworkspace
   ```
2. Configurez votre équipe de développement dans l'onglet **Signing & Capabilities**.
3. Générez l'archive de production :
   ```bash
   flutter build ipa --release
   ```
4. Téléversez l'archive sur App Store Connect via l'application Transporter ou Xcode.
