import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ResultsScreen extends StatefulWidget {
  final String sessionId;
  final double? score;
  final String? nclc;

  const ResultsScreen({
    super.key,
    required this.sessionId,
    this.score,
    this.nclc,
  });

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _scaleAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double finalScore = widget.score ?? 75.0;
    final String finalNclc = widget.nclc ?? 'B2';
    
    Color nclcColor;
    String description;

    if (finalNclc == 'C2' || finalNclc == 'C1') {
      nclcColor = const Color(0xFF1E7145); // Green
      description = 'Excellent travail ! Vous avez le niveau idéal pour obtenir le maximum de points à l\'immigration Express Entry.';
    } else if (finalNclc == 'B2') {
      nclcColor = const Color(0xFFC55A11); // Orange
      description = 'Bon résultat ! Vous êtes tout près d\'atteindre les niveaux C1 et C2. Continuez l\'entraînement quotidien.';
    } else {
      nclcColor = const Color(0xFFC00000); // Red
      description = 'Votre parcours ne fait que commencer. Révisez les corrections détaillées et entraînez-vous sur les points faibles.';
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),
              
              // Congratulatory Header
              Column(
                children: [
                  const Text(
                    'Épreuve Terminée !',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Vos réponses ont été enregistrées avec succès.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Colors.white60),
                  ),
                ],
              ),

              // Animated Score Circle
              ScaleTransition(
                scale: _scaleAnimation,
                child: Center(
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.02),
                      border: Border.all(color: nclcColor.withOpacity(0.3), width: 4),
                      boxShadow: [
                        BoxShadow(
                          color: nclcColor.withOpacity(0.1),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '${finalScore.toInt()}%',
                          style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: nclcColor),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Niveau $finalNclc',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'estimé',
                          style: TextStyle(fontSize: 12, color: Colors.white38),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Description and Tips
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.02),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  children: [
                    Text(
                      description,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.5),
                    ),
                    const SizedBox(height: 12),
                    const Divider(color: Colors.white10),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.info_outline, color: Color(0xFFC55A11), size: 16),
                        const SizedBox(width: 8),
                        Text(
                          'Identifiant Session: ${widget.sessionId.substring(0, 8)}...',
                          style: const TextStyle(color: Colors.white38, fontSize: 12),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Action buttons
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ElevatedButton(
                    onPressed: () => context.go('/dashboard'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFC55A11),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text(
                      'Retour au Tableau de Bord',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
