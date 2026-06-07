-- ========================================================
-- ayePREP — Script de Données de Démonstration (Seed)
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
  'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/nubie-farida_khaled.mp3',
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
  'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/handball-2.mp3',
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
  'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/hajar_ma_famille.mp3',
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
  'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/ste-013-cassandre-ecole.mp3',
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
),

-- ==========================================
-- V. COMPRÉHENSION ORALE (CO) - EXPANSION
-- ==========================================

-- Q17. CO TCF Canada - B1 (Météo/Climat)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c017',
  'CO',
  'TCF_CANADA',
  'B1',
  'Selon le bulletin météorologique, quelles consignes de sécurité les autorités émettent-elles pour la soirée ?',
  'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/nubie-farida_khaled.mp3',
  2,
  NULL,
  '{"A": "Éviter tout déplacement sur les routes secondaires", "B": "Fermer les commerces du centre-ville", "C": "Couper l''alimentation électrique générale", "D": "Rester confiné dans les sous-sols"}',
  'A',
  NULL,
  'Le présentateur météo avertit que les chaussées seront glissantes et conseille fortement de limiter les déplacements non essentiels, en particulier sur le réseau secondaire non salé.',
  'Environnement et Climat',
  4,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q18. CO TEF Canada - B2 (Économie/Emploi)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c018',
  'CO',
  'TEF_CANADA',
  'B2',
  'Quelle est la réaction majoritaire des syndicats de la logistique face à la mise en place d''entrepôts automatisés ?',
  'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/handball-2.mp3',
  2,
  NULL,
  '{"A": "Une opposition totale avec menaces de grève générale", "B": "Une approbation enthousiaste des nouvelles technologies", "C": "Une acceptation sous réserve de garanties sur le maintien des emplois", "D": "Une indifférence totale face au changement"}',
  'C',
  NULL,
  'Le porte-parole indique que les syndicats ne s''opposent pas à la modernisation mais réclament un accord sur la reconversion des employés et le maintien des effectifs.',
  'Monde du travail et économie',
  6,
  true,
  false,
  '2026-05',
  true,
  'Nouveau · Mai 2026'
),

-- Q19. CO TCF Canada - C1 (Culture/Art)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c019',
  'CO',
  'TCF_CANADA',
  'C1',
  'Selon la directrice de la galerie, comment la crise sanitaire a-t-elle redéfini le rôle des musées d''art contemporain ?',
  'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/hajar_ma_famille.mp3',
  2,
  NULL,
  '{"A": "En les transformant en simples espaces de stockage physiques", "B": "En les incitant à devenir des plateformes d''échanges communautaires et numériques", "C": "En provoquant la disparition définitive de l''intérêt pour l''art", "D": "En limitant l''accès uniquement aux artistes locaux"}',
  'B',
  NULL,
  'Elle explique que l''obligation de fermer physiquement a forcé les musées à réinventer l''expérience de visite via des galeries virtuelles et des débats en ligne, renforçant le rôle de communauté d''échange.',
  'Culture et Art',
  8,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q20. CO TEF Canada - C2 (Science/Éthique)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c020',
  'CO',
  'TEF_CANADA',
  'C2',
  'Quelle est la critique éthique majeure formulée par le neuroscientifique à l''égard des puces cérébrales grand public ?',
  'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/ste-013-cassandre-ecole.mp3',
  1,
  NULL,
  '{"A": "Elles sont trop chères pour la classe moyenne", "B": "Elles risquent d''entraîner un piratage de la pensée et une perte d''autonomie cognitive", "C": "Elles ne fonctionnent pas sur les sujets âgés", "D": "Elles provoquent des allergies cutanées graves"}',
  'B',
  NULL,
  'Le scientifique souligne le danger d''ingérence extérieure directe sur le flux de pensée consciente et sur le libre arbitre individuel via des algorithmes propriétaires.',
  'Sciences et éthique',
  10,
  true,
  true,
  '2026-05',
  true,
  'Sujet Chaud · Mai 2026'
),

-- ==========================================
-- VI. COMPRÉHENSION ÉCRITE (CE) - EXPANSION
-- ==========================================

