# ayePREP — Plan Full-Stack Complet (End-to-End)
**Version** : 3.0 — Mai 2026 *(mise à jour majeure : packs, FedaPay, affiliation, parcours, SEO)*  
**Auteur** : Spécification rédigée par un développeur full-stack senior  
**Contact porteur de projet** : ayebouyaovi@gmail.com  
**Destinataire** : Équipe de développement AntiGravity — Google  
**Slogan** : *"Préparez-vous comme si c'était le vrai jour J."*

---

## Table des matières

1. [Vision, objectifs et positionnement](#1-vision-objectifs-et-positionnement)
2. [Architecture générale end-to-end](#2-architecture-générale-end-to-end)
3. [Structure du monorepo](#3-structure-du-monorepo)
4. [Landing page — HTML, CSS, JavaScript](#4-landing-page--html-css-javascript)
5. [Frontend Web — React 18 + TypeScript](#5-frontend-web--react-18--typescript)
6. [Application Mobile — Flutter 3.x](#6-application-mobile--flutter-3x)
7. [Base de données — Schéma PostgreSQL complet](#7-base-de-données--schéma-postgresql-complet)
8. [Backend — Supabase Edge Functions (Deno)](#8-backend--supabase-edge-functions-deno)
9. [API Design — Contrats et schémas](#9-api-design--contrats-et-schémas)
10. [Authentification et gestion des sessions](#10-authentification-et-gestion-des-sessions)
11. [Modules pédagogiques — Spécifications techniques](#11-modules-pédagogiques--spécifications-techniques)
12. [Système de correction IA (GPT-4o + Whisper)](#12-système-de-correction-ia-gpt-4o--whisper)
13. [Monétisation — Stripe et RevenueCat](#13-monétisation--stripe-et-revenuecat)
14. [Gamification et progression](#14-gamification-et-progression)
15. [Mode hors-ligne et synchronisation](#15-mode-hors-ligne-et-synchronisation)
16. [Animations et interactions UX](#16-animations-et-interactions-ux)
17. [Interface d'administration (Back-office)](#17-interface-dadministration-back-office)
18. [Sécurité et conformité RGPD](#18-sécurité-et-conformité-rgpd)
19. [Tests, CI/CD et DevOps](#19-tests-cicd-et-devops)
20. [Performance et optimisation](#20-performance-et-optimisation)
21. [Roadmap détaillée — 5 phases sur 12 mois](#21-roadmap-détaillée--5-phases-sur-12-mois)
22. [Budget, outils et coûts mensuels](#22-budget-outils-et-coûts-mensuels)
23. [Stratégie de contenu pédagogique C2](#23-stratégie-de-contenu-pédagogique-c2)
24. [Contraintes absolues et règles de livraison](#24-contraintes-absolues-et-règles-de-livraison)
25. [Packs à durée limitée et paiement Mobile Money (FedaPay)](#25-packs-à-durée-limitée-et-paiement-mobile-money-fedapay)
26. [Programme d'affiliation](#26-programme-daffiliation)
27. [Parcours d'apprentissage personnalisé](#27-parcours-dapprentissage-personnalisé)
28. [Pages SEO et outils gratuits](#28-pages-seo-et-outils-gratuits)
29. [Conformité RGPD avancée — Bannière cookies](#29-conformité-rgpd-avancée--bannière-cookies)
30. [Changelog et historique des versions](#30-changelog-et-historique-des-versions)

---

## 1. Vision, objectifs et positionnement

### 1.1 Mission

ayePREP est la plateforme de référence mondiale pour la préparation aux tests TCF Canada et TEF Canada. Elle reproduit fidèlement les conditions réelles d'examen et accompagne chaque candidat jusqu'au niveau C2 (CLB 11–12).

### 1.2 Problème résolu

Les candidats à l'immigration permanente au Canada (programme Express Entry, PEQ, etc.) doivent obtenir des scores élevés au TCF ou TEF Canada. Or, il n'existe aucune plateforme numérique complète qui :
- Reproduit **exactement** les durées officielles des épreuves
- Couvre les **4 épreuves** (CO, CE, EE, EO) avec un volume de sujets suffisant
- Propose des **corrections IA contextuelles** et des **corrections humaines expertes**
- Fonctionne **hors-ligne** sur mobile pour des pays à connectivité limitée
- S'adapte au **niveau réel** de l'utilisateur avec un parcours personnalisé

### 1.3 Utilisateurs cibles

| Persona | Profil | Besoin principal |
|---|---|---|
| Immigrant Express Entry | 25–45 ans, monde entier | Score B2–C1 minimum pour les points max |
| Demandeur PEQ / QSWP | 20–35 ans, Afrique, Asie, Europe | C1 ou C2 obligatoire |
| Professionnel de santé | Infirmiers, médecins, pharmaciens | CLB 10+ exigé par les ordres |
| Étudiant international | 18–25 ans | Admission universités québécoises |
| Centre de langues | Institutions | Abonnement institutionnel pour groupes |

### 1.4 Indicateurs de succès (KPIs)

| KPI | Objectif 6 mois | Objectif 12 mois |
|---|---|---|
| Utilisateurs actifs mensuels | 5 000 | 25 000 |
| Taux de conversion freemium→payant | 12% | 18% |
| MRR (revenu mensuel récurrent) | 15 000 € | 90 000 € |
| Score NPS (Net Promoter Score) | > 50 | > 65 |
| Taux de rétention J30 | > 40% | > 55% |
| Utilisateurs obtenant B2+ après 60j | > 70% | > 75% |

---

## 2. Architecture générale end-to-end

### 2.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS (Tier 1)                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   Web (React 18) │  │  iOS (Flutter)   │  │ Android (Flutter)│  │
│  │   Vercel CDN     │  │   App Store      │  │  Google Play     │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼─────────────────────┼─────────────────────┼────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Tier 2)                           │
│              Supabase REST API + GraphQL + Realtime WS              │
│              Supabase Auth — JWT (RS256)                            │
│              Edge Functions (Deno) — logique métier                 │
└─────────────────────────────────────────────────────────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVICES DONNÉES (Tier 3)                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL 15  │  │ Supabase Storage │  │  Supabase        │  │
│  │  + RLS + pgvec  │  │ (audios, images) │  │  Realtime        │  │
│  └─────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICES EXTERNES (Tier 4)                       │
│  OpenAI GPT-4o    Stripe + RevenueCat    Cloudflare R2 + CDN        │
│  OpenAI Whisper   Firebase FCM           Sentry + Mixpanel          │
│  FedaPay (Mobile Money Afrique)          Schema.org JSON-LD SEO     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Flux de données principaux

**Flux 1 — Session d'entraînement QCM (CO/CE)**
```
Utilisateur → React/Flutter → Supabase REST (GET /questions)
→ Filtre RLS côté BD → Questions servies
→ Réponse utilisateur → REST (POST /answers)
→ Edge Function score_qcm → Calcul score + XP + streak
→ Realtime broadcast → Mise à jour UI en temps réel
```

**Flux 2 — Soumission Expression Écrite**
```
Utilisateur soumet texte → Edge Function correct_ee
→ Validation antifraud (longueur, langue) → OpenAI GPT-4o API
→ JSON critique structuré → Stockage answers.auto_feedback
→ Notification FCM si correction expert demandée
→ Rapport affiché avec animations radar
```

**Flux 3 — Expression Orale**
```
Microphone → WebRTC/native recorder → Audio blob (MP3/WebM)
→ Upload Supabase Storage (chemin signé) → Edge Function transcribe_eo
→ Whisper API → Transcription → GPT-4o analyse
→ Feedback JSON → answers.auto_feedback + audio_transcript
→ Score affiché avec waveform replay
```

**Flux 4 — Paiement abonnement (Web, Stripe)**
```
Clic "S'abonner" → Edge Function create_checkout_session
→ Stripe Checkout Session URL → Redirect Stripe
→ Paiement OK → Webhook Stripe → Edge Function stripe_webhook
→ Mise à jour subscriptions + users.subscription_tier
→ Realtime update → UI déverrouille les fonctionnalités
```

**Flux 5 — Paiement Pack Mobile Money (FedaPay — Afrique)**
```
Clic "Payer Mobile Money" → Edge Function fedapay-payment
→ Validation JWT + pack_id + montant XOF anti-fraude
→ FedaPay API : création transaction + send_now (USSD push)
→ Utilisateur confirme sur son téléphone (code PIN)
→ Webhook FedaPay → Edge Function fedapay-webhook
→ Vérification signature HMAC-SHA256 + idempotence
→ Création user_pack_subscriptions + update users.active_pack_id
→ Pack activé — accès déverrouillé
```

**Flux 6 — Tracking affilié**
```
Visiteur clique lien ?ref=CODE → AffiliateTracker (React)
→ Lecture URL params → localStorage (TTL 30 jours)
→ Edge Function track-affiliate → RPC track_affiliate_click()
→ Click ID stocké en localStorage
→ À l'inscription → convert_affiliate_click(click_id, user_id)
→ Mise à jour affiliate_clicks + affiliates.total_conversions
→ Commission calculée lors du premier achat payant
```

### 2.3 Régions et latence

| Service | Région | SLA |
|---|---|---|
| Supabase (BDD + Auth + Functions) | eu-central-1 (Frankfurt) | 99.9% |
| Vercel (Frontend Web) | Global Edge Network (100+ POP) | 99.99% |
| Cloudflare R2 + CDN (Audio) | Global (300+ villes) | 99.9% |
| OpenAI (GPT-4o + Whisper) | US/EU | Pas de SLA garanti |
| Stripe (Paiements) | Global | 99.999% |
| Firebase FCM (Notifications) | Global | 99.95% |

---

## 3. Structure du monorepo

```
ayeprep/
├── .github/
│   ├── workflows/
│   │   ├── web-ci.yml           # Tests + build + deploy Vercel
│   │   ├── mobile-ci.yml        # Tests + build Flutter iOS/Android
│   │   ├── supabase-ci.yml      # Migrations BD + tests Edge Functions
│   │   └── security-scan.yml    # SAST + dépendances vulnérables
│   └── CODEOWNERS
│
├── apps/
│   ├── web/                     # React 18 + TypeScript + Vite
│   │   ├── src/
│   │   │   ├── components/      # Composants réutilisables
│   │   │   ├── pages/           # Routes (landing, dashboard, session...)
│   │   │   ├── features/        # Domaines fonctionnels
│   │   │   │   ├── auth/
│   │   │   │   ├── co/          # Compréhension Orale
│   │   │   │   ├── ce/          # Compréhension Écrite
│   │   │   │   ├── ee/          # Expression Écrite
│   │   │   │   ├── eo/          # Expression Orale
│   │   │   │   ├── simulation/
│   │   │   │   ├── progression/
│   │   │   │   ├── subscription/
│   │   │   │   └── learning-path/ # Parcours personnalisé 30/60/90 jours
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   │   └── useAffiliateTracking.ts  # ?ref=CODE — first-click, TTL 30j
│   │   │   ├── components/      # Composants globaux
│   │   │   │   ├── AffiliateTracker.tsx     # Composant invisible — monte le hook
│   │   │   │   ├── CookieBanner.tsx         # Consentement RGPD/ePrivacy
│   │   │   │   └── WhatsAppButton.tsx       # Bouton flottant support WhatsApp
│   │   │   ├── pages/
│   │   │   │   ├── LandingPage.tsx          # Landing + Schema.org JSON-LD
│   │   │   │   ├── NclcCalculatorPage.tsx   # /calculateur-nclc (public, SEO)
│   │   │   │   ├── ComparisonPage.tsx       # /tcf-vs-tef-canada (public, SEO)
│   │   │   │   ├── QuickTestPage.tsx        # /test-rapide (public, 5 QCM)
│   │   │   │   ├── HelpCenterPage.tsx       # /aide (public, centre d'aide)
│   │   │   │   ├── RefundPage.tsx           # /remboursement (public, légal)
│   │   │   │   ├── ExamPacksPage.tsx        # /packs (public, EUR + FCFA)
│   │   │   │   ├── SuccessStoriesPage.tsx   # /reussites (public, témoignages)
│   │   │   │   ├── SubscribePage.tsx        # /subscribe (privé, onglets abos+packs)
│   │   │   │   └── LearningPathPage.tsx     # /parcours (privé, plan 30/60/90j)
│   │   │   ├── store/           # Zustand stores
│   │   │   ├── lib/             # Supabase client, utils, constants
│   │   │   ├── types/           # Types TypeScript partagés
│   │   │   └── styles/          # Tailwind base + design tokens
│   │   ├── public/
│   │   │   ├── landing/         # Assets landing page statique
│   │   │   └── pwa/             # manifest.json, service-worker
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── mobile/                  # Flutter 3.x (iOS + Android)
│       ├── lib/
│       │   ├── core/
│       │   │   ├── constants/   # Config, couleurs, dimensions
│       │   │   ├── router/      # go_router navigation
│       │   │   ├── theme/       # ThemeData, typographie
│       │   │   └── di/          # Injection de dépendances (Riverpod)
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── home/
│       │   │   ├── catalogue/
│       │   │   ├── session/
│       │   │   │   ├── co/
│       │   │   │   ├── ce/
│       │   │   │   ├── ee/
│       │   │   │   └── eo/
│       │   │   ├── simulation/
│       │   │   ├── progression/
│       │   │   ├── profile/
│       │   │   └── subscription/
│       │   ├── shared/
│       │   │   ├── widgets/     # Composants réutilisables Flutter
│       │   │   ├── models/      # Modèles Dart (freezed)
│       │   │   └── services/    # Supabase, audio, notification
│       │   └── main.dart
│       ├── android/
│       ├── ios/
│       ├── test/
│       ├── pubspec.yaml
│       └── Fastfile             # Fastlane config
│
├── supabase/
│   ├── migrations/              # Fichiers SQL versionnés (001_init.sql...)
│   ├── migrations/
│   │   ├── 001_init.sql                # Schéma initial (users, questions, sessions…)
│   │   ├── 002_improvements_v2.sql     # Packs, affiliés, learning_plans, cookies
│   │   └── 003_fedapay_and_tracking.sql # payment_attempts, affiliate_clicks, fonctions SQL
│   ├── functions/               # Edge Functions Deno
│   │   ├── score-qcm/           # Calcul score + XP + streak
│   │   ├── correct-ee/          # Correction EE via GPT-4o (5 critères CECRL)
│   │   ├── transcribe-eo/       # Transcription Whisper + feedback EO
│   │   ├── create-checkout/     # Stripe Checkout Session
│   │   ├── stripe-webhook/      # Webhook Stripe → activation abonnement
│   │   ├── activate-pack/       # Activation pack (Stripe EUR) — source de vérité serveur
│   │   ├── fedapay-payment/     # Paiement Mobile Money FedaPay — initiation
│   │   ├── fedapay-webhook/     # Webhook FedaPay → activation pack (HMAC-SHA256)
│   │   ├── track-affiliate/     # Enregistrement clic affilié ?ref=CODE
│   │   ├── send-push/           # Notifications FCM
│   │   ├── delete-account/      # Suppression compte RGPD Art.17
│   │   └── _shared/             # Utilitaires partagés entre fonctions
│   ├── seed/
│   │   ├── questions_co.sql     # 100 questions CO de démonstration
│   │   ├── questions_ce.sql
│   │   └── users_test.sql
│   └── config.toml
│
├── packages/
│   ├── shared-types/            # Types TS partagés web + backend
│   │   ├── src/
│   │   │   ├── models.ts        # User, Question, Session, Answer...
│   │   │   ├── api.ts           # Contrats d'API
│   │   │   └── enums.ts         # Niveaux, modules, statuts...
│   │   └── package.json
│   └── content/                 # Banque de questions (JSON structuré)
│       ├── co/
│       ├── ce/
│       ├── ee/
│       └── eo/
│
├── infrastructure/
│   ├── terraform/               # Infrastructure as Code (optionnel)
│   └── scripts/                 # Scripts de déploiement et maintenance
│
├── docs/
│   ├── architecture/            # Diagrammes (Mermaid + PNG)
│   ├── api/                     # Documentation OpenAPI
│   ├── design/                  # Liens Figma + design tokens
│   └── onboarding.md            # Guide démarrage dev
│
├── .env.example                 # Variables d'environnement template
├── package.json                 # Workspace root (npm workspaces)
└── README.md
```

---

## 4. Landing page — HTML, CSS, JavaScript

La landing page est une **page statique haute performance** (score Lighthouse ≥ 95) servie par Vercel Edge Network, conçue pour convertir les visiteurs en utilisateurs inscrits.

### 4.1 Structure HTML complète

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Préparez le TCF et TEF Canada avec la plateforme 
    n°1 des candidats à l'immigration. Corrections IA, simulations officielles, 
    suivi personnalisé. Commencez gratuitement.">
  <meta property="og:title" content="ayePREP — Réussir le TCF/TEF Canada">
  <meta property="og:image" content="/assets/og-image.jpg">
  <title>ayePREP — Préparez-vous comme si c'était le vrai jour J.</title>

  <!-- Préchargement polices -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preload" as="style" 
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Merriweather:wght@400;700&display=swap">
  <link rel="stylesheet" 
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Merriweather:wght@400;700&display=swap">

  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/landing/style.css">
</head>

<body>
  <!-- ===== HEADER ===== -->
  <header class="header" id="header">
    <nav class="nav container">
      <a href="/" class="nav__logo" aria-label="Accueil ayePREP">
        <svg class="nav__logo-icon" aria-hidden="true" viewBox="0 0 40 40">
          <!-- Icône fleur de lys stylisée -->
          <path d="M20 2 L23 12 L33 8 L26 17 L36 22 L26 27 L33 36 L23 32 L20 42 
                   L17 32 L7 36 L14 27 L4 22 L14 17 L7 8 L17 12 Z" 
                fill="var(--color-primary)"/>
        </svg>
        <span class="nav__logo-text"><strong>ayePREP</strong></span>
      </a>
      <ul class="nav__links" role="list">
        <li><a href="#modules" class="nav__link">Modules</a></li>
        <li><a href="#tarifs" class="nav__link">Tarifs</a></li>
        <li><a href="/calculateur-nclc" class="nav__link">Calculateur NCLC</a></li>
        <li><a href="/reussites" class="nav__link">Témoignages</a></li>
        <li><a href="#faq" class="nav__link">FAQ</a></li>
      </ul>
      <div class="nav__cta">
        <a href="/login" class="btn btn--ghost btn--sm">Connexion</a>
        <a href="/register" class="btn btn--primary btn--sm">Essai gratuit</a>
      </div>
      <button class="nav__burger" aria-label="Menu" aria-expanded="false" id="burger">
        <span></span><span></span><span></span>
      </button>
    </nav>
  </header>

  <!-- ===== HERO ===== -->
  <section class="hero" id="hero">
    <div class="hero__bg-animation" aria-hidden="true">
      <div class="hero__orb hero__orb--1"></div>
      <div class="hero__orb hero__orb--2"></div>
      <div class="hero__orb hero__orb--3"></div>
    </div>
    <div class="container hero__content">
      <div class="hero__badge" data-animate="fade-up">
        <span class="badge badge--primary">Nouveau</span>
        Correction IA par GPT-4o disponible sur tous les plans payants
      </div>
      <h1 class="hero__title" data-animate="fade-up" data-delay="100">
        Décrochez le score C2<br>
        <span class="gradient-text">au TCF & TEF Canada</span>
      </h1>
      <p class="hero__subtitle" data-animate="fade-up" data-delay="200">
        La seule plateforme qui reproduit <strong>exactement</strong> les 4 épreuves 
        officielles — Compréhension Orale, Compréhension Écrite, Expression Écrite 
        et Expression Orale — avec des durées strictement identiques au jour J.
      </p>
      <div class="hero__actions" data-animate="fade-up" data-delay="300">
        <a href="/register" class="btn btn--primary btn--lg">
          Commencer gratuitement
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 
                     01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 
                     1 0 010-1.414z"/>
          </svg>
        </a>
        <a href="#demo" class="btn btn--ghost btn--lg">
          Voir une démonstration
        </a>
      </div>
      <div class="hero__stats" data-animate="fade-up" data-delay="400">
        <div class="stat">
          <span class="stat__number" data-count="25000">0</span>
          <span class="stat__label">Candidats formés</span>
        </div>
        <div class="stat__divider" aria-hidden="true"></div>
        <div class="stat">
          <span class="stat__number" data-count="92">0</span>
          <span class="stat__label">% de réussite B2+</span>
        </div>
        <div class="stat__divider" aria-hidden="true"></div>
        <div class="stat">
          <span class="stat__number" data-count="2000">0</span>
          <span class="stat__label">Sujets originaux</span>
        </div>
      </div>
    </div>
    <div class="hero__mockup" data-animate="slide-left" data-delay="200" aria-hidden="true">
      <div class="mockup-browser">
        <div class="mockup-browser__bar">
          <div class="mockup-browser__dots">
            <span></span><span></span><span></span>
          </div>
          <div class="mockup-browser__url">ayeprep.com/session</div>
        </div>
        <div class="mockup-browser__screen">
          <!-- Mini UI simulation dans le hero -->
          <div class="mini-session">
            <div class="mini-session__header">
              <span class="mini-badge">CO — TCF Canada</span>
              <div class="mini-timer" id="heroTimer">34:12</div>
            </div>
            <div class="mini-session__question">
              <div class="mini-audio">
                <button class="mini-play" aria-label="Lecture audio">▶</button>
                <div class="mini-waveform" aria-hidden="true">
                  <span></span><span></span><span></span><span></span>
                  <span></span><span></span><span></span><span></span>
                </div>
                <span class="mini-listen">1/2 écoutes</span>
              </div>
              <p class="mini-q">Que fait Marc ce week-end selon le dialogue ?</p>
              <ul class="mini-options" role="list">
                <li class="mini-opt mini-opt--selected">A. Il visite sa famille à Lyon</li>
                <li class="mini-opt">B. Il part en voyage d'affaires</li>
                <li class="mini-opt">C. Il reste chez lui pour se reposer</li>
                <li class="mini-opt">D. Il organise une fête d'anniversaire</li>
              </ul>
            </div>
            <div class="mini-session__footer">
              <span>Question 7 / 39</span>
              <div class="mini-progress">
                <div class="mini-progress__bar" style="width: 24%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== CONFIANCE ===== -->
  <section class="trust" aria-label="Références et certifications">
    <div class="container trust__content">
      <p class="trust__label">Confiance accordée par des candidats de</p>
      <div class="trust__flags" aria-label="Pays représentés">
        <span>🇫🇷</span><span>🇨🇲</span><span>🇸🇳</span><span>🇲🇦</span>
        <span>🇩🇿</span><span>🇹🇳</span><span>🇨🇮</span><span>🇧🇯</span>
        <span>🇧🇫</span><span>🇭🇹</span><span>🇨🇩</span><span>🇧🇪</span>
      </div>
    </div>
  </section>

  <!-- ===== MODULES ===== -->
  <section class="modules" id="modules">
    <div class="container">
      <div class="section-header" data-animate="fade-up">
        <span class="section-tag">4 épreuves officielles</span>
        <h2 class="section-title">Tout ce que vous passerez le jour J</h2>
        <p class="section-subtitle">
          Durées identiques aux examens officiels. Aucun compromis. Aucune simulation.
        </p>
      </div>
      <div class="modules__grid">

        <!-- Module CO -->
        <article class="module-card" data-module="co" data-animate="fade-up" data-delay="0">
          <div class="module-card__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" fill="#1B3A6B" opacity=".1"/>
              <path d="M24 14 C18 14 13 18.5 13 24 S18 34 24 34 S35 29.5 35 24 
                       S30 14 24 14Z M21 24 L21 20 L28 24 L21 28 Z" 
                    fill="#1B3A6B"/>
            </svg>
          </div>
          <div class="module-card__content">
            <h3 class="module-card__title">Compréhension de l'Oral</h3>
            <div class="module-card__specs">
              <div class="spec">
                <span class="spec__label">TCF Canada</span>
                <span class="spec__value">39 QCM · 35 min</span>
              </div>
              <div class="spec">
                <span class="spec__label">TEF Canada</span>
                <span class="spec__value">60 QCM · 40 min</span>
              </div>
            </div>
            <p class="module-card__desc">
              Accents parisien, québécois, africain et belge. Dialogues, 
              monologues, annonces, reportages. 600+ enregistrements inédits.
            </p>
            <div class="module-card__features">
              <span class="feature-tag">Préchargement audio</span>
              <span class="feature-tag">Compteur d'écoutes</span>
              <span class="feature-tag">Mode hors-ligne</span>
            </div>
          </div>
          <div class="module-card__footer">
            <div class="module-card__level-bar">
              <span class="level-dot level-dot--active">B1</span>
              <span class="level-dot level-dot--active">B2</span>
              <span class="level-dot level-dot--active">C1</span>
              <span class="level-dot level-dot--active">C2</span>
            </div>
          </div>
        </article>

        <!-- Module CE -->
        <article class="module-card" data-module="ce" data-animate="fade-up" data-delay="100">
          <div class="module-card__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" fill="#C55A11" opacity=".1"/>
              <rect x="13" y="14" width="22" height="3" rx="1.5" fill="#C55A11"/>
              <rect x="13" y="21" width="18" height="3" rx="1.5" fill="#C55A11"/>
              <rect x="13" y="28" width="20" height="3" rx="1.5" fill="#C55A11"/>
            </svg>
          </div>
          <div class="module-card__content">
            <h3 class="module-card__title">Compréhension des Écrits</h3>
            <div class="module-card__specs">
              <div class="spec">
                <span class="spec__label">TCF Canada</span>
                <span class="spec__value">39 QCM · 35 min</span>
              </div>
              <div class="spec">
                <span class="spec__label">TEF Canada</span>
                <span class="spec__value">50 QCM · 60 min</span>
              </div>
            </div>
            <p class="module-card__desc">
              Textes authentiques sur l'actualité, la culture, la science. 
              30 thèmes. 700+ textes (50–600 mots). Vue split-screen sur desktop.
            </p>
            <div class="module-card__features">
              <span class="feature-tag">Split-screen</span>
              <span class="feature-tag">30 thèmes</span>
              <span class="feature-tag">Explications détaillées</span>
            </div>
          </div>
          <div class="module-card__footer">
            <div class="module-card__level-bar">
              <span class="level-dot level-dot--active">B1</span>
              <span class="level-dot level-dot--active">B2</span>
              <span class="level-dot level-dot--active">C1</span>
              <span class="level-dot level-dot--active">C2</span>
            </div>
          </div>
        </article>

        <!-- Module EE -->
        <article class="module-card module-card--premium" data-module="ee" 
                 data-animate="fade-up" data-delay="200">
          <div class="module-card__badge">Correction IA GPT-4o</div>
          <div class="module-card__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" fill="#2E75B6" opacity=".1"/>
              <path d="M16 14 H30 A2 2 0 0 1 32 16 V32 A2 2 0 0 1 30 34 H18 
                       A2 2 0 0 1 16 32 V16 A2 2 0 0 1 18 14Z" 
                    stroke="#2E75B6" stroke-width="2" fill="none"/>
              <line x1="20" y1="20" x2="28" y2="20" stroke="#2E75B6" stroke-width="2"/>
              <line x1="20" y1="24" x2="28" y2="24" stroke="#2E75B6" stroke-width="2"/>
              <line x1="20" y1="28" x2="25" y2="28" stroke="#2E75B6" stroke-width="2"/>
            </svg>
          </div>
          <div class="module-card__content">
            <h3 class="module-card__title">Expression Écrite</h3>
            <div class="module-card__specs">
              <div class="spec">
                <span class="spec__label">TCF Canada</span>
                <span class="spec__value">2 rédactions · 60 min</span>
              </div>
              <div class="spec">
                <span class="spec__label">TEF Canada</span>
                <span class="spec__value">2 rédactions · 60 min</span>
              </div>
            </div>
            <p class="module-card__desc">
              Correction automatique par GPT-4o sur 5 critères officiels. 
              Correction humaine experte disponible en plan Premium+. 
              500+ sujets variés.
            </p>
            <div class="module-card__features">
              <span class="feature-tag">Compteur de mots</span>
              <span class="feature-tag">5 critères CECRL</span>
              <span class="feature-tag">Correction experte</span>
            </div>
          </div>
        </article>

        <!-- Module EO -->
        <article class="module-card module-card--premium" data-module="eo" 
                 data-animate="fade-up" data-delay="300">
          <div class="module-card__badge">Transcription Whisper</div>
          <div class="module-card__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" fill="#1E7145" opacity=".1"/>
              <rect x="20" y="12" width="8" height="14" rx="4" fill="#1E7145"/>
              <path d="M14 25 C14 31 34 31 34 25" stroke="#1E7145" 
                    stroke-width="2" fill="none" stroke-linecap="round"/>
              <line x1="24" y1="31" x2="24" y2="36" stroke="#1E7145" stroke-width="2"/>
              <line x1="19" y1="36" x2="29" y2="36" stroke="#1E7145" stroke-width="2"/>
            </svg>
          </div>
          <div class="module-card__content">
            <h3 class="module-card__title">Expression Orale</h3>
            <div class="module-card__specs">
              <div class="spec">
                <span class="spec__label">TCF Canada</span>
                <span class="spec__value">3 tâches · 12 min</span>
              </div>
              <div class="spec">
                <span class="spec__label">TEF Canada</span>
                <span class="spec__value">4 tâches · 35 min</span>
              </div>
            </div>
            <p class="module-card__desc">
              Enregistrement direct depuis votre micro. Transcription automatique 
              par Whisper. Analyse prosodique et lexicale par GPT-4o. 
              Waveform animée en temps réel.
            </p>
            <div class="module-card__features">
              <span class="feature-tag">Waveform temps réel</span>
              <span class="feature-tag">Analyse prosodique</span>
              <span class="feature-tag">Correction humaine</span>
            </div>
          </div>
        </article>

      </div>
    </div>
  </section>

  <!-- ===== SIMULATION ===== -->
  <section class="simulation-cta">
    <div class="container simulation-cta__content" data-animate="fade-up">
      <div class="simulation-cta__text">
        <h2>Mode simulation officiel</h2>
        <p>
          Passez l'examen complet en conditions réelles. Minuteur bloquant, 
          aucun retour arrière, soumission automatique. TCF : 2h22. TEF : 3h15.
        </p>
        <ul class="simulation-cta__list" role="list">
          <li>Interface plein écran — notifications bloquées</li>
          <li>Chronomètre global + chronomètre par épreuve</li>
          <li>Rapport NCLC détaillé à la fin</li>
          <li>Graphique radar de vos 4 compétences</li>
        </ul>
      </div>
      <div class="simulation-cta__visual" aria-hidden="true">
        <div class="clock-ring">
          <svg viewBox="0 0 120 120" class="clock-svg">
            <circle cx="60" cy="60" r="54" stroke="#e2e8f0" stroke-width="8" fill="none"/>
            <circle cx="60" cy="60" r="54" stroke="#1B3A6B" stroke-width="8" fill="none"
                    stroke-dasharray="339.3" stroke-dashoffset="84.8" 
                    stroke-linecap="round" class="clock-progress"/>
          </svg>
          <div class="clock-time">
            <span class="clock-time__value" id="simTimer">2:22:00</span>
            <span class="clock-time__label">TCF Canada</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== TARIFS ===== -->
  <section class="pricing" id="tarifs">
    <div class="container">
      <div class="section-header" data-animate="fade-up">
        <span class="section-tag">Tarification</span>
        <h2 class="section-title">Un plan pour chaque objectif</h2>
      </div>
      <div class="pricing__toggle" role="group" aria-label="Fréquence de facturation">
        <button class="toggle-btn toggle-btn--active" data-period="monthly">Mensuel</button>
        <button class="toggle-btn" data-period="yearly">
          Annuel <span class="saving-badge">−33%</span>
        </button>
      </div>
      <div class="pricing__grid">

        <!-- Plan Gratuit -->
        <div class="pricing-card" data-animate="fade-up" data-delay="0">
          <div class="pricing-card__header">
            <h3>Gratuit</h3>
            <div class="pricing-card__price">
              <span class="price">0€</span>
              <span class="period">/mois</span>
            </div>
          </div>
          <ul class="pricing-card__features" role="list">
            <li class="feature--yes">10 exercices CO par module</li>
            <li class="feature--yes">10 exercices CE par module</li>
            <li class="feature--yes">1 simulation complète / mois</li>
            <li class="feature--yes">Test diagnostique</li>
            <li class="feature--no">Exercices EE / EO</li>
            <li class="feature--no">Correction IA</li>
            <li class="feature--no">Mode hors-ligne</li>
          </ul>
          <a href="/register" class="btn btn--outline btn--full">Commencer</a>
        </div>

        <!-- Plan Essentiel -->
        <div class="pricing-card" data-animate="fade-up" data-delay="100">
          <div class="pricing-card__header">
            <h3>Essentiel</h3>
            <div class="pricing-card__price">
              <span class="price" data-monthly="9.99" data-yearly="6.67">9,99€</span>
              <span class="period">/mois</span>
            </div>
          </div>
          <ul class="pricing-card__features" role="list">
            <li class="feature--yes">CO illimité avec correction IA</li>
            <li class="feature--yes">CE illimité avec correction IA</li>
            <li class="feature--yes">5 simulations complètes / mois</li>
            <li class="feature--yes">Mode hors-ligne mobile</li>
            <li class="feature--no">Exercices EE / EO</li>
            <li class="feature--no">Correction humaine</li>
          </ul>
          <a href="/register?plan=essentiel" class="btn btn--outline btn--full">Choisir</a>
        </div>

        <!-- Plan Avancé -->
        <div class="pricing-card pricing-card--popular" data-animate="fade-up" data-delay="200">
          <div class="pricing-card__badge">Plus populaire</div>
          <div class="pricing-card__header">
            <h3>Avancé</h3>
            <div class="pricing-card__price">
              <span class="price" data-monthly="19.99" data-yearly="13.33">19,99€</span>
              <span class="period">/mois</span>
            </div>
          </div>
          <ul class="pricing-card__features" role="list">
            <li class="feature--yes">Tous les modules illimités</li>
            <li class="feature--yes">Correction IA tous modules</li>
            <li class="feature--yes">15 simulations / mois</li>
            <li class="feature--yes">Mode hors-ligne mobile</li>
            <li class="feature--yes">Dashboard progression avancé</li>
            <li class="feature--no">Correction humaine EE/EO</li>
          </ul>
          <a href="/register?plan=avance" class="btn btn--primary btn--full">Choisir</a>
        </div>

        <!-- Plan Premium+ -->
        <div class="pricing-card" data-animate="fade-up" data-delay="300">
          <div class="pricing-card__header">
            <h3>Premium+</h3>
            <div class="pricing-card__price">
              <span class="price" data-monthly="34.99" data-yearly="23.33">34,99€</span>
              <span class="period">/mois</span>
            </div>
          </div>
          <ul class="pricing-card__features" role="list">
            <li class="feature--yes">Tout du plan Avancé</li>
            <li class="feature--yes">Simulations illimitées</li>
            <li class="feature--yes">8 corrections humaines EE/mois</li>
            <li class="feature--yes">8 corrections humaines EO/mois</li>
            <li class="feature--yes">Délai 48h EE / 72h EO garanti</li>
            <li class="feature--yes">Accès bêta nouvelles fonctionnalités</li>
          </ul>
          <a href="/register?plan=premium" class="btn btn--outline btn--full">Choisir</a>
        </div>

      </div>
      <p class="pricing__note" data-animate="fade-up">
        Offre Afrique <strong>-40%</strong> · Étudiants <strong>-30%</strong> · 
        Essai Premium+ <strong>7 jours gratuits</strong> · 
        Achat à l'unité disponible · Institutionnel sur devis
      </p>
    </div>
  </section>

  <!-- ===== TEMOIGNAGES ===== -->
  <section class="testimonials" id="temoignages">
    <div class="container">
      <div class="section-header" data-animate="fade-up">
        <span class="section-tag">Témoignages</span>
        <h2 class="section-title">Ils ont réussi. Vous le pouvez aussi.</h2>
      </div>
      <div class="testimonials__slider" role="region" aria-label="Témoignages clients">
        <div class="testimonials__track" id="testimonialsTrack">

          <article class="testimonial-card">
            <div class="testimonial-card__rating" aria-label="5 étoiles">★★★★★</div>
            <blockquote class="testimonial-card__quote">
              "Après 3 mois sur ayePREP, j'ai obtenu C1 au TCF Canada 
              avec 498 points. Les simulations en conditions réelles m'ont préparée 
              psychologiquement. Les corrections IA de mes rédactions étaient 
              remarquablement précises."
            </blockquote>
            <cite class="testimonial-card__author">
              <div class="testimonial-card__avatar" aria-hidden="true">AS</div>
              <div>
                <strong>Aminata S.</strong>
                <span>Dakar, Sénégal → Montréal</span>
                <span class="testimonial-card__score">TCF Canada : 498 pts (C1)</span>
              </div>
            </cite>
          </article>

          <article class="testimonial-card">
            <div class="testimonial-card__rating" aria-label="5 étoiles">★★★★★</div>
            <blockquote class="testimonial-card__quote">
              "Le module Expression Orale m'a transformé. Voir ma waveform et 
              recevoir une analyse de ma fluidité et de mon vocabulaire après chaque 
              enregistrement — c'est exactement ce dont j'avais besoin pour passer C2."
            </blockquote>
            <cite class="testimonial-card__author">
              <div class="testimonial-card__avatar" aria-hidden="true">MK</div>
              <div>
                <strong>Mohamed K.</strong>
                <span>Casablanca, Maroc → Québec</span>
                <span class="testimonial-card__score">TEF Canada : 570 pts (C2)</span>
              </div>
            </cite>
          </article>

          <article class="testimonial-card">
            <div class="testimonial-card__rating" aria-label="5 étoiles">★★★★★</div>
            <blockquote class="testimonial-card__quote">
              "Infirmière camerounaise, j'avais besoin de CLB 10+ pour l'OIIQ. 
              Les corrections humaines expertes de mes textes en 48h ont fait 
              toute la différence. J'ai obtenu C1 au TEF Canada du premier coup."
            </blockquote>
            <cite class="testimonial-card__author">
              <div class="testimonial-card__avatar" aria-hidden="true">CF</div>
              <div>
                <strong>Christelle F.</strong>
                <span>Douala, Cameroun → Montréal</span>
                <span class="testimonial-card__score">TEF Canada : 535 pts (C1)</span>
              </div>
            </cite>
          </article>

        </div>
        <div class="testimonials__controls" aria-label="Navigation témoignages">
          <button class="testimonials__btn" id="prevTestimonial" aria-label="Précédent">‹</button>
          <div class="testimonials__dots" role="tablist">
            <button class="dot dot--active" role="tab" aria-selected="true" 
                    data-index="0" aria-label="Témoignage 1"></button>
            <button class="dot" role="tab" aria-selected="false" 
                    data-index="1" aria-label="Témoignage 2"></button>
            <button class="dot" role="tab" aria-selected="false" 
                    data-index="2" aria-label="Témoignage 3"></button>
          </div>
          <button class="testimonials__btn" id="nextTestimonial" aria-label="Suivant">›</button>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== FAQ ===== -->
  <section class="faq" id="faq">
    <div class="container">
      <div class="section-header" data-animate="fade-up">
        <span class="section-tag">FAQ</span>
        <h2 class="section-title">Questions fréquentes</h2>
      </div>
      <div class="faq__list">

        <details class="faq-item" data-animate="fade-up">
          <summary class="faq-item__question">
            Les durées des épreuves sont-elles vraiment identiques aux examens officiels ?
            <span class="faq-item__icon" aria-hidden="true">+</span>
          </summary>
          <div class="faq-item__answer">
            <p>Oui, absolument. CO TCF = 35 min, CO TEF = 40 min, CE TCF = 35 min, 
            CE TEF = 60 min, EE = 60 min (TCF et TEF), EO TCF = 12 min, EO TEF = 35 min. 
            Le minuteur est bloquant — la session se soumet automatiquement à expiration, 
            exactement comme lors du vrai examen.</p>
          </div>
        </details>

        <details class="faq-item" data-animate="fade-up" data-delay="50">
          <summary class="faq-item__question">
            Comment fonctionne la correction IA ?
            <span class="faq-item__icon" aria-hidden="true">+</span>
          </summary>
          <div class="faq-item__answer">
            <p>Pour l'Expression Écrite, GPT-4o analyse votre rédaction sur 5 critères 
            officiels (respect de la tâche, cohérence, lexique, morphosyntaxe, conventions) 
            et génère un retour détaillé par critère avec suggestions d'amélioration. 
            Pour l'Expression Orale, Whisper transcrit votre audio, puis GPT-4o analyse 
            la transcription sur les mêmes critères.</p>
          </div>
        </details>

        <details class="faq-item" data-animate="fade-up" data-delay="100">
          <summary class="faq-item__question">
            L'application fonctionne-t-elle hors connexion ?
            <span class="faq-item__icon" aria-hidden="true">+</span>
          </summary>
          <div class="faq-item__answer">
            <p>Oui, sur mobile (iOS et Android) avec un abonnement payant. 
            Téléchargez les modules en Wi-Fi, puis accédez aux exercices et audios 
            sans connexion. Vos résultats se synchronisent automatiquement dès 
            votre reconnexion.</p>
          </div>
        </details>

        <details class="faq-item" data-animate="fade-up" data-delay="150">
          <summary class="faq-item__question">
            Proposez-vous des tarifs préférentiels pour l'Afrique ?
            <span class="faq-item__icon" aria-hidden="true">+</span>
          </summary>
          <div class="faq-item__answer">
            <p>Oui. Les utilisateurs dont le pays est en Afrique subsaharienne 
            bénéficient automatiquement de -40% sur tous les plans, avec paiement 
            possible en FCFA. Des remises de 30% sont également disponibles pour les 
            étudiants sur présentation d'un justificatif.</p>
          </div>
        </details>

      </div>
    </div>
  </section>

  <!-- ===== CTA FINAL ===== -->
  <section class="final-cta" data-animate="fade-up">
    <div class="container final-cta__content">
      <h2 class="final-cta__title">
        Votre score C2 commence aujourd'hui.
      </h2>
      <p class="final-cta__subtitle">
        Rejoignez 25 000 candidats qui ont choisi la rigueur des conditions réelles.
      </p>
      <a href="/register" class="btn btn--white btn--lg">
        Créer mon compte gratuit — c'est immédiat
      </a>
      <p class="final-cta__reassurance">
        Sans carte bancaire · Annulation en 1 clic · Données hébergées en Europe
      </p>
    </div>
  </section>

  <!-- ===== FOOTER ===== -->
  <footer class="footer">
    <div class="container footer__content">
      <div class="footer__brand">
        <a href="/" class="footer__logo">ayePREP</a>
        <p class="footer__tagline">Préparez-vous comme si c'était le vrai jour J.</p>
        <div class="footer__social">
          <a href="#" aria-label="Instagram">Insta</a>
          <a href="#" aria-label="Facebook">FB</a>
          <a href="#" aria-label="YouTube">YT</a>
          <a href="#" aria-label="TikTok">TikTok</a>
        </div>
      </div>
      <nav class="footer__nav" aria-label="Liens du bas de page">
        <div class="footer__col">
          <h4>Produit</h4>
          <ul>
            <li><a href="#modules">Modules</a></li>
            <li><a href="#tarifs">Tarifs</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>Légal</h4>
          <ul>
            <li><a href="/mentions-legales">Mentions légales</a></li>
            <li><a href="/confidentialite">Confidentialité</a></li>
            <li><a href="/cgv">CGV</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>Support</h4>
          <ul>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/faq">FAQ complète</a></li>
          </ul>
        </div>
      </nav>
    </div>
    <div class="footer__bottom">
      <p>© 2026 ayePREP. Tous droits réservés. 
         Hébergé en Europe (RGPD conforme).</p>
    </div>
  </footer>

  <script src="/landing/main.js" defer></script>
</body>
</html>
```

### 4.2 CSS de la landing page

```css
/* ========================
   landing/style.css
   ayePREP
   ======================== */

/* --- Variables CSS --- */
:root {
  --color-primary:     #1B3A6B;
  --color-secondary:   #C55A11;
  --color-accent:      #2E75B6;
  --color-success:     #1E7145;
  --color-error:       #C00000;
  --color-bg:          #F8F9FA;
  --color-surface:     #FFFFFF;
  --color-text:        #1A1A2E;
  --color-text-muted:  #6B7280;
  --color-border:      #E5E7EB;

  --font-sans:   'Inter', system-ui, sans-serif;
  --font-serif:  'Merriweather', Georgia, serif;

  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   20px;
  --radius-full: 9999px;

  --shadow-sm:   0 1px 3px rgba(0,0,0,.08);
  --shadow-md:   0 4px 16px rgba(0,0,0,.10);
  --shadow-lg:   0 16px 48px rgba(0,0,0,.14);

  --transition:  0.25s cubic-bezier(0.4, 0, 0.2, 1);

  --container:   1280px;
  --space:       8px;
}

/* --- Reset & base --- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  overflow-x: hidden;
}
img, svg { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
ul[role="list"] { list-style: none; }

/* --- Container --- */
.container {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: calc(var(--space) * 3);
}

/* --- Boutons --- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--space) * 1);
  padding: calc(var(--space) * 1.5) calc(var(--space) * 3);
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--transition);
  white-space: nowrap;
  text-decoration: none;
}
.btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.btn--primary:hover {
  background: #152e56;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(27,58,107,.35);
}
.btn--ghost {
  background: transparent;
  color: var(--color-primary);
  border-color: transparent;
}
.btn--ghost:hover { background: rgba(27,58,107,.06); }
.btn--outline {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn--outline:hover {
  background: var(--color-primary);
  color: #fff;
}
.btn--white {
  background: #fff;
  color: var(--color-primary);
}
.btn--white:hover {
  background: rgba(255,255,255,.9);
  transform: translateY(-2px);
}
.btn--lg { padding: calc(var(--space) * 2) calc(var(--space) * 4); font-size: 1rem; }
.btn--sm { padding: calc(var(--space)) calc(var(--space) * 2); font-size: 0.875rem; }
.btn--full { width: 100%; justify-content: center; }
.btn svg { width: 1.25em; height: 1.25em; }

/* --- Gradient text --- */
.gradient-text {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* --- Section header --- */
.section-header { text-align: center; margin-bottom: calc(var(--space) * 7); }
.section-tag {
  display: inline-block;
  background: rgba(27,58,107,.08);
  color: var(--color-primary);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  padding: calc(var(--space) * .75) calc(var(--space) * 2);
  border-radius: var(--radius-full);
  margin-bottom: calc(var(--space) * 2);
}
.section-title {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: calc(var(--space) * 2);
  color: var(--color-text);
}
.section-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  max-width: 56ch;
  margin-inline: auto;
}

/* ===== HEADER ===== */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(248,249,250,.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
  transition: box-shadow var(--transition);
}
.header.scrolled { box-shadow: var(--shadow-md); }
.nav {
  display: flex;
  align-items: center;
  gap: calc(var(--space) * 4);
  height: 72px;
}
.nav__logo {
  display: flex; align-items: center; gap: calc(var(--space) * 1.5);
  font-size: 0.75rem; font-weight: 700; letter-spacing: .02em;
  text-transform: uppercase; line-height: 1.2; color: var(--color-primary);
}
.nav__logo-icon { width: 40px; height: 40px; }
.nav__links {
  display: flex; gap: calc(var(--space) * 4); list-style: none;
  margin-left: auto;
}
.nav__link {
  font-size: 0.9375rem; font-weight: 500; color: var(--color-text);
  transition: color var(--transition);
}
.nav__link:hover { color: var(--color-primary); }
.nav__cta { display: flex; align-items: center; gap: calc(var(--space) * 1.5); }
.nav__burger { display: none; flex-direction: column; gap: 5px; 
               background: none; border: none; cursor: pointer; padding: 4px; }
.nav__burger span { display: block; width: 24px; height: 2px; 
                    background: var(--color-text); border-radius: 2px;
                    transition: all var(--transition); }

/* ===== HERO ===== */
.hero {
  min-height: calc(100svh - 72px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: calc(var(--space) * 8);
  padding: calc(var(--space) * 10) calc(var(--space) * 3);
  max-width: var(--container);
  margin-inline: auto;
  position: relative;
  overflow: hidden;
}
.hero__bg-animation {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
}
.hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  animation: orbFloat 8s ease-in-out infinite;
}
.hero__orb--1 {
  width: 500px; height: 500px;
  background: var(--color-primary);
  top: -10%; left: -5%;
  animation-delay: 0s;
}
.hero__orb--2 {
  width: 350px; height: 350px;
  background: var(--color-secondary);
  bottom: 0; right: 10%;
  animation-delay: 3s;
}
.hero__orb--3 {
  width: 250px; height: 250px;
  background: var(--color-accent);
  top: 40%; left: 45%;
  animation-delay: 6s;
}
@keyframes orbFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}
.hero__content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: calc(var(--space) * 3);
}
.hero__badge {
  display: inline-flex; align-items: center; gap: calc(var(--space));
  font-size: 0.875rem; color: var(--color-text-muted);
}
.badge {
  padding: 2px 10px; border-radius: var(--radius-full);
  font-size: 0.75rem; font-weight: 700;
}
.badge--primary { background: var(--color-primary); color: #fff; }
.hero__title {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 800; line-height: 1.1;
}
.hero__subtitle {
  font-size: 1.125rem; color: var(--color-text-muted);
  max-width: 52ch; line-height: 1.7;
}
.hero__actions { display: flex; flex-wrap: wrap; gap: calc(var(--space) * 2); }
.hero__stats {
  display: flex; align-items: center; gap: calc(var(--space) * 4);
  margin-top: calc(var(--space) * 2);
}
.stat__number {
  display: block; font-size: 2rem; font-weight: 800; color: var(--color-primary);
}
.stat__label { font-size: 0.8125rem; color: var(--color-text-muted); }
.stat__divider {
  width: 1px; height: 40px; background: var(--color-border);
}

/* Mockup browser dans le hero */
.hero__mockup { position: relative; z-index: 1; }
.mockup-browser {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  transform: perspective(1000px) rotateY(-8deg) rotateX(2deg);
  transition: transform 0.5s var(--transition);
}
.mockup-browser:hover {
  transform: perspective(1000px) rotateY(-4deg) rotateX(1deg);
}
.mockup-browser__bar {
  display: flex; align-items: center; gap: calc(var(--space) * 1.5);
  padding: calc(var(--space) * 1.5) calc(var(--space) * 2);
  background: #f1f5f9; border-bottom: 1px solid var(--color-border);
}
.mockup-browser__dots { display: flex; gap: 6px; }
.mockup-browser__dots span {
  width: 12px; height: 12px; border-radius: 50%;
}
.mockup-browser__dots span:nth-child(1) { background: #FF5F56; }
.mockup-browser__dots span:nth-child(2) { background: #FFBD2E; }
.mockup-browser__dots span:nth-child(3) { background: #27C93F; }
.mockup-browser__url {
  flex: 1; background: #e2e8f0; border-radius: 6px;
  padding: 4px 12px; font-size: 0.75rem; color: #64748b;
}
.mockup-browser__screen { padding: calc(var(--space) * 2); min-height: 280px; }

/* Mini session dans le hero */
.mini-session { font-size: 0.8125rem; }
.mini-session__header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: calc(var(--space) * 2);
}
.mini-badge {
  background: rgba(27,58,107,.1); color: var(--color-primary);
  padding: 3px 10px; border-radius: var(--radius-full); font-weight: 600;
  font-size: 0.75rem;
}
.mini-timer {
  font-size: 1.125rem; font-weight: 700; color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  animation: timerPulse 1s ease-in-out infinite;
}
@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.mini-audio {
  display: flex; align-items: center; gap: calc(var(--space));
  background: rgba(27,58,107,.05); border-radius: var(--radius-sm);
  padding: calc(var(--space)) calc(var(--space) * 1.5);
  margin-bottom: calc(var(--space) * 2);
}
.mini-play {
  background: var(--color-primary); color: #fff;
  border: none; border-radius: 50%; width: 28px; height: 28px;
  cursor: pointer; font-size: 10px; display: flex; 
  align-items: center; justify-content: center;
}
.mini-waveform {
  display: flex; align-items: center; gap: 3px; flex: 1;
}
.mini-waveform span {
  width: 3px; background: var(--color-accent);
  border-radius: 2px; animation: wave 1.2s ease-in-out infinite;
}
.mini-waveform span:nth-child(1) { height: 8px; animation-delay: 0s; }
.mini-waveform span:nth-child(2) { height: 14px; animation-delay: 0.1s; }
.mini-waveform span:nth-child(3) { height: 10px; animation-delay: 0.2s; }
.mini-waveform span:nth-child(4) { height: 18px; animation-delay: 0.3s; }
.mini-waveform span:nth-child(5) { height: 12px; animation-delay: 0.4s; }
.mini-waveform span:nth-child(6) { height: 16px; animation-delay: 0.5s; }
.mini-waveform span:nth-child(7) { height: 8px; animation-delay: 0.6s; }
.mini-waveform span:nth-child(8) { height: 11px; animation-delay: 0.7s; }
@keyframes wave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.8); }
}
.mini-listen { font-size: 0.7rem; color: var(--color-text-muted); white-space: nowrap; }
.mini-q { font-weight: 600; margin-bottom: calc(var(--space) * 1.5); 
          color: var(--color-text); }
.mini-options { list-style: none; display: flex; flex-direction: column; 
                gap: calc(var(--space)); }
.mini-opt {
  padding: calc(var(--space)) calc(var(--space) * 1.5);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer; transition: all var(--transition);
}
.mini-opt:hover { border-color: var(--color-primary); }
.mini-opt--selected {
  border-color: var(--color-primary);
  background: rgba(27,58,107,.07);
  color: var(--color-primary); font-weight: 600;
}
.mini-session__footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: calc(var(--space) * 2); font-size: 0.75rem; 
  color: var(--color-text-muted);
}
.mini-progress {
  width: 100px; height: 4px; background: var(--color-border); 
  border-radius: 2px; overflow: hidden;
}
.mini-progress__bar {
  height: 100%; background: var(--color-primary); border-radius: 2px;
  transition: width 0.5s ease;
}

/* ===== TRUST ===== */
.trust {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: calc(var(--space) * 4) 0;
}
.trust__content {
  display: flex; align-items: center; gap: calc(var(--space) * 4);
  flex-wrap: wrap;
}
.trust__label { font-size: 0.875rem; color: var(--color-text-muted); white-space: nowrap; }
.trust__flags { display: flex; gap: calc(var(--space) * 1.5); font-size: 1.75rem; flex-wrap: wrap; }

/* ===== MODULES ===== */
.modules { padding: calc(var(--space) * 14) 0; }
.modules__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: calc(var(--space) * 3);
}
.module-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: calc(var(--space) * 4);
  display: flex; flex-direction: column; gap: calc(var(--space) * 2.5);
  transition: all var(--transition);
  position: relative; overflow: hidden;
}
.module-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent 50%, rgba(27,58,107,.03));
  pointer-events: none;
}
.module-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}
.module-card--premium { border-color: rgba(197,90,17,.3); }
.module-card--premium:hover { border-color: var(--color-secondary); }
.module-card__badge {
  position: absolute; top: 16px; right: 16px;
  background: linear-gradient(135deg, var(--color-secondary), #e06515);
  color: #fff; font-size: 0.7rem; font-weight: 700;
  padding: 3px 10px; border-radius: var(--radius-full);
  text-transform: uppercase; letter-spacing: .04em;
}
.module-card__icon { width: 56px; height: 56px; }
.module-card__title { font-size: 1.25rem; font-weight: 700; }
.module-card__specs { display: flex; flex-direction: column; gap: calc(var(--space)); }
.spec { display: flex; justify-content: space-between; align-items: center; }
.spec__label { font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600; 
               text-transform: uppercase; letter-spacing: .04em; }
.spec__value { font-size: 0.875rem; font-weight: 600; color: var(--color-primary); }
.module-card__desc { font-size: 0.9375rem; color: var(--color-text-muted); line-height: 1.6; }
.module-card__features { display: flex; flex-wrap: wrap; gap: calc(var(--space)); }
.feature-tag {
  font-size: 0.75rem; font-weight: 600;
  background: var(--color-bg); border: 1px solid var(--color-border);
  padding: 3px 10px; border-radius: var(--radius-full);
  color: var(--color-text-muted);
}
.module-card__level-bar { display: flex; gap: calc(var(--space)); }
.level-dot {
  padding: 2px 10px; border-radius: var(--radius-full);
  font-size: 0.7rem; font-weight: 700;
  background: var(--color-bg); color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
.level-dot--active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* ===== SIMULATION CTA ===== */
.simulation-cta {
  background: linear-gradient(135deg, var(--color-primary) 0%, #0f2347 100%);
  padding: calc(var(--space) * 14) 0;
  color: #fff;
}
.simulation-cta__content {
  display: grid; grid-template-columns: 1fr auto;
  align-items: center; gap: calc(var(--space) * 8);
}
.simulation-cta h2 {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 800;
  margin-bottom: calc(var(--space) * 2);
}
.simulation-cta p { font-size: 1.125rem; opacity: .8; margin-bottom: calc(var(--space) * 4); }
.simulation-cta__list { display: flex; flex-direction: column; gap: calc(var(--space)); }
.simulation-cta__list li {
  display: flex; align-items: center; gap: calc(var(--space) * 1.5);
  font-size: 0.9375rem; opacity: .9;
}
.simulation-cta__list li::before {
  content: '✓'; color: #4ade80; font-weight: 700; flex-shrink: 0;
}
.clock-ring { position: relative; width: 180px; height: 180px; }
.clock-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.clock-progress {
  transition: stroke-dashoffset 1s ease;
  animation: clockTick 60s linear infinite;
}
@keyframes clockTick {
  to { stroke-dashoffset: 424; }
}
.clock-time {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
}
.clock-time__value {
  font-size: 1.75rem; font-weight: 800; font-variant-numeric: tabular-nums;
}
.clock-time__label { font-size: 0.75rem; opacity: .7; }

/* ===== PRICING ===== */
.pricing { padding: calc(var(--space) * 14) 0; }
.pricing__toggle {
  display: flex; align-items: center; justify-content: center;
  gap: calc(var(--space)); margin-bottom: calc(var(--space) * 7);
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-full); padding: 4px; width: fit-content; margin-inline: auto;
}
.toggle-btn {
  padding: calc(var(--space)) calc(var(--space) * 3);
  border-radius: var(--radius-full); border: none; background: none;
  font-weight: 600; cursor: pointer; transition: all var(--transition);
  color: var(--color-text-muted); display: flex; align-items: center; gap: calc(var(--space));
}
.toggle-btn--active {
  background: var(--color-primary); color: #fff;
}
.saving-badge {
  background: var(--color-success); color: #fff;
  font-size: 0.7rem; padding: 1px 7px; border-radius: var(--radius-full);
}
.pricing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: calc(var(--space) * 3);
}
.pricing-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: calc(var(--space) * 4);
  display: flex; flex-direction: column; gap: calc(var(--space) * 3);
  position: relative; transition: all var(--transition);
}
.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.pricing-card--popular {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(27,58,107,.12);
}
.pricing-card__badge {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--color-primary); color: #fff;
  font-size: 0.75rem; font-weight: 700; padding: 4px 16px;
  border-radius: var(--radius-full); white-space: nowrap;
}
.pricing-card__header h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: calc(var(--space)); }
.pricing-card__price { display: flex; align-items: baseline; gap: 4px; }
.price { font-size: 2.25rem; font-weight: 800; color: var(--color-primary); }
.period { color: var(--color-text-muted); }
.pricing-card__features { display: flex; flex-direction: column; gap: calc(var(--space) * 1.5); 
                           flex: 1; }
.pricing-card__features li {
  display: flex; align-items: center; gap: calc(var(--space) * 1.5);
  font-size: 0.9rem;
}
.pricing-card__features li::before { font-size: 0.875rem; flex-shrink: 0; }
.feature--yes::before { content: '✓'; color: var(--color-success); font-weight: 700; }
.feature--no::before { content: '×'; color: var(--color-text-muted); }
.feature--no { opacity: .55; text-decoration: line-through; }
.pricing__note {
  text-align: center; font-size: 0.9375rem; color: var(--color-text-muted);
  margin-top: calc(var(--space) * 5); line-height: 1.8;
}

/* ===== TESTIMONIALS ===== */
.testimonials { padding: calc(var(--space) * 14) 0; background: var(--color-surface); }
.testimonials__slider { position: relative; overflow: hidden; }
.testimonials__track {
  display: flex; gap: calc(var(--space) * 3);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.testimonial-card {
  min-width: 360px; background: var(--color-bg);
  border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  padding: calc(var(--space) * 4); flex-shrink: 0;
}
.testimonial-card__rating { color: #F59E0B; font-size: 1.125rem; margin-bottom: calc(var(--space) * 2); }
.testimonial-card__quote {
  font-family: var(--font-serif); font-size: 0.9375rem;
  line-height: 1.75; color: var(--color-text);
  margin-bottom: calc(var(--space) * 3);
  font-style: italic;
}
.testimonial-card__author {
  display: flex; align-items: center; gap: calc(var(--space) * 2);
  font-style: normal;
}
.testimonial-card__avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--color-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.875rem; flex-shrink: 0;
}
.testimonial-card__author strong { display: block; font-size: 0.9375rem; }
.testimonial-card__author span { display: block; font-size: 0.8125rem; color: var(--color-text-muted); }
.testimonial-card__score {
  font-size: 0.75rem !important; color: var(--color-success) !important;
  font-weight: 700 !important;
}
.testimonials__controls {
  display: flex; align-items: center; justify-content: center;
  gap: calc(var(--space) * 3); margin-top: calc(var(--space) * 5);
}
.testimonials__btn {
  width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--color-border);
  background: var(--color-surface); font-size: 1.5rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition); color: var(--color-text);
}
.testimonials__btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.testimonials__dots { display: flex; gap: calc(var(--space)); }
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-border); border: none; cursor: pointer;
  transition: all var(--transition);
}
.dot--active { background: var(--color-primary); width: 24px; border-radius: 4px; }

/* ===== FAQ ===== */
.faq { padding: calc(var(--space) * 14) 0; }
.faq__list { max-width: 800px; margin-inline: auto; display: flex; flex-direction: column; gap: calc(var(--space) * 2); }
.faq-item {
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  overflow: hidden; background: var(--color-surface);
}
.faq-item__question {
  display: flex; justify-content: space-between; align-items: center;
  padding: calc(var(--space) * 2.5) calc(var(--space) * 3);
  cursor: pointer; font-weight: 600; font-size: 1rem;
  gap: calc(var(--space) * 2);
  list-style: none; transition: background var(--transition);
}
.faq-item__question::-webkit-details-marker { display: none; }
.faq-item__question:hover { background: var(--color-bg); }
.faq-item__icon {
  font-size: 1.5rem; color: var(--color-primary);
  transition: transform var(--transition); flex-shrink: 0;
}
.faq-item[open] .faq-item__icon { transform: rotate(45deg); }
.faq-item__answer {
  padding: 0 calc(var(--space) * 3) calc(var(--space) * 2.5);
  color: var(--color-text-muted); line-height: 1.75;
}

/* ===== FINAL CTA ===== */
.final-cta {
  background: linear-gradient(135deg, var(--color-secondary) 0%, #a34710 100%);
  padding: calc(var(--space) * 16) 0; text-align: center; color: #fff;
}
.final-cta__title {
  font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 800;
  margin-bottom: calc(var(--space) * 2);
}
.final-cta__subtitle {
  font-size: 1.125rem; opacity: .85; margin-bottom: calc(var(--space) * 5);
}
.final-cta__reassurance { font-size: 0.875rem; opacity: .7; margin-top: calc(var(--space) * 3); }

/* ===== FOOTER ===== */
.footer {
  background: var(--color-text); color: rgba(255,255,255,.75);
  padding-top: calc(var(--space) * 10);
}
.footer__content {
  display: grid; grid-template-columns: 1fr 2fr;
  gap: calc(var(--space) * 10); margin-bottom: calc(var(--space) * 8);
}
.footer__logo {
  display: block; font-size: 0.875rem; font-weight: 800;
  color: #fff; letter-spacing: .05em; margin-bottom: calc(var(--space) * 2);
}
.footer__tagline { font-size: 0.875rem; margin-bottom: calc(var(--space) * 3); }
.footer__social { display: flex; gap: calc(var(--space) * 2); }
.footer__social a { font-size: 0.8125rem; opacity: .6; transition: opacity var(--transition); }
.footer__social a:hover { opacity: 1; }
.footer__nav { display: grid; grid-template-columns: repeat(3, 1fr); gap: calc(var(--space) * 5); }
.footer__col h4 { font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
                   letter-spacing: .08em; color: #fff; margin-bottom: calc(var(--space) * 2); }
.footer__col ul { list-style: none; display: flex; flex-direction: column; gap: calc(var(--space) * 1.5); }
.footer__col a { font-size: 0.875rem; transition: color var(--transition); }
.footer__col a:hover { color: #fff; }
.footer__bottom {
  border-top: 1px solid rgba(255,255,255,.1);
  padding: calc(var(--space) * 3) 0;
  text-align: center; font-size: 0.8125rem;
}

/* ===== ANIMATIONS D'ENTRÉE ===== */
[data-animate] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-animate="slide-left"] {
  transform: translateX(40px);
}
[data-animate].is-visible {
  opacity: 1;
  transform: none;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero { grid-template-columns: 1fr; }
  .hero__mockup { display: none; }
  .simulation-cta__content { grid-template-columns: 1fr; }
  .clock-ring { display: none; }
  .footer__content { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .nav__links, .nav__cta { display: none; }
  .nav__burger { display: flex; }
  .hero { padding: calc(var(--space) * 8) calc(var(--space) * 3); }
  .modules__grid { grid-template-columns: 1fr; }
  .pricing__grid { grid-template-columns: 1fr; }
  .footer__nav { grid-template-columns: repeat(2, 1fr); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4.3 JavaScript de la landing page

```javascript
// landing/main.js — ayePREP

/* ========================
   1. Intersection Observer — animations d'entrée
   ======================== */
const animatedElements = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
animatedElements.forEach(el => observer.observe(el));

/* ========================
   2. Compteurs animés (stats)
   ======================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const duration = 2000;
  const start = performance.now();
  const format = (n) => n >= 1000 ? (n / 1000).toFixed(0) + ' 000' : n.toString();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = format(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => statsObserver.observe(el));

/* ========================
   3. Header — sticky + scrolled
   ======================== */
const header = document.getElementById('header');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  header.classList.toggle('scrolled', scroll > 50);
  lastScroll = scroll;
}, { passive: true });

/* ========================
   4. Menu burger mobile
   ======================== */
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
const navCta = document.querySelector('.nav__cta');
burger?.addEventListener('click', () => {
  const expanded = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', !expanded);
  navLinks?.classList.toggle('nav__links--open');
  navCta?.classList.toggle('nav__cta--open');
});

/* ========================
   5. Slider témoignages
   ======================== */
const track = document.getElementById('testimonialsTrack');
const dots = document.querySelectorAll('.dot');
let current = 0;
let autoSlide;

function goToSlide(index) {
  const cards = track.querySelectorAll('.testimonial-card');
  const cardWidth = cards[0]?.offsetWidth + 24; // gap = 24px
  track.style.transform = `translateX(-${index * cardWidth}px)`;
  dots.forEach((d, i) => {
    d.classList.toggle('dot--active', i === index);
    d.setAttribute('aria-selected', i === index);
  });
  current = index;
}

document.getElementById('nextTestimonial')?.addEventListener('click', () => {
  const total = track.querySelectorAll('.testimonial-card').length;
  goToSlide((current + 1) % total);
  resetAutoSlide();
});
document.getElementById('prevTestimonial')?.addEventListener('click', () => {
  const total = track.querySelectorAll('.testimonial-card').length;
  goToSlide((current - 1 + total) % total);
  resetAutoSlide();
});
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToSlide(parseInt(dot.dataset.index));
    resetAutoSlide();
  });
});

function startAutoSlide() {
  autoSlide = setInterval(() => {
    const total = track.querySelectorAll('.testimonial-card').length;
    goToSlide((current + 1) % total);
  }, 5000);
}
function resetAutoSlide() {
  clearInterval(autoSlide);
  startAutoSlide();
}
startAutoSlide();

/* ========================
   6. Toggle tarifs mensuel/annuel
   ======================== */
const toggleBtns = document.querySelectorAll('.toggle-btn');
toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleBtns.forEach(b => b.classList.remove('toggle-btn--active'));
    btn.classList.add('toggle-btn--active');
    const period = btn.dataset.period;
    document.querySelectorAll('.price[data-monthly]').forEach(price => {
      const val = period === 'yearly' 
        ? parseFloat(price.dataset.yearly).toFixed(2)
        : parseFloat(price.dataset.monthly).toFixed(2);
      price.textContent = val.replace('.', ',') + '€';
    });
  });
});

/* ========================
   7. Mini timer héro (décompte démo)
   ======================== */
let heroSeconds = 34 * 60 + 12;
const heroTimer = document.getElementById('heroTimer');
setInterval(() => {
  heroSeconds--;
  if (heroSeconds < 0) heroSeconds = 35 * 60;
  const m = Math.floor(heroSeconds / 60).toString().padStart(2, '0');
  const s = (heroSeconds % 60).toString().padStart(2, '0');
  if (heroTimer) heroTimer.textContent = `${m}:${s}`;
}, 1000);

/* ========================
   8. Simulation timer (section simulation CTA)
   ======================== */
let simSeconds = 2 * 3600 + 22 * 60;
const simTimerEl = document.getElementById('simTimer');
setInterval(() => {
  if (simSeconds > 0) simSeconds--;
  const h = Math.floor(simSeconds / 3600).toString().padStart(1, '0');
  const m = Math.floor((simSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (simSeconds % 60).toString().padStart(2, '0');
  if (simTimerEl) simTimerEl.textContent = `${h}:${m}:${s}`;
}, 1000);
```


---

## 5. Frontend Web — React 18 + TypeScript

### 5.1 Configuration Vite + Tailwind

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ayePREP',
        short_name: 'ayePREP',
        description: 'Préparez le TCF et TEF Canada',
        theme_color: '#1B3A6B',
        background_color: '#F8F9FA',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
          audio: ['wavesurfer.js']
        }
      }
    }
  }
})
```

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#1B3A6B', light: '#2E75B6', dark: '#152e56' },
        secondary: { DEFAULT: '#C55A11', light: '#e06515' },
        success:   '#1E7145',
        error:     '#C00000',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      borderRadius: { xl: '12px', '2xl': '20px' },
      animation: {
        'fade-in':     'fadeIn 0.3s ease',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.4,0,0.2,1)',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'waveform':    'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' },
                   '100%': { opacity: '1', transform: 'translateY(0)' } },
        wave:    { '0%,100%': { transform: 'scaleY(1)' },
                   '50%': { transform: 'scaleY(2)' } },
      }
    }
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
} satisfies Config
```

### 5.2 Client Supabase et types

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: { eventsPerSecond: 10 }
    }
  }
)

// src/types/models.ts
export type Module = 'CO' | 'CE' | 'EE' | 'EO'
export type TestType = 'TCF_CANADA' | 'TEF_CANADA'
export type Level = 'B1' | 'B2' | 'C1' | 'C2'
export type SessionType = 'TRAINING' | 'SIMULATION' | 'DIAGNOSTIC'
export type SubscriptionTier = 'gratuit' | 'essentiel' | 'avance' | 'premium' | 'institutionnel'

export interface Question {
  id: string
  module: Module
  test_type: TestType | 'BOTH'
  level: Level
  question_text: string
  audio_url?: string
  passage_text?: string
  options?: Record<string, string>    // { A: '...', B: '...', C: '...', D: '...' }
  correct_answer?: string
  model_answer?: string
  explanation: string
  theme: string
  difficulty_score: number
}

export interface Session {
  id: string
  user_id: string
  session_type: SessionType
  module: Module | 'FULL_TCF' | 'FULL_TEF'
  test_type?: TestType
  started_at: string
  completed_at?: string
  duration_seconds?: number
  score_auto?: number
  nclc_estimate?: string
  status: 'in_progress' | 'completed' | 'abandoned'
}

export interface AutoFeedback {
  criteres: {
    respect_tache:  { score: number; commentaire: string }
    coherence:      { score: number; commentaire: string }
    lexique:        { score: number; commentaire: string }
    morphosyntaxe:  { score: number; commentaire: string }
    conventions:    { score: number; commentaire: string }
  }
  score_global: number
  suggestions: string[]
  resume: string
}
```

### 5.3 Store Zustand (state global)

```typescript
// src/store/sessionStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, Session, Module, TestType } from '@/types/models'

interface SessionStore {
  // État courant
  currentSession: Session | null
  questions: Question[]
  currentIndex: number
  answers: Record<string, string>      // questionId → réponse
  timeLeft: number                     // secondes restantes
  isRunning: boolean
  
  // Actions
  startSession: (session: Session, questions: Question[], duration: number) => void
  submitAnswer: (questionId: string, answer: string) => void
  nextQuestion: () => void
  tick: () => void
  endSession: () => void
  abandonSession: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      timeLeft: 0,
      isRunning: false,

      startSession: (session, questions, duration) => set({
        currentSession: session,
        questions,
        currentIndex: 0,
        answers: {},
        timeLeft: duration,
        isRunning: true
      }),

      submitAnswer: (questionId, answer) => set(state => ({
        answers: { ...state.answers, [questionId]: answer }
      })),

      nextQuestion: () => set(state => ({
        currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1)
      })),

      tick: () => {
        const { timeLeft, endSession } = get()
        if (timeLeft <= 1) {
          endSession()
        } else {
          set(state => ({ timeLeft: state.timeLeft - 1 }))
        }
      },

      endSession: () => set({ isRunning: false }),
      abandonSession: () => set({ 
        currentSession: null, questions: [], 
        currentIndex: 0, answers: {}, timeLeft: 0, isRunning: false 
      })
    }),
    {
      name: 'fa-session',
      partialize: (state) => ({
        currentSession: state.currentSession,
        answers: state.answers,
        currentIndex: state.currentIndex,
        timeLeft: state.timeLeft
      })
    }
  )
)
```

### 5.4 Hook — Minuteur bloquant

```typescript
// src/hooks/useSessionTimer.ts
import { useEffect, useRef } from 'react'
import { useSessionStore } from '@/store/sessionStore'

export function useSessionTimer() {
  const { isRunning, tick, timeLeft } = useSessionStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, tick])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const isWarning = timeLeft <= 300  // rouge < 5 min
  const isCritical = timeLeft <= 60  // rouge clignotant < 1 min

  return { timeLeft, formattedTime, isWarning, isCritical }
}
```

### 5.5 Composants principaux

```typescript
// src/components/Timer.tsx
import { useSessionTimer } from '@/hooks/useSessionTimer'
import { cn } from '@/lib/utils'

interface TimerProps {
  label?: string
  className?: string
}

export function Timer({ label, className }: TimerProps) {
  const { formattedTime, isWarning, isCritical } = useSessionTimer()

  return (
    <div className={cn(
      'flex flex-col items-center font-mono font-bold tabular-nums',
      className
    )}>
      {label && <span className="text-xs text-gray-500 mb-1">{label}</span>}
      <span className={cn(
        'text-2xl transition-colors duration-300',
        isWarning && !isCritical && 'text-orange-600',
        isCritical && 'text-red-600 animate-pulse'
      )}>
        {formattedTime}
      </span>
    </div>
  )
}

// src/features/co/AudioPlayer.tsx
import { useState, useRef, useCallback } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  audioUrl: string
  maxListens: number
  onListensExceeded?: () => void
}

export function AudioPlayer({ audioUrl, maxListens, onListensExceeded }: AudioPlayerProps) {
  const [listens, setListens] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const waveRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)

  const initWaveSurfer = useCallback(() => {
    if (!waveRef.current) return
    wsRef.current = WaveSurfer.create({
      container: waveRef.current,
      waveColor: '#94a3b8',
      progressColor: '#1B3A6B',
      cursorColor: '#C55A11',
      height: 56,
      barWidth: 3,
      barRadius: 2,
      barGap: 2,
    })
    wsRef.current.load(audioUrl)
    wsRef.current.on('ready', () => setIsLoading(false))
    wsRef.current.on('finish', () => setIsPlaying(false))
  }, [audioUrl])

  const togglePlay = () => {
    if (!wsRef.current) return
    if (listens >= maxListens && !isPlaying) {
      onListensExceeded?.()
      return
    }
    if (!isPlaying) {
      setListens(prev => prev + 1)
    }
    wsRef.current.playPause()
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-4">
      <button
        onClick={togglePlay}
        disabled={listens >= maxListens && !isPlaying}
        aria-label={isPlaying ? 'Mettre en pause' : 'Lire le document audio'}
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          'bg-primary text-white transition-all duration-200',
          'hover:bg-primary-dark active:scale-95',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : isPlaying ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-0.5">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
          </svg>
        )}
      </button>

      <div ref={waveRef} className="flex-1" role="img" aria-label="Forme d'onde audio" />

      <div className="flex flex-col items-end gap-1">
        <span className={cn(
          'text-sm font-bold',
          listens >= maxListens ? 'text-error' : 'text-primary'
        )}>
          {listens}/{maxListens}
        </span>
        <span className="text-xs text-gray-500">écoutes</span>
      </div>
    </div>
  )
}

// src/features/ee/WritingEditor.tsx
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface WritingEditorProps {
  onTextChange: (text: string) => void
  targetWordCount: { min: number; max: number }
  placeholder?: string
}

export function WritingEditor({ onTextChange, targetWordCount, placeholder }: WritingEditorProps) {
  const [text, setText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [lastSave, setLastSave] = useState<Date | null>(null)
  const autoSaveRef = useRef<NodeJS.Timeout>()

  const countWords = (t: string) =>
    t.trim() === '' ? 0 : t.trim().split(/\s+/).length

  useEffect(() => {
    const count = countWords(text)
    setWordCount(count)
    onTextChange(text)

    // Sauvegarde automatique toutes les 30s
    clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem('fa-ee-draft', text)
      setLastSave(new Date())
    }, 30000)
    return () => clearTimeout(autoSaveRef.current)
  }, [text])

  const isUnder = wordCount < targetWordCount.min
  const isOver = wordCount > targetWordCount.max
  const isGood = !isUnder && !isOver

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          Objectif : {targetWordCount.min}–{targetWordCount.max} mots
        </span>
        {lastSave && (
          <span className="text-xs text-success">
            Sauvegardé à {lastSave.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder || 'Rédigez votre réponse ici...'}
        spellCheck={false}
        className={cn(
          'w-full min-h-[280px] p-4 rounded-xl border-2 font-serif text-base',
          'resize-none focus:outline-none focus:ring-2 transition-colors',
          'bg-white leading-relaxed',
          isGood && 'border-success focus:ring-success/30',
          isUnder && 'border-gray-200 focus:ring-primary/30',
          isOver && 'border-error focus:ring-error/30'
        )}
      />
      <div className="flex justify-end items-center gap-2">
        <span className={cn(
          'text-sm font-bold transition-colors',
          isGood && 'text-success',
          isUnder && 'text-gray-500',
          isOver && 'text-error'
        )}>
          {wordCount} mots
        </span>
        {isOver && (
          <span className="text-xs text-error">
            ({wordCount - targetWordCount.max} mots en trop)
          </span>
        )}
        {isUnder && wordCount > 0 && (
          <span className="text-xs text-gray-500">
            (encore {targetWordCount.min - wordCount} mots)
          </span>
        )}
      </div>
    </div>
  )
}

// src/features/eo/AudioRecorder.tsx
import { useState, useRef, useEffect } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js'
import { supabase } from '@/lib/supabase'

interface AudioRecorderProps {
  taskIndex: number
  sessionId: string
  taskDurationSeconds: number
  onRecordingComplete: (audioUrl: string) => void
}

export function AudioRecorder({ taskIndex, sessionId, taskDurationSeconds, onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [taskTimeLeft, setTaskTimeLeft] = useState(taskDurationSeconds)
  const waveRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const recordRef = useRef<InstanceType<typeof RecordPlugin> | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!waveRef.current) return
    wsRef.current = WaveSurfer.create({ container: waveRef.current, height: 64 })
    recordRef.current = wsRef.current.registerPlugin(RecordPlugin.create({
      renderRecordedAudio: false
    }))
    recordRef.current.on('record-end', async (blob) => {
      clearInterval(timerRef.current)
      setIsUploading(true)
      const filename = `eo/${sessionId}/task_${taskIndex}_${Date.now()}.webm`
      const { data } = await supabase.storage
        .from('audio-responses')
        .upload(filename, blob, { contentType: 'audio/webm' })
      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('audio-responses').getPublicUrl(data.path)
        onRecordingComplete(publicUrl)
      }
      setIsUploading(false)
    })
    return () => wsRef.current?.destroy()
  }, [])

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTaskTimeLeft(prev => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [isRecording])

  const startRecording = async () => {
    await recordRef.current?.startRecording()
    setIsRecording(true)
  }

  const stopRecording = () => {
    recordRef.current?.stopRecording()
    setIsRecording(false)
  }

  const minutes = Math.floor(taskTimeLeft / 60)
  const seconds = taskTimeLeft % 60

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded-2xl">
      <div className="flex items-center justify-between">
        <span className={`text-2xl font-mono font-bold ${isRecording ? 'text-error animate-pulse' : 'text-primary'}`}>
          {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
        </span>
        {isRecording && (
          <span className="flex items-center gap-2 text-error text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"/>
            Enregistrement en cours
          </span>
        )}
      </div>

      <div ref={waveRef} className="min-h-16 bg-white rounded-xl overflow-hidden" />

      <div className="flex justify-center">
        {!isRecording && !isUploading ? (
          <button onClick={startRecording}
            className="flex items-center gap-3 px-8 py-3 bg-error text-white rounded-full font-bold hover:bg-red-700 transition-all active:scale-95">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <rect x="6" y="4" width="8" height="12" rx="4"/>
            </svg>
            Commencer l'enregistrement
          </button>
        ) : isUploading ? (
          <div className="flex items-center gap-3 text-primary">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Envoi en cours...
          </div>
        ) : (
          <button onClick={stopRecording}
            className="flex items-center gap-3 px-8 py-3 bg-gray-800 text-white rounded-full font-bold hover:bg-gray-900 transition-all">
            Arrêter et envoyer
          </button>
        )}
      </div>
    </div>
  )
}
```

### 5.6 Tableau de bord progression

```typescript
// src/features/progression/RadarChart.tsx
import { Radar, RadarChart as ReRadarChart, PolarGrid, 
         PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface RadarData {
  module: string
  score: number
  target: number
}

export function ProgressRadarChart({ data }: { data: RadarData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReRadarChart data={data}>
        <PolarGrid gridType="polygon" stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="module"
          tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
        />
        <Radar
          name="Score cible"
          dataKey="target"
          stroke="#e5e7eb"
          fill="#e5e7eb"
          fillOpacity={0.3}
        />
        <Radar
          name="Votre score"
          dataKey="score"
          stroke="#1B3A6B"
          fill="#1B3A6B"
          fillOpacity={0.45}
        />
        <Tooltip
          formatter={(value: number, name: string) => [`${value}%`, name]}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  )
}
```

### 5.7 Routes React Router

```typescript
// src/App.tsx — Version 3.0 (Mai 2026)
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { FullPageSpinner } from './components/FullPageSpinner'
import { CookieBanner } from './components/CookieBanner'      // RGPD ePrivacy
import { WhatsAppButton } from './components/WhatsAppButton'  // Support flottant
import { AffiliateTracker } from './components/AffiliateTracker' // ?ref=CODE

// ── Pages principales ──────────────────────────────────────────────────
const LandingPage         = lazy(() => import('./pages/LandingPage'))       // Schema.org JSON-LD
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage        = lazy(() => import('./pages/auth/RegisterPage'))
const DashboardPage       = lazy(() => import('./pages/DashboardPage'))
const CataloguePage       = lazy(() => import('./pages/CataloguePage'))
const SessionPage         = lazy(() => import('./pages/SessionPage'))
const SimulationPage      = lazy(() => import('./pages/SimulationPage'))
const ResultsPage         = lazy(() => import('./pages/ResultsPage'))
const ProgressionPage     = lazy(() => import('./pages/ProgressionPage'))
const ProfilePage         = lazy(() => import('./pages/ProfilePage'))
const SubscribePage       = lazy(() => import('./pages/SubscribePage'))     // Onglets abos + packs
const AdminLayout         = lazy(() => import('./pages/admin/AdminLayout'))
const ExpertLayout        = lazy(() => import('./pages/expert/ExpertLayout'))
const PrivateLayout       = lazy(() => import('./components/PrivateLayout'))

// ── Pages publiques SEO + Outils gratuits ─────────────────────────────
const NclcCalculatorPage  = lazy(() => import('./pages/NclcCalculatorPage')) // /calculateur-nclc
const ComparisonPage      = lazy(() => import('./pages/ComparisonPage'))      // /tcf-vs-tef-canada
const QuickTestPage       = lazy(() => import('./pages/QuickTestPage'))       // /test-rapide
const HelpCenterPage      = lazy(() => import('./pages/HelpCenterPage'))      // /aide
const RefundPage          = lazy(() => import('./pages/RefundPage'))          // /remboursement
const ExamPacksPage       = lazy(() => import('./pages/ExamPacksPage'))       // /packs
const SuccessStoriesPage  = lazy(() => import('./pages/SuccessStoriesPage'))  // /reussites

// ── Pages protégées ────────────────────────────────────────────────────
const LearningPathPage    = lazy(() => import('./pages/LearningPathPage'))   // /parcours

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const location = useLocation()
  return user ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuthStore()
  return user && role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />
}

