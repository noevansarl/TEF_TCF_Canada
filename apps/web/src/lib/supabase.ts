import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

if (import.meta.env.PROD && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  throw new Error('FATAL: VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis en production.')
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// Detect if we should use mock client (no environment variables or placeholder keys)
const useMock =
  supabaseUrl.includes('placeholder') ||
  supabaseAnonKey === 'placeholder' ||
  !import.meta.env.VITE_SUPABASE_URL

// Mock questions list based on questions.sql seed data - MUTABLE for CRUD simulation
export let mockQuestions = [
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c001",
    module: "CO",
    test_type: "TCF_CANADA",
    level: "B2",
    question_text: "D'après le dialogue, quelle est la raison principale pour laquelle Marc souhaite s'installer à Sherbrooke plutôt qu'à Montréal ?",
    audio_url: "https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/co-q1-sherbrooke.mp3",
    max_listens: 2,
    options: {
      A: "Le coût de la vie y est moins élevé",
      B: "Il a déjà trouvé un emploi là-bas",
      C: "Le climat y est beaucoup plus doux",
      D: "Sa famille y habite déjà"
    },
    correct_answer: "A",
    explanation: "Dans le dialogue, Marc explique explicitement que le prix des loyers à Montréal est devenu trop élevé pour son budget d'étudiant et qu'il préfère s'installer en Estrie à Sherbrooke pour économiser sur le coût de la vie.",
    theme: "Vie quotidienne et logement au Québec",
    difficulty_score: 6,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: true,
    topical_badge: "Nouveau · Mai 2026"
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c002",
    module: "CO",
    test_type: "TEF_CANADA",
    level: "B1",
    question_text: "Quelle annonce la conductrice du train fait-elle aux passagers concernant le retard ?",
    audio_url: "https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/co-q2-train.mp3",
    max_listens: 2,
    options: {
      A: "Une panne électrique paralyse le réseau",
      B: "Un problème technique nécessite un arrêt temporaire",
      C: "Des conditions météorologiques forcent un ralentissement",
      D: "Une grève surprise a débuté"
    },
    correct_answer: "B",
    explanation: "La conductrice signale un « incident technique mineur sur la motrice » nécessitant un arrêt en gare de 10 minutes pour vérifications.",
    theme: "Transports et mobilité urbaine",
    difficulty_score: 4,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: false,
    topical_badge: undefined
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c003",
    module: "CO",
    test_type: "TCF_CANADA",
    level: "C1",
    question_text: "Quel jugement l'intervenante porte-t-elle sur les programmes d'accueil des nouveaux arrivants francophones hors-Québec ?",
    audio_url: "https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/co-q3-immigration.mp3",
    max_listens: 2,
    options: {
      A: "Ils sont totalement inadaptés aux réalités économiques",
      B: "Ils manquent cruellement de financements locaux",
      C: "Ils sont louables mais leur visibilité reste insuffisante",
      D: "Ils nuisent à l'unité des communautés francophones"
    },
    correct_answer: "C",
    explanation: "L'intervenante souligne que bien que les efforts d'accompagnement soient excellents (« louables »), le manque de canaux de communication rend ces outils invisibles pour la majorité des immigrants ciblés.",
    theme: "Immigration et multiculturalisme",
    difficulty_score: 8,
    is_active: true,
    is_premium: false,
    published_month: "2026-04",
    is_topical: false,
    topical_badge: undefined
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c004",
    module: "CO",
    test_type: "TEF_CANADA",
    level: "C2",
    question_text: "Selon le chercheur en astronomie, quelle est l'implication majeure de la découverte d'eau liquide sur ce satellite ?",
    audio_url: "https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/co-q4-satellite.mp3",
    max_listens: 1,
    options: {
      A: "Elle confirme la présence d'une vie extraterrestre complexe",
      B: "Elle prouve que la Terre a reçu son eau de l'espace",
      C: "Elle redéfinit les critères de la zone d'habitabilité stellaire",
      D: "Elle rend possible une colonisation humaine immédiate"
    },
    correct_answer: "C",
    explanation: "Le chercheur indique que cette eau liquide, maintenue sous forme fluide grâce aux forces de marée gravitationnelles loin de l'étoile mère, démontre que la zone d'habitabilité classique n'est plus le seul critère de recherche biologique.",
    theme: "Astronomie et sciences de l'espace",
    difficulty_score: 10,
    is_active: true,
    is_premium: true,
    published_month: "2026-05",
    is_topical: true,
    topical_badge: "Sujet Chaud · Mai 2026"
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c005",
    module: "CE",
    test_type: "TCF_CANADA",
    level: "B2",
    question_text: "Quelle est l'intention principale de la municipalité à travers cette nouvelle réglementation sur les biodéchets ?",
    passage_text: "Afin de respecter les engagements nationaux de réduction des gaz à effet de serre, la Ville de Gatineau annonce l'obligation de trier les restes alimentaires et déchets organiques dès le 1er septembre. Cette mesure s'accompagne de la distribution gratuite de bacs bruns de compostage à tous les foyers. Des patrouilles vertes effectueront des vérifications aléatoires pour sensibiliser les résidents avant l'application définitive d'amendes de 50 $ pour non-respect en 2027.",
    options: {
      A: "Augmenter les recettes municipales par des amendes",
      B: "Favoriser la réduction de l'empreinte carbone locale",
      C: "Créer de nouveaux emplois de patrouilleurs écologiques",
      D: "Privatiser la collecte des ordures ménagères"
    },
    correct_answer: "B",
    explanation: "La première phrase mentionne explicitement : « Afin de respecter les engagements nationaux de réduction des gaz à effet de serre... ». Il s'agit donc de réduire l'empreinte carbone locale.",
    theme: "Environnement et développement durable",
    difficulty_score: 6,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: true,
    topical_badge: "Nouveau · Mai 2026"
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c006",
    module: "CE",
    test_type: "TEF_CANADA",
    level: "C1",
    question_text: "Quelle critique l'auteur formule-t-il à l'égard du déploiement du télétravail au sein de la fonction publique québécoise ?",
    passage_text: "Bien que le télétravail soit présenté comme une avancée majeure pour l'équilibre entre vie professionnelle et vie privée, son déploiement hâtif au sein de l'administration québécoise soulève des inquiétudes légitimes. En diluant la frontière entre le domicile et le bureau, il engendre paradoxalement une surcharge cognitive pour les agents, forcés de rester connectés en permanence. Loin d'alléger les plannings, cette transition mal encadrée accentue l'isolement social et nuit à la cohésion d'équipe.",
    options: {
      A: "Il estompe la limite entre travail et vie privée",
      B: "Il réduit la productivité administrative globale",
      C: "Il impose des coûts d'équipement insupportables",
      D: "Il est boudé par les cadres supérieurs"
    },
    correct_answer: "A",
    explanation: "L'auteur indique que le télétravail « dilue la frontière entre le domicile et le bureau », ce qui correspond au fait d'estomper la limite entre la vie de famille et la vie professionnelle.",
    theme: "Économie et monde du travail",
    difficulty_score: 8,
    is_active: true,
    is_premium: false,
    published_month: "2026-03",
    is_topical: false,
    topical_badge: undefined
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c007",
    module: "CE",
    test_type: "BOTH",
    level: "B1",
    question_text: "Quel est l'avantage nutritionnel des farines d'insectes selon l'article ?",
    passage_text: "Face à la croissance démographique mondiale, la recherche d'alternatives protéiques durables s'accélère. Les farines d'insectes, autrefois marginales, entrent progressivement dans l'alimentation courante. Riches en acides aminés essentiels, en fer et en vitamine B12, elles affichent un impact écologique minime par rapport à l'élevage bovin classique. Malgré des réticences psychologiques persistantes en Occident, leur valeur nutritionnelle exceptionnelle séduit de plus en plus de nutritionnistes sportifs.",
    options: {
      A: "Elles sont très pauvres en matières grasses",
      B: "Elles remplacent intégralement l'eau de cuisson",
      C: "Elles ont un goût similaire à la farine de blé",
      D: "Elles contiennent beaucoup d'acides aminés, de fer et de vitamines"
    },
    correct_answer: "D",
    explanation: "Le texte indique explicitement que ces farines sont « Riches en acides aminés essentiels, en fer et en vitamine B12 », ce qui correspond à l'option D.",
    theme: "Alimentation et gastronomie",
    difficulty_score: 5,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: false,
    topical_badge: undefined
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c008",
    module: "CE",
    test_type: "TCF_CANADA",
    level: "C2",
    question_text: "Quelle conclusion l'auteur tire-t-il sur l'avenir des algorithmes génératifs dans l'enseignement universitaire ?",
    passage_text: "L'avènement des IA génératives à l'université ne doit être lu ni comme un cataclysme académique, ni comme l'aube d'une oisiveté généralisée. En réalité, en automatisant la rédaction de synthèses basiques, ces outils contraignent l'institution à repenser son mode d'évaluation. Il ne s'agit plus de tester la restitution de connaissances stockées, mais bien de juger l'esprit critique et l'originalité conceptuelle de l'étudiant. L'algorithme devient ainsi un révélateur : il élimine le travail de surface pour ne laisser briller que la pensée profonde.",
    options: {
      A: "Ils vont rendre les diplômes universitaires obsolètes",
      B: "Ils encouragent une tricherie indétectable par les enseignants",
      C: "Ils poussent à valoriser l'analyse critique plutôt que la mémorisation",
      D: "Ils doivent être interdits sur tous les campus universitaires"
    },
    correct_answer: "C",
    explanation: "L'auteur écrit : « Il ne s'agit plus de tester la restitution de connaissances stockées, mais bien de juger l'esprit critique et l'originalité conceptuelle ». Les algorithmes poussent donc l'université à évaluer l'analyse critique.",
    theme: "Technologies numériques et société",
    difficulty_score: 9,
    is_active: true,
    is_premium: true,
    published_month: "2026-05",
    is_topical: true,
    topical_badge: "Sujet Chaud · Mai 2026"
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c009",
    module: "EE",
    test_type: "TCF_CANADA",
    level: "B2",
    question_text: "Sujet : Un fait divers raconte qu'un habitant a planté un potager partagé sur le trottoir devant sa maison sans autorisation municipale. Rédigez un article de journal de 150 mots pour rapporter l'événement, décrire les réactions des voisins et l'intervention finale de la mairie.",
    task_type: "texte_argumentatif",
    target_words: { min: 150, max: 200 },
    model_answer: "Le week-end dernier, la petite rue des Ormes a pris des airs de campagne. Excédé par le manque d'espaces verts, un habitant du quartier, M. Lemaire, a décidé de transformer le trottoir devant sa maison en un potager communautaire. Tomates, courgettes et fines herbes s'alignent désormais à la place du bitume.\n\nDu côté des voisins, les avis sont partagés. Si certains applaudissent chaleureusement cette initiative écologique favorisant le lien social, d'autres s'inquiètent de l'encombrement du passage pour les piétons et les poussettes. \n\nLa mairie a rapidement réagi en envoyant des inspecteurs municipaux. Bien que la réglementation interdise strictement l'aménagement de la voie publique sans accord, le maire a proposé un compromis : le potager pourra être maintenu sous réserve de sa relocalisation dans le parc municipal voisin d'ici la fin du mois. Une solution pragmatique qui préserve l'élan citoyen tout en garantissant la sécurité publique.",
    explanation: "L'évaluation portera sur le respect du format d'article journalistique (titre, introduction factuelle, témoignages, conclusion), l'emploi d'un ton neutre ou informatif, et une grammaire fluide de niveau B2.",
    theme: "Vie quotidienne et logement au Québec",
    difficulty_score: 6,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: false,
    topical_badge: undefined
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c110",
    module: "EE",
    test_type: "TEF_CANADA",
    level: "C1",
    question_text: "Sujet : Vous écrivez une lettre formelle au recteur de votre université pour contester la suppression des budgets alloués aux activités sportives et associatives. Rédigez une lettre d'au moins 200 mots en présentant trois arguments solides sur l'impact de ces activités sur la santé mentale et le bien-être social des étudiants.",
    task_type: "lettre_formelle",
    target_words: { min: 200, max: 300 },
    model_answer: "Monsieur le Recteur,\n\nJe me permets de vous adresser cette correspondance au nom du collectif étudiant afin d'exprimer notre vive désapprobation concernant la récente baisse budgétaire allouée aux pôles sportifs et associatifs de notre campus.\n\nEn premier lieu, les activités physiques jouent un rôle stabilisateur crucial pour la santé mentale des étudiants, souvent soumis à une pression académique considérable. Supprimer ces espaces équivaut à restreindre l'accès aux canaux d'évacuation du stress.\n\nEn second lieu, la vie associative constitue le socle de l'intégration sociale. De nombreux étudiants, notamment internationaux, y trouvent un réseau d'entraide indispensable contre l'isolement.\n\nEnfin, ces activités favorisent le développement de compétences de leadership et de travail en équipe. \n\nDans l'attente d'un réexamen de cette mesure, je vous prie de recevoir, Monsieur le Recteur, mes salutations distinguées.",
    explanation: "La lettre doit respecter les codes formels (formule d'appel, de politesse, clarté administrative), utiliser un vocabulaire de persuasion soutenu (C1) et structurer les arguments logiquement.",
    theme: "Éducation et formation professionnelle",
    difficulty_score: 7,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: false,
    topical_badge: undefined
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c111",
    module: "EE",
    test_type: "TCF_CANADA",
    level: "C2",
    question_text: "Sujet : L'usage massif des outils d'intelligence artificielle dans la création artistique (peinture, écriture, musique) vide-t-il l'art de sa substance humaine ? Rédigez un essai argumenté et nuancé de 200 à 250 mots.",
    task_type: "texte_argumentatif",
    target_words: { min: 200, max: 250 },
    model_answer: "L'émergence des intelligences artificielles génératives dans le domaine artistique suscite des débats passionnés quant à la nature même de l'acte créateur. Si certains redoutent une déshumanisation esthétique, il convient d'analyser ce phénomène sans manichéisme.\n\nCertes, l'algorithme est dénué de conscience, de souffrance et de vécu émotionnel, qui constituent historiquement l'essence de l'expression artistique. L'art algorithmique ne serait alors qu'une recombinaison statistique sophistiquée, incapable d'intentionnalité originale. Néanmoins, l'histoire nous enseigne que chaque révolution technologique (photographie, synthétiseurs) a d'abord été perçue comme une menace avant d'être assimilée comme un nouvel outil de création. L'IA ne remplace pas l'artiste, elle redéfinit sa technique. En automatisant la production technique de premier plan, elle pousse l'esprit humain à se concentrer sur l'orientation conceptuelle et la curation philosophique.\n\nEn définitive, la substance humaine artistique ne s'efface pas devant la machine : elle se déplace, érigeant la conception intellectuelle au-dessus du simple geste technique.",
    explanation: "Un essai C2 requiert une structure rigoureuse (introduction avec problématique, développement antithétique nuancé, conclusion ouverte), un lexique conceptuel et abstrait de haut niveau, et des structures syntaxiques complexes.",
    theme: "Technologies numériques et société",
    difficulty_score: 10,
    is_active: true,
    is_premium: true,
    published_month: "2026-05",
    is_topical: true,
    topical_badge: "Sujet Chaud · Mai 2026"
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c112",
    module: "EE",
    test_type: "TEF_CANADA",
    level: "B1",
    question_text: "Sujet : Racontez votre premier voyage dans un pays étranger. Décrivez vos impressions à l'arrivée, les personnes que vous avez rencontrées et ce que cette expérience vous a apporté. Rédigez un récit d'au moins 100 mots.",
    task_type: "recit_experience",
    target_words: { min: 100, max: 150 },
    model_answer: "Je me souviendrai toujours de mon premier voyage au Canada, il y a trois ans. Quand je suis arrivé à l'aéroport de Montréal en plein hiver, j'ai été impressionné par la quantité de neige et par le froid intense. C'était magnifique !\n\nJ'ai été chaleureusement accueilli par ma famille d'accueil, des gens très ouverts et généreux. Grâce à eux, j'ai découvert la culture locale et j'ai visité de jolis parcs nationaux. \n\nCette expérience m'a permis de devenir plus autonome et de surmonter ma timidité. J'ai appris à m'adapter à une culture différente, ce qui m'a donné envie de voyager encore plus.",
    explanation: "Ce sujet évalue la capacité à structurer un récit simple au passé (passé composé, imparfait), à exprimer des sentiments et des impressions personnelles de manière claire.",
    theme: "Voyages et tourisme",
    difficulty_score: 3,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: false,
    topical_badge: undefined
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c113",
    module: "EO",
    test_type: "TCF_CANADA",
    level: "B2",
    question_text: "Tâche 2 (Interaction) : Vous tentez de convaincre un ami d'acheter des produits alimentaires exclusivement locaux et biologiques. Présentez-lui au moins 3 arguments (santé, écologie, soutien à l'économie locale) et répondez de manière cordiale à ses objections concernant le prix et la disponibilité des produits. (Préparation : 1 min · Parole : 3 min)",
    task_type: "convaincre_ami",
    explanation: "Le candidat doit interagir de façon fluide, utiliser un registre amical approprié, faire preuve de persuasion active tout en écoutant et contrecarrant poliment les objections de l'interlocuteur.",
    theme: "Environnement et développement durable",
    difficulty_score: 6,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: false,
    topical_badge: undefined
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c114",
    module: "EO",
    test_type: "TEF_CANADA",
    level: "C1",
    question_text: "Sujet : Est-il légitime d'imposer des taxes supplémentaires sur les aliments ultra-transformés pour financer le système de santé ? Présentez votre point de vue de manière structurée et argumentée pendant 5 minutes.",
    task_type: "monologue_argumente",
    explanation: "Le candidat doit exposer un point de vue construit et complexe, justifier ses choix avec des concepts de santé publique et d'économie, et s'exprimer sans hésitation avec un débit régulier.",
    theme: "Santé et système de soins canadien",
    difficulty_score: 8,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: false,
    topical_badge: undefined
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c115",
    module: "EO",
    test_type: "TCF_CANADA",
    level: "C2",
    question_text: "Tâche 3 (Exposé argumenté) : Faut-il revoir le modèle de la mondialisation pour faire face aux crises climatiques actuelles ? Développez un monologue argumenté et nuancé de 4 minutes sur les limites du libre-échange et les opportunités du protectionnisme écologique.",
    task_type: "debat_argumente",
    explanation: "L'exposé requiert une introduction formelle, un développement équilibré avec un vocabulaire abstrait de niveau supérieur (C2), et une conclusion logique. La prosodie et le registre formel doivent être impeccables.",
    theme: "Mondialisation et commerce",
    difficulty_score: 10,
    is_active: true,
    is_premium: true,
    published_month: "2026-05",
    is_topical: true,
    topical_badge: "Sujet Chaud · Mai 2026"
  },
  {
    id: "d74bb36a-297c-48c0-bc66-3d6825d1c116",
    module: "EO",
    test_type: "TEF_CANADA",
    level: "B1",
    question_text: "Sujet : Vous téléphonez à un office de tourisme canadien pour obtenir des informations sur les activités à faire en famille pendant l'hiver dans la région de Charlevoix. Posez au moins 5 questions précises concernant les tarifs, les équipements nécessaires et l'hébergement. (Parole : 3 min)",
    task_type: "demande_infos",
    explanation: "Le candidat doit savoir poser des questions claires et directes au présent et au conditionnel de politesse, et maintenir une conversation simple dans un contexte touristique.",
    theme: "Voyages et tourisme",
    difficulty_score: 4,
    is_active: true,
    is_premium: false,
    published_month: "2026-05",
    is_topical: false,
    topical_badge: undefined
  }
]