-- Q21. CE TCF Canada - B1 (Tourisme/Gaspésie)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c021',
  'CE',
  'TCF_CANADA',
  'B1',
  'Quel conseil important l''office de tourisme donne-t-il aux randonneurs visitant le parc national de la Gaspésie ?',
  NULL,
  2,
  'Le parc national de la Gaspésie invite les randonneurs à la prudence en raison de la présence accrue d''orignaux et d''ours noirs sur les sentiers d''altitude. Il est strictement conseillé de ne pas s''approcher des animaux à moins de 50 mètres pour prendre des photos et de ranger toute nourriture dans des bacs hermétiques pour ne pas les attirer.',
  '{"A": "Ne pas emporter de nourriture du tout", "B": "Garder une distance minimale de 50 mètres avec la faune", "C": "Faire de la randonnée uniquement la nuit", "D": "Engager obligatoirement un guide armé"}',
  'B',
  NULL,
  'Le texte indique explicitement : « Il est strictement conseillé de ne pas s''approcher des animaux à moins de 50 mètres... ».',
  'Voyages et tourisme',
  4,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q22. CE TEF Canada - B2 (Alimentation/Santé)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c022',
  'CE',
  'TEF_CANADA',
  'B2',
  'Quel effet l''introduction du Nutri-Score obligatoire a-t-elle eu sur les fabricants de céréales du petit-déjeuner ?',
  NULL,
  2,
  'Depuis l''adoption réglementaire du Nutri-Score sur tous les emballages, les industriels de l''agroalimentaire ont été contraints de revoir leurs formules. Pour éviter un classement "D" ou "E" pénalisant auprès des consommateurs, les fabricants de céréales ont diminué le taux de sucre raffiné de 15 % en moyenne et augmenté la part de fibres en remplaçant la farine blanche par du blé complet.',
  '{"A": "Ils ont augmenté leurs prix de vente de 15 %", "B": "Ils ont retiré leurs produits du marché européen", "C": "Ils ont reformulé leurs recettes pour en améliorer le profil nutritionnel", "D": "Ils ont poursuivi la commission européenne en justice"}',
  'C',
  NULL,
  'Le texte explique que pour éviter une mauvaise note, les fabricants « ont diminué le taux de sucre raffiné... et augmenté la part de fibres », ce qui équivaut à reformuler les recettes.',
  'Alimentation et santé publique',
  6,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q23. CE TCF Canada - C1 (Société/Vieillissement)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c023',
  'CE',
  'TCF_CANADA',
  'C1',
  'Quelle opportunité le rapport du Conseil économique voit-il dans le vieillissement rapide de la population active canadienne ?',
  NULL,
  2,
  'Si le vieillissement démographique du Canada fait souvent peser des craintes sur le financement des retraites et sur la pénurie de main-d''œuvre, le Conseil économique national y décèle un levier d''innovation sous-exploité. Ce choc pousse en effet les entreprises à accélérer l''automatisation des tâches répétitives et à investir massivement dans l''ergonomie et la formation continue, augmentant à terme la productivité globale par travailleur.',
  '{"A": "Une baisse inévitable de la compétitivité industrielle", "B": "Une incitation à accélérer l''automatisation et la formation continue", "C": "L''obligation de reculer l''âge de départ à la retraite à 70 ans", "D": "Le démantèlement des programmes sociaux publics"}',
  'B',
  NULL,
  'Le texte souligne que ce choc démographique « pousse en effet les entreprises à accélérer l''automatisation... et à investir massivement dans l''ergonomie et la formation continue ».',
  'Économie et démographie',
  8,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q24. CE TEF Canada - C2 (Énergie/Hydrogène)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c024',
  'CE',
  'TEF_CANADA',
  'C2',
  'Quelle nuance technique essentielle l''auteur apporte-t-il au sujet de l''hydrogène vert comme solution miracle décarbonée ?',
  NULL,
  2,
  'La promotion effrénée de l''hydrogène comme vecteur énergétique de la transition écologique occulte trop souvent des réalités thermodynamiques incontournables. Son rendement de conversion global reste médiocre, nécessitant une quantité massive d''électricité renouvelable en amont. De plus, sa faible densité volumétrique impose des contraintes de compression ou de liquéfaction cryogénique si énergivores qu''elles amputent l''intérêt de son transport sur de longues distances, limitant son efficacité à un usage localisé.',
  '{"A": "L''hydrogène vert produit plus de CO2 que le pétrole lors de sa combustion", "B": "Les coûts de compression cryogénique et le rendement médiocre réduisent sa viabilité pour le transport longue distance", "C": "Il est impossible d''obtenir de l''hydrogène par électrolyse de l''eau", "D": "Son usage doit être réservé exclusivement au secteur aéronautique"}',
  'B',
  NULL,
  'L''auteur note que la compression cryogénique est si énergivore qu''elle ampute l''intérêt du transport longue distance et que le rendement global reste médiocre, contredisant l''idée de solution miracle universelle.',
  'Énergies et technologies de demain',
  10,
  true,
  true,
  '2026-05',
  true,
  'Sujet Chaud · Mai 2026'
),