const router = createBrowserRouter([
  // ── Pages publiques ─────────────────────────────────────────────────
  { path: '/',                    element: <LandingPage /> },
  { path: '/login',               element: <LoginPage /> },
  { path: '/register',            element: <RegisterPage /> },
  { path: '/calculateur-nclc',    element: <NclcCalculatorPage /> },  // SEO high-intent
  { path: '/tcf-vs-tef-canada',   element: <ComparisonPage /> },      // SEO comparatif
  { path: '/test-rapide',         element: <QuickTestPage /> },        // Lead magnet
  { path: '/aide',                element: <HelpCenterPage /> },
  { path: '/remboursement',       element: <RefundPage /> },
  { path: '/packs',               element: <ExamPacksPage /> },        // EUR + FCFA
  { path: '/reussites',           element: <SuccessStoriesPage /> },   // Social proof

  // ── Pages protégées ──────────────────────────────────────────────────
  {
    element: <PrivateRoute><PrivateLayout /></PrivateRoute>,
    children: [
      { path: '/dashboard',          element: <DashboardPage /> },
      { path: '/modules',            element: <CataloguePage /> },
      { path: '/simulation',         element: <SimulationPage /> },
      { path: '/results/:sessionId', element: <ResultsPage /> },
      { path: '/progress',           element: <ProgressionPage /> },
      { path: '/profile',            element: <ProfilePage /> },
      { path: '/subscribe',          element: <SubscribePage /> },
      { path: '/parcours',           element: <LearningPathPage /> },  // Plan 30/60/90j
    ]
  },
  {
    path: '/session/:sessionId',
    element: <PrivateRoute><SessionPage /></PrivateRoute>
  },

  // ── Admin / Expert ────────────────────────────────────────────────────
  { path: '/admin/*',  element: <AdminRoute><AdminLayout /></AdminRoute> },
  { path: '/expert/*', element: <PrivateRoute><ExpertLayout /></PrivateRoute> }
])

