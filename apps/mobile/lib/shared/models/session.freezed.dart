// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'session.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

SessionModel _$SessionModelFromJson(Map<String, dynamic> json) {
  return _SessionModel.fromJson(json);
}

/// @nodoc
mixin _$SessionModel {
  String get id => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  String get sessionType => throw _privateConstructorUsedError;
  String get module => throw _privateConstructorUsedError;
  String? get testType => throw _privateConstructorUsedError;
  DateTime get startedAt => throw _privateConstructorUsedError;
  DateTime? get completedAt => throw _privateConstructorUsedError;
  int? get durationSeconds => throw _privateConstructorUsedError;
  double? get scoreAuto => throw _privateConstructorUsedError;
  String? get nclcEstimate => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  Map<String, dynamic> get answers =>
      throw _privateConstructorUsedError; // {questionId: answerText}
  int get currentIndex => throw _privateConstructorUsedError;
  int get timeLeftSeconds => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SessionModelCopyWith<SessionModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SessionModelCopyWith<$Res> {
  factory $SessionModelCopyWith(
          SessionModel value, $Res Function(SessionModel) then) =
      _$SessionModelCopyWithImpl<$Res, SessionModel>;
  @useResult
  $Res call(
      {String id,
      String userId,
      String sessionType,
      String module,
      String? testType,
      DateTime startedAt,
      DateTime? completedAt,
      int? durationSeconds,
      double? scoreAuto,
      String? nclcEstimate,
      String status,
      Map<String, dynamic> answers,
      int currentIndex,
      int timeLeftSeconds});
}

/// @nodoc
class _$SessionModelCopyWithImpl<$Res, $Val extends SessionModel>
    implements $SessionModelCopyWith<$Res> {
  _$SessionModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? sessionType = null,
    Object? module = null,
    Object? testType = freezed,
    Object? startedAt = null,
    Object? completedAt = freezed,
    Object? durationSeconds = freezed,
    Object? scoreAuto = freezed,
    Object? nclcEstimate = freezed,
    Object? status = null,
    Object? answers = null,
    Object? currentIndex = null,
    Object? timeLeftSeconds = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      sessionType: null == sessionType
          ? _value.sessionType
          : sessionType // ignore: cast_nullable_to_non_nullable
              as String,
      module: null == module
          ? _value.module
          : module // ignore: cast_nullable_to_non_nullable
              as String,
      testType: freezed == testType
          ? _value.testType
          : testType // ignore: cast_nullable_to_non_nullable
              as String?,
      startedAt: null == startedAt
          ? _value.startedAt
          : startedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      completedAt: freezed == completedAt
          ? _value.completedAt
          : completedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      durationSeconds: freezed == durationSeconds
          ? _value.durationSeconds
          : durationSeconds // ignore: cast_nullable_to_non_nullable
              as int?,
      scoreAuto: freezed == scoreAuto
          ? _value.scoreAuto
          : scoreAuto // ignore: cast_nullable_to_non_nullable
              as double?,
      nclcEstimate: freezed == nclcEstimate
          ? _value.nclcEstimate
          : nclcEstimate // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      answers: null == answers
          ? _value.answers
          : answers // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      currentIndex: null == currentIndex
          ? _value.currentIndex
          : currentIndex // ignore: cast_nullable_to_non_nullable
              as int,
      timeLeftSeconds: null == timeLeftSeconds
          ? _value.timeLeftSeconds
          : timeLeftSeconds // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SessionModelImplCopyWith<$Res>
    implements $SessionModelCopyWith<$Res> {
  factory _$$SessionModelImplCopyWith(
          _$SessionModelImpl value, $Res Function(_$SessionModelImpl) then) =
      __$$SessionModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String userId,
      String sessionType,
      String module,
      String? testType,
      DateTime startedAt,
      DateTime? completedAt,
      int? durationSeconds,
      double? scoreAuto,
      String? nclcEstimate,
      String status,
      Map<String, dynamic> answers,
      int currentIndex,
      int timeLeftSeconds});
}