-- ==========================================
-- VII. EXPRESSION ÉCRITE (EE) - EXPANSION
-- ==========================================

-- Q25. EE TCF Canada - A2/B1 (Message chalet)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c025',
  'EE',
  'TCF_CANADA',
  'B1',
  'Tâche 1 (Message amical) : Vous invitez un ami à passer le week-end dans un chalet au Québec. Écrivez un courriel d''environ 80 mots pour lui proposer des activités (randonnée, kayak, feu de camp) et lui donner des précisions sur le point de rendez-vous et ce qu''il doit apporter.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Salut Thomas,\n\nJ''espère que tu vas bien ! Je t''écris pour t''inviter à passer le week-end prochain dans un superbe chalet au bord d''un lac en Mauricie. \n\nAu programme : randonnée en forêt, kayak sur le lac le samedi après-midi et grand feu de camp en soirée. \n\nOn se retrouve vendredi à 18h chez moi pour faire du covoiturage. Pense à apporter un sac de couchage chaud, des vêtements de sport et de bonnes chaussures de marche. \n\nDis-moi vite si tu es disponible !\n\nÀ bientôt,\nAlex',
  'Le courriel doit adopter un ton amical et chaleureux. Le vocabulaire doit rester simple mais précis, et les détails logistiques (activités, heure, affaires à apporter) doivent être clairement exposés.',
  'Vie quotidienne et loisirs au Canada',
  4,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q26. EE TEF Canada - Section A - B2 (Robot livraison)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c026',
  'EE',
  'TEF_CANADA',
  'B2',
  'Sujet Section A : Un fait divers raconte qu''un robot de livraison autonome a bloqué la circulation routière pendant deux heures au centre-ville de Toronto. Rédigez un article de journal de 120 à 150 mots pour raconter l''incident, les réactions des automobilistes et l''intervention finale des policiers et techniciens.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Mardi après-midi, un incident pour le moins insolite a paralysé le centre-ville de Toronto. Un robot de livraison autonome, chargé de livrer des repas, s''est brusquement immobilisé au milieu d''un passage piéton sur la rue Yonge, bloquant la circulation pendant près de deux heures.\n\nLes automobilistes, bloqués dans un embouteillage monstre, ont rapidement manifesté leur agacement à coups de klaxon. « C’est ridicule de bloquer des centaines de personnes pour une boîte à roulettes ! » s''est emporté un chauffeur de taxi.\n\nLes policiers dépêchés sur place ont dû sécuriser la zone en attendant l''arrivée de techniciens de la compagnie de livraison. Ces derniers ont finalement désactivé le système de guidage défaillant pour déplacer manuellement le robot. Une enquête interne a été ouverte pour déterminer la cause de ce bug technologique majeur.',
  'Le corps de l''article doit être structuré (qui, quoi, où, quand), inclure des témoignages et utiliser le vocabulaire de l''actualité et de la technologie au passé.',
  'Faits divers et nouvelles canadiennes',
  6,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q27. EE TCF Canada - C1 (Transport gratuit)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c027',
  'EE',
  'TCF_CANADA',
  'C1',
  'Sujet Tâche 3 : Faut-il rendre les transports publics entièrement gratuits pour encourager la transition écologique ? Rédigez un texte de 200 à 250 mots. Présentez des arguments économiques (financement, investissements) et environnementaux de manière claire et structurée.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'L’opportunité d’instaurer la gratuité des transports en commun au nom de l’urgence climatique suscite d’importants débats parmi les urbanistes et économistes. Si cette mesure apparaît séduisante, elle mérite une analyse équilibrée.\n\nD’une part, la gratuité constitue un signal politique fort. En éliminant la barrière tarifaire, elle incite une partie des automobilistes à abandonner leur véhicule individuel, réduisant ainsi les émissions de gaz à effet de serre et la pollution urbaine. De plus, elle représente une mesure de justice sociale majeure pour les ménages modestes.\n\nD’autre part, cette gratuité pose un défi de financement colossal. Sans recettes de billetterie, les municipalités doivent augmenter les impôts locaux ou réduire les investissements de modernisation du réseau. Or, les enquêtes montrent que les usagers privilégient la ponctualité, la fréquence et le confort des trajets plutôt que le prix. Un réseau gratuit mais saturé et vétuste risquerait de décourager les automobilistes au lieu de les attirer.\n\nEn conclusion, la gratuité totale n’est pas une solution miracle. Il convient plutôt de proposer des tarifs ciblés et de concentrer les financements publics sur l’extension et l’amélioration de l’offre de transport.',
  'L''essai doit présenter une structure claire en paragraphes distincts, utiliser des connecteurs de haut niveau (d''une part, d''autre part, néanmoins) et présenter un vocabulaire C1 fluide et précis.',
  'Environnement et aménagement urbain',
  8,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q28. EE TEF Canada - Section B - C2 (Lettre panneaux solaires)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c028',
  'EE',
  'TEF_CANADA',
  'C2',
  'Sujet Section B : Vous écrivez au syndic de copropriété de votre immeuble pour proposer l''installation de panneaux solaires sur le toit de la résidence. Rédigez une lettre d''au moins 200 mots. Argumentez en faveur de la réduction des charges collectives, de l''autonomie énergétique et de la valorisation immobilière de l''immeuble.',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Chers Copropriétaires,\n\nJe me permets de soumettre à votre attention un projet d''avenir pour notre résidence : l''installation de panneaux solaires photovoltaïques sur la toiture commune du bâtiment.\n\nPremièrement, cette initiative permettrait de réduire drastiquement nos charges collectives. L’électricité produite pourrait alimenter l’éclairage des parties communes, l’ascenseur et le chauffage, amortissant rapidement l’investissement initial grâce à l’autoconsommation.\n\nDeuxièmement, cette transition vers l’autonomie énergétique nous protègera contre la volatilité future des prix de l’énergie. \n\nEnfin, l’installation d’infrastructures durables valorisera notre patrimoine immobilier commun sur le marché locatif et de la revente.\n\nJe propose d''inscrire ce projet à l''ordre du jour de notre prochaine assemblée générale.\n\nBien cordialement,\nUn copropriétaire engagé',
  'La lettre formelle C2 doit démontrer une maîtrise des formules administratives et de politesse, un vocabulaire argumentatif riche et des tournures de phrases complexes (subordonnées, gérondif, subjonctif).',
  'Énergie et gestion immobilière',
  10,
  true,
  true,
  '2026-05',
  true,
  'Sujet Chaud · Mai 2026'
),

