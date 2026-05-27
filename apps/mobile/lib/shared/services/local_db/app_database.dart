import 'dart:convert';
import 'package:drift/drift.dart';
import '../../models/question.dart';
import '../../models/session.dart';

part 'app_database.g.dart';

// Tables locales
class LocalQuestions extends Table {
  TextColumn get id => text()();
  TextColumn get module => text()();
  TextColumn get testType => text()();
  TextColumn get level => text()();
  TextColumn get questionText => text()();
  TextColumn get audioLocalPath => text().nullable()();
  TextColumn get passageText => text().nullable()();
  TextColumn get optionsJson => text().nullable()();
  TextColumn get correctAnswer => text().nullable()();
  TextColumn get explanation => text()();
  DateTimeColumn get downloadedAt => dateTime()();
  @override
  Set<Column> get primaryKey => {id};
}

class LocalSessions extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text()();
  TextColumn get sessionType => text()();
  TextColumn get module => text()();
  TextColumn get answersJson => text()();
  IntColumn get currentIndex => integer()();
  IntColumn get timeLeftSeconds => integer()();
  TextColumn get status => text()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime()();
  @override
  Set<Column> get primaryKey => {id};
}


@DriftDatabase(tables: [LocalQuestions, LocalSessions])
class AppDatabase extends _$AppDatabase {
  AppDatabase(QueryExecutor e) : super(e);
  @override int get schemaVersion => 1;

  // Télécharger un module complet
  Future<void> downloadModule(String module, String testType, 
                               String level, List<Question> questions) async {
    await batch((batch) {
      batch.insertAllOnConflictUpdate(
        localQuestions,
        questions.map((q) => LocalQuestionsCompanion.insert(
          id: q.id,
          module: module,
          testType: testType,
          level: level,
          questionText: q.questionText,
          passageText: Value(q.passageText),
          optionsJson: Value(q.options != null ? jsonEncode(q.options) : null),
          correctAnswer: Value(q.correctAnswer),
          audioLocalPath: Value(q.audioUrl),
          explanation: q.explanation,
          downloadedAt: DateTime.now(),
        )).toList(),
      );
    });
  }

  // Récupérer questions offline
  Future<List<LocalQuestion>> getOfflineQuestions(
      String module, String testType, String level, int count) {
    return (select(localQuestions)
      ..where((q) =>
          q.module.equals(module) &
          q.testType.equals(testType) &
          q.level.equals(level))
      ..orderBy([(q) => OrderingTerm.random()])
      ..limit(count)).get();
  }

  // Sauvegarder session en attente de sync
  Future<void> savePendingSession(SessionModel session) async {
    await into(localSessions).insertOnConflictUpdate(
      LocalSessionsCompanion.insert(
        id: session.id,
        userId: session.userId,
        sessionType: session.sessionType,
        module: session.module,
        answersJson: jsonEncode(session.answers),
        currentIndex: session.currentIndex,
        timeLeftSeconds: session.timeLeftSeconds,
        status: session.status,
        createdAt: DateTime.now(),
      ),
    );
  }
}
