import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Logo } from '../components/Logo'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ──────────────────────────────────────────────────────────────
interface DiagnosticQuestion {
  id: string
  module: 'CO' | 'CE'
  level: 'A2' | 'B1' | 'B2' | 'C1'
  question_text: string
  audio_url?: string
  passage_text?: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct_answer: string
  explanation: string
}

// ── 30 Questions de diagnostic (15 CO, 15 CE) ─────────────────────────
const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // --- CO (Compréhension Orale) : Questions 1 à 15 ---
  {
    id: 'diag-co-1',
    module: 'CO',
    level: 'A2',
    question_text: 'D\'après le message, à quelle heure le train pour Montréal part-il ?',
    audio_url: 'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/co-q2-train.mp3',
    options: {
      A: 'À 14h15',
      B: 'À 14h30',
      C: 'À 14h45',
      D: 'À 15h00'
    },
    correct_answer: 'B',
    explanation: 'Le locuteur annonce clairement que le train numéro 45 à destination de Montréal partira de la voie 3 à quatorze heures trente.'
  },
  {
    id: 'diag-co-2',
    module: 'CO',
    level: 'A2',
    question_text: 'Où le rendez-vous entre Sophie et Pierre doit-il avoir lieu ?',
    options: {
      A: 'Au bureau',
      B: 'Au café de la Gare',
      C: 'Au restaurant de la Plage',
      D: 'Chez Pierre'
    },
    correct_answer: 'B',
    explanation: 'Sophie propose à Pierre de se retrouver devant le « café de la Gare » juste avant de prendre le train.'
  },
  {
    id: 'diag-co-3',
    module: 'CO',
    level: 'A2',
    question_text: 'Quel problème rencontre l\'interlocuteur au téléphone ?',
    options: {
      A: 'Sa voiture est en panne',
      B: 'Il a perdu ses clés de bureau',
      C: 'Son vol a été annulé',
      D: 'Il est bloqué dans les embouteillages'
    },
    correct_answer: 'D',
    explanation: 'Le message vocal indique : « Salut, je vais être en retard à la réunion, l\'autoroute est complètement bloquée par un accident ».'
  },
  {
    id: 'diag-co-4',
    module: 'CO',
    level: 'A2',
    question_text: 'Quel temps fait-il dans le nord du pays selon le bulletin météo ?',
    options: {
      A: 'Il y a du soleil',
      B: 'Il pleut abondamment',
      C: 'Il neige',
      D: 'Il y a du brouillard épais'
    },
    correct_answer: 'B',
    explanation: 'Le présentateur indique que les régions du nord subiront des averses soutenues toute la journée.'
  },
  {
    id: 'diag-co-5',
    module: 'CO',
    level: 'A2',
    question_text: 'Quelle tâche ménagère le père demande-t-il à son fils d\'accomplir ?',
    options: {
      A: 'Faire la vaisselle',
      B: 'Passer l\'aspirateur',
      C: 'Sortir la poubelle',
      D: 'Arroser les plantes'
    },
    correct_answer: 'C',
    explanation: 'Il dit : « Thomas, n\'oublie pas de sortir le bac à ordures avant de partir à l\'école, le camion passe bientôt ».'
  },
  {
    id: 'diag-co-6',
    module: 'CO',
    level: 'B1',
    question_text: 'Pourquoi la cliente n\'est-elle pas satisfaite de son achat ?',
    options: {
      A: 'Le vêtement est trop grand',
      B: 'La couleur ne correspond pas à sa commande',
      C: 'Le tissu présente un défaut de couture',
      D: 'La livraison a pris deux semaines de retard'
    },
    correct_answer: 'C',
    explanation: 'La cliente mentionne que la doublure intérieure de la veste est déchirée au niveau de la manche droite.'
  },
  {
    id: 'diag-co-7',
    module: 'CO',
    level: 'B1',
    question_text: 'Quelle solution le garagiste propose-t-il à son client ?',
    options: {
      A: 'Remplacer complètement le moteur',
      B: 'Faire une vidange et changer les filtres',
      C: 'Prêter un véhicule de courtoisie pendant les réparations',
      D: 'Reporter les réparations au mois prochain'
    },
    correct_answer: 'C',
    explanation: 'Le mécanicien dit : « On doit garder votre voiture jusqu\'à vendredi, mais nous pouvons vous laisser une petite citadine en attendant ».'
  },
  {
    id: 'diag-co-8',
    module: 'CO',
    level: 'B1',
    question_text: 'Quel est l\'objectif principal du nouveau projet de la mairie ?',
    options: {
      A: 'Construire un centre commercial',
      B: 'Créer un parc arboré en centre-ville',
      C: 'Aménager de nouvelles pistes cyclables',
      D: 'Rénover l\'hôtel de ville'
    },
    correct_answer: 'B',
    explanation: 'L\'élue municipale explique vouloir transformer une friche industrielle en espace vert pour amener de la biodiversité urbaine.'
  },
  {
    id: 'diag-co-9',
    module: 'CO',
    level: 'B1',
    question_text: 'Quel conseil l\'expert donne-t-il pour sécuriser un mot de passe ?',
    options: {
      A: 'Utiliser son nom de famille et sa date de naissance',
      B: 'Changer de mot de passe tous les dix jours',
      C: 'Créer des phrases longues et y insérer des caractères spéciaux',
      D: 'Noter ses mots de passe dans un fichier texte sur son bureau'
    },
    correct_answer: 'C',
    explanation: 'L\'expert recommande la méthode des « phrases de passe » composées de plusieurs mots aléatoires avec des symboles.'
  },
  {
    id: 'diag-co-10',
    module: 'CO',
    level: 'B1',
    question_text: 'Pourquoi l\'invité a-t-il décidé d\'adopter un mode de vie minimaliste ?',
    options: {
      A: 'Pour économiser de l\'argent pour voyager',
      B: 'Par souci d\'éthique écologique et pour réduire son stress',
      C: 'À la suite d\'un déménagement dans un studio plus petit',
      D: 'Pour suivre une tendance vue sur les réseaux sociaux'
    },
    correct_answer: 'B',
    explanation: 'L\'invité témoigne qu\'accumuler des objets l\'étouffait et que se détacher du matériel lui a apporté une paix mentale et réduit son empreinte carbone.'
  },
  {
    id: 'diag-co-11',
    module: 'CO',
    level: 'B2',
    question_text: 'Quelle est la réaction de Marc face à la proposition de délocalisation de son entreprise ?',
    options: {
      A: 'Il l\'approuve pleinement car cela va réduire les coûts',
      B: 'Il est sceptique quant aux avantages réels pour les employés',
      C: 'Il est indigné par le manque de communication de la direction',
      D: 'Il est enthousiaste à l\'idée de s\'installer à l\'étranger'
    },
    correct_answer: 'B',
    explanation: 'Marc exprime ses doutes : « Je ne suis pas convaincu que délocaliser nos bureaux en banlieue éloignée soit si bénéfique, le temps de trajet va exploser pour la majorité d\'entre nous ».'
  },
  {
    id: 'diag-co-12',
    module: 'CO',
    level: 'B2',
    question_text: 'Qu\'est-ce que l\'intervenante reproche aux campagnes actuelles de sensibilisation à l\'eau potable ?',
    options: {
      A: 'Elles sont trop chères à produire',
      B: 'Elles culpabilisent excessivement les consommateurs individuels',
      C: 'Elles ignorent complètement le rôle des industries polluantes',
      D: 'Elles manquent de clarté scientifique dans leurs explications'
    },
    correct_answer: 'B',
    explanation: 'L\'intervenante mentionne que demander aux citoyens de couper l\'eau en se brossant les dents est insuffisant et déplace la responsabilité morale alors que les fuites de réseaux collectifs perdent des millions de litres.'
  },
  {
    id: 'diag-co-13',
    module: 'CO',
    level: 'B2',
    question_text: 'Selon le reportage, quel impact l\'intelligence artificielle a-t-elle sur le métier de traducteur ?',
    options: {
      A: 'Elle va totalement remplacer les traducteurs d\'ici un an',
      B: 'Elle redéfinit leur rôle vers de la post-édition et de l\'adaptation culturelle',
      C: 'Elle n\'a aucun impact significatif sur la profession',
      D: 'Elle dégrade définitivement la qualité des textes littéraires'
    },
    correct_answer: 'B',
    explanation: 'Le linguiste explique que l\'IA traduit le brut très vite, mais que le traducteur humain intervient pour peaufiner l\'ironie, les expressions locales et le ton adapté.'
  },
  {
    id: 'diag-co-14',
    module: 'CO',
    level: 'C1',
    question_text: 'Quelle position le chercheur défend-t-il au sujet du déploiement de la géo-ingénierie solaire ?',
    options: {
      A: 'C\'est la solution ultime et sans danger pour refroidir la Terre',
      B: 'Une solution temporaire nécessaire, mais comportant des risques géopolitiques majeurs',
      C: 'Une pure spéculation scientifique impossible à mettre en œuvre techniquement',
      D: 'Une arnaque financière menée par les lobbys pétroliers'
    },
    correct_answer: 'B',
    explanation: 'Le climatologue soutient que pulvériser des aérosols pourrait aider à limiter la hausse thermique, mais prévient du risque d\'un « choc de terminaison » et des désaccords sur qui contrôle le thermostat mondial.'
  },
  {
    id: 'diag-co-15',
    module: 'CO',
    level: 'C1',
    question_text: 'Quel constat le sociologue dresse-t-il sur l\'évolution de la notion d\'espace intime au travail ?',
    options: {
      A: 'L\'open space a définitivement soudé la cohésion d\'équipe',
      B: 'La disparition des bureaux individuels a forcé les salariés à développer des stratégies invisibles de retrait',
      C: 'Le télétravail a rendu caduque la nécessité de protéger son intimité professionnelle',
      D: 'Les salariés recherchent une surveillance accrue de la part de leurs managers'
    },
    correct_answer: 'B',
    explanation: 'L\'étude sociologique montre qu\'en l\'absence de cloisons physiques, les employés portent des casques antibruit vides ou s\'isolent dans des salles de réunion pour recréer une frontière symbolique de leur intimité.'
  },

  // --- CE (Compréhension Écrite) : Questions 16 à 30 ---
  {
    id: 'diag-ce-1',
    module: 'CE',
    level: 'A2',
    passage_text: 'Chers collègues, suite à des travaux d\'entretien, l\'ascenseur du bâtiment B sera hors service du lundi 12 au mercredi 14 juin inclus. Veuillez utiliser les escaliers ou vous référer à l\'ascenseur de service du bâtiment A en cas de besoin de transport de charges lourdes. Merci de votre compréhension. — La Direction.',
    question_text: 'Quelle information est correcte d\'après cette note ?',
    options: {
      A: 'L\'ascenseur du bâtiment B sera réparé le lundi 12 juin uniquement.',
      B: 'L\'ascenseur du bâtiment B ne fonctionnera pas pendant trois jours.',
      C: 'Il est interdit de transporter des charges lourdes pendant les travaux.',
      D: 'Les escaliers du bâtiment A sont fermés pendant cette période.'
    },
    correct_answer: 'B',
    explanation: 'Du lundi 12 au mercredi 14 juin inclus équivaut à 3 jours complets de coupure (lundi, mardi, mercredi).'
  },
  {
    id: 'diag-ce-2',
    module: 'CE',
    level: 'A2',
    passage_text: 'Garantie Constructeur : Votre appareil est couvert contre tout vice de fabrication pour une durée de 2 ans à compter de sa date d\'achat figurant sur la facture. Cette garantie exclut les dommages résultant d\'une chute ou d\'une immersion dans un liquide. Conservez précieusement votre reçu pour toute demande d\'assistance.',
    question_text: 'Dans quel cas la garantie ne s\'applique-t-elle pas ?',
    options: {
      A: 'Si l\'appareil présente un défaut d\'usine au déballage.',
      B: 'Si l\'appareil cesse de fonctionner 18 mois après l\'achat.',
      C: 'Si l\'utilisateur fait tomber l\'appareil dans l\'eau.',
      D: 'Si l\'utilisateur égare la boîte d\'emballage d\'origine.'
    },
    correct_answer: 'C',
    explanation: 'Le texte précise expressément : « Cette garantie exclut les dommages résultant d\'une chute ou d\'une immersion dans un liquide ».'
  },
  {
    id: 'diag-ce-3',
    module: 'CE',
    level: 'A2',
    passage_text: 'Fermeture annuelle de la bibliothèque de Gatineau du 1er au 15 août. Les usagers peuvent emprunter jusqu\'à 10 ouvrages avant le 30 juillet, avec une date de retour prolongée exceptionnellement jusqu\'au 10 septembre. Aucun retour de livre n\'est possible pendant la fermeture.',
    question_text: 'Que doivent faire les abonnés qui souhaitent garder des livres pendant l\'été ?',
    options: {
      A: 'Rendre tous les livres avant le 1er août.',
      B: 'Les emprunter avant la fin juillet pour les rendre en septembre.',
      C: 'Venir les rendre à la mi-août pendant une permanence.',
      D: 'Acheter les livres à prix réduit avant la fermeture.'
    },
    correct_answer: 'B',
    explanation: 'Les abonnés doivent emprunter avant le 30 juillet (fin juillet) et ont jusqu\'au 10 septembre pour les retourner.'
  },
  {
    id: 'diag-ce-4',
    module: 'CE',
    level: 'A2',
    passage_text: 'Avis de recherche : Perdu chien Golden Retriever mâle de 4 ans répondant au nom de Félix dans le quartier du Vieux-Québec. Portait un collier rouge sans médaille. Il est très amical mais craintif. Récompense promise à toute personne permettant de le localiser.',
    question_text: 'Comment est décrit Félix ?',
    options: {
      A: 'C\'est un chien agressif qui aboie beaucoup.',
      B: 'C\'est un chien gentil mais facile à effrayer.',
      C: 'Il porte une médaille métallique avec son nom.',
      D: 'Il a été vu pour la dernière fois à Montréal.'
    },
    correct_answer: 'B',
    explanation: 'Le texte indique : « Il est très amical (gentil) mais craintif (facile à effrayer) ».'
  },
  {
    id: 'diag-ce-5',
    module: 'CE',
    level: 'A2',
    passage_text: 'Menu Midi Express : Entrée + Plat ou Plat + Dessert à 15,90 $, disponible uniquement du lundi au vendredi de 11h30 à 14h00. Le café est offert sur présentation de la carte étudiante. Les boissons ne sont pas incluses dans la formule.',
    question_text: 'Quelle proposition est vraie au sujet de la formule Midi Express ?',
    options: {
      A: 'Elle comprend systématiquement une boisson gazeuse.',
      B: 'Elle est disponible le samedi midi.',
      C: 'Elle coûte moins cher si l\'on prend seulement un plat.',
      D: 'Les étudiants peuvent bénéficier d\'un café gratuit.'
    },
    correct_answer: 'D',
    explanation: 'Le texte dit : « Le café est offert (gratuit) sur présentation de la carte étudiante ».'
  },
  {
    id: 'diag-ce-6',
    module: 'CE',
    level: 'B1',
    passage_text: 'Afin de limiter la pollution lumineuse et de réaliser des économies énergétiques substantielles, la commune de Val-d\'Or procède à l\'extinction des lampadaires publics de minuit à 5 heures du matin dans tous les quartiers résidentiels. Cette mesure a suscité des débats concernant la sécurité routière, mais les premières données montrent une diminution des excès de vitesse durant ces heures sombres.',
    question_text: 'Quel effet inattendu de cette extinction nocturne a été enregistré ?',
    options: {
      A: 'Une hausse significative des cambriolages.',
      B: 'Une réduction de la vitesse des automobilistes.',
      C: 'Une baisse des plaintes pour troubles du sommeil.',
      D: 'Une panne générale du réseau électrique municipal.'
    },
    correct_answer: 'B',
    explanation: 'Les premières données font état d\'une « diminution des excès de vitesse », ce qui correspond à une réduction de la vitesse des voitures.'
  },
  {
    id: 'diag-ce-7',
    module: 'CE',
    level: 'B1',
    passage_text: 'La réintroduction du castor dans la vallée de l\'Outaouais montre des effets écologiques très encourageants. En construisant des barrages, ces rongeurs créent des zones humides qui retiennent l\'eau pendant les périodes de sécheresse estivale et filtrent naturellement les polluants agricoles. Bien que certains propriétaires forestiers se plaignent d\'inondations localisées, l\'impact global sur la biodiversité est indéniablement positif.',
    question_text: 'Selon le texte, en quoi le castor aide-t-il à lutter contre le manque d\'eau en été ?',
    options: {
      A: 'Il creuse des puits profonds pour capter les nappes souterraines.',
      B: 'Ses structures retiennent les volumes d\'eau dans la vallée.',
      C: 'Il pousse les agriculteurs à consommer moins d\'eau.',
      D: 'Il filtre l\'eau de pluie pour la rendre potable.'
    },
    correct_answer: 'B',
    explanation: 'Les castors créent des barrages qui retiennent l\'eau, limitant ainsi l\'impact des sécheresses estivales.'
  },
  {
    id: 'diag-ce-8',
    module: 'CE',
    level: 'B1',
    passage_text: 'L\'utilisation d\'applications de productivité basées sur la technique Pomodoro (travailler 25 minutes puis faire 5 minutes de pause) s\'est largement répandue chez les télétravailleurs. Si cette approche permet d\'éviter l\'épuisement devant les écrans, les ergonomes soulignent qu\'elle coupe artificiellement des cycles de concentration profonds qui nécessitent parfois plus de 45 minutes pour s\'installer pleinement.',
    question_text: 'Quelle critique les spécialistes font-ils de la méthode Pomodoro ?',
    options: {
      A: 'Elle encourage la distraction pendant les pauses.',
      B: 'Elle interrompt le cerveau au milieu d\'un processus créatif ou analytique intense.',
      C: 'Elle demande trop d\'efforts de configuration matérielle.',
      D: 'Elle fatigue les yeux des travailleurs.'
    },
    correct_answer: 'B',
    explanation: 'Les ergonomes indiquent que couper toutes les 25 minutes empêche de s\'installer dans des « cycles de concentration profonds » nécessitant plus de temps.'
  },
  {
    id: 'diag-ce-9',
    module: 'CE',
    level: 'B1',
    passage_text: 'La direction du musée des Beaux-Arts a choisi de remplacer ses audioguides physiques par des codes QR collés à côté de chaque œuvre, que les visiteurs peuvent scanner avec leurs smartphones personnels. Cette transition numérique permet de supprimer le temps de désinfection obligatoire des appareils manuels entre chaque visite, bien que cela exclue les visiteurs ne maîtrisant pas l\'outil numérique.',
    question_text: 'Quel avantage opérationnel direct le musée tri-t-il de ce changement ?',
    options: {
      A: 'Il loue les audioguides à des prix plus élevés.',
      B: 'Il économise le temps auparavant dédié au nettoyage des appareils physiques.',
      C: 'Il augmente la fréquentation des visiteurs âgés.',
      D: 'Il réduit la bande passante de son réseau Wi-Fi.'
    },
    correct_answer: 'B',
    explanation: 'Le texte indique que cela « permet de supprimer le temps de désinfection obligatoire » (nettoyage) des appareils physiques.'
  },
  {
    id: 'diag-ce-10',
    module: 'CE',
    level: 'B1',
    passage_text: 'Le développement du covoiturage de courte distance peine à convaincre les banlieusards habitués au confort de leur véhicule personnel. Pour dynamiser la pratique, le gouvernement provincial envisage d\'ouvrir les voies de bus aux voitures contenant au moins trois passagers lors des heures de pointe. Les premiers tests montrent une baisse de 10% des temps de trajet pour les participants.',
    question_text: 'Quelle mesure est envisagée pour encourager le covoiturage ?',
    options: {
      A: 'Offrir des bons d\'achat de carburant gratuit aux conducteurs.',
      B: 'Autoriser les covoitureurs à utiliser des couloirs de circulation rapide normalement réservés.',
      C: 'Interdire le centre-ville aux voitures individuelles.',
      D: 'Rendre le stationnement gratuit pour tous.'
    },
    correct_answer: 'B',
    explanation: 'Le texte parle d\'ouvrir les voies de bus (couloirs de circulation réservés) aux voitures transportant plusieurs passagers.'
  },
  {
    id: 'diag-ce-11',
    module: 'CE',
    level: 'B2',
    passage_text: 'L\'essor de la « fast fashion » a transformé notre rapport au textile en créant un besoin permanent de renouvellement de garde-robe. Derrière la promesse d\'une démocratisation de la mode se cache une réalité sociale dévastatrice : l\'externalisation de la production vers des pays à bas coûts engendre des violations constantes des droits humains. De plus, la surproduction de fibres synthétiques non biodégradables asphyxie les écosystèmes marins où finissent par se déverser les microplastiques lors des lavages.',
    question_text: 'Quel problème écologique direct lié à l\'entretien de ces vêtements est soulevé ?',
    options: {
      A: 'La consommation gigantesque d\'eau potable dans les usines de teinture.',
      B: 'Le rejet de polluants atmosphériques lors de l\'incinération des excédents.',
      C: 'Le passage de résidus synthétiques dans les océans au moment du nettoyage en machine.',
      D: 'L\'utilisation d\'emballages plastiques jetables pour les livraisons à domicile.'
    },
    correct_answer: 'C',
    explanation: 'Le texte mentionne expressément les « microplastiques lors des lavages » (moment du nettoyage en machine) se déversant dans les écosystèmes marins (océans).'
  },
  {
    id: 'diag-ce-12',
    module: 'CE',
    level: 'B2',
    passage_text: 'L\'introduction du télétravail dans les grandes banques a permis de réduire les espaces de bureaux physiques de près de 30% grâce au système du « flex-office », où aucun bureau n\'est attribué de façon fixe. Cette restructuration spatiale, si elle ravit les gestionnaires immobiliers qui voient leurs coûts chuter, engendre une perte de repères chez les salariés. Ne plus disposer d\'un espace personnel à personnaliser nuit au sentiment d\'appartenance à l\'organisation.',
    question_text: 'Quelle conséquence le flex-office a-t-il sur la psychologie des employés ?',
    options: {
      A: 'Il accroît la productivité grâce au changement constant d\'environnement.',
      B: 'Il réduit l\'attachement symbolique du collaborateur envers son entreprise.',
      C: 'Il élimine les conflits de voisinage entre collègues de bureau.',
      D: 'Il complique la communication directe avec la direction.'
    },
    correct_answer: 'B',
    explanation: 'Le flex-office nuit au « sentiment d\'appartenance à l\'organisation » (l\'attachement symbolique envers son entreprise) en raison de la disparition de repères personnels.'
  },
  {
    id: 'diag-ce-13',
    module: 'CE',
    level: 'B2',
    passage_text: 'Face à la raréfaction des ressources en sable, indispensables à la fabrication du béton de construction, les ingénieurs se tournent vers le recyclage des gravats de démolition. Concasser le vieux béton pour en faire du sable de substitution permet d\'éviter l\'exploitation des carrières naturelles. Néanmoins, ce sable recyclé présente une porosité plus élevée, exigeant l\'incorporation d\'adjuvants chimiques coûteux pour garantir une résistance structurelle équivalente.',
    question_text: 'Quelle limite technique le sable de béton recyclé présente-t-il ?',
    options: {
      A: 'Il est trop lourd pour être transporté facilement sur les chantiers.',
      B: 'Sa structure poreuse nécessite des additifs financiers supplémentaires pour égaler la solidité du béton classique.',
      C: 'Il contient des substances toxiques dangereuses pour la santé des maçons.',
      D: 'Sa fabrication consomme plus d\'énergie que l\'extraction directe dans les rivières.'
    },
    correct_answer: 'B',
    explanation: 'La porosité plus élevée exige des « adjuvants chimiques coûteux » (additifs financiers supplémentaires) pour garantir une « résistance structurelle équivalente » (solidité).'
  },
  {
    id: 'diag-ce-14',
    module: 'CE',
    level: 'C1',
    passage_text: 'Le débat récurrent sur la pertinence de la notation chiffrée à l\'école élémentaire masque une opposition philosophique plus profonde sur le rôle même de l\'institution. D\'un côté, les partisans d\'une évaluation sommative classique défendent l\'idée que la note prépare l\'enfant aux réalités compétitives de la vie active. De l\'autre, les adeptes de l\'évaluation par compétences prônent une approche bienveillante où l\'erreur est appréhendée comme un levier cognitif plutôt que comme une sanction. En opposant stérilement sélection et accompagnement, le système éducatif omet de s\'interroger sur sa finalité première : l\'émancipation de l\'individu.',
    question_text: 'Quelle critique l\'auteur formule-t-il à l\'encontre des débats sur l\'évaluation scolaire ?',
    options: {
      A: 'Ils accordent une importance démesurée aux mathématiques au détriment des autres disciplines.',
      B: 'Ils se focalisent sur des détails méthodologiques au lieu d\'aborder la mission fondamentale de l\'école.',
      C: 'Ils sont menés par des théoriciens coupés des réalités vécues sur le terrain par les instituteurs.',
      D: 'Ils cherchent à importer des méthodes d\'évaluation américaines inadaptées au public européen.'
    },
    correct_answer: 'B',
    explanation: 'L\'auteur regrette que ces débats opposent de façon stérile les techniques d\'évaluation au lieu de s\'interroger sur la « finalité première : l\'émancipation de l\'individu » (mission fondamentale de l\'école).'
  },
  {
    id: 'diag-ce-15',
    module: 'CE',
    level: 'C1',
    passage_text: 'L\'essor fulgurant de la finance verte, matérialisé par l\'émission massive d\'obligations environnementales (« green bonds »), est présenté par les institutions bancaires comme le fer de lance de la transition écologique. Or, en l\'absence de normes internationales contraignantes et unifiées, cette labellisation relève trop souvent d\'une stratégie cosmétique d\'écoblanchiment. De nombreux fonds se parent d\'une vertu écologique tout en maintenant des participations indirectes dans des activités fossiles via des montages financiers opaques. Le verdissement des portefeuilles financiers s\'apparente ainsi à une illusion comptable qui retarde les arbitrages structurels douloureux mais indispensables au sauvetage climatique.',
    question_text: 'Quel jugement l\'auteur porte-t-il sur les obligations vertes actuelles ?',
    options: {
      A: 'Elles constituent un moteur économique indispensable au financement des énergies renouvelables.',
      B: 'Elles souffrent d\'un manque d\'intérêt de la part des grands investisseurs institutionnels.',
      C: 'Elles servent fréquemment d\'artifice marketing sans garantie de transition écologique réelle.',
      D: 'Elles sont trop lourdement taxées par les régulateurs étatiques des marchés financiers.'
    },
    correct_answer: 'C',
    explanation: 'L\'auteur dénonce une « stratégie cosmétique d\'écoblanchiment » (artifice marketing) et une « illusion comptable » sans réels changements structurels écologiques.'
  }
]

