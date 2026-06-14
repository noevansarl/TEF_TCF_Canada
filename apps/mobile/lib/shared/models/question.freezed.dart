// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'question.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Question _$QuestionFromJson(Map<String, dynamic> json) {
  return _Question.fromJson(json);
}

/// @nodoc
mixin _$Question {
  String get id => throw _privateConstructorUsedError;
  String get module => throw _privateConstructorUsedError; // CO, CE, EE, EO
  String get testType =>
      throw _privateConstructorUsedError; // TCF_CANADA, TEF_CANADA, BOTH
  String get level => throw _privateConstructorUsedError; // A2, B1, B2, C1, C2
  String get questionText => throw _privateConstructorUsedError;
  String? get audioUrl => throw _privateConstructorUsedError;
  String? get passageText => throw _privateConstructorUsedError;
  Map<String, dynamic>? get options =>
      throw _privateConstructorUsedError; // {"A": "Option A", "B": "Option B", ...}
  String? get correctAnswer => throw _privateConstructorUsedError;
  String? get modelAnswer => throw _privateConstructorUsedError;
  String get explanation => throw _privateConstructorUsedError;
  String get theme => throw _privateConstructorUsedError;
  int get difficultyScore => throw _privateConstructorUsedError;
  bool get isDownloaded => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $QuestionCopyWith<Question> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $QuestionCopyWith<$Res> {
  factory $QuestionCopyWith(Question value, $Res Function(Question) then) =
      _$QuestionCopyWithImpl<$Res, Question>;
  @useResult
  $Res call(
      {String id,
      String module,
      String testType,
      String level,
      String questionText,
      String? audioUrl,
      String? passageText,
      Map<String, dynamic>? options,
      String? correctAnswer,
      String? modelAnswer,
      String explanation,
      String theme,
      int difficultyScore,
      bool isDownloaded});
}

/// @nodoc
class _$QuestionCopyWithImpl<$Res, $Val extends Question>
    implements $QuestionCopyWith<$Res> {
  _$QuestionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? module = null,
    Object? testType = null,
    Object? level = null,
    Object? questionText = null,
    Object? audioUrl = freezed,
    Object? passageText = freezed,
    Object? options = freezed,
    Object? correctAnswer = freezed,
    Object? modelAnswer = freezed,
    Object? explanation = null,
    Object? theme = null,
    Object? difficultyScore = null,
    Object? isDownloaded = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      module: null == module
          ? _value.module
          : module // ignore: cast_nullable_to_non_nullable
              as String,
      testType: null == testType
          ? _value.testType
          : testType // ignore: cast_nullable_to_non_nullable
              as String,
      level: null == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String,
      questionText: null == questionText
          ? _value.questionText
          : questionText // ignore: cast_nullable_to_non_nullable
              as String,
      audioUrl: freezed == audioUrl
          ? _value.audioUrl
          : audioUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      passageText: freezed == passageText
          ? _value.passageText
          : passageText // ignore: cast_nullable_to_non_nullable
              as String?,
      options: freezed == options
          ? _value.options
          : options // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      correctAnswer: freezed == correctAnswer
          ? _value.correctAnswer
          : correctAnswer // ignore: cast_nullable_to_non_nullable
              as String?,
      modelAnswer: freezed == modelAnswer
          ? _value.modelAnswer
          : modelAnswer // ignore: cast_nullable_to_non_nullable
              as String?,
      explanation: null == explanation
          ? _value.explanation
          : explanation // ignore: cast_nullable_to_non_nullable
              as String,
      theme: null == theme
          ? _value.theme
          : theme // ignore: cast_nullable_to_non_nullable
              as String,
      difficultyScore: null == difficultyScore
          ? _value.difficultyScore
          : difficultyScore // ignore: cast_nullable_to_non_nullable
              as int,
      isDownloaded: null == isDownloaded
          ? _value.isDownloaded
          : isDownloaded // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$QuestionImplCopyWith<$Res>
    implements $QuestionCopyWith<$Res> {
  factory _$$QuestionImplCopyWith(
          _$QuestionImpl value, $Res Function(_$QuestionImpl) then) =
      __$$QuestionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String module,
      String testType,
      String level,
      String questionText,
      String? audioUrl,
      String? passageText,
      Map<String, dynamic>? options,
      String? correctAnswer,
      String? modelAnswer,
      String explanation,
      String theme,
      int difficultyScore,
      bool isDownloaded});
}

