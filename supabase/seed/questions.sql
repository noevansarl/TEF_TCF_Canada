-- ========================================================
-- FRANCOPHONIE ACADEMIA — Script de Données de Démonstration (Seed)
-- Cible: public.questions
-- ========================================================

-- Nettoyer la table avant d'insérer les questions de production/test
TRUNCATE TABLE public.questions CASCADE;

INSERT INTO public.questions (
  id,
  module,
  test_type,
  level,
  question_text,
  audio_url,
  max_listens,
  passage_text,
  options,
  correct_answer,
  model_answer,
  explanation,
  theme,
  difficulty_score,
  is_active,
  is_premium,
  published_month,
  is_topical,
  topical_badge
) VALUES 
-- ==========================================
-- I. COMPRÉHENSION ORALE (CO)
-- ==========================================

-- Q1. CO TCF Canada - B2 (Logement/Vie quotidienne)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c001',
  'CO',
  'TCF_CANADA',
  'B2',
  'D''après le dialogue, quelle est la raison principale pour laquelle Marc souhaite s''installer à Sherbrooke plutôt qu''à Montréal ?',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  2,
  NULL,
  '{"A": "Le coût de la vie y est moins élevé", "B": "Il a déjà trouvé un emploi là-bas", "C": "Le climat y est beaucoup plus doux", "D": "Sa famille y habite déjà"}',
  'A',
  NULL,
  'Dans le dialogue, Marc explique explicitement que le prix des loyers à Montréal est devenu trop élevé pour son budget d''étudiant et qu''il préfère s''installer en Estrie à Sherbrooke pour économiser sur le coût de la vie.',
  'Vie quotidienne et logement au Québec',
  6,
  true,
  false,
  '2026-05',
  true,
  'Nouveau · Mai 2026'
),

-- Q2. CO TEF Canada - B1 (Transports/Mobilité)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c002',
  'CO',
  'TEF_CANADA',
  'B1',
  'Quelle annonce la conductrice du train fait-elle aux passagers concernant le retard ?',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  2,
  NULL,
  '{"A": "Une panne électrique paralyse le réseau", "B": "Un problème technique nécessite un arrêt temporaire", "C": "Des conditions météorologiques forcent un ralentissement", "D": "Une grève surprise a débuté"}',
  'B',
  NULL,
  'La conductrice signale un « incident technique mineur sur la motrice » nécessitant un arrêt en gare de 10 minutes pour vérifications.',
  'Transports et mobilité urbaine',
  4,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q3. CO TCF Canada - C1 (Immigration)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c003',
  'CO',
  'TCF_CANADA',
  'C1',
  'Quel jugement l''intervenante porte-t-elle sur les programmes d''accueil des nouveaux arrivants francophones hors-Québec ?',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  2,
  NULL,
  '{"A": "Ils sont totalement inadaptés aux réalités économiques", "B": "Ils manquent cruellement de financements locaux", "C": "Ils sont louables mais leur visibilité reste insuffisante", "D": "Ils nuisent à l''unité des communautés francophones"}',
  'C',
  NULL,
  'L''intervenante souligne que bien que les efforts d''accompagnement soient excellents (« louables »), le manque de canaux de communication rend ces outils invisibles pour la majorité des immigrants ciblés.',
  'Immigration et multiculturalisme',
  8,
  true,
  false,
  '2026-04',
  false,
  NULL
),

-- Q4. CO TEF Canada - C2 (Sciences/Espace)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c004',
  'CO',
  'TEF_CANADA',
  'C2',
  'Selon le chercheur en astronomie, quelle est l''implication majeure de la découverte d''eau liquide sur ce satellite ?',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  1,
  NULL,
  '{"A": "Elle confirme la présence d''une vie extraterrestre complexe", "B": "Elle prouve que la Terre a reçu son eau de l''espace", "C": "Elle redéfinit les critères de la zone d''habitabilité stellaire", "D": "Elle rend possible une colonisation humaine immédiate"}',
  'C',
  NULL,
  'Le chercheur indique que cette eau liquide, maintenue sous forme fluide grâce aux forces de marée gravitationnelles loin de l''étoile mère, démontre que la zone d''habitabilité classique n''est plus le seul critère de recherche biologique.',
  'Astronomie et sciences de l''espace',
  10,
  true,
  true,
  '2026-05',
  true,
  'Sujet Chaud · Mai 2026'
),

