import 'package:freezed_annotation/freezed_annotation.dart';

part 'session.freezed.dart';
part 'session.g.dart';

@freezed
class SessionModel with _$SessionModel {
  const factory SessionModel({
    required String id,
    required String userId,
    required String sessionType,
    required String module,
    String? testType,
    required DateTime startedAt,
    DateTime? completedAt,
    int? durationSeconds,
    double? scoreAuto,
    String? nclcEstimate,
    @Default('in_progress') String status,
    @Default({}) Map<String, dynamic> answers, // {questionId: answerText}
    @Default(0) int currentIndex,
    @Default(0) int timeLeftSeconds,
  }) = _SessionModel;

  factory SessionModel.fromJson(Map<String, dynamic> json) =>
      _$SessionModelFromJson(json);
}