export default function App() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <RouterProvider router={router} />
      {/* Composants globaux — présents sur toutes les pages */}
      <AffiliateTracker />   {/* Tracking ?ref=CODE silencieux */}
      <CookieBanner />       {/* Consentement RGPD/ePrivacy */}
      <WhatsAppButton />     {/* Bouton flottant support */}
    </Suspense>
  )
}
```

---

## 6. Application Mobile — Flutter 3.x

### 6.1 Dépendances pubspec.yaml

```yaml
# pubspec.yaml
name: ayeprep
description: Préparez le TCF et TEF Canada

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.19.0'

dependencies:
  flutter:
    sdk: flutter

  # Navigation
  go_router: ^13.0.0

  # State management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0

  # Supabase
  supabase_flutter: ^2.3.0

  # Paiements
  purchases_flutter: ^7.0.0          # RevenueCat

  # Audio
  just_audio: ^0.9.37                # Lecture CO
  record: ^5.0.0                     # Enregistrement EO
  audio_waveforms: ^1.0.5            # Waveform visualisation

  # Stockage local
  drift: ^2.16.0                     # SQLite ORM
  drift_sqflite: ^2.1.0

  # UI
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0
  fl_chart: ^0.67.0                  # Graphiques radar + courbes
  lottie: ^3.1.0                     # Animations Lottie

  # Notifications
  firebase_core: ^2.27.0
  firebase_messaging: ^14.7.19
  flutter_local_notifications: ^16.3.0

  # Utilitaires
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1
  connectivity_plus: ^6.0.1
  path_provider: ^2.1.2
  shared_preferences: ^2.2.2
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.8
  freezed: ^2.4.7
  json_serializable: ^6.7.1
  riverpod_generator: ^2.3.11
  drift_dev: ^2.16.0
  flutter_lints: ^3.0.1
  integration_test:
    sdk: flutter
