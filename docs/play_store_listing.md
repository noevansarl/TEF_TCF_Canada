# Fiche Google Play Store — ayePREP

## Nom de l'application (max 30 caractères)
```
ayePREP: TCF TEF Canada
```
*(23 caractères — laisse de la marge, inclut les mots-clés les plus recherchés dès le titre, ce qui compte fortement pour le référencement Play Store/ASO)*

Alternative si tu préfères garder le nom de marque en tête :
```
ayePREP - Prépa TCF/TEF
```

## Description courte (max 80 caractères)
```
Préparez le TCF/TEF Canada : simulations, corrections IA, calcul NCLC/CRS
```
*(74 caractères)*

## Description complète (max 4000 caractères)

```
🍁 ayePREP est la plateforme n°1 de préparation au TCF Canada et au TEF Canada, conçue pour les candidats à l'immigration Entrée Express qui doivent obtenir le NCLC 7 ou 9 en français.

POURQUOI AYEPREP ?

Rater son examen de français, c'est 300 € (ou 200 000 FCFA) de frais d'inscription perdus et 3 mois d'attente pour repasser. ayePREP vous prépare comme si c'était le vrai jour J, avec le format officiel 2026 strict.

✅ SIMULATIONS AU FORMAT OFFICIEL 2026
39 questions en Compréhension Orale, 39 en Compréhension Écrite, 3 tâches d'Expression Écrite, chronomètre identique aux conditions réelles d'examen.

✅ CORRECTION IA INSTANTANÉE
Soumettez vos rédactions et vos réponses orales : notre IA vous corrige en 20 secondes selon les grilles officielles CECRL (respect de la consigne, richesse du vocabulaire, morphosyntaxe, cohérence).

✅ CALCULATEUR NCLC & SIMULATEUR CRS INTÉGRÉS
Convertissez vos scores TCF/TEF en niveau NCLC officiel et découvrez combien de points CRS vous rapportent en Entrée Express — jusqu'à 50 points bonus grâce au français.

✅ PLUS DE 2000 QUESTIONS
Une bibliothèque de sujets couvrant tous les niveaux (B1 à C2) pour les quatre modules : Compréhension Orale, Compréhension Écrite, Expression Écrite et Expression Orale.

✅ SUIVI DE PROGRESSION PERSONNALISÉ
Identifiez vos points faibles module par module et suivez votre évolution jusqu'au niveau NCLC visé.

✅ PARCOURS ADAPTATIFS 30 OU 60 JOURS
Un plan de révision structuré selon votre date d'examen et votre niveau de départ.

POUR QUI ?

- Candidats à l'immigration canadienne via Entrée Express cherchant à maximiser leurs points CRS grâce au français
- Candidats devant présenter le TCF Canada ou le TEF Canada dans les prochaines semaines
- Toute personne souhaitant évaluer et améliorer son niveau de français selon le CECRL

ayePREP est un organisme indépendant de préparation linguistique. Les marques TCF et TEF appartiennent à leurs organismes respectifs.

Téléchargez ayePREP dès maintenant et préparez-vous comme si c'était le vrai jour J.
```

## Catégorie
**Éducation** (catégorie principale sur Play Console)

## Tags / mots-clés ASO à cibler dans le titre/description
tcf canada, tef canada, nclc, crs, entrée express, immigration canada, test de français, préparation examen, cecrl, français canada

## Coordonnées (obligatoire)
- **Email de contact** : support@ayeprep.com (déjà utilisé comme adresse support réelle sur le site)
- **Site web** : https://ayeprep.com
- **Politique de confidentialité** : https://ayeprep.com/confidentialite (déjà en ligne)

## Icône (512x512, PNG 32-bit avec alpha) — ✅ prêt
`docs/play_store_assets/icon-512.png` — générée à partir du vrai logo ayePREP (recadrée sur l'emblème toque + A pour rester lisible en petite taille).

## Feature graphic (1024x500, obligatoire) — ✅ prêt
`docs/play_store_assets/feature-graphic-1024x500.png` — drapeau canadien + logo + message clé, cohérent avec la charte marketing existante.

## Captures d'écran (min. 2, recommandé 4-8, format téléphone 16:9 ou 9:16) — ⏳ restant
Aucune disponible actuellement — nécessite de lancer l'app sur un émulateur/téléphone Android pour les capturer. C'est le seul asset visuel manquant avant de pouvoir soumettre la fiche complète.

## Autres sections à compléter directement dans Play Console (ne peuvent pas être préparées à l'avance)
- Questionnaire de classification du contenu — voir suggestion ci-dessous
- Public cible et contenu — public visé : 18 ans et plus (candidats à l'immigration), pas de contenu destiné aux enfants
- Formulaire "Sécurité des données" — voir détails ci-dessous
- Déclaration Annonces : **Non**, l'app n'affiche aucune publicité

## Suggestion pour le questionnaire de classification du contenu (IARC)
Pas de violence, contenu sexuel, drogue, jeux d'argent ni langage grossier. Réponds "Non" à toutes les questions de contenu sensible. Devrait aboutir à une classification **"Tout public" / PEGI 3**.

## Formulaire "Sécurité des données" — permissions réelles vérifiées dans l'APK compilé
Permissions détectées : `INTERNET`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`, `POST_NOTIFICATIONS`, `VIBRATE`, `RECORD_AUDIO` (enregistrement des réponses orales EO), `com.google.android.c2dm.permission.RECEIVE` (notifications push Firebase), `com.android.vending.BILLING` (achats in-app).
Aucune permission caméra, localisation, contacts ou stockage de fichiers.

**Données collectées et leur usage :**
| Type de donnée | Collectée ? | Usage | Partagée avec un tiers ? |
|---|---|---|---|
| Adresse e-mail | Oui | Authentification, communication | Non (sauf Supabase en tant que sous-traitant technique) |
| Nom | Oui | Personnalisation du profil | Non |
| ID utilisateur | Oui | Fonctionnement du compte | Non |
| Activité dans l'app (scores, progression) | Oui | Fonctionnalité principale (suivi pédagogique) | Non |
| Enregistrements audio (réponses orales EO) | Oui | Correction IA, fonctionnalité principale | Oui — envoyé à un service d'IA tiers (OpenAI) pour la correction |
| Historique d'achats | Oui | Gestion de l'abonnement | Oui — Google Play Billing / FedaPay (traitement du paiement) |
| Localisation, contacts, photos, santé | Non | — | — |

**Chiffrement en transit :** Oui (HTTPS/TLS, Supabase).
**Suppression des données :** Oui — les utilisateurs peuvent demander la suppression complète de leur compte et de leurs données via le site web (ayeprep.com → Profil → "Supprimer mon compte"), fonctionnalité déjà active. Lien à fournir dans le formulaire : `https://ayeprep.com/profile`.
