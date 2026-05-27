import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/question.dart';

class QcmQuestionWidget extends ConsumerStatefulWidget {
  final Question question;
  final String? selectedAnswer;
  final Function(String) onAnswerSelected;
  final bool isReview;

  const QcmQuestionWidget({
    super.key,
    required this.question,
    this.selectedAnswer,
    required this.onAnswerSelected,
    this.isReview = false,
  });

  @override
  ConsumerState<QcmQuestionWidget> createState() => _QcmQuestionWidgetState();
}

class _QcmQuestionWidgetState extends ConsumerState<QcmQuestionWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      duration: const Duration(milliseconds: 350),
      vsync: this,
    );
    _slideAnim = Tween<Offset>(begin: const Offset(0.15, 0), end: Offset.zero)
        .animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic));
    _animController.forward();
  }

  @override
  void didUpdateWidget(covariant QcmQuestionWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.question.id != widget.question.id) {
      _animController.reset();
      _animController.forward();
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final options = widget.question.options ?? {};

    return SlideTransition(
      position: _slideAnim,
      child: FadeTransition(
        opacity: _animController,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Question text
            Text(
              widget.question.questionText,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.white,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 20),

            // Textual passage (CE)
            if (widget.question.passageText != null && widget.question.passageText!.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.04),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Text(
                  widget.question.passageText!,
                  style: const TextStyle(
                    color: Colors.white70,
                    height: 1.65,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Options list
            ...options.entries.map((entry) {
              final isSelected = widget.selectedAnswer == entry.key;
              final isCorrect = widget.isReview && 
                                entry.key == widget.question.correctAnswer;
              final isWrong = widget.isReview && 
                              isSelected && 
                              entry.key != widget.question.correctAnswer;

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOut,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: widget.isReview ? null : () =>
                          widget.onAnswerSelected(entry.key),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          border: Border.all(
                            width: 2,
                            color: isCorrect ? const Color(0xFF1E7145)
                                : isWrong ? const Color(0xFFC00000)
                                : isSelected ? const Color(0xFFC55A11)
                                : Colors.white.withOpacity(0.08),
                          ),
                          borderRadius: BorderRadius.circular(12),
                          color: isCorrect ? const Color(0xFF1E7145).withOpacity(0.1)
                              : isWrong ? const Color(0xFFC00000).withOpacity(0.1)
                              : isSelected ? const Color(0xFFC55A11).withOpacity(0.1)
                              : Colors.white.withOpacity(0.02),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 28, height: 28,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isSelected || isCorrect
                                    ? const Color(0xFFC55A11)
                                    : Colors.transparent,
                                border: Border.all(
                                  color: isSelected || isCorrect
                                      ? const Color(0xFFC55A11)
                                      : Colors.white54,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  entry.key,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected || isCorrect ? Colors.white : Colors.white70,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                entry.value.toString(),
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            if (isCorrect)
                              const Icon(Icons.check_circle,
                                  color: Color(0xFF1E7145), size: 20),
                            if (isWrong)
                              const Icon(Icons.cancel,
                                  color: Color(0xFFC00000), size: 20),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}
