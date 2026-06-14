import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:just_audio/just_audio.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import '../../../shared/providers/providers.dart';
import '../../../shared/models/question.dart';
import '../../../shared/models/session.dart';
import '../widgets/qcm_question_widget.dart';
import '../widgets/interactive_roleplay_widget.dart';

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
  String? _localAudioPath;

  // Audio Player & Recorder
  final AudioPlayer _audioPlayer = AudioPlayer();
  final AudioRecorder _audioRecorder = AudioRecorder();
  
  // Player state variables
  bool _isPlaying = false;
  int _listenCount = 0;
  Duration _audioPosition = Duration.zero;
  Duration _audioDuration = Duration.zero;
  
  // Stream subscriptions
  StreamSubscription? _playerStateSub;
  StreamSubscription? _positionSub;
  StreamSubscription? _durationSub;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
    _startTimer();
    _initAudioPlayer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _writtenAnswerController.dispose();
    _playerStateSub?.cancel();
    _positionSub?.cancel();
    _durationSub?.cancel();
    _audioPlayer.dispose();
    _audioRecorder.dispose();
    super.dispose();
  }

  void _initAudioPlayer() {
    _positionSub = _audioPlayer.positionStream.listen((pos) {
      if (mounted) setState(() => _audioPosition = pos);
    });
    _durationSub = _audioPlayer.durationStream.listen((dur) {
      if (mounted) setState(() => _audioDuration = dur ?? Duration.zero);
    });
    _playerStateSub = _audioPlayer.playerStateStream.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state.playing;
          if (state.processingState == ProcessingState.completed) {
            _audioPlayer.seek(Duration.zero);
            _audioPlayer.pause();
          }
        });
      }
    });
  }

  void _resetAudioPlayerForNextQuestion() {
    _audioPlayer.stop();
    if (mounted) {
      setState(() {
        _listenCount = 0;
        _audioPosition = Duration.zero;
        _audioDuration = Duration.zero;
      });
    }
  }

  Future<void> _togglePlayPause(String? url, int maxListens) async {
    if (url == null || url.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Aucun extrait audio disponible pour cette question.')),
      );
      return;
    }

    try {
      if (_isPlaying) {
        await _audioPlayer.pause();
      } else {
        if (_audioPlayer.audioSource == null || _audioPlayer.processingState == ProcessingState.idle) {
          if (_listenCount >= maxListens) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Limite d\'écoutes ($maxListens) atteinte pour cette question.')),
            );
            return;
          }
          if (url.startsWith('http://') || url.startsWith('https://')) {
            await _audioPlayer.setUrl(url);
          } else {
            await _audioPlayer.setFilePath(url);
          }
          setState(() {
            _listenCount++;
          });
        }
        await _audioPlayer.play();
      }
    } catch (e) {
      debugPrint('Error playing audio: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur de lecture audio : $e')),
      );
    }
  }

  Future<void> _togglePlayPreview(String localPath) async {
    try {
      if (_isPlaying) {
        await _audioPlayer.pause();
      } else {
        await _audioPlayer.setFilePath(localPath);
        await _audioPlayer.play();
      }
    } catch (e) {
      debugPrint('Error playing preview: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur de lecture de l\'aperçu : $e')),
      );
    }
  }

  Future<void> _startRecording(String questionId) async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final tempDir = await getTemporaryDirectory();
        final path = '${tempDir.path}/recording_${widget.sessionId}_$questionId.m4a';
        
        await _audioRecorder.start(
          const RecordConfig(
            encoder: AudioEncoder.aacLc,
            sampleRate: 44100,
            bitRate: 128000,
          ),
          path: path,
        );
        
        setState(() {
          _isRecording = true;
          _localAudioPath = path;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('L\'autorisation du microphone est requise pour s\'enregistrer.')),
        );
      }
    } catch (e) {
      debugPrint('Error starting recording: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur de démarrage d\'enregistrement : $e')),
      );
    }
  }

  Future<void> _stopRecording(String questionId) async {
    try {
      final path = await _audioRecorder.stop();
      setState(() {
        _isRecording = false;
      });
      if (path != null) {
        setState(() {
          _answers[questionId] = path;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Enregistrement vocal sauvegardé localement.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      debugPrint('Error stopping recording: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur d\'arrêt d\'enregistrement : $e')),
      );
    }
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
            audioUrl: q.audioLocalPath,
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
    _resetAudioPlayerForNextQuestion();
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
    final isRoleplay = widget.module == 'EO' &&
        (currentQuestion.theme.toLowerCase().contains('roleplay') ||
            currentQuestion.theme.toLowerCase().contains('jeu de rôle') ||
            currentQuestion.questionText.toLowerCase().contains('jeu de rôle') ||
            currentQuestion.questionText.toLowerCase().contains('roleplay'));
    final canProceed = !isRoleplay || _answers.containsKey(currentQuestion.id);

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
                        _buildAudioPlayerCard(currentQuestion.audioUrl),
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
                        _buildEoArea(currentQuestion),
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
                          ? () {
                              _resetAudioPlayerForNextQuestion();
                              setState(() => _currentIndex--);
                            }
                          : null,
                      child: const Text('Précédent', style: TextStyle(color: Colors.white60)),
                    ),
                    ElevatedButton(
                      onPressed: canProceed ? _nextQuestion : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: canProceed ? const Color(0xFFC55A11) : Colors.white12,
                        foregroundColor: canProceed ? Colors.white : Colors.white30,
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

  Widget _buildAudioPlayerCard(String? audioUrl) {
    const int maxListens = 2;
    final progress = _audioDuration.inMilliseconds > 0
        ? _audioPosition.inMilliseconds / _audioDuration.inMilliseconds
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E3A6B).withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E3A6B)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              IconButton(
                onPressed: () => _togglePlayPause(audioUrl, maxListens),
                icon: Icon(
                  _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                  color: const Color(0xFFC55A11),
                  size: 40,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Extrait audio de l\'épreuve',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Écoute $_listenCount/$maxListens autorisée(s)',
                      style: TextStyle(
                        color: _listenCount >= maxListens ? Colors.redAccent : Colors.white60,
                        fontSize: 12,
                        fontWeight: _listenCount >= maxListens ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '${_formatTime(_audioPosition.inSeconds)} / ${_formatTime(_audioDuration.inSeconds)}',
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.white.withOpacity(0.05),
              color: const Color(0xFFC55A11),
              minHeight: 4,
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
    final recordedPath = _answers[question.id];
    final hasRecording = recordedPath != null && recordedPath.startsWith('/');

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
              if (!hasRecording) ...[
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
                      if (_isRecording) {
                        _stopRecording(question.id);
                      } else {
                        _startRecording(question.id);
                      }
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
              ] else ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              IconButton(
                                onPressed: () => _togglePlayPreview(recordedPath),
                                icon: Icon(
                                  _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                                  color: const Color(0xFFC55A11),
                                  size: 32,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'Aperçu de votre enregistrement',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                            ],
                          ),
                          IconButton(
                            onPressed: () {
                              _resetAudioPlayerForNextQuestion();
                              setState(() {
                                _answers.remove(question.id);
                              });
                            },
                            icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Vous pouvez écouter ou ré-enregistrer votre réponse avant de valider.',
                  style: TextStyle(color: Colors.white38, fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEoArea(Question question) {
    final isRoleplay = question.theme.toLowerCase().contains('roleplay') ||
        question.theme.toLowerCase().contains('jeu de rôle') ||
        question.questionText.toLowerCase().contains('jeu de rôle') ||
        question.questionText.toLowerCase().contains('roleplay');

    if (isRoleplay) {
      return InteractiveRoleplayWidget(
        sessionId: widget.sessionId,
        question: question,
        onComplete: (resultJson) {
          setState(() {
            _answers[question.id] = resultJson;
          });
        },
      );
    } else {
      return _buildVoiceRecordingArea(question);
    }
  }
}
