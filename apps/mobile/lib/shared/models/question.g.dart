// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'question.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$QuestionImpl _$$QuestionImplFromJson(Map<String, dynamic> json) =>
    _$QuestionImpl(
      id: json['id'] as String,
      module: json['module'] as String,
      testType: json['test_type'] as String,
      level: json['level'] as String,
      questionText: json['question_text'] as String,
      audioUrl: json['audio_url'] as String?,
      passageText: json['passage_text'] as String?,
      options: json['options'] as Map<String, dynamic>?,
      correctAnswer: json['correct_answer'] as String?,
      modelAnswer: json['model_answer'] as String?,
      explanation: json['explanation'] as String,
      theme: json['theme'] as String,
      difficultyScore: (json['difficulty_score'] as num).toInt(),
      isDownloaded: json['isDownloaded'] as bool? ?? false,
    );

Map<String, dynamic> _$$QuestionImplToJson(_$QuestionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'module': instance.module,
      'test_type': instance.testType,
      'level': instance.level,
      'question_text': instance.questionText,
      'audio_url': instance.audioUrl,
      'passage_text': instance.passageText,
      'options': instance.options,
      'correct_answer': instance.correctAnswer,
      'model_answer': instance.modelAnswer,
      'explanation': instance.explanation,
      'theme': instance.theme,
      'difficulty_score': instance.difficultyScore,
      'isDownloaded': instance.isDownloaded,
    };