/// @nodoc
class __$$SessionModelImplCopyWithImpl<$Res>
    extends _$SessionModelCopyWithImpl<$Res, _$SessionModelImpl>
    implements _$$SessionModelImplCopyWith<$Res> {
  __$$SessionModelImplCopyWithImpl(
      _$SessionModelImpl _value, $Res Function(_$SessionModelImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? sessionType = null,
    Object? module = null,
    Object? testType = freezed,
    Object? startedAt = null,
    Object? completedAt = freezed,
    Object? durationSeconds = freezed,
    Object? scoreAuto = freezed,
    Object? nclcEstimate = freezed,
    Object? status = null,
    Object? answers = null,
    Object? currentIndex = null,
    Object? timeLeftSeconds = null,
  }) {
    return _then(_$SessionModelImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      sessionType: null == sessionType
          ? _value.sessionType
          : sessionType // ignore: cast_nullable_to_non_nullable
              as String,
      module: null == module
          ? _value.module
          : module // ignore: cast_nullable_to_non_nullable
              as String,
      testType: freezed == testType
          ? _value.testType
          : testType // ignore: cast_nullable_to_non_nullable
              as String?,
      startedAt: null == startedAt
          ? _value.startedAt
          : startedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      completedAt: freezed == completedAt
          ? _value.completedAt
          : completedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      durationSeconds: freezed == durationSeconds
          ? _value.durationSeconds
          : durationSeconds // ignore: cast_nullable_to_non_nullable
              as int?,
      scoreAuto: freezed == scoreAuto
          ? _value.scoreAuto
          : scoreAuto // ignore: cast_nullable_to_non_nullable
              as double?,
      nclcEstimate: freezed == nclcEstimate
          ? _value.nclcEstimate
          : nclcEstimate // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      answers: null == answers
          ? _value._answers
          : answers // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      currentIndex: null == currentIndex
          ? _value.currentIndex
          : currentIndex // ignore: cast_nullable_to_non_nullable
              as int,
      timeLeftSeconds: null == timeLeftSeconds
          ? _value.timeLeftSeconds
          : timeLeftSeconds // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SessionModelImpl implements _SessionModel {
  const _$SessionModelImpl(
      {required this.id,
      required this.userId,
      required this.sessionType,
      required this.module,
      this.testType,
      required this.startedAt,
      this.completedAt,
      this.durationSeconds,
      this.scoreAuto,
      this.nclcEstimate,
      this.status = 'in_progress',
      final Map<String, dynamic> answers = const {},
      this.currentIndex = 0,
      this.timeLeftSeconds = 0})
      : _answers = answers;

  factory _$SessionModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$SessionModelImplFromJson(json);

  @override
  final String id;
  @override
  final String userId;
  @override
  final String sessionType;
  @override
  final String module;
  @override
  final String? testType;
  @override
  final DateTime startedAt;
  @override
  final DateTime? completedAt;
  @override
  final int? durationSeconds;
  @override
  final double? scoreAuto;
  @override
  final String? nclcEstimate;
  @override
  @JsonKey()
  final String status;
  final Map<String, dynamic> _answers;
  @override
  @JsonKey()
  Map<String, dynamic> get answers {
    if (_answers is EqualUnmodifiableMapView) return _answers;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_answers);
  }

// {questionId: answerText}
  @override
  @JsonKey()
  final int currentIndex;
  @override
  @JsonKey()
  final int timeLeftSeconds;

  @override
  String toString() {
    return 'SessionModel(id: $id, userId: $userId, sessionType: $sessionType, module: $module, testType: $testType, startedAt: $startedAt, completedAt: $completedAt, durationSeconds: $durationSeconds, scoreAuto: $scoreAuto, nclcEstimate: $nclcEstimate, status: $status, answers: $answers, currentIndex: $currentIndex, timeLeftSeconds: $timeLeftSeconds)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SessionModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.sessionType, sessionType) ||
                other.sessionType == sessionType) &&
            (identical(other.module, module) || other.module == module) &&
            (identical(other.testType, testType) ||
                other.testType == testType) &&
            (identical(other.startedAt, startedAt) ||
                other.startedAt == startedAt) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt) &&
            (identical(other.durationSeconds, durationSeconds) ||
                other.durationSeconds == durationSeconds) &&
            (identical(other.scoreAuto, scoreAuto) ||
                other.scoreAuto == scoreAuto) &&
            (identical(other.nclcEstimate, nclcEstimate) ||
                other.nclcEstimate == nclcEstimate) &&
            (identical(other.status, status) || other.status == status) &&
            const DeepCollectionEquality().equals(other._answers, _answers) &&
            (identical(other.currentIndex, currentIndex) ||
                other.currentIndex == currentIndex) &&
            (identical(other.timeLeftSeconds, timeLeftSeconds) ||
                other.timeLeftSeconds == timeLeftSeconds));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      userId,
      sessionType,
      module,
      testType,
      startedAt,
      completedAt,
      durationSeconds,
      scoreAuto,
      nclcEstimate,
      status,
      const DeepCollectionEquality().hash(_answers),
      currentIndex,
      timeLeftSeconds);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SessionModelImplCopyWith<_$SessionModelImpl> get copyWith =>
      __$$SessionModelImplCopyWithImpl<_$SessionModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SessionModelImplToJson(
      this,
    );
  }
}

abstract class _SessionModel implements SessionModel {
  const factory _SessionModel(
      {required final String id,
      required final String userId,
      required final String sessionType,
      required final String module,
      final String? testType,
      required final DateTime startedAt,
      final DateTime? completedAt,
      final int? durationSeconds,
      final double? scoreAuto,
      final String? nclcEstimate,
      final String status,
      final Map<String, dynamic> answers,
      final int currentIndex,
      final int timeLeftSeconds}) = _$SessionModelImpl;

  factory _SessionModel.fromJson(Map<String, dynamic> json) =
      _$SessionModelImpl.fromJson;

  @override
  String get id;
  @override
  String get userId;
  @override
  String get sessionType;
  @override
  String get module;
  @override
  String? get testType;
  @override
  DateTime get startedAt;
  @override
  DateTime? get completedAt;
  @override
  int? get durationSeconds;
  @override
  double? get scoreAuto;
  @override
  String? get nclcEstimate;
  @override
  String get status;
  @override
  Map<String, dynamic> get answers;
  @override // {questionId: answerText}
  int get currentIndex;
  @override
  int get timeLeftSeconds;
  @override
  @JsonKey(ignore: true)
  _$$SessionModelImplCopyWith<_$SessionModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
