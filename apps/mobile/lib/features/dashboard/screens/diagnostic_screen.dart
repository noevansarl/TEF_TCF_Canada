import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:just_audio/just_audio.dart';
import '../../../shared/providers/providers.dart';
import '../../../shared/services/file_downloader.dart';

class DiagnosticQuestion {
  final String id;
  final String module; // 'CO' | 'CE'
  final String level; // 'A2' | 'B1' | 'B2' | 'C1'
  final String questionText;
  final String? audioUrl;
  final String? passageText;
  final Map<String, String> options;
  final String correctAnswer;
  final String explanation;

  const DiagnosticQuestion({
    required this.id,
    required this.module,
    required this.level,
    required this.questionText,
    this.audioUrl,
    this.passageText,
    required this.options,
    required this.correctAnswer,
    required this.explanation,
  });
}

// 30 Orientation questions (15 CO, 15 CE)
const List<DiagnosticQuestion> _questions = [
  // --- CO (Compréhension Orale) ---
  DiagnosticQuestion(
    id: 'diag-co-1',
    module: 'CO',
    level: 'A2',
    questionText: 'D\'après le message, à quelle heure le train pour Montréal part-il ?',
    audioUrl: 'https://ifbbwbyxdjxsbuilzzig.supabase.co/storage/v1/object/public/questions-audio/co-q2-train.mp3',
    options: {'A': 'À 14h15', 'B': 'À 14h30', 'C': 'À 14h45', 'D': 'À 15h00'},
    correctAnswer: 'B',
    explanation: 'Le locuteur annonce clairement que le train numéro 45 à destination de Montréal partira de la voie 3 à quatorze heures trente.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-2',
    module: 'CO',
    level: 'A2',
    questionText: 'Où le rendez-vous entre Sophie et Pierre doit-il avoir lieu ?',
    options: {'A': 'Au bureau', 'B': 'Au café de la Gare', 'C': 'Au restaurant de la Plage', 'D': 'Chez Pierre'},
    correctAnswer: 'B',
    explanation: 'Sophie propose à Pierre de se retrouver devant le « café de la Gare » juste avant de prendre le train.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-3',
    module: 'CO',
    level: 'A2',
    questionText: 'Quel problème rencontre l\'interlocuteur au téléphone ?',
    options: {
      'A': 'Sa voiture est en panne',
      'B': 'Il a perdu ses clés de bureau',
      'C': 'Son vol a été annulé',
      'D': 'Il est bloqué dans les embouteillages'
    },
    correctAnswer: 'D',
    explanation: 'Le message vocal indique : « Salut, je vais être en retard à la réunion, l\'autoroute est complètement bloquée par un accident ».',
  ),
  DiagnosticQuestion(
    id: 'diag-co-4',
    module: 'CO',
    level: 'A2',
    questionText: 'Quel temps fait-il dans le nord du pays selon le bulletin météo ?',
    options: {'A': 'Il y a du soleil', 'B': 'Il pleut abondamment', 'C': 'Il neige', 'D': 'Il y a du brouillard épais'},
    correctAnswer: 'B',
    explanation: 'Le présentateur indique que les régions du nord subiront des averses soutenues toute la journée.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-5',
    module: 'CO',
    level: 'A2',
    questionText: 'Quelle tâche ménagère le père demande-t-il à son fils d\'accomplir ?',
    options: {'A': 'Faire la vaisselle', 'B': 'Passer l\'aspirateur', 'C': 'Sortir la poubelle', 'D': 'Arroser les plantes'},
    correctAnswer: 'C',
    explanation: 'Il dit : « Thomas, n\'oublie pas de sortir le bac à ordures avant de partir à l\'école, le camion passe bientôt ».',
  ),
  DiagnosticQuestion(
    id: 'diag-co-6',
    module: 'CO',
    level: 'B1',
    questionText: 'Pourquoi la cliente n\'est-elle pas satisfaite de son achat ?',
    options: {
      'A': 'Le vêtement est trop grand',
      'B': 'La couleur ne correspond pas à sa commande',
      'C': 'Le tissu présente un défaut de couture',
      'D': 'La livraison a pris deux semaines de retard'
    },
    correctAnswer: 'C',
    explanation: 'La cliente mentionne que la doublure intérieure de la veste est déchirée au niveau de la manche droite.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-7',
    module: 'CO',
    level: 'B1',
    questionText: 'Quelle solution le garagiste propose-t-il à son client ?',
    options: {
      'A': 'Remplacer complètement le moteur',
      'B': 'Faire une vidange et changer les filtres',
      'C': 'Prêter un véhicule de courtoisie pendant les réparations',
      'D': 'Reporter les réparations au mois prochain'
    },
    correctAnswer: 'C',
    explanation: 'Le mécanicien dit : « On doit garder votre voiture jusqu\'à vendredi, mais nous pouvons vous laisser une petite citadine en attendant ».',
  ),
  DiagnosticQuestion(
    id: 'diag-co-8',
    module: 'CO',
    level: 'B1',
    questionText: 'Quel est l\'objectif principal du nouveau projet de la mairie ?',
    options: {
      'A': 'Construire un centre commercial',
      'B': 'Créer un parc arboré en centre-ville',
      'C': 'Aménager de nouvelles pistes cyclables',
      'D': 'Rénover l\'hôtel de ville'
    },
    correctAnswer: 'B',
    explanation: 'L\'élue municipale explique vouloir transformer une friche industrielle en espace vert pour amener de la biodiversité urbaine.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-9',
    module: 'CO',
    level: 'B1',
    questionText: 'Quel conseil l\'expert donne-t-il pour sécuriser un mot de passe ?',
    options: {
      'A': 'Utiliser son nom de famille et sa date de naissance',
      'B': 'Changer de mot de passe tous les dix jours',
      'C': 'Créer des phrases longues et y insérer des caractères spéciaux',
      'D': 'Noter ses mots de passe dans un fichier texte sur son bureau'
    },
    correctAnswer: 'C',
    explanation: 'L\'expert recommande la méthode des « phrases de passe » composées de plusieurs mots aléatoires avec des symboles.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-10',
    module: 'CO',
    level: 'B1',
    questionText: 'Pourquoi l\'invité a-t-il décidé d\'adopter un mode de vie minimaliste ?',
    options: {
      'A': 'Pour économiser de l\'argent pour voyager',
      'B': 'Par souci d\'éthique écologique et pour réduire son stress',
      'C': 'À la suite d\'un déménagement dans un studio plus petit',
      'D': 'Pour suivre une tendance vue sur les réseaux sociaux'
    },
    correctAnswer: 'B',
    explanation: 'L\'invité témoigne qu\'accumuler des objets l\'étouffait et que se détacher du matériel lui a apporté une paix mentale et réduit son empreinte carbone.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-11',
    module: 'CO',
    level: 'B2',
    questionText: 'Quelle est la réaction de Marc face à la proposition de délocalisation de son entreprise ?',
    options: {
      'A': 'Il l\'approuve pleinement car cela va réduire les coûts',
      'B': 'Il est sceptique quant aux avantages réels pour les employés',
      'C': 'Il est indigné par le manque de communication de la direction',
      'D': 'Il est enthousiaste à l\'idée de s\'installer à l\'étranger'
    },
    correctAnswer: 'B',
    explanation: 'Marc exprime ses doutes : « Je ne suis pas convaincu que délocaliser nos bureaux en banlieue éloignée soit si bénéfique, le temps de trajet va exploser pour la majorité d\'entre nous ».',
  ),
  DiagnosticQuestion(
    id: 'diag-co-12',
    module: 'CO',
    level: 'B2',
    questionText: 'Qu\'est-ce que l\'intervenante reproche aux campagnes actuelles de sensibilisation à l\'eau potable ?',
    options: {
      'A': 'Elles sont trop chères à produire',
      'B': 'Elles culpabilisent excessivement les consommateurs individuels',
      'C': 'Elles ignorent complètement le rôle des industries polluantes',
      'D': 'Elles manquent de clarté scientifique dans leurs explications'
    },
    correctAnswer: 'B',
    explanation: 'L\'intervenante mentionne que demander aux citoyens de couper l\'eau en se brossant les dents est insuffisant et déplace la responsabilité morale alors que les fuites de réseaux collectifs perdent des millions de litres.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-13',
    module: 'CO',
    level: 'B2',
    questionText: 'Selon le reportage, quel impact l\'intelligence artificielle a-t-elle sur le métier de traducteur ?',
    options: {
      'A': 'Elle va totalement remplacer les traducteurs d\'ici un an',
      'B': 'Elle redéfinit leur rôle vers de la post-édition et de l\'adaptation culturelle',
      'C': 'Elle n\'a aucun impact significatif sur la profession',
      'D': 'Elle dégrade définitivement la qualité des textes littéraires'
    },
    correctAnswer: 'B',
    explanation: 'Le linguiste explique que l\'IA traduit le brut très vite, mais que le traducteur humain intervient pour peaufiner l\'ironie, les expressions locales et le ton adapté.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-14',
    module: 'CO',
    level: 'C1',
    questionText: 'Quelle position le chercheur défend-t-il au sujet du déploiement de la géo-ingénierie solaire ?',
    options: {
      'A': 'C\'est la solution ultime et sans danger pour refroidir la Terre',
      'B': 'Une solution temporaire nécessaire, mais comportant des risques géopolitiques majeurs',
      'C': 'Une pure spéculation scientifique impossible à mettre en œuvre techniquement',
      'D': 'Une arnaque financière menée par les lobbys pétroliers'
    },
    correctAnswer: 'B',
    explanation: 'Le climatologue soutient que pulvériser des aérosols pourrait aider à limiter la hausse thermique, mais prévient du risque d\'un « choc de terminaison » et des désaccords sur qui contrôle le thermostat mondial.',
  ),
  DiagnosticQuestion(
    id: 'diag-co-15',
    module: 'CO',
    level: 'C1',
    questionText: 'Quel constat le sociologue dresse-t-il sur l\'évolution de la notion d\'espace intime au travail ?',
    options: {
      'A': 'L\'open space a définitivement soudé la cohésion d\'équipe',
      'B': 'La disparition des bureaux individuels a forcé les salariés à développer des stratégies invisibles de retrait',
      'C': 'Le télétravail a rendu caduque la nécessité de protéger son intimité professionnelle',
      'D': 'Les salariés recherchent une surveillance accrue de la part de leurs managers'
    },
    correctAnswer: 'B',
    explanation: 'L\'étude sociologique montre qu\'en l\'absence de cloisons physiques, les employés portent des casques antibruit vides ou s\'isolent dans des salles de réunion pour recréer une frontière symbolique de leur intimité.',
  ),

  // --- CE (Compréhension Écrite) ---
  DiagnosticQuestion(
    id: 'diag-ce-1',
    module: 'CE',
    level: 'A2',
    passageText: 'Chers collègues, suite à des travaux d\'entretien, l\'ascenseur du bâtiment B sera hors service du lundi 12 au mercredi 14 juin inclus. Veuillez utiliser les escaliers ou vous référer à l\'ascenseur de service du bâtiment A en cas de besoin de transport de charges lourdes. Merci de votre compréhension. — La Direction.',
    questionText: 'Quelle information est correcte d\'après cette note ?',
    options: {
      'A': 'L\'ascenseur du bâtiment B sera réparé le lundi 12 juin uniquement.',
      'B': 'L\'ascenseur du bâtiment B ne fonctionnera pas pendant trois jours.',
      'C': 'Il est interdit de transporter des charges lourdes pendant les travaux.',
      'D': 'Les escaliers du bâtiment A sont fermés pendant cette période.'
    },
    correctAnswer: 'B',
    explanation: 'Du lundi 12 au mercredi 14 juin inclus équivaut à 3 jours complets de coupure (lundi, mardi, mercredi).',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-2',
    module: 'CE',
    level: 'A2',
    passageText: 'Garantie Constructeur : Votre appareil est couvert contre tout vice de fabrication pour une durée de 2 ans à compter de sa date d\'achat figurant sur la facture. Cette garantie exclut les dommages résultant d\'une chute ou d\'une immersion dans un liquide. Conservez précieusement votre reçu pour toute demande d\'assistance.',
    questionText: 'Dans quel cas la garantie ne s\'applique-t-elle pas ?',
    options: {
      'A': 'Si l\'appareil présente un défaut d\'usine au déballage.',
      'B': 'Si l\'appareil cesse de fonctionner 18 mois après l\'achat.',
      'C': 'Si l\'utilisateur fait tomber l\'appareil dans l\'eau.',
      'D': 'Si l\'utilisateur égare la boîte d\'emballage d\'origine.'
    },
    correctAnswer: 'C',
    explanation: 'Le texte précise expressément : « Cette garantie exclut les dommages résultant d\'une chute ou d\'une immersion dans un liquide ».',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-3',
    module: 'CE',
    level: 'A2',
    passageText: 'Fermeture annuelle de la bibliothèque de Gatineau du 1er au 15 août. Les usagers peuvent emprunter jusqu\'à 10 ouvrages avant le 30 juillet, avec une date de retour prolongée exceptionnellement jusqu\'au 10 septembre. Aucun retour de livre n\'est possible pendant la fermeture.',
    questionText: 'Que doivent faire les abonnés qui souhaitent garder des livres pendant l\'été ?',
    options: {
      'A': 'Rendre tous les livres avant le 1er août.',
      'B': 'Les emprunter avant la fin juillet pour les rendre en septembre.',
      'C': 'Venir les rendre à la mi-août pendant une permanence.',
      'D': 'Acheter les livres à prix réduit avant la fermeture.'
    },
    correctAnswer: 'B',
    explanation: 'Les abonnés doivent emprunter avant le 30 juillet (fin juillet) et ont jusqu\'au 10 septembre pour les retourner.',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-4',
    module: 'CE',
    level: 'A2',
    passageText: 'Avis de recherche : Perdu chien Golden Retriever mâle de 4 ans répondant au nom de Félix dans le quartier du Vieux-Québec. Portait un collier rouge sans médaille. Il est très amical mais craintif. Récompense promise à toute personne permettant de le localiser.',
    questionText: 'Comment est décrit Félix ?',
    options: {
      'A': 'C\'est un chien agressif qui aboie beaucoup.',
      'B': 'C\'est un chien gentil mais facile à effrayer.',
      'C': 'Il porte une médaille métallique avec son nom.',
      'D': 'Il a été vu pour la dernière fois à Montréal.'
    },
    correctAnswer: 'B',
    explanation: 'Le texte indique : « Il est très amical (gentil) mais craintif (facile à effrayer) ».',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-5',
    module: 'CE',
    level: 'A2',
    passageText: 'Menu Midi Express : Entrée + Plat ou Plat + Dessert à 15,90 $, disponible uniquement du lundi au vendredi de 11h30 à 14h00. Le café est offert sur présentation de la carte étudiante. Les boissons ne sont pas incluses dans la formule.',
    questionText: 'Quelle proposition est vraie au sujet de la formule Midi Express ?',
    options: {
      'A': 'Elle comprend systématiquement une boisson gazeuse.',
      'B': 'Elle est disponible le samedi midi.',
      'C': 'Elle coûte moins cher si l\'on prend seulement un plat.',
      'D': 'Les étudiants peuvent bénéficier d\'un café gratuit.'
    },
    correctAnswer: 'D',
    explanation: 'Le texte dit : « Le café est offert (gratuit) sur présentation de la carte étudiante ».',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-6',
    module: 'CE',
    level: 'B1',
    passageText: 'Afin de limiter la pollution lumineuse et de réaliser des économies énergétiques substantielles, la commune de Val-d\'Or procède à l\'extinction des lampadaires publics de minuit à 5 heures du matin dans tous les quartiers résidentiels. Cette mesure a suscité des débats concernant la sécurité routière, mais les premières données montrent une diminution des excès de vitesse durant ces heures sombres.',
    questionText: 'Quel effet inattendu de cette extinction nocturne a été enregistré ?',
    options: {
      'A': 'Une hausse significative des cambriolages.',
      'B': 'Une réduction de la vitesse des automobilistes.',
      'C': 'Une baisse des plaintes pour troubles du sommeil.',
      'D': 'Une panne générale du réseau électrique municipal.'
    },
    correctAnswer: 'B',
    explanation: 'Les premières données font état d\'une « diminution des excès de vitesse », ce qui correspond à une réduction de la vitesse des voitures.',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-7',
    module: 'CE',
    level: 'B1',
    passageText: 'La réintroduction du castor dans la vallée de l\'Outaouais montre des effets écologiques très encourageants. En construisant des barrages, ces rongeurs créent des zones humides qui retiennent l\'eau pendant les périodes de sécheresse estivale et filtrent naturellement les polluants agricoles. Bien que certains propriétaires forestiers se plaignent d\'inondations localisées, l\'impact global sur la biodiversité est indéniablement positif.',
    questionText: 'Selon le texte, en quoi le castor aide-t-il à lutter contre le manque d\'eau en été ?',
    options: {
      'A': 'Il creuse des puits profonds pour capter les nappes souterraines.',
      'B': 'Ses structures retiennent les volumes d\'eau dans la vallée.',
      'C': 'Il pousse les agriculteurs à consommer moins d\'eau.',
      'D': 'Il filtre l\'eau de pluie pour la rendre potable.'
    },
    correctAnswer: 'B',
    explanation: 'Les castors créent des barrages qui retiennent l\'eau, limitant ainsi l\'impact des sécheresses estivales.',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-8',
    module: 'CE',
    level: 'B1',
    passageText: 'L\'utilisation d\'applications de productivité basées sur la technique Pomodoro (travailler 25 minutes puis faire 5 minutes de pause) s\'est largement répandue chez les télétravailleurs. Si cette approche permet d\'éviter l\'épuisement devant les écrans, les ergonomes soulignent qu\'elle coupe artificiellement des cycles de concentration profonds qui nécessitent parfois plus de 45 minutes pour s\'installer pleinement.',
    questionText: 'Quelle critique les spécialistes font-ils de la méthode Pomodoro ?',
    options: {
      'A': 'Elle encourage la distraction pendant les pauses.',
      'B': 'Elle interrompt le cerveau au milieu d\'un processus créatif ou analytique intense.',
      'C': 'Elle demande trop d\'efforts de configuration matérielle.',
      'D': 'Elle fatigue les yeux des travailleurs.'
    },
    correctAnswer: 'B',
    explanation: 'Les ergonomes indiquent que couper toutes les 25 minutes empêche de s\'installer dans des « cycles de concentration profonds » nécessitant plus de temps.',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-9',
    module: 'CE',
    level: 'B1',
    passageText: 'La direction du musée des Beaux-Arts a choisi de remplacer ses audioguides physiques par des codes QR collés à côté de chaque œuvre, que les visiteurs peuvent scanner avec leurs smartphones personnels. Cette transition numérique permet de supprimer le temps de désinfection obligatoire des appareils manuels entre chaque visite, bien que cela exclue les visiteurs ne maîtrisant pas l\'outil numérique.',
    questionText: 'Quel avantage opérationnel direct le musée tire-t-il de ce changement ?',
    options: {
      'A': 'Il loue les audioguides à des prix plus élevés.',
      'B': 'Il économise le temps auparavant dédié au nettoyage des appareils physiques.',
      'C': 'Il augmente la fréquentation des visiteurs âgés.',
      'D': 'Il réduit la bande passante de son réseau Wi-Fi.'
    },
    correctAnswer: 'B',
    explanation: 'Le texte indique que cela « permet de supprimer le temps de désinfection obligatoire » (nettoyage) des appareils physiques.',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-10',
    module: 'CE',
    level: 'B1',
    passageText: 'Le développement du covoiturage de courte distance peine à convaincre les banlieusards habitués au confort de leur véhicule personnel. Pour dynamiser la pratique, le gouvernement provincial envisage d\'ouvrir les voies de bus aux voitures contenant au moins trois passagers lors des heures de pointe. Les premiers tests montrent une baisse de 10% des temps de trajet pour les participants.',
    questionText: 'Quelle mesure est envisagée pour encourager le covoiturage ?',
    options: {
      'A': 'Offrir des bons d\'achat de carburant gratuit aux conducteurs.',
      'B': 'Autoriser les covoitureurs à utiliser des couloirs de circulation rapide normalement réservés.',
      'C': 'Interdire le centre-ville aux voitures individuelles.',
      'D': 'Rendre le stationnement gratuit pour tous.'
    },
    correctAnswer: 'B',
    explanation: 'Le texte parle d\'ouvrir les voies de bus (couloirs de circulation réservés) aux voitures transportant plusieurs passagers.',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-11',
    module: 'CE',
    level: 'B2',
    passageText: 'L\'essor de la « fast fashion » a transformé notre rapport au textile en créant un besoin permanent de renouvellement de garde-robe. Derrière la promesse d\'une démocratisation de la mode se cache une réalité sociale dévastatrice : l\'externalisation de la production vers des pays à bas coûts engendre des violations constantes des droits humains. De plus, la surproduction de fibres synthétiques non biodégradables asphyxie les écosystèmes marins où finissent par se déverser les microplastiques lors des lavages.',
    questionText: 'Quel problème écologique direct lié à l\'entretien de ces vêtements est soulevé ?',
    options: {
      'A': 'La consommation gigantesque d\'eau potable dans les usines de teinture.',
      'B': 'Le rejet de polluants atmosphériques lors de l\'incinération des excédents.',
      'C': 'Le passage de résidus synthétiques dans les océans au moment du nettoyage en machine.',
      'D': 'L\'utilisation d\'emballages plastiques jetables pour les livraisons à domicile.'
    },
    correctAnswer: 'C',
    explanation: 'Le texte mentionne expressément les « microplastiques lors des lavages » (moment du nettoyage en machine) se déversant dans les écosystèmes marins (océans).',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-12',
    module: 'CE',
    level: 'B2',
    passageText: 'L\'introduction du télétravail dans les grandes banques a permis de réduire les espaces de bureaux physiques de près de 30% grâce au système du « flex-office », où aucun bureau n\'est attribué de façon fixe. Cette restructuration spatiale, si elle ravit les gestionnaires immobiliers qui voient leurs coûts chuter, engendre une perte de repères chez les salariés. Ne plus disposer d\'un espace personnel à personnaliser nuit au sentiment d\'appartenance à l\'organisation.',
    questionText: 'Quelle conséquence le flex-office a-t-il sur la psychologie des employés ?',
    options: {
      'A': 'Il accroît la productivité grâce au changement constant d\'environnement.',
      'B': 'Il réduit l\'attachement symbolique du collaborateur envers son entreprise.',
      'C': 'Il élimine les conflits de voisinage entre collègues de bureau.',
      'D': 'Il complique la communication directe avec la direction.'
    },
    correctAnswer: 'B',
    explanation: 'Le flex-office nuit au « sentiment d\'appartenance à l\'organisation » (l\'attachement symbolique envers son entreprise) en raison de la disparition de repères personnels.',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-13',
    module: 'CE',
    level: 'B2',
    passageText: 'Face à la raréfaction des ressources en sable, indispensables à la fabrication du béton de construction, les ingénieurs se tournent vers le recyclage des gravats de démolition. Concasser le vieux béton pour en faire du sable de substitution permet d\'éviter l\'exploitation des carrières naturelles. Néanmoins, ce sable recyclé présente une porosité plus élevée, exigeant l\'incorporation d\'adjuvants chimiques coûteux pour garantir une résistance structurelle équivalente.',
    questionText: 'Quelle limite technique le sable de béton recyclé présente-t-il ?',
    options: {
      'A': 'Il est trop lourd pour être transporté facilement sur les chantiers.',
      'B': 'Sa structure poreuse nécessite des additifs financiers supplémentaires pour égaler la solidité du béton classique.',
      'C': 'Il contient des substances toxiques dangereuses pour la santé des maçons.',
      'D': 'Sa fabrication consomme plus d\'énergie que l\'extraction directe dans les rivières.'
    },
    correctAnswer: 'B',
    explanation: 'La porosité plus élevée exige des « adjuvants chimiques coûteux » (additifs financiers supplémentaires) pour garantir une « résistance structurelle équivalente » (solidité).',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-14',
    module: 'CE',
    level: 'C1',
    passageText: 'Le débat récurrent sur la pertinence de la notation chiffrée à l\'école élémentaire masque une opposition philosophique plus profonde sur le rôle même de l\'institution. D\'un côté, les partisans d\'une évaluation sommative classique défendent l\'idée que la note prépare l\'enfant aux réalités compétitives de la vie active. De l\'autre, les adeptes de l\'évaluation par compétences prônent une approche bienveillante où l\'erreur est appréhendée comme un levier cognitif plutôt que comme une sanction. En opposant stérilement sélection et accompagnement, le système éducatif omet de s\'interroger sur sa finalité première : l\'émancipation de l\'individu.',
    questionText: 'Quelle critique l\'auteur formule-t-il à l\'encontre des débats sur l\'évaluation scolaire ?',
    options: {
      'A': 'Ils accordent une importance démesurée aux mathématiques au détriment des autres disciplines.',
      'B': 'Ils se focalisent sur des détails méthodologiques au lieu d\'aborder la mission fondamentale de l\'école.',
      'C': 'Ils sont menés par des théoriciens coupés des réalités vécues sur le terrain par les instituteurs.',
      'D': 'Ils cherchent à importer des méthodes d\'évaluation américaines inadaptées au public européen.'
    },
    correctAnswer: 'B',
    explanation: 'L\'auteur regrette que ces débats opposent de façon stérile les techniques d\'évaluation au lieu de s\'interroger sur la « finalité première : l\'émancipation de l\'individu » (mission fondamentale de l\'école).',
  ),
  DiagnosticQuestion(
    id: 'diag-ce-15',
    module: 'CE',
    level: 'C1',
    passageText: 'L\'essor fulgurant de la finance verte, matérialisé par l\'émission massive d\'obligations environnementales (« green bonds »), est présenté par les institutions bancaires comme le fer de lance de la transition écologique. Or, en l\'absence de normes internationales contraignantes et unifiées, cette labellisation relève trop souvent d\'une stratégie cosmétique d\'écoblanchiment. De nombreux fonds se parent d\'une vertu écologique tout en maintenant des participations indirectes dans des activités fossiles via des montages financiers opaques. Le verdissement des portefeuilles financiers s\'apparente ainsi à une illusion comptable qui retarde les arbitrages structurels douloureux mais indispensables au sauvetage climatique.',
    questionText: 'Quel jugement l\'auteur porte-t-il sur les obligations vertes actuelles ?',
    options: {
      'A': 'Elles constituent un moteur économique indispensable au financement des énergies renouvelables.',
      'B': 'Elles souffrent d\'un manque d\'intérêt de la part des grands investisseurs institutionnels.',
      'C': 'Elles servent fréquemment d\'artifice marketing sans garantie de transition écologique réelle.',
      'D': 'Elles sont trop lourdement taxées par les régulateurs étatiques des marchés financiers.'
    },
    correctAnswer: 'C',
    explanation: 'L\'auteur dénonce une « stratégie cosmétique d\'écoblanchiment » (artifice marketing) et une « illusion comptable » sans réels changements structurels écologiques.',
  ),
];