```

### 6.2 Modèles Dart (Freezed)

```dart
// lib/shared/models/question.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'question.freezed.dart';
part 'question.g.dart';

@freezed
class Question with _$Question {
  const factory Question({
    required String id,
    required String module,           // CO, CE, EE, EO
    required String testType,         // TCF_CANADA, TEF_CANADA, BOTH
    required String level,            // B1, B2, C1, C2
    required String questionText,
    String? audioUrl,
    String? passageText,
    Map<String, String>? options,     // {A: '...', B: '...', ...}
    String? correctAnswer,
    String? modelAnswer,
    required String explanation,
    required String theme,
    required int difficultyScore,
    @Default(false) bool isDownloaded,
  }) = _Question;

  factory Question.fromJson(Map<String, dynamic> json) =>
      _$QuestionFromJson(json);
}

// lib/shared/models/session.dart
@freezed
class SessionModel with _$SessionModel {
  const factory SessionModel({
    required String id,
    required String userId,
    required String sessionType,
    required String module,
    String? testType,
    required DateTime startedAt,
    DateTime? completedAt,
    int? durationSeconds,
    double? scoreAuto,
    String? nclcEstimate,
    @Default('in_progress') String status,
    @Default({}) Map<String, String> answers,
    @Default(0) int currentIndex,
    @Default(0) int timeLeftSeconds,
  }) = _SessionModel;

  factory SessionModel.fromJson(Map<String, dynamic> json) =>
      _$SessionModelFromJson(json);
}
```

### 6.3 Navigation go_router

```dart
// lib/core/router/app_router.dart
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: false,
    redirect: (context, state) {
      final isAuthenticated = authState.hasValue && authState.value != null;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');
      if (!isAuthenticated && !isAuthRoute && state.matchedLocation != '/') {
        return '/auth/login';
      }
      if (isAuthenticated && isAuthRoute) {
        return '/dashboard';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (ctx, state) => const OnboardingScreen()),
      GoRoute(
        path: '/auth',
        routes: [
          GoRoute(path: 'login', builder: (ctx, state) => const LoginScreen()),
          GoRoute(path: 'register', builder: (ctx, state) => const RegisterScreen()),
        ]
      ),
      ShellRoute(
        builder: (ctx, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(path: '/dashboard', builder: (ctx, state) => const DashboardScreen()),
          GoRoute(path: '/catalogue', builder: (ctx, state) => const CatalogueScreen()),
          GoRoute(path: '/progress', builder: (ctx, state) => const ProgressionScreen()),
          GoRoute(path: '/profile', builder: (ctx, state) => const ProfileScreen()),
        ]
      ),
      GoRoute(
        path: '/session/:sessionId',
        builder: (ctx, state) => SessionScreen(
          sessionId: state.pathParameters['sessionId']!,
        ),
      ),
      GoRoute(
        path: '/simulation/:testType',
        builder: (ctx, state) => SimulationScreen(
          testType: state.pathParameters['testType']!,
        ),
      ),
      GoRoute(
        path: '/results/:sessionId',
        builder: (ctx, state) => ResultsScreen(
          sessionId: state.pathParameters['sessionId']!,
        ),
      ),
    ],
  );
});
```

### 6.4 Widget session QCM

```dart
// lib/features/session/widgets/qcm_question_widget.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/question.dart';

class QcmQuestionWidget extends ConsumerStatefulWidget {
  final Question question;
  final String? selectedAnswer;
  final Function(String) onAnswerSelected;
  final bool isReview;

  const QcmQuestionWidget({
    super.key,
    required this.question,
    this.selectedAnswer,
    required this.onAnswerSelected,
    this.isReview = false,
  });

  @override
  ConsumerState<QcmQuestionWidget> createState() => _QcmQuestionWidgetState();
}

