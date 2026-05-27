import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/local_db/app_database.dart';
import '../services/supabase_service.dart';
import '../services/sync_service.dart';

// Ouvrir la base de données SQLite locale avec Drift Native
QueryExecutor _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}

// Provider de la Base de données locale
final appDatabaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase(_openConnection());
  ref.onDispose(() => db.close());
  return db;
});

// Provider du service Supabase
final supabaseServiceProvider = Provider<SupabaseService>((ref) {
  return SupabaseService();
});

// Provider de l'état d'authentification
final authStateProvider = StreamProvider<User?>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  if (supabaseService.useMock) {
    return supabaseService.mockUserStream;
  }
  return supabaseService.authStateChanges.map((event) => event.user);
});

// Provider du Service de Synchronisation
final syncServiceProvider = Provider<SyncService>((ref) {
  final db = ref.watch(appDatabaseProvider);
  final supabase = ref.watch(supabaseServiceProvider).client;
  return SyncService(db, ref.watch(supabaseServiceProvider).useMock ? null : supabase);
});

// Provider pour stocker le plan d'abonnement simulé (mock) en développement local
final mockSubscriptionTierProvider = StateProvider<String>((ref) => 'gratuit');

// Provider du profil utilisateur complet (Supabase public.users)
final userProfileProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final auth = ref.watch(authStateProvider).value;
  if (auth == null) return null;

  final supabaseService = ref.watch(supabaseServiceProvider);
  if (supabaseService.useMock) {
    final mockTier = ref.watch(mockSubscriptionTierProvider);
    return {
      'id': auth.id,
      'email': auth.email,
      'full_name': auth.userMetadata?['full_name'] ?? 'Candidat Francophonie',
      'country': auth.userMetadata?['country'] ?? 'Canada',
      'subscription_tier': mockTier,
      'xp_points': 120,
    };
  }

  final supabase = supabaseService.client;
  final response = await supabase
      .from('users')
      .select()
      .eq('id', auth.id)
      .maybeSingle();
      
  return response;
});