class DiagnosticScreen extends ConsumerStatefulWidget {
  const DiagnosticScreen({super.key});

  @override
  ConsumerState<DiagnosticScreen> createState() => _DiagnosticScreenState();
}

class _DiagnosticScreenState extends ConsumerState<DiagnosticScreen> {
  String _step = 'welcome'; // 'welcome' | 'test' | 'results'
  int _currentIndex = 0;
  final Map<String, String> _answers = {};
  
  // Timer settings
  Timer? _timer;
  int _timeLeft = 1200; // 20 minutes in seconds

  // Audio settings
  final AudioPlayer _audioPlayer = AudioPlayer();
  final Map<String, int> _audioPlayCounts = {};
  bool _isPlaying = false;
  StreamSubscription? _playerStateSub;

  // Evaluation states
  String _assessedLevel = 'A2';
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _initAudioPlayer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _playerStateSub?.cancel();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _initAudioPlayer() {
    _playerStateSub = _audioPlayer.playerStateStream.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state.playing;
          if (state.processingState == ProcessingState.completed) {
            _audioPlayer.seek(Duration.zero);
            _audioPlayer.pause();
            final qId = _questions[_currentIndex].id;
            _audioPlayCounts[qId] = (_audioPlayCounts[qId] ?? 0) + 1;
          }
        });
      }
    });
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          if (_timeLeft <= 1) {
            _timer?.cancel();
            _timeLeft = 0;
            _finishTest();
          } else {
            _timeLeft--;
          }
        });
      }
    });
  }

  String _formatTime(int totalSeconds) {
    final mins = totalSeconds ~/ 60;
    final secs = totalSeconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  Future<void> _playPauseAudio(String? url) async {
    final String audioUrl = url ?? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    final qId = _questions[_currentIndex].id;
    final currentPlays = _audioPlayCounts[qId] ?? 0;

    if (currentPlays >= 2 && !_isPlaying) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vous avez épuisé vos 2 écoutes autorisées pour cette question.')),
      );
      return;
    }

    try {
      if (_isPlaying) {
        await _audioPlayer.pause();
      } else {
        // Cacher localement ou utiliser le fichier téléchargé
        final localPath = await FileDownloader.downloadFile(audioUrl);
        if (localPath != null) {
          await _audioPlayer.setFilePath(localPath);
        } else {
          await _audioPlayer.setUrl(audioUrl);
        }
        await _audioPlayer.play();
      }
    } catch (e) {
      debugPrint('Audio loading error, simulating play count update: $e');
      if (mounted) {
        setState(() {
          _isPlaying = false;
          _audioPlayCounts[qId] = (_audioPlayCounts[qId] ?? 0) + 1;
        });
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur de lecture audio. Extrait comptabilisé.')),
      );
    }
  }

  void _selectAnswer(String option) {
    final currentQuestion = _questions[_currentIndex];
    _answers[currentQuestion.id] = option;

    // Halt audio if playing
    if (_isPlaying) {
      _audioPlayer.stop();
      _isPlaying = false;
    }

    // Brief delay for feedback before advancing
    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      setState(() {
        if (_currentIndex < _questions.length - 1) {
          _currentIndex++;
        } else {
          _finishTest();
        }
      });
    });
  }

  Future<void> _finishTest() async {
    _timer?.cancel();
    if (_isPlaying) {
      _audioPlayer.stop();
    }

    // Calculate score
    int score = 0;
    for (final q in _questions) {
      if (_answers[q.id] == q.correctAnswer) {
        score++;
      }
    }

    // Determine CEFR Level
    String level = 'A2';
    if (score >= 26) {
      level = 'C1';
    } else if (score >= 18) {
      level = 'B2';
    } else if (score >= 10) {
      level = 'B1';
    }

    setState(() {
      _assessedLevel = level;
      _step = 'results';
      _isSaving = true;
    });

    // Save to Supabase
    try {
      final supabaseService = ref.read(supabaseServiceProvider);
      final userId = supabaseService.currentUser?.id;

      if (userId != null && !supabaseService.useMock) {
        final client = supabaseService.client;

        // 1. Update user assessed level
        await client.from('users').update({
          'level_assessed': level,
        }).eq('id', userId);

        // 2. Create diagnostic session trace
        final durationUsed = 1200 - _timeLeft;
        final session = await client.from('sessions').insert({
          'user_id': userId,
          'module': 'FULL_TCF',
          'session_type': 'DIAGNOSTIC',
          'test_type': 'TCF_CANADA',
          'level': 'MIXED',
          'status': 'completed',
          'score_auto': (score / _questions.length) * 100,
          'nclc_estimate': level,
          'duration_seconds': durationUsed,
          'device_type': 'android',
        }).select().single();

        final String sessionId = session['id'];

        // 3. Save individual question answers
        final List<Map<String, dynamic>> answerInserts = _questions.map((q) {
          final userAns = _answers[q.id] ?? '';
          return {
            'session_id': sessionId,
            'user_id': userId,
            'question_id': q.id,
            'user_answer': userAns,
            'is_correct': userAns == q.correctAnswer,
          };
        }).toList();

        await client.from('answers').insert(answerInserts);

        // Invalidate profile cache to update UI on dashboard
        ref.invalidate(userProfileProvider);
      }
    } catch (e) {
      debugPrint('Failed to save diagnostic results to DB: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          child: _buildCurrentStep(),
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_step) {
      case 'welcome':
        return _buildWelcomeView();
      case 'test':
        return _buildTestView();
      case 'results':
        return _buildResultsView();
      default:
        return const SizedBox.shrink();
    }
  }

  // --- 1. WELCOME SCREEN ---
  Widget _buildWelcomeView() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: () => context.go('/dashboard'),
              icon: const Icon(Icons.arrow_back, color: Colors.white60, size: 16),
              label: const Text('Passer l\'étape', style: TextStyle(color: Colors.white60)),
            ),
          ),
          Column(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF1E3A8A).withOpacity(0.2),
                  border: Border.all(color: const Color(0xFF1D4ED8), width: 2),
                ),
                child: const Center(
                  child: Text('🧭', style: TextStyle(fontSize: 36)),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Test Diagnostique',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 12),
              const Text(
                'Évaluez gratuitement votre niveau actuel en français pour générer un programme d\'entraînement adapté et ciblé.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Colors.white70, height: 1.4),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: _buildWelcomeCard('🎧', 'Écoute', '15 QCM Audio'),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildWelcomeCard('📖', 'Lecture', '15 QCM Écrits'),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.02),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  children: [
                    _buildRuleRow(Icons.timer_outlined, 'Durée limite : 20 minutes (soumission automatique).'),
                    const SizedBox(height: 12),
                    _buildRuleRow(Icons.volume_up_outlined, '2 écoutes maximum par question audio (CO).'),
                    const SizedBox(height: 12),
                    _buildRuleRow(Icons.assessment_outlined, 'Grille d\'évaluation calquée sur le barème officiel IRCC.'),
                  ],
                ),
              ),
            ],
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _step = 'test';
                _currentIndex = 0;
                _timeLeft = 1200;
                _answers.clear();
                _audioPlayCounts.clear();
              });
              _startTimer();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFC55A11),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text(
              '🚀 Commencer le Diagnostic',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeCard(String emoji, String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.white38)),
        ],
      ),
    );
  }

  Widget _buildRuleRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFFC55A11), size: 18),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.3),
          ),
        ),
      ],
    );
  }

  // --- 2. ACTIVE TEST SCREEN ---
  Widget _buildTestView() {
    final currentQuestion = _questions[_currentIndex];
    final isCO = currentQuestion.module == 'CO';
    final progressPercent = (_currentIndex / _questions.length);
    final currentPlays = _audioPlayCounts[currentQuestion.id] ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Top Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question ${_currentIndex + 1} / ${_questions.length}',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white60),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _timeLeft < 180 ? Colors.red.withOpacity(0.15) : Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _timeLeft < 180 ? Colors.red.withOpacity(0.3) : Colors.white.withOpacity(0.1),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.timer_outlined, color: Colors.white60, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      _formatTime(_timeLeft),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: _timeLeft < 180 ? Colors.redAccent : Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        // Progress bar
        LinearProgressIndicator(
          value: progressPercent,
          backgroundColor: Colors.white10,
          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFC55A11)),
          minHeight: 3,
        ),
        Expanded(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Left/Content block (Audio or Text Passage)
                  if (isCO) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.02),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withOpacity(0.06)),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.headset_outlined, size: 40, color: Color(0xFFC55A11)),
                          const SizedBox(height: 12),
                          const Text(
                            'Compréhension Orale',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Écoutez attentivement l\'extrait audio.',
                            style: TextStyle(fontSize: 12, color: Colors.white38),
                          ),
                          const SizedBox(height: 24),
                          IconButton(
                            onPressed: () => _playPauseAudio(currentQuestion.audioUrl),
                            iconSize: 56,
                            icon: Icon(
                              _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                              color: const Color(0xFFC55A11),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Écoutes effectuées : $currentPlays / 2',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white60),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.02),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withOpacity(0.06)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1D4ED8).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'TEXTE DE LECTURE',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF60A5FA)),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            currentQuestion.passageText ?? '',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.white90,
                              height: 1.5,
                              fontFamily: 'Serif',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  // Question block
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.02),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withOpacity(0.06)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Niveau ${currentQuestion.level}',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white60),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          currentQuestion.questionText,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white, height: 1.3),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  // MCQ choices
                  ...currentQuestion.options.entries.map((entry) {
                    final key = entry.key;
                    final val = entry.value;
                    final isSelected = _answers[currentQuestion.id] == key;

                    return Padding(
                      key: ValueKey('${currentQuestion.id}_$key'),
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: InkWell(
                        onTap: () => _selectAnswer(key),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFC55A11).withOpacity(0.1) : Colors.white.withOpacity(0.01),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? const Color(0xFFC55A11) : Colors.white.withOpacity(0.08),
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Text(
                                '$key. ',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFC55A11),
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  val,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: Colors.white90,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
          ),
        ),
        // Footer info
        Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
          border: const Border(top: BorderSide(color: Colors.white10)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Test diagnostique', style: TextStyle(fontSize: 11, color: Colors.white38)),
              Text(
                'Module : ${isCO ? "Compréhension de l\'Oral" : "Compréhension des Écrits"}',
                style: const TextStyle(fontSize: 11, color: Colors.white38),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // --- 3. RESULTS SCREEN ---
  Widget _buildResultsView() {
    String explanation = '';
    switch (_assessedLevel) {
      case 'C1':
        explanation = "Excellent niveau ! Vous maîtrisez déjà le français à un niveau avancé. Nous allons consolider vos acquis pour décrocher la note maximale (CLB 10-12).";
        break;
      case 'B2':
        explanation = "Bon niveau ! Vous possédez une bonne maîtrise intermédiaire. Notre plan va cibler vos points perfectibles pour vous faire franchir le palier C1 indispensable pour l'immigration.";
        break;
      case 'B1':
        explanation = "Niveau intermédiaire. Vous comprenez la majorité des échanges mais manquez de fluidité sur les structures complexes. Le parcours va poser des bases solides.";
        break;
      case 'A2':
      default:
        explanation = "Niveau élémentaire. Il reste encore des bases de vocabulaire et de grammaire à acquérir. Nous vous recommandons de commencer par les exercices d'entraînement simples.";
        break;
    }

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const SizedBox(height: 20),
          Column(
            children: [
              const Text('🏆', style: TextStyle(fontSize: 54)),
              const SizedBox(height: 12),
              const Text(
                'Votre niveau évalué',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white60, letterSpacing: 1.5),
              ),
              const SizedBox(height: 8),
              Text(
                _assessedLevel,
                style: const TextStyle(
                  fontSize: 64,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFFC55A11),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                '(Basé sur 30 questions de CO/CE)',
                style: TextStyle(fontSize: 11, color: Colors.white38),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.02),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      explanation,
                      style: const TextStyle(fontSize: 13, color: Colors.white70, height: 1.4),
                    ),
                    const SizedBox(height: 16),
                    const Divider(color: Colors.white10),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'NIVEAU CIBLE CONSEILLÉ :',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white38),
                        ),
                        Text(
                          _assessedLevel == 'C1' ? 'C2' : _assessedLevel == 'B2' ? 'C1' : 'B2',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.black, color: Color(0xFF10B981)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_isSaving) ...[
                const Center(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: 20),
                    child: Column(
                      children: [
                        CircularProgressIndicator(color: Color(0xFFC55A11)),
                        SizedBox(height: 8),
                        Text('Enregistrement de vos résultats...', style: TextStyle(fontSize: 11, color: Colors.white60)),
                      ],
                    ),
                  ),
                ),
              ],
              ElevatedButton(
                onPressed: _isSaving ? null : () => context.go('/learning-path'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC55A11),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text(
                  '🗺️ Générer mon planning personnalisé',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: _isSaving ? null : () => context.go('/dashboard'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white70,
                  side: const BorderSide(color: Colors.white10),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Accéder au tableau de bord'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
