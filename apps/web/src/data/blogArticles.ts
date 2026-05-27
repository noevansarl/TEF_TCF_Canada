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
  }
]
