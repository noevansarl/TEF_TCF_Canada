// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $LocalQuestionsTable extends LocalQuestions
    with TableInfo<$LocalQuestionsTable, LocalQuestion> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalQuestionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _moduleMeta = const VerificationMeta('module');
  @override
  late final GeneratedColumn<String> module = GeneratedColumn<String>(
      'module', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _testTypeMeta =
      const VerificationMeta('testType');
  @override
  late final GeneratedColumn<String> testType = GeneratedColumn<String>(
      'test_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _levelMeta = const VerificationMeta('level');
  @override
  late final GeneratedColumn<String> level = GeneratedColumn<String>(
      'level', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _questionTextMeta =
      const VerificationMeta('questionText');
  @override
  late final GeneratedColumn<String> questionText = GeneratedColumn<String>(
      'question_text', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _audioLocalPathMeta =
      const VerificationMeta('audioLocalPath');
  @override
  late final GeneratedColumn<String> audioLocalPath = GeneratedColumn<String>(
      'audio_local_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _passageTextMeta =
      const VerificationMeta('passageText');
  @override
  late final GeneratedColumn<String> passageText = GeneratedColumn<String>(
      'passage_text', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _optionsJsonMeta =
      const VerificationMeta('optionsJson');
  @override
  late final GeneratedColumn<String> optionsJson = GeneratedColumn<String>(
      'options_json', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _correctAnswerMeta =
      const VerificationMeta('correctAnswer');
  @override
  late final GeneratedColumn<String> correctAnswer = GeneratedColumn<String>(
      'correct_answer', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _explanationMeta =
      const VerificationMeta('explanation');
  @override
  late final GeneratedColumn<String> explanation = GeneratedColumn<String>(
      'explanation', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _downloadedAtMeta =
      const VerificationMeta('downloadedAt');
  @override
  late final GeneratedColumn<DateTime> downloadedAt = GeneratedColumn<DateTime>(
      'downloaded_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        module,
        testType,
        level,
        questionText,
        audioLocalPath,
        passageText,
        optionsJson,
        correctAnswer,
        explanation,
        downloadedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_questions';
  @override
  VerificationContext validateIntegrity(Insertable<LocalQuestion> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('module')) {
      context.handle(_moduleMeta,
          module.isAcceptableOrUnknown(data['module']!, _moduleMeta));
    } else if (isInserting) {
      context.missing(_moduleMeta);
    }
    if (data.containsKey('test_type')) {
      context.handle(_testTypeMeta,
          testType.isAcceptableOrUnknown(data['test_type']!, _testTypeMeta));
    } else if (isInserting) {
      context.missing(_testTypeMeta);
    }
    if (data.containsKey('level')) {
      context.handle(
          _levelMeta, level.isAcceptableOrUnknown(data['level']!, _levelMeta));
    } else if (isInserting) {
      context.missing(_levelMeta);
    }
    if (data.containsKey('question_text')) {
      context.handle(
          _questionTextMeta,
          questionText.isAcceptableOrUnknown(
              data['question_text']!, _questionTextMeta));
    } else if (isInserting) {
      context.missing(_questionTextMeta);
    }
    if (data.containsKey('audio_local_path')) {
      context.handle(
          _audioLocalPathMeta,
          audioLocalPath.isAcceptableOrUnknown(
              data['audio_local_path']!, _audioLocalPathMeta));
    }
    if (data.containsKey('passage_text')) {
      context.handle(
          _passageTextMeta,
          passageText.isAcceptableOrUnknown(
              data['passage_text']!, _passageTextMeta));
    }
    if (data.containsKey('options_json')) {
      context.handle(
          _optionsJsonMeta,
          optionsJson.isAcceptableOrUnknown(
              data['options_json']!, _optionsJsonMeta));
    }
    if (data.containsKey('correct_answer')) {
      context.handle(
          _correctAnswerMeta,
          correctAnswer.isAcceptableOrUnknown(
              data['correct_answer']!, _correctAnswerMeta));
    }
    if (data.containsKey('explanation')) {
      context.handle(
          _explanationMeta,
          explanation.isAcceptableOrUnknown(
              data['explanation']!, _explanationMeta));
    } else if (isInserting) {
      context.missing(_explanationMeta);
    }
    if (data.containsKey('downloaded_at')) {
      context.handle(
          _downloadedAtMeta,
          downloadedAt.isAcceptableOrUnknown(
              data['downloaded_at']!, _downloadedAtMeta));
    } else if (isInserting) {
      context.missing(_downloadedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalQuestion map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalQuestion(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      module: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}module'])!,
      testType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}test_type'])!,
      level: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}level'])!,
      questionText: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}question_text'])!,
      audioLocalPath: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}audio_local_path']),
      passageText: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}passage_text']),
      optionsJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}options_json']),
      correctAnswer: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}correct_answer']),
      explanation: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}explanation'])!,
      downloadedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}downloaded_at'])!,
    );
  }

  @override
  $LocalQuestionsTable createAlias(String alias) {
    return $LocalQuestionsTable(attachedDatabase, alias);
  }
}