class _QcmQuestionWidgetState extends ConsumerState<QcmQuestionWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      duration: const Duration(milliseconds: 350),
      vsync: this,
    );
    _slideAnim = Tween<Offset>(begin: const Offset(0.15, 0), end: Offset.zero)
        .animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic));
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final options = widget.question.options ?? {};

    return SlideTransition(
      position: _slideAnim,
      child: FadeTransition(
        opacity: _animController,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Texte de la question
            Text(
              widget.question.questionText,
              style: theme.textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w600,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 20),

            // Passage textuel (CE)
            if (widget.question.passageText != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceVariant,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  widget.question.passageText!,
                  style: theme.textTheme.bodyMedium?.copyWith(height: 1.65),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Options de réponse
            ...options.entries.map((entry) {
              final isSelected = widget.selectedAnswer == entry.key;
              final isCorrect = widget.isReview && 
                                entry.key == widget.question.correctAnswer;
              final isWrong = widget.isReview && 
                              isSelected && 
                              entry.key != widget.question.correctAnswer;

              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOut,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: widget.isReview ? null : () =>
                          widget.onAnswerSelected(entry.key),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          border: Border.all(
                            width: 2,
                            color: isCorrect ? const Color(0xFF1E7145)
                                : isWrong ? const Color(0xFFC00000)
                                : isSelected ? const Color(0xFF1B3A6B)
                                : const Color(0xFFE5E7EB),
                          ),
                          borderRadius: BorderRadius.circular(12),
                          color: isCorrect ? const Color(0xFF1E7145).withOpacity(0.07)
                              : isWrong ? const Color(0xFFC00000).withOpacity(0.07)
                              : isSelected ? const Color(0xFF1B3A6B).withOpacity(0.07)
                              : Colors.white,
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 28, height: 28,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isSelected || isCorrect
                                    ? const Color(0xFF1B3A6B)
                                    : Colors.transparent,
                                border: Border.all(color: const Color(0xFF1B3A6B)),
                              ),
                              child: Center(
                                child: Text(
                                  entry.key,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected ? Colors.white
                                        : const Color(0xFF1B3A6B),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                entry.value,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: isSelected ? FontWeight.w600
                                      : FontWeight.normal,
                                ),
                              ),
                            ),
                            if (isCorrect)
                              const Icon(Icons.check_circle,
                                  color: Color(0xFF1E7145), size: 20),
                            if (isWrong)
                              const Icon(Icons.cancel,
                                  color: Color(0xFFC00000), size: 20),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}
```


---

## 7. Base de données — Schéma PostgreSQL complet

### 7.1 Schéma complet avec index et contraintes

```sql
-- ================================================
-- ayePREP — Schéma PostgreSQL 15
-- Supabase Cloud — eu-central-1
-- Version: 2.0
-- ================================================

-- ----------------------
-- Extensions
-- ----------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Recherche textuelle
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector (embeddings futurs)

-- ----------------------
-- USERS (profils utilisateurs)
-- ----------------------
CREATE TABLE public.users (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT UNIQUE NOT NULL,
  full_name               TEXT NOT NULL CHECK (char_length(full_name) >= 2),
  avatar_url              TEXT,
  country                 TEXT NOT NULL,
  phone                   TEXT,
  level_assessed          TEXT CHECK (level_assessed IN ('A1','A2','B1','B2','C1','C2')),
  target_test             TEXT CHECK (target_test IN ('TCF_CANADA','TEF_CANADA','BOTH')),
  exam_date               DATE CHECK (exam_date >= CURRENT_DATE),
  role                    TEXT DEFAULT 'user' CHECK (role IN ('user','expert','admin')),
  subscription_tier       TEXT DEFAULT 'gratuit'
                              CHECK (subscription_tier IN 
                                ('gratuit','essentiel','avance','premium','institutionnel')),
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id      TEXT UNIQUE,
  revenuecat_app_user_id  TEXT UNIQUE,
  xp_points               INTEGER DEFAULT 0 CHECK (xp_points >= 0),
  streak_days             INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  longest_streak          INTEGER DEFAULT 0,
  last_activity_at        TIMESTAMPTZ,
  notifications_enabled   BOOLEAN DEFAULT true,
  daily_reminder_hour     INTEGER DEFAULT 9 CHECK (daily_reminder_hour BETWEEN 0 AND 23),
  offline_mode_enabled    BOOLEAN DEFAULT false,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_country ON public.users(country);
CREATE INDEX idx_users_subscription ON public.users(subscription_tier, subscription_expires_at);
CREATE INDEX idx_users_stripe ON public.users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------
-- QUESTIONS (banque de 2000+ sujets)
-- ----------------------
CREATE TABLE public.questions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module           TEXT NOT NULL CHECK (module IN ('CO','CE','EE','EO')),
  test_type        TEXT NOT NULL CHECK (test_type IN ('TCF_CANADA','TEF_CANADA','BOTH')),
  level            TEXT NOT NULL CHECK (level IN ('A2','B1','B2','C1','C2')),
  question_text    TEXT NOT NULL CHECK (char_length(question_text) >= 10),
  audio_url        TEXT,                        -- Cloudflare CDN URL
  audio_cdn_path   TEXT,                        -- Chemin brut R2
  audio_duration_s INTEGER,                     -- Durée en secondes
  max_listens      INTEGER DEFAULT 2
                       CHECK (max_listens IN (1,2)),
  passage_text     TEXT,                        -- Texte CE à lire
  options          JSONB,                       -- {"A":"...","B":"...","C":"...","D":"..."}
  correct_answer   TEXT CHECK (correct_answer IN ('A','B','C','D')),
  model_answer     TEXT,                        -- Réponse modèle (EE/EO)
  correction_grid  JSONB,                       -- Grille critères par épreuve
  explanation      TEXT NOT NULL,
  theme            TEXT NOT NULL,               -- thème pédagogique
  sub_theme        TEXT,
  source_type      TEXT DEFAULT 'original'
                       CHECK (source_type IN ('original','adapted')),
  difficulty_score INTEGER CHECK (difficulty_score BETWEEN 1 AND 10),
  times_used       INTEGER DEFAULT 0,
  times_correct    INTEGER DEFAULT 0,
  success_rate     FLOAT GENERATED ALWAYS AS (
                     CASE WHEN times_used = 0 THEN NULL
                          ELSE times_correct::FLOAT / times_used
                     END
                   ) STORED,
  is_active        BOOLEAN DEFAULT true,
  is_premium       BOOLEAN DEFAULT false,
  created_by       UUID REFERENCES public.users(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_questions_module_level ON public.questions(module, level, is_active);
CREATE INDEX idx_questions_test_type ON public.questions(test_type, module, level);
CREATE INDEX idx_questions_theme ON public.questions USING gin(theme gin_trgm_ops);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty_score, module, level);

CREATE TRIGGER trg_questions_updated
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------
-- SESSIONS (entraînements et simulations)
-- ----------------------
CREATE TABLE public.sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_type      TEXT NOT NULL CHECK (session_type IN ('TRAINING','SIMULATION','DIAGNOSTIC')),
  module            TEXT NOT NULL CHECK (module IN ('CO','CE','EE','EO','FULL_TCF','FULL_TEF')),
  test_type         TEXT CHECK (test_type IN ('TCF_CANADA','TEF_CANADA')),
  level             TEXT CHECK (level IN ('B1','B2','C1','C2','MIXED')),
  question_ids      UUID[] NOT NULL DEFAULT '{}',   -- Ordre des questions
  started_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  duration_seconds  INTEGER CHECK (duration_seconds >= 0),
  max_duration_s    INTEGER NOT NULL,               -- Durée allouée (validation serveur)
  score_auto        FLOAT CHECK (score_auto BETWEEN 0 AND 100),
  score_expert      FLOAT,
  nclc_estimate     TEXT CHECK (nclc_estimate IN ('A1','A2','B1','B2','C1','C2')),
  clb_estimate      TEXT,
  xp_earned         INTEGER DEFAULT 0,
  status            TEXT DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress','completed','abandoned','expired')),
  device_type       TEXT CHECK (device_type IN ('web','ios','android')),
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_user_status ON public.sessions(user_id, status, created_at DESC);
CREATE INDEX idx_sessions_module_type ON public.sessions(module, test_type, session_type);
CREATE INDEX idx_sessions_completed ON public.sessions(user_id, completed_at DESC) 
  WHERE status = 'completed';

-- ----------------------
-- ANSWERS (réponses par question)
-- ----------------------
CREATE TABLE public.answers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_id         UUID NOT NULL REFERENCES public.questions(id),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_answer         TEXT,                     -- Réponse QCM (A/B/C/D) ou texte EE
  audio_storage_path  TEXT,                     -- Chemin Supabase Storage (EO)
  audio_url           TEXT,                     -- URL signée (EO)
  audio_transcript    TEXT,                     -- Transcription Whisper (EO)
  is_correct          BOOLEAN,                  -- NULL pour EE/EO
  time_spent_seconds  INTEGER,
  listen_count        INTEGER DEFAULT 0,        -- Nb d'écoutes (CO)
  auto_feedback       JSONB,                    -- JSON GPT-4o par critère
  expert_feedback     TEXT,
  expert_score        FLOAT,
  is_flagged          BOOLEAN DEFAULT false,    -- Signalé pour révision
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_answers_session ON public.answers(session_id);
CREATE INDEX idx_answers_user_question ON public.answers(user_id, question_id, created_at DESC);
CREATE UNIQUE INDEX idx_answers_session_question ON public.answers(session_id, question_id);

-- ----------------------
-- SUBSCRIPTIONS (abonnements)
-- ----------------------
CREATE TABLE public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan                 TEXT NOT NULL CHECK (plan IN 
                           ('essentiel','avance','premium','institutionnel')),
  billing_period       TEXT NOT NULL CHECK (billing_period IN ('monthly','quarterly','yearly')),
  stripe_sub_id        TEXT UNIQUE,
  stripe_price_id      TEXT,
  revenuecat_id        TEXT UNIQUE,
  platform             TEXT CHECK (platform IN ('web','ios','android')),
  status               TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','cancelled','past_due','trialing','paused')),
  trial_end            TIMESTAMPTZ,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at           TIMESTAMPTZ NOT NULL,
  cancelled_at         TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  amount_paid          NUMERIC(10,2) NOT NULL,
  currency             TEXT DEFAULT 'EUR' CHECK (char_length(currency) = 3),
  discount_applied     TEXT,
  metadata             JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id, status, expires_at);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_sub_id) WHERE stripe_sub_id IS NOT NULL;

-- ----------------------
-- PURCHASE_HISTORY (achats unitaires)
-- ----------------------
CREATE TABLE public.purchase_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_type     TEXT NOT NULL CHECK (product_type IN (
                       'simulation_tcf','simulation_tef',
                       'correction_ee','correction_eo',
                       'pack_simulations','pack_corrections')),
  quantity         INTEGER DEFAULT 1,
  unit_price       NUMERIC(10,2) NOT NULL,
  total_price      NUMERIC(10,2) NOT NULL,
  currency         TEXT DEFAULT 'EUR',
  stripe_payment_id TEXT,
  status           TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','refunded')),
  used_count       INTEGER DEFAULT 0,
  purchased_at     TIMESTAMPTZ DEFAULT now()
);

-- ----------------------
-- EXPERT_CORRECTIONS (corrections humaines)
-- ----------------------
CREATE TABLE public.expert_corrections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  answer_id        UUID NOT NULL REFERENCES public.answers(id),
  user_id          UUID NOT NULL REFERENCES public.users(id),
  expert_id        UUID REFERENCES public.users(id),
  module           TEXT NOT NULL CHECK (module IN ('EE','EO')),
  test_type        TEXT CHECK (test_type IN ('TCF_CANADA','TEF_CANADA')),
  status           TEXT DEFAULT 'pending'
                       CHECK (status IN ('pending','assigned','in_review','completed','disputed')),
  priority         TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  assigned_at      TIMESTAMPTZ,
  due_at           TIMESTAMPTZ,                -- deadline SLA
  completed_at     TIMESTAMPTZ,
  score_criteria   JSONB,                      -- Scores par critère CECRL
  global_score     FLOAT CHECK (global_score BETWEEN 0 AND 100),
  feedback_text    TEXT,
  suggestions      TEXT[],
  expert_notes     TEXT,                       -- Notes internes expert
  dispute_reason   TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expert_corrections_status ON public.expert_corrections(status, due_at ASC);
CREATE INDEX idx_expert_corrections_expert ON public.expert_corrections(expert_id, status);

CREATE TRIGGER trg_expert_corrections_updated
  BEFORE UPDATE ON public.expert_corrections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------
-- BADGES (gamification)
-- ----------------------
CREATE TABLE public.badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url    TEXT NOT NULL,
  xp_reward   INTEGER DEFAULT 50,
  condition   JSONB NOT NULL,             -- Condition de déverrouillage
  rarity      TEXT DEFAULT 'common'
                  CHECK (rarity IN ('common','rare','epic','legendary')),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES public.badges(id),
  earned_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- ----------------------
-- PROGRESS_STATS (statistiques par module)
-- ----------------------
CREATE TABLE public.progress_stats (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module              TEXT NOT NULL CHECK (module IN ('CO','CE','EE','EO')),
  test_type           TEXT CHECK (test_type IN ('TCF_CANADA','TEF_CANADA')),
  mastery_score       FLOAT DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  sessions_completed  INTEGER DEFAULT 0,
  questions_answered  INTEGER DEFAULT 0,
  questions_correct   INTEGER DEFAULT 0,
  accuracy_rate       FLOAT GENERATED ALWAYS AS (
                        CASE WHEN questions_answered = 0 THEN 0
                             ELSE questions_correct::FLOAT / questions_answered * 100
                        END
                      ) STORED,
  avg_score           FLOAT,
  best_score          FLOAT,
  total_time_s        INTEGER DEFAULT 0,
  themes_weak         TEXT[],                   -- Thèmes à retravailler
  last_session_at     TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module, test_type)
);

-- ----------------------
-- NOTIFICATIONS (centre de notifications)
-- ----------------------
CREATE TABLE public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN (
                   'correction_ready','streak_reminder','exam_countdown',
                   'badge_earned','subscription_expiring','promo')),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  data         JSONB,
  is_read      BOOLEAN DEFAULT false,
  sent_at      TIMESTAMPTZ,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- ----------------------
-- OFFLINE_CACHE (gestion cache mobile)
-- ----------------------
CREATE TABLE public.offline_downloads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module       TEXT NOT NULL CHECK (module IN ('CO','CE','EE','EO')),
  test_type    TEXT CHECK (test_type IN ('TCF_CANADA','TEF_CANADA')),
  level        TEXT,
  question_ids UUID[] NOT NULL,
  file_size_mb FLOAT,
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  expires_at   TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  device_id    TEXT,
  UNIQUE(user_id, module, test_type, level)
);
```

### 7.2 Row Level Security (RLS) — Politiques complètes

```sql
-- ========================
-- Activer RLS sur TOUTES les tables
-- ========================
ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_corrections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_stats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_downloads    ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_expert_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('expert','admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));
CREATE POLICY "users_admin_all" ON public.users FOR ALL USING (is_admin());

-- QUESTIONS (lecture conditionnelle selon abonnement)
CREATE POLICY "questions_read_active" ON public.questions FOR SELECT USING (
  is_active = true AND (
    is_premium = false OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND subscription_tier IN ('avance','premium','institutionnel')
        AND (subscription_expires_at IS NULL OR subscription_expires_at > now())
    ) OR
    is_admin()
  )
);
CREATE POLICY "questions_admin_all" ON public.questions FOR ALL USING (is_admin());

-- SESSIONS
CREATE POLICY "sessions_own" ON public.sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "sessions_admin" ON public.sessions FOR ALL USING (is_admin());

-- ANSWERS
CREATE POLICY "answers_own" ON public.answers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "answers_expert_corrections" ON public.answers FOR SELECT 
  USING (is_expert_or_admin());

-- EXPERT_CORRECTIONS
CREATE POLICY "corrections_user_view" ON public.expert_corrections FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "corrections_expert" ON public.expert_corrections FOR ALL
  USING (auth.uid() = expert_id OR is_admin());

-- USER_BADGES, PROGRESS_STATS, NOTIFICATIONS, SUBSCRIPTIONS (même pattern)
CREATE POLICY "user_badges_own" ON public.user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "progress_stats_own" ON public.progress_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_admin" ON public.subscriptions FOR ALL USING (is_admin());
```

### 7.3 Fonctions PostgreSQL utilitaires

```sql
-- Calcul niveau NCLC à partir du score
CREATE OR REPLACE FUNCTION get_nclc_level(
  p_score FLOAT,
  p_test_type TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_level TEXT;
BEGIN
  IF p_test_type = 'TCF_CANADA' THEN
    v_level := CASE
      WHEN p_score >= 523 THEN 'C2'
      WHEN p_score >= 457 THEN 'C1'
      WHEN p_score >= 356 THEN 'B2'
      WHEN p_score >= 242 THEN 'B1'
      WHEN p_score >= 181 THEN 'A2'
      ELSE 'A1'
    END;
  ELSIF p_test_type = 'TEF_CANADA' THEN
    v_level := CASE
      WHEN p_score >= 526 THEN 'C2'
      WHEN p_score >= 451 THEN 'C1'
      WHEN p_score >= 361 THEN 'B2'
      WHEN p_score >= 271 THEN 'B1'
      WHEN p_score >= 181 THEN 'A2'
      ELSE 'A1'
    END;
  END IF;
  RETURN v_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Mise à jour XP et streak après une session
CREATE OR REPLACE FUNCTION award_session_xp(
  p_user_id UUID,
  p_session_id UUID,
  p_xp INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_last_activity TIMESTAMPTZ;
  v_streak INTEGER;
BEGIN
  SELECT last_activity_at, streak_days INTO v_last_activity, v_streak
  FROM public.users WHERE id = p_user_id;

  -- Mise à jour streak
  IF v_last_activity IS NULL OR 
     v_last_activity < (now() - INTERVAL '2 days') THEN
    v_streak := 1;  -- Reset
  ELSIF v_last_activity::DATE < CURRENT_DATE THEN
    v_streak := v_streak + 1;  -- Nouveau jour
  END IF;

  UPDATE public.users
  SET xp_points = xp_points + p_xp,
      streak_days = v_streak,
      longest_streak = GREATEST(longest_streak, v_streak),
      last_activity_at = now()
  WHERE id = p_user_id;

  UPDATE public.sessions
  SET xp_earned = p_xp
  WHERE id = p_session_id;

  -- Vérifier badges (appelé par trigger ou application)
  PERFORM check_and_award_badges(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sélection intelligente des questions (évite les répétitions)
CREATE OR REPLACE FUNCTION select_questions_for_session(
  p_user_id UUID,
  p_module TEXT,
  p_test_type TEXT,
  p_level TEXT,
  p_count INTEGER
)
RETURNS TABLE(question_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT q.id
  FROM public.questions q
  WHERE q.module = p_module
    AND (q.test_type = p_test_type OR q.test_type = 'BOTH')
    AND q.level = p_level
    AND q.is_active = true
    AND q.id NOT IN (
      -- Exclure les 50 dernières questions déjà vues par l'utilisateur
      SELECT a.question_id
      FROM public.answers a
      JOIN public.sessions s ON a.session_id = s.id
      WHERE s.user_id = p_user_id
        AND s.module = p_module
        AND s.created_at > (now() - INTERVAL '30 days')
      ORDER BY a.created_at DESC
      LIMIT 50
    )
  ORDER BY
    -- Prioriser les questions moins vues et avec un taux d'échec élevé
    CASE WHEN q.success_rate IS NULL THEN 0 ELSE q.success_rate END ASC,
    q.times_used ASC,
    random()
  LIMIT p_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 8. Backend — Supabase Edge Functions (Deno)

### 8.1 Score QCM

```typescript
// supabase/functions/score-qcm/index.ts
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ScoreRequest {
  session_id: string
  answers: Record<string, string>    // questionId → réponse utilisateur
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })
  
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body: ScoreRequest = await req.json()
  const { session_id, answers } = body

  // Vérifier que la session appartient à l'utilisateur
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .eq('user_id', user.id)
    .single()

  if (!session) return new Response('Session not found', { status: 404 })

  // Vérifier le délai côté serveur
  const elapsedSeconds = Math.floor(
    (Date.now() - new Date(session.started_at).getTime()) / 1000
  )
  if (elapsedSeconds > session.max_duration_s + 30) {
    // Tolérance de 30 secondes pour la latence réseau
    return new Response('Session expired', { status: 410 })
  }

  // Récupérer les bonnes réponses
  const questionIds = Object.keys(answers)
  const { data: questions } = await supabase
    .from('questions')
    .select('id, correct_answer, module')
    .in('id', questionIds)

  if (!questions) return new Response('Questions not found', { status: 404 })

  // Calculer le score
  let correct = 0
  const answersToInsert = []

  for (const question of questions) {
    const userAnswer = answers[question.id]
    const isCorrect = userAnswer === question.correct_answer

    if (isCorrect) correct++

    answersToInsert.push({
      session_id,
      question_id: question.id,
      user_id: user.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
    })
  }

  const scorePercent = (correct / questions.length) * 100
  const xpEarned = Math.round(scorePercent * 2)  // 0–200 XP

  // Insérer les réponses en batch
  await supabase.from('answers').upsert(answersToInsert)

  // Mettre à jour la session
  const { data: updatedSession } = await supabase
    .from('sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_seconds: elapsedSeconds,
      score_auto: scorePercent,
      nclc_estimate: calculateNclc(scorePercent),
    })
    .eq('id', session_id)
    .select()
    .single()

  // Mettre à jour XP + streak
  await supabase.rpc('award_session_xp', {
    p_user_id: user.id,
    p_session_id: session_id,
    p_xp: xpEarned,
  })

  // Mettre à jour progress_stats
  await updateProgressStats(supabase, user.id, session, correct, questions.length)

  return new Response(JSON.stringify({
    score: scorePercent,
    correct,
    total: questions.length,
    xp_earned: xpEarned,
    nclc: updatedSession?.nclc_estimate,
    session_id,
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

function calculateNclc(scorePercent: number): string {
  if (scorePercent >= 90) return 'C2'
  if (scorePercent >= 75) return 'C1'
  if (scorePercent >= 60) return 'B2'
  if (scorePercent >= 45) return 'B1'
  if (scorePercent >= 30) return 'A2'
  return 'A1'
}

async function updateProgressStats(supabase: any, userId: string, 
    session: any, correct: number, total: number) {
  const { data: existing } = await supabase
    .from('progress_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('module', session.module)
    .eq('test_type', session.test_type)
    .single()

  const scorePercent = (correct / total) * 100
  if (existing) {
    const newAnswered = existing.questions_answered + total
    const newCorrect = existing.questions_correct + correct
    const newMastery = Math.min(
      100,
      existing.mastery_score * 0.7 + scorePercent * 0.3
    )
    await supabase.from('progress_stats').update({
      sessions_completed: existing.sessions_completed + 1,
      questions_answered: newAnswered,
      questions_correct: newCorrect,
      mastery_score: newMastery,
      avg_score: ((existing.avg_score || 0) * existing.sessions_completed + scorePercent) 
                  / (existing.sessions_completed + 1),
      best_score: Math.max(existing.best_score || 0, scorePercent),
      last_session_at: new Date().toISOString(),
    }).eq('user_id', userId).eq('module', session.module).eq('test_type', session.test_type)
  } else {
    await supabase.from('progress_stats').insert({
      user_id: userId,
      module: session.module,
      test_type: session.test_type,
      sessions_completed: 1,
      questions_answered: total,
      questions_correct: correct,
      mastery_score: scorePercent,
      avg_score: scorePercent,
      best_score: scorePercent,
      last_session_at: new Date().toISOString(),
    })
  }
}
```

### 8.2 Correction Expression Écrite (GPT-4o)

```typescript
// supabase/functions/correct-ee/index.ts
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

interface CorrectEERequest {
  answer_id: string
  session_id: string
  text: string
  task_type: 'message_informel' | 'texte_argumentatif' | 'lettre_formelle' | 'essai'
  test_type: 'TCF_CANADA' | 'TEF_CANADA'
  task_description: string
  target_words: { min: number; max: number }
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '')
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Vérifier que l'utilisateur a le droit à la correction IA
  const { data: userProfile } = await supabase
    .from('users')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', user.id)
    .single()

  const hasAccess = ['avance', 'premium', 'institutionnel'].includes(
    userProfile?.subscription_tier || ''
  ) && (
    !userProfile?.subscription_expires_at ||
    new Date(userProfile.subscription_expires_at) > new Date()
  )

  if (!hasAccess) return new Response('Subscription required', { status: 402 })

  const body: CorrectEERequest = await req.json()
  const wordCount = body.text.trim().split(/\s+/).length

  // Validation anti-fraude basique
  if (wordCount < 10) {
    return new Response(JSON.stringify({ error: 'Text too short' }), { status: 400 })
  }

  const systemPrompt = `Tu es un correcteur expert certifié pour les examens TCF Canada et 
TEF Canada (CECRL niveau B1 à C2). Tu corriges des productions écrites selon les critères 
officiels du CECRL.

Pour chaque rédaction, tu évalues sur ces 5 critères :
1. respect_tache : Respect de la tâche, du registre et des consignes
2. coherence : Cohérence et cohésion textuelle (connecteurs, structure, logique)
3. lexique : Richesse et précision lexicale (vocabulaire varié, pertinent, idiomatique)
4. morphosyntaxe : Correction morphosyntaxique (grammaire, conjugaison, accord)
5. conventions : Conventions d'écriture (ponctuation, majuscules, mise en page)

${body.test_type === 'TCF_CANADA' 
  ? 'Barème TCF : 0 à 4 points par critère (total : /20)'
  : 'Barème TEF : 0 à 100 points par critère (total : /450 pour les 4 premières, /50 pour conventions)'}

Retourne UNIQUEMENT un JSON valide avec cette structure :
{
  "criteres": {
    "respect_tache":  { "score": X, "commentaire": "..." },
    "coherence":      { "score": X, "commentaire": "..." },
    "lexique":        { "score": X, "commentaire": "..." },
    "morphosyntaxe":  { "score": X, "commentaire": "..." },
    "conventions":    { "score": X, "commentaire": "..." }
  },
  "score_global": X,
  "suggestions": ["...", "...", "..."],
  "points_forts": ["..."],
  "resume": "...",
  "nclc_estime": "B1|B2|C1|C2"
}`

  const userPrompt = `Tâche : ${body.task_description}

Type de tâche : ${body.task_type}
Nombre de mots demandé : ${body.target_words.min}–${body.target_words.max} mots
Nombre de mots produits : ${wordCount}

Texte du candidat :
---
${body.text}
---

Corrige et évalue ce texte selon les critères officiels.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    })

    const feedback = JSON.parse(completion.choices[0].message.content || '{}')

    // Sauvegarder dans la base de données
    await supabase.from('answers').update({
      user_answer: body.text,
      auto_feedback: feedback,
    }).eq('id', body.answer_id).eq('user_id', user.id)

    return new Response(JSON.stringify(feedback), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('OpenAI error:', error)
    return new Response(JSON.stringify({ error: 'Correction failed' }), { status: 500 })
  }
})
```

### 8.3 Transcription Expression Orale (Whisper)

```typescript
// supabase/functions/transcribe-eo/index.ts
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '')
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { answer_id, audio_storage_path, task_description, test_type } = body

  // 1. Télécharger l'audio depuis Supabase Storage
  const { data: audioData, error: storageError } = await supabase.storage
    .from('audio-responses')
    .download(audio_storage_path)

  if (storageError || !audioData) {
    return new Response('Audio not found', { status: 404 })
  }

  // 2. Transcription Whisper
  const audioFile = new File([audioData], 'recording.webm', { type: 'audio/webm' })

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'fr',
    response_format: 'verbose_json',
    temperature: 0,
  })

  const transcript = transcription.text

  // 3. Analyse GPT-4o de la transcription
  const analysisPrompt = `Tu es un correcteur expert pour les examens d'expression orale 
TCF Canada et TEF Canada. Analyse cette transcription de production orale et évalue-la 
selon les critères CECRL officiels.

Tâche : ${task_description}
Test : ${test_type}

Transcription automatique :
---
${transcript}
---

Retourne un JSON avec la même structure que pour l'EE (critères + score + suggestions).
Tiens compte que c'est une transcription automatique — des erreurs de transcription 
peuvent exister.`

  const analysis = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: analysisPrompt }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
    max_tokens: 1500,
  })

  const feedback = JSON.parse(analysis.choices[0].message.content || '{}')

  // 4. Sauvegarder
  await supabase.from('answers').update({
    audio_transcript: transcript,
    auto_feedback: feedback,
  }).eq('id', answer_id).eq('user_id', user.id)

  return new Response(JSON.stringify({ transcript, feedback }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 8.4 Webhook Stripe

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const PLAN_MAP: Record<string, string> = {
  'price_essentiel_monthly': 'essentiel',
  'price_essentiel_yearly': 'essentiel',
  'price_avance_monthly': 'avance',
  'price_avance_yearly': 'avance',
  'price_premium_monthly': 'premium',
  'price_premium_yearly': 'premium',
}

serve(async (req: Request) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const priceId = session.metadata?.price_id
      const plan = PLAN_MAP[priceId || ''] || 'essentiel'

      if (session.mode === 'subscription' && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const expiresAt = new Date(sub.current_period_end * 1000).toISOString()

        await supabase.from('users').update({
          subscription_tier: plan,
          subscription_expires_at: expiresAt,
          stripe_customer_id: session.customer as string,
        }).eq('id', userId)

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan,
          stripe_sub_id: sub.id,
          stripe_price_id: priceId,
          status: 'active',
          expires_at: expiresAt,
          amount_paid: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || 'EUR',
          platform: 'web',
        }, { onConflict: 'stripe_sub_id' })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      await supabase.from('users').update({
        subscription_tier: 'gratuit'
      }).eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('users').update({
        subscription_tier: 'gratuit',
        subscription_expires_at: null,
      }).eq('stripe_customer_id', sub.customer as string)

      await supabase.from('subscriptions').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      }).eq('stripe_sub_id', sub.id)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 9. API Design — Contrats et schémas