// Mock users list - MUTABLE for Admin/User update simulation
export let mockUsers = [
  { id: 'mock-user-id', full_name: 'Candidat ayePREP', email: 'candidat@example.com', subscription_tier: 'institutionnel', xp_points: 1240, streak_days: 7, longest_streak: 15, target_test: 'TCF_CANADA', level_assessed: 'C1', country: 'Sénégal', role: 'user', created_at: '2026-05-01T12:00:00Z' },
  { id: 'user-2', full_name: 'Marie Dupont', email: 'marie.dupont@gmail.com', subscription_tier: 'premium', xp_points: 2300, streak_days: 14, longest_streak: 20, target_test: 'TEF_CANADA', level_assessed: 'C2', country: 'France', role: 'user', created_at: '2026-04-15T09:30:00Z' },
  { id: 'user-3', full_name: 'Alioune Diop', email: 'alioune@yahoo.fr', subscription_tier: 'gratuit', xp_points: 450, streak_days: 2, longest_streak: 3, target_test: 'TCF_CANADA', level_assessed: 'B2', country: 'Sénégal', role: 'user', created_at: '2026-05-18T16:45:00Z' },
  { id: 'user-4', full_name: 'Expert Pierre', email: 'pierre.expert@ayeprep.com', subscription_tier: 'institutionnel', xp_points: 0, streak_days: 0, longest_streak: 0, target_test: 'BOTH', level_assessed: 'C2', country: 'Canada', role: 'expert', created_at: '2026-03-01T08:00:00Z' },
  { id: 'user-5', full_name: 'Admin Jean', email: 'admin@ayeprep.com', subscription_tier: 'institutionnel', xp_points: 0, streak_days: 0, longest_streak: 0, target_test: 'BOTH', level_assessed: 'C2', country: 'Québec', role: 'admin', created_at: '2026-01-10T10:00:00Z' }
]

