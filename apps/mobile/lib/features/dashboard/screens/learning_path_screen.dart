import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/providers.dart';

class DayTask {
  final int day;
  final String module;
  final String label;
  final int durationMin;
  bool done;

  DayTask({
    required this.day,
    required this.module,
    required this.label,
    required this.durationMin,
    this.done = false,
  });

  factory DayTask.fromMap(Map<String, dynamic> map) {
    return DayTask(
      day: map['day'] as int,
      module: map['module'] as String,
      label: map['label'] as String,
      durationMin: map['duration_min'] as int,
      done: map['done'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'day': day,
      'module': module,
      'label': label,
      'duration_min': durationMin,
      'done': done,
    };
  }
}

class LearningPlan {
  final String id;
  final String? examDate;
  final String targetLevel;
  final String currentLevel;
  final int planDurationDays;
  final List<DayTask> dailyPlan;
  int completedDays;
  final bool isActive;

  LearningPlan({
    required this.id,
    this.examDate,
    required this.targetLevel,
    required this.currentLevel,
    required this.planDurationDays,
    required this.dailyPlan,
    required this.completedDays,
    this.isActive = true,
  });

  factory LearningPlan.fromMap(Map<String, dynamic> map) {
    var rawPlan = map['daily_plan'];
    List<dynamic> planList = [];
    if (rawPlan is String) {
      planList = jsonDecode(rawPlan) as List<dynamic>;
    } else if (rawPlan is List) {
      planList = rawPlan;
    }
    
    return LearningPlan(
      id: map['id'].toString(),
      examDate: map['exam_date'] as String?,
      targetLevel: map['target_level'] as String? ?? 'C1',
      currentLevel: map['current_level'] as String? ?? 'B2',
      planDurationDays: map['plan_duration_days'] as int? ?? 30,
      dailyPlan: planList.map((x) => DayTask.fromMap(Map<String, dynamic>.from(x))).toList(),
      completedDays: map['completed_days'] as int? ?? 0,
      isActive: map['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toMap(String userId) {
    return {
      'user_id': userId,
      'exam_date': examDate,
      'target_level': targetLevel,
      'current_level': currentLevel,
      'plan_duration_days': planDurationDays,
      'daily_plan': dailyPlan.map((x) => x.toMap()).toList(),
      'completed_days': completedDays,
      'is_active': isActive,
    };
  }
}

// Mock initial state in-memory for local dev if no Supabase connection
LearningPlan? _mockPlanInMemory;

class LearningPathScreen extends ConsumerStatefulWidget {
  const LearningPathScreen({super.key});

  @override
  ConsumerState<LearningPathScreen> createState() => _LearningPathScreenState();
}

class _LearningPathScreenState extends ConsumerState<LearningPathScreen> {
  bool _loading = true;
  LearningPlan? _plan;
  bool _creating = false;
  String _view = 'semaine'; // 'semaine' ou 'mois'

  // Form states
  DateTime? _selectedDate;
  String _targetLevel = 'C1';
  int _planDurationDays = 30;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => _fetchPlan());
  }