### 9.1 Endpoints principaux

```
BASE_URL: https://<project>.supabase.co

─── AUTH ─────────────────────────────────────────────────────────────
POST   /auth/v1/signup                    Inscription email + mdp
POST   /auth/v1/token?grant_type=password Connexion
POST   /auth/v1/token?grant_type=refresh  Rafraîchir le token
DELETE /auth/v1/logout                    Déconnexion
GET    /auth/v1/user                      Profil authentifié

─── PROFIL ───────────────────────────────────────────────────────────
GET    /rest/v1/users?id=eq.{id}          Récupérer profil
PATCH  /rest/v1/users?id=eq.{id}          Mettre à jour profil

─── QUESTIONS ────────────────────────────────────────────────────────
GET    /rest/v1/questions                 Liste avec filtres
  ?module=eq.CO&test_type=eq.TCF_CANADA&level=eq.C2&limit=30

POST   /functions/v1/select-session-questions   Sélection intelligente (sans répétitions)
  Body: { module, test_type, level, count }

─── SESSIONS ─────────────────────────────────────────────────────────
POST   /rest/v1/sessions                  Créer une session
GET    /rest/v1/sessions?user_id=eq.{id}  Historique
PATCH  /rest/v1/sessions?id=eq.{id}       Mettre à jour (abandon)
POST   /functions/v1/score-qcm            Soumettre + scorer QCM
POST   /functions/v1/correct-ee           Soumettre + corriger EE
POST   /functions/v1/transcribe-eo        Transcrire + analyser EO

─── PROGRESSION ──────────────────────────────────────────────────────
GET    /rest/v1/progress_stats?user_id=eq.{id}    Statistiques modules
GET    /rest/v1/user_badges?user_id=eq.{id}        Badges
GET    /rest/v1/notifications?user_id=eq.{id}      Notifications

─── PAIEMENTS ────────────────────────────────────────────────────────
POST   /functions/v1/create-checkout      Créer session Stripe Checkout
POST   /functions/v1/customer-portal      Portail client Stripe
POST   /functions/v1/stripe-webhook       Webhook Stripe (pas d'auth JWT)
POST   /functions/v1/revenuecat-webhook   Webhook RevenueCat

─── CORRECTIONS EXPERTES ─────────────────────────────────────────────
GET    /rest/v1/expert_corrections        File de corrections (expert)
PATCH  /rest/v1/expert_corrections?id=eq.{id}  Soumettre correction
```

### 9.2 Réponse rapport simulation

```json
{
  "session_id": "uuid",
  "test_type": "TCF_CANADA",
  "completed_at": "2026-05-24T14:30:00Z",
  "total_duration_minutes": 122,
  "global_score": 512,
  "nclc_estimate": "C1",
  "clb_estimate": "CLB 9-10",
  "modules": {
    "CO": { "score": 86.2, "correct": 25, "total": 29, "level": "C1" },
    "CE": { "score": 79.3, "correct": 23, "total": 29, "level": "B2" },
    "EE": { "score_auto": 74.0, "criteria": {
              "respect_tache": 3, "coherence": 3, "lexique": 4, 
              "morphosyntaxe": 3, "conventions": 3
            }},
    "EO": { "score_auto": 70.5, "transcript_available": true }
  },
  "radar": [
    { "module": "CO", "score": 86.2, "target": 90 },
    { "module": "CE", "score": 79.3, "target": 90 },
    { "module": "EE", "score": 74.0, "target": 90 },
    { "module": "EO", "score": 70.5, "target": 90 }
  ],
  "weak_themes": [
    { "theme": "Compréhension implicite", "module": "CE", "success_rate": 0.45 },
    { "theme": "Registre formel EO", "module": "EO", "success_rate": 0.52 }
  ],
  "xp_earned": 180,
  "badges_earned": [],
  "improvement_vs_last": { "CO": +3.2, "CE": -1.5, "EE": +8.0, "EO": +2.1 }
}
```

---

## 10. Authentification et gestion des sessions

### 10.1 Flux complet d'inscription

```typescript
// src/features/auth/useRegister.ts
export function useRegister() {
  const navigate = useNavigate()

  const register = async (formData: RegisterFormData) => {
    // 1. Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: formData.fullName,
          country: formData.country,
        }
      }
    })
    if (authError) throw authError

    // 2. Créer le profil utilisateur (déclenché aussi par trigger DB)
    await supabase.from('users').upsert({
      id: authData.user!.id,
      email: formData.email,
      full_name: formData.fullName,
      country: formData.country,
      target_test: formData.targetTest,
      exam_date: formData.examDate || null,
    })

    // 3. Lancer le test diagnostique
    navigate('/diagnostic')
  }

  return { register }
}
```

### 10.2 Test diagnostique initial

Le test diagnostique est déclenché à la fin de l'inscription. Il comporte 30 questions couvrant les 4 modules à différents niveaux (B1, B2, C1) et prend environ 20 minutes. À la fin :

- Le niveau CECRL détecté est stocké dans `users.level_assessed`
- Un parcours personnalisé est recommandé (modules prioritaires, niveau de départ)
- Un essai Premium+ de 7 jours est proposé

---

## 11. Modules pédagogiques — Spécifications techniques détaillées

### 11.1 Module CO — Architecture audio

```typescript
// src/features/co/COSessionManager.tsx
export function COSessionManager({ session }: { session: Session }) {
  const { questions, currentIndex, answers, submitAnswer, nextQuestion } = useSessionStore()
  const currentQuestion = questions[currentIndex]
  const { formattedTime, isWarning, isCritical } = useSessionTimer()

  // Préchargement audio des 3 prochaines questions
  useEffect(() => {
    const toPreload = questions.slice(currentIndex + 1, currentIndex + 4)
    toPreload.forEach(q => {
      if (q.audio_url) {
        const audio = new Audio(q.audio_url)
        audio.preload = 'auto'
        audio.load()
      }
    })
  }, [currentIndex, questions])

  const handleAnswer = (answer: string) => {
    submitAnswer(currentQuestion.id, answer)
    // Auto-avancement après 300ms (UX fluide)
    setTimeout(() => {
      if (currentIndex < questions.length - 1) nextQuestion()
    }, 300)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Barre de progression + timer */}
      <SessionHeader
        module="CO"
        current={currentIndex + 1}
        total={questions.length}
        timer={<Timer isWarning={isWarning} isCritical={isCritical} time={formattedTime} />}
      />
      
      {/* Lecteur audio */}
      <div className="flex-1 overflow-auto p-6">
        <AudioPlayer
          audioUrl={currentQuestion.audio_url!}
          maxListens={currentQuestion.max_listens || 2}
        />
        
        {/* Question + options */}
        <QcmQuestionWidget
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id]}
          onAnswerSelected={handleAnswer}
        />
      </div>
    </div>
  )
}
```

### 11.2 Module CE — Split-screen

```typescript
// src/features/ce/CESplitScreen.tsx
import { useState } from 'react'

export function CESplitScreen({ question }: { question: Question }) {
  const [activeTab, setActiveTab] = useState<'text' | 'questions'>('text')
  const isMobile = useBreakpoint('md') === false

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex border-b">
          {(['text', 'questions'] as const).map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors
                ${activeTab === tab 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500'}`}>
              {tab === 'text' ? 'Texte' : 'Questions'}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'text' 
            ? <ReadingPassage text={question.passage_text!} />
            : <QcmQuestionWidget question={question} onAnswerSelected={() => {}} />
          }
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6 h-full overflow-hidden">
      <div className="overflow-auto border-r border-gray-100 pr-6">
        <ReadingPassage text={question.passage_text!} />
      </div>
      <div className="overflow-auto">
        <QcmQuestionWidget question={question} onAnswerSelected={() => {}} />
      </div>
    </div>
  )
}
```

### 11.3 Simulation complète — Orchestrateur

```typescript
// src/features/simulation/SimulationOrchestrator.tsx
const SIMULATION_MODULES: Record<string, SimulationModule[]> = {
  TCF_CANADA: [
    { module: 'CO', duration: 35 * 60, count: 29, label: 'Compréhension de l\'Oral' },
    { module: 'CE', duration: 35 * 60, count: 29, label: 'Compréhension des Écrits' },
    { module: 'EE', duration: 60 * 60, count: 2,  label: 'Expression Écrite' },
    { module: 'EO', duration: 12 * 60, count: 3,  label: 'Expression Orale' },
  ],
  TEF_CANADA: [
    { module: 'CO', duration: 40 * 60, count: 60, label: 'Compréhension de l\'Oral' },
    { module: 'CE', duration: 60 * 60, count: 50, label: 'Compréhension des Écrits' },
    { module: 'EE', duration: 60 * 60, count: 2,  label: 'Expression Écrite' },
    { module: 'EO', duration: 35 * 60, count: 4,  label: 'Expression Orale' },
  ]
}

export function SimulationOrchestrator({ testType }: { testType: 'TCF_CANADA' | 'TEF_CANADA' }) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const modules = SIMULATION_MODULES[testType]
  const currentModule = modules[currentModuleIndex]

  // Activer le mode plein écran obligatoire
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } catch (e) {
        console.warn('Fullscreen not available')
      }
    }
    enterFullscreen()

    // Bloquer la sortie accidentelle
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.exitFullscreen()
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleModuleComplete = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1)
    } else {
      // Fin de la simulation
      navigate(`/results/${simulationSessionId}`)
    }
  }

  return (
    <div className="h-screen w-screen bg-white overflow-hidden flex flex-col">
      {/* Barre simulation */}
      <div className="bg-primary text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm">{testType.replace('_', ' ')}</span>
          <div className="flex gap-2">
            {modules.map((m, i) => (
              <div key={m.module}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${i < currentModuleIndex ? 'bg-green-500' 
                    : i === currentModuleIndex ? 'bg-white text-primary' 
                    : 'bg-white/20'}`}>
                {m.module}
              </div>
            ))}
          </div>
        </div>
        <div className="text-sm opacity-75">
          Épreuve {currentModuleIndex + 1}/{modules.length} · {currentModule.label}
        </div>
      </div>

      {/* Module actif */}
      <div className="flex-1 overflow-hidden">
        <CurrentModuleRenderer
          module={currentModule}
          testType={testType}
          onComplete={handleModuleComplete}
        />
      </div>
    </div>
  )
}
```


---

## 12. Système de correction IA (GPT-4o + Whisper)

Voir Section 8 pour les Edge Functions complètes. Récapitulatif du flux :

```
Expression Écrite (EE)
  ├── Utilisateur soumet texte dans le composant WritingEditor
  ├── POST /functions/v1/correct-ee
  │     ├── Vérification abonnement (avance/premium)
  │     ├── Validation texte (longueur, langue)
  │     ├── Prompt GPT-4o avec grille CECRL officielle
  │     └── JSON structuré → answers.auto_feedback
  └── Affichage du feedback avec animation par critère

Expression Orale (EO)
  ├── Enregistrement via AudioRecorder (WebRTC/native)
  ├── Upload Supabase Storage → answers.audio_storage_path
  ├── POST /functions/v1/transcribe-eo
  │     ├── Download depuis Storage
  │     ├── Whisper API → transcription FR
  │     ├── GPT-4o analyse la transcription
  │     └── JSON + transcript → answers table
  └── Affichage transcription + feedback avec replay audio
```

### Coûts IA estimés (par 1000 corrections)

| Opération | Modèle | Tokens | Coût estimé |
|---|---|---|---|
| Correction EE | GPT-4o | ~2 500 tok | 3,75 $ |
| Transcription EO (2 min) | Whisper-1 | 2 min audio | 0,05 $ |
| Analyse EO | GPT-4o | ~2 000 tok | 3,00 $ |
| **Total par 1000 utilisateurs** | | | **~6,80 $** |

---

## 13. Monétisation — Stripe et RevenueCat

### 13.1 Stripe — Configuration Web

```typescript
// supabase/functions/create-checkout/index.ts
import Stripe from 'https://esm.sh/stripe@14'

const PRICES: Record<string, Record<string, string>> = {
  essentiel:  { monthly: 'price_essentiel_m', yearly: 'price_essentiel_y' },
  avance:     { monthly: 'price_avance_m',    yearly: 'price_avance_y' },
  premium:    { monthly: 'price_premium_m',   yearly: 'price_premium_y' },
}

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
  const { plan, period, user_id, country, return_url } = await req.json()
  
  // Déterminer la réduction géographique
  const discounts = []
  const africaCountries = ['BJ','BF','CM','CI','SN','ML','TG','GN','NE','TD','GA','CG']
  if (africaCountries.includes(country)) {
    discounts.push({ coupon: 'AFRICA40' })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: PRICES[plan][period],
      quantity: 1,
    }],
    discounts,
    subscription_data: {
      trial_period_days: 7,     // Essai gratuit 7 jours
      metadata: { user_id, plan, period }
    },
    metadata: { user_id, plan, price_id: PRICES[plan][period] },
    success_url: `${return_url}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${return_url}/subscribe`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    locale: 'fr',
    customer_email: (await getUserEmail(user_id)),
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 13.2 RevenueCat — Mobile Flutter

```dart
// lib/features/subscription/services/revenuecat_service.dart
import 'package:purchases_flutter/purchases_flutter.dart';

class RevenueCatService {
  static const String _apiKeyAndroid = 'goog_...';
  static const String _apiKeyiOS = 'appl_...';

  static Future<void> initialize(String userId) async {
    await Purchases.setLogLevel(LogLevel.debug);
    
    PurchasesConfiguration config;
    if (Platform.isAndroid) {
      config = PurchasesConfiguration(_apiKeyAndroid);
    } else {
      config = PurchasesConfiguration(_apiKeyiOS);
    }
    config.appUserID = userId;
    
    await Purchases.configure(config);
  }

  static Future<CustomerInfo> getCustomerInfo() async {
    return await Purchases.getCustomerInfo();
  }

  static Future<List<Package>> getPackages() async {
    final offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  }

  static Future<CustomerInfo> purchase(Package package) async {
    final purchaseResult = await Purchases.purchasePackage(package);
    return purchaseResult;
  }

  static Future<CustomerInfo> restorePurchases() async {
    return await Purchases.restorePurchases();
  }

  static bool hasActiveSubscription(CustomerInfo info) {
    return info.entitlements.active.isNotEmpty;
  }

  static String? getActivePlan(CustomerInfo info) {
    if (info.entitlements.active.containsKey('premium')) return 'premium';
    if (info.entitlements.active.containsKey('avance')) return 'avance';
    if (info.entitlements.active.containsKey('essentiel')) return 'essentiel';
    return null;
  }
}
```

### 13.3 Projections de revenus

```
Hypothèse conservative — 12 mois après lancement

Mois 6 :
  5 000 utilisateurs actifs × 12% conversion = 600 payants
  Distribution : 40% Essentiel, 40% Avancé, 20% Premium+
  MRR = 240×9.99 + 240×19.99 + 120×34.99 = 2 398 + 4 798 + 4 199 = 11 395 €

Mois 12 :
  25 000 utilisateurs actifs × 18% conversion = 4 500 payants
  Distribution : 30% Essentiel, 45% Avancé, 25% Premium+
  MRR = 1350×9.99 + 2025×19.99 + 1125×34.99 = 13 487 + 40 480 + 39 364 = 93 331 €

Achats unitaires (estimation 5% des utilisateurs/mois) :
  Simulation 4.99€ + Corrections 7.99–9.99€ → +8 000 €/mois à 12 mois

ARR projeté mois 12 : ~1 200 000 €

Packs à durée limitée (revenus additionnels — marché Afrique) :
  Mois 6  : 500 packs vendus × prix moyen 25€ = 12 500 €
  Mois 12 : 2 000 packs vendus × prix moyen 28€ = 56 000 €
  (conversion en XOF : -40% réduction = meilleur taux d'accès Afrique)

Programme affiliation (20% commission) :
  Mois 12 : 50 affiliés actifs × 5 conv./mois × 30€ × 20% = 1 500 €/mois versés
  Levier acquisition : coût d'acquisition < 6€ (vs ~25€ via publicité payante)
```

### 13.4 Packs à durée limitée — Modèle alternatif aux abonnements

Alternative aux abonnements récurrents, ciblant particulièrement l'Afrique francophone
et les candidats avec une date d'examen proche. **Source de vérité serveur** : les tarifs
et quotas sont définis exclusivement dans l'Edge Function `activate-pack`, jamais côté client.

| Pack | EUR | FCFA | Durée | Essais IA | CO/CE | Simulations |
|---|---|---|---|---|---|---|
| 🥉 Bronze — Découverte  | 14,99 € | 9 800 FCFA  | 5 jours  | 3  | 40/40   | 1   |
| 🥈 Silver — Préparation | 29,99 € | 19 600 FCFA | 30 jours | 8  | 120/120 | 5   |
| 🥇 Gold — Intensif      | 49,99 € | 32 700 FCFA | 60 jours | 15 | 300/300 | 12  |
| 💎 Platinum — Champion  | 79,99 € | 52 300 FCFA | 90 jours | 30 | ∞       | ∞   |

**Tables SQL** : `exam_packs` (catalogue), `user_pack_subscriptions` (activation, quotas restants)

**Edge Functions** :
- `activate-pack` : validation JWT + pack_id + montant (anti-fraude ±0,5€/10 FCFA) → insert `user_pack_subscriptions` + update `users.active_pack_id`
- `fedapay-payment` : initiation paiement Mobile Money (FedaPay API v1, `send_now`)
- `fedapay-webhook` : webhook HMAC-SHA256 → idempotence → activation pack XOF

### 13.5 FedaPay — Paiement Mobile Money (Afrique)

**Fournisseur** : [FedaPay](https://docs.fedapay.com) — agrégateur Mobile Money francophone

**Méthodes supportées** :
| Code méthode         | Opérateur         | Pays principaux         |
|---|---|---|
| `orange_money_sn`    | Orange Money      | Sénégal                 |
| `orange_money_ci`    | Orange Money      | Côte d'Ivoire           |
| `orange_money_ml`    | Orange Money      | Mali                    |
| `mtn_open`           | MTN Mobile Money  | Cameroun, Congo, Ghana  |
| `moov_money`         | Moov Africa       | Burkina Faso, Togo, CI  |
| `wave_money`         | Wave              | Sénégal, Côte d'Ivoire  |

**Flux de paiement** :
```
1. Client sélectionne méthode + saisit numéro de téléphone
2. POST /functions/v1/fedapay-payment → FedaPay API : create transaction
3. FedaPay : PUT /transactions/{id}/send_now → notification USSD/push
4. Utilisateur confirme avec son code PIN Mobile Money
5. FedaPay → Webhook HTTPS → /functions/v1/fedapay-webhook
6. Vérification signature HMAC-SHA256 (header X-FedaPay-Signature)
7. Idempotence : check fedapay_transaction_id dans payment_attempts
8. Anti-fraude : vérification montant XOF (±10 FCFA tolérance)
9. Insert user_pack_subscriptions + update users.active_pack_id
10. Pack activé immédiatement
```

**Variables d'environnement requises** :
```
FEDAPAY_SECRET_KEY=sk_live_xxxx       # Clé API FedaPay production
FEDAPAY_WEBHOOK_SECRET=whsec_xxxx     # Secret pour vérification HMAC
APP_URL=https://ayeprep.com      # URL de retour après paiement
```

---

## 14. Gamification et progression

### 14.1 Système XP

| Action | XP accordé |
|---|---|
| Compléter un exercice CO/CE | score% × 1 (max 100) |
| Compléter un exercice EE/EO | 50 + bonus correction |
| Simulation complète | 200 XP |
| Streak quotidien | 10 × streak_days (max 100) |
| Premier badge | 50 XP |
| Score 100% sur un module | 150 XP |
| Parrainage actif | 200 XP |

### 14.2 Badges complets

```typescript
const BADGES_DEFINITION = [
  {
    slug: 'first-step',
    name: 'Premier Pas',
    description: 'Compléter le test diagnostique',
    rarity: 'common',
    condition: { type: 'diagnostic_completed' },
    xp_reward: 50,
  },
  {
    slug: 'week-warrior',
    name: 'Guerrier Hebdomadaire',
    description: '7 jours de streak consécutifs',
    rarity: 'common',
    condition: { type: 'streak_days', value: 7 },
    xp_reward: 100,
  },
  {
    slug: 'month-master',
    name: 'Maître du Mois',
    description: '30 jours de streak consécutifs',
    rarity: 'rare',
    condition: { type: 'streak_days', value: 30 },
    xp_reward: 500,
  },
  {
    slug: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Score 100% sur un module (5 fois)',
    rarity: 'rare',
    condition: { type: 'perfect_score_count', value: 5 },
    xp_reward: 300,
  },
  {
    slug: 'marathon',
    name: 'Marathonien',
    description: '10 simulations complètes',
    rarity: 'epic',
    condition: { type: 'simulation_count', value: 10 },
    xp_reward: 500,
  },
  {
    slug: 'speed-runner',
    name: 'Speed Runner',
    description: 'Terminer un module en moins de 50% du temps alloué',
    rarity: 'rare',
    condition: { type: 'time_percentage', value: 0.5 },
    xp_reward: 200,
  },
  {
    slug: 'co-expert',
    name: 'Expert CO',
    description: 'Taux de maîtrise >= 85% en Compréhension de l\'Oral',
    rarity: 'epic',
    condition: { type: 'mastery_score', module: 'CO', value: 85 },
    xp_reward: 400,
  },
  {
    slug: 'ce-expert',
    name: 'Expert CE',
    description: 'Taux de maîtrise >= 85% en Compréhension des Écrits',
    rarity: 'epic',
    condition: { type: 'mastery_score', module: 'CE', value: 85 },
    xp_reward: 400,
  },
  {
    slug: 'ee-expert',
    name: 'Expert EE',
    description: 'Score moyen >= 85% en Expression Écrite',
    rarity: 'epic',
    condition: { type: 'avg_score', module: 'EE', value: 85 },
    xp_reward: 400,
  },
  {
    slug: 'eo-expert',
    name: 'Expert EO',
    description: 'Score moyen >= 85% en Expression Orale',
    rarity: 'epic',
    condition: { type: 'avg_score', module: 'EO', value: 85 },
    xp_reward: 400,
  },
  {
    slug: 'master',
    name: 'Maître C2',
    description: 'Maîtrise >= 85% sur les 4 modules',
    rarity: 'legendary',
    condition: { type: 'all_mastery', value: 85 },
    xp_reward: 2000,
  },
  {
    slug: 'ambassador',
    name: 'Ambassadeur',
    description: '5 parrainages convertis',
    rarity: 'rare',
    condition: { type: 'referrals', value: 5 },
    xp_reward: 750,
  }
]
```

### 14.3 Composant badge animé

```typescript
// src/components/BadgeUnlock.tsx — Animation de déverrouillage
import { motion, AnimatePresence } from 'framer-motion'

export function BadgeUnlockToast({ badge }: { badge: Badge }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                   bg-primary text-white rounded-2xl shadow-2xl
                   px-6 py-4 flex items-center gap-4 min-w-80"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl"
        >
          🏅
        </motion.div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide opacity-75 mb-0.5">
            Badge débloqué !
          </p>
          <p className="font-bold text-lg leading-tight">{badge.name}</p>
          <p className="text-sm opacity-80">{badge.description}</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="ml-auto bg-yellow-400 text-yellow-900 rounded-full
                     px-2 py-1 text-xs font-bold whitespace-nowrap"
        >
          +{badge.xp_reward} XP
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## 15. Mode hors-ligne et synchronisation

### 15.1 Base SQLite Flutter (Drift)

```dart
// lib/shared/services/local_db/app_database.dart
import 'package:drift/drift.dart';

// Tables locales
class LocalQuestions extends Table {
  TextColumn get id => text()();
  TextColumn get module => text()();
  TextColumn get testType => text()();
  TextColumn get level => text()();
  TextColumn get questionText => text()();
  TextColumn get audioLocalPath => text().nullable()();
  TextColumn get passageText => text().nullable()();
  TextColumn get optionsJson => text().nullable()();
  TextColumn get correctAnswer => text().nullable()();
  TextColumn get explanation => text()();
  DateTimeColumn get downloadedAt => dateTime()();
  @override
  Set<Column> get primaryKey => {id};
}

class LocalSessions extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text()();
  TextColumn get sessionType => text()();
  TextColumn get module => text()();
  TextColumn get answersJson => text()();
  IntColumn get currentIndex => integer()();
  IntColumn get timeLeftSeconds => integer()();
  TextColumn get status => text()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime()();
}

@DriftDatabase(tables: [LocalQuestions, LocalSessions])
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.e);
  @override int get schemaVersion => 1;

  // Télécharger un module complet
  Future<void> downloadModule(String module, String testType, 
                               String level, List<Question> questions) async {
    await batch((batch) {
      batch.insertAllOnConflictUpdate(
        localQuestions,
        questions.map((q) => LocalQuestionsCompanion.insert(
          id: q.id,
          module: module,
          testType: testType,
          level: level,
          questionText: q.questionText,
          explanation: q.explanation,
          downloadedAt: DateTime.now(),
        )).toList(),
      );
    });
  }

  // Récupérer questions offline
  Future<List<LocalQuestion>> getOfflineQuestions(
      String module, String testType, String level, int count) {
    return (select(localQuestions)
      ..where((q) =>
          q.module.equals(module) &
          q.testType.equals(testType) &
          q.level.equals(level))
      ..orderBy([(q) => OrderingTerm.random()])
      ..limit(count)).get();
  }

  // Sauvegarder session en attente de sync
  Future<void> savePendingSession(SessionModel session) async {
    await into(localSessions).insertOnConflictUpdate(
      LocalSessionsCompanion.insert(
        id: session.id,
        userId: session.userId,
        sessionType: session.sessionType,
        module: session.module,
        answersJson: jsonEncode(session.answers),
        currentIndex: session.currentIndex,
        timeLeftSeconds: session.timeLeftSeconds,
        status: session.status,
        createdAt: DateTime.now(),
      ),
    );
  }
}
```

### 15.2 Sync automatique à la reconnexion

```dart
// lib/shared/services/sync_service.dart
class SyncService {
  final AppDatabase _db;
  final SupabaseClient _supabase;

  SyncService(this._db, this._supabase);

  Future<void> syncPendingSessions() async {
    final pendingSessions = await (_db.select(_db.localSessions)
      ..where((s) => s.isSynced.equals(false))).get();
    
    for (final session in pendingSessions) {
      try {
        final answers = jsonDecode(session.answersJson) as Map<String, dynamic>;
        
        // Envoyer les réponses au serveur
        await _supabase.functions.invoke('score-qcm', body: {
          'session_id': session.id,
          'answers': answers,
        });
        
        // Marquer comme synchronisé
        await (_db.update(_db.localSessions)
          ..where((s) => s.id.equals(session.id)))
          .write(LocalSessionsCompanion(isSynced: const Value(true)));
      } catch (e) {
        // Garder en attente si erreur réseau
        debugPrint('Sync failed for session ${session.id}: $e');
      }
    }
  }

  // Appelé à chaque reconnexion réseau
  void onConnectivityRestored() {
    syncPendingSessions();
  }
}
```

---

## 16. Animations et interactions UX

### 16.1 Design system — Tokens d'animation

```css
/* Variables CSS animations */
:root {
  --anim-fast:    150ms;
  --anim-base:    250ms;
  --anim-slow:    400ms;
  --anim-xslow:   600ms;

  --ease-out:     cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce:  cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 16.2 Animations React (Framer Motion)

```typescript
// src/lib/animations.ts — Variantes réutilisables
import type { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

export const questionSlide: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0
  }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0
  })
}

export const progressFill: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  })
}

