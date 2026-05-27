// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class LocalQuestionsCompanion extends UpdateCompanion<LocalQuestion> {
  final Value<String> id;
  final Value<String> module;
  final Value<String> testType;
  final Value<String> level;
  final Value<String> questionText;
  final Value<String?> audioLocalPath;
  final Value<String?> passageText;
  final Value<String?> optionsJson;
  final Value<String?> correctAnswer;
  final Value<String> explanation;
  final Value<DateTime> downloadedAt;
  const LocalQuestionsCompanion({
    this.id = const Value.absent(),
    this.module = const Value.absent(),
    this.testType = const Value.absent(),
    this.level = const Value.absent(),
    this.questionText = const Value.absent(),
    this.audioLocalPath = const Value.absent(),
    this.passageText = const Value.absent(),
    this.optionsJson = const Value.absent(),
    this.correctAnswer = const Value.absent(),
    this.explanation = const Value.absent(),
    this.downloadedAt = const Value.absent(),
  });
  LocalQuestionsCompanion.insert({
    required String id,
    required String module,
    required String testType,
    required String level,
    required String questionText,
    this.audioLocalPath = const Value.absent(),
    this.passageText = const Value.absent(),
    this.optionsJson = const Value.absent(),
    this.correctAnswer = const Value.absent(),
    required String explanation,
    required DateTime downloadedAt,
  }) : id = Value(id),
       module = Value(module),
       testType = Value(testType),
       level = Value(level),
       questionText = Value(questionText),
       explanation = Value(explanation),
       downloadedAt = Value(downloadedAt);
}

class LocalSessionsCompanion extends UpdateCompanion<LocalSession> {
  final Value<String> id;
  final Value<String> userId;
  final Value<String> sessionType;
  final Value<String> module;
  final Value<String> answersJson;
  final Value<int> currentIndex;
  final Value<int> timeLeftSeconds;
  final Value<String> status;
  final Value<bool> isSynced;
  final Value<DateTime> createdAt;
  const LocalSessionsCompanion({
    this.id = const Value.absent(),
    this.userId = const Value.absent(),
    this.sessionType = const Value.absent(),
    this.module = const Value.absent(),
    this.answersJson = const Value.absent(),
    this.currentIndex = const Value.absent(),
    this.timeLeftSeconds = const Value.absent(),
    this.status = const Value.absent(),
    this.isSynced = const Value.absent(),
    this.createdAt = const Value.absent(),
  });
  LocalSessionsCompanion.insert({
    required String id,
    required String userId,
    required String sessionType,
    required String module,
    required String answersJson,
    required int currentIndex,
    required int timeLeftSeconds,
    required String status,
    this.isSynced = const Value.absent(),
    required DateTime createdAt,
  }) : id = Value(id),
       userId = Value(userId),
       sessionType = Value(sessionType),
       module = Value(module),
       answersJson = Value(answersJson),
       currentIndex = Value(currentIndex),
       timeLeftSeconds = Value(timeLeftSeconds),
       status = Value(status),
       createdAt = Value(createdAt);
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $LocalQuestionsTable get localQuestions => $LocalQuestionsTable(this);
  $LocalSessionsTable get localSessions => $LocalSessionsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables => allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [localQuestions, localSessions];
}

class $LocalQuestionsTable extends Table with TableInfo {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalQuestionsTable(this.attachedDatabase, [this._alias]);
  @override
  List<GeneratedColumn> get $columns => [];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => 'local_questions';
  @override
  Null createAlias(String alias) => null;
}

class $LocalSessionsTable extends Table with TableInfo {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalSessionsTable(this.attachedDatabase, [this._alias]);
  @override
  List<GeneratedColumn> get $columns => [];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => 'local_sessions';
  @override
  Null createAlias(String alias) => null;
}

class LocalQuestion {}
class LocalSession {}