-- ==========================================
-- II. COMPRÉHENSION ÉCRITE (CE)
-- ==========================================

-- Q5. CE TCF Canada - B2 (Environnement)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c005',
  'CE',
  'TCF_CANADA',
  'B2',
  'Quelle est l''intention principale de la municipalité à travers cette nouvelle réglementation sur les biodéchets ?',
  NULL,
  2,
  'Afin de respecter les engagements nationaux de réduction des gaz à effet de serre, la Ville de Gatineau annonce l''obligation de trier les restes alimentaires et déchets organiques dès le 1er septembre. Cette mesure s''accompagne de la distribution gratuite de bacs bruns de compostage à tous les foyers. Des patrouilles vertes effectueront des vérifications aléatoires pour sensibiliser les résidents avant l''application définitive d''amendes de 50 $ pour non-respect en 2027.',
  '{"A": "Augmenter les recettes municipales par des amendes", "B": "Favoriser la réduction de l''empreinte carbone locale", "C": "Créer de nouveaux emplois de patrouilleurs écologiques", "D": "Privatiser la collecte des ordures ménagères"}',
  'B',
  NULL,
  'La première phrase mentionne explicitement : « Afin de respecter les engagements nationaux de réduction des gaz à effet de serre... ». Il s''agit donc de réduire l''empreinte carbone locale.',
  'Environnement et développement durable',
  6,
  true,
  false,
  '2026-05',
  true,
  'Nouveau · Mai 2026'
),

-- Q6. CE TEF Canada - C1 (Télétravail)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c006',
  'CE',
  'TEF_CANADA',
  'C1',
  'Quelle critique l''auteur formule-t-il à l''égard du déploiement du télétravail au sein de la fonction publique québécoise ?',
  NULL,
  2,
  'Bien que le télétravail soit présenté comme une avancée majeure pour l''équilibre entre vie professionnelle et vie privée, son déploiement hâtif au sein de l''administration québécoise soulève des inquiétudes légitimes. En diluant la frontière entre le domicile et le bureau, il engendre paradoxalement une surcharge cognitive pour les agents, forcés de rester connectés en permanence. Loin d''alléger les plannings, cette transition mal encadrée accentue l''isolement social et nuit à la cohésion d''équipe.',
  '{"A": "Il estompe la limite entre travail et vie privée", "B": "Il réduit la productivité administrative globale", "C": "Il impose des coûts d''équipement insupportables", "D": "Il est boudé par les cadres supérieurs"}',
  'A',
  NULL,
  'L''auteur indique que le télétravail « dilue la frontière entre le domicile et le bureau », ce qui correspond au fait d''estomper la limite entre la vie de famille et la vie professionnelle.',
  'Économie et monde du travail',
  8,
  true,
  false,
  '2026-03',
  false,
  NULL
),

-- Q7. CE BOTH - B1 (Alimentation/Insectes)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c007',
  'CE',
  'BOTH',
  'B1',
  'Quel est l''avantage nutritionnel des farines d''insectes selon l''article ?',
  NULL,
  2,
  'Face à la croissance démographique mondiale, la recherche d''alternatives protéiques durables s''accélère. Les farines d''insectes, autrefois marginales, entrent progressivement dans l''alimentation courante. Riches en acides aminés essentiels, en fer et en vitamine B12, elles affichent un impact écologique minime par rapport à l''élevage bovin classique. Malgré des réticences psychologiques persistantes en Occident, leur valeur nutritionnelle exceptionnelle séduit de plus en plus de nutritionnistes sportifs.',
  '{"A": "Elles sont très pauvres en matières grasses", "B": "Elles remplacent intégralement l''eau de cuisson", "C": "Elles ont un goût similaire à la farine de blé", "D": "Elles contiennent beaucoup d''acides aminés, de fer et de vitamines"}',
  'D',
  NULL,
  'Le texte indique explicitement que ces farines sont « Riches en acides aminés essentiels, en fer et en vitamine B12 », ce qui correspond à l''option D.',
  'Alimentation et gastronomie',
  5,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q8. CE TCF Canada - C2 (Enseignement/IA)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c008',
  'CE',
  'TCF_CANADA',
  'C2',
  'Quelle conclusion l''auteur tire-t-il sur l''avenir des algorithmes génératifs dans l''enseignement universitaire ?',
  NULL,
  2,
  'L''avènement des IA génératives à l''université ne doit être lu ni comme un cataclysme académique, ni comme l''aube d''une oisiveté généralisée. En réalité, en automatisant la rédaction de synthèses basiques, ces outils contraignent l''institution à repenser son mode d''évaluation. Il ne s''agit plus de tester la restitution de connaissances stockées, mais bien de juger l''esprit critique et l''originalité conceptuelle de l''étudiant. L''algorithme devient ainsi un révélateur : il élimine le travail de surface pour ne laisser briller que la pensée profonde.',
  '{"A": "Ils vont rendre les diplômes universitaires obsolètes", "B": "Ils encouragent une tricherie indétectable par les enseignants", "C": "Ils poussent à valoriser l''analyse critique plutôt que la mémorisation", "D": "Ils doivent être interdits sur tous les campus universitaires"}',
  'C',
  NULL,
  'L''auteur écrit : « Il ne s''agit plus de tester la restitution de connaissances stockées, mais bien de juger l''esprit critique et l''originalité conceptuelle ». Les algorithmes poussent donc l''université à évaluer l''analyse critique.',
  'Technologies numériques et société',
  9,
  true,
  true,
  '2026-05',
  true,
  'Sujet Chaud · Mai 2026'
),

