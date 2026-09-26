import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/providers.dart';
import '../../../shared/models/question.dart';
import '../../../shared/services/file_downloader.dart';
import '../../../shared/utils/paywall.dart';

class CatalogueScreen extends ConsumerStatefulWidget {
  const CatalogueScreen({super.key});

  @override
  ConsumerState<CatalogueScreen> createState() => _CatalogueScreenState();
}

class _CatalogueScreenState extends ConsumerState<CatalogueScreen> {
  String _selectedModule = 'CO'; // CO, CE, EE, EO
  String _selectedLevel = 'B2';  // B1, B2, C1, C2
  bool _isDownloading = false;
  bool _isLoadingSheets = true;

  // Livrets d'exercices construits à partir des vraies questions en base,
  // groupées par thème, pour le module/niveau actuellement sélectionné.
  List<Map<String, dynamic>> _exerciseSheets = [];

  @override
  void initState() {
    super.initState();
    _loadExerciseSheets();
  }

  Future<void> _loadExerciseSheets() async {
    setState(() => _isLoadingSheets = true);
    try {
      final supabaseService = ref.read(supabaseServiceProvider);
      final previews = await supabaseService.fetchThemePreviews(
        _selectedModule,
        'TCF_CANADA',
        _selectedLevel,
      );

      final sheets = previews.map((p) {
        final theme = (p['theme'] as String?)?.trim() ?? 'Général';
        final count = (p['question_count'] as num?)?.toInt() ?? 0;
        return {
          'id': 'theme-$theme',
          'title': theme,
          'questionsCount': count,
          'durationMinutes': (count * 1.5).round().clamp(5, 45),
          'theme': theme,
        };
      }).toList();

      if (mounted) {
        setState(() {
          _exerciseSheets = sheets.take(6).toList();
          _isLoadingSheets = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _exerciseSheets = [];
          _isLoadingSheets = false;
        });
      }
    }
  }

  // Gérer le téléchargement hors-ligne d'un module
  Future<void> _downloadForOffline(String module, String level) async {
    setState(() {
      _isDownloading = true;
    });

    try {
      final supabaseService = ref.read(supabaseServiceProvider);
      final localDb = ref.read(appDatabaseProvider);

      // 1. Récupérer les questions en ligne
      final rawQuestions = await supabaseService.fetchQuestions(
        module,
        'TCF_CANADA',
        level,
      );

      if (rawQuestions.isEmpty) {
        // Fallback s'il n'y a pas de questions en base en ligne : on crée une question fictive
        final mockQuestion = Question(
          id: '${module.toLowerCase()}-offline-1',
          module: module,
          testType: 'BOTH',
          level: level,
          questionText: 'Ceci est une question d\'entraînement hors-ligne de test pour le module $module.',
          options: {
            'A': 'Première proposition',
            'B': 'Deuxième proposition',
            'C': 'Troisième proposition',
            'D': 'Quatrième proposition',
          },
          correctAnswer: 'A',
          explanation: 'La réponse A est correcte car le contexte l\'indique.',
          theme: 'Général',
          difficultyScore: 5,
        );

        await localDb.downloadModule(module, 'TCF_CANADA', level, [mockQuestion]);
      } else {
        // Mapper, télécharger les fichiers audio locaux, et insérer en SQLite local
        final List<Question> downloadedQuestions = [];
        for (final qJson in rawQuestions) {
          var q = Question.fromJson(qJson);
          if (q.audioUrl != null && q.audioUrl!.isNotEmpty) {
            final localPath = await FileDownloader.downloadFile(q.audioUrl!);
            if (localPath != null) {
              q = q.copyWith(audioUrl: localPath, isDownloaded: true);
            }
          }
          downloadedQuestions.add(q);
        }
        await localDb.downloadModule(module, 'TCF_CANADA', level, downloadedQuestions);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Module $module ($level) disponible hors-ligne !'),
            backgroundColor: const Color(0xFF1E7145),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Impossible de télécharger le module : $e'),
            backgroundColor: const Color(0xFFC00000),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isDownloading = false;
        });
      }
    }
  }

  // Créer une session dynamique en base et démarrer
  Future<void> _startSession(String sheetId, String module, String theme) async {
    final profile = await ref.read(userProfileProvider.future);
    if (!isPremiumProfile(profile)) {
      if (mounted) showPaywall(context, theme);
      return;
    }

    if (!mounted) return;
    final String mockSessionId = 'sess-${DateTime.now().millisecondsSinceEpoch}';

    // Redirection vers le lecteur de session
    context.push('/session/$mockSessionId', extra: {
      'module': module,
      'testType': 'TCF_CANADA',
      'level': _selectedLevel,
      'isOffline': false,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Catalogue d\'entraînement',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        actions: [
          if (_isDownloading)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFC55A11)),
                ),
              ),
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),
            
            // Épreuve Selector (Chips)
            const Text('Épreuve', style: TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: ['CO', 'CE', 'EE', 'EO'].map((m) {
                final isSelected = _selectedModule == m;
                return ChoiceChip(
                  label: Text(m, style: const TextStyle(fontWeight: FontWeight.bold)),
                  selected: isSelected,
                  selectedColor: const Color(0xFFC55A11),
                  backgroundColor: Colors.white.withOpacity(0.05),
                  labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.white60),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedModule = m);
                      _loadExerciseSheets();
                    }
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Niveau Selector (Chips)
            const Text('Niveau cible', style: TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: ['B1', 'B2', 'C1', 'C2'].map((l) {
                final isSelected = _selectedLevel == l;
                return ChoiceChip(
                  label: Text(l, style: const TextStyle(fontWeight: FontWeight.bold)),
                  selected: isSelected,
                  selectedColor: const Color(0xFF1E3A6B),
                  backgroundColor: Colors.white.withOpacity(0.05),
                  labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.white60),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedLevel = l);
                      _loadExerciseSheets();
                    }
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 30),

            // Download Module Card (Offline mode)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Mode hors-ligne disponible',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Téléchargez tout le contenu $_selectedModule pour vous entraîner sans réseau.',
                          style: const TextStyle(color: Colors.white60, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    onPressed: _isDownloading ? null : () => _downloadForOffline(_selectedModule, _selectedLevel),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E7145), // Premium Green
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.download, size: 16),
                    label: const Text('Télécharger', style: TextStyle(fontSize: 12)),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),

            // Exercise Sheets list
            Expanded(
              child: _isLoadingSheets
                  ? const Center(
                      child: CircularProgressIndicator(color: Color(0xFFC55A11)),
                    )
                  : _exerciseSheets.isEmpty
                      ? Center(
                          child: Text(
                            'Aucun contenu disponible pour $_selectedModule ($_selectedLevel) pour le moment.',
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.white38, fontSize: 13),
                          ),
                        )
                      : ListView.builder(
                itemCount: _exerciseSheets.length,
                itemBuilder: (context, index) {
                  final sheet = _exerciseSheets[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.02),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                sheet['title'],
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Text(
                                    '${sheet['questionsCount']} questions',
                                    style: const TextStyle(color: Colors.white60, fontSize: 12),
                                  ),
                                  const SizedBox(width: 10),
                                  const Text('•', style: TextStyle(color: Colors.white30)),
                                  const SizedBox(width: 10),
                                  Text(
                                    '${sheet['durationMinutes']} min',
                                    style: const TextStyle(color: Colors.white60, fontSize: 12),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Thème: ${sheet['theme']}',
                                style: TextStyle(color: const Color(0xFFC55A11).withOpacity(0.8), fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () => _startSession(sheet['id'], _selectedModule, sheet['theme']),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFC55A11),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Lancer'),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
