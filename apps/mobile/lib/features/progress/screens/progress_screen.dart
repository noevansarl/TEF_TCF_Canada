import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../shared/providers/providers.dart';

class ProgressionScreen extends ConsumerWidget {
  const ProgressionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Votre Progression',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Summary stats
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatCard(
                    title: 'Score Moyen',
                    value: 'NCLC 9',
                    subtitle: 'C1 Actuel',
                    color: const Color(0xFFC55A11),
                  ),
                  _buildStatCard(
                    title: 'Entraînements',
                    value: '18',
                    subtitle: 'Sessions finies',
                    color: const Color(0xFF1E3A6B),
                  ),
                ],
              ),
              const SizedBox(height: 30),

              // Progress Chart (NCLC Level Trend)
              const Text(
                'Évolution du score NCLC',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 16),
              Container(
                height: 220,
                padding: const EdgeInsets.only(right: 16, top: 16, bottom: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.02),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: LineChart(
                  LineChartData(
                    gridData: const FlGridData(show: false),
                    titlesData: FlTitlesData(
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          interval: 1,
                          getTitlesWidget: (value, meta) {
                            switch (value.toInt()) {
                              ..case 5: return const Text('B1', style: TextStyle(color: Colors.white38, fontSize: 10));
                              ..case 7: return const Text('B2', style: TextStyle(color: Colors.white38, fontSize: 10));
                              ..case 9: return const Text('C1', style: TextStyle(color: Colors.white38, fontSize: 10));
                              ..case 11: return const Text('C2', style: TextStyle(color: Colors.white38, fontSize: 10));
                            }
                            return const Text('');
                          },
                        ),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          interval: 1,
                          getTitlesWidget: (value, meta) {
                            switch (value.toInt()) {
                              ..case 1: return const Text('Lun', style: TextStyle(color: Colors.white38, fontSize: 10));
                              ..case 3: return const Text('Mer', style: TextStyle(color: Colors.white38, fontSize: 10));
                              ..case 5: return const Text('Ven', style: TextStyle(color: Colors.white38, fontSize: 10));
                              ..case 7: return const Text('Dim', style: TextStyle(color: Colors.white38, fontSize: 10));
                            }
                            return const Text('');
                          },
                        ),
                      ),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    ),
                    borderData: FlBorderData(show: false),
                    minX: 1,
                    maxX: 7,
                    minY: 4,
                    maxY: 12,
                    lineBarsData: [
                      LineChartBarData(
                        spots: const [
                          FlSpot(1, 5),
                          FlSpot(2, 6),
                          FlSpot(3, 7),
                          FlSpot(4, 7),
                          FlSpot(5, 9),
                          FlSpot(6, 10),
                          FlSpot(7, 11),
                        ],
                        isCurved: true,
                        color: const Color(0xFFC55A11),
                        barWidth: 4,
                        dotData: const FlDotData(show: true),
                        belowBarData: BarAreaData(
                          show: true,
                          color: const Color(0xFFC55A11).withOpacity(0.15),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 30),

              // Skill Profile (Radar-like representation or stats list)
              const Text(
                'Maîtrise par compétences',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 16),

              _buildSkillProgressRow('Compréhension Écrite (CE)', 0.85, const Color(0xFF0284C7)),
              const SizedBox(height: 12),
              _buildSkillProgressRow('Compréhension Orale (CO)', 0.72, const Color(0xFF8B5CF6)),
              const SizedBox(height: 12),
              _buildSkillProgressRow('Expression Écrite (EE)', 0.65, const Color(0xFFF59E0B)),
              const SizedBox(height: 12),
              _buildSkillProgressRow('Expression Orale (EO)', 0.58, const Color(0xFF10B981)),

              const SizedBox(height: 30),

              // Badges earned
              const Text(
                'Badges déverrouillés',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildBadgeWidget(
                    icon: Icons.workspace_premium,
                    title: 'Premier Pas',
                    description: '1er test fini',
                    color: Colors.amber,
                  ),
                  _buildBadgeWidget(
                    icon: Icons.local_fire_department,
                    title: 'Régulier',
                    description: '7 jours d\'affilée',
                    color: const Color(0xFFC55A11),
                  ),
                  _buildBadgeWidget(
                    icon: Icons.mic,
                    title: 'Orateur',
                    description: '1ère expression orale',
                    color: const Color(0xFF10B981),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtitle,
    required Color color,
  }) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white60, fontSize: 12)),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 24),
          ),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildSkillProgressRow(String skill, double progressValue, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.01),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(skill, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
              Text('${(progressValue * 100).toInt()}%', style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progressValue,
              backgroundColor: Colors.white.withOpacity(0.05),
              color: color,
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadgeWidget({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color.withOpacity(0.15),
            border: Border.all(color: color, width: 2),
          ),
          child: Icon(icon, color: color, size: 28),
        ),
        const SizedBox(height: 8),
        Text(
          title,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
        ),
        const SizedBox(height: 2),
        Text(
          description,
          style: const TextStyle(color: Colors.white38, fontSize: 10),
        ),
      ],
    );
  }
}