-- ==========================================
-- VIII. EXPRESSION ORALE (EO) - EXPANSION
-- ==========================================

-- Q29. EO TCF Canada - B1 (Présentation livre)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c029',
  'EO',
  'TCF_CANADA',
  'B1',
  'Tâche 1 (Monologue simple) : Présentez un livre ou un film qui vous a particulièrement marqué. Décrivez brièvement l''histoire, le personnage principal, et expliquez pourquoi cette œuvre vous a touché. (Sans préparation · Parole : 2 min)',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Exemple de monologue B1 :\n- Introduction : Présenter l''œuvre choisie (titre, auteur/réalisateur).\n- Description : Raconter l''intrigue générale de manière linéaire sans entrer dans trop de détails techniques. Présenter le héros ou l''héroïne et son défi principal.\n- Impressions personnelles : Expliquer les émotions ressenties (joie, tristesse, réflexion) et ce que l''on retient du message principal de l''œuvre.\n- Conclusion : Inviter l''interlocuteur à lire ou regarder cette œuvre.',
  'Le candidat doit parler de manière continue pendant 2 minutes, utiliser un vocabulaire personnel et des temps du passé/présent corrects, sans longues hésitations.',
  'Loisirs et culture générale',
  3,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q30. EO TEF Canada - Section A - B2 (École immersion)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c030',
  'EO',
  'TEF_CANADA',
  'B2',
  'Sujet Section A (Demande d''informations) : Vous téléphonez à une école de langues bilingue au Canada pour inscrire votre enfant à leur programme d''immersion en français. Préparez au moins 5 questions concernant les critères d''admission, l''âge requis, les tarifs, le calendrier scolaire et les activités extrascolaires. (Préparation : 1 min · Parole : 3 min)',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Exemples de questions attendues (B2) :\n- « Bonjour, je souhaite inscrire mon fils de 8 ans à votre programme d''immersion pour la prochaine rentrée. Quel est l''âge minimum requis pour ce programme ? »\n- « Les enfants doivent-ils avoir des notions de français avant d''être admis, ou le programme s''adresse-t-il aussi aux débutants complets ? »\n- « Quels sont les frais de scolarité annuels et proposez-vous des facilités de paiement par trimestre ? »\n- « Pouvez-vous me préciser les dates limites de dépôt de dossier pour le semestre d''automne ? »\n- « Proposez-vous un service de garde périscolaire ou des activités culturelles en français après les cours ? »',
  'Le candidat doit poser des questions de façon naturelle et courtoise, s''adapter aux réponses simulées de l''examinateur et maintenir un dialogue dynamique au registre formel/neutre.',
  'Éducation et intégration des enfants',
  5,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q31. EO TCF Canada - Tâche 3 - C1 (Voyages virtuels)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c031',
  'EO',
  'TCF_CANADA',
  'C1',
  'Tâche 3 (Exposé argumenté) : Les casques de réalité virtuelle vont-ils remplacer les voyages physiques ? Développez un monologue argumenté et nuancé de 4 minutes. Présentez les avantages écologiques et économiques de la réalité virtuelle ainsi que les limites de l''expérience virtuelle par rapport au contact humain réel. (Préparation : 1 min · Parole : 4 min)',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Arguments oraux attendus (C1) :\n- Avantages de la réalité virtuelle (VR) : Accès économique à des destinations lointaines pour tous, réduction immédiate de l''empreinte carbone liée au transport aérien, préservation des sites touristiques saturés (surtourisme).\n- Limites de la VR : Absence de sensations physiques (climat, odeurs, fatigue), absence de contact humain spontané avec les populations locales, l''expérience reste solitaire et médiatisée par un écran.\n- Synthèse : La VR est un excellent outil de découverte éducative ou de préparation au voyage, mais elle ne peut pas remplacer l''expérience existentielle, sensorielle et sociale d''un véritable voyage physique.',
  'L''exposé doit durer 4 minutes, posséder une introduction avec problématique, un développement structuré et nuancé, et une conclusion ouverte. Le débit doit être régulier et le vocabulaire recherché.',
  'Technologies et société de consommation',
  8,
  true,
  false,
  '2026-05',
  false,
  NULL
),