export let mockSessions: any[] = []
export let mockAnswers: any[] = []
export const mockPaymentAttempts: any[] = []

export const mockAffiliates = [
  { id: 'aff-mock-1', user_id: 'mock-user-id', name: 'Candidat ayePREP', email: 'candidat@example.com', code: 'CANDIDAT20', commission_rate: 0.20, payment_method: 'mobile_money', total_clicks: 142, total_conversions: 18, total_earned_eur: 107.92, is_active: true, created_at: '2026-05-10T08:00:00Z' }
]

export const mockAffiliateClicks: any[] = [
  { id: 'clk-1', affiliate_id: 'aff-mock-1', affiliate_code: 'CANDIDAT20', page_url: '/', referrer_url: 'https://youtube.com', ip_address: '192.168.1.1', user_agent: 'Mozilla/5.0', converted: true, converted_user_id: 'user-2', created_at: '2026-05-25T14:30:00Z' }
]

export const mockAffiliateConversions: any[] = [
  { id: 'conv-1', affiliate_id: 'aff-mock-1', converted_user_id: 'user-2', amount_eur: 29.99, commission_eur: 6.00, paid_at: null, created_at: '2026-05-25T14:40:00Z' }
]

export const mockInstitutions = [
  { id: 'inst-1', name: 'Institut Français de Dakar', country: 'Sénégal', max_students: 150, features: { bulk_import: true, live_classroom: true }, created_at: '2026-01-01T12:00:00Z' }
]