export const scoreReveal: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  }
}

export const correctAnswer: Variants = {
  initial: { backgroundColor: 'white' },
  animate: {
    backgroundColor: ['white', '#dcfce7', '#f0fdf4'],
    borderColor: '#1E7145',
    transition: { duration: 0.5 }
  }
}
```

### 16.3 Confetti après réussite

```typescript
// src/components/SuccessConfetti.tsx
import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function SuccessConfetti({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return
    
    const duration = 3000
    const animationEnd = Date.now() + duration
    const colors = ['#1B3A6B', '#C55A11', '#2E75B6', '#1E7145', '#F59E0B']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < animationEnd) requestAnimationFrame(frame)
    }
    frame()
  }, [trigger])

  return null
}
```

### 16.4 Waveform animée (CSS)

```css
/* Waveform animée pendant enregistrement EO */
.waveform-recording {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 40px;
}

.waveform-recording__bar {
  width: 4px;
  border-radius: 2px;
  background: var(--color-error);
  animation: waveBar 1s ease-in-out infinite;
}

.waveform-recording__bar:nth-child(1) { animation-delay: 0.0s; height: 20%; }
.waveform-recording__bar:nth-child(2) { animation-delay: 0.1s; height: 40%; }
.waveform-recording__bar:nth-child(3) { animation-delay: 0.2s; height: 70%; }
.waveform-recording__bar:nth-child(4) { animation-delay: 0.3s; height: 100%; }
.waveform-recording__bar:nth-child(5) { animation-delay: 0.4s; height: 80%; }
.waveform-recording__bar:nth-child(6) { animation-delay: 0.5s; height: 60%; }
.waveform-recording__bar:nth-child(7) { animation-delay: 0.6s; height: 30%; }
.waveform-recording__bar:nth-child(8) { animation-delay: 0.7s; height: 50%; }

@keyframes waveBar {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
```

---

## 17. Interface d'administration (Back-office)

### 17.1 Dashboard administrateur

```typescript
// src/pages/admin/AdminDashboard.tsx — KPIs temps réel
export function AdminDashboard() {
  const { data: kpis } = useAdminKPIs()

  return (
    <div className="space-y-8">
      {/* KPIs en temps réel via Realtime */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Utilisateurs actifs (24h)"
          value={kpis?.active_24h || 0}
          trend="+12%"
          icon="👥"
        />
        <KPICard
          label="MRR"
          value={`${(kpis?.mrr || 0).toLocaleString('fr-FR')} €`}
          trend="+8%"
          icon="💶"
        />
        <KPICard
          label="Sessions aujourd'hui"
          value={kpis?.sessions_today || 0}
          trend="+25%"
          icon="📊"
        />
        <KPICard
          label="Corrections en attente"
          value={kpis?.pending_corrections || 0}
          trend={kpis?.pending_corrections > 20 ? '⚠️' : '✓'}
          icon="✍️"
        />
      </div>

      {/* File de corrections urgentes */}
      <ExpertCorrectionQueue />

      {/* Activité récente */}
      <RecentSessionsTable />
    </div>
  )
}
```

### 17.2 CRUD Banque de questions

```typescript
// src/pages/admin/QuestionManager.tsx
export function QuestionManager() {
  const [filters, setFilters] = useState({
    module: 'ALL',
    level: 'ALL',
    test_type: 'ALL',
    is_active: true,
  })
  const { data: questions, total } = useQuestions(filters)

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select label="Module" options={['CO','CE','EE','EO']} 
                value={filters.module} onChange={(v) => setFilters(f => ({...f, module: v}))} />
        <Select label="Niveau" options={['B1','B2','C1','C2']}
                value={filters.level} onChange={(v) => setFilters(f => ({...f, level: v}))} />
        <Select label="Test" options={['TCF_CANADA','TEF_CANADA','BOTH']}
                value={filters.test_type} onChange={(v) => setFilters(f => ({...f, test_type: v}))} />
        <Button onClick={() => openModal('create-question')}>
          + Nouvelle question
        </Button>
      </div>

      {/* Tableau */}
      <QuestionsTable
        questions={questions}
        onEdit={(q) => openModal('edit-question', q)}
        onToggle={(q) => toggleQuestion(q.id)}
        onDelete={(q) => confirmDelete(q)}
      />

      {/* Stats équilibrage */}
      <QuestionDistributionChart questions={questions} />
    </div>
  )
}
```

---

## 18. Sécurité et conformité RGPD

### 18.1 Checklist sécurité

```
✅ Row Level Security (RLS) sur TOUTES les tables
✅ TLS 1.3 sur toutes les communications (Supabase, Vercel, Cloudflare)
✅ URLs signées avec expiration pour Supabase Storage (audio EO)
✅ Clés API (OpenAI, Stripe) exclusivement dans Edge Functions — jamais client
✅ Stripe Radar activé pour détection fraude paiements
✅ MFA disponible pour rôles admin et expert
✅ JWT RS256 signé par Supabase Auth
✅ Rate limiting sur toutes les Edge Functions (Deno)
✅ Validation entrées serveur avant tout traitement (longueur, type, format)
✅ Validation durée session côté serveur (+30s tolérance réseau)
✅ Audit logs pour actions admin (Edge Function logs + Supabase Dashboard)
✅ Politiques CORS strictes (domaines autorisés uniquement)
✅ CSP headers sur Vercel (Content-Security-Policy)
✅ Dépendances scannées via Dependabot (GitHub)
✅ SAST via CodeQL (GitHub Actions)
```

### 18.2 Bannière consentement cookies (RGPD + ePrivacy)

Composant `CookieBanner` — présent sur toutes les pages via `App.tsx`.  
Conforme au **RGPD Art. 7**, à la **Directive ePrivacy 2002/58/CE** et à la **LPRPDE** (Canada).

**Fonctionnement** :
- Zustand store persisté dans `localStorage` (clé `fa-cookie-consent`)
- Interface : `{ decided, analytics, marketing, setConsent, acceptAll, rejectAll }`
- Trois actions : **Tout accepter** / **Enregistrer mes choix** (toggles granulaires) / **Tout refuser**
- Analytics (Mixpanel) et Marketing (Meta Pixel, Google Ads) désactivés par défaut
- Consentement persisté en base dans la table `cookie_consents` (avec IP, user_agent)
- **Pas de cookies analytics/marketing chargés** avant consentement explicite

**Table SQL** `cookie_consents` :
```sql
CREATE TABLE public.cookie_consents (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        REFERENCES public.users(id),
  session_fingerprint VARCHAR(64),   -- Pour visiteurs non connectés
  analytics          BOOLEAN     DEFAULT false,
  marketing          BOOLEAN     DEFAULT false,
  decided_at         TIMESTAMPTZ DEFAULT NOW(),
  ip_address         INET,
  user_agent         TEXT
);
```

### 18.3 Conformité RGPD / LPRPDE — Suppression de compte

```typescript
// Fonctionnalité "Supprimer mon compte" — RGPD Art. 17
// supabase/functions/delete-account/index.ts

serve(async (req) => {
  const supabase = createClient(...)
  const { user } = await supabase.auth.getUser(...)
  
  // 1. Anonymiser les données analytiques (ne pas supprimer pour statistiques)
  await supabase.from('sessions').update({
    user_id: '00000000-0000-0000-0000-000000000000',
  }).eq('user_id', user.id)
  
  // 2. Supprimer les données personnelles
  await supabase.storage.from('audio-responses').remove([`eo/${user.id}/`])
  await supabase.from('answers').delete().eq('user_id', user.id)
  await supabase.from('users').delete().eq('id', user.id)
  
  // 3. Annuler l'abonnement Stripe si actif
  if (stripeCustomerId) {
    await stripe.subscriptions.cancel(subscriptionId)
  }
  
  // 4. Supprimer le compte auth
  await supabase.auth.admin.deleteUser(user.id)
  
  return new Response(JSON.stringify({ deleted: true }))
})
```

### 18.4 Headers de sécurité (Vercel)

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(self), geolocation=()" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; connect-src 'self' https://*.supabase.co https://api.openai.com wss://*.supabase.co; media-src 'self' https://*.r2.dev https://*.cloudflare.com; frame-src https://js.stripe.com;"
        },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

---

## 19. Tests, CI/CD et DevOps

### 19.1 Stratégie de tests

```
Tests unitaires (Vitest + Jest Flutter)
  ├── Logique timer (blocage automatique, expiration)
  ├── Calcul score QCM (arrondi, cas limites)
  ├── Calcul NCLC à partir du score
  ├── Validation réponses (anti-fraude, longueur texte)
  └── Fonctions utilitaires (formatage temps, XP, streak)
  Couverture cible : ≥ 70%

Tests d'intégration
  ├── Edge Functions avec Supabase local (supabase start)
  ├── Flux inscription → test diagnostique → dashboard
  ├── Flux session CO : création → réponses → soumission → score
  ├── Flux paiement Stripe (mode test)
  └── Sync offline → reconnexion → résultats corrects

Tests End-to-End (Playwright Web + Flutter Integration Test)
  ├── Inscription complète + onboarding
  ├── Session CO : toutes les fonctionnalités audio
  ├── Session EE : compteur mots + sauvegarde auto + soumission
  ├── Simulation TCF complète (version rapide, x10 vitesse)
  ├── Paiement et déverrouillage fonctionnalités
  └── Mode hors-ligne complet (Flutter)

Tests de charge (k6)
  ├── 1 000 utilisateurs simultanés (baseline)
  ├── 5 000 utilisateurs simultanés (cible pré-lancement)
  ├── 10 000 utilisateurs simultanés (pic événement)
  ├── Scénario : création session + soumission + score
  └── SLA : p95 < 500ms, p99 < 1000ms, erreurs < 0.1%
```

### 19.2 Pipeline CI/CD GitHub Actions

```yaml
# .github/workflows/web-ci.yml
name: Web CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      - uses: codecov/codecov-action@v4

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          BASE_URL: http://localhost:4173
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: typescript }
      - uses: github/codeql-action/analyze@v3
      - run: npm audit --audit-level=high

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [test, e2e]
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      - run: npx vercel --token ${{ secrets.VERCEL_TOKEN }} --env staging

  deploy-production:
    runs-on: ubuntu-latest
    needs: [test, e2e, security]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: |
          supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}
          npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### 19.3 Variables d'environnement

```bash
# .env.example
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Public)
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Sentry
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Mixpanel
VITE_MIXPANEL_TOKEN=xxx

# App
VITE_APP_URL=https://ayeprep.com
VITE_APP_ENV=production

# Edge Functions uniquement (secrets Supabase)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FCM_SERVER_KEY=AAAAxxxx...
```

---

## 20. Performance et optimisation

### 20.1 Optimisations frontend Web

```
Code splitting    → Vite manualChunks par domaine fonctionnel
Images            → WebP + lazy loading + srcset responsive
Polices           → Préchargement + font-display: swap
Audio             → Préchargement des 3 questions suivantes (CO)
Service Worker    → Cache statique (PWA offline basique)
Réponses API      → SWR (stale-while-revalidate) via Supabase + react-query
Rendu             → Virtualisation liste (questions > 50) avec react-virtual
Bundle size       → Analyse avec vite-bundle-analyzer < 500KB gzippé
Lighthouse score  → Objectif ≥ 90 (mobile, 3G throttle)
```

### 20.2 Optimisations base de données

```sql
-- Index composites pour les requêtes les plus fréquentes
CREATE INDEX CONCURRENTLY idx_questions_session_select
  ON public.questions(module, test_type, level, is_active, times_used);

CREATE INDEX CONCURRENTLY idx_sessions_user_recent
  ON public.sessions(user_id, created_at DESC)
  WHERE status = 'completed';

CREATE INDEX CONCURRENTLY idx_answers_feedback_pending
  ON public.answers(session_id)
  WHERE auto_feedback IS NULL AND user_answer IS NOT NULL;

-- Pg_stat_statements pour identifier les requêtes lentes
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Partitioning answers par mois (quand volume > 1M lignes)
-- À implémenter en Phase 5
```

### 20.3 CDN et audio

```
Cloudflare R2 (stockage) → Cloudflare CDN (livraison globale)
├── Bucket : fa-audio-questions     (questions CO)
├── Bucket : fa-audio-responses     (réponses EO)
└── Bucket : fa-images              (avatars, badges, illustrations)

Configuration CDN :
  Cache-Control: public, max-age=31536000   (audio questions — immuable)
  Cache-Control: private, max-age=3600      (audio réponses — signé)
  
Formats :
  Audio questions  : MP3 128kbps (compatibilité maximale)
  Audio réponses   : WebM Opus (mobile) / MP3 (iOS Safari fallback)
  Images           : WebP + AVIF avec fallback JPEG/PNG
```

---

## 21. Roadmap détaillée — 5 phases sur 12 mois

### Phase 1 — Fondations (Mois 1–2)

**Livrable : Shell fonctionnel complet avec auth + paiement**

| Tâche | Responsable | Durée | Livrable |
|---|---|---|---|
| Monorepo GitHub + branches + CODEOWNERS | DevOps | 2j | Repo structuré |
| Supabase project setup + toutes les tables | Backend | 5j | BD versionnée |
| Row Level Security + politiques complètes | Backend | 3j | Sécurité BD |
| Supabase Auth (email + Google + Apple) | Backend | 3j | Auth fonctionnel |
| Design system Figma (tokens, composants) | Design | 8j | Figma complet |
| Tailwind design tokens + composants React | Frontend | 5j | Storybook |
| Landing page statique (HTML/CSS/JS) | Frontend | 4j | Déployée Vercel |
| Flutter theme + navigation + widgets base | Mobile | 5j | App shell iOS/Android |
| Stripe intégration Web (Checkout + Webhooks) | Backend | 4j | Paiement test OK |
| RevenueCat intégration Flutter | Mobile | 3j | IAP iOS/Android |
| Firebase FCM setup + notifications base | Backend | 2j | Push test OK |
| CI/CD GitHub Actions + Vercel + Fastlane | DevOps | 4j | Pipelines verts |

**Critères d'acceptation Phase 1 :**
- Inscription → connexion → dashboard vide → déconnexion : ≤ 3 clics
- Paiement test Stripe → subscription_tier mis à jour en < 10s
- Build iOS et Android passent sans erreurs (Fastlane)
- Lighthouse score landing page ≥ 90

---

### Phase 2 — Modules CO et CE (Mois 3–4)

**Livrable : Bêta fermée — 50 utilisateurs pilotes**

| Tâche | Durée | Livrable |
|---|---|---|
| Interface session QCM (React + Flutter) | 8j | QCM fonctionnel |
| Lecteur audio CO (waveform + compteur) | 5j | Audio CO OK |
| Split-screen CE (desktop + mobile tabs) | 4j | CE UI OK |
| Edge Function score-qcm | 3j | Score côté serveur |
| Sélection intelligente questions (sans répétitions) | 3j | Algo sélection |
| Interface résultats + explications détaillées | 5j | Rapport session |
| Banque : 300 questions CO (B1→C2, TCF+TEF) | Contenu | 14j | 300 questions |
| Banque : 300 questions CE (B1→C2, TCF+TEF) | Contenu | 14j | 300 questions |
| Onboarding + test diagnostique | 4j | Onboarding complet |
| Progression dashboard (graphiques simples) | 4j | Stats de base |

**Critères d'acceptation Phase 2 :**
- Session CO TCF (35 min, 39 QCM) : timer bloque automatiquement
- Compteur d'écoutes audio respecté et bloqué côté client ET validé serveur
- Score calculé côté Edge Function (pas côté client)
- 50 bêtatesteurs recrutés et onboardés

---

### Phase 3 — Modules EE et EO + IA (Mois 5–6)

**Livrable : Bêta publique — 500 utilisateurs, 4 modules complets**

| Tâche | Durée | Livrable |
|---|---|---|
| Interface EE (éditeur + compteur + sauvegarde auto) | 6j | EE Web + Mobile |
| Interface EO (enregistrement + waveform + upload) | 8j | EO Web + Mobile |
| Edge Function correct-ee (GPT-4o) | 4j | Correction IA EE |
| Edge Function transcribe-eo (Whisper + GPT-4o) | 4j | Transcription EO |
| Back-office expert (file + grille notation) | 6j | Interface expert |
| Workflow corrections humaines (email + FCM) | 3j | Notifications |
| Banque : 500 sujets EE (TCF + TEF) | Contenu | 14j | 500 sujets |
| Banque : 500 sujets EO (TCF + TEF) | Contenu | 14j | 500 sujets |
| Tests unitaires Edge Functions | 4j | Couverture 70% |
| Campagne bêta publique (500 utilisateurs) | Marketing | 7j | 500 inscrits |

**Critères d'acceptation Phase 3 :**
- Audio EO uploadé et transcrit en < 30 secondes
- Correction GPT-4o retourne JSON structuré par critère en < 20s
- Délai correction humaine EE < 48h (SLA respecté)

---

### Phase 4 — Simulations, progression, gamification (Mois 7–9)

**Livrable : Version complète — bêta large 5 000 utilisateurs**

| Tâche | Durée | Livrable |
|---|---|---|
| Simulation TCF complète (4 épreuves enchaînées) | 8j | Simulation TCF |
| Simulation TEF complète (4 épreuves enchaînées) | 5j | Simulation TEF |
| Rapport post-simulation (score NCLC + radar) | 6j | Rapport complet |
| Dashboard progression (graphiques + courbes) | 6j | Progression avancée |
| Système XP + badges (12+ badges) | 5j | Gamification |
| Mode hors-ligne Flutter (SQLite + sync) | 8j | Offline complet |
| Notifications push FCM (rappels + badges) | 3j | FCM opérationnel |
| Tests de charge k6 (1 000 → 5 000 users) | 4j | Rapport charges |
| Mode institutionnel (groupes + rapport école) | 6j | B2B fonctionnel |
| Banque : complément jusqu'à 2 000 questions | Contenu | 14j | 2 000 sujets |

**Critères d'acceptation Phase 4 :**
- Simulation TEF 3h15 : 4 épreuves enchaînées sans intervention utilisateur
- Module complet accessible et fonctionnel sans connexion après téléchargement
- k6 : 5 000 users simultanés, p95 < 500ms, erreurs < 0.1%

---

### Phase 5 — Lancement mondial (Mois 10–12)

**Livrable : Lancement public sur 3 plateformes**

| Tâche | Durée | Livrable |
|---|---|---|
| Tests de charge k6 — 10 000 utilisateurs | 5j | Validation charge |
| Audit sécurité (pentest externe) | 7j | Rapport audit |
| RGPD / LPRPDE : politique + fonctionnalités | 4j | Conformité légale |
| Accessibilité WCAG 2.1 AA (axe-core + tests manuels) | 5j | Rapport WCAG |
| Soumission App Store iOS + review | 7j | App Store Live |
| Soumission Google Play + review | 5j | Play Store Live |
| Blog, SEO, content marketing | Marketing | 10j | 20 articles |
| Campagne lancement (réseaux, email, influenceurs) | Marketing | 14j | 5 000 users J1 |
| Mixpanel + dashboard KPIs business | 4j | Analytics live |
| Support client (chat, FAQ, email) | Ops | 7j | Support opérationnel |

**Critères d'acceptation Phase 5 :**
- App Store, Google Play, Web : 3 plateformes disponibles simultanément
- Tests de charge validés à 10 000 utilisateurs simultanés
- Audit sécurité : 0 vulnérabilité critique ou haute non résolue
- WCAG 2.1 AA : score axe-core ≥ 95

---

## 22. Budget, outils et coûts mensuels

### 22.1 Coûts infrastructure (1 000 utilisateurs actifs)

| Service | Plan | Coût/mois |
|---|---|---|
| Supabase Cloud | Pro | 25 $ |
| Vercel | Pro | 20 $ |
| Cloudflare R2 + CDN | Pay-as-you-go | ~15 $ |
| Firebase FCM | Spark (gratuit < 500k/mois) | 0 $ |
| OpenAI (GPT-4o + Whisper) | Pay-as-you-go | ~50 $ |
| Stripe | 0% + 1,5% + 0,25€/transaction | Variable |
| RevenueCat | Starter (gratuit < 2 500 $/mois MTR) | 0 $ |
| Sentry | Team | 26 $ |
| Mixpanel | Growth | 28 $ |
| GitHub | Team | 4 $ |
| **Total infrastructure** | | **~170 $/mois** |

### 22.2 Outils de développement

| Outil | Usage | Coût |
|---|---|---|
| Figma | Design UI/UX | 45 €/mois (équipe) |
| Linear | Gestion de projet | 8 $/mois |
| Notion | Documentation | 0 $ (gratuit) |
| Postman | Tests API | 0 $ (gratuit) |
| VS Code + extensions | IDE | 0 $ |
| Android Studio | Flutter/Android | 0 $ |
| Xcode | Flutter/iOS | 0 $ (macOS requis) |

### 22.3 Coûts de production de contenu

| Type | Quantité | Coût estimé |
|---|---|---|
| Rédaction questions CO/CE (correcteurs) | 2 000 questions | 4 000–8 000 € |
| Enregistrements audio CO (studio) | 600 pistes | 3 000–6 000 € |
| Rédaction sujets EE/EO + corrigés | 1 000 sujets | 3 000–6 000 € |
| Révision pédagogique (expert CECRL) | 40h × 80€/h | 3 200 € |
| **Total contenu** | | **~13 000–23 000 €** |

---

## 23. Stratégie de contenu pédagogique C2

### 23.1 Architecture pédagogique pour atteindre C2

