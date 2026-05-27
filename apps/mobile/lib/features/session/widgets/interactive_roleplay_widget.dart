import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import '../../../shared/providers/providers.dart';
import '../../../shared/models/question.dart';

class RoleplayMessage {
  final String sender; // 'candidate' or 'examiner'
  final String text;
  final String? audioUrl;

  RoleplayMessage({
    required this.sender,
    required this.text,
    this.audioUrl,
  });

  Map<String, dynamic> toJson() => {
        'sender': sender,
        'text': text,
        'audioUrl': audioUrl,
      };

  factory RoleplayMessage.fromJson(Map<String, dynamic> json) => RoleplayMessage(
        sender: json['sender'] as String,
        text: json['text'] as String,
        audioUrl: json['audioUrl'] as String?,
      );
}

class InteractiveRoleplayWidget extends ConsumerStatefulWidget {
  final String sessionId;
  final Question question;
  final Function(String resultJson) onComplete;

  const InteractiveRoleplayWidget({
    super.key,
    required this.sessionId,
    required this.question,
    required this.onComplete,
  });

  @override
  ConsumerState<InteractiveRoleplayWidget> createState() =>
      _InteractiveRoleplayWidgetState();
}

class _InteractiveRoleplayWidgetState
    extends ConsumerState<InteractiveRoleplayWidget> {
  final List<RoleplayMessage> _messages = [];
  int _currentTurn = 0;
  final int _maxTurns = 3;

  // Audio elements
  final AudioPlayer _player = AudioPlayer();
  final AudioRecorder _recorder = AudioRecorder();

  // State flags
  bool _isRecording = false;
  bool _isPlayingPreview = false;
  bool _isSubmitting = false;
  String? _localAudioPath;
  int? _playingMessageIndex;

  // Recording timer
  Timer? _recordingTimer;
  int _recordingDurationSeconds = 0;

  // Scroll controller to auto scroll chat
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _initAudioPlayer();
  }

  @override
  void dispose() {
    _recordingTimer?.cancel();
    _player.dispose();
    _recorder.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _initAudioPlayer() {
    _player.playerStateStream.listen((state) {
      if (mounted) {
        setState(() {
          if (state.processingState == ProcessingState.completed) {
            _isPlayingPreview = false;
            _playingMessageIndex = null;
            _player.seek(Duration.zero);
            _player.pause();
          }
        });
      }
    });
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _startRecording() async {
    try {
      if (await _recorder.hasPermission()) {
        final tempDir = await getTemporaryDirectory();
        final path =
            '${tempDir.path}/roleplay_turn_${widget.sessionId}_${widget.question.id}_$_currentTurn.m4a';

        // Nettoyer fichier existant
        final file = File(path);
        if (await file.exists()) {
          await file.delete();
        }

        await _recorder.start(
          const RecordConfig(
            encoder: AudioEncoder.aacLc,
            sampleRate: 16000, // Idéal pour la transcription vocale
            bitRate: 64000,
          ),
          path: path,
        );

        _recordingDurationSeconds = 0;
        _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
          if (mounted) {
            setState(() {
              _recordingDurationSeconds++;
            });
          }
        });

        setState(() {
          _isRecording = true;
          _localAudioPath = path;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
                'L\'autorisation du microphone est requise pour s\'enregistrer.'),
            backgroundColor: Color(0xFFC00000),
          ),
        );
      }
    } catch (e) {
      debugPrint('Error starting roleplay recording: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur d\'enregistrement : $e')),
      );
    }
  }

  Future<void> _stopRecording() async {
    _recordingTimer?.cancel();
    try {
      final path = await _recorder.stop();
      setState(() {
        _isRecording = false;
      });
      if (path != null) {
        setState(() {
          _localAudioPath = path;
        });
      }
    } catch (e) {
      debugPrint('Error stopping roleplay recording: $e');
    }
  }

  Future<void> _playPausePreview() async {
    if (_localAudioPath == null) return;
    try {
      if (_isPlayingPreview) {
        await _player.pause();
        setState(() => _isPlayingPreview = false);
      } else {
        await _player.setFilePath(_localAudioPath!);
        setState(() {
          _isPlayingPreview = true;
          _playingMessageIndex = null;
        });
        await _player.play();
      }
    } catch (e) {
      debugPrint('Error playing preview: $e');
    }
  }

  Future<void> _playPauseMessage(int index, String? url) async {
    if (url == null || url.isEmpty) return;
    try {
      if (_playingMessageIndex == index) {
        await _player.pause();
        setState(() => _playingMessageIndex = null);
      } else {
        await _player.setUrl(url);
        setState(() {
          _playingMessageIndex = index;
          _isPlayingPreview = false;
        });
        await _player.play();
      }
    } catch (e) {
      debugPrint('Error playing message audio: $e');
    }
  }

  void _deleteRecording() {
    if (_localAudioPath != null) {
      final file = File(_localAudioPath!);
      if (file.existsSync()) {
        file.deleteSync();
      }
    }
    setState(() {
      _localAudioPath = null;
      _isPlayingPreview = false;
    });
  }

  Future<void> _submitTurn() async {
    if (_localAudioPath == null) return;

    setState(() {
      _isSubmitting = true;
    });
    _scrollToBottom();

    try {
      final supabaseService = ref.read(supabaseServiceProvider);

      // Préparer l'historique au format attendu
      final history = _messages
          .map((m) => {
                'sender': m.sender,
                'text': m.text,
              })
          .toList();

      final result = await supabaseService.sendRoleplayTurn(
        sessionId: widget.sessionId,
        questionId: widget.question.id,
        turnIndex: _currentTurn,
        localAudioPath: _localAudioPath!,
        history: history,
      );

      if (result['success'] == true || supabaseService.useMock) {
        final userTranscript =
            result['user_transcript'] ?? 'Transcription du candidat';
        final replyText = result['reply_text'] ?? 'Réponse de l\'examinateur';
        final replyAudioUrl = result['reply_audio_url'];

        setState(() {
          _messages.add(RoleplayMessage(
            sender: 'candidate',
            text: userTranscript,
          ));
          _messages.add(RoleplayMessage(
            sender: 'examiner',
            text: replyText,
            audioUrl: replyAudioUrl,
          ));

          _localAudioPath = null;
          _currentTurn++;
          _isSubmitting = false;
        });

        _scrollToBottom();

        // Jouer automatiquement la réponse de l'examinateur si disponible
        if (replyAudioUrl != null && replyAudioUrl.isNotEmpty) {
          _playPauseMessage(_messages.length - 1, replyAudioUrl);
        }

        // Si nous avons atteint le max de tours, terminer
        if (_currentTurn >= _maxTurns) {
          final transcriptJson = jsonEncode({
            'history': _messages.map((m) => m.toJson()).toList(),
            'total_turns': _currentTurn,
            'completed': true,
          });
          widget.onComplete(transcriptJson);
        }
      } else {
        throw Exception(result['error'] ?? 'Erreur inconnue');
      }
    } catch (e) {
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur de transmission : $e'),
          backgroundColor: const Color(0xFFC00000),
        ),
      );
    }
  }

  String _formatDuration(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isDone = _currentTurn >= _maxTurns;

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withOpacity(0.4),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner Consignes
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFC55A11).withOpacity(0.12),
              border: Border.all(color: const Color(0xFFC55A11).withOpacity(0.4)),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.record_voice_over,
                    color: Color(0xFFC55A11), size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    isDone
                        ? 'Jeu de rôle terminé ! Cliquez sur le bouton "Suivant" ci-dessous pour continuer.'
                        : 'Jeu de rôle oral : ${_maxTurns - _currentTurn} tour(s) restant(s). Exprimez-vous clairement.',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Instruction / Prompt
          Text(
            widget.question.questionText,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 14.5,
              height: 1.4,
              fontStyle: FontStyle.italic,
            ),
          ),
          const Divider(height: 24, color: Colors.white10),

          // Message/Chat area
          Expanded(
            child: Container(
              height: 280,
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: _messages.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.chat_bubble_outline,
                              color: Colors.white24, size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            'Démarrez l\'échange en enregistrant\nvotre première réplique.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white38,
                              fontSize: 13,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      itemCount: _messages.length,
                      itemBuilder: (context, index) {
                        final msg = _messages[index];
                        final isCandidate = msg.sender == 'candidate';

                        return Container(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          alignment: isCandidate
                              ? Alignment.centerRight
                              : Alignment.centerLeft,
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.72,
                            ),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              gradient: isCandidate
                                  ? const LinearGradient(
                                      colors: [
                                        Color(0xFFC55A11),
                                        Color(0xFFE36C22)
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    )
                                  : null,
                              color: isCandidate ? null : const Color(0xFF1E293B),
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(16),
                                topRight: const Radius.circular(16),
                                bottomLeft: isCandidate
                                    ? const Radius.circular(16)
                                    : Radius.zero,
                                bottomRight: isCandidate
                                    ? Radius.zero
                                    : const Radius.circular(16),
                              ),
                              border: isCandidate
                                  ? null
                                  : Border.all(color: Colors.white.withOpacity(0.06)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.08),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Label
                                Text(
                                  isCandidate ? 'Vous' : 'Examinateur IA',
                                  style: TextStyle(
                                    color: isCandidate
                                        ? Colors.white.withOpacity(0.8)
                                        : const Color(0xFFC55A11),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                // Text
                                Text(
                                  msg.text,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    height: 1.35,
                                  ),
                                ),
                                // Audio Replay for examiner
                                if (!isCandidate &&
                                    msg.audioUrl != null &&
                                    msg.audioUrl!.isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  InkWell(
                                    onTap: () => _playPauseMessage(
                                        index, msg.audioUrl),
                                    borderRadius: BorderRadius.circular(20),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          _playingMessageIndex == index
                                              ? Icons.pause_circle_filled
                                              : Icons.play_circle_fill,
                                          color: Colors.white70,
                                          size: 20,
                                        ),
                                        const SizedBox(width: 6),
                                        const Text(
                                          'Réécouter',
                                          style: TextStyle(
                                            color: Colors.white70,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ),

          const Divider(height: 24, color: Colors.white10),

          // Loading response state
          if (_isSubmitting) ...[
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        color: Color(0xFFC55A11),
                        strokeWidth: 2.5,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'L\'examinateur réfléchit...',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // Interaction Controls (only active when not complete and not submitting)
          if (!isDone && !_isSubmitting) ...[
            if (_localAudioPath == null) ...[
              // Recording Trigger Action
              Center(
                child: Column(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _isRecording
                            ? const Color(0xFFC00000).withOpacity(0.15)
                            : const Color(0xFFC55A11).withOpacity(0.1),
                        border: Border.all(
                          color: _isRecording
                              ? const Color(0xFFC00000)
                              : const Color(0xFFC55A11).withOpacity(0.6),
                          width: 2,
                        ),
                      ),
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isRecording
                              ? const Color(0xFFC00000)
                              : const Color(0xFFC55A11),
                        ),
                        child: IconButton(
                          onPressed: () {
                            if (_isRecording) {
                              _stopRecording();
                            } else {
                              _startRecording();
                            }
                          },
                          icon: Icon(
                            _isRecording ? Icons.stop : Icons.mic,
                            color: Colors.white,
                            size: 28,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _isRecording
                          ? 'Enregistrement... ${_formatDuration(_recordingDurationSeconds)}'
                          : 'Maintenez ou appuyez pour parler',
                      style: TextStyle(
                        color: _isRecording
                            ? const Color(0xFFEF4444)
                            : Colors.white60,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Local Preview & Submit controls
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.03),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Row(
                  children: [
                    // Play preview
                    IconButton(
                      onPressed: _playPausePreview,
                      icon: Icon(
                        _isPlayingPreview
                            ? Icons.pause_circle_filled
                            : Icons.play_circle_fill,
                        color: const Color(0xFFC55A11),
                        size: 36,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Réplique enregistrée',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Prêt à être envoyé',
                            style: TextStyle(
                              color: Colors.white38,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Trash / Re-record
                    IconButton(
                      onPressed: _deleteRecording,
                      icon: const Icon(
                        Icons.delete_outline,
                        color: Color(0xFFEF4444),
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Submit
                    ElevatedButton.icon(
                      onPressed: _submitTurn,
                      icon: const Icon(Icons.send, size: 14),
                      label: const Text('Envoyer'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFC55A11),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ]
          ],

          // Completion Summary Banner
          if (isDone) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E7145).withOpacity(0.12),
                border: Border.all(color: const Color(0xFF1E7145).withOpacity(0.4)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle_outline,
                      color: Color(0xFF1E7145), size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Jeu de rôle complété',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Votre échange de 3 tours a été enregistré.',
                          style: TextStyle(
                            color: Colors.white60,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
