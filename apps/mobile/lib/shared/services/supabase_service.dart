import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  // Détecter automatiquement si la clé est de type mock ou tronquée
  bool get useMock {
    try {
      final key = Supabase.instance.client.supabaseKey;
      return key.contains('...') || key == 'placeholder';
    } catch (_) {
      return true;
    }
  }

  // Permet d'éviter de crasher si Supabase n'est pas initialisé
  SupabaseClient get client {
    if (useMock) {
      return null as dynamic;
    }
    return Supabase.instance.client;
  }

  // Mock User State in memory
  static User? _mockUser;
  static final StreamController<User?> _mockUserStreamController = StreamController<User?>.broadcast();

  Stream<User?> get mockUserStream => _mockUserStreamController.stream;

  // Stream d'état d'authentification réel
  Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;

  // Session courante
  Session? get currentSession => useMock ? null : client.auth.currentSession;

  // Utilisateur courant
  User? get currentUser => useMock ? _mockUser : client.auth.currentUser;

  // Connexion
  Future<dynamic> signIn(String email, String password) async {
    if (useMock) {
      // Simuler l'authentification mock
      _mockUser = User(
        id: 'mock-user-id',
        email: email,
        createdAt: DateTime.now().toIso8601String(),
        userMetadata: {
          'full_name': 'Candidat Francophonie',
          'country': 'Canada',
        },
        appMetadata: {},
        aud: 'authenticated',
      );
      _mockUserStreamController.add(_mockUser);
      return null;
    }
    return await client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  // Inscription
  Future<dynamic> signUp(String email, String password, String fullName) async {
    if (useMock) {
      // Simuler l'authentification mock
      _mockUser = User(
        id: 'mock-user-id',
        email: email,
        createdAt: DateTime.now().toIso8601String(),
        userMetadata: {
          'full_name': fullName,
          'country': 'Canada',
        },
        appMetadata: {},
        aud: 'authenticated',
      );
      _mockUserStreamController.add(_mockUser);
      return null;
    }
    return await client.auth.signUp(
      email: email,
      password: password,
      data: {
        'full_name': fullName,
        'country': 'Canada',
      },
    );
  }

  // Déconnexion
  Future<void> signOut() async {
    if (useMock) {
      _mockUser = null;
      _mockUserStreamController.add(null);
      return;
    }
    await client.auth.signOut();
  }

  // Charger les questions d'un module/niveau
  Future<List<Map<String, dynamic>>> fetchQuestions(
      String module, String testType, String level) async {
    if (useMock) {
      // Retourner des mock questions conformes à notre seed de base
      return [
        {
          'id': 'mock-q-co-1',
          'module': module,
          'test_type': testType,
          'level': level,
          'question_text': 'Selon l\'annonce radiophonique, quelle est la cause principale de la perturbation du trafic ferroviaire ce matin ?',
          'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          'passage_text': null,
          'options': {
            'A': 'Des conditions météo extrêmes',
            'B': 'Une grève surprise des aiguilleurs',
            'C': 'Une panne technique sur la motrice',
            'D': 'Des travaux de maintenance programmés',
          },
          'correct_answer': 'C',
          'explanation': 'La conductrice annonce explicitement un incident technique mineur sur la motrice, imposant un arrêt de vérification.',
          'theme': 'Transports et actualités',
          'difficulty_score': 5,
        },
        {
          'id': 'mock-q-ce-2',
          'module': module,
          'test_type': testType,
          'level': level,
          'question_text': 'Quel est le principal objectif environnemental visé par la nouvelle réglementation municipale sur le tri sélectif des biodéchets ?',
          'audio_url': null,
          'passage_text': 'Afin de respecter les engagements nationaux de réduction des gaz à effet de serre, la Ville de Gatineau annonce l\'obligation de trier les restes alimentaires et déchets organiques dès le 1er septembre. Cette mesure s\'accompagne de la distribution gratuite de bacs bruns de compostage à tous les foyers.',
          'options': {
            'A': 'Réduire l\'empreinte carbone locale',
            'B': 'Réduire les dépenses de collecte municipale',
            'C': 'Créer des emplois de patrouilleurs verts',
            'D': 'Privatiser les centres de compostage',
          },
          'correct_answer': 'A',
          'explanation': 'Le texte commence par mentionner que la mesure vise à respecter la réduction des gaz à effet de serre, soit l\'empreinte carbone.',
          'theme': 'Environnement et écologie',
          'difficulty_score': 6,
        }
      ];
    }

    try {
      final response = await client
          .from('questions')
          .select()
          .eq('module', module)
          .eq('test_type', testType)
          .eq('level', level)
          .eq('is_active', true);
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint('Error fetching questions online: $e. Falling back to mock data.');
      return [
        {
          'id': 'fallback-q-1',
          'module': module,
          'test_type': testType,
          'level': level,
          'question_text': 'Quelle est la capitale officielle du Canada ?',
          'options': {
            'A': 'Montréal',
            'B': 'Ottawa',
            'C': 'Toronto',
            'D': 'Vancouver',
          },
          'correct_answer': 'B',
          'explanation': 'Ottawa est la capitale fédérale officielle.',
          'theme': 'Général',
          'difficulty_score': 3,
        }
      ];
    }
  }

  // Créer une session sur le serveur
  Future<Map<String, dynamic>> createSession(
      String sessionType, String module, String testType, String level) async {
    if (useMock) {
      return {
        'id': 'sess-mock-${DateTime.now().millisecondsSinceEpoch}',
        'user_id': 'mock-user-id',
        'session_type': sessionType,
        'module': module,
        'test_type': testType,
        'level': level,
        'status': 'in_progress',
        'max_duration_s': 3600,
        'device_type': 'android',
        'created_at': DateTime.now().toIso8601String(),
      };
    }

    final response = await client.from('sessions').insert({
      'user_id': currentUser?.id,
      'session_type': sessionType,
      'module': module,
      'test_type': testType,
      'level': level,
      'status': 'in_progress',
      'max_duration_s': 3600,
      'device_type': 'android',
    }).select().single();
    return response;
  }

  // Récupérer les réponses et questions d'une session
  Future<List<Map<String, dynamic>>> fetchAnswersForSession(String sessionId) async {
    if (useMock) {
      return [
        {
          'id': 'ans-mock-1',
          'session_id': sessionId,
          'question_id': 'mock-q-1',
          'user_answer': 'Dans mon pays d\'origine, l\'apprentissage du français est considéré comme une priorité absolue car cela favorise la mobilité professionnelle.',
          'is_correct': null,
          'auto_feedback': {
            'criteres': {
              'respect_tache': {'score': 8, 'commentaire': 'Excellent respect de la consigne et du sujet imposé.'},
              'coherence': {'score': 7, 'commentaire': 'Le texte est bien structuré avec des connecteurs logiques appropriés.'},
              'lexique': {'score': 8, 'commentaire': 'Vocabulaire riche et adapté au niveau B2/C1.'},
              'morphosyntaxe': {'score': 6, 'commentaire': 'Quelques petites erreurs de conjugaison mais globalement très correct.'},
              'conventions': {'score': 7, 'commentaire': 'Ponctuation et mise en page bien respectées.'}
            },
            'score_global': 72.0,
            'suggestions': [
              'Faites attention à l\'accord des adjectifs au féminin pluriel.',
              'Essayez de diversifier vos structures de phrases complexes.'
            ],
            'points_forts': [
              'Très bonne richesse de vocabulaire (ex: "priorité absolue", "mobilité professionnelle").',
              'Arguments convaincants et clairs.'
            ],
            'resume': 'Le candidat démontre une excellente maîtrise des structures de base et intermédiaire, correspondant à un niveau B2 solide avec des prémices de C1.',
            'nclc_estime': 'B2'
          },
          'question': {
            'id': 'mock-q-1',
            'module': 'EE',
            'test_type': 'TCF_CANADA',
            'level': 'B2',
            'question_text': 'Tâche 1 : Rédigez une lettre de motivation pour postuler à un emploi au Canada.',
            'options': null,
            'correct_answer': null,
            'explanation': 'La lettre doit comporter une formule de politesse, un objet, des arguments et un ton formel.',
            'theme': 'Vie professionnelle',
            'difficulty_score': 6
          }
        }
      ];
    }

    try {
      final response = await client
          .from('answers')
          .select('*, question:questions(*)')
          .eq('session_id', sessionId);
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint('Error fetching answers online: $e');
      return [];
    }
  }

  // Envoyer une réplique vocale de jeu de rôle oral et obtenir la réponse de l'IA
  Future<Map<String, dynamic>> sendRoleplayTurn({
    required String sessionId,
    required String questionId,
    required int turnIndex,
    required String localAudioPath,
    required List<Map<String, String>> history,
  }) async {
    if (useMock) {
      await Future.delayed(const Duration(seconds: 2));
      // Simulation des répliques de l'examinateur selon le tour
      String nextText = '';
      if (turnIndex == 0) {
        nextText = 'Le loyer est de 850 euros par mois charges comprises. Y a-t-il d\'autres détails que vous aimeriez connaître ?';
      } else if (turnIndex == 1) {
        nextText = 'Oui, l\'appartement dispose d\'une cuisine équipée neuve et d\'un grand balcon exposé sud. Des visites sont prévues ce samedi, seriez-vous libre ?';
      } else {
        nextText = 'Parfait, c\'est noté pour samedi à 10h. Je vous envoie l\'adresse exacte par message. Bonne journée !';
      }

      return {
        'success': true,
        'user_transcript': 'Question simulée pour le tour ${turnIndex + 1}',
        'reply_text': nextText,
        'reply_audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      };
    }

    try {
      final response = await client.functions.invoke('transcribe-eo', body: {
        'session_id': sessionId,
        'question_id': questionId,
        'turn_index': turnIndex,
        'local_audio_path': localAudioPath,
        'history': history,
      });

      final data = response.data;
      return Map<String, dynamic>.from(data ?? {});
    } catch (e) {
      debugPrint('Error sending roleplay turn online: $e');
      return {
        'success': false,
        'error': e.toString(),
        'user_transcript': '[Transcription indisponible]',
        'reply_text': 'D\'accord, je comprends. Poursuivons notre échange.',
        'reply_audio_url': null,
      };
    }
  }
}
