import 'dart:convert';
import 'package:drift/drift.dart' show Value, BooleanExpressionOperators;
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'local_db/app_database.dart';
import '../utils/uuid.dart';

/// Clés techniques stockées avec les réponses d'une session locale
/// (évite une migration du schéma Drift) ; jamais envoyées au serveur.
const String kMetaTestType = '_test_type';
const String kMetaLevel = '_level';

const List<String> _validSessionLevels = ['B1', 'B2', 'C1', 'C2', 'MIXED'];

class SyncService {
  final AppDatabase _db;
  final SupabaseClient? _supabase;
  final Connectivity _connectivity = Connectivity();

  SyncService(this._db, this._supabase) {
    // Écouter les changements de connectivité réseau
    _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> event) {
      if (event.isNotEmpty && !event.contains(ConnectivityResult.none)) {
        onConnectivityRestored();
      }
    });
  }

  Future<bool> _isOnline() async {
    final connectionList = await _connectivity.checkConnectivity();
    return connectionList.isNotEmpty && !connectionList.contains(ConnectivityResult.none);
  }

  /// Crée la session côté serveur si elle n'existe pas encore (idempotent :
  /// l'identifiant est un UUID généré sur l'appareil).
  Future<bool> ensureServerSession({
    required String sessionId,
    required String module,
    required String testType,
    String? level,
  }) async {
    final client = _supabase;
    final userId = client?.auth.currentUser?.id;
    if (client == null || userId == null || !uuidPattern.hasMatch(sessionId)) return false;

    final isSimulation = module.startsWith('FULL_');
    try {
      await client.from('sessions').upsert({
        'id': sessionId,
        'user_id': userId,
        'session_type': isSimulation ? 'SIMULATION' : 'TRAINING',
        'module': module,
        'test_type': testType,
        'level': isSimulation ? 'MIXED' : (_validSessionLevels.contains(level) ? level : null),
        'max_duration_s': isSimulation ? 4 * 3600 : 3600,
        'device_type': defaultTargetPlatform == TargetPlatform.iOS ? 'ios' : 'android',
      }, onConflict: 'id', ignoreDuplicates: true);
      return true;
    } catch (e) {
      debugPrint('SyncService: création de la session $sessionId impossible : $e');
      return false;
    }
  }

  /// Note une session locale sur le serveur (score-qcm) et renvoie le résultat,
  /// ou null si la notation n'a pas pu avoir lieu (hors ligne, erreur serveur).
  Future<Map<String, dynamic>?> _syncOne(LocalSession session) async {
    final client = _supabase;
    if (client == null) {
      debugPrint('Mock mode: skipping real score-qcm invoke');
      await _markSynced(session.id);
      return null;
    }

    final raw = Map<String, dynamic>.from(jsonDecode(session.answersJson) as Map);
    final testType = (raw[kMetaTestType] as String?) ?? 'TCF_CANADA';
    final level = raw[kMetaLevel] as String?;
    // Réponses QCM uniquement (le serveur ignore le reste) ; clés techniques retirées
    final answers = <String, String>{
      for (final entry in raw.entries)
        if (!entry.key.startsWith('_') && uuidPattern.hasMatch(entry.key) && entry.value is String)
          entry.key: entry.value as String,
    };

    // Ancienne session à identifiant local non UUID, ou rien à noter : abandon
    if (!uuidPattern.hasMatch(session.id) || answers.isEmpty) {
      await _markSynced(session.id);
      return null;
    }

    final created = await ensureServerSession(
      sessionId: session.id, module: session.module, testType: testType, level: level,
    );
    if (!created) return null; // réessayer plus tard

    try {
      final response = await client.functions.invoke('score-qcm', body: {
        'session_id': session.id,
        'answers': answers,
      });
      await _markSynced(session.id);
      final data = response.data;
      return data is Map ? Map<String, dynamic>.from(data) : null;
    } on FunctionException catch (e) {
      // 4xx : session déjà notée, expirée ou invalide → ne pas boucler indéfiniment
      if (e.status >= 400 && e.status < 500) {
        debugPrint('SyncService: session ${session.id} rejetée (${e.status})');
        await _markSynced(session.id);
      } else {
        debugPrint('SyncService: erreur serveur ${e.status} pour ${session.id}, nouvel essai plus tard');
      }
      return null;
    } catch (e) {
      debugPrint('Sync failed for session ${session.id}: $e');
      return null;
    }
  }

  Future<void> _markSynced(String sessionId) async {
    await (_db.update(_db.localSessions)..where((s) => s.id.equals(sessionId)))
        .write(const LocalSessionsCompanion(isSynced: Value(true)));
  }

  /// Synchronise une session précise et renvoie le score calculé par le serveur.
  Future<Map<String, dynamic>?> syncSession(String sessionId) async {
    if (!await _isOnline()) return null;
    final session = await (_db.select(_db.localSessions)
      ..where((s) => s.id.equals(sessionId) & s.isSynced.equals(false))).getSingleOrNull();
    if (session == null) return null;
    return _syncOne(session);
  }

  Future<void> syncPendingSessions() async {
    // 1. Vérifier la connectivité avant de tenter la synchronisation
    if (!await _isOnline()) {
      debugPrint('SyncService: No internet connection. Skipping sync.');
      return;
    }

    final pendingSessions = await (_db.select(_db.localSessions)
      ..where((s) => s.isSynced.equals(false))).get();

    for (final session in pendingSessions) {
      await _syncOne(session);
    }
  }

  // Appelé à chaque reconnexion réseau
  void onConnectivityRestored() {
    debugPrint('Connectivity restored. Syncing pending sessions...');
    syncPendingSessions();
  }
}