export let mockInstitutionStudents = [
  { id: 'is-1', institution_id: 'inst-1', user_id: 'user-2', name: 'Marie Dupont', email: 'marie.dupont@gmail.com', joined_at: '2026-04-15T09:30:00Z' },
  { id: 'is-2', institution_id: 'inst-1', user_id: 'user-3', name: 'Alioune Diop', email: 'alioune@yahoo.fr', joined_at: '2026-05-18T16:45:00Z' }
]

export let mockClassSessions: any[] = []

// Mock implementation
const mockClient: any = {
  auth: {
    signUp: async (credentials: any) => ({
      data: { user: { id: 'mock-user-id', email: credentials.email, user_metadata: credentials.options?.data || {} } },
      error: null
    }),
    signInWithPassword: async (credentials: any) => {
      const user = mockUsers.find(u => u.email === credentials.email)
      return {
        data: { user: user ? { id: user.id, email: user.email } : { id: 'mock-user-id', email: credentials.email } },
        error: null
      }
    },
    getUser: async () => ({
      data: { user: { id: 'mock-user-id', email: 'candidat@example.com' } },
      error: null
    }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({
      data: { session: null },
      error: null
    }),
    resend: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    exchangeCodeForSession: async () => ({
      data: { session: null },
      error: { message: 'Mock: no code exchange in dev' }
    }),
    setSession: async () => ({
      data: { session: null },
      error: null
    }),
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // En dev, simuler un utilisateur déjà connecté pour débloquer initialized
      setTimeout(() => {
        callback('SIGNED_IN', {
          user: {
            id: 'mock-user-id',
            email: 'candidat@example.com',
            email_confirmed_at: new Date().toISOString(),
          }
        })
      }, 0)
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
  },
  from: (table: string) => {
    let currentSessionId = 'mock-session-id'
    let queriedModule = ''
    let eqValue: any = null
    let updateData: any = null
    let insertData: any = null

    const chain: any = {
      select: (_columns?: string) => chain,
      eq: (_field: string, _value: any) => {
        eqValue = _value
        if (_field === 'id') {
          currentSessionId = _value
        }
        if (_field === 'module') {
          queriedModule = _value
        }
        return chain
      },
      in: (_field: string, _values: any[]) => chain,
      order: (_field: string, _options?: any) => chain,
      limit: (_count: number) => chain,
      single: () => {
        const singleChain: any = {
          then: (resolve: any) => {
            if (table === 'sessions') {
              const existingSession = mockSessions.find(s => s.id === currentSessionId)
              if (existingSession) {
                resolve({ data: existingSession, error: null })
                return
              }
              let mod = 'CO'
              let sessionType: any = 'TRAINING'
              if (currentSessionId.includes('ce')) mod = 'CE'
              else if (currentSessionId.includes('ee')) mod = 'EE'
              else if (currentSessionId.includes('eo')) mod = 'EO'
              else if (currentSessionId.includes('simulation') || currentSessionId.includes('full')) {
                mod = currentSessionId.includes('tef') ? 'FULL_TEF' : 'FULL_TCF'
                sessionType = 'SIMULATION'
              }
              
              resolve({
                data: {
                  id: currentSessionId,
                  started_at: new Date().toISOString(),
                  max_duration_s: 3600,
                  module: mod,
                  session_type: sessionType,
                  test_type: currentSessionId.includes('tef') ? 'TEF_CANADA' : 'TCF_CANADA',
                  status: 'in_progress'
                },
                error: null
              })
            } else if (table === 'users') {
              const user = mockUsers.find(u => u.id === eqValue || u.email === eqValue) || mockUsers[0]
              resolve({
                data: user,
                error: null
              })
            } else if (table === 'affiliates') {
              const affiliate = mockAffiliates.find(a => a.user_id === eqValue || a.email === eqValue || a.id === eqValue)
              resolve({
                data: affiliate || null,
                error: affiliate ? null : { message: 'Not found' }
              })
            } else if (table === 'institutions') {
              const inst = mockInstitutions.find(i => i.id === eqValue) || mockInstitutions[0]
              resolve({ data: inst, error: null })
            } else if (table === 'class_sessions') {
              const session = mockClassSessions.find(cs => cs.id === currentSessionId || cs.id === eqValue)
              resolve({ data: session || null, error: session ? null : { message: 'Not found' } })
            } else {
              resolve({ data: {}, error: null })
            }
          }
        }
        return singleChain;
      },
      maybeSingle: () => {
        const maybeChain: any = {
          then: (resolve: any) => {
            if (table === 'sessions') {
              const existingSession = mockSessions.find(s => s.id === currentSessionId)
              resolve({ data: existingSession || null, error: null })
            } else if (table === 'users') {
              const user = mockUsers.find(u => u.id === eqValue || u.email === eqValue)
              resolve({ data: user || null, error: null })
            } else if (table === 'affiliates') {
              const affiliate = mockAffiliates.find(a => a.user_id === eqValue || a.code === eqValue || a.id === eqValue)
              resolve({ data: affiliate || null, error: null })
            } else if (table === 'institutions') {
              const inst = mockInstitutions.find(i => i.id === eqValue) || mockInstitutions[0]
              resolve({ data: inst || null, error: null })
            } else if (table === 'class_sessions') {
              const session = mockClassSessions.find(cs => cs.id === eqValue)
              resolve({ data: session || null, error: null })
            } else if (table === 'payment_attempts') {
              const attempt = mockPaymentAttempts.find(pa => pa.fedapay_transaction_id === String(eqValue))
              resolve({ data: attempt || null, error: null })
            } else {
              resolve({ data: null, error: null })
            }
          }
        }
        return maybeChain;
      },
      insert: (data: any) => {
        insertData = data
        const processInsertItem = (item: any) => {
          if (!item.id) {
            const prefix = table === 'sessions' ? 'sess-'
              : table === 'affiliates' ? 'aff-'
              : table === 'institution_students' ? 'is-'
              : table === 'class_sessions' ? 'cs-'
              : 'q-'
            item.id = prefix + Math.floor(Math.random() * 1000000)
          }
          if (!item.created_at) item.created_at = new Date().toISOString()
          if (table === 'questions') {
            mockQuestions.push(item)
          } else if (table === 'users') {
            mockUsers.push(item)
          } else if (table === 'sessions') {
            mockSessions.push(item)
          } else if (table === 'answers') {
            mockAnswers.push(item)
          } else if (table === 'affiliates') {
            item.commission_rate = item.commission_rate || 0.20
            item.total_clicks = item.total_clicks || 0
            item.total_conversions = item.total_conversions || 0
            item.total_earned_eur = item.total_earned_eur || 0
            item.is_active = true
            mockAffiliates.push(item)
          } else if (table === 'institution_students') {
            mockInstitutionStudents.push(item)
            // Auto create mock candidate in users if not present
            const userExists = mockUsers.some(u => u.id === item.user_id)
            if (!userExists) {
              mockUsers.push({
                id: item.user_id,
                full_name: item.name || 'Candidat Importé',
                email: item.email || 'candidat.import@example.com',
                subscription_tier: 'gratuit',
                xp_points: 0,
                streak_days: 0,
                longest_streak: 0,
                target_test: 'TCF_CANADA',
                level_assessed: 'B1',
                country: 'Sénégal',
                role: 'user',
                created_at: new Date().toISOString()
              })
            }
          } else if (table === 'class_sessions') {
            mockClassSessions.push(item)
          }
        }

        const insertChain: any = {
          select: () => ({
            single: () => ({
              then: (resolve: any) => {
                const items = Array.isArray(insertData) ? insertData : [insertData]
                items.forEach(processInsertItem)
                resolve({ data: items[0], error: null })
              }
            }),
            then: (resolve: any) => {
              const items = Array.isArray(insertData) ? insertData : [insertData]
              items.forEach(processInsertItem)
              resolve({ data: items, error: null })
            }
          }),
          then: (resolve: any) => {
            const items = Array.isArray(insertData) ? insertData : [insertData]
            items.forEach(processInsertItem)
            resolve({ data: Array.isArray(insertData) ? items : items[0], error: null })
          }
        }
        return insertChain;
      },
      update: (data: any) => {
        updateData = data
        const updateChain: any = {
          eq: (_f: string, _v: any) => {
            eqValue = _v
            return updateChain
          },
          then: (resolve: any) => {
            if (table === 'users') {
              mockUsers = mockUsers.map(u => {
                if (u.id === eqValue) {
                  return { ...u, ...updateData }
                }
                return u
              })
            } else if (table === 'questions') {
              mockQuestions = mockQuestions.map(q => {
                if (q.id === eqValue) {
                  return { ...q, ...updateData }
                }
                return q
              })
            } else if (table === 'sessions') {
              mockSessions = mockSessions.map(s => {
                if (s.id === eqValue) {
                  return { ...s, ...updateData }
                }
                return s
              })
            } else if (table === 'class_sessions') {
              mockClassSessions = mockClassSessions.map(cs => {
                if (cs.id === eqValue) {
                  return { ...cs, ...updateData }
                }
                return cs
              })
            }
            resolve({ data: updateData, error: null })
          }
        }
        return updateChain
      },
      delete: () => {
        const deleteChain: any = {
          eq: (_f: string, _v: any) => {
            eqValue = _v
            return deleteChain
          },
          then: (resolve: any) => {
            if (table === 'questions') {
              mockQuestions = mockQuestions.filter(q => q.id !== eqValue)
            } else if (table === 'users') {
              mockUsers = mockUsers.filter(u => u.id !== eqValue)
            } else if (table === 'sessions') {
              mockSessions = mockSessions.filter(s => s.id !== eqValue)
            } else if (table === 'answers') {
              mockAnswers = mockAnswers.filter(a => a.id !== eqValue)
            } else if (table === 'institution_students') {
              mockInstitutionStudents = mockInstitutionStudents.filter(is => is.id !== eqValue && is.user_id !== eqValue)
            } else if (table === 'class_sessions') {
              mockClassSessions = mockClassSessions.filter(cs => cs.id !== eqValue)
            }
            resolve({ error: null })
          }
        }
        return deleteChain
      },
      upsert: (data: any) => {
        const upsertChain: any = {
          then: (resolve: any) => {
            const items = Array.isArray(data) ? data : [data]
            items.forEach(item => {
              if (table === 'answers') {
                const idx = mockAnswers.findIndex(a => a.session_id === item.session_id && a.question_id === item.question_id)
                if (idx > -1) {
                  mockAnswers[idx] = { ...mockAnswers[idx], ...item }
                } else {
                  if (!item.id) item.id = 'ans-' + Math.floor(Math.random() * 1000000)
                  mockAnswers.push(item)
                }
              }
            })
            resolve({ data, error: null })
          }
        }
        return upsertChain;
      },
      then: (resolve: any) => {
        if (table === 'questions') {
          const filtered = queriedModule 
            ? mockQuestions.filter(q => q.module === queriedModule) 
            : mockQuestions
          resolve({ data: filtered, error: null });
        } else if (table === 'users') {
          resolve({ data: mockUsers, error: null });
        } else if (table === 'affiliates') {
          const filtered = eqValue 
            ? mockAffiliates.filter(a => a.user_id === eqValue || a.code === eqValue || a.id === eqValue)
            : mockAffiliates
          resolve({ data: filtered, error: null });
        } else if (table === 'affiliate_clicks') {
          const filtered = eqValue 
            ? mockAffiliateClicks.filter(c => c.affiliate_id === eqValue || c.affiliate_code === eqValue)
            : mockAffiliateClicks
          resolve({ data: filtered, error: null });
        } else if (table === 'affiliate_conversions') {
          const filtered = eqValue 
            ? mockAffiliateConversions.filter(c => c.affiliate_id === eqValue)
            : mockAffiliateConversions
          resolve({ data: filtered, error: null });
        } else if (table === 'affiliate_dashboard') {
          resolve({
            data: mockAffiliates.map(a => ({
              id: a.id,
              name: a.name,
              code: a.code,
              commission_rate: a.commission_rate,
              total_clicks: a.total_clicks,
              total_conversions: a.total_conversions,
              total_earned_eur: a.total_earned_eur,
              payment_method: a.payment_method,
              conversion_rate_pct: a.total_clicks > 0 ? Number(((a.total_conversions / a.total_clicks) * 100).toFixed(2)) : 0,
              is_active: a.is_active,
              created_at: a.created_at
            })),
            error: null
          });
        } else if (table === 'sessions') {
          resolve({ data: mockSessions, error: null });
        } else if (table === 'institutions') {
          resolve({ data: mockInstitutions, error: null });
        } else if (table === 'class_sessions') {
          resolve({ data: mockClassSessions, error: null });
        } else if (table === 'institution_students') {
          const result = mockInstitutionStudents.map(is => {
            const u = mockUsers.find(user => user.id === is.user_id) || {
              id: is.user_id,
              full_name: is.name || 'Candidat Importé',
              email: is.email || 'candidat.import@example.com',
              subscription_tier: 'gratuit',
              xp_points: 0,
              streak_days: 0,
              longest_streak: 0,
              target_test: 'TCF_CANADA',
              level_assessed: 'B2',
              country: 'Sénégal',
              role: 'user',
              created_at: new Date().toISOString()
            }
            return {
              ...is,
              user: u
            }
          })
          resolve({ data: result, error: null });
        } else if (table === 'progress_stats') {
          resolve({
            data: [
              { id: 'ps-1', module: 'CO', test_type: 'TCF_CANADA', mastery_score: 85, sessions_completed: 12, questions_answered: 150, accuracy_rate: 85, last_session_at: new Date().toISOString() },
              { id: 'ps-2', module: 'CE', test_type: 'TCF_CANADA', mastery_score: 70, sessions_completed: 10, questions_answered: 120, accuracy_rate: 70, last_session_at: new Date().toISOString() },
              { id: 'ps-3', module: 'EE', test_type: 'TCF_CANADA', mastery_score: 75, sessions_completed: 5, questions_answered: 5, accuracy_rate: 75, last_session_at: new Date().toISOString() },
              { id: 'ps-4', module: 'EO', test_type: 'TCF_CANADA', mastery_score: 65, sessions_completed: 4, questions_answered: 4, accuracy_rate: 65, last_session_at: new Date().toISOString() }
            ],
            error: null
          });
        } else if (table === 'user_badges') {
          resolve({
            data: [
              { id: 'ub-1', user_id: 'mock-user-id', badge_id: 'b-1', earned_at: new Date().toISOString(), badges: { slug: 'first-step', name: 'Premier Pas', description: 'Compléter le test diagnostique', rarity: 'common', xp_reward: 50 } },
              { id: 'ub-2', user_id: 'mock-user-id', badge_id: 'b-2', earned_at: new Date().toISOString(), badges: { slug: 'week-warrior', name: 'Guerrier Hebdomadaire', description: '7 jours de streak consécutifs', rarity: 'common', xp_reward: 100 } },
              { id: 'ub-3', user_id: 'mock-user-id', badge_id: 'b-3', earned_at: new Date().toISOString(), badges: { slug: 'perfectionist', name: 'Perfectionniste', description: 'Score 100% sur un module (5 fois)', rarity: 'rare', xp_reward: 300 } }
            ],
            error: null
          });
        } else if (table === 'answers') {
          if (currentSessionId.includes('ee')) {
            resolve({
              data: [
                {
                  id: "a-3",
                  session_id: currentSessionId,
                  question_id: "q-3",
                  user_answer: "Selon moi, les réseaux sociaux ont profondément modifié la nature de nos relations. Bien qu'ils permettent de garder le contact avec des personnes géographiquement éloignées, ils ont tendance à virtualiser les échanges réels. En effet, de nombreux jeunes passent des heures à scroller sur leur fil d'actualité plutôt que de dialoguer directement. Néanmoins, il ne faut pas nier l'apport positif de ces outils pour mobiliser des communautés autour de projets solidaires.",
                  is_correct: null,
                  questions: mockQuestions.find(q => q.id === 'q-3'),
                  auto_feedback: {
                    criteres: {
                      respect_tache: { score: 4, commentaire: "Excellent respect de la consigne et du format." },
                      coherence: { score: 3, commentaire: "Structure logique claire, bonne articulation des idées." },
                      lexique: { score: 4, commentaire: "Vocabulaire riche, précis et approprié au niveau C2." },
                      morphosyntaxe: { score: 3, commentaire: "Bonne maîtrise grammaticale globale, très peu d'erreurs." },
                      conventions: { score: 4, commentaire: "Mise en page et ponctuation conformes." }
                    },
                    score_global: 18,
                    suggestions: [
                      "Essayez de diversifier encore plus vos connecteurs de concession (ex: bien que, nonobstant).",
                      "Portez une attention particulière à l'accord des participes passés avec l'auxiliaire avoir."
                    ],
                    resume: "Excellente production argumentative de niveau C2.",
                    nclc_estime: "C2"
                  }
                }
              ],
              error: null
            })
          } else if (currentSessionId.includes('eo')) {
            resolve({
              data: [
                {
                  id: "a-4",
                  session_id: currentSessionId,
                  question_id: "q-4",
                  user_answer: "https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3",
                  audio_transcript: "Bonjour, je souhaite présenter ma candidature pour convaincre mon ami. C'est une excellente idée car les cours de cuisine permettent de se détendre après le travail, d'apprendre des recettes saines et de partager un bon moment ensemble. Pour ce qui est du coût, c'est très abordable.",
                  is_correct: null,
                  questions: mockQuestions.find(q => q.id === 'q-4'),
                  auto_feedback: {
                    criteres: {
                      respect_tache: { score: 4, commentaire: "Réponse complète avec des arguments convaincants." },
                      coherence: { score: 3, commentaire: "Discours fluide et bien organisé." },
                      lexique: { score: 3, commentaire: "Vocabulaire précis mais perfectible sur certains termes techniques." },
                      morphosyntaxe: { score: 4, commentaire: "Très bonne prononciation et concordance des temps." },
                      conventions: { score: 4, commentaire: "Débit naturel et intonation vivante." }
                    },
                    score_global: 17,
                    suggestions: [
                      "Vous pourriez intégrer des tournures idiomatiques québécoises pour renforcer l'authenticité.",
                      "Pensez à respirer et à marquer de légères pauses pour rendre le plaidoyer plus persuasif."
                    ],
                    resume: "Excellente prestation d'expression orale.",
                    nclc_estime: "C1"
                  }
                }
              ],
              error: null
            })
          } else {
            resolve({
              data: [
                {
                  id: "a-1",
                  session_id: currentSessionId,
                  question_id: "q-1",
                  user_answer: "A",
                  is_correct: true,
                  questions: mockQuestions[0]
                },
                {
                  id: "a-2",
                  session_id: currentSessionId,
                  question_id: "q-2",
                  user_answer: "A",
                  is_correct: false,
                  questions: mockQuestions[1]
                }
              ],
              error: null
            });
          }
        } else {
          resolve({ data: [], error: null });
        }
      }
    }
    return chain
  },
  storage: {
    from: (_bucket: string) => ({
      upload: async (_path: string, _file: any) => ({ data: { path: _path }, error: null }),
      getPublicUrl: (_path: string) => ({
        data: { publicUrl: 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3' }
      })
    })
  },
  rpc: async (_name: string, _args: any) => ({ data: null, error: null }),
  functions: {
    invoke: async (name: string, _options?: any) => {
      if (name === 'create-checkout') {
        return {
          data: {
            url: `${window.location.origin}/subscribe/success?session_id=mock_stripe_session_${Date.now()}`
          },
          error: null
        }
      }

      if (name === 'fedapay-payment') {
        const packId = _options?.body?.pack_id || 'bronze';
        const method = _options?.body?.method || 'mtn_open';
        const txId = `mock_feda_tx_${Date.now()}`;
        
        mockPaymentAttempts.push({
          fedapay_transaction_id: txId,
          status: 'pending',
          user_id: 'mock-user-id',
          pack_id: packId,
          amount_xof: 9800,
          method: method,
          phone_number: _options?.body?.phone_number || '+22990000000',
          phone_country: _options?.body?.phone_country || 'BJ',
          created_at: new Date().toISOString()
        });

        // Simulate background callback to complete the payment after 3 seconds
        setTimeout(() => {
          const idx = mockPaymentAttempts.findIndex(pa => pa.fedapay_transaction_id === txId);
          if (idx > -1) {
            mockPaymentAttempts[idx].status = 'completed';
            
            const userIdx = mockUsers.findIndex(u => u.id === 'mock-user-id');
            if (userIdx > -1) {
              mockUsers[userIdx].subscription_tier = packId;
              (mockUsers[userIdx] as any).active_pack_id = packId;
              const expires = new Date();
              expires.setDate(expires.getDate() + 30);
              (mockUsers[userIdx] as any).pack_expires_at = expires.toISOString();
            }
          }
        }, 3000);

        return {
          data: {
            success: true,
            transaction_id: txId,
            message: `Une demande de paiement ${method.replace('_', ' ')} a été envoyée sur votre téléphone. Confirmez avec votre code PIN Mobile Money.`,
            pack: {
              id: packId,
              name: `Pack ${packId}`,
              amount_xof: 9800,
            },
            status: 'pending'
          },
          error: null
        }
      }

      if (name === 'delete-account') {
        return { data: { deleted: true }, error: null }
      }

      // Simulate edge function AI corrections
      if (name === 'correct-ee') {
        return {
          data: {
            criteres: {
              respect_tache: { score: 4, commentaire: "Excellent respect de la consigne et du format de plaidoyer." },
              coherence: { score: 3, commentaire: "Structure logique claire, bonne articulation des idées." },
              lexique: { score: 4, commentaire: "Vocabulaire riche, précis et approprié au niveau C2." },
              morphosyntaxe: { score: 3, commentaire: "Bonne maîtrise grammaticale globale, très peu d'erreurs." },
              conventions: { score: 4, commentaire: "Mise en page et ponctuation conformes." }
            },
            score_global: 18,
            suggestions: [
              "Essayez de diversifier encore plus vos connecteurs de concession (ex: bien que, nonobstant).",
              "Portez une attention particulière à l'accord des participes passés avec l'auxiliaire avoir."
            ],
            resume: "Excellente production argumentative de niveau C2.",
            nclc_estime: "C2"
          },
          error: null
        }
      }
      if (name === 'transcribe-eo') {
        return {
          data: {
            transcript: "Bonjour, je souhaite présenter ma candidature pour m'installer et travailler en tant que professionnel de santé au Canada. J'ai plusieurs années d'expérience pratique.",
            feedback: {
              criteres: {
                respect_tache: { score: 4, commentaire: "Réponse complète avec des arguments convaincants." },
                coherence: { score: 3, commentaire: "Discours fluide et bien organisé." },
                lexique: { score: 3, commentaire: "Vocabulaire précis mais perfectible sur certains termes techniques." },
                morphosyntaxe: { score: 4, commentaire: "Très bonne prononciation et concordance des temps." },
                conventions: { score: 4, commentaire: "Débit naturel et intonation vivante." }
              },
              score_global: 17,
              suggestions: [
                "Vous pourriez intégrer des tournures idiomatiques québécoises pour renforcer l'authenticité.",
                "Pensez à respirer et à marquer de légères pauses pour rendre le plaidoyer plus persuasif."
              ],
              resume: "Excellente prestation d'expression orale.",
              nclc_estime: "C1"
            }
          },
          error: null
        }
      }
      return {
        data: {
          score: 85,
          correct: 2,
          total: 2,
          xp_earned: 170,
          nclc: 'C1',
          session_id: 'mock-session-id'
        },
        error: null
      }
    }
  }
}

// Export the selected client
export const supabase = useMock 
  ? mockClient 
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: { eventsPerSecond: 10 }
      }
    })
