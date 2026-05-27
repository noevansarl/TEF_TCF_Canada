import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _handleSignOut(BuildContext context, WidgetRef ref) async {
    try {
      final supabaseService = ref.read(supabaseServiceProvider);
      await supabaseService.signOut();
      if (context.mounted) {
        context.go('/');
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur de déconnexion : $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Mon Profil',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: profileAsync.when(
        data: (profile) {
          final String name = profile?['full_name'] ?? 'Étudiant';
          final String email = profile?['email'] ?? '';
          final String tier = profile?['subscription_tier'] ?? 'gratuit';
          final String country = profile?['country'] ?? 'Canada';

          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 10),
                  
                  // Avatar Section
                  Center(
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: const Color(0xFF1E3A6B),
                          child: Text(
                            name.substring(0, 1).toUpperCase(),
                            style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Color(0xFFC55A11),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.edit, size: 16, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // User Details
                  Text(
                    name,
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    email,
                    style: const TextStyle(color: Colors.white60, fontSize: 14),
                  ),
                  const SizedBox(height: 30),

                  // Info Tiles
                  _buildProfileTile(
                    icon: Icons.flag_outlined,
                    title: 'Pays de destination',
                    value: country,
                  ),
                  const SizedBox(height: 12),
                  
                  _buildProfileTile(
                    icon: Icons.card_membership,
                    title: 'Formule d\'abonnement',
                    value: tier.toUpperCase(),
                    trailing: TextButton(
                      onPressed: () {
                        // Ouvrir page de souscription RevenueCat (mocké)
                        ScaffoldMessenger.of(ref.context).showSnackBar(
                          const SnackBar(
                            content: Text('Module de paiement RevenueCat activé.'),
                            backgroundColor: Color(0xFFC55A11),
                          ),
                        );
                      },
                      child: const Text('Modifier', style: TextStyle(color: Color(0xFFC55A11), fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  
                  _buildProfileTile(
                    icon: Icons.notifications_none,
                    title: 'Notifications quotidiennes',
                    value: 'Activé (9:00)',
                  ),
                  const SizedBox(height: 30),

                  // Actions
                  ElevatedButton.icon(
                    onPressed: () => _handleSignOut(context, ref),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF991B1B).withOpacity(0.2),
                      foregroundColor: const Color(0xFFEF4444),
                      side: const BorderSide(color: Color(0xFFEF4444)),
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: const Icon(Icons.logout_rounded),
                    label: const Text('Se déconnecter', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 12),

                  TextButton(
                    onPressed: () {
                      // RGPD - Supprimer compte
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          backgroundColor: const Color(0xFF1E293B),
                          title: const Text('Supprimer mon compte ?', style: TextStyle(color: Colors.white)),
                          content: const Text(
                            'Cette action est définitive. Toutes vos sessions seront anonymisées conformément à notre politique RGPD.',
                            style: TextStyle(color: Colors.white70),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx),
                              child: const Text('Annuler', style: TextStyle(color: Colors.white60)),
                            ),
                            TextButton(
                              onPressed: () {
                                // Appel suppression logic
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Demande de suppression prise en compte.')),
                                );
                              },
                              child: const Text('Supprimer', style: TextStyle(color: Color(0xFFEF4444))),
                            ),
                          ],
                        ),
                      );
                    },
                    child: const Text(
                      'Supprimer définitivement mon compte (RGPD)',
                      style: TextStyle(color: Colors.white38, fontSize: 12),
                    ),
                  ),
                ],
              ),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFC55A11))),
          error: (err, stack) => Center(
            child: Text('Erreur lors du chargement du profil: $err', style: const TextStyle(color: Colors.white70)),
          ),
        ),
    );
  }

  Widget _buildProfileTile({
    required IconData icon,
    required String title,
    required String value,
    Widget? trailing,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFFC55A11), size: 22),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white60, fontSize: 11)),
                  const SizedBox(height: 4),
                  Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
          if (trailing != null) trailing,
        ],
      ),
    );
  }
}
