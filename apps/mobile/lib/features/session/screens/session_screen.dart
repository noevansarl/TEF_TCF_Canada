import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/providers.dart';
import '../../../shared/models/question.dart';
import '../../../shared/models/session.dart';
import '../widgets/qcm_question_widget.dart';

class SessionScreen extends ConsumerStatefulWidget {
  final String sessionId;
  final String module;
  final String testType;
  final String level;
  final bool isOffline;

  const SessionScreen({
    super.key,
    required this.sessionId,
    required this.module,
    required this.testType,
    required this.level,
    this.isOffline = false,
  });

  @override
  ConsumerState<SessionScreen> createState() => _SessionScreenState();
}

class _SessionScreenState extends ConsumerState<SessionScreen> {
  List<Question> _questions = [];
  int _currentIndex = 0;
  final Map<String, String> _answers = {};
  bool _isLoading = true;
  
  // Timer attributes
  Timer? _timer;
  int _timeLeftSeconds = 1800; // 30 minutes par défaut

  // EE Written input controller
  final _writtenAnswerController = TextEditingController();

  // EO Oral recording attributes
  bool _isRecording = false;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _writtenAnswerController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeftSeconds > 0) {
        setState(() {
          _timeLeftSeconds--;
        });
      } else {
        _timer?.cancel();
        _finishSession();
      }
    });
  }

  Future<void> _loadQuestions() async {
    setState(() => _isLoading = true);
    
    try {
      if (widget.isOffline) {
        // Récupérer depuis Drift DB locale
        final localDb = ref.read(appDatabaseProvider);
        final localQs = await localDb.getOfflineQuestions(
          widget.module,
          widget.testType,
          widget.level,
          10, // 10 questions max hors-ligne
        );
        
        setState(() {
          _questions = localQs.map((q) => Question(
            id: q.id,
            module: q.module,
            testType: q.testType,
            level: q.level,
            questionText: q.questionText,
            passageText: q.passageText,
            options: q.optionsJson != null ? Map<String, dynamic>.from(
              jsonDecode(q.optionsJson!)
            ) : null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            theme: 'Général',
            difficultyScore: 5,
          )).toList();
          _isLoading = false;
        });
      } else {
        // Récupérer en ligne depuis Supabase
        final supabaseService = ref.read(supabaseServiceProvider);
        final rawQs = await supabaseService.fetchQuestions(
          widget.module,
          widget.testType,
          widget.level,
        );

        setState(() {
          _questions = rawQs.map((q) => Question.fromJson(q)).toList();
          _isLoading = false;
        });
      }

      // Si aucune question n'est retournée, charger des mocks de secours
      if (_questions.isEmpty) {
        _loadFallbackQuestions();
      }
    } catch (e) {
      _loadFallbackQuestions();
    }
  }

  void _loadFallbackQuestions() {
    setState(() {
      _questions = [
        Question(
          id: 'mock-q-1',
          module: widget.module,
          testType: widget.testType,
          level: widget.level,
          questionText: 'Compréhension du Canada : Quelle est la capitale fédérale du Canada ?',
          options: {
            'A': 'Montréal',
            'B': 'Ottawa',
            'C': 'Toronto',
            'D': 'Vancouver',
          },
          correctAnswer: 'B',
          explanation: 'Ottawa est la capitale fédérale officielle du Canada.',
          theme: 'Histoire et Géographie',
          difficultyScore: 3,
        ),
        Question(
          id: 'mock-q-2',
          module: widget.module,
          testType: widget.testType,
          level: widget.level,
          questionText: 'Identifiez le synonyme de "perfectionner" :',
          options: {
            'A': 'Abandonner',
            'B': 'Améliorer',
            'C': 'Commencer',
            'D': 'Ralentir',
          },
          correctAnswer: 'B',
          explanation: 'Perfectionner signifie rendre meilleur, donc améliorer.',
          theme: 'Lexique',
          difficultyScore: 4,
        ),
      ];
      _isLoading = false;
    });
  }

  void _handleAnswerSelected(String answer) {
    setState(() {
      _answers[_questions[_currentIndex].id] = answer;
    });
  }

  void _nextQuestion() {
    if (_currentIndex < _questions.length - 1) {
      setState(() {
        _currentIndex++;
        // Réinitialiser les inputs pour EE
        _writtenAnswerController.clear();
      });
    } else {
      _finishSession();
    }
  }

  Future<void> _finishSession() async {
    _timer?.cancel();
    setState(() => _isLoading = true);

    // Calculer le score auto pour QCM (CO, CE)
    double score = 0;
    int correctCount = 0;
    int qcmCount = 0;

    for (final q in _questions) {
      if (q.correctAnswer != null) {
        qcmCount++;
        if (_answers[q.id] == q.correctAnswer) {
          correctCount++;
        }
      }
    }
    
    if (qcmCount > 0) {
      score = (correctCount / qcmCount) * 100;
    }

    // Récupérer le user ID courant
    final supabaseService = ref.read(supabaseServiceProvider);
    final String userId = supabaseService.currentUser?.id ?? '00000000-0000-0000-0000-000000000000';

    // Créer la session model
    final session = SessionModel(
      id: widget.sessionId,
      userId: userId,
      sessionType: 'TRAINING',
      module: widget.module,
      testType: widget.testType,
      startedAt: DateTime.now().subtract(Duration(seconds: 1800 - _timeLeftSeconds)),
      completedAt: DateTime.now(),
      durationSeconds: 1800 - _timeLeftSeconds,
      scoreAuto: score,
      status: 'completed',
      answers: _answers,
    );

    try {
      final localDb = ref.read(appDatabaseProvider);
      
      // 1. Sauvegarder localement dans SQLite Drift cache
      await localDb.savePendingSession(session);
      
      // 2. Déclencher synchronisation en arrière plan si connecté
      final syncService = ref.read(syncServiceProvider);
      await syncService.syncPendingSessions();
      
      if (mounted) {
        // Estimer le niveau NCLC
        final String nclc = score >= 80 ? 'C1' : score >= 50 ? 'B2' : 'B1';
        
        // Rediriger vers l'écran des résultats
        context.go('/results/${widget.sessionId}', extra: {
          'score': score,
          'nclc': nclc,
        });
      }
    } catch (e) {
      if (mounted) {
        context.go('/results/${widget.sessionId}', extra: {
          'score': score,
          'nclc': 'MIXED',
        });
      }
    }
  }

  String _formatTime(int seconds) {
    final int minutes = seconds ~/ 60;
    final int remainingSecs = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSecs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(child: CircularProgressIndicator(color: Color(0xFFC55A11))),
      );
    }

    final currentQuestion = _questions[_currentIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () {
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: const Color(0xFF1E293B),
                title: const Text('Quitter l\'épreuve ?', style: TextStyle(color: Colors.white)),
                content: const Text('Votre progression locale sera perdue.', style: TextStyle(color: Colors.white70)),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      context.go('/dashboard');
                    },
                    child: const Text('Quitter', style: TextStyle(color: Color(0xFFEF4444))),
                  ),
                ],
              ),
            );
          },
        ),
        title: Text(
          '${widget.module} - Question ${_currentIndex + 1}/${_questions.length}',
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          // Timer display
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF991B1B).withOpacity(0.2),
              border: Border.all(color: const Color(0xFFEF4444)),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.timer, color: Color(0xFFEF4444), size: 16),
                const SizedBox(width: 4),
                Text(
                  _formatTime(_timeLeftSeconds),
                  style: const TextStyle(color: Color(0xFFFCA5A5), fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: Column(
            children: [
              // Progress indicator bar
              LinearProgressIndicator(
                value: (_currentIndex + 1) / _questions.length,
                backgroundColor: Colors.white.withOpacity(0.05),
                color: const Color(0xFFC55A11),
              ),
              const SizedBox(height: 24),

              // Dynamic Question Area
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // CO Audio Player placeholder
                      if (widget.module == 'CO') ...[
                        _buildAudioPlayerCard(),
                        const SizedBox(height: 20),
                      ],

                      // QCM Question Details (CO, CE)
                      if (widget.module == 'CE' || widget.module == 'CO') ...[
                        QcmQuestionWidget(
                          question: currentQuestion,
                          selectedAnswer: _answers[currentQuestion.id],
                          onAnswerSelected: _handleAnswerSelected,
                        ),
                      ],

                      // EE Written Essay area
                      if (widget.module == 'EE') ...[
                        _buildWrittenEssayArea(currentQuestion),
                      ],

                      // EO Voice Recording area
                      if (widget.module == 'EO') ...[
                        _buildVoiceRecordingArea(currentQuestion),
                      ],
                    ],
                  ),
                ),
              ),

              // Footer button
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 20.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TextButton(
                      onPressed: _currentIndex > 0
                          ? () => setState(() => _currentIndex--)
                          : null,
                      child: const Text('Précédent', style: TextStyle(color: Colors.white60)),
                    ),
                    ElevatedButton(
                      onPressed: _nextQuestion,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFC55A11),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        _currentIndex == _questions.length - 1 ? 'Terminer' : 'Suivant',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAudioPlayerCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E3A6B).withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E3A6B)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.play_circle_fill, color: Color(0xFFC55A11), size: 40),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Extrait audio de l\'épreuve',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                SizedBox(height: 4),
                Text('Écoute 1/2 autorisée', style: TextStyle(color: Colors.white60, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWrittenEssayArea(Question question) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          question.questionText,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _writtenAnswerController,
          maxLines: 8,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Saisissez votre réponse rédigée ici (environ 150-200 mots)...',
            hintStyle: const TextStyle(color: Colors.white38),
            filled: true,
            fillColor: Colors.white.withOpacity(0.03),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFFC55A11)),
            ),
          ),
          onChanged: (text) {
            _answers[question.id] = text;
          },
        ),
      ],
    );
  }

  Widget _buildVoiceRecordingArea(Question question) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          question.questionText,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 30),
        Center(
          child: Column(
            children: [
              // Waveform representation or record button
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _isRecording ? Colors.red.withOpacity(0.2) : const Color(0xFFC55A11).withOpacity(0.2),
                  border: Border.all(
                    color: _isRecording ? Colors.red : const Color(0xFFC55A11),
                    width: 3,
                  ),
                ),
                child: IconButton(
                  onPressed: () {
                    setState(() {
                      _isRecording = !_isRecording;
                      if (_isRecording) {
                        _answers[question.id] = 'audio_session_${widget.sessionId}_recorded';
                      }
                    });
                  },
                  icon: Icon(
                    _isRecording ? Icons.stop : Icons.mic,
                    color: _isRecording ? Colors.red : const Color(0xFFC55A11),
                    size: 40,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _isRecording ? 'Enregistrement en cours...' : 'Appuyez pour commencer à parler',
                style: TextStyle(
                  color: _isRecording ? Colors.red : Colors.white60,
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