-- ==========================================
-- III. EXPRESSION ÉCRITE (EE)
-- ==========================================

-- Q9. EE TCF Canada - B2 (Fait divers potager)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c009',
  'EE',
  'TCF_CANADA',
  'B2',
  'Sujet : Un fait divers raconte qu''un habitant a planté un potager partagé sur le trottoir devant sa maison sans autorisation municipale. Rédigez un article de journal de 150 mots pour rapporter l''événement, décrire les réactions des voisins et l''intervention finale de la mairie.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Exemple de corrigé B2 : \nLe week-end dernier, la petite rue des Ormes a pris des airs de campagne. Excédé par le manque d''espaces verts, un habitant du quartier, M. Lemaire, a décidé de transformer le trottoir devant sa maison en un potager communautaire. Tomates, courgettes et fines herbes s''alignent désormais à la place du bitume.\n\nDu côté des voisins, les avis sont partagés. Si certains applaudissent chaleureusement cette initiative écologique favorisant le lien social, d''autres s''inquiètent de l''encombrement du passage pour les piétons et les poussettes. \n\nLa mairie a rapidement réagi en envoyant des inspecteurs municipaux. Bien que la réglementation interdise strictement l''aménagement de la voie publique sans accord, le maire a proposé un compromis : le potager pourra être maintenu sous réserve de sa relocalisation dans le parc municipal voisin d''ici la fin du mois. Une solution pragmatique qui préserve l''élan citoyen tout en garantissant la sécurité publique.',
  'L''évaluation portera sur le respect du format d''article journalistique (titre, introduction factuelle, témoignages, conclusion), l''emploi d''un ton neutre ou informatif, et une grammaire fluide de niveau B2.',
  'Vie quotidienne et logement au Québec',
  6,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q10. EE TEF Canada - C1 (Lettre formelle sport)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c110',
  'EE',
  'TEF_CANADA',
  'C1',
  'Sujet : Vous écrivez une lettre formelle au recteur de votre université pour contester la suppression des budgets alloués aux activités sportives et associatives. Rédigez une lettre d''au moins 200 mots en présentant trois arguments solides sur l''impact de ces activités sur la santé mentale et le bien-être social des étudiants.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Monsieur le Recteur,\n\nJe me permets de vous adresser cette correspondance au nom du collectif étudiant afin d''exprimer notre vive désapprobation concernant la récente baisse budgétaire allouée aux pôles sportifs et associatifs de notre campus.\n\nEn premier lieu, les activités physiques jouent un rôle stabilisateur crucial pour la santé mentale des étudiants, souvent soumis à une pression académique considérable. Supprimer ces espaces équivaut à restreindre l''accès aux canaux d''évacuation du stress.\n\nEn second lieu, la vie associative constitue le socle de l''intégration sociale. De nombreux étudiants, notamment internationaux, y trouvent un réseau d''entraide indispensable contre l''isolement.\n\nEnfin, ces activités favorisent le développement de compétences de leadership et de travail en équipe. \n\nDans l''attente d''un réexamen de cette mesure, je vous prie de recevoir, Monsieur le Recteur, mes salutations distinguées.',
  'La lettre doit respecter les codes formels (formule d''appel, de politesse, clarté administrative), utiliser un vocabulaire de persuasion soutenu (C1) et structurer les arguments logiquement.',
  'Éducation et formation professionnelle',
  7,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q11. EE TCF Canada - C2 (Essai IA/Art)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c111',
  'EE',
  'TCF_CANADA',
  'C2',
  'Sujet : L''usage massif des outils d''intelligence artificielle dans la création artistique (peinture, écriture, musique) vide-t-il l''art de sa substance humaine ? Rédigez un essai argumenté et nuancé de 200 à 250 mots.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'L''émergence des intelligences artificielles génératives dans le domaine artistique suscite des débats passionnés quant à la nature même de l''acte créateur. Si certains redoutent une déshumanisation esthétique, il convient d''analyser ce phénomène sans manichéisme.\n\nCertes, l''algorithme est dénué de conscience, de souffrance et de vécu émotionnel, qui constituent historiquement l''essence de l''expression artistique. L''art algorithmique ne serait alors qu''une recombinaison statistique sophistiquée, incapable d''intentionnalité originale. Néanmoins, l''histoire nous enseigne que chaque révolution technologique (photographie, synthétiseurs) a d''abord été perçue comme une menace avant d''être assimilée comme un nouvel outil de création. L''IA ne remplace pas l''artiste, elle redéfinit sa technique. En automatisant la production technique de premier plan, elle pousse l''esprit humain à se concentrer sur l''orientation conceptuelle et la curation philosophique.\n\nEn définitive, la substance humaine artistique ne s''efface pas devant la machine : elle se déplace, érigeant la conception intellectuelle au-dessus du simple geste technique.',
  'Un essai C2 requiert une structure rigoureuse (introduction avec problématique, développement antithétique nuancé, conclusion ouverte), un lexique conceptuel et abstrait de haut niveau, et des structures syntaxiques complexes.',
  'Technologies numériques et société',
  10,
  true,
  true,
  '2026-05',
  true,
  'Sujet Chaud · Mai 2026'
),