/// @nodoc
class __$$QuestionImplCopyWithImpl<$Res>
    extends _$QuestionCopyWithImpl<$Res, _$QuestionImpl>
    implements _$$QuestionImplCopyWith<$Res> {
  __$$QuestionImplCopyWithImpl(
      _$QuestionImpl _value, $Res Function(_$QuestionImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? module = null,
    Object? testType = null,
    Object? level = null,
    Object? questionText = null,
    Object? audioUrl = freezed,
    Object? passageText = freezed,
    Object? options = freezed,
    Object? correctAnswer = freezed,
    Object? modelAnswer = freezed,
    Object? explanation = null,
    Object? theme = null,
    Object? difficultyScore = null,
    Object? isDownloaded = null,
  }) {
    return _then(_$QuestionImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      module: null == module
          ? _value.module
          : module // ignore: cast_nullable_to_non_nullable
              as String,
      testType: null == testType
          ? _value.testType
          : testType // ignore: cast_nullable_to_non_nullable
              as String,
      level: null == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String,
      questionText: null == questionText
          ? _value.questionText
          : questionText // ignore: cast_nullable_to_non_nullable
              as String,
      audioUrl: freezed == audioUrl
          ? _value.audioUrl
          : audioUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      passageText: freezed == passageText
          ? _value.passageText
          : passageText // ignore: cast_nullable_to_non_nullable
              as String?,
      options: freezed == options
          ? _value._options
          : options // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      correctAnswer: freezed == correctAnswer
          ? _value.correctAnswer
          : correctAnswer // ignore: cast_nullable_to_non_nullable
              as String?,
      modelAnswer: freezed == modelAnswer
          ? _value.modelAnswer
          : modelAnswer // ignore: cast_nullable_to_non_nullable
              as String?,
      explanation: null == explanation
          ? _value.explanation
          : explanation // ignore: cast_nullable_to_non_nullable
              as String,
      theme: null == theme
          ? _value.theme
          : theme // ignore: cast_nullable_to_non_nullable
              as String,
      difficultyScore: null == difficultyScore
          ? _value.difficultyScore
          : difficultyScore // ignore: cast_nullable_to_non_nullable
              as int,
      isDownloaded: null == isDownloaded
          ? _value.isDownloaded
          : isDownloaded // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$QuestionImpl implements _Question {
  const _$QuestionImpl(
      {required this.id,
      required this.module,
      required this.testType,
      required this.level,
      required this.questionText,
      this.audioUrl,
      this.passageText,
      final Map<String, dynamic>? options,
      this.correctAnswer,
      this.modelAnswer,
      required this.explanation,
      required this.theme,
      required this.difficultyScore,
      this.isDownloaded = false})
      : _options = options;

  factory _$QuestionImpl.fromJson(Map<String, dynamic> json) =>
      _$$QuestionImplFromJson(json);

  @override
  final String id;
  @override
  final String module;
// CO, CE, EE, EO
  @override
  final String testType;
// TCF_CANADA, TEF_CANADA, BOTH
  @override
  final String level;
// A2, B1, B2, C1, C2
  @override
  final String questionText;
  @override
  final String? audioUrl;
  @override
  final String? passageText;
  final Map<String, dynamic>? _options;
  @override
  Map<String, dynamic>? get options {
    final value = _options;
    if (value == null) return null;
    if (_options is EqualUnmodifiableMapView) return _options;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

// {"A": "Option A", "B": "Option B", ...}
  @override
  final String? correctAnswer;
  @override
  final String? modelAnswer;
  @override
  final String explanation;
  @override
  final String theme;
  @override
  final int difficultyScore;
  @override
  @JsonKey()
  final bool isDownloaded;

  @override
  String toString() {
    return 'Question(id: $id, module: $module, testType: $testType, level: $level, questionText: $questionText, audioUrl: $audioUrl, passageText: $passageText, options: $options, correctAnswer: $correctAnswer, modelAnswer: $modelAnswer, explanation: $explanation, theme: $theme, difficultyScore: $difficultyScore, isDownloaded: $isDownloaded)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$QuestionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.module, module) || other.module == module) &&
            (identical(other.testType, testType) ||
                other.testType == testType) &&
            (identical(other.level, level) || other.level == level) &&
            (identical(other.questionText, questionText) ||
                other.questionText == questionText) &&
            (identical(other.audioUrl, audioUrl) ||
                other.audioUrl == audioUrl) &&
            (identical(other.passageText, passageText) ||
                other.passageText == passageText) &&
            const DeepCollectionEquality().equals(other._options, _options) &&
            (identical(other.correctAnswer, correctAnswer) ||
                other.correctAnswer == correctAnswer) &&
            (identical(other.modelAnswer, modelAnswer) ||
                other.modelAnswer == modelAnswer) &&
            (identical(other.explanation, explanation) ||
                other.explanation == explanation) &&
            (identical(other.theme, theme) || other.theme == theme) &&
            (identical(other.difficultyScore, difficultyScore) ||
                other.difficultyScore == difficultyScore) &&
            (identical(other.isDownloaded, isDownloaded) ||
                other.isDownloaded == isDownloaded));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      module,
      testType,
      level,
      questionText,
      audioUrl,
      passageText,
      const DeepCollectionEquality().hash(_options),
      correctAnswer,
      modelAnswer,
      explanation,
      theme,
      difficultyScore,
      isDownloaded);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$QuestionImplCopyWith<_$QuestionImpl> get copyWith =>
      __$$QuestionImplCopyWithImpl<_$QuestionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$QuestionImplToJson(
      this,
    );
  }
}

abstract class _Question implements Question {
  const factory _Question(
      {required final String id,
      required final String module,
      required final String testType,
      required final String level,
      required final String questionText,
      final String? audioUrl,
      final String? passageText,
      final Map<String, dynamic>? options,
      final String? correctAnswer,
      final String? modelAnswer,
      required final String explanation,
      required final String theme,
      required final int difficultyScore,
      final bool isDownloaded}) = _$QuestionImpl;

  factory _Question.fromJson(Map<String, dynamic> json) =
      _$QuestionImpl.fromJson;

  @override
  String get id;
  @override
  String get module;
  @override // CO, CE, EE, EO
  String get testType;
  @override // TCF_CANADA, TEF_CANADA, BOTH
  String get level;
  @override // A2, B1, B2, C1, C2
  String get questionText;
  @override
  String? get audioUrl;
  @override
  String? get passageText;
  @override
  Map<String, dynamic>? get options;
  @override // {"A": "Option A", "B": "Option B", ...}
  String? get correctAnswer;
  @override
  String? get modelAnswer;
  @override
  String get explanation;
  @override
  String get theme;
  @override
  int get difficultyScore;
  @override
  bool get isDownloaded;
  @override
  @JsonKey(ignore: true)
  _$$QuestionImplCopyWith<_$QuestionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
