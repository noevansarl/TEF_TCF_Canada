import 'package:freezed_annotation/freezed_annotation.dart';

part 'question.freezed.dart';
part 'question.g.dart';

@freezed
class Question with _$Question {
  const factory Question({
    required String id,
    required String module,           // CO, CE, EE, EO
    required String testType,         // TCF_CANADA, TEF_CANADA, BOTH
    required String level,            // A2, B1, B2, C1, C2
    required String questionText,
    String? audioUrl,
    String? passageText,
    Map<String, dynamic>? options,    // {"A": "Option A", "B": "Option B", ...}
    String? correctAnswer,
    String? modelAnswer,
    required String explanation,
    required String theme,
    required int difficultyScore,
    @Default(false) bool isDownloaded,
  }) = _Question;

  factory Question.fromJson(Map<String, dynamic> json) =>
      _$QuestionFromJson(json);
}
