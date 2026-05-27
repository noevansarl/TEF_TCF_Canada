import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/providers.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Premium Slate background
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header (Profile Summary)
                profileAsync.when(
                  data: (profile) {
                    final String name = profile?['full_name'] ?? 'Étudiant';
                    final int xp = profile?['xp_points'] ?? 0;
                    final int streak = profile?['streak_days'] ?? 0;
                    final String tier = profile?['subscription_tier'] ?? 'gratuit';

                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Bonjour, $name 👋',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFC55A11).withOpacity(0.2),
                                border: Border.all(color: const Color(0xFFC55A11)),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                tier.toUpperCase(),
                                style: const TextStyle(
                                  color: Color(0xFFC55A11),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        // Gamification Stats (Streak & XP)
                        Row(
                          children: [
                            _buildStatChip(
                              icon: Icons.local_fire_department,
                              color: const Color(0xFFC55A11),
                              value: '$streak j',
                            ),
                            const SizedBox(width: 8),
                            _buildStatChip(
                              icon: Icons.star_rounded,
                              color: Colors.amber,
                              value: '$xp XP',
                            ),
                          ],
                        ),
                      ],
                    );
                  },
                  loading: () => const Center(
                    child: CircularProgressIndicator(color: Color(0xFFC55A11)),
                  ),
                  error: (err, stack) => const Text(
                    'Bonjour, Candidat 👋',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
                
                const SizedBox(height: 30),
                
                // Welcome card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1E3A8A), Color(0xFF1D4ED8)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF1E3A8A).withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Votre score C2 commence aujourd\'hui',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Entraînez-vous chaque jour pour perfectionner vos compétences linguistiques canadiennes.',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white80,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => context.go('/catalogue'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF1E3A8A),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text('Commencer à s\'entraîner'),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 30),

                // Épreuves Modules Grid
                const Text(
                  'Entraînements par épreuve',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.2,
                  children: [
                    _buildModuleCard(
                      context: context,
                      title: 'Compréhension Écrite',
                      subtitle: 'CE',
                      icon: Icons.chrome_reader_mode_outlined,
                      color: const Color(0xFF0284C7),
                      module: 'CE',
                    ),
                    _buildModuleCard(
                      context: context,
                      title: 'Compréhension Orale',
                      subtitle: 'CO',
                      icon: Icons.headset_outlined,
                      color: const Color(0xFF8B5CF6),
                      module: 'CO',
                    ),
                    _buildModuleCard(
                      context: context,
                      title: 'Expression Écrite',
                      subtitle: 'EE',
                      icon: Icons.edit_note_outlined,
                      color: const Color(0xFFF59E0B),
                      module: 'EE',
                    ),
                    _buildModuleCard(
                      context: context,
                      title: 'Expression Orale',
                      subtitle: 'EO',
                      icon: Icons.mic_none_outlined,
                      color: const Color(0xFF10B981),
                      module: 'EO',
                    ),
                  ],
                ),

                const SizedBox(height: 30),
                
                // Simulation Mock Exam Card
                const Text(
                  'Simulations officielles',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                
                _buildSimulationCard(
                  context: context,
                  title: 'Simulation TCF Canada',
                  duration: '2h 45m',
                  questions: '80 questions',
                  testType: 'TCF_CANADA',
                ),
                const SizedBox(height: 12),
                _buildSimulationCard(
                  context: context,
                  title: 'Simulation TEF Canada',
                  duration: '2h 55m',
                  questions: '90 questions',
                  testType: 'TEF_CANADA',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatChip({required IconData icon, required Color color, required String value}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModuleCard({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String module,
  }) {
    return InkWell(
      onTap: () {
        // Rediriger vers le catalogue avec l'épreuve pré-sélectionnée
        context.go('/catalogue');
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  subtitle,
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildSimulationCard({
    required BuildContext context,
    required String title,
    required String duration,
    required String questions,
    required String testType,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFC55A11).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.timer_outlined, color: Color(0xFFC55A11)),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$duration • $questions',
                    style: const TextStyle(
                      color: Colors.white60,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
          IconButton(
            onPressed: () {
              // Créer une simulation en base et lancer
              final String mockSessionId = 'sim-${DateTime.now().millisecondsSinceEpoch}';
              context.push('/session/$mockSessionId', extra: {
                'module': 'FULL_TCF',
                'testType': testType,
                'level': 'MIXED',
                'isOffline': false,
              });
            },
            icon: const Icon(Icons.arrow_forward_ios, color: Colors.white38, size: 18),
          ),
        ],
      ),
    );
  }
}