-- Q32. EO TEF Canada - Section B - C2 (Convaincre ami carrière)
(
  'd74bb36a-297c-48c0-bc66-3d6825d1c032',
  'EO',
  'TEF_CANADA',
  'C2',
  'Sujet Section B (Convaincre un ami) : Votre ami travaille dans la finance traditionnelle mais s''ennuie. Vous avez vu une annonce pour un poste de consultant en transition écologique. Convainquez-le de postuler à cette offre en mettant en avant le sens du travail, l''éthique, et les opportunités d''évolution dans ce secteur d''avenir. (Préparation : 1 min · Parole : 4 min)',
  NULL,
  2,
  NULL,
  NULL,
  NULL,
  'Pistes de persuasion orale C2 :\n- Démarrer la conversation de façon naturelle et amicale.\n- Argument du sens et de l''utilité : Expliquer que travailler dans le développement durable offre une satisfaction personnelle qu''on ne trouve pas dans la finance spéculative.\n- Argument d''avenir économique : Le marché vert est en pleine croissance, les compétences en finance durable et transition sont très recherchées et garantissent une sécurité de l''emploi à long terme.\n- Répondre aux craintes de l''ami : S''il s''inquiète de la baisse de salaire, souligner que les salaires de consultants seniors dans le vert sont désormais très compétitifs, et que la qualité de vie au travail compense largement les écarts potentiels.',
  'Le candidat doit faire preuve d''une grande spontanéité et d''un sens aigu de l''interaction. Le vocabulaire de la persuasion doit être riche, varié et nuancé, avec un registre informel parfaitement maîtrisé.',
  'Monde du travail et choix de carrière',
  10,
  true,
  true,
  '2026-05',
  true,
  'Sujet Chaud · Mai 2026'
)
;