class LocalQuestion extends DataClass implements Insertable<LocalQuestion> {
  final String id;
  final String module;
  final String testType;
  final String level;
  final String questionText;
  final String? audioLocalPath;
  final String? passageText;
  final String? optionsJson;
  final String? correctAnswer;
  final String explanation;
  final DateTime downloadedAt;
  const LocalQuestion(
      {required this.id,
      required this.module,
      required this.testType,
      required this.level,
      required this.questionText,
      this.audioLocalPath,
      this.passageText,
      this.optionsJson,
      this.correctAnswer,
      required this.explanation,
      required this.downloadedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['module'] = Variable<String>(module);
    map['test_type'] = Variable<String>(testType);
    map['level'] = Variable<String>(level);
    map['question_text'] = Variable<String>(questionText);
    if (!nullToAbsent || audioLocalPath != null) {
      map['audio_local_path'] = Variable<String>(audioLocalPath);
    }
    if (!nullToAbsent || passageText != null) {
      map['passage_text'] = Variable<String>(passageText);
    }
    if (!nullToAbsent || optionsJson != null) {
      map['options_json'] = Variable<String>(optionsJson);
    }
    if (!nullToAbsent || correctAnswer != null) {
      map['correct_answer'] = Variable<String>(correctAnswer);
    }
    map['explanation'] = Variable<String>(explanation);
    map['downloaded_at'] = Variable<DateTime>(downloadedAt);
    return map;
  }

  LocalQuestionsCompanion toCompanion(bool nullToAbsent) {
    return LocalQuestionsCompanion(
      id: Value(id),
      module: Value(module),
      testType: Value(testType),
      level: Value(level),
      questionText: Value(questionText),
      audioLocalPath: audioLocalPath == null && nullToAbsent
          ? const Value.absent()
          : Value(audioLocalPath),
      passageText: passageText == null && nullToAbsent
          ? const Value.absent()
          : Value(passageText),
      optionsJson: optionsJson == null && nullToAbsent
          ? const Value.absent()
          : Value(optionsJson),
      correctAnswer: correctAnswer == null && nullToAbsent
          ? const Value.absent()
          : Value(correctAnswer),
      explanation: Value(explanation),
      downloadedAt: Value(downloadedAt),
    );
  }

  factory LocalQuestion.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalQuestion(
      id: serializer.fromJson<String>(json['id']),
      module: serializer.fromJson<String>(json['module']),
      testType: serializer.fromJson<String>(json['testType']),
      level: serializer.fromJson<String>(json['level']),
      questionText: serializer.fromJson<String>(json['questionText']),
      audioLocalPath: serializer.fromJson<String?>(json['audioLocalPath']),
      passageText: serializer.fromJson<String?>(json['passageText']),
      optionsJson: serializer.fromJson<String?>(json['optionsJson']),
      correctAnswer: serializer.fromJson<String?>(json['correctAnswer']),
      explanation: serializer.fromJson<String>(json['explanation']),
      downloadedAt: serializer.fromJson<DateTime>(json['downloadedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'module': serializer.toJson<String>(module),
      'testType': serializer.toJson<String>(testType),
      'level': serializer.toJson<String>(level),
      'questionText': serializer.toJson<String>(questionText),
      'audioLocalPath': serializer.toJson<String?>(audioLocalPath),
      'passageText': serializer.toJson<String?>(passageText),
      'optionsJson': serializer.toJson<String?>(optionsJson),
      'correctAnswer': serializer.toJson<String?>(correctAnswer),
      'explanation': serializer.toJson<String>(explanation),
      'downloadedAt': serializer.toJson<DateTime>(downloadedAt),
    };
  }

  LocalQuestion copyWith(
          {String? id,
          String? module,
          String? testType,
          String? level,
          String? questionText,
          Value<String?> audioLocalPath = const Value.absent(),
          Value<String?> passageText = const Value.absent(),
          Value<String?> optionsJson = const Value.absent(),
          Value<String?> correctAnswer = const Value.absent(),
          String? explanation,
          DateTime? downloadedAt}) =>
      LocalQuestion(
        id: id ?? this.id,
        module: module ?? this.module,
        testType: testType ?? this.testType,
        level: level ?? this.level,
        questionText: questionText ?? this.questionText,
        audioLocalPath:
            audioLocalPath.present ? audioLocalPath.value : this.audioLocalPath,
        passageText: passageText.present ? passageText.value : this.passageText,
        optionsJson: optionsJson.present ? optionsJson.value : this.optionsJson,
        correctAnswer:
            correctAnswer.present ? correctAnswer.value : this.correctAnswer,
        explanation: explanation ?? this.explanation,
        downloadedAt: downloadedAt ?? this.downloadedAt,
      );
  LocalQuestion copyWithCompanion(LocalQuestionsCompanion data) {
    return LocalQuestion(
      id: data.id.present ? data.id.value : this.id,
      module: data.module.present ? data.module.value : this.module,
      testType: data.testType.present ? data.testType.value : this.testType,
      level: data.level.present ? data.level.value : this.level,
      questionText: data.questionText.present
          ? data.questionText.value
          : this.questionText,
      audioLocalPath: data.audioLocalPath.present
          ? data.audioLocalPath.value
          : this.audioLocalPath,
      passageText:
          data.passageText.present ? data.passageText.value : this.passageText,
      optionsJson:
          data.optionsJson.present ? data.optionsJson.value : this.optionsJson,
      correctAnswer: data.correctAnswer.present
          ? data.correctAnswer.value
          : this.correctAnswer,
      explanation:
          data.explanation.present ? data.explanation.value : this.explanation,
      downloadedAt: data.downloadedAt.present
          ? data.downloadedAt.value
          : this.downloadedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalQuestion(')
          ..write('id: $id, ')
          ..write('module: $module, ')
          ..write('testType: $testType, ')
          ..write('level: $level, ')
          ..write('questionText: $questionText, ')
          ..write('audioLocalPath: $audioLocalPath, ')
          ..write('passageText: $passageText, ')
          ..write('optionsJson: $optionsJson, ')
          ..write('correctAnswer: $correctAnswer, ')
          ..write('explanation: $explanation, ')
          ..write('downloadedAt: $downloadedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      module,
      testType,
      level,
      questionText,
      audioLocalPath,
      passageText,
      optionsJson,
      correctAnswer,
      explanation,
      downloadedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalQuestion &&
          other.id == this.id &&
          other.module == this.module &&
          other.testType == this.testType &&
          other.level == this.level &&
          other.questionText == this.questionText &&
          other.audioLocalPath == this.audioLocalPath &&
          other.passageText == this.passageText &&
          other.optionsJson == this.optionsJson &&
          other.correctAnswer == this.correctAnswer &&
          other.explanation == this.explanation &&
          other.downloadedAt == this.downloadedAt);
}

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
  final Value<int> rowid;
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
    this.rowid = const Value.absent(),
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
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        module = Value(module),
        testType = Value(testType),
        level = Value(level),
        questionText = Value(questionText),
        explanation = Value(explanation),
        downloadedAt = Value(downloadedAt);
  static Insertable<LocalQuestion> custom({
    Expression<String>? id,
    Expression<String>? module,
    Expression<String>? testType,
    Expression<String>? level,
    Expression<String>? questionText,
    Expression<String>? audioLocalPath,
    Expression<String>? passageText,
    Expression<String>? optionsJson,
    Expression<String>? correctAnswer,
    Expression<String>? explanation,
    Expression<DateTime>? downloadedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (module != null) 'module': module,
      if (testType != null) 'test_type': testType,
      if (level != null) 'level': level,
      if (questionText != null) 'question_text': questionText,
      if (audioLocalPath != null) 'audio_local_path': audioLocalPath,
      if (passageText != null) 'passage_text': passageText,
      if (optionsJson != null) 'options_json': optionsJson,
      if (correctAnswer != null) 'correct_answer': correctAnswer,
      if (explanation != null) 'explanation': explanation,
      if (downloadedAt != null) 'downloaded_at': downloadedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalQuestionsCompanion copyWith(
      {Value<String>? id,
      Value<String>? module,
      Value<String>? testType,
      Value<String>? level,
      Value<String>? questionText,
      Value<String?>? audioLocalPath,
      Value<String?>? passageText,
      Value<String?>? optionsJson,
      Value<String?>? correctAnswer,
      Value<String>? explanation,
      Value<DateTime>? downloadedAt,
      Value<int>? rowid}) {
    return LocalQuestionsCompanion(
      id: id ?? this.id,
      module: module ?? this.module,
      testType: testType ?? this.testType,
      level: level ?? this.level,
      questionText: questionText ?? this.questionText,
      audioLocalPath: audioLocalPath ?? this.audioLocalPath,
      passageText: passageText ?? this.passageText,
      optionsJson: optionsJson ?? this.optionsJson,
      correctAnswer: correctAnswer ?? this.correctAnswer,
      explanation: explanation ?? this.explanation,
      downloadedAt: downloadedAt ?? this.downloadedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (module.present) {
      map['module'] = Variable<String>(module.value);
    }
    if (testType.present) {
      map['test_type'] = Variable<String>(testType.value);
    }
    if (level.present) {
      map['level'] = Variable<String>(level.value);
    }
    if (questionText.present) {
      map['question_text'] = Variable<String>(questionText.value);
    }
    if (audioLocalPath.present) {
      map['audio_local_path'] = Variable<String>(audioLocalPath.value);
    }
    if (passageText.present) {
      map['passage_text'] = Variable<String>(passageText.value);
    }
    if (optionsJson.present) {
      map['options_json'] = Variable<String>(optionsJson.value);
    }
    if (correctAnswer.present) {
      map['correct_answer'] = Variable<String>(correctAnswer.value);
    }
    if (explanation.present) {
      map['explanation'] = Variable<String>(explanation.value);
    }
    if (downloadedAt.present) {
      map['downloaded_at'] = Variable<DateTime>(downloadedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalQuestionsCompanion(')
          ..write('id: $id, ')
          ..write('module: $module, ')
          ..write('testType: $testType, ')
          ..write('level: $level, ')
          ..write('questionText: $questionText, ')
          ..write('audioLocalPath: $audioLocalPath, ')
          ..write('passageText: $passageText, ')
          ..write('optionsJson: $optionsJson, ')
          ..write('correctAnswer: $correctAnswer, ')
          ..write('explanation: $explanation, ')
          ..write('downloadedAt: $downloadedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalSessionsTable extends LocalSessions
    with TableInfo<$LocalSessionsTable, LocalSession> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalSessionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _userIdMeta = const VerificationMeta('userId');
  @override
  late final GeneratedColumn<String> userId = GeneratedColumn<String>(
      'user_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _sessionTypeMeta =
      const VerificationMeta('sessionType');
  @override
  late final GeneratedColumn<String> sessionType = GeneratedColumn<String>(
      'session_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _moduleMeta = const VerificationMeta('module');
  @override
  late final GeneratedColumn<String> module = GeneratedColumn<String>(
      'module', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _answersJsonMeta =
      const VerificationMeta('answersJson');
  @override
  late final GeneratedColumn<String> answersJson = GeneratedColumn<String>(
      'answers_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _currentIndexMeta =
      const VerificationMeta('currentIndex');
  @override
  late final GeneratedColumn<int> currentIndex = GeneratedColumn<int>(
      'current_index', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _timeLeftSecondsMeta =
      const VerificationMeta('timeLeftSeconds');
  @override
  late final GeneratedColumn<int> timeLeftSeconds = GeneratedColumn<int>(
      'time_left_seconds', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _isSyncedMeta =
      const VerificationMeta('isSynced');
  @override
  late final GeneratedColumn<bool> isSynced = GeneratedColumn<bool>(
      'is_synced', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_synced" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        userId,
        sessionType,
        module,
        answersJson,
        currentIndex,
        timeLeftSeconds,
        status,
        isSynced,
        createdAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_sessions';
  @override
  VerificationContext validateIntegrity(Insertable<LocalSession> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('user_id')) {
      context.handle(_userIdMeta,
          userId.isAcceptableOrUnknown(data['user_id']!, _userIdMeta));
    } else if (isInserting) {
      context.missing(_userIdMeta);
    }
    if (data.containsKey('session_type')) {
      context.handle(
          _sessionTypeMeta,
          sessionType.isAcceptableOrUnknown(
              data['session_type']!, _sessionTypeMeta));
    } else if (isInserting) {
      context.missing(_sessionTypeMeta);
    }
    if (data.containsKey('module')) {
      context.handle(_moduleMeta,
          module.isAcceptableOrUnknown(data['module']!, _moduleMeta));
    } else if (isInserting) {
      context.missing(_moduleMeta);
    }
    if (data.containsKey('answers_json')) {
      context.handle(
          _answersJsonMeta,
          answersJson.isAcceptableOrUnknown(
              data['answers_json']!, _answersJsonMeta));
    } else if (isInserting) {
      context.missing(_answersJsonMeta);
    }
    if (data.containsKey('current_index')) {
      context.handle(
          _currentIndexMeta,
          currentIndex.isAcceptableOrUnknown(
              data['current_index']!, _currentIndexMeta));
    } else if (isInserting) {
      context.missing(_currentIndexMeta);
    }
    if (data.containsKey('time_left_seconds')) {
      context.handle(
          _timeLeftSecondsMeta,
          timeLeftSeconds.isAcceptableOrUnknown(
              data['time_left_seconds']!, _timeLeftSecondsMeta));
    } else if (isInserting) {
      context.missing(_timeLeftSecondsMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('is_synced')) {
      context.handle(_isSyncedMeta,
          isSynced.isAcceptableOrUnknown(data['is_synced']!, _isSyncedMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalSession map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalSession(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      userId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}user_id'])!,
      sessionType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}session_type'])!,
      module: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}module'])!,
      answersJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}answers_json'])!,
      currentIndex: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}current_index'])!,
      timeLeftSeconds: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}time_left_seconds'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      isSynced: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_synced'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $LocalSessionsTable createAlias(String alias) {
    return $LocalSessionsTable(attachedDatabase, alias);
  }
}

class LocalSession extends DataClass implements Insertable<LocalSession> {
  final String id;
  final String userId;
  final String sessionType;
  final String module;
  final String answersJson;
  final int currentIndex;
  final int timeLeftSeconds;
  final String status;
  final bool isSynced;
  final DateTime createdAt;
  const LocalSession(
      {required this.id,
      required this.userId,
      required this.sessionType,
      required this.module,
      required this.answersJson,
      required this.currentIndex,
      required this.timeLeftSeconds,
      required this.status,
      required this.isSynced,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['user_id'] = Variable<String>(userId);
    map['session_type'] = Variable<String>(sessionType);
    map['module'] = Variable<String>(module);
    map['answers_json'] = Variable<String>(answersJson);
    map['current_index'] = Variable<int>(currentIndex);
    map['time_left_seconds'] = Variable<int>(timeLeftSeconds);
    map['status'] = Variable<String>(status);
    map['is_synced'] = Variable<bool>(isSynced);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  LocalSessionsCompanion toCompanion(bool nullToAbsent) {
    return LocalSessionsCompanion(
      id: Value(id),
      userId: Value(userId),
      sessionType: Value(sessionType),
      module: Value(module),
      answersJson: Value(answersJson),
      currentIndex: Value(currentIndex),
      timeLeftSeconds: Value(timeLeftSeconds),
      status: Value(status),
      isSynced: Value(isSynced),
      createdAt: Value(createdAt),
    );
  }

  factory LocalSession.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalSession(
      id: serializer.fromJson<String>(json['id']),
      userId: serializer.fromJson<String>(json['userId']),
      sessionType: serializer.fromJson<String>(json['sessionType']),
      module: serializer.fromJson<String>(json['module']),
      answersJson: serializer.fromJson<String>(json['answersJson']),
      currentIndex: serializer.fromJson<int>(json['currentIndex']),
      timeLeftSeconds: serializer.fromJson<int>(json['timeLeftSeconds']),
      status: serializer.fromJson<String>(json['status']),
      isSynced: serializer.fromJson<bool>(json['isSynced']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'userId': serializer.toJson<String>(userId),
      'sessionType': serializer.toJson<String>(sessionType),
      'module': serializer.toJson<String>(module),
      'answersJson': serializer.toJson<String>(answersJson),
      'currentIndex': serializer.toJson<int>(currentIndex),
      'timeLeftSeconds': serializer.toJson<int>(timeLeftSeconds),
      'status': serializer.toJson<String>(status),
      'isSynced': serializer.toJson<bool>(isSynced),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  LocalSession copyWith(
          {String? id,
          String? userId,
          String? sessionType,
          String? module,
          String? answersJson,
          int? currentIndex,
          int? timeLeftSeconds,
          String? status,
          bool? isSynced,
          DateTime? createdAt}) =>
      LocalSession(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        sessionType: sessionType ?? this.sessionType,
        module: module ?? this.module,
        answersJson: answersJson ?? this.answersJson,
        currentIndex: currentIndex ?? this.currentIndex,
        timeLeftSeconds: timeLeftSeconds ?? this.timeLeftSeconds,
        status: status ?? this.status,
        isSynced: isSynced ?? this.isSynced,
        createdAt: createdAt ?? this.createdAt,
      );
  LocalSession copyWithCompanion(LocalSessionsCompanion data) {
    return LocalSession(
      id: data.id.present ? data.id.value : this.id,
      userId: data.userId.present ? data.userId.value : this.userId,
      sessionType:
          data.sessionType.present ? data.sessionType.value : this.sessionType,
      module: data.module.present ? data.module.value : this.module,
      answersJson:
          data.answersJson.present ? data.answersJson.value : this.answersJson,
      currentIndex: data.currentIndex.present
          ? data.currentIndex.value
          : this.currentIndex,
      timeLeftSeconds: data.timeLeftSeconds.present
          ? data.timeLeftSeconds.value
          : this.timeLeftSeconds,
      status: data.status.present ? data.status.value : this.status,
      isSynced: data.isSynced.present ? data.isSynced.value : this.isSynced,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalSession(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('sessionType: $sessionType, ')
          ..write('module: $module, ')
          ..write('answersJson: $answersJson, ')
          ..write('currentIndex: $currentIndex, ')
          ..write('timeLeftSeconds: $timeLeftSeconds, ')
          ..write('status: $status, ')
          ..write('isSynced: $isSynced, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, userId, sessionType, module, answersJson,
      currentIndex, timeLeftSeconds, status, isSynced, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalSession &&
          other.id == this.id &&
          other.userId == this.userId &&
          other.sessionType == this.sessionType &&
          other.module == this.module &&
          other.answersJson == this.answersJson &&
          other.currentIndex == this.currentIndex &&
          other.timeLeftSeconds == this.timeLeftSeconds &&
          other.status == this.status &&
          other.isSynced == this.isSynced &&
          other.createdAt == this.createdAt);
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
  final Value<int> rowid;
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
    this.rowid = const Value.absent(),
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
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        userId = Value(userId),
        sessionType = Value(sessionType),
        module = Value(module),
        answersJson = Value(answersJson),
        currentIndex = Value(currentIndex),
        timeLeftSeconds = Value(timeLeftSeconds),
        status = Value(status),
        createdAt = Value(createdAt);
  static Insertable<LocalSession> custom({
    Expression<String>? id,
    Expression<String>? userId,
    Expression<String>? sessionType,
    Expression<String>? module,
    Expression<String>? answersJson,
    Expression<int>? currentIndex,
    Expression<int>? timeLeftSeconds,
    Expression<String>? status,
    Expression<bool>? isSynced,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (userId != null) 'user_id': userId,
      if (sessionType != null) 'session_type': sessionType,
      if (module != null) 'module': module,
      if (answersJson != null) 'answers_json': answersJson,
      if (currentIndex != null) 'current_index': currentIndex,
      if (timeLeftSeconds != null) 'time_left_seconds': timeLeftSeconds,
      if (status != null) 'status': status,
      if (isSynced != null) 'is_synced': isSynced,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalSessionsCompanion copyWith(
      {Value<String>? id,
      Value<String>? userId,
      Value<String>? sessionType,
      Value<String>? module,
      Value<String>? answersJson,
      Value<int>? currentIndex,
      Value<int>? timeLeftSeconds,
      Value<String>? status,
      Value<bool>? isSynced,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return LocalSessionsCompanion(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      sessionType: sessionType ?? this.sessionType,
      module: module ?? this.module,
      answersJson: answersJson ?? this.answersJson,
      currentIndex: currentIndex ?? this.currentIndex,
      timeLeftSeconds: timeLeftSeconds ?? this.timeLeftSeconds,
      status: status ?? this.status,
      isSynced: isSynced ?? this.isSynced,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (userId.present) {
      map['user_id'] = Variable<String>(userId.value);
    }
    if (sessionType.present) {
      map['session_type'] = Variable<String>(sessionType.value);
    }
    if (module.present) {
      map['module'] = Variable<String>(module.value);
    }
    if (answersJson.present) {
      map['answers_json'] = Variable<String>(answersJson.value);
    }
    if (currentIndex.present) {
      map['current_index'] = Variable<int>(currentIndex.value);
    }
    if (timeLeftSeconds.present) {
      map['time_left_seconds'] = Variable<int>(timeLeftSeconds.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (isSynced.present) {
      map['is_synced'] = Variable<bool>(isSynced.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalSessionsCompanion(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('sessionType: $sessionType, ')
          ..write('module: $module, ')
          ..write('answersJson: $answersJson, ')
          ..write('currentIndex: $currentIndex, ')
          ..write('timeLeftSeconds: $timeLeftSeconds, ')
          ..write('status: $status, ')
          ..write('isSynced: $isSynced, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $LocalQuestionsTable localQuestions = $LocalQuestionsTable(this);
  late final $LocalSessionsTable localSessions = $LocalSessionsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities =>
      [localQuestions, localSessions];
}

typedef $$LocalQuestionsTableCreateCompanionBuilder = LocalQuestionsCompanion
    Function({
  required String id,
  required String module,
  required String testType,
  required String level,
  required String questionText,
  Value<String?> audioLocalPath,
  Value<String?> passageText,
  Value<String?> optionsJson,
  Value<String?> correctAnswer,
  required String explanation,
  required DateTime downloadedAt,
  Value<int> rowid,
});
typedef $$LocalQuestionsTableUpdateCompanionBuilder = LocalQuestionsCompanion
    Function({
  Value<String> id,
  Value<String> module,
  Value<String> testType,
  Value<String> level,
  Value<String> questionText,
  Value<String?> audioLocalPath,
  Value<String?> passageText,
  Value<String?> optionsJson,
  Value<String?> correctAnswer,
  Value<String> explanation,
  Value<DateTime> downloadedAt,
  Value<int> rowid,
});

class $$LocalQuestionsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LocalQuestionsTable,
    LocalQuestion,
    $$LocalQuestionsTableFilterComposer,
    $$LocalQuestionsTableOrderingComposer,
    $$LocalQuestionsTableCreateCompanionBuilder,
    $$LocalQuestionsTableUpdateCompanionBuilder> {
  $$LocalQuestionsTableTableManager(
      _$AppDatabase db, $LocalQuestionsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$LocalQuestionsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$LocalQuestionsTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> module = const Value.absent(),
            Value<String> testType = const Value.absent(),
            Value<String> level = const Value.absent(),
            Value<String> questionText = const Value.absent(),
            Value<String?> audioLocalPath = const Value.absent(),
            Value<String?> passageText = const Value.absent(),
            Value<String?> optionsJson = const Value.absent(),
            Value<String?> correctAnswer = const Value.absent(),
            Value<String> explanation = const Value.absent(),
            Value<DateTime> downloadedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalQuestionsCompanion(
            id: id,
            module: module,
            testType: testType,
            level: level,
            questionText: questionText,
            audioLocalPath: audioLocalPath,
            passageText: passageText,
            optionsJson: optionsJson,
            correctAnswer: correctAnswer,
            explanation: explanation,
            downloadedAt: downloadedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String module,
            required String testType,
            required String level,
            required String questionText,
            Value<String?> audioLocalPath = const Value.absent(),
            Value<String?> passageText = const Value.absent(),
            Value<String?> optionsJson = const Value.absent(),
            Value<String?> correctAnswer = const Value.absent(),
            required String explanation,
            required DateTime downloadedAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalQuestionsCompanion.insert(
            id: id,
            module: module,
            testType: testType,
            level: level,
            questionText: questionText,
            audioLocalPath: audioLocalPath,
            passageText: passageText,
            optionsJson: optionsJson,
            correctAnswer: correctAnswer,
            explanation: explanation,
            downloadedAt: downloadedAt,
            rowid: rowid,
          ),
        ));
}

class $$LocalQuestionsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $LocalQuestionsTable> {
  $$LocalQuestionsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get module => $state.composableBuilder(
      column: $state.table.module,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get testType => $state.composableBuilder(
      column: $state.table.testType,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get level => $state.composableBuilder(
      column: $state.table.level,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get questionText => $state.composableBuilder(
      column: $state.table.questionText,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get audioLocalPath => $state.composableBuilder(
      column: $state.table.audioLocalPath,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get passageText => $state.composableBuilder(
      column: $state.table.passageText,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get optionsJson => $state.composableBuilder(
      column: $state.table.optionsJson,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get correctAnswer => $state.composableBuilder(
      column: $state.table.correctAnswer,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get explanation => $state.composableBuilder(
      column: $state.table.explanation,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get downloadedAt => $state.composableBuilder(
      column: $state.table.downloadedAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$LocalQuestionsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $LocalQuestionsTable> {
  $$LocalQuestionsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get module => $state.composableBuilder(
      column: $state.table.module,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get testType => $state.composableBuilder(
      column: $state.table.testType,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get level => $state.composableBuilder(
      column: $state.table.level,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get questionText => $state.composableBuilder(
      column: $state.table.questionText,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get audioLocalPath => $state.composableBuilder(
      column: $state.table.audioLocalPath,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get passageText => $state.composableBuilder(
      column: $state.table.passageText,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get optionsJson => $state.composableBuilder(
      column: $state.table.optionsJson,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get correctAnswer => $state.composableBuilder(
      column: $state.table.correctAnswer,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get explanation => $state.composableBuilder(
      column: $state.table.explanation,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get downloadedAt => $state.composableBuilder(
      column: $state.table.downloadedAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$LocalSessionsTableCreateCompanionBuilder = LocalSessionsCompanion
    Function({
  required String id,
  required String userId,
  required String sessionType,
  required String module,
  required String answersJson,
  required int currentIndex,
  required int timeLeftSeconds,
  required String status,
  Value<bool> isSynced,
  required DateTime createdAt,
  Value<int> rowid,
});
typedef $$LocalSessionsTableUpdateCompanionBuilder = LocalSessionsCompanion
    Function({
  Value<String> id,
  Value<String> userId,
  Value<String> sessionType,
  Value<String> module,
  Value<String> answersJson,
  Value<int> currentIndex,
  Value<int> timeLeftSeconds,
  Value<String> status,
  Value<bool> isSynced,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$LocalSessionsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LocalSessionsTable,
    LocalSession,
    $$LocalSessionsTableFilterComposer,
    $$LocalSessionsTableOrderingComposer,
    $$LocalSessionsTableCreateCompanionBuilder,
    $$LocalSessionsTableUpdateCompanionBuilder> {
  $$LocalSessionsTableTableManager(_$AppDatabase db, $LocalSessionsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$LocalSessionsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$LocalSessionsTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> userId = const Value.absent(),
            Value<String> sessionType = const Value.absent(),
            Value<String> module = const Value.absent(),
            Value<String> answersJson = const Value.absent(),
            Value<int> currentIndex = const Value.absent(),
            Value<int> timeLeftSeconds = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalSessionsCompanion(
            id: id,
            userId: userId,
            sessionType: sessionType,
            module: module,
            answersJson: answersJson,
            currentIndex: currentIndex,
            timeLeftSeconds: timeLeftSeconds,
            status: status,
            isSynced: isSynced,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String userId,
            required String sessionType,
            required String module,
            required String answersJson,
            required int currentIndex,
            required int timeLeftSeconds,
            required String status,
            Value<bool> isSynced = const Value.absent(),
            required DateTime createdAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalSessionsCompanion.insert(
            id: id,
            userId: userId,
            sessionType: sessionType,
            module: module,
            answersJson: answersJson,
            currentIndex: currentIndex,
            timeLeftSeconds: timeLeftSeconds,
            status: status,
            isSynced: isSynced,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$LocalSessionsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $LocalSessionsTable> {
  $$LocalSessionsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get userId => $state.composableBuilder(
      column: $state.table.userId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get sessionType => $state.composableBuilder(
      column: $state.table.sessionType,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get module => $state.composableBuilder(
      column: $state.table.module,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get answersJson => $state.composableBuilder(
      column: $state.table.answersJson,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get currentIndex => $state.composableBuilder(
      column: $state.table.currentIndex,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get timeLeftSeconds => $state.composableBuilder(
      column: $state.table.timeLeftSeconds,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get status => $state.composableBuilder(
      column: $state.table.status,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get isSynced => $state.composableBuilder(
      column: $state.table.isSynced,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$LocalSessionsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $LocalSessionsTable> {
  $$LocalSessionsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get userId => $state.composableBuilder(
      column: $state.table.userId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get sessionType => $state.composableBuilder(
      column: $state.table.sessionType,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get module => $state.composableBuilder(
      column: $state.table.module,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get answersJson => $state.composableBuilder(
      column: $state.table.answersJson,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get currentIndex => $state.composableBuilder(
      column: $state.table.currentIndex,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get timeLeftSeconds => $state.composableBuilder(
      column: $state.table.timeLeftSeconds,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get status => $state.composableBuilder(
      column: $state.table.status,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get isSynced => $state.composableBuilder(
      column: $state.table.isSynced,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$LocalQuestionsTableTableManager get localQuestions =>
      $$LocalQuestionsTableTableManager(_db, _db.localQuestions);
  $$LocalSessionsTableTableManager get localSessions =>
      $$LocalSessionsTableTableManager(_db, _db.localSessions);
}