Pour qu'un utilisateur progresse de B2 vers C2, la banque de questions doit respecter une gradation stricte :

**Compréhension Orale C1/C2 :**
- Dialogues complexes avec sous-entendus et implicites culturels
- Monologues sur sujets abstraits (philosophie, économie, art)
- Accents régionaux marqués (québécois, belge, africain) + débit rapide
- Documents authentiques : émissions radio France Inter, RFI, ICI Radio-Canada
- Distinction C1/C2 : compréhension partielle vs totale, y compris les nuances

**Compréhension Écrite C1/C2 :**
- Textes académiques et spécialisés (médecine, droit, économie)
- Saisir les positions implicites et les registres multiples dans un même texte
- Humour, ironie, registre littéraire
- Questions de type inférentiel (jamais de copier-coller littéral de la réponse)

**Expression Écrite C2 :**
- Maîtrise parfaite des connecteurs logiques complexes (néanmoins, nonobstant, certes...mais)
- Richesse lexicale : synonymes recherchés, locutions verbales idiomatiques
- Structure argumentative sophistiquée : thèse → antithèse → synthèse
- Absence totale d'erreurs morphosyntaxiques éliminatoires
- Registre approprié maintenu sur toute la production

**Expression Orale C2 :**
- Spontanéité : pas d'hésitations répétées (euh, hm...)
- Reformulations fluides (en d'autres termes, autrement dit...)
- Maîtrise des nuances pragmatiques (politesse, atténuation, emphase)
- Discours nuancé sur des sujets complexes avec exemples pertinents

### 23.2 30 thèmes pédagogiques couverts

```
1.  Immigration et multiculturalisme (thème prioritaire TCF/TEF Canada)
2.  Vie quotidienne et logement au Québec
3.  Santé et système de soins canadien
4.  Environnement et développement durable
5.  Technologies numériques et société
6.  Économie et monde du travail
7.  Éducation et formation professionnelle
8.  Culture, arts et patrimoine francophone
9.  Actualité politique et citoyenneté
10. Sport et loisirs
11. Alimentation et gastronomie
12. Transports et mobilité urbaine
13. Famille et relations sociales
14. Voyages et tourisme
15. Sciences et recherche
16. Médias et communication
17. Justice et droit
18. Histoire francophone (France, Québec, Afrique)
19. Philosophie et éthique
20. Littérature et langue française
21. Musique et expression artistique
22. Architecture et urbanisme
23. Mondialisation et commerce
24. Géopolitique et relations internationales
25. Energie et ressources naturelles
26. Psychologie et comportement humain
27. Animaux et biodiversité
28. Astronomie et sciences de l'espace
29. Gastronomie et traditions culinaires
30. Humor, ironie et registres de langue
```

---

## 24. Contraintes absolues et règles de livraison

### 24.1 Règles fonctionnelles non négociables

1. **Durées d'épreuve inviolables** : CO TCF 35min, CO TEF 40min, CE TCF 35min, CE TEF 60min, EE 60min, EO TCF 12min, EO TEF 35min. Blocage automatique et soumission immédiate à expiration, validés côté serveur.

2. **Mode simulation immersif** : Fullscreen API obligatoire web, mode immersif Android, aucune navigation arrière possible, aucune aide, aucun correcteur d'orthographe, notifications système désactivées.

3. **Compteur d'écoutes bloquant (CO)** : TCF Canada = 2 écoutes maximum par document. TEF Canada = 1 à 2 selon la consigne. Vérifié côté client ET validé par l'Edge Function au moment de la soumission.

4. **Sécurité des données audio (EO)** : Audio uploadé immédiatement après chaque tâche, jamais stocké côté client au-delà de la session, URLs signées avec expiration 1h.

5. **Corrections IA uniquement via Edge Functions** : Aucun appel direct à OpenAI depuis le frontend. Aucune clé API dans le bundle JavaScript.

6. **Contenus 100% originaux** : Aucune épreuve officielle TCF/TEF reproduite. Tous les sujets, textes et enregistrements sont créés par l'équipe éditoriale.

### 24.2 Règles techniques de livraison

| Métrique | Minimum requis |
|---|---|
| Couverture tests logique critique | ≥ 70% |
| Lighthouse score mobile | ≥ 90 |
| Accessibilité WCAG 2.1 AA | Score axe-core ≥ 95 |
| Temps chargement initial (3G) | < 3 secondes |
| p95 latence API (normal load) | < 500ms |
| p95 latence API (10k users) | < 1000ms |
| Taux d'erreur serveur | < 0.1% |
| Uptime mensuel | ≥ 99.9% |

### 24.3 Définition de "Terminé" (Definition of Done)

Pour chaque fonctionnalité livrée :
- [ ] Développé + tests unitaires passants
- [ ] Revue de code par un pair (PR approuvée)
- [ ] Tests E2E passants sur la fonctionnalité
- [ ] Testé sur mobile iOS (iPhone 14 min) et Android (Pixel 6 min)
- [ ] Testé sur Chrome, Firefox, Safari desktop
- [ ] Accessible (navigation clavier + lecteur d'écran VoiceOver/TalkBack)
- [ ] Validé par le porteur de projet (Yaovi) sur environnement staging
- [ ] Documentation mise à jour (si applicable)
- [ ] Déployé en production via pipeline CI/CD

---

## 25. Packs à durée limitée et paiement Mobile Money (FedaPay)

> Voir aussi : Section 13.4 et 13.5 pour la configuration technique détaillée.

### 25.1 Logique métier des packs

Les packs sont une **alternative one-shot** aux abonnements récurrents. Ils ciblent :
- Les candidats avec une date d'examen proche (5 à 90 jours)
- Les utilisateurs d'Afrique francophone (pricing FCFA −40%)
- Les personnes sans carte bancaire internationale (paiement Mobile Money)

**Règle fondamentale** : la définition des packs (prix, durée, quotas) n'existe **que côté serveur**
dans les Edge Functions `activate-pack` et `fedapay-webhook`. Le frontend ne peut pas
manipuler les montants ni les quotas. Toute tentative de paiement avec un montant différent
de ±0,5 € (ou ±10 FCFA) est rejetée.

### 25.2 Gestion des quotas

À chaque utilisation d'une fonctionnalité pakée, le décomptage se fait dans `user_pack_subscriptions` :

```sql
-- Décrémentation sécurisée d'un essai IA (avec vérification)
UPDATE public.user_pack_subscriptions
SET ai_trials_remaining = ai_trials_remaining - 1
WHERE user_id = $1
  AND status = 'active'
  AND expires_at > NOW()
  AND ai_trials_remaining > 0   -- Jamais en dessous de 0
  AND pack_id = $2
RETURNING ai_trials_remaining;
-- Si aucune ligne retournée → accès refusé
```

Valeur `-1` = illimité (Pack Platinum). Vérification côté client (UX) et côté serveur (sécurité).

### 25.3 Expiration automatique

Un cron quotidien (ou Edge Function schedulée) passe les abonnements expirés en `status = 'expired'` :

```sql
UPDATE public.user_pack_subscriptions
SET status = 'expired'
WHERE expires_at < NOW() AND status = 'active';

-- Nettoyer le profil utilisateur si l'abonnement expiré était le dernier actif
UPDATE public.users u
SET active_pack_id = NULL, pack_expires_at = NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_pack_subscriptions ups
  WHERE ups.user_id = u.id AND ups.status = 'active' AND ups.expires_at > NOW()
)
AND u.active_pack_id IS NOT NULL;
```

---

## 26. Programme d'affiliation

### 26.1 Vue d'ensemble

Programme de commissions 20% pour influenceurs, YouTubeurs et partenaires francophones.

| Élément | Valeur |
|---|---|
| Commission | 20% du montant HT de chaque achat |
| Attribution | First-click, TTL 30 jours (localStorage) |
| Seuil de paiement | 50 € minimum |
| Méthodes de paiement | Virement SEPA, Mobile Money |
| Tableau de bord | Vue `affiliate_dashboard` (SQL) |

### 26.2 Flux technique complet

```
1. Affilié crée son lien : https://ayeprep.com/?ref=MAMADOU15
2. Visiteur clique → AffiliateTracker.tsx détecte ?ref=MAMADOU15
3. useAffiliateTracking() → localStorage (fa_affiliate_code, TTL 30j)
4. Edge Function track-affiliate → RPC track_affiliate_click()
   → INSERT affiliate_clicks (affiliate_id, code, page_url, ip, user_agent)
   → UPDATE affiliates.total_clicks++
5. Visiteur s'inscrit → RegisterPage lit getStoredAffiliateCode()
6. À l'inscription → RPC convert_affiliate_click(click_id, user_id)
   → UPDATE affiliate_clicks SET converted = true
   → UPDATE users SET affiliate_code = 'MAMADOU15'
   → UPDATE affiliates.total_conversions++
7. Visiteur achète un pack → INSERT affiliate_conversions
   → commission_eur = amount_eur × commission_rate
   → UPDATE affiliates.total_earned_eur += commission_eur
8. Admin verse la commission selon le seuil
```

### 26.3 Tables SQL du programme

```sql
-- Affiliés (partenaires)
affiliates (id, user_id, name, email, code UNIQUE, commission_rate, 
            total_clicks, total_conversions, total_earned_eur, 
            payment_method, is_active)

-- Clics sur liens affiliés
affiliate_clicks (id, affiliate_id, affiliate_code, page_url, referrer_url,
                  ip_address, user_agent, converted, converted_user_id)

-- Conversions (achats ayant généré une commission)
affiliate_conversions (id, affiliate_id, converted_user_id, 
                        amount_eur, commission_eur, paid_at)

-- Vue tableau de bord affilié
affiliate_dashboard (id, name, code, commission_rate, total_clicks,
                     total_conversions, conversion_rate_pct, 
                     total_earned_eur, is_active)
```

### 26.4 Helpers frontend (hook useAffiliateTracking)

```typescript
// Fonctions exportées depuis hooks/useAffiliateTracking.ts

// Récupérer le code affilié (pour l'inclure à l'inscription)
getStoredAffiliateCode(): string | null

// Récupérer l'ID du clic (pour la conversion)
getStoredAffiliateClickId(): string | null

// Effacer après conversion réussie
clearAffiliateData(): void

// Hook principal — monter dans App.tsx via <AffiliateTracker />
useAffiliateTracking(): void
```

---

## 27. Parcours d'apprentissage personnalisé

### 27.1 Concept

La table `learning_plans` stocke un plan journalier JSON généré automatiquement
selon la durée choisie (30/60/90 jours), le niveau actuel et le niveau cible.

### 27.2 Génération du plan

Le plan est généré côté frontend (LearningPathPage) selon un cycle rotatif :
```
Cycle 7 jours : CO → CE → EE → EO → REPOS → CO → SIMULATION
```

Chaque tâche (`DayTask`) contient :
```typescript
interface DayTask {
  day: number
  module: 'CO' | 'CE' | 'EE' | 'EO' | 'SIMULATION' | 'REPOS'
  label: string       // Description de la tâche
  duration_min: number
  done: boolean       // Mis à jour en temps réel
}
```

Le champ `daily_plan` est stocké en JSONB dans PostgreSQL et mis à jour à chaque coche.

### 27.3 Fonctionnalités de la page /parcours

- **Formulaire de création** : date d'examen (optionnel), niveau cible (B2/C1/C2), durée (30/60/90j)
- **Vue "7 prochains jours"** : affiche les tâches autour de la progression actuelle
- **Vue "Tout voir"** : calendrier complet des N jours
- **Tâche du jour** : mise en avant avec CTA direct vers le module concerné
- **Progression** : barre de complétion + stats (jours complétés, simulations faites)
- **Countdown** : jours restants avant l'examen (si date renseignée)
- **Persistance** : chaque coche → UPDATE immédiat en base via Supabase

### 27.4 Intégration avec les packs

La page affiche un encart de mise à niveau vers un pack si l'utilisateur n'a pas
accès aux corrections IA (essais `ai_trials_remaining = 0`) ou aux simulations complètes.

---

## 28. Pages SEO et outils gratuits

### 28.1 Stratégie SEO — Pages de destination à haute intention

| Page | Route | Mot-clé principal | Schéma JSON-LD |
|---|---|---|---|
| Landing | `/` | "préparer TCF Canada" | EducationalOrganization + FAQPage |
| Calculateur NCLC | `/calculateur-nclc` | "calculateur NCLC Canada" | WebApplication |
| Comparaison | `/tcf-vs-tef-canada` | "différence TCF TEF Canada" | Article |
| Test rapide | `/test-rapide` | "test niveau français gratuit" | — |
| Packs | `/packs` | "TCF Canada prix préparation" | — |
| Témoignages | `/reussites` | "avis ayePREP" | — |

### 28.2 Données structurées Schema.org (LandingPage)

Deux blocs JSON-LD injectés via `dangerouslySetInnerHTML` dans le `<head>` :

**EducationalOrganization** :
```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "ayePREP",
  "description": "Plateforme n°1 de préparation au TCF Canada et TEF Canada.",
  "url": "https://ayeprep.com",
  "inLanguage": "fr",
  "sameAs": ["https://www.youtube.com/@ayeprep"],
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer support" }
}
```

**FAQPage** (6 questions) :
- Nombre de questions au TCF Canada (réponse correcte : **39 QCM** CO, **39 QCM** CE)
- Différence TCF Canada vs TEF Canada
- Conversion score → NCLC
- Fonctionnement correction IA
- Paiement FCFA / Mobile Money
- Mode hors-ligne

### 28.3 Calculateur NCLC (/calculateur-nclc)

Tables de correspondance officielles IRCC intégrées directement dans le frontend
(TCF Canada et TEF Canada, 9 bandes de score par module, 4 modules chacun).

Règle IRCC : le niveau NCLC global = **minimum des 4 modules**. Affiché clairement.

### 28.4 Page témoignages (/reussites)

Social proof structuré avec 6 témoignages :
- Avant/après (niveau CECRL + score NCLC obtenu)
- Durée de préparation
- Pays d'origine + ville d'immigration au Canada
- Statistiques globales : **94% de réussite**, **+1,8 niveaux** en 45-60j, **4 800+ candidats**

### 28.5 Test rapide (/test-rapide)

5 questions démo (CO + CE niveau B2), sans inscription requise.
Estimation NCLC basée sur le score (0-1 → NCLC 6, 2 → 7, 3 → 8, 4 → 9, 5 → NCLC 10+).
CTA vers `/register` après résultats.

---

## 29. Conformité RGPD avancée — Bannière cookies

> Voir aussi : Section 18.2 pour la description technique.

### 29.1 Catégories de cookies

| Catégorie | Obligatoire | Contenu | Outil |
|---|---|---|---|
| Essentiels | ✅ Toujours actifs | Auth (supabase-auth-token), préférences UI | Supabase |
| Analytics | ❌ Opt-in | Sessions, pages vues, entonnoir conversion | Mixpanel |
| Marketing | ❌ Opt-in | Retargeting, attribution publicité | Meta Pixel, Google Ads |

### 29.2 Implémentation React

```typescript
// store Zustand persisté — src/components/CookieBanner.tsx
interface CookieStore {
  decided: boolean          // L'utilisateur a fait un choix
  analytics: boolean        // Consentement analytics
  marketing: boolean        // Consentement marketing
  setConsent: (analytics: boolean, marketing: boolean) => void
  acceptAll: () => void
  rejectAll: () => void
}

// Persisté dans localStorage sous 'fa-cookie-consent'
// Consentement JAMAIS forcé — décision préalable requise
// Mixpanel.init() appelé UNIQUEMENT si analytics === true
// Meta Pixel / gtag.js chargés UNIQUEMENT si marketing === true
```

### 29.3 Droits RGPD implémentés

| Droit | Implémentation |
|---|---|
| Art. 7 — Consentement | Bannière cookies granulaire (opt-in par catégorie) |
| Art. 13/14 — Information | Politique de confidentialité + mentions légales |
| Art. 17 — Droit à l'oubli | Edge Function `delete-account` (suppression + anonymisation) |
| Art. 20 — Portabilité | Export JSON des données utilisateur (ProfilePage) |
| LPRPDE — Canada | Même niveau de protection que RGPD |

---

## 30. Changelog et historique des versions

### Version 3.0 — Mai 2026 *(version courante)*

**Nouvelles fonctionnalités implémentées** :

#### Monétisation
- ✅ Packs à durée limitée (Bronze/Silver/Gold/Platinum) — modèle alternatif aux abonnements
- ✅ SubscribePage.tsx — onglets "Abonnements" et "Packs à durée limitée"
- ✅ ExamPacksPage.tsx — page publique `/packs` avec toggle EUR/FCFA
- ✅ Edge Function `activate-pack` — activation sécurisée avec anti-fraude côté serveur
- ✅ Edge Function `fedapay-payment` — initiation paiement Mobile Money (FedaPay API v1)
- ✅ Edge Function `fedapay-webhook` — traitement callback avec HMAC-SHA256 + idempotence
- ✅ Migration SQL 002 — tables `exam_packs`, `user_pack_subscriptions`
- ✅ Migration SQL 003 — table `payment_attempts` (idempotence, suivi statuts)

#### SEO et pages publiques
- ✅ NclcCalculatorPage.tsx — calculateur NCLC interactif (tables officielles IRCC)
- ✅ ComparisonPage.tsx — comparaison TCF vs TEF Canada (Schema.org Article)
- ✅ QuickTestPage.tsx — test de niveau gratuit en 5 questions (lead magnet)
- ✅ HelpCenterPage.tsx — centre d'aide avec recherche plein texte
- ✅ RefundPage.tsx — politique de remboursement (RGPD + ePrivacy)
- ✅ SuccessStoriesPage.tsx — témoignages candidats avec stats (94% réussite)
- ✅ Schema.org JSON-LD (EducationalOrganization + FAQPage) dans LandingPage

#### Parcours et gamification
- ✅ LearningPathPage.tsx — parcours 30/60/90 jours avec plan journalier interactif
- ✅ Table SQL `learning_plans` (JSONB daily_plan, completed_days)
- ✅ Génération automatique du plan (cycle CO·CE·EE·EO·REPOS·CO·SIMULATION)
- ✅ Lien "Mon parcours" ajouté dans PrivateLayout nav

#### Programme d'affiliation
- ✅ Hook `useAffiliateTracking` — tracking first-click `?ref=CODE` (TTL 30 jours)
- ✅ Composant `AffiliateTracker` — monté globalement dans App.tsx
- ✅ Edge Function `track-affiliate` — RPC Supabase, idempotence, IP anonymisée
- ✅ Tables SQL `affiliates`, `affiliate_clicks`, `affiliate_conversions`
- ✅ Fonctions SQL `track_affiliate_click()` et `convert_affiliate_click()`
- ✅ Vue SQL `affiliate_dashboard`
- ✅ Migration SQL 003 — tables + fonctions tracking affilié

#### UX et support
- ✅ WhatsAppButton.tsx — bouton flottant (+1 506 253 6067), délai 3s, online indicator
- ✅ CookieBanner.tsx — consentement RGPD/ePrivacy (analytics + marketing, opt-in)
- ✅ Route `/reussites` — page témoignages publique
- ✅ Route `/parcours` — page parcours privée (requiert auth)

#### Corrections factuelles critiques
- ✅ **TCF Canada CO : 39 QCM** (et non 29) — corrigé dans LandingPage, planning, schémas
- ✅ **TCF Canada CE : 39 QCM** (et non 29) — corrigé dans toute la documentation
- ✅ Mockup hero : "Question 7 / 39" (corrigé dans LandingPage.tsx et francophoniafinal.md)

---

### Version 2.0 — Mai 2026

- Architecture Supabase + React + Flutter complète
- Modules CO, CE, EE, EO avec correction IA GPT-4o + Whisper
- Système de gamification (XP, streaks, badges)
- Mode hors-ligne Flutter
- Interface admin et espace expert
- Stripe + RevenueCat intégration
- Dashboard progression avancé

### Version 1.0 — Avril 2026

- Version initiale du plan de développement
- Spécifications fonctionnelles et techniques de base

---

## Annexe A — Variables d'environnement complètes

```bash
# === SUPABASE ===
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Edge Functions uniquement
SUPABASE_DB_URL=                 # Migrations CLI

# === OPENAI ===
OPENAI_API_KEY=                  # Edge Functions uniquement

# === STRIPE ===
VITE_STRIPE_PUBLIC_KEY=          # Frontend
STRIPE_SECRET_KEY=               # Edge Functions uniquement
STRIPE_WEBHOOK_SECRET=           # Edge Function stripe-webhook
STRIPE_COUPON_AFRICA40=          # ID coupon réduction Afrique
STRIPE_COUPON_STUDENT30=         # ID coupon étudiant

# === REVENUECAT ===
REVENUECAT_API_KEY_ANDROID=      # Mobile
REVENUECAT_API_KEY_IOS=          # Mobile
REVENUECAT_WEBHOOK_SECRET=       # Edge Function

# === FEDAPAY (Mobile Money Afrique) ===
FEDAPAY_SECRET_KEY=              # Clé API FedaPay production (sk_live_xxxx)
FEDAPAY_WEBHOOK_SECRET=          # Secret HMAC-SHA256 pour webhook
APP_URL=https://ayeprep.com # URL callback après paiement Mobile Money

# === FIREBASE ===
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
FCM_SERVER_KEY=                  # Edge Function notifications

# === CLOUDFLARE ===
CF_R2_ACCOUNT_ID=
CF_R2_ACCESS_KEY_ID=
CF_R2_SECRET_ACCESS_KEY=
CF_CDN_URL=                      # https://audio.ayeprep.com

# === MONITORING ===
VITE_SENTRY_DSN=
VITE_MIXPANEL_TOKEN=

# === APP ===
VITE_APP_URL=https://ayeprep.com
VITE_APP_ENV=production
```

## Annexe B — Glossaire technique

| Terme | Définition |
|---|---|
| CECRL | Cadre Européen Commun de Référence pour les Langues (A1→C2) |
| CLB | Canadian Language Benchmarks (1→12) — équivalent canadien du CECRL |
| NCLC | Niveaux de compétence linguistique canadiens — version française des CLB |
| TCF | Test de Connaissance du Français — géré par France Éducation International |
| TEF | Test d'Évaluation de Français — géré par la CCI Paris Île-de-France |
| RLS | Row Level Security — sécurité au niveau des lignes PostgreSQL |
| Edge Function | Fonction serverless exécutée au plus près de l'utilisateur (Deno/V8) |
| QCM | Questionnaire à Choix Multiple (4 options A/B/C/D) |
| CO | Compréhension de l'Oral — épreuve d'écoute |
| CE | Compréhension des Écrits — épreuve de lecture |
| EE | Expression Écrite — épreuve de rédaction |
| EO | Expression Orale — épreuve de production orale |
| MRR | Monthly Recurring Revenue — revenu récurrent mensuel |
| SWR | Stale-While-Revalidate — stratégie de cache HTTP |
| CDN | Content Delivery Network — réseau de distribution de contenu |
| PWA | Progressive Web App — application web installable |
| BaaS | Backend as a Service — Supabase dans notre cas |
| IAP | In-App Purchase — achats intégrés (RevenueCat) |
| FCM | Firebase Cloud Messaging — notifications push |
| NCLC | Niveaux de compétence linguistique canadiens (1–12, IRCC) |
| CLB | Canadian Language Benchmarks — version anglophone des NCLC |
| FCFA | Franc CFA — monnaie commune de 14 pays d'Afrique francophone |
| FedaPay | Agrégateur Mobile Money francophone (Orange Money, MTN, Wave, Moov) |
| XOF | Code ISO 4217 du Franc CFA Ouest-africain (1 EUR ≈ 656 XOF) |
| First-click | Attribution au premier clic — standard tracking affiliation |
| TTL | Time To Live — durée de validité d'un cookie ou token localStorage |
| HMAC | Hash-based Message Authentication Code — sécurité webhook FedaPay |
| Idempotence | Propriété d'une opération : exécutée N fois, même résultat que 1 fois |
| DayTask | Tâche journalière dans un parcours d'apprentissage (interface TypeScript) |
| JSON-LD | JavaScript Object Notation for Linked Data — format Schema.org SEO |
| ePrivacy | Directive européenne 2002/58/CE sur les cookies et communications électroniques |
| LPRPDE | Loi canadienne sur la Protection des Renseignements Personnels et Documents Électroniques |

---

*ayePREP — Plan Full-Stack Complet v3.0*  
*Rédigé par un développeur full-stack senior — Mai 2026*  
*Dernière mise à jour : Mai 2026 — Ajout packs FedaPay, affiliation, parcours, SEO, RGPD*
*Contact porteur de projet : ayebouyaovi@gmail.com*  
*Pour toute question technique avant de démarrer : contacter Yaovi*

