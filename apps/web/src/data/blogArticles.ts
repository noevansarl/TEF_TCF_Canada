export interface BlogPostSection {
  type: 'paragraph' | 'heading-2' | 'heading-3' | 'list' | 'quote' | 'demo-box' | 'cta'
  content?: string
  items?: string[] // For lists
  demoQuestionId?: string // For showcasing specific module exercises
}

export interface BlogPost {
  slug: string
  title: string
  metaDescription: string
  category: 'TCF Canada' | 'TEF Canada' | 'Immigration' | 'Conjugaison & Grammaire' | 'NCLC'
  publishedAt: string
  readingTimeMin: number
  author: {
    name: string
    role: string
    avatarUrl?: string
  }
  image: string
  excerpt: string
  sections: BlogPostSection[]
  faqs: { q: string; a: string }[]
}

export const BLOG_ARTICLES: BlogPost[] = [
  {
    slug: 'tcf-canada-guide-complet',
    title: 'Guide complet du TCF Canada épreuve par épreuve',
    metaDescription: 'Tout savoir sur le TCF Canada en 2026 : structure des 4 épreuves (CO, CE, EE, EO), barème NCLC, durées officielles et conseils pour réussir.',
    category: 'TCF Canada',
    publishedAt: '27 Mai 2026',
    readingTimeMin: 8,
    author: {
      name: 'Maud Gauthier',
      role: 'Directrice Pédagogique, Expert CECRL',
    },
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60',
    excerpt: 'Découvrez la structure officielle du TCF Canada. De la Compréhension Orale à l\'Expression Orale, apprenez à maîtriser chaque épreuve pour maximiser vos points NCLC.',
    sections: [
      {
        type: 'paragraph',
        content: 'Le Test de Connaissance du Français (TCF) Canada est un examen standardisé conçu spécifiquement pour répondre aux exigences d\'Immigration, Réfugiés et Citoyenneté Canada (IRCC). Que vous visiez l\'Entrée Express ou d\'autres programmes provinciaux, obtenir un score élevé en français est le moyen le plus efficace de booster votre dossier.'
      },
      {
        type: 'heading-2',
        content: 'La structure officielle du TCF Canada'
      },
      {
        type: 'paragraph',
        content: 'L\'examen dure au total 2 heures et 22 minutes et comporte 4 épreuves obligatoires. Contrairement à d\'autres examens, le TCF Canada se passe généralement sur ordinateur pour les épreuves écrites, tandis que l\'oral se déroule en face-à-face avec un examinateur.'
      },
      {
        type: 'list',
        items: [
          'Compréhension de l\'Oral (CO) : 39 questions à choix multiples (QCM) · 35 minutes · Écoute audio unique ou double selon la tâche.',
          'Compréhension des Écrits (CE) : 39 questions à choix multiples (QCM) · 35 minutes · Lecture de documents administratifs, d\'opinions et littéraires.',
          'Expression Écrite (EE) : 3 tâches de rédaction · 60 minutes · Lettre d\'opinion, courriel formel, essai comparatif.',
          'Expression Orale (EO) : 3 tâches individuelles · 12 minutes · Entretien dirigé, jeu de rôle (interaction), monologue argumentatif.'
        ]
      },
      {
        type: 'heading-2',
        content: 'Zoom sur les épreuves de compréhension (CO & CE)'
      },
      {
        type: 'paragraph',
        content: 'Pour les QCM de compréhension écrite et orale, les questions sont classées par ordre de difficulté progressive (du niveau A1 au niveau C2 du CECRL). Les 39 questions de chaque module doivent être complétées dans le temps imparti. Une bonne gestion du temps (54 secondes par question en moyenne) est la clé de la réussite.'
      },
      {
        type: 'demo-box',
        demoQuestionId: 'demo-1'
      },
      {
        type: 'heading-2',
        content: 'L\'Expression Écrite : 60 minutes pour convaincre'
      },
      {
        type: 'paragraph',
        content: 'L\'épreuve d\'Expression Écrite du TCF Canada comprend 3 tâches distinctes. Vous devez respecter scrupuleusement la consigne de longueur (nombre de mots requis) pour éviter des pénalités sévères.'
      },
      {
        type: 'list',
        items: [
          'Tâche 1 (minimum 60 mots) : Rédaction d\'un message court pour décrire ou raconter un événement (ex : inviter un ami par courriel).',
          'Tâche 2 (minimum 120 mots) : Rédaction d\'un article ou d\'une lettre pour donner son opinion et justifier ses arguments.',
          'Tâche 3 (minimum 120 mots) : Synthèse et comparaison de deux points de vue divergents sur un sujet de société.'
        ]
      },
      {
        type: 'quote',
        content: 'Astuce d\'expert : Ne perdez pas trop de temps sur la Tâche 1. La Tâche 3 est celle qui démontre votre esprit d\'analyse et votre morphosyntaxe de niveau C1/C2. Répartissez votre temps ainsi : 10 min (Tâche 1), 20 min (Tâche 2), 30 min (Tâche 3).'
      },
      {
        type: 'heading-2',
        content: 'L\'Expression Orale : Un face-à-face rapide de 12 minutes'
      },
      {
        type: 'paragraph',
        content: 'L\'Expression Orale est souvent l\'épreuve la plus redoutée car elle est enregistrée et se déroule en direct. Elle évalue votre capacité à communiquer spontanément en français. Elle est découpée en 3 tâches :'
      },
      {
        type: 'list',
        items: [
          'Tâche 1 (2 min, sans préparation) : Entretien dirigé où vous vous présentez et parlez de vos goûts ou de votre quotidien.',
          'Tâche 2 (5 min, dont 2 min de préparation) : Jeu de rôle dans une situation de la vie quotidienne où vous devez poser des questions et obtenir des informations auprès de l\'examinateur.',
          'Tâche 3 (4 min, sans préparation) : Monologue suivi où vous exposez votre point de vue argumenté sur un sujet controversé.'
        ]
      },
      {
        type: 'cta',
        content: 'Commencez à vous entraîner dès aujourd\'hui avec nos simulations interactives du TCF Canada.'
      }
    ],
    faqs: [
      {
        q: 'Combien de temps sont valables les résultats du TCF Canada ?',
        a: 'Les résultats sont valables pendant 2 ans à compter de la date de passage de l\'examen. Assurez-vous de soumettre votre profil d\'immigration avant leur expiration.'
      },
      {
        q: 'Le TCF Canada pénalise-t-il les mauvaises réponses ?',
        a: 'Non, il n\'y a pas de points négatifs pour les mauvaises réponses au TCF Canada. Il est donc recommandé de répondre à toutes les questions, même si vous hésitez.'
      }
    ]
  },
  {
    slug: 'tcf-vs-tef-canada-express-entry',
    title: 'TEF Canada vs TCF Canada : Le comparatif ultime pour l\'Express Entry',
    metaDescription: 'Quel examen de français choisir entre le TCF Canada et le TEF Canada pour immigrer ? Comparatif complet des épreuves, des durées et des avantages.',
    category: 'Immigration',
    publishedAt: '20 Mai 2026',
    readingTimeMin: 6,
    author: {
      name: 'Pierre Le Grand',
      role: 'Consultant en Immigration Agréé',
    },
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60',
    excerpt: 'Vous hésitez entre le TCF et le TEF Canada pour votre projet d\'immigration ? Découvrez les différences réelles de format pour faire le meilleur choix selon votre profil.',
    sections: [
      {
        type: 'paragraph',
        content: 'Pour immigrer au Canada via l\'Entrée Express ou obtenir la résidence permanente au Québec, prouver ses compétences en français est capital. IRCC accepte deux examens : le TCF Canada et le TEF Canada. Bien qu\'ils mènent tous deux aux mêmes équivalences NCLC, leurs formats diffèrent significativement.'
      },
      {
        type: 'heading-2',
        content: 'Tableau comparatif rapide'
      },
      {
        type: 'paragraph',
        content: 'Voici une vue d\'ensemble des différences fondamentales entre les deux examens en 2026 :'
      },
      {
        type: 'list',
        items: [
          'TCF Canada : Durée 2h22 · CO : 39 QCM (35 min) · CE : 39 QCM (35 min) · EE : 3 tâches (60 min) · EO : 3 tâches (12 min).',
          'TEF Canada : Durée 3h15 · CO : 60 QCM (40 min) · CE : 50 QCM (60 min) · EE : 2 rédactions (60 min) · EO : 4 tâches (35 min).'
        ]
      },
      {
        type: 'heading-2',
        content: 'Compréhension Écrite : Plus de temps pour le TEF Canada'
      },
      {
        type: 'paragraph',
        content: 'L\'épreuve de Compréhension Écrite du TEF dure 60 minutes pour 50 questions, alors que celle du TCF dure seulement 35 minutes pour 39 questions. Si vous lisez lentement mais possédez une bonne capacité de concentration sur la durée, le TEF Canada peut s\'avérer plus confortable car il offre un rythme légèrement moins rapide.'
      },
      {
        type: 'heading-2',
        content: 'Expression Orale : L\'épreuve courte du TCF vs le jeu de rôle du TEF'
      },
      {
        type: 'paragraph',
        content: 'C\'est la différence majeure qui oriente le choix de la majorité des candidats :'
      },
      {
        type: 'list',
        items: [
          'Au TCF Canada, l\'oral dure 12 minutes. Les questions s\'enchaînent rapidement avec un examinateur bienveillant, et la préparation est minime.',
          'Au TEF Canada, l\'oral dure 35 minutes. Il repose sur deux grands jeux de rôles interactifs où vous devez convaincre l\'examinateur d\'acheter un service ou de faire une activité. C\'est une épreuve de communication théâtrale.'
        ]
      },
      {
        type: 'quote',
        content: 'Recommandation : Si vous êtes timide ou peu à l\'aise avec l\'improvisation et la négociation, le format court du TCF Canada (12 min) est généralement conseillé. Si vous aimez argumenter et défendre un point de vue de manière dynamique, le TEF valorisera vos compétences.'
      },
      {
        type: 'heading-2',
        content: 'Expression Écrite : 2 tâches (TEF) vs 3 tâches (TCF)'
      },
      {
        type: 'paragraph',
        content: 'Le TEF Canada comporte uniquement 2 rédactions en 60 minutes : la section A (faits divers à poursuivre) et la section B (lettre argumentative). Le TCF Canada vous demande 3 tâches en 60 minutes, ce qui impose un rythme plus soutenu de rédaction et de relecture.'
      },
      {
        type: 'cta',
        content: 'Quel que soit votre choix, testez vos compétences gratuitement grâce à notre test d\'orientation.'
      }
    ],
    faqs: [
      {
        q: 'Quel est l\'examen le plus facile entre TCF et TEF ?',
        a: 'Il n\'y a pas d\'examen objectivement plus facile. Le TCF est plus court et son oral est plus rapide, ce qui convient aux personnes anxieuses à l\'oral. Le TEF accorde plus de temps pour l\'écrit, ce qui avantage ceux qui aiment approfondir leur lecture.'
      },
      {
        q: 'Les centres d\'examens facturent-ils le même prix ?',
        a: 'Les frais d\'inscription varient d\'un centre à l\'autre, mais ils se situent généralement entre 350 $ et 440 $ CAD pour les deux tests.'
      }
    ]
  },
  {
    slug: 'comment-obtenir-nclc-9-points-crs',
    title: 'Comment obtenir le niveau NCLC 9 en français et gagner 50 points CRS',
    metaDescription: 'Découvrez la stratégie pour décrocher le niveau NCLC 9 au TCF/TEF Canada et débloquer les 50 points de bonus bilingue pour l\'Express Entry.',
    category: 'NCLC',
    publishedAt: '15 Mai 2026',
    readingTimeMin: 7,
    author: {
      name: 'Maud Gauthier',
      role: 'Directrice Pédagogique, Expert CECRL',
    },
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60',
    excerpt: 'Atteindre le NCLC 9 dans les 4 compétences du TCF ou TEF Canada est le sésame pour l\'Entrée Express. Voici le plan d\'action détaillé pour y parvenir en 30 jours.',
    sections: [
      {
        type: 'paragraph',
        content: 'Dans le système CRS (Comprehensive Ranking System) d\'Express Entry, le français n\'est plus seulement une compétence optionnelle, c\'est un levier d\'immigration massif. En obtenant un niveau NCLC 9 (Niveau de Compétence Linguistique Canadien) dans les quatre épreuves obligatoires, vous débloquez un bonus automatique de 50 points, transformant instantanément vos chances de sélection.'
      },
      {
        type: 'heading-2',
        content: 'Qu\'est-ce que le NCLC 9 en pratique ?'
      },
      {
        type: 'paragraph',
        content: 'Le niveau NCLC 9 correspond à un niveau d\'utilisateur avancé autonome (C1 dans l\'échelle européenne du CECRL). Pour l\'obtenir, vous devez atteindre les scores minimaux suivants :'
      },
      {
        type: 'list',
        items: [
          'TCF Canada : Un score minimum de 349 en Compréhension Orale, 348 en Compréhension Écrite, et 14 (sur 20) en Expression Écrite et Expression Orale.',
          'TEF Canada : Un score minimum de 280 en Compréhension Orale, 233 en Compréhension Écrite, 233 en Expression Écrite, et 233 en Expression Orale.'
        ]
      },
      {
        type: 'heading-3',
        content: 'La règle du maillon faible d\'IRCC'
      },
      {
        type: 'paragraph',
        content: 'Attention ! IRCC applique la règle de la compétence la plus basse. Si vous obtenez NCLC 10 en CO, CE et EE, mais NCLC 8 en EO, votre score global d\'anglais/français sera calculé sur la base du NCLC 8. Vous devez impérativement obtenir un minimum de NCLC 9 dans CHAQUE module pour débloquer les points bonus.'
      },
      {
        type: 'heading-2',
        content: 'La stratégie en 3 étapes pour viser le NCLC 9'
      },
      {
        type: 'paragraph',
        content: 'Pour passer d\'un niveau intermédiaire (B2) à un niveau avancé (C1/NCLC 9) en moins de deux mois, vous devez structurer vos révisions :'
      },
      {
        type: 'list',
        items: [
          'Étape 1 : Passer un test diagnostique. Identifiez immédiatement votre compétence la moins robuste pour y consacrer 60% de votre temps d\'entraînement.',
          'Étape 2 : Maîtriser le codage et les grilles CECRL. Les examinateurs évaluent les rédactions (EE) et l\'oral (EO) selon des grilles très strictes. Vous devez utiliser des connecteurs logiques avancés (en outre, nonobstant, d\'autant plus que...) et un vocabulaire riche.',
          'Étape 3 : Effectuer des simulations réelles. L\'épreuve de Compréhension Orale requiert une grande concentration. Entraînez-vous avec des audios uniques sans pouvoir faire de pause, comme le jour de l\'examen.'
        ]
      },
      {
        type: 'demo-box',
        demoQuestionId: 'demo-3'
      },
      {
        type: 'quote',
        content: 'Le conseil de la directrice pédagogique : L\'Expression Écrite est souvent le module où les candidats ratent le NCLC 9 de peu (ex: un score de 13/20 au lieu de 14/20). La cause principale ? Les fautes d\'inattention grammaticales simples (accords des participes passés, conjugaisons au subjonctif). Relisez-vous systématiquement 5 minutes en fin d\'épreuve.'
      },
      {
        type: 'cta',
        content: 'Simulez vos points Express Express avec notre simulateur CRS interactif et visualisez l\'impact du NCLC 9.'
      }
    ],
    faqs: [
      {
        q: 'Puis-je combiner les résultats de deux examens TCF différents ?',
        a: 'Non, vous ne pouvez pas combiner les scores de deux sessions d\'examens différentes pour soumettre un dossier Express Entry. Les 4 épreuves doivent provenir du même certificat d\'examen.'
      },
      {
        q: 'Combien de points bonus le français apporte-t-il si je parle déjà anglais ?',
        a: 'Si vous avez déjà des compétences en anglais (CLB 5 ou plus), le NCLC 9 en français vous apporte 50 points additionnels au titre de la transférabilité linguistique.'
      }
    ]
  },
  {
    slug: 'regles-de-grammaire-expression-ecrite',
    title: 'Les 5 règles de grammaire indispensables pour l\'Expression Écrite',
    metaDescription: 'Améliorez votre score d\'Expression Écrite au TCF/TEF Canada. Les 5 règles grammaticales indispensables (subjonctif, participes passés, connecteurs logiques) pour viser le NCLC 9.',
    category: 'Conjugaison & Grammaire',
    publishedAt: '05 Mai 2026',
    readingTimeMin: 5,
    author: {
      name: 'Maud Gauthier',
      role: 'Directrice Pédagogique, Expert CECRL',
    },
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60',
    excerpt: 'Pour obtenir NCLC 9 ou 10 à l\'Expression Écrite, maîtriser le lexique ne suffit pas. Voici les 5 structures grammaticales avancées à placer dans vos rédactions pour impressionner les correcteurs.',
    sections: [
      {
        type: 'paragraph',
        content: 'Lors des épreuves d\'Expression Écrite du TCF et du TEF Canada, les correcteurs certifiés analysent vos textes selon la grille d\'évaluation CECRL. Le critère "Correction morphosyntaxique" pèse lourd dans votre note finale. Placer des structures de phrase complexes et exemptes d\'erreurs est le meilleur moyen de valider votre niveau C1/C2.'
      },
      {
        type: 'heading-2',
        content: '1. Le subjonctif après les expressions d\'obligation et de doute'
      },
      {
        type: 'paragraph',
        content: 'Le subjonctif est le mode de la complexité par excellence en français. Montrez que vous le maîtrisez en l\'associant à des tournures impersonnelles ou de concession dans vos lettres d\'opinion.'
      },
      {
        type: 'list',
        items: [
          'À utiliser : "Il convient que le gouvernement prenne des mesures..." (prendre au subjonctif).',
          'À utiliser : "Bien que ce projet comporte des risques, il est essentiel qu\'on l\'étudie..." (comporter à l\'indicatif, étudier au subjonctif).'
        ]
      },
      {
        type: 'heading-2',
        content: '2. L\'accord du participe passé avec l\'auxiliaire avoir'
      },
      {
        type: 'paragraph',
        content: 'C\'est l\'erreur la plus classique qui fait perdre des points précieux aux candidats de niveau B2/C1. Rappelez-vous que le participe passé conjugué avec "avoir" s\'accorde en genre et en nombre avec le COD si celui-ci est placé AVANT le verbe.'
      },
      {
        type: 'list',
        items: [
          'Exemple incorrect : "Les propositions que le maire a accepté sont intéressantes."',
          'Exemple correct : "Les propositions (féminin pluriel) que le maire a acceptées (accord ées) sont intéressantes."'
        ]
      },
      {
        type: 'heading-2',
        content: '3. Les connecteurs logiques de concession et d\'opposition avancés'
      },
      {
        type: 'paragraph',
        content: 'Évitez de répéter "mais" ou "pourtant". Utilisez des connecteurs de niveau C1 pour articuler vos paragraphes argumentatifs.'
      },
      {
        type: 'list',
        items: [
          'Néanmoins / Toutefois : introduisent une nuance élégante.',
          'Nonobstant : signifie "malgré" et s\'associe à un nom (ex : nonobstant ces arguments, la mesure reste contestable).',
          'Certes... toutefois : une structure de concession académique très appréciée.'
        ]
      },
      {
        type: 'heading-2',
        content: '4. La condition et l\'hypothèse complexe'
      },
      {
        type: 'paragraph',
        content: 'Ne vous limitez pas aux phrases avec "si + présent". Montrez que vous maîtrisez le conditionnel passé pour exprimer un regret ou une hypothèse non réalisée dans le passé.'
      },
      {
        type: 'list',
        items: [
          'Structure C1 : "Si les pouvoirs publics avaient investi plus tôt (plus-que-parfait), la crise aurait été évitée (conditionnel passé)."'
        ]
      },
      {
        type: 'heading-2',
        content: '5. La tournure passive et les pronoms relatifs complexes'
      },
      {
        type: 'paragraph',
        content: 'L\'utilisation de pronoms relatifs composés (auquel, de laquelle, sur lesquels) permet de fluidifier votre style et d\'éviter les répétitions répétitives.'
      },
      {
        type: 'list',
        items: [
          'Exemple : "La cause pour laquelle de nombreuses personnes manifestent est juste."',
          'Exemple : "Les dossiers sur lesquels repose mon étude ont été archivés."'
        ]
      },
      {
        type: 'cta',
        content: 'Soumettez votre premier texte argumentatif à notre simulateur de correction IA pour tester votre morphosyntaxe.'
      }
    ],
    faqs: [
      {
        q: 'Combien de fautes de grammaire puis-je faire pour obtenir NCLC 9 ?',
        a: 'Le barème officiel n\'indique pas un nombre précis de fautes. Pour le niveau C1, l\'erreur doit être occasionnelle et ne pas entraver la compréhension du lecteur. Les fautes systématiques sur les accords de base excluent le niveau C1.'
      },
      {
        q: 'Le correcteur d\'orthographe est-il autorisé lors de l\'examen ?',
        a: 'Non. Le clavier fourni lors des examens TCF/TEF Canada ne dispose d\'aucun correcteur automatique d\'orthographe ou de grammaire.'
      }
    ]
  },
  {
    slug: 'tcf-canada-comprehension-orale-pieges',
    title: 'Les 7 pièges majeurs de la Compréhension Orale TCF Canada',
    metaDescription: 'Déjouez les pièges classiques de la Compréhension Orale du TCF Canada (39 questions, 35 min) : faux-amis, négations tronquées, accent québécois et gestion du temps.',
    category: 'TCF Canada',
    publishedAt: '12 Juin 2026',
    readingTimeMin: 7,
    author: {
      name: 'Maud Gauthier',
      role: 'Directrice Pédagogique, Expert CECRL'
    },
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=60',
    excerpt: '39 questions en 35 minutes sans retour en arrière : la Compréhension Orale du TCF Canada élimine chaque année des milliers de candidats. Voici comment déjouer les 7 pièges les plus fréquents.',
    sections: [
      {
        type: 'paragraph',
        content: 'La Compréhension Orale (CO) du TCF Canada est souvent considérée comme l\'épreuve la plus anxiogène. Avec 39 questions à enchaîner en 35 minutes chrono et une seule écoute pour la majorité des documents, la moindre seconde d\'inattention peut coûter un niveau NCLC complet.'
      },
      {
        type: 'heading-2',
        content: 'Piège n°1 : Le mot-clé répété qui est un leurre (distracteur)'
      },
      {
        type: 'paragraph',
        content: 'Les concepteurs d\'épreuves de France Éducation International connaissent parfaitement les automatismes des candidats. Lorsqu\'une option contient exactement le même mot rare entendu dans l\'enregistrement audio, il s\'agit dans plus de 60% des cas d\'une fausse piste.'
      },
      {
        type: 'quote',
        content: 'Règle d\'or ayePREP : Ne cherchez pas les mêmes mots, cherchez les synonymes et les reformulations d\'idées.'
      },
      {
        type: 'heading-2',
        content: 'Piège n°2 : La négation informelle tronquée'
      },
      {
        type: 'paragraph',
        content: 'En français parlé courant, le "ne" de la négation disparaît très souvent : "J\'ai pas envie d\'y aller" au lieu de "Je n\'ai pas envie". Les candidats peu entraînés à l\'oral familier comprennent alors l\'exact contraire du message réel de l\'interlocuteur.'
      },
      {
        type: 'heading-2',
        content: 'Piège n°3 : Les expressions idiomatiques québécoises'
      },
      {
        type: 'paragraph',
        content: 'Bien que le TCF Canada utilise principalement un français standard international, les épreuves de niveau B2 à C2 intègrent délibérément des dialogues issus de Radio-Canada ou de conversations à Montréal. Reconnaître des termes comme "courriel", "fin de semaine", "magasiner" ou les tournures interrogatives en "-tu" est primordial.'
      },
      {
        type: 'heading-2',
        content: 'Piège n°4 : Le changement d\'avis de dernière seconde'
      },
      {
        type: 'paragraph',
        content: 'Un dialogue typique : "On se retrouve à 14h à la gare ? — Oui parfait... ah attends, mon train a du retard, disons plutôt 15h30 devant le café." Si vous cochez 14h dès la première réplique, vous tombez dans le piège classique.'
      },
      {
        type: 'cta',
        content: 'Entraînez-vous avec nos 39 questions CO en conditions d\'examen réelles avec chronomètre strict.'
      }
    ],
    faqs: [
      {
        q: 'Combien de fois chaque document audio est-il joué ?',
        a: 'Au TCF Canada, les questions 1 à 29 ne sont jouées qu\'une seule fois. Seules certaines questions complexes des niveaux supérieurs bénéficient d\'une double écoute selon les consignes affichées à l\'écran.'
      },
      {
        q: 'Peut-on mettre en pause l\'enregistrement audio ?',
        a: 'Absolument pas. L\'épreuve défile de façon continue. Dès que l\'audio se termine, vous disposez d\'environ 10 à 15 secondes pour valider votre réponse avant que la question suivante ne commence automatiquement.'
      }
    ]
  },
  {
    slug: 'tcf-canada-expression-ecrite-taches-1-2-3',
    title: 'Réussir les 3 tâches de l\'Expression Écrite TCF Canada',
    metaDescription: 'Méthodologie complète pour obtenir C1/C2 en Expression Écrite TCF Canada : décompte des mots, structure des 3 tâches, et critères officiels des correcteurs.',
    category: 'TCF Canada',
    publishedAt: '18 Juin 2026',
    readingTimeMin: 9,
    author: {
      name: 'Marc-André Tremblay',
      role: 'Examinateur certifié TCF/TEF'
    },
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60',
    excerpt: '60 minutes pour rédiger 3 textes distincts : la gestion du temps et le respect scrupuleux du nombre de mots sont les deux piliers pour atteindre NCLC 7 et plus en Expression Écrite.',
    sections: [
      {
        type: 'paragraph',
        content: 'L\'épreuve d\'Expression Écrite (EE) du TCF Canada est notée sur 20 points, convertis ensuite sur l\'échelle des NCLC (Niveaux de Compétence Linguistique Canadiens). Pour obtenir le NCLC 7 (seuil d\'admissibilité clé), vous devez obtenir au moins 10/20, tandis que le NCLC 9 (pour le maximum de points CRS) requiert au moins 14/20.'
      },
      {
        type: 'heading-2',
        content: 'Tâche 1 : Message court descriptif (minimum 60 mots / max 120 mots)'
      },
      {
        type: 'paragraph',
        content: 'Cette première tâche (notée sur 6 points) consiste généralement à rédiger un message ou un courriel amical pour raconter une expérience, donner des nouvelles ou inviter un proche. Vous devez y consacrer 10 à 12 minutes maximum.'
      },
      {
        type: 'list',
        items: [
          'Formule d\'appel chaleureuse ("Salut Thomas, / Cher Karim,")',
          'Description précise des faits au passé composé et à l\'imparfait',
          'Formule de prise de congé conviviale ("À très bientôt ! / Écris-moi vite !")'
        ]
      },
      {
        type: 'heading-2',
        content: 'Tâche 2 : Courrier d\'opinion argumenté (minimum 120 mots / max 150 mots)'
      },
      {
        type: 'paragraph',
        content: 'Ici, vous devez vous adresser à une autorité (maire, directeur, rédacteur en chef) pour donner votre avis sur un projet ou un problème de société. Vous devez y consacrer 20 minutes.'
      },
      {
        type: 'list',
        items: [
          'Ton formel et vouvoiement obligatoire',
          'Introduction claire posant la problématique',
          'Deux arguments solides illustrés chacun d\'un exemple concret',
          'Conclusion proposant une recommandation constructive'
        ]
      },
      {
        type: 'heading-2',
        content: 'Tâche 3 : Synthèse et confrontation de points de vue (minimum 120 mots / max 180 mots)'
      },
      {
        type: 'paragraph',
        content: 'C\'est la tâche la plus discriminante de l\'épreuve ! Vous disposez de deux courts documents présentant des avis divergents sur un sujet. Votre mission comporte deux parties équilibrées : synthétiser les deux thèses sans prendre parti, puis exprimer et justifier votre point de vue personnel.'
      },
      {
        type: 'quote',
        content: 'Attention capitale : Ne recopiez JAMAIS mot pour mot les phrases des documents fournis. La paraphrase intelligente est exigée pour décrocher les points de vocabulaire en niveau C1.'
      },
      {
        type: 'cta',
        content: 'Rédigez un essai dès maintenant et faites-le corriger en 20 secondes par notre IA étalonnée sur les grilles officielles.'
      }
    ],
    faqs: [
      {
        q: 'Que se passe-t-il si je ne respecte pas le nombre minimal de mots ?',
        a: 'Si vous écrivez moins de mots que le seuil minimal indiqué (ex : 55 mots au lieu de 60), une pénalité sévère est appliquée automatiquement pouvant rétrograder votre note d\'un ou deux niveaux CECRL.'
      },
      {
        q: 'Comment sont comptabilisés les mots ?',
        a: 'Un mot est un ensemble de caractères séparé par un espace ou une apostrophe. Par exemple, "aujourd\'hui" compte pour deux mots, et "c\'est-à-dire" pour 4 mots.'
      }
    ]
  },
  {
    slug: 'tef-canada-expression-orale-guide-section-a-b',
    title: 'Expression Orale TEF Canada : Réussir les Sections A et B',
    metaDescription: 'Guide pratique pour réussir l\'épreuve orale du TEF Canada (35 min) : réussir la Section A (poser 10 questions) et la Section B (convaincre un ami) avec aisance.',
    category: 'TEF Canada',
    publishedAt: '25 Juin 2026',
    readingTimeMin: 8,
    author: {
      name: 'Maud Gauthier',
      role: 'Directrice Pédagogique, Expert CECRL'
    },
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60',
    excerpt: 'L\'Expression Orale du TEF Canada dure 35 minutes avec deux jeux de rôle interactifs face à l\'examinateur. Voici la stratégie exacte pour obtenir NCLC 8, 9 ou 10.',
    sections: [
      {
        type: 'paragraph',
        content: 'Contrairement au TCF Canada qui ne dure que 12 minutes à l\'oral, le TEF Canada consacre 35 minutes à l\'Expression Orale (EO) découpée en deux sections distinctes : la Section A (recueil d\'informations) et la Section B (argumentation persuasive).'
      },
      {
        type: 'heading-2',
        content: 'Section A (10 minutes) : La quête d\'informations formelle'
      },
      {
        type: 'paragraph',
        content: 'À partir d\'une petite annonce (cours de musique, voyage organisé, colocation, offre d\'emploi), vous jouez le rôle d\'un client intéressé et vous devez poser environ 10 à 12 questions pertinentes à l\'examinateur.'
      },
      {
        type: 'list',
        items: [
          'Variez impérativement les structures de questions : inversion sujet-verbe ("Pourriez-vous me préciser..."), tournure "est-ce que", et questions ouvertes (où, quand, comment, combien).',
          'Ne lisez pas vos notes : maintenez le contact visuel et réagissez spontanément aux réponses fournies.',
          'Renseignez-vous sur les tarifs, les dates, les modalités d\'annulation et les prérequis techniques.'
        ]
      },
      {
        type: 'heading-2',
        content: 'Section B (15 minutes) : Convaincre un ami sceptique'
      },
      {
        type: 'paragraph',
        content: 'Vous découvrez un document publicitaire vantant un service ou un événement (cours de yoga, week-end insolite, nouveau restaurant végane). Vous devez téléphoner à un ami (l\'examinateur) pour lui présenter l\'activité et lever toutes ses réticences pour le convaincre d\'y participer avec vous.'
      },
      {
        type: 'quote',
        content: 'Astuce examinateur : Votre ami va volontairement refuser 3 ou 4 fois en prétextant le prix, la fatigue ou le manque d\'intérêt. Préparez des contre-arguments immédiats : "Ne t\'inquiète pas pour l\'argent, je t\'invite !" ou "Justement, c\'est l\'occasion rêvée de décompresser."'
      },
      {
        type: 'cta',
        content: 'Entraînez-vous à l\'enregistrement vocal direct sur ayePREP avec transcription automatique Whisper et analyse IA.'
      }
    ],
    faqs: [
      {
        q: 'A-t-on le temps de préparer ses arguments avant de parler ?',
        a: 'Oui. Vous disposez d\'une minute de préparation pour la Section A et d\'environ 2 à 3 minutes pour la Section B afin de noter vos idées maîtresses sur un brouillon.'
      },
      {
        q: 'Quel niveau de langue adopter pour la Section B ?',
        a: 'Un registre familier/courant adapté à un ami proche : tutoiement naturel, enthousiasme vocal et intonation dynamique.'
      }
    ]
  },
  {
    slug: 'calculateur-nclc-comment-atteindre-nclc-7-express-entry',
    title: 'Comment obtenir le NCLC 7 au TCF/TEF Canada pour l\'Entrée Express',
    metaDescription: 'Pourquoi le NCLC 7 est le seuil clé pour immigrer au Canada ? Découvrez les scores bruts nécessaires par épreuve et le plan d\'action pour franchir ce cap.',
    category: 'NCLC',
    publishedAt: '03 Juillet 2026',
    readingTimeMin: 6,
    author: {
      name: 'Maud Gauthier',
      role: 'Directrice Pédagogique, Expert CECRL'
    },
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=60',
    excerpt: 'Le NCLC 7 (équivalent B2 solide) est la porte d\'entrée officielle pour les rondes de sélection francophones du Canada. Voici les scores exacts à viser.',
    sections: [
      {
        type: 'paragraph',
        content: 'Dans le système d\'immigration canadien (IRCC), le français est devenu le levier le plus puissant pour obtenir la résidence permanente. Depuis les réformes des tirages par catégories en Entrée Express, les candidats justifiant d\'un niveau NCLC 7 minimum dans les 4 compétences bénéficient d\'extractions prioritaires avec des seuils de points CRS défiant toute concurrence.'
      },
      {
        type: 'heading-2',
        content: 'Les scores bruts officiels pour obtenir le NCLC 7'
      },
      {
        type: 'list',
        items: [
          'Compréhension Orale (CO) : 458 à 502 points au TCF Canada (ou 249 à 279 au TEF)',
          'Compréhension Écrite (CE) : 453 à 498 points au TCF Canada (ou 207 à 232 au TEF)',
          'Expression Écrite (EE) : 10 à 11 / 20 au TCF Canada (ou 310 à 348 au TEF)',
          'Expression Orale (EO) : 10 à 11 / 20 au TCF Canada (ou 310 à 348 au TEF)'
        ]
      },
      {
        type: 'heading-2',
        content: 'La règle stricte du maillon faible imposée par IRCC'
      },
      {
        type: 'paragraph',
        content: 'Méfiez-vous de la moyenne globale ! Pour Immigration Canada, votre niveau NCLC est strictement déterminé par votre score le plus bas parmi les 4 épreuves. Si vous obtenez NCLC 9 en CO, CE et EO mais NCLC 6 en EE, votre dossier complet sera classé NCLC 6 et vous perdrez l\'accès aux tirages réservés aux francophones.'
      },
      {
        type: 'cta',
        content: 'Calculez instantanément vos équivalences NCLC avec notre calculateur gratuit en ligne.'
      }
    ],
    faqs: [
      {
        q: 'Quelle est la durée de validité des résultats TCF / TEF Canada ?',
        a: 'Les attestations de résultats TCF et TEF Canada sont valables exactement 2 ans à compter de la date d\'examen pour toutes les démarches auprès d\'IRCC.'
      },
      {
        q: 'Puis-je combiner deux attestations pour garder les meilleurs scores de chaque module ?',
        a: 'Non, IRCC refuse le panachage (super-scoring). Vous devez soumettre une seule attestation contenant les 4 épreuves passées lors de la même session.'
      }
    ]
  },
  {
    slug: 'tcf-canada-vs-tef-canada-lequel-choisir',
    title: 'TCF Canada ou TEF Canada : Quel examen choisir en 2026 ?',
    metaDescription: 'Comparatif approfondi : durée (2h22 vs 3h15), type d\'épreuve orale, notation et accessibilité. Quel test est le plus facile selon votre profil ?',
    category: 'TCF Canada',
    publishedAt: '10 Juillet 2026',
    readingTimeMin: 8,
    author: {
      name: 'Marc-André Tremblay',
      role: 'Examinateur certifié TCF/TEF'
    },
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60',
    excerpt: 'TCF ou TEF ? Les deux examens sont reconnus de manière totalement équivalente par IRCC. Pourtant, leurs formats et leurs épreuves orales sont radicalement différents.',
    sections: [
      {
        type: 'paragraph',
        content: 'Lorsque l\'on prépare son projet d\'immigration au Canada, la première question qui se pose est invariablement : "Dois-je passer le TCF Canada ou le TEF Canada ?". Si les deux attestations ont la même valeur juridique auprès d\'IRCC, le profil des candidats détermine souvent les chances de réussite.'
      },
      {
        type: 'heading-2',
        content: 'Comparatif rapide des formats d\'examen'
      },
      {
        type: 'list',
        items: [
          'Durée totale : 2h22 pour le TCF Canada contre 3h15 pour le TEF Canada (le TCF est plus court et moins éprouvant physiquement).',
          'Compréhension Orale : 39 questions en 35 min (TCF) vs 60 questions en 40 min (TEF).',
          'Compréhension Écrite : 39 questions en 35 min (TCF) vs 50 questions en 60 min (TEF).',
          'Expression Écrite : 3 tâches en 60 min (TCF) vs 2 tâches en 60 min (TEF).',
          'Expression Orale : 12 minutes (TCF) vs 35 minutes avec 2 jeux de rôle (TEF).'
        ]
      },
      {
        type: 'heading-2',
        content: 'Pour qui le TCF Canada est-il le plus adapté ?'
      },
      {
        type: 'paragraph',
        content: 'Le TCF Canada convient parfaitement aux candidats qui redoutent les épreuves orales longues et théâtrales. 12 minutes suffisent pour démontrer son niveau, et les questions de compréhension écrite et orale sont progressives.'
      },
      {
        type: 'heading-2',
        content: 'Pour qui le TEF Canada est-il avantageux ?'
      },
      {
        type: 'paragraph',
        content: 'Le TEF Canada est idéal pour les candidats très à l\'aise à l\'oral spontané qui aiment argumenter, négocier et improviser dans des jeux de rôle. De plus, les 60 minutes pour 50 questions de lecture laissent plus de temps de réflexion par question que le TCF.'
      },
      {
        type: 'cta',
        content: 'Consultez notre guide comparatif interactif complet sur notre page dédiée TCF vs TEF.'
      }
    ],
    faqs: [
      {
        q: 'Le prix de l\'examen est-il le même entre TCF et TEF ?',
        a: 'Les tarifs sont fixés librement par les centres agréés mais tournent généralement autour de 250€ à 320€ (ou 160 000 à 220 000 FCFA) pour les deux examens.'
      },
      {
        q: 'L\'un des deux donne-t-il plus de points CRS ?',
        a: 'Non, les deux tests sont rigoureusement alignés sur les mêmes équivalences NCLC par le gouvernement canadien.'
      }
    ]
  },
  {
    slug: 'centres-examen-tcf-tef-afrique-inscriptions-prix',
    title: 'Où passer le TCF/TEF Canada en Afrique : Centres, Tarifs et Dates',
    metaDescription: 'Guide complet des centres agréés au Sénégal, Cameroun, Côte d\'Ivoire, Maroc et Bénin : inscriptions, tarifs FCFA et conseils pratiques.',
    category: 'Immigration',
    publishedAt: '17 Juillet 2026',
    readingTimeMin: 9,
    author: {
      name: 'Maud Gauthier',
      role: 'Directrice Pédagogique, Expert CECRL'
    },
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=60',
    excerpt: 'En Afrique francophone, les places d\'examen s\'arrachent en quelques minutes. Découvrez la liste des centres officiels agréés et les conseils pour réserver votre session sans stress.',
    sections: [
      {
        type: 'paragraph',
        content: 'Le continent africain représente le premier vivier de candidats francophones pour l\'immigration au Canada. Face à une demande exponentielle, anticiper sa réservation auprès des centres agréés est indispensable pour ne pas retarder son dossier Entrée Express de plusieurs mois.'
      },
      {
        type: 'heading-2',
        content: '1. Sénégal (Dakar & Saint-Louis)'
      },
      {
        type: 'paragraph',
        content: 'À Dakar, les examens TCF Canada sont administrés principalement par l\'Institut Français du Sénégal (IFS Dakar) et les centres agréés partenaires. Les sessions ont lieu plusieurs fois par mois, avec des tarifs oscillant entre 170 000 et 210 000 FCFA.'
      },
      {
        type: 'heading-2',
        content: '2. Côte d\'Ivoire (Abidjan)'
      },
      {
        type: 'paragraph',
        content: 'L\'Institut Français de Côte d\'Ivoire (IFCI) au Plateau et plusieurs centres privés conventionnés reçoivent les inscriptions mensuelles. Pensez à vérifier l\'ouverture des sessions en ligne dès le 1er du mois.'
      },
      {
        type: 'heading-2',
        content: '3. Cameroun (Yaoundé & Douala)'
      },
      {
        type: 'paragraph',
        content: 'Avec deux grands pôles à Douala et Yaoundé, les centres agréés enregistrent une forte affluence. Le paiement se fait généralement par virement bancaire local ou agence sur présentation de la pièce d\'identité.'
      },
      {
        type: 'heading-2',
        content: '4. Maroc (Casablanca, Rabat, Marrakech)'
      },
      {
        type: 'paragraph',
        content: 'Le réseau de l\'Institut Français du Maroc et les Chambres de Commerce Françaises organisent des sessions hebdomadaires pour le TCF et le TEF Canada. Tarifs : entre 2 800 et 3 400 MAD.'
      },
      {
        type: 'quote',
        content: 'Conseil logistique : Ne réservez votre date d\'examen qu\'après avoir validé un score satisfaisant sur au moins 3 simulations complètes sur ayePREP.'
      },
      {
        type: 'cta',
        content: 'Découvrez nos packs à durée limitée payables directement en Mobile Money (Orange Money, Wave, MTN).'
      }
    ],
    faqs: [
      {
        q: 'Combien de temps avant la date d\'examen faut-il s\'inscrire ?',
        a: 'En Afrique francophone, il est vivement recommandé de s\'inscrire 2 à 3 mois à l\'avance, les quotas de places étant souvent atteints dès les premières heures d\'ouverture des sessions.'
      },
      {
        q: 'Quel document d\'identité présenter le jour de l\'examen ?',
        a: 'Seul le passeport international en cours de validité est accepté pour le TCF et le TEF Canada. Les cartes d\'identité nationales sont fréquemment refusées.'
      }
    ]
  }
]