-- Q12. EE TEF Canada - B1 (Voyage expérience)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c112',
  'EE',
  'TEF_CANADA',
  'B1',
  'Sujet : Racontez votre premier voyage dans un pays étranger. Décrivez vos impressions à l''arrivée, les personnes que vous avez rencontrées et ce que cette expérience vous a apporté. Rédigez un récit d''au moins 100 mots.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Je me souviendrai toujours de mon premier voyage au Canada, il y a trois ans. Quand je suis arrivé à l''aéroport de Montréal en plein hiver, j''ai été impressionné par la quantité de neige et par le froid intense. C''était magnifique !\n\nJ''ai été chaleureusement accueilli par ma famille d''accueil, des gens très ouverts et généreux. Grâce à eux, j''ai découvert la culture locale et j''ai visité de jolis parcs nationaux. \n\nCette expérience m''a permis de devenir plus autonome et de surmonter ma timidité. J''ai appris à m''adapter à une culture différente, ce qui m''a donné envie de voyager encore plus.',
  'Ce sujet évalue la capacité à structurer un récit simple au passé (passé composé, imparfait), à exprimer des sentiments et des impressions personnelles de manière claire.',
  'Voyages et tourisme',
  3,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- ==========================================
-- IV. EXPRESSION ORALE (EO)
-- ==========================================

