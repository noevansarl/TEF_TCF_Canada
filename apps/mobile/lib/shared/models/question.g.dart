// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'question.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$QuestionImpl _$$QuestionImplFromJson(Map<String, dynamic> json) =>
    _$QuestionImpl(
      id: json['id'] as String,
      module: json['module'] as String,
      testType: json['testType'] as String,
      level: json['level'] as String,
      questionText: json['questionText'] as String,
      audioUrl: json['audioUrl'] as String?,
      passageText: json['passageText'] as String?,
      options: json['options'] as Map<String, dynamic>?,
      correctAnswer: json['correctAnswer'] as String?,
      modelAnswer: json['modelAnswer'] as String?,
      explanation: json['explanation'] as String,
      theme: json['theme'] as String,
      difficultyScore: (json['difficultyScore'] as num).toInt(),
      isDownloaded: json['isDownloaded'] as bool? ?? false,
    );

Map<String, dynamic> _$$QuestionImplToJson(_$QuestionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'module': instance.module,
      'testType': instance.testType,
      'level': instance.level,
      'questionText': instance.questionText,
      'audioUrl': instance.audioUrl,
      'passageText': instance.passageText,
      'options': instance.options,
      'correctAnswer': instance.correctAnswer,
      'modelAnswer': instance.modelAnswer,
      'explanation': instance.explanation,
      'theme': instance.theme,
      'difficultyScore': instance.difficultyScore,
      'isDownloaded': instance.isDownloaded,
    };
