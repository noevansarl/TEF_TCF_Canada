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
}