-- Q13. EO TCF Canada - B2 (Ami bio)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c113',
  'EO',
  'TCF_CANADA',
  'B2',
  'Tâche 2 (Interaction) : Vous tentez de convaincre un ami d''acheter des produits alimentaires exclusivement locaux et biologiques. Présentez-lui au moins 3 arguments (santé, écologie, soutien à l''économie locale) et répondez de manière cordiale à ses objections concernant le prix et la disponibilité des produits. (Préparation : 1 min · Parole : 3 min)',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Exemple d''arguments oraux B2 :\n- Argument de santé : Expliquer que les fruits et légumes bio contiennent moins de résidus chimiques de pesticides synthétiques, ce qui est meilleur à long terme.\n- Argument écologique : Acheter local réduit considérablement les circuits de distribution et le transport (bilan carbone) par rapport à des aliments importés.\n- Argument socio-économique : Soutenir directement les producteurs de notre région et pérenniser l''emploi agricole local.\n- Objections prix : Proposer d''acheter en vrac ou de consommer des fruits et légumes de saison, souvent beaucoup plus abordables qu''on ne le pense.',
  'Le candidat doit interagir de façon fluide, utiliser un registre amical approprié, faire preuve de persuasion active tout en écoutant et contrecarrant poliment les objections de l''interlocuteur.',
  'Environnement et développement durable',
  6,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q14. EO TEF Canada - C1 (Monologue santé)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c114',
  'EO',
  'TEF_CANADA',
  'C1',
  'Sujet : Est-il légitime d''imposer des taxes supplémentaires sur les aliments ultra-transformés pour financer le système de santé ? Présentez votre point de vue de manière structurée et argumentée pendant 5 minutes.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Exemple de structure d''arguments C1 :\n- Introduction : Poser la problématique du coût croissant des maladies métaboliques et la responsabilité de l''industrie agroalimentaire.\n- Argument pour la légitimité fiscale : Le principe du « pollueur-payeur » appliqué à la santé publique. Les taxes incitent les industriels à revoir leurs recettes (moins de sel/sucre) et financent directement les soins.\n- Nuance/Limites : Risque de pénaliser les ménages à faible revenu pour qui les aliments industriels sont les moins chers. Nécessité de coupler cette taxe avec des subventions pour le bio.\n- Conclusion : La fiscalité est un levier utile mais doit s''inscrire dans un plan éducatif global.',
  'Le candidat doit exposer un point de vue construit et complexe, justifier ses choix avec des concepts de santé publique et d''économie, et s''exprimer sans hésitation avec un débit régulier.',
  'Santé et système de soins canadien',
  8,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q15. EO TCF Canada - C2 (Mondialisation)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c115',
  'EO',
  'TCF_CANADA',
  'C2',
  'Tâche 3 (Exposé argumenté) : Faut-il revoir le modèle de la mondialisation pour faire face aux crises climatiques actuelles ? Développez un monologue argumenté et nuancé de 4 minutes sur les limites du libre-échange et les opportunités du protectionnisme écologique.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Pistes argumentatives C2 :\n- Définition des tensions : Concilier une économie mondialisée basée sur des flux physiques illimités avec les contraintes physiques d''une planète aux ressources finies.\n- Analyse systémique : Démontrer que le transport maritime mondialisé sous-évalue systématiquement le coût carbone. Relocaliser les industries clés permet de réduire cette externalité négative.\n- Le protectionnisme vert : Introduire le concept de taxe carbone aux frontières (comme le mécanisme européen) pour éviter les fuites de carbone vers des pays moins disants réglementaires.\n- Synthèse critique : Nuancer en montrant qu''une autarcie complète nuirait au transfert technologique indispensable (ex: panneaux solaires, batteries). L''enjeu est une « mondialisation sélective » plutôt qu''un repli nationaliste.',
  'L''exposé requiert une introduction formelle, un développement équilibré avec un vocabulaire abstrait de niveau supérieur (C2), et une conclusion logique. La prosodie et le registre formel doivent être impeccables.',
  'Mondialisation et commerce',
  10,
  true,
  true,
  '2026-05',
  true,
  'Sujet Chaud · Mai 2026'
),

-- Q16. EO TEF Canada - B1 (Office tourisme)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c116',
  'EO',
  'TEF_CANADA',
  'B1',
  'Sujet : Vous téléphonez à un office de tourisme canadien pour obtenir des informations sur les activités à faire en famille pendant l''hiver dans la région de Charlevoix. Posez au moins 5 questions précises concernant les tarifs, les équipements nécessaires et l''hébergement. (Parole : 3 min)',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Exemple de questions attendues (B1) :\n- « Bonjour, je prépare un voyage en famille pour février. Quelles sont les principales activités de plein air recommandées pour les enfants ? »\n- « Est-il nécessaire de réserver à l''avance les excursions en traîneau à chiens ? »\n- « Fournissez-vous les vêtements de grand froid ou devons-nous louer des équipements spéciaux sur place ? »\n- « Quels sont les hébergements familiaux disponibles près des pistes de ski ? »\n- « Y a-t-il des tarifs réduits ou des forfaits familiaux pour l''accès aux parcs nationaux ? »',
  'Le candidat doit savoir poser des questions claires et directes au présent et au conditionnel de politesse, et maintenir une conversation simple dans un contexte touristique.',
  'Voyages et tourisme',
  4,
  true,
  false,
  '2026-05',
  false,
  NULL
);
