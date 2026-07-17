import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NclcRow {
  final int min;
  final int max;
  final String nclc;
  final String clb;
  final String cecrl;

  const NclcRow({
    required this.min,
    required this.max,
    required this.nclc,
    required this.clb,
    required this.cecrl,
  });
}

class NclcCalculatorScreen extends StatefulWidget {
  const NclcCalculatorScreen({super.key});

  @override
  State<NclcCalculatorScreen> createState() => _NclcCalculatorScreenState();
}

class _NclcCalculatorScreenState extends State<NclcCalculatorScreen> {
  String _testType = 'TCF_CANADA';
  final Map<String, TextEditingController> _controllers = {
    'CO': TextEditingController(),
    'CE': TextEditingController(),
    'EE': TextEditingController(),
    'EO': TextEditingController(),
  };

  bool _calculated = false;
  Map<String, NclcRow?> _results = {};
  int? _overallNclc;

  // Tables de conversion officielles IRCC (2026)
  static const Map<String, List<NclcRow>> _tcfTable = {
    'CO': [
      NclcRow(min: 0, max: 180, nclc: 'NCLC 4', clb: 'CLB 4', cecrl: 'B1'),
      NclcRow(min: 181, max: 225, nclc: 'NCLC 5', clb: 'CLB 5', cecrl: 'B1+'),
      NclcRow(min: 226, max: 269, nclc: 'NCLC 6', clb: 'CLB 6', cecrl: 'B2'),
      NclcRow(min: 270, max: 309, nclc: 'NCLC 7', clb: 'CLB 7', cecrl: 'B2+'),
      NclcRow(min: 310, max: 348, nclc: 'NCLC 8', clb: 'CLB 8', cecrl: 'C1'),
      NclcRow(min: 349, max: 382, nclc: 'NCLC 9', clb: 'CLB 9', cecrl: 'C1+'),
      NclcRow(min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+'),
      NclcRow(min: 406, max: 458, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2'),
      NclcRow(min: 459, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2'),
    ],
    'CE': [
      NclcRow(min: 0, max: 180, nclc: 'NCLC 4', clb: 'CLB 4', cecrl: 'B1'),
      NclcRow(min: 181, max: 225, nclc: 'NCLC 5', clb: 'CLB 5', cecrl: 'B1+'),
      NclcRow(min: 226, max: 268, nclc: 'NCLC 6', clb: 'CLB 6', cecrl: 'B2'),
      NclcRow(min: 269, max: 309, nclc: 'NCLC 7', clb: 'CLB 7', cecrl: 'B2+'),
      NclcRow(min: 310, max: 347, nclc: 'NCLC 8', clb: 'CLB 8', cecrl: 'C1'),
      NclcRow(min: 348, max: 382, nclc: 'NCLC 9', clb: 'CLB 9', cecrl: 'C1+'),
      NclcRow(min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+'),
      NclcRow(min: 406, max: 453, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2'),
      NclcRow(min: 454, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2'),
    ],
    'EE': [
      NclcRow(min: 0, max: 180, nclc: 'NCLC 4', clb: 'CLB 4', cecrl: 'B1'),
      NclcRow(min: 181, max: 225, nclc: 'NCLC 5', clb: 'CLB 5', cecrl: 'B1+'),
      NclcRow(min: 226, max: 270, nclc: 'NCLC 6', clb: 'CLB 6', cecrl: 'B2'),
      NclcRow(min: 271, max: 309, nclc: 'NCLC 7', clb: 'CLB 7', cecrl: 'B2+'),
      NclcRow(min: 310, max: 348, nclc: 'NCLC 8', clb: 'CLB 8', cecrl: 'C1'),
      NclcRow(min: 349, max: 382, nclc: 'NCLC 9', clb: 'CLB 9', cecrl: 'C1+'),
      NclcRow(min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+'),
      NclcRow(min: 406, max: 457, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2'),
      NclcRow(min: 458, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2'),
    ],
    'EO': [
      NclcRow(min: 0, max: 180, nclc: 'NCLC 4', clb: 'CLB 4', cecrl: 'B1'),
      NclcRow(min: 181, max: 225, nclc: 'NCLC 5', clb: 'CLB 5', cecrl: 'B1+'),
      NclcRow(min: 226, max: 270, nclc: 'NCLC 6', clb: 'CLB 6', cecrl: 'B2'),
      NclcRow(min: 271, max: 309, nclc: 'NCLC 7', clb: 'CLB 7', cecrl: 'B2+'),
      NclcRow(min: 310, max: 348, nclc: 'NCLC 8', clb: 'CLB 8', cecrl: 'C1'),
      NclcRow(min: 349, max: 382, nclc: 'NCLC 9', clb: 'CLB 9', cecrl: 'C1+'),
      NclcRow(min: 383, max: 405, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+'),
      NclcRow(min: 406, max: 457, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2'),
      NclcRow(min: 458, max: 699, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2'),
    ],
  };

  static const Map<String, List<NclcRow>> _tefTable = {
    'CO': [
      NclcRow(min: 0, max: 144, nclc: 'NCLC 4', clb: 'CLB 4', cecrl: 'B1'),
      NclcRow(min: 145, max: 180, nclc: 'NCLC 5', clb: 'CLB 5', cecrl: 'B1+'),
      NclcRow(min: 181, max: 216, nclc: 'NCLC 6', clb: 'CLB 6', cecrl: 'B2'),
      NclcRow(min: 217, max: 248, nclc: 'NCLC 7', clb: 'CLB 7', cecrl: 'B2+'),
      NclcRow(min: 249, max: 279, nclc: 'NCLC 8', clb: 'CLB 8', cecrl: 'C1'),
      NclcRow(min: 280, max: 297, nclc: 'NCLC 9', clb: 'CLB 9', cecrl: 'C1+'),
      NclcRow(min: 298, max: 315, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+'),
      NclcRow(min: 316, max: 333, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2'),
      NclcRow(min: 334, max: 360, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2'),
    ],
    'CE': [
      NclcRow(min: 0, max: 120, nclc: 'NCLC 4', clb: 'CLB 4', cecrl: 'B1'),
      NclcRow(min: 121, max: 150, nclc: 'NCLC 5', clb: 'CLB 5', cecrl: 'B1+'),
      NclcRow(min: 151, max: 180, nclc: 'NCLC 6', clb: 'CLB 6', cecrl: 'B2'),
      NclcRow(min: 181, max: 207, nclc: 'NCLC 7', clb: 'CLB 7', cecrl: 'B2+'),
      NclcRow(min: 208, max: 232, nclc: 'NCLC 8', clb: 'CLB 8', cecrl: 'C1'),
      NclcRow(min: 233, max: 247, nclc: 'NCLC 9', clb: 'CLB 9', cecrl: 'C1+'),
      NclcRow(min: 248, max: 262, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+'),
      NclcRow(min: 263, max: 277, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2'),
      NclcRow(min: 278, max: 300, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2'),
    ],
    'EE': [
      NclcRow(min: 0, max: 120, nclc: 'NCLC 4', clb: 'CLB 4', cecrl: 'B1'),
      NclcRow(min: 121, max: 150, nclc: 'NCLC 5', clb: 'CLB 5', cecrl: 'B1+'),
      NclcRow(min: 151, max: 180, nclc: 'NCLC 6', clb: 'CLB 6', cecrl: 'B2'),
      NclcRow(min: 181, max: 207, nclc: 'NCLC 7', clb: 'CLB 7', cecrl: 'B2+'),
      NclcRow(min: 208, max: 232, nclc: 'NCLC 8', clb: 'CLB 8', cecrl: 'C1'),
      NclcRow(min: 233, max: 247, nclc: 'NCLC 9', clb: 'CLB 9', cecrl: 'C1+'),
      NclcRow(min: 248, max: 262, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+'),
      NclcRow(min: 263, max: 277, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2'),
      NclcRow(min: 278, max: 300, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2'),
    ],
    'EO': [
      NclcRow(min: 0, max: 120, nclc: 'NCLC 4', clb: 'CLB 4', cecrl: 'B1'),
      NclcRow(min: 121, max: 150, nclc: 'NCLC 5', clb: 'CLB 5', cecrl: 'B1+'),
      NclcRow(min: 151, max: 180, nclc: 'NCLC 6', clb: 'CLB 6', cecrl: 'B2'),
      NclcRow(min: 181, max: 207, nclc: 'NCLC 7', clb: 'CLB 7', cecrl: 'B2+'),
      NclcRow(min: 208, max: 232, nclc: 'NCLC 8', clb: 'CLB 8', cecrl: 'C1'),
      NclcRow(min: 233, max: 247, nclc: 'NCLC 9', clb: 'CLB 9', cecrl: 'C1+'),
      NclcRow(min: 248, max: 262, nclc: 'NCLC 10', clb: 'CLB 10', cecrl: 'C1+'),
      NclcRow(min: 263, max: 277, nclc: 'NCLC 11', clb: 'CLB 11', cecrl: 'C2'),
      NclcRow(min: 278, max: 300, nclc: 'NCLC 12', clb: 'CLB 12', cecrl: 'C2'),
    ],
  };

  static const Map<String, int> _tcfMax = {'CO': 699, 'CE': 699, 'EE': 699, 'EO': 699};
  static const Map<String, int> _tefMax = {'CO': 360, 'CE': 300, 'EE': 300, 'EO': 300};

  static const Map<String, String> _moduleLabels = {
    'CO': 'Compréhension Orale',
    'CE': 'Compréhension Écrite',
    'EE': 'Expression Écrite',
    'EO': 'Expression Orale',
  };

  NclcRow? _getLevel(Map<String, List<NclcRow>> table, String module, int score) {
    final rows = table[module] ?? [];
    for (final row in rows) {
      if (score >= row.min && score <= row.max) {
        return row;
      }
    }
    return null;
  }

  void _calculate() {
    final table = _testType == 'TCF_CANADA' ? _tcfTable : _tefTable;
    final maxScores = _testType == 'TCF_CANADA' ? _tcfMax : _tefMax;

    Map<String, NclcRow?> tempResults = {};
    List<int> nclcValues = [];
    bool allFilled = true;

    for (final mod in _controllers.keys) {
      final text = _controllers[mod]!.text.trim();
      final score = int.tryParse(text);

      if (text.isEmpty || score == null || score < 0 || score > (maxScores[mod] ?? 0)) {
        allFilled = false;
        tempResults[mod] = null;
      } else {
        final level = _getLevel(table, mod, score);
        tempResults[mod] = level;
        if (level != null) {
          final levelNum = int.tryParse(level.nclc.replaceAll('NCLC ', '')) ?? 4;
          nclcValues.add(levelNum);
        }
      }
    }

    setState(() {
      _results = tempResults;
      _overallNclc = (allFilled && nclcValues.isNotEmpty) ? nclcValues.reduce(min) : null;
      _calculated = true;
    });
  }

  Color _getBadgeColor(String cecrl) {
    if (cecrl.startsWith('C')) return const Color(0xFF10B981); // Emerald
    if (cecrl.startsWith('B2')) return const Color(0xFF3B82F6); // Blue
    return const Color(0xFFF59E0B); // Amber
  }

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final maxScores = _testType == 'TCF_CANADA' ? _tcfMax : _tefMax;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Calculateur NCLC / CLB',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Intro
              const Text(
                'Convertissez vos scores TCF ou TEF Canada en niveaux NCLC officiels reconnus par IRCC.',
                style: TextStyle(color: Colors.white70, fontSize: 14, height: 1.4),
              ),
              const SizedBox(height: 20),

              // Selector
              const Text(
                '1. Choisissez votre examen',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildSelectorCard(
                      label: 'TCF Canada',
                      description: 'Score /699',
                      selected: _testType == 'TCF_CANADA',
                      onTap: () {
                        setState(() {
                          _testType = 'TCF_CANADA';
                          _calculated = false;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildSelectorCard(
                      label: 'TEF Canada',
                      description: 'Score variable',
                      selected: _testType == 'TEF_CANADA',
                      onTap: () {
                        setState(() {
                          _testType = 'TEF_CANADA';
                          _calculated = false;
                        });
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 25),

              // Saisie
              const Text(
                '2. Saisissez vos scores',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 12),
              ..._controllers.keys.map((mod) {
                final label = _moduleLabels[mod]!;
                final maxScore = maxScores[mod]!;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14.0),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              label,
                              style: const TextStyle(
                                  color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Maximum: $maxScore',
                              style: const TextStyle(color: Colors.white38, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: _controllers[mod],
                          keyboardType: TextInputType.number,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          decoration: InputDecoration(
                            hintText: '0 - $maxScore',
                            hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
                            fillColor: Colors.white.withOpacity(0.04),
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFC55A11)),
                            ),
                          ),
                          onChanged: (_) {
                            if (_calculated) {
                              setState(() {
                                _calculated = false;
                              });
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 16),

              // Calculate Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _calculate,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC55A11),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'CALCULER LES NIVEAUX NCLC',
                    style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.1),
                  ),
                ),
              ),
              const SizedBox(height: 25),

              // Résultats
              if (_calculated) ...[
                const Text(
                  '3. Résultats détaillés',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 12),
                if (_overallNclc != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B3A6B), Color(0xFF3B82F6)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'NIVEAU GLOBAL ESTIMÉ',
                          style: TextStyle(
                              color: Colors.white70,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                              letterSpacing: 1.2),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'NCLC $_overallNclc',
                          style: const TextStyle(
                              color: Colors.white, fontSize: 40, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          '(Basé sur la règle officielle IRCC du module le plus faible)',
                          style: TextStyle(color: Colors.white60, fontSize: 10, fontStyle: FontStyle.italic),
                        ),
                      ],
                    ),
                  ),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.4,
                  children: _controllers.keys.map((mod) {
                    final label = _moduleLabels[mod]!;
                    final res = _results[mod];
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.03),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            label,
                            style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (res != null) ...[
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      res.nclc,
                                      style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18),
                                    ),
                                    Text(
                                      res.clb,
                                      style: const TextStyle(color: Colors.white38, fontSize: 11),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _getBadgeColor(res.cecrl).withOpacity(0.15),
                                    border: Border.all(color: _getBadgeColor(res.cecrl)),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    res.cecrl,
                                    style: TextStyle(
                                      color: _getBadgeColor(res.cecrl),
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ] else ...[
                            const Text(
                              'Non valide',
                              style: TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSelectorCard({
    required String label,
    required String description,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFC55A11).withOpacity(0.08) : Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? const Color(0xFFC55A11) : Colors.white.withOpacity(0.1),
            width: 1.5,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                color: selected ? const Color(0xFFC55A11) : Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              description,
              style: TextStyle(
                color: selected ? const Color(0xFFC55A11).withOpacity(0.7) : Colors.white38,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
