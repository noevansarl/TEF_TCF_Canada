// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SessionModelImpl _$$SessionModelImplFromJson(Map<String, dynamic> json) =>
    _$SessionModelImpl(
      id: json['id'] as String,
      userId: json['userId'] as String,
      sessionType: json['sessionType'] as String,
      module: json['module'] as String,
      testType: json['testType'] as String?,
      startedAt: DateTime.parse(json['startedAt'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      durationSeconds: (json['durationSeconds'] as num?)?.toInt(),
      scoreAuto: (json['scoreAuto'] as num?)?.toDouble(),
      nclcEstimate: json['nclcEstimate'] as String?,
      status: json['status'] as String? ?? 'in_progress',
      answers: json['answers'] as Map<String, dynamic>? ?? const {},
      currentIndex: (json['currentIndex'] as num?)?.toInt() ?? 0,
      timeLeftSeconds: (json['timeLeftSeconds'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$SessionModelImplToJson(_$SessionModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'sessionType': instance.sessionType,
      'module': instance.module,
      'testType': instance.testType,
      'startedAt': instance.startedAt.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'durationSeconds': instance.durationSeconds,
      'scoreAuto': instance.scoreAuto,
      'nclcEstimate': instance.nclcEstimate,
      'status': instance.status,
      'answers': instance.answers,
      'currentIndex': instance.currentIndex,
      'timeLeftSeconds': instance.timeLeftSeconds,
    };
