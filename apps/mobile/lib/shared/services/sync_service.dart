import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'local_db/app_database.dart';

class SyncService {
  final AppDatabase _db;
  final SupabaseClient? _supabase;
  final Connectivity _connectivity = Connectivity();

  SyncService(this._db, this._supabase) {
    // Écouter les changements de connectivité réseau
    _connectivity.onConnectivityChanged.listen((event) {
      if (event is List) {
        if (event.isNotEmpty && !event.contains(ConnectivityResult.none)) {
          onConnectivityRestored();
        }
      } else {
        if (event != ConnectivityResult.none) {
          onConnectivityRestored();
        }
      }
    });
  }

  Future<void> syncPendingSessions() async {
    final pendingSessions = await (_db.select(_db.localSessions)
      ..where((s) => s.isSynced.equals(false))).get();
    
    for (final session in pendingSessions) {
      try {
        final answers = jsonDecode(session.answersJson) as Map<String, dynamic>;
        
        // Appeler la fonction de scoring et sauvegarde Supabase
        if (_supabase != null) {
          await _supabase!.functions.invoke('score-qcm', body: {
            'session_id': session.id,
            'answers': answers,
            'status': session.status,
          });
        } else {
          debugPrint('Mock mode: skipping real score-qcm invoke');
        }
        
        // Marquer comme synchronisé en base locale
        await (_db.update(_db.localSessions)
          ..where((s) => s.id.equals(session.id)))
          .write(const LocalSessionsCompanion(isSynced: Value(true)));
          
        debugPrint('Session ${session.id} synced successfully.');
      } catch (e) {
        debugPrint('Sync failed for session ${session.id}: $e');
      }
    }
  }

  // Appelé à chaque reconnexion réseau
  void onConnectivityRestored() {
    debugPrint('Connectivity restored. Syncing pending sessions...');
    syncPendingSessions();
  }
}