  Future<void> _fetchPlan() async {
    setState(() => _loading = true);
    final authUser = ref.read(authStateProvider).value;
    final supabaseService = ref.read(supabaseServiceProvider);

    if (supabaseService.useMock || authUser == null) {
      setState(() {
        _plan = _mockPlanInMemory;
        _loading = false;
      });
      return;
    }

    try {
      final response = await supabaseService.client
          .from('learning_plans')
          .select()
          .eq('user_id', authUser.id)
          .eq('is_active', true)
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();

      if (response != null) {
        setState(() {
          _plan = LearningPlan.fromMap(response);
        });
      } else {
        setState(() {
          _plan = null;
        });
      }
    } catch (e) {
      debugPrint('Error fetching plan: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _createPlan() async {
    setState(() => _creating = true);
    final authUser = ref.read(authStateProvider).value;
    final supabaseService = ref.read(supabaseServiceProvider);
    final userId = authUser?.id ?? 'mock-user-id';

    final List<String> modules = ['CO', 'CE', 'EE', 'EO', 'REPOS', 'CO', 'SIMULATION'];
    final Map<String, int> durations = {
      'CO': 30, 'CE': 30, 'EE': 60, 'EO': 20, 'REPOS': 15, 'SIMULATION': 142
    };
    final Map<String, List<String>> labels = {
      'CO': ['CO — Dialogue au bureau', 'CO — Annonce radio', 'CO — Entretien professionnel', 'CO — Émission culturelle', 'CO — Débat contradictoire'],
      'CE': ['CE — Article immigration', 'CE — Texte scientifique', 'CE — Rapport annuel', "CE — Article d'opinion", 'CE — Texte littéraire'],
      'EE': ['EE — Texte argumentatif', 'EE — Lettre formelle', 'EE — Synthèse de documents', 'EE — Compte rendu', 'EE — Essai comparatif'],
      'EO': ['EO — Plaidoyer monologue', 'EO — Interaction formelle', 'EO — Monologue de 3 min', 'EO — Questions-réponses', 'EO — Présentation'],
      'REPOS': ['Révision + repos', 'Auto-évaluation', 'Révision semaine', 'Repos complet'],
      'SIMULATION': ['Simulation CO+CE', 'Simulation complète TCF Canada', 'Mini-simulation EE+EO', 'Simulation TEF Canada'],
    };

    final dailyPlan = List<DayTask>.generate(_planDurationDays, (i) {
      final mod = modules[i % modules.length];
      final labelList = labels[mod]!;
      return DayTask(
        day: i + 1,
        module: mod,
        label: labelList[(i ~/ modules.length) % labelList.length],
        durationMin: durations[mod]!,
        done: false,
      );
    });

    final examDateStr = _selectedDate != null
        ? "${_selectedDate!.year.toString().padLeft(4, '0')}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}"
        : null;

    final newPlan = LearningPlan(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      examDate: examDateStr,
      targetLevel: _targetLevel,
      currentLevel: 'B2',
      planDurationDays: _planDurationDays,
      dailyPlan: dailyPlan,
      completedDays: 0,
    );

    if (supabaseService.useMock || authUser == null) {
      _mockPlanInMemory = newPlan;
      setState(() {
        _plan = newPlan;
        _creating = false;
      });
      return;
    }

    try {
      final response = await supabaseService.client
          .from('learning_plans')
          .insert(newPlan.toMap(userId))
          .select()
          .single();

      setState(() {
        _plan = LearningPlan.fromMap(response);
      });
    } catch (e) {
      debugPrint('Error inserting plan: $e');
      _mockPlanInMemory = newPlan;
      setState(() {
        _plan = newPlan;
      });
    } finally {
      setState(() => _creating = false);
    }
  }

  Future<void> _toggleDay(int dayNum) async {
    if (_plan == null) return;

    final updated = _plan!.dailyPlan.map((d) {
      if (d.day == dayNum) {
        d.done = !d.done;
      }
      return d;
    }).toList();

    final completed = updated.where((d) => d.done).length;

    setState(() {
      _plan!.completedDays = completed;
    });

    final authUser = ref.read(authStateProvider).value;
    final supabaseService = ref.read(supabaseServiceProvider);

    if (supabaseService.useMock || authUser == null || _plan!.id.startsWith('17')) {
      return;
    }

    try {
      await supabaseService.client
          .from('learning_plans')
          .update({
            'daily_plan': updated.map((x) => x.toMap()).toList(),
            'completed_days': completed,
          })
          .eq('id', _plan!.id);
    } catch (e) {
      debugPrint('Error updating day status: $e');
    }
  }

  int _daysUntil(String dateStr) {
    try {
      final target = DateTime.parse(dateStr);
      final today = DateTime.now();
      final difference = target.difference(today).inDays;
      return max(0, difference);
    } catch (_) {
      return 0;
    }
  }

  Color _getModuleColor(String module) {
    switch (module) {
      case 'CO': return const Color(0xFF3B82F6);
      case 'CE': return const Color(0xFF8B5CF6);
      case 'EE': return const Color(0xFFF59E0B);
      case 'EO': return const Color(0xFF10B981);
      case 'SIMULATION': return const Color(0xFFEF4444);
      default: return const Color(0xFF6B7280);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(child: CircularProgressIndicator(color: Color(0xFFC55A11))),
      );
    }

    if (_plan == null) {
      return _buildCreationForm();
    }

    return _buildPlanDashboard();
  }

  Widget _buildCreationForm() {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Parcours de Révision', style: TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Center(
                child: Text(
                  '🗺️',
                  style: TextStyle(fontSize: 50),
                ),
              ),
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  'Mon parcours d\'apprentissage',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              const SizedBox(height: 6),
              const Center(
                child: Text(
                  'Générez votre plan d\'étude sur mesure selon votre niveau cible.',
                  style: TextStyle(color: Colors.white54, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 30),

              // Date Selector
              const Text(
                'Date de l\'examen (optionnelle)',
                style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now().add(const Duration(days: 30)),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) {
                    setState(() => _selectedDate = picked);
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _selectedDate == null
                            ? 'Choisir une date'
                            : '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}',
                        style: TextStyle(
                          color: _selectedDate == null ? Colors.white30 : Colors.white,
                          fontSize: 14,
                        ),
                      ),
                      const Icon(Icons.calendar_today, color: Colors.white60, size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Level Selector
              const Text(
                'Niveau NCLC cible',
                style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.04),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _targetLevel,
                    dropdownColor: const Color(0xFF1E293B),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    items: const [
                      DropdownMenuItem(value: 'B2', child: Text('B2 — NCLC 6-7')),
                      DropdownMenuItem(value: 'C1', child: Text('C1 — NCLC 8-9 (Recommandé)')),
                      DropdownMenuItem(value: 'C2', child: Text('C2 — NCLC 10-12')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _targetLevel = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Duration Selector
              const Text(
                'Durée du parcours',
                style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                children: [30, 60, 90].map((d) {
                  final isSel = _planDurationDays == d;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                      child: ElevatedButton(
                        onPressed: () => setState(() => _planDurationDays = d),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isSel ? const Color(0xFFC55A11) : Colors.white.withOpacity(0.04),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(color: isSel ? const Color(0xFFC55A11) : Colors.white.withOpacity(0.08)),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: Text('$d jours', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 35),

              // Submit
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _creating ? null : _createPlan,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC55A11),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    _creating ? 'GÉNÉRATION DU PARCOURS...' : '🚀 GÉNÉRER MON PARCOURS',
                    style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.1),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlanDashboard() {
    final progress = ((_plan!.completedDays / _plan!.planDurationDays) * 100).round();
    final todayTask = _plan!.dailyPlan.firstWhere((d) => !d.done,
        orElse: () => DayTask(day: -1, module: 'FIN', label: 'Bravo ! Tout est fini', durationMin: 0));

    final weekDays = _plan!.dailyPlan.where((d) {
      if (_view == 'semaine') {
        final currentDay = _plan!.completedDays + 1;
        return d.day >= max(1, currentDay - 2) && d.day <= min(_plan!.planDurationDays, currentDay + 4);
      }
      return true; // Mois complet
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Mon Parcours de Révision', style: TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.go('/dashboard'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70),
            onPressed: () {
              setState(() {
                _mockPlanInMemory = null;
                _plan = null;
              });
            },
            tooltip: 'Réinitialiser le plan',
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.03),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Plan d\'étude - ${_plan!.planDurationDays} jours',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Cible : ${_plan!.targetLevel} • Actuel : ${_plan!.currentLevel}',
                              style: const TextStyle(color: Colors.white54, fontSize: 12),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '$progress%',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Color(0xFFC55A11)),
                            ),
                            Text(
                              '${_plan!.completedDays}/${_plan!.planDurationDays} jours',
                              style: const TextStyle(color: Colors.white38, fontSize: 11),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: progress / 100.0,
                        backgroundColor: Colors.white.withOpacity(0.05),
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFC55A11)),
                        minHeight: 8,
                      ),
                    ),
                    if (_plan!.examDate != null) ...[
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.timer_outlined, color: Colors.amber, size: 14),
                          const SizedBox(width: 6),
                          Text(
                            'Examen dans ${_daysUntil(_plan!.examDate!)} jours (${_plan!.examDate})',
                            style: const TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Active/Today Task
              if (todayTask.day != -1) ...[
                const Text(
                  '🎯 Étape du jour',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [const Color(0xFF1E3A8A), const Color(0xFF1E3A8A).withOpacity(0.7)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Jour ${todayTask.day} — ${todayTask.label}',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${todayTask.durationMin} minutes • ${todayTask.module}',
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          if (todayTask.module != 'REPOS')
                            ElevatedButton(
                              onPressed: () => context.go('/catalogue'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: const Color(0xFF1E3A8A),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('COMMENCER', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          const SizedBox(width: 10),
                          OutlinedButton(
                            onPressed: () => _toggleDay(todayTask.day),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Colors.white30),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('MARQUER FAIT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 25),
              ],

              // Task List View Selector
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Détail du planning',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                  ),
                  Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.04),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        _buildViewTab(label: '7 jours', value: 'semaine'),
                        _buildViewTab(label: 'Tout voir', value: 'mois'),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Checklist List
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: weekDays.length,
                itemBuilder: (ctx, idx) {
                  final task = weekDays[idx];
                  final color = _getModuleColor(task.module);
                  return GestureDetector(
                    onTap: () => _toggleDay(task.day),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      margin: const EdgeInsets.only(bottom: 10),
                      decoration: BoxDecoration(
                        color: task.done ? Colors.white.withOpacity(0.01) : Colors.white.withOpacity(0.03),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: task.done ? Colors.white.withOpacity(0.03) : Colors.white.withOpacity(0.08),
                        ),
                      ),
                      child: Row(
                        children: [
                          // Custom Checkbox
                          Container(
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(
                              color: task.done ? const Color(0xFF10B981) : Colors.transparent,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: task.done ? const Color(0xFF10B981) : Colors.white30,
                                width: 2,
                              ),
                            ),
                            child: task.done
                                ? const Icon(Icons.check, color: Colors.white, size: 12)
                                : null,
                          ),
                          const SizedBox(width: 12),
                          // Day indicator
                          Text(
                            'J${task.day}',
                            style: TextStyle(
                              color: task.done ? Colors.white30 : Colors.white38,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(width: 10),
                          // Module Badge
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              task.module,
                              style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 10),
                          // Label text
                          Expanded(
                            child: Text(
                              task.label,
                              style: TextStyle(
                                color: task.done ? Colors.white30 : Colors.white,
                                fontSize: 13,
                                decoration: task.done ? TextDecoration.lineThrough : null,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Duration
                          if (task.durationMin > 0)
                            Text(
                              '${task.durationMin}m',
                              style: const TextStyle(color: Colors.white24, fontSize: 11),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildViewTab({required String label, required String value}) {
    final isSel = _view == value;
    return GestureDetector(
      onTap: () => setState(() => _view = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSel ? const Color(0xFFC55A11) : Colors.transparent,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSel ? Colors.white : Colors.white60,
            fontWeight: FontWeight.bold,
            fontSize: 11,
          ),
        ),
      ),
    );
  }
}