export default function DiagnosticPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // State managers
  const [step, setStep] = useState<'welcome' | 'test' | 'results'>('welcome')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  
  // Timer : 20 minutes en secondes = 1200 secondes
  const [timeLeft, setTimeLeft] = useState(1200)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Audio manager
  const [audioPlayCount, setAudioPlayCount] = useState<Record<string, number>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Result state
  const [assessedLevel, setAssessedLevel] = useState<'A2' | 'B1' | 'B2' | 'C1'>('B2')
  const [saving, setSaving] = useState(false)

  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentIndex]
  const userSelectedAnswer = answers[currentQuestion?.id]
  const progressPercent = Math.round((currentIndex / DIAGNOSTIC_QUESTIONS.length) * 100)

  // ── Timer Effect ───────────────────────────────────────────────────────
  useEffect(() => {
    if (step === 'test') {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
            handleFinishTest(answers)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [step, answers])

  // Stop audio on question change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [currentIndex])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // ── Gestion de l'audio ─────────────────────────────────────────────────
  const handlePlayAudio = () => {
    const qId = currentQuestion.id
    const currentPlays = audioPlayCount[qId] || 0

    if (currentPlays >= 2) {
      alert("Vous avez épuisé vos 2 écoutes autorisées pour cette question.")
      return
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(currentQuestion.audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setAudioPlayCount(prev => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }))
      }
    } else {
      audioRef.current.src = currentQuestion.audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error("Audio playback error, simulating finished listen:", err)
          setIsPlaying(false)
          setAudioPlayCount(prev => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }))
          alert("Erreur de chargement audio. L'écoute a été comptabilisée en mode texte fallback.")
        })
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAnswerSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }))
    
    // Auto-advance after 400ms for fluid UX
    setTimeout(() => {
      if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        handleFinishTest({ ...answers, [currentQuestion.id]: option })
      }
    }, 400)
  }

  const handleFinishTest = async (finalAnswers: Record<string, string>) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    
    // Calculate score
    const score = DIAGNOSTIC_QUESTIONS.filter(q => finalAnswers[q.id] === q.correct_answer).length

    // Determine CEFR level
    let level: 'A2' | 'B1' | 'B2' | 'C1' = 'A2'
    if (score >= 26) level = 'C1'
    else if (score >= 18) level = 'B2'
    else if (score >= 10) level = 'B1'

    setAssessedLevel(level)
    setStep('results')
    setSaving(true)

    // Save to database
    try {
      const userId = user?.id || 'mock-user-id'
      if (user) {
        // Update public.users level_assessed
        await supabase
          .from('users')
          .update({ level_assessed: level })
          .eq('id', userId)

        // Save session in sessions table to record historical trace of diagnostic
        const { data: session } = await supabase
          .from('sessions')
          .insert({
            user_id: userId,
            module: 'FULL_TCF', // or custom tag
            session_type: 'DIAGNOSTIC',
            test_type: 'BOTH',
            status: 'completed',
            score: score,
            total_questions: DIAGNOSTIC_QUESTIONS.length,
            started_at: new Date(Date.now() - (1200 - timeLeft) * 1000).toISOString(),
            completed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (session) {
          // Insert questions records into public.answers
          const answerInserts = DIAGNOSTIC_QUESTIONS.map(q => ({
            session_id: session.id,
            user_id: userId,
            question_id: q.id,
            user_answer: finalAnswers[q.id] || '',
            is_correct: finalAnswers[q.id] === q.correct_answer
          }))
          await supabase.from('answers').insert(answerInserts)
        }
      }
    } catch (dbErr) {
      console.error("Failed to persist diagnostic test results in DB:", dbErr)
    } finally {
      setSaving(false)
    }
  }

  // ── Render Screens ─────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

        <header className="px-6 py-5 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md relative z-10 select-none">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo />
            <Link to="/dashboard" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              Passer l'étape
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-xl mx-auto flex items-center justify-center px-6 py-12 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-slate-900/40 border border-slate-850/80 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-xl text-center"
          >
            <div className="text-5xl select-none animate-pulse">🧭</div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight font-display">Test Diagnostique</h1>
              <p className="text-slate-400 text-sm font-semibold leading-relaxed">
                Évaluez gratuitement votre niveau actuel en français pour générer un programme d'entraînement adapté et ciblé.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left py-2">
              <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl">
                <span className="text-xl block mb-1 select-none">🎧</span>
                <span className="text-xs font-black text-slate-300 block uppercase tracking-wider">Écoute</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">15 QCM Audio</span>
              </div>
              <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl">
                <span className="text-xl block mb-1 select-none">📖</span>
                <span className="text-xs font-black text-slate-300 block uppercase tracking-wider">Lecture</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">15 QCM Écrits</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/30 border border-slate-850/50 rounded-2xl p-4 text-xs font-semibold text-slate-400 text-left leading-relaxed">
              <div className="flex gap-2">
                <span className="text-blue-400">⏱️</span>
                <span>Durée limite : <strong>20 minutes</strong> (soumission automatique).</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400">🔊</span>
                <span><strong>2 écoutes maximum</strong> par question audio (CO).</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400">📊</span>
                <span>Grille d'évaluation calquée sur le barème officiel IRCC.</span>
              </div>
            </div>

            <button
              onClick={() => setStep('test')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/10 active:scale-98 select-none"
            >
              🚀 Commencer le Diagnostic
            </button>
          </motion.div>
        </main>

        <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950/60 text-center text-[10px] text-slate-650 font-medium select-none z-10">
          ayePREP © 2026. Préparation officielle TCF & TEF Canada.
        </footer>
      </div>
    )
  }

  if (step === 'test') {
    const isCO = currentQuestion.module === 'CO'
    const currentPlays = audioPlayCount[currentQuestion.id] || 0

    return (
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

        {/* Header timer and progress */}
        <header className="px-6 py-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md relative z-10 select-none">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <span className="text-xs font-black tracking-widest text-slate-450 uppercase">
              Question {currentIndex + 1} / {DIAGNOSTIC_QUESTIONS.length}
            </span>
            
            {/* Timer */}
            <div className={`px-4 py-1.5 border rounded-full text-xs font-extrabold flex items-center gap-1.5 ${timeLeft < 180 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
              <span>⏱️</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </header>

        {/* Progress bar */}
        <div className="h-1 bg-slate-900 relative z-10 w-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Question Panel */}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 flex items-center justify-center relative z-10 w-full">
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Left side: Passage CE or Audio player for CO */}
            <div className={`md:col-span-6 bg-slate-900/40 border border-slate-850/60 rounded-3xl p-6 flex flex-col justify-center backdrop-blur-xl ${!isCO && 'max-h-[360px] overflow-y-auto'}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {isCO ? (
                    <div className="text-center py-6 space-y-6 select-none">
                      <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl">
                        🎧
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-slate-200">Compréhension Orale</h3>
                        <p className="text-xs text-slate-550 font-semibold">Écoutez attentivement l'extrait audio pour répondre.</p>
                      </div>
                      
                      {/* Play trigger button */}
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={handlePlayAudio}
                          disabled={currentPlays >= 2 && !isPlaying}
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 cursor-pointer ${isPlaying ? 'bg-indigo-650 hover:bg-indigo-700 animate-pulse' : currentPlays >= 2 ? 'bg-slate-800 opacity-40 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          {isPlaying ? (
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          Écoutes effectuées : <strong className="text-blue-400">{currentPlays} / 2</strong>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-500/20 bg-purple-500/10 text-purple-400">
                        Texte de lecture
                      </span>
                      <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed font-serif whitespace-pre-line bg-slate-950/40 p-4 rounded-2xl border border-slate-850/50">
                        {currentQuestion.passage_text}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right side: Questions and options */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/40 border border-slate-850/60 rounded-3xl p-6 backdrop-blur-xl space-y-5"
                >
                  <div className="space-y-1.5 select-none">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded border border-slate-800 bg-slate-950">
                      Niveau {currentQuestion.level}
                    </span>
                    <h2 className="text-white font-bold leading-relaxed text-sm md:text-base font-display">
                      {currentQuestion.question_text}
                    </h2>
                  </div>

                  {/* MCQ Answers Selection */}
                  <div className="space-y-2.5">
                    {Object.entries(currentQuestion.options).map(([key, val]) => {
                      const isSelected = userSelectedAnswer === key
                      return (
                        <button
                          key={key}
                          onClick={() => handleAnswerSelect(key)}
                          className={`w-full text-left px-4 py-3 rounded-2xl border-2 text-xs font-semibold transition-all active:scale-[0.99] cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-500/10 text-blue-450' : 'border-slate-850 bg-slate-950/40 text-slate-300 hover:border-slate-700/60 hover:bg-slate-900/40'}`}
                        >
                          <span className="font-extrabold text-sm mr-2 text-blue-400">{key}.</span>
                          {val}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </main>

        <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950/60 text-center select-none z-10 flex justify-between items-center text-[10px] text-slate-550 font-bold uppercase tracking-wider">
          <span>Test diagnostique</span>
          <span>Module actif : {isCO ? 'Compréhension de l\'Oral' : 'Compréhension des Écrits'}</span>
        </footer>
      </div>
    )
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none select-none z-0"></div>

        <header className="px-6 py-5 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md relative z-10 select-none">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo />
            <span className="text-xs font-bold text-emerald-450 uppercase tracking-widest">Test complété ✓</span>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto flex items-center justify-center px-6 py-12 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-slate-900/40 border border-slate-850/80 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-xl text-center"
          >
            <div className="text-5xl select-none animate-bounce">🏆</div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Votre niveau évalué</span>
              <h1 className="text-6xl font-black text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text font-display tracking-tighter">
                {assessedLevel}
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                (Basé sur vos 30 questions de Compréhension Orale et Écrite)
              </p>
            </div>

            <div className="bg-slate-950/50 border border-slate-850/80 rounded-2xl p-4 text-xs font-semibold text-slate-300 text-left space-y-3 leading-relaxed">
              <p className="text-slate-400">
                {assessedLevel === 'C1' && "Félicitations ! Vous disposez déjà d'un excellent niveau de français. Nous allons vous aider à consolider vos acquis pour décrocher la note maximale à l'examen (CLB 10-12)."}
                {assessedLevel === 'B2' && "Bon niveau ! Vous possédez une bonne maîtrise intermédiaire. Notre plan va cibler vos points perfectibles pour vous faire franchir le palier C1 indispensable pour l'immigration."}
                {assessedLevel === 'B1' && "Niveau intermédiaire. Vous comprenez la majorité des échanges mais manquez encore de fluidité sur les structures complexes. Le parcours d'entraînement va poser des fondations solides."}
                {assessedLevel === 'A2' && "Niveau élémentaire. Il reste encore des bases de conjugaison et de vocabulaire à acquérir. Nous vous recommandons de commencer par les exercices d'entraînement simples."}
              </p>
              
              <div className="border-t border-slate-850/60 pt-3 flex items-center justify-between text-[10px] text-slate-450 uppercase">
                <span>Niveau cible conseillé :</span>
                <strong className="text-emerald-450 font-black">
                  {assessedLevel === 'C1' ? 'C2' : assessedLevel === 'B2' ? 'C1' : 'B2'}
                </strong>
              </div>
            </div>

            <div className="pt-2 space-y-3 select-none">
              <button
                onClick={() => navigate('/parcours')}
                disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
              >
                🗺️ Générer mon planning personnalisé
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                disabled={saving}
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-350 hover:text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                Accéder au tableau de bord
              </button>
            </div>
          </motion.div>
        </main>

        <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950/60 text-center text-[10px] text-slate-655 font-bold select-none z-10">
          Enregistrement de vos résultats en cours...
        </footer>
      </div>
    )
  }

  return null
}
