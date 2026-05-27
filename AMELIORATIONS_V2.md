# FRANCOPHONIE ACADEMIA — Améliorations V2.0
## Analyse comparative avec formation-tcfcanada.com
**Date** : Mai 2026  
**Basé sur** : Inspection du site https://www.formation-tcfcanada.com  
**Objectif** : Combler les manquements de la planification actuelle pour dominer le marché

---

## Table des matières

A. [Corrections factuelles urgentes](#a-corrections-factuelles-urgentes)  
B. [Fonctionnalités manquantes à implémenter](#b-fonctionnalités-manquantes-à-implémenter)  
C. [Modèle de monétisation complémentaire](#c-modèle-de-monétisation-complémentaire)  
D. [Stratégie de contenu enrichie](#d-stratégie-de-contenu-enrichie)  
E. [Support et relation client](#e-support-et-relation-client)  
F. [SEO et marketing digital](#f-seo-et-marketing-digital)  
G. [Conformité légale renforcée](#g-conformité-légale-renforcée)  
H. [Améliorations UX/UI basées sur le concurrent](#h-améliorations-uxui-basées-sur-le-concurrent)  
I. [Roadmap mise à jour avec les nouvelles fonctionnalités](#i-roadmap-mise-à-jour-avec-les-nouvelles-fonctionnalités)  
J. [Métriques et KPIs additionnels](#j-métriques-et-kpis-additionnels)

---

## A. Corrections factuelles urgentes

### A.1 Nombre de questions par épreuve — Discordance critique

Le document actuel indique **29 QCM · 35 min** pour le TCF Canada CO et CE. Or, le site de référence et le format officiel 2025–2026 indiquent **39 questions** pour la Compréhension Orale.

**Corrections à apporter immédiatement dans le plan :**

| Épreuve | Ancien plan | Format officiel 2026 |
|---|---|---|
| CO TCF Canada | 29 QCM · 35 min | **39 QCM · 35 min** |
| CE TCF Canada | 29 QCM · 35 min | **39 QCM · 35 min** |
| EO TCF Canada | 3 tâches · 12 min | **3 tâches · 12 min** ✓ |
| EE TCF Canada | 2 rédactions · 60 min | **3 tâches · 60 min** |

> **⚠️ Impact :** La logique de sélection des questions, la durée par question (54s/question CO vs 72s), le calcul des scores NCLC, et les critères d'acceptation de Phase 2 doivent tous être recalculés.

```sql
-- Mise à jour des contraintes dans la base de données
ALTER TABLE sessions ADD CONSTRAINT check_question_count 
  CHECK (
    (module = 'CO' AND test_type = 'TCF_CANADA' AND total_questions = 39) OR
    (module = 'CE' AND test_type = 'TCF_CANADA' AND total_questions = 39) OR
    (module = 'EO' AND test_type = 'TCF_CANADA' AND total_questions = 3) OR
    (module = 'EE' AND test_type = 'TCF_CANADA' AND total_questions = 3)
  );
```

### A.2 Durées TEF Canada — Vérification nécessaire

Le plan actuel mentionne "CO TEF = 40 min" mais ne précise pas le nombre de questions TEF Canada par module. Ajouter ces données officielles :

| Épreuve | TEF Canada |
|---|---|
| CO | 60 QCM · 40 min |
| CE | 50 QCM · 60 min |
| EE | 2 rédactions · 60 min |
| EO | 4 tâches · 35 min |

---

## B. Fonctionnalités manquantes à implémenter

### B.1 🔢 Calculateur NCLC public et gratuit — PRIORITÉ HAUTE

**Ce qui existe chez le concurrent :** Un calculateur NCLC entièrement gratuit, accessible sans inscription, qui convertit les scores bruts TCF/TEF en niveaux NCLC/CLB avec un tableau d'équivalences.

**Ce qui manque dans notre plan :** Le plan mentionne un "rapport NCLC" post-simulation mais AUCUN outil gratuit public standalone. C'est une **erreur stratégique** : le calculateur gratuit est le principal outil d'acquisition de trafic organique du concurrent.

**Fonctionnalité à ajouter — Page `/calculateur-nclc`:**

```typescript
// src/pages/NclcCalculatorPage.tsx
// Page publique, sans auth, indexée Google

interface NclcScore {
  module: 'CO' | 'CE' | 'EE' | 'EO'
  testType: 'TCF_CANADA' | 'TEF_CANADA'
  rawScore: number
  nclcLevel: string   // ex: "NCLC 9"
  clbLevel: string    // ex: "CLB 9"
  cecrlLevel: string  // ex: "C1"
  band: 'insufficient' | 'b1' | 'b2' | 'c1' | 'c2'
}

// Table de conversion TCF Canada → NCLC (officielle IRCC)
export const TCF_NCLC_TABLE = {
  CO: [
    { min: 0,   max: 180, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 181, max: 225, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 226, max: 269, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 270, max: 309, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 310, max: 348, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 349, max: 382, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 406, max: 458, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 459, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
  CE: [
    { min: 0,   max: 180, nclc: 'NCLC 4',  clb: 'CLB 4',  cecrl: 'B1' },
    { min: 181, max: 225, nclc: 'NCLC 5',  clb: 'CLB 5',  cecrl: 'B1+' },
    { min: 226, max: 268, nclc: 'NCLC 6',  clb: 'CLB 6',  cecrl: 'B2' },
    { min: 269, max: 309, nclc: 'NCLC 7',  clb: 'CLB 7',  cecrl: 'B2+' },
    { min: 310, max: 347, nclc: 'NCLC 8',  clb: 'CLB 8',  cecrl: 'C1' },
    { min: 348, max: 382, nclc: 'NCLC 9',  clb: 'CLB 9',  cecrl: 'C1+' },
    { min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+' },
    { min: 406, max: 453, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2' },
    { min: 454, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2' },
  ],
}

export function NclcCalculatorPage() {
  const [testType, setTestType] = useState<'TCF_CANADA' | 'TEF_CANADA'>('TCF_CANADA')
  const [scores, setScores] = useState({ CO: '', CE: '', EE: '', EO: '' })
  const [results, setResults] = useState<NclcScore[] | null>(null)

  const calculate = () => {
    // ... calcul et affichage des résultats avec tableau NCLC
    // CTA vers inscription après affichage des résultats
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1>Calculateur NCLC / CLB — TCF & TEF Canada 2026</h1>
      <p className="text-gray-600 mb-8">
        Convertissez vos scores TCF ou TEF Canada en niveaux NCLC/CLB 
        officiels reconnus par IRCC. Gratuit, sans inscription.
      </p>
      {/* ... formulaire de saisie des scores */}
      {/* ... tableau de résultats animé */}
      {/* CTA post-calcul : "Vous voulez atteindre NCLC 9 ? Commencez votre préparation" */}
    </div>
  )
}
```

**Valeur SEO attendue :** Mots-clés à fort trafic :
- "calculateur nclc tcf canada" (~2 400 recherches/mois)
- "score tcf canada immigration" (~8 100 recherches/mois)
- "clb nclc equivalence" (~1 600 recherches/mois)

---

### B.2 📱 Intégration WhatsApp Business — Support direct

**Ce qui existe chez le concurrent :** Numéro WhatsApp affiché publiquement (+1 506 253 6067), permettant un contact direct immédiat. Crucial pour les marchés africains (Sénégal, Cameroun, Côte d'Ivoire, Maroc) où WhatsApp est le canal de communication dominant.

**Ce qui manque dans notre plan :** Le plan mentionne uniquement Firebase FCM pour les notifications internes. Aucune stratégie WhatsApp Business.

**À ajouter dans la section Support (Section 17 du plan) :**

```typescript
// Bouton WhatsApp flottant — visible sur toutes les pages publiques
// src/components/WhatsAppButton.tsx

export function WhatsAppFloatingButton() {
  const message = encodeURIComponent(
    "Bonjour ! Je souhaite des informations sur la préparation TCF/TEF Canada."
  )
  const waUrl = `https://wa.me/22890116744?text=${message}`

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 
                 w-14 h-14 bg-green-500 hover:bg-green-600
                 rounded-full flex items-center justify-center
                 shadow-lg hover:shadow-xl transition-all
                 animate-bounce"
      aria-label="Contacter sur WhatsApp"
    >
      {/* Icône WhatsApp SVG */}
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..."/>
      </svg>
      {/* Badge notification */}
      <span className="absolute -top-1 -right-1 w-4 h-4 
                       bg-red-500 rounded-full text-white text-xs
                       flex items-center justify-center font-bold">
        1
      </span>
    </a>
  )
}
```

**WhatsApp Business API — Automatisations à configurer :**

| Déclencheur | Message automatique |
|---|---|
| Nouvel inscrit | "Bienvenue ! Voici votre guide de démarrage..." |
| Abonnement expiré J-3 | "Votre accès expire dans 3 jours. Renouveler ?" |
| Score simulation < 60% | "Votre coach peut vous aider à progresser." |
| Correction experte prête | "Votre correction est disponible sur la plateforme !" |
| Abandon session > 7j | "On vous manque ? Reprenez là où vous vous êtes arrêté." |

---

### B.3 🗓️ Parcours de préparation structuré — Plan 30 jours

**Ce qui existe chez le concurrent :** Un guide de révision sur 30 jours référencé dans le blog. Les candidats cherchent activement des programmes structurés, pas seulement des exercices isolés.

**Ce qui manque dans notre plan :** La planification décrit des modules indépendants mais aucun **parcours guidé pédagogique** qui dit à l'utilisateur "aujourd'hui vous faites X, demain Y".

**Nouvelle fonctionnalité : Parcours adaptatif personnalisé**

```typescript
// Nouveau module : src/features/learning-path/

interface LearningPlan {
  id: string
  user_id: string
  exam_date: Date          // Date de l'examen visé
  target_level: 'B2' | 'C1' | 'C2'
  current_level: 'A2' | 'B1' | 'B2' | 'C1'  // issu du test diagnostique
  daily_sessions: DailySession[]
  created_at: Date
}

interface DailySession {
  day: number              // Jour 1 à 90
  module: 'CO' | 'CE' | 'EE' | 'EO' | 'SIMULATION'
  session_type: 'training' | 'correction' | 'review'
  duration_minutes: number
  theme?: string           // Thème du jour
  is_completed: boolean
  completion_date?: Date
}

// Exemple de plan 30 jours pour objectif C1
export const PLAN_30_DAYS_C1: Omit<DailySession, 'is_completed' | 'completion_date'>[] = [
  { day: 1,  module: 'CO', session_type: 'training', duration_minutes: 35, theme: 'Vie quotidienne' },
  { day: 2,  module: 'CE', session_type: 'training', duration_minutes: 35, theme: 'Santé et société' },
  { day: 3,  module: 'EE', session_type: 'training', duration_minutes: 60, theme: 'Lettre formelle' },
  { day: 4,  module: 'EO', session_type: 'training', duration_minutes: 12, theme: 'Description image' },
  { day: 5,  module: 'CO', session_type: 'training', duration_minutes: 35, theme: 'Immigration Canada' },
  { day: 6,  module: 'CE', session_type: 'training', duration_minutes: 35, theme: 'Environnement' },
  { day: 7,  module: 'SIMULATION', session_type: 'training', duration_minutes: 142, theme: 'Bilan semaine 1' },
  // ... 23 jours suivants
  { day: 28, module: 'SIMULATION', session_type: 'training', duration_minutes: 142, theme: 'Simulation finale' },
  { day: 29, module: 'CO', session_type: 'review', duration_minutes: 20, theme: 'Points faibles' },
  { day: 30, module: 'CE', session_type: 'review', duration_minutes: 20, theme: 'Révision finale' },
]

// Composant : Calendrier de préparation
export function LearningPathCalendar({ plan }: { plan: LearningPlan }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {plan.daily_sessions.map(session => (
        <DayCard
          key={session.day}
          session={session}
          isToday={isToday(session.day, plan.created_at)}
        />
      ))}
    </div>
  )
}
```

**Impact :** Augmente la rétention J30 de ~40% → ~60% (utilisateurs avec un plan structuré reviennent plus régulièrement).

---

### B.4 🔄 Système de mise à jour des sujets d'actualité

**Ce qui existe chez le concurrent :** Les sujets EE et EO sont labellisés "Mai 2026" — preuve d'une mise à jour continue avec des sujets d'actualité récents. Les examinateurs TCF/TEF utilisent des thèmes d'actualité; les candidats veulent s'entraîner sur les mêmes types de sujets.

**Ce qui manque dans notre plan :** Aucune stratégie de **fraîcheur du contenu** ni processus de mise à jour mensuelle.

**À ajouter dans la Section 23 (Stratégie de contenu) :**

```
Cadence de mise à jour des sujets — Processus mensuel obligatoire :

Semaine 1 de chaque mois :
  → Veille actualité : RFI, France 24, Le Devoir, La Presse
  → Sélection de 10 nouveaux thèmes chauds (immigration, économie, etc.)
  → Rédaction de 5 nouveaux sujets EE (lettre + essai argumentatif)
  → Rédaction de 5 nouveaux sujets EO (monologue + interaction)
  → Recherche de 3 nouveaux documents audio authentiques (CO)

Semaine 2 :
  → Révision pédagogique par expert CECRL
  → Intégration en base de données (marquage : "Nouveau" + date)
  → Mise en avant sur la landing page : "Sujets de Juin 2026"

Semaine 3–4 :
  → Blog post : "Les sujets TCF Canada à maîtriser en juin 2026"
  → Newsletter aux abonnés actifs avec les nouveaux sujets
  → Retrait progressif des sujets > 6 mois (archivage, pas suppression)
```

**Nouveau champ en base de données :**

```sql
-- Migration : ajout du marqueur de fraîcheur
ALTER TABLE questions ADD COLUMN published_month VARCHAR(7);  -- ex: '2026-05'
ALTER TABLE questions ADD COLUMN is_topical BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN topical_badge VARCHAR(50);   -- ex: 'Nouveau · Mai 2026'

-- Index pour afficher les sujets récents en priorité
CREATE INDEX idx_questions_recent ON questions(published_month DESC, is_topical DESC);
```

---

### B.5 🎯 Test de positionnement rapide (sans inscription)

**Ce qui existe chez le concurrent :** Accès immédiat au contenu sans friction. La landing page donne envie de tester sans barrière.

**Ce qui manque :** Notre plan force l'inscription avant tout test. Ajouter un **mini-test de 5 questions** accessible sans compte pour démontrer la qualité immédiatement.

```typescript
// src/pages/QuickTestPage.tsx — Accessible sans auth
export function QuickTestPage() {
  // 5 questions CO de niveau B2 accessible à tous
  // Résultats affichés avec estimation NCLC
  // CTA fort : "Vous avez obtenu NCLC 7 — Passez au niveau supérieur"
}
```

**Impact attendu :** Taux de conversion landing → inscription estimé +35% (l'utilisateur a déjà une preuve de valeur avant de créer son compte).

---

### B.6 📊 Page de comparaison TCF vs TEF Canada

**Ce qui existe chez le concurrent :** Le blog couvre explicitement la comparaison TCF/TEF Canada. Les candidats cherchent massivement cette information pour choisir leur examen.

**Ce qui manque dans notre plan :** Aucune page dédiée à cette comparaison. C'est pourtant le terme de recherche le plus populaire dans notre niche.

**Nouvelle page `/tcf-vs-tef-canada` :**

```typescript
// src/pages/ComparisonPage.tsx — Page SEO publique

// Contenu de la page :
// 1. Tableau comparatif officiel (durées, nombre de questions, formats)
// 2. Qui organise chaque examen (France Éducation International vs CCI Paris)
// 3. Lequel choisir selon son profil (Express Entry, PEQ, travailleurs qualifiés)
// 4. Centres d'examen disponibles (Canada, France, Afrique)
// 5. Coûts officiels 2026
// 6. Délais de résultats
// CTA : "Préparez-vous aux deux avec une seule plateforme"

const COMPARISON_DATA = {
  tcf: {
    organisme: 'France Éducation International (FEI)',
    modules_obligatoires: 4,
    co: { questions: 39, duree: '35 min' },
    ce: { questions: 39, duree: '35 min' },
    ee: { taches: 3, duree: '60 min' },
    eo: { taches: 3, duree: '12 min' },
    duree_totale: '2h22',
    validite: '2 ans',
    resultats_delai: '15 jours ouvrables',
    reconnaissance: 'IRCC (Immigration Canada), OIIQ, universités',
  },
  tef: {
    organisme: 'CCI Paris Île-de-France',
    modules_obligatoires: 4,
    co: { questions: 60, duree: '40 min' },
    ce: { questions: 50, duree: '60 min' },
    ee: { taches: 2, duree: '60 min' },
    eo: { taches: 4, duree: '35 min' },
    duree_totale: '3h15',
    validite: '2 ans',
    resultats_delai: '20 jours ouvrables',
    reconnaissance: 'IRCC (Immigration Canada), PEQ, OIIAQ',
  }
}
```

---

### B.7 🏫 Espace institutionnel enrichi — Centre de langues

**Ce qui existe chez le concurrent :** Mentionné "sur devis" sans plus de détails.

**Ce qui manque dans notre plan :** La Section 13 mentionne "Mode institutionnel" mais sans interface dédiée ni fonctionnalités spécifiques. Les centres de langues représentent un marché B2B très lucratif.

**Fonctionnalités institutionnelles à ajouter :**

```typescript
// src/features/institutional/

interface InstitutionalAccount {
  id: string
  name: string              // "Institut Français de Dakar"
  country: string
  max_students: number      // 10 à 500
  subscription_expires: Date
  features: {
    bulk_student_import: boolean   // Import CSV d'étudiants
    group_sessions: boolean        // Sessions synchronisées pour une classe
    teacher_dashboard: boolean     // Tableau de bord enseignant
    progress_reports: boolean      // Rapports PDF par étudiant
    white_label: boolean           // Logo de l'institution
    custom_content: boolean        // Ajout de questions propres
    api_access: boolean            // API pour intégration LMS (Moodle)
  }
}

// Fonctionnalité unique : Simulation en classe synchronisée
// Le professeur lance une simulation, tous les étudiants la passent simultanément
// Tableau de bord en temps réel pour le professeur
// Export rapport CSV après la session

interface ClassSession {
  id: string
  teacher_id: string
  institution_id: string
  students: string[]        // IDs des étudiants
  module: 'CO' | 'CE' | 'SIMULATION'
  status: 'waiting' | 'active' | 'completed'
  started_at?: Date
  results?: StudentResult[]
}
```

**Tarification institutionnelle proposée :**

| Plan | Étudiants | Prix/mois | Fonctionnalités |
|---|---|---|---|
| Classe | 10–30 | 199 € | Dashboard prof + rapports |
| École | 31–100 | 499 € | + API LMS + white-label |
| Institution | 101–500 | 999 € | + Contenu personnalisé + Account Manager |
| Entreprise | 500+ | Sur devis | Tout inclus + SLA garanti |

---

## C. Modèle de monétisation complémentaire

### C.1 Packs temporels à durée limitée — Modèle hybride

**Ce qui existe chez le concurrent :**

| Pack | Prix | Durée | Simulateur IA |
|---|---|---|---|
| Bronze | 14,99$ | 5 jours | 3 essais |
| Silver | 29,99$ | 1 mois | 8 essais |
| Gold | 49,99$ | 2 mois | 15 essais |

**Analyse :** Ce modèle est **radicalement différent** de notre abonnement mensuel. Les avantages :
1. **Barrier d'entrée plus faible** : 14,99$ pour 5 jours est plus accessible psychologiquement que 9,99€/mois
2. **Urgence naturelle** : durée limitée = utilisation intensive = satisfaction maximale
3. **Idéal pour les candidats proches de l'examen** (J-15 à J-5)

**À ajouter dans notre plan — Section 13 Monétisation :**

```typescript
// Nouveau type de produit : Pack examen
interface ExamPack {
  id: 'bronze' | 'silver' | 'gold' | 'platinum'
  name: string
  price_eur: number
  price_cfa?: number        // Pour les marchés africains
  duration_days: number
  ai_simulator_trials: number   // Nombre de corrections IA EE/EO incluses
  co_tests: number              // Nombre de tests CO inclus
  ce_tests: number              // Nombre de tests CE inclus
  full_simulations: number      // Nombre de simulations complètes
}

// Nouveaux produits Stripe (en complément des abonnements)
const EXAM_PACKS: ExamPack[] = [
  {
    id: 'bronze',
    name: 'Pack Découverte',
    price_eur: 14.99,
    price_cfa: 9800,
    duration_days: 5,
    ai_simulator_trials: 3,
    co_tests: 40,
    ce_tests: 40,
    full_simulations: 1,
  },
  {
    id: 'silver',
    name: 'Pack Préparation',
    price_eur: 29.99,
    price_cfa: 19600,
    duration_days: 30,
    ai_simulator_trials: 8,
    co_tests: 120,
    ce_tests: 120,
    full_simulations: 5,
  },
  {
    id: 'gold',
    name: 'Pack Intensif',
    price_eur: 49.99,
    price_cfa: 32700,
    duration_days: 60,
    ai_simulator_trials: 15,
    co_tests: 300,
    ce_tests: 300,
    full_simulations: 12,
  },
  {
    id: 'platinum',
    name: 'Pack Champion',
    price_eur: 79.99,
    price_cfa: 52300,
    duration_days: 90,
    ai_simulator_trials: 30,
    co_tests: 999, // illimité
    ce_tests: 999, // illimité
    full_simulations: 999, // illimité
  },
]
```

**Edge Function — Activation d'un pack :**

```typescript
// supabase/functions/activate-pack/index.ts
serve(async (req) => {
  const { pack_id, user_id } = await req.json()
  const pack = EXAM_PACKS.find(p => p.id === pack_id)
  
  const expires_at = new Date()
  expires_at.setDate(expires_at.getDate() + pack.duration_days)
  
  await supabase.from('subscriptions').upsert({
    user_id,
    plan_type: 'pack',
    pack_id,
    expires_at,
    ai_trials_remaining: pack.ai_simulator_trials,
    co_tests_remaining: pack.co_tests,
    ce_tests_remaining: pack.ce_tests,
    simulations_remaining: pack.full_simulations,
  })
})
```

### C.2 Paiement en FCFA — Marchés Afrique francophone

**Ce qui manque dans notre plan :** Le plan mentionne "réduction -40% Afrique" mais ne spécifie pas de **méthode de paiement locale**. Le vrai problème en Afrique subsaharienne n'est pas le prix mais l'accès aux paiements par carte internationale.

**Intégrations de paiement à ajouter :**

| Pays | Méthode | Opérateur | Volume potentiel |
|---|---|---|---|
| Sénégal, Mali, Côte d'Ivoire | Orange Money | Orange | ★★★★★ |
| Cameroun, Congo | MTN Mobile Money | MTN | ★★★★ |
| Maroc | CMI, Stripe MENA | Diverses | ★★★ |
| Algérie | CIB, Dahabia | Algérie Poste | ★★★ |
| Tunisie | Carte Visa locale + Stripe | Diverses | ★★★ |

**Intégration technique — Fedapay (agrégateur Afrique) :**

```typescript
// supabase/functions/create-fedapay-checkout/index.ts
// FedaPay supporte Orange Money, MTN Mobile Money, Moov, Wave
import { FedaPay } from 'fedapay-node'

serve(async (req) => {
  const { pack_id, user_id, phone_number, currency } = await req.json()
  const pack = EXAM_PACKS.find(p => p.id === pack_id)
  
  // Calcul prix avec réduction Afrique 40%
  const price_xof = pack.price_eur * 655.957 * 0.6  // EUR→XOF - 40%
  
  const transaction = await FedaPay.Transaction.create({
    description: `Pack ${pack.name} — FRANCOPHONIE ACADEMIA`,
    amount: Math.round(price_xof),
    currency: { iso: currency || 'XOF' },
    callback_url: `${process.env.APP_URL}/payment/success`,
    customer: { phone_number }
  })
  
  return new Response(JSON.stringify({ 
    payment_url: transaction.links.payment_url 
  }))
})
```

---

## D. Stratégie de contenu enrichie

### D.1 Blog — Architecture SEO complète

**Ce qui existe chez le concurrent :** 101+ pages de blog avec pagination. Des articles catégorisés par épreuve.

**Ce qui manque dans notre plan :** La Phase 5 prévoit seulement "20 articles" pour le lancement. C'est insuffisant pour dominer le SEO face à un concurrent qui a déjà 100+ articles.

**Plan de contenu étendu :**

```
Phase 1 (avant lancement) — 30 articles fondamentaux :
  ├── 10 articles "Guide TCF Canada [Épreuve]" (CO, CE, EE, EO × TCF + TEF)
  ├── 5 articles "Comment obtenir NCLC [X]"
  ├── 5 articles "TCF Canada vs TEF Canada : [Critère]"
  ├── 5 articles "Préparation en [X] semaines"
  └── 5 articles "Centres d'examen au [Pays]"

Phase 2 (mois 1–3) — 10 articles/mois :
  ├── 4 articles "Sujets de [Mois] [Année]" (CO, CE, EE, EO)
  ├── 3 articles thématiques (immigration, santé, économie...)
  └── 3 articles "Témoignage candidat [Score]"

Phase 3 (mois 4+) — 15 articles/mois :
  ├── 6 articles sujets du mois
  ├── 4 articles approfondissement grammatical
  ├── 3 articles immigration Canada (actualité)
  └── 2 articles comparatifs et guides
```

**Structure SEO des articles :**

```markdown
# Titre optimisé (H1 avec mot-clé principal)

## Introduction (150–200 mots)
- Problème du lecteur
- Ce que l'article va résoudre
- CTA discret vers la plateforme

## [Section principale] (H2)
...contenu de valeur...

## Exemple pratique (H2)
- Exercice réel de la banque de questions (1–2 questions démo)
- [CTA] "Accédez à 300+ questions similaires →"

## FAQ (H2) [Schema.org FAQPage]
- 3–5 questions fréquentes avec réponses
- Données structurées JSON-LD

## Conclusion
- Résumé
- CTA principal vers inscription

---
*Dernière mise à jour : [date automatique]*  
*Auteur : Expert certifié TCF/TEF Canada*
```

### D.2 Chaîne YouTube — Stratégie vidéo

**Ce qui existe chez le concurrent :** Référence à une chaîne YouTube comme canal de support.

**Ce qui manque dans notre plan :** Aucune stratégie vidéo. Or YouTube est le 2e moteur de recherche mondial et une source majeure de trafic pour ce type de contenu éducatif.

**Plan YouTube à intégrer :**

| Type de vidéo | Fréquence | Durée | Exemple |
|---|---|---|---|
| "Épreuve corrigée" | 2×/mois | 20–40 min | "CO TCF Canada : 39 questions corrigées" |
| "Sujet du mois EE" | 1×/mois | 15 min | "Rédaction corrigée : C2 en 60 minutes" |
| "Stratégie épreuve" | 1×/semaine | 8–12 min | "5 techniques pour le CO TEF Canada" |
| "Témoignage" | 1×/mois | 10 min | "De B1 à C1 en 3 mois : témoignage Aminata" |
| "Live Q&A" | 1×/mois | 60 min | Session questions/réponses avec candidats |

**Intégration plateforme ↔ YouTube :**

```typescript
// src/features/resources/YouTubeSection.tsx
// Section "Ressources vidéo" dans le dashboard (vidéos YouTube embarquées)
// Personnalisées selon le module en cours de l'utilisateur
```

---

## E. Support et relation client

### E.1 Chat en direct intégré — Remplacement du formulaire

**Ce qui manque dans notre plan :** La Section 17 mentionne un "formulaire de contact" pour le support. Insuffisant vs. un concurrent qui offre WhatsApp. Ajouter Crisp ou Intercom.

```typescript
// src/components/LiveChat.tsx
// Crisp est gratuit jusqu'à 2 agents, parfait pour le MVP
// docs: https://docs.crisp.chat/guides/chatbox-sdks/web/javascript/

useEffect(() => {
  window.$crisp = []
  window.CRISP_WEBSITE_ID = process.env.VITE_CRISP_WEBSITE_ID
  
  // Pré-remplir avec les données utilisateur si connecté
  if (user) {
    window.$crisp.push(['set', 'user:email', [user.email]])
    window.$crisp.push(['set', 'user:nickname', [user.full_name]])
    window.$crisp.push(['set', 'session:data', [[
      ['plan', user.subscription_tier],
      ['exam_date', user.exam_date],
      ['target_score', user.target_nclc],
    ]]])
  }
  
  const d = document
  const s = d.createElement('script')
  s.src = 'https://client.crisp.chat/l.js'
  s.async = true
  d.getElementsByTagName('head')[0].appendChild(s)
}, [user])
```

**Coût :** Crisp gratuit (0€) pour 2 agents · Intercom ~$74/mois pour fonctionnalités avancées.

### E.2 Base de connaissances (FAQ enrichie)

**Ce qui manque dans notre plan :** La FAQ de la landing page a 4 questions. Insuffisant. Créer une vraie **base de connaissances** avec moteur de recherche.

**Structure `/aide` :**

```
Centre d'aide
├── Démarrage rapide
│   ├── Comment créer mon compte ?
│   ├── Comment choisir entre TCF et TEF Canada ?
│   └── Comment utiliser le test diagnostique ?
├── Modules d'entraînement
│   ├── Compréhension de l'Oral — 8 articles
│   ├── Compréhension des Écrits — 8 articles
│   ├── Expression Écrite — 10 articles
│   └── Expression Orale — 10 articles
├── Abonnements et paiements
│   ├── Quels sont les moyens de paiement acceptés ?
│   ├── Comment fonctionne le remboursement ?
│   ├── Puis-je changer de plan en cours de mois ?
│   └── Facture et reçu fiscal
├── Correction IA
│   ├── Comment interpréter ma correction IA ?
│   ├── Délai de correction humaine ?
│   └── Que faire si ma correction semble incorrecte ?
└── Compte et données
    ├── Comment supprimer mon compte (RGPD) ?
    ├── Télécharger mes données
    └── Changer mon email / mot de passe
```

---

## F. SEO et marketing digital

### F.1 Données structurées Schema.org manquantes

**Ce qui manque dans notre plan :** Aucune mention de balisage Schema.org. Pourtant crucial pour apparaître dans les "rich snippets" Google.

**À ajouter dans la landing page (HTML) :**

```html
<!-- Schema.org Organization -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "FRANCOPHONIE ACADEMIA",
  "description": "Plateforme de préparation au TCF et TEF Canada",
  "url": "https://francophonie.academia",
  "logo": "https://francophonie.academia/logo.png",
  "sameAs": [
    "https://www.youtube.com/@francophoniAcademia",
    "https://www.instagram.com/francophoniAcademia",
    "https://www.facebook.com/francophoniAcademia"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": "French",
    "contactOption": "TollFree"
  }
}
</script>

<!-- Schema.org Course (pour chaque module) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Préparation Compréhension Orale TCF Canada",
  "description": "39 questions · 35 minutes · Niveau B1 à C2",
  "provider": {
    "@type": "Organization",
    "name": "FRANCOPHONIE ACADEMIA"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "inLanguage": "fr"
  }
}
</script>

<!-- Schema.org FAQPage -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Combien de questions y a-t-il au TCF Canada ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le TCF Canada comprend 39 questions de Compréhension de l'Oral (35 min), 39 questions de Compréhension des Écrits (35 min), 3 tâches d'Expression Écrite (60 min) et 3 tâches d'Expression Orale (12 min)."
      }
    }
  ]
}
</script>
```

### F.2 Programme d'affiliation — Acquisition organique

**Ce qui manque dans notre plan :** Le plan mentionne le "parrainage" dans la gamification mais sans système d'affiliation formel pour les influenceurs et YouTubeurs.

**Système d'affiliation à concevoir :**

```typescript
// supabase/functions/affiliate-tracking/

interface AffiliatePartner {
  id: string
  name: string              // "Mamadou Français YouTube"
  email: string
  code: string              // ex: "MAMADOU15"
  commission_rate: number   // ex: 0.20 = 20%
  payment_method: 'paypal' | 'bank_transfer' | 'mobile_money'
  total_clicks: number
  total_conversions: number
  total_earned_eur: number
}

// Tracking : URL avec paramètre affilié
// https://francophonie.academia?ref=MAMADOU15
// → Cookie 30 jours
// → Si inscription + paiement dans les 30j : commission versée
```

**Partenaires cibles :**
- YouTubeurs "TCF Canada préparation" (> 1 000 abonnés)
- Groupes Facebook "Immigration Canada" (> 10 000 membres)
- Blogs immigration francophones (> 5 000 visiteurs/mois)
- Influenceurs Instagram diaspora africaine

---

## G. Conformité légale renforcée

### G.1 Politique de remboursement explicite

**Ce qui existe chez le concurrent :** Une page "Politique de remboursement" dédiée.

**Ce qui manque dans notre plan :** Aucune politique de remboursement spécifiée.

**À ajouter — Page `/remboursement` et CGV :**

```markdown
# Politique de remboursement — FRANCOPHONIE ACADEMIA

## Abonnements mensuels/annuels
- **Essai gratuit 7 jours** : Annulable à tout moment sans frais.
- **Remboursement sous 14 jours** : Si vous n'êtes pas satisfait dans les 14 jours 
  suivant votre premier paiement, contactez-nous pour un remboursement intégral.
- **Au-delà de 14 jours** : Aucun remboursement partiel pour la période déjà écoulée, 
  mais l'accès reste actif jusqu'à la fin de la période payée.

## Packs à durée limitée
- **Remboursement sous 24h** : Si vous n'avez utilisé aucune fonctionnalité du pack, 
  remboursement intégral sous 24h après achat.
- **Si des corrections IA ont été utilisées** : Remboursement au prorata du temps non 
  consommé uniquement.

## Corrections humaines expertes
- Non remboursables une fois la correction rendue.
- Si le délai garanti (48h EE / 72h EO) n'est pas respecté : avoir de 100% sur le prochain achat.

## Procédure
Envoyez votre demande à : remboursement@francophonie.academia
Délai de traitement : 5 jours ouvrables.
```

### G.2 Gestion des cookies conforme ePrivacy

**Ce qui existe chez le concurrent :** Une page "Gestion des cookies" dédiée.

**Ce qui manque dans notre plan :** Le plan mentionne RGPD mais sans implémentation spécifique de la bannière de cookies et de la gestion des consentements.

```typescript
// src/components/CookieBanner.tsx
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CookieConsent {
  essential: true           // Toujours true, non modifiable
  analytics: boolean        // Mixpanel, Google Analytics
  marketing: boolean        // Pixel Meta, Google Ads
  given_at?: Date
}

const useCookieStore = create<CookieConsent>()(
  persist(
    () => ({
      essential: true,
      analytics: false,
      marketing: false,
    }),
    { name: 'fa-cookie-consent' }
  )
)

export function CookieBanner() {
  const { analytics, marketing, setConsent } = useCookieStore()
  const [show, setShow] = useState(!localStorage.getItem('fa-cookie-consent'))

  if (!show) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[200] bg-white border-t shadow-2xl p-6">
      <div className="max-w-5xl mx-auto">
        <h3 className="font-bold text-lg mb-2">Gestion des cookies</h3>
        <p className="text-gray-600 text-sm mb-4">
          Nous utilisons des cookies pour améliorer votre expérience. 
          Les cookies essentiels ne peuvent pas être désactivés.{' '}
          <a href="/cookies" className="text-primary underline">En savoir plus</a>
        </p>
        <div className="flex flex-wrap gap-4 mb-4">
          <Toggle label="Essentiels (requis)" checked={true} disabled />
          <Toggle 
            label="Analytiques" 
            checked={analytics}
            onChange={(v) => setConsent({ analytics: v })}
          />
          <Toggle 
            label="Marketing" 
            checked={marketing}
            onChange={(v) => setConsent({ marketing: v })}
          />
        </div>
        <div className="flex gap-3">
          <button onClick={acceptAll} className="btn btn--primary btn--sm">
            Tout accepter
          </button>
          <button onClick={savePreferences} className="btn btn--outline btn--sm">
            Enregistrer mes préférences
          </button>
          <button onClick={rejectAll} className="btn btn--ghost btn--sm">
            Tout refuser
          </button>
        </div>
      </div>
    </div>
  )
}
```

### G.3 Conformité LPRPDE (Canada) — spécifique au marché cible

**Ce qui manque dans notre plan :** La LPRPDE (Loi sur la protection des renseignements personnels et les documents électroniques) est la loi canadienne équivalente au RGPD. Le public cible (candidats à l'immigration au Canada) est particulièrement sensible à cette conformité.

**À ajouter :**

```typescript
// Mentions obligatoires LPRPDE dans les CGU et politique de confidentialité :

const LPRPDE_REQUIREMENTS = {
  // 1. Consentement explicite requis pour toutes les collectes
  consent: "Consentement opt-in pour chaque type de donnée",
  
  // 2. Droit d'accès aux données
  access_right: "L'utilisateur peut demander une copie de toutes ses données",
  
  // 3. Responsable des données identifié
  data_officer: {
    name: "Responsable Protection des Données",
    email: "privacy@francophonie.academia",
    address: "Montréal, Québec, Canada"
  },
  
  // 4. Signalement de violation dans les 72h
  breach_notification: "Notification CNIL + CPVP dans les 72h",
  
  // 5. Transfert de données hors Canada
  data_transfer: "Données hébergées EU + Canada (Supabase Frankfurt + Vercel)"
}
```

---

## H. Améliorations UX/UI basées sur le concurrent

### H.1 Badge "Accès 24/7" — Argument de vente manquant

**Ce qui existe chez le concurrent :** "Accès 24/7" mis en avant comme avantage clé.

**À ajouter dans la landing page, Section Modules :**

```html
<!-- Barre d'avantages entre la hero et les modules -->
<section class="benefits-bar">
  <div class="container">
    <div class="benefits-bar__items">
      <div class="benefit-item">
        <span class="benefit-icon">🕐</span>
        <span>Accès 24h/24, 7j/7</span>
      </div>
      <div class="benefit-item">
        <span class="benefit-icon">📱</span>
        <span>Web + iOS + Android</span>
      </div>
      <div class="benefit-item">
        <span class="benefit-icon">🔄</span>
        <span>Sujets mis à jour chaque mois</span>
      </div>
      <div class="benefit-item">
        <span class="benefit-icon">🤖</span>
        <span>Correction IA immédiate</span>
      </div>
      <div class="benefit-item">
        <span class="benefit-icon">🏆</span>
        <span>95% de taux de réussite</span>
      </div>
    </div>
  </div>
</section>
```

### H.2 Page de résultats améliorée — Score personnalisé

**Ce qui manque dans notre plan :** Après chaque simulation, le rapport doit inclure une **recommandation personnalisée** vers les ressources manquantes.

```typescript
// src/features/results/SimulationReport.tsx

interface SimulationReport {
  session_id: string
  scores: {
    CO: { raw: number; nclc: string; percentile: number }
    CE: { raw: number; nclc: string; percentile: number }
    EE: { raw: number; nclc: string; percentile: number }
    EO: { raw: number; nclc: string; percentile: number }
  }
  weakest_module: 'CO' | 'CE' | 'EE' | 'EO'
  recommended_exercises: Question[]  // Questions similaires aux erreurs
  comparison: {
    vs_last_simulation: number       // % d'amélioration
    vs_platform_average: number      // Vs autres utilisateurs mêmes niveaux
  }
  next_steps: {
    title: string
    description: string
    cta_url: string
    estimated_improvement: string    // "Gagner +2 points NCLC en 2 semaines"
  }[]
}

// Affichage du rapport avec :
// 1. Score global NCLC estimé (badge animé)
// 2. Radar chart 4 compétences
// 3. Comparaison avec simulation précédente (progression)
// 4. Top 3 erreurs les plus fréquentes avec explications
// 5. Plan de travail personnalisé "Pour votre prochain examen..."
// 6. Partage résultat sur WhatsApp/Instagram (avec template graphique)
```

### H.3 Stories de réussite — Preuve sociale renforcée

**Ce qui manque dans notre plan :** Les 3 témoignages statiques de la landing sont insuffisants. Créer une vraie page de succès stories avec filtres.

**Page `/reussites` :**

```typescript
// Filtres : pays d'origine, score obtenu, module le plus difficile, durée de préparation
// Affichage : carte avec photo, score avant/après, témoignage, date d'examen

interface SuccessStory {
  id: string
  user_id: string           // Anonymisé en production
  first_name: string
  last_name_initial: string  // "Aminata S."
  country_origin: string
  destination: string
  exam_type: 'TCF_CANADA' | 'TEF_CANADA'
  exam_date: Date
  final_score: number
  final_nclc: string
  preparation_weeks: number
  quote: string
  photo_url?: string
  verified: boolean          // Vérification manuelle par l'équipe
}
```

---

## I. Roadmap mise à jour avec les nouvelles fonctionnalités

### Phase 0 — Pré-lancement SEO (Mois -1 avant Phase 1 officielle)

> **Nouveau** — Non présent dans le plan actuel

| Tâche | Durée | Priorité |
|---|---|---|
| Rédaction des 30 articles fondamentaux SEO | 21j | 🔴 HAUTE |
| Page calculateur NCLC (HTML statique, sans auth) | 3j | 🔴 HAUTE |
| Page comparaison TCF vs TEF Canada | 2j | 🟡 MOYENNE |
| Mise en place Schema.org sur landing + blog | 2j | 🔴 HAUTE |
| Soumission Google Search Console | 1j | 🔴 HAUTE |
| Création chaîne YouTube + 3 vidéos fondatrices | 7j | 🟡 MOYENNE |
| Configuration WhatsApp Business | 1j | 🔴 HAUTE |

### Mise à jour Phase 1 (Mois 1–2) — Ajouts

| Tâche nouvelle | Durée | Section |
|---|---|---|
| Bannière cookies conforme ePrivacy | 2j | Conformité |
| Page remboursement + CGV complètes | 2j | Légal |
| Bouton WhatsApp flottant | 1j | Support |
| Page `/calculateur-nclc` React (avec auth optionnel) | 3j | Marketing |
| Système d'affiliation (codes promos, tracking) | 4j | Monétisation |

### Mise à jour Phase 2 (Mois 3–4) — Ajouts

| Tâche nouvelle | Durée | Section |
|---|---|---|
| Packs à durée limitée (Bronze/Silver/Gold) dans Stripe | 3j | Monétisation |
| Intégration FedaPay (paiements Mobile Money Afrique) | 5j | Paiements |
| Mini-test 5 questions sans inscription | 2j | Acquisition |
| Parcours adaptatif 30/60/90 jours | 8j | Pédagogie |

### Mise à jour Phase 3 (Mois 5–6) — Ajouts

| Tâche nouvelle | Durée | Section |
|---|---|---|
| Page `/sujets-du-mois` avec sujets actualisés | 3j | Contenu |
| Intégration Crisp live chat | 1j | Support |
| Centre d'aide `/aide` (base de connaissances) | 5j | Support |
| Système de mise à jour mensuelle du contenu (process) | — | Editorial |

### Mise à jour Phase 4 (Mois 7–9) — Ajouts

| Tâche nouvelle | Durée | Section |
|---|---|---|
| Interface institutionnelle enseignant | 8j | B2B |
| Simulations en classe synchronisées | 6j | B2B |
| Page `/reussites` avec success stories | 4j | Social proof |
| Partage résultat sur réseaux sociaux (template) | 3j | Viral |

---

## J. Métriques et KPIs additionnels

### J.1 KPIs manquants dans le plan actuel

| KPI | Définition | Objectif 6 mois | Objectif 12 mois |
|---|---|---|---|
| Trafic organique Google | Visites/mois depuis recherche | 5 000 | 25 000 |
| Taux de conversion calculateur NCLC → inscription | % visiteurs du calculateur qui créent un compte | 8% | 15% |
| Revenu Mobile Money (Afrique) | % du MRR issu de paiements mobile | 20% | 35% |
| Partenaires affiliés actifs | Affiliés ayant généré ≥ 1 conversion/mois | 10 | 50 |
| Score satisfaction WhatsApp | CSAT sur interactions WhatsApp | > 4.2/5 | > 4.5/5 |
| Taux de renouvellement packs | % clients qui reachètent un pack | 30% | 50% |
| Délai moyen correction humaine | Heures entre soumission et rendu | < 36h | < 24h |
| Contenu mis à jour mensuellement | Nouveaux sujets publiés/mois | ≥ 20 | ≥ 30 |
| Sessions complètes (taux de finition) | % sessions démarrées → terminées | > 65% | > 75% |
| Part institutionnelle du MRR | % revenus issus de comptes institutions | 5% | 15% |

### J.2 Dashboard analytics enrichi (Mixpanel events manquants)

```typescript
// Événements Mixpanel à ajouter (absents du plan actuel)

// Calculateur NCLC
analytics.track('nclc_calculator_used', {
  test_type: 'TCF_CANADA',
  estimated_nclc: 'NCLC 8',
  registered_after: false  // A-t-il créé un compte ensuite ?
})

// WhatsApp
analytics.track('whatsapp_contact_initiated', {
  source: 'floating_button' | 'contact_page' | 'pricing_page',
  user_plan: 'gratuit' | 'silver',
})

// Packs
analytics.track('pack_purchased', {
  pack_id: 'silver',
  payment_method: 'orange_money' | 'stripe',
  country: 'SN',
  discount_applied: 'africa40',
})

// Parcours adaptatif
analytics.track('learning_plan_created', {
  target_level: 'C1',
  exam_date_days_remaining: 45,
  duration_plan: 30,
})

// Partage social
analytics.track('result_shared', {
  platform: 'whatsapp' | 'instagram' | 'facebook',
  score: 'NCLC 9',
  session_type: 'simulation',
})
```

---

## Synthèse des manquements et priorités

### 🔴 Critique (à corriger avant tout développement)

| # | Manquement | Impact |
|---|---|---|
| 1 | **Nombre de questions CO/CE incorrect** (29 vs 39) | Règles métier fausses, timer incorrect |
| 2 | **Aucun outil NCLC public gratuit** | Manque le principal canal d'acquisition SEO |
| 3 | **Pas de paiement Mobile Money (Afrique)** | 60% des utilisateurs cibles sous-servis |
| 4 | **Politique de remboursement absente** | Risque légal, perte de confiance |

### 🟡 Important (à intégrer avant le lancement)

| # | Manquement | Impact |
|---|---|---|
| 5 | **Pas de WhatsApp Business** | Taux de conversion réduit sur marchés africains |
| 6 | **Pas de contenu SEO pré-lancement** | Trafic organique nul au lancement |
| 7 | **Pas de parcours structuré 30/60/90 jours** | Rétention J30 sous-optimale |
| 8 | **Gestion cookies non conforme** | Risque RGPD + ePrivacy |
| 9 | **Packs à durée limitée absents** | Modèle de prix unique, flexibilité réduite |
| 10 | **Schema.org non implementé** | Position Google réduite |

### 🟢 Améliorations (post-lancement Phase 1)

| # | Manquement | Impact |
|---|---|---|
| 11 | Chaîne YouTube sans stratégie | Canal de trafic non exploité |
| 12 | Espace institutionnel basique | Marché B2B non capturé |
| 13 | Pas de programme d'affiliation | Acquisition payante uniquement |
| 14 | Mini-test sans inscription absent | Friction à l'onboarding |
| 15 | Page TCF vs TEF Canada manquante | Mot-clé fort non capturé |

---

*Document rédigé en mai 2026 — À intégrer dans francophoniafinal.md v3.0*  
*Auteur : Équipe Produit FRANCOPHONIE ACADEMIA*  
*Basé sur l'analyse comparative de formation-tcfcanada.com*
