import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

// Un utilisateur est considéré premium s'il a un abonnement payant actif
// ou un pack actif non expiré (même logique que la RLS sur "questions").
bool isPremiumProfile(Map<String, dynamic>? profile) {
  if (profile == null) return false;
  const paidTiers = ['avance', 'premium', 'institutionnel', 'essentiel', 'bronze', 'silver', 'gold', 'platinum'];
  final tier = profile['subscription_tier'] as String?;
  final activePackId = profile['active_pack_id'] as String?;
  final hasEntitlement = (tier != null && paidTiers.contains(tier)) ||
      (activePackId != null && paidTiers.contains(activePackId));
  if (!hasEntitlement) return false;

  DateTime? parseDate(dynamic v) => v is String ? DateTime.tryParse(v) : null;
  final subExpires = parseDate(profile['subscription_expires_at']);
  final packExpires = parseDate(profile['pack_expires_at']);
  final now = DateTime.now();
  final subValid = subExpires == null || subExpires.isAfter(now);
  final packValid = packExpires == null || packExpires.isAfter(now);
  return subValid || packValid;
}

// Affiche le mur d'abonnement (Mobile Money Afrique ou carte bancaire via le site web).
void showPaywall(BuildContext context, String itemLabel) {
  showModalBottomSheet(
    context: context,
    backgroundColor: const Color(0xFF1E293B),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (ctx) => Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('🔒', style: TextStyle(fontSize: 40)),
          const SizedBox(height: 16),
          const Text(
            'Contenu réservé aux abonnés',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 8),
          Text(
            '"$itemLabel" fait partie de notre bibliothèque premium. Abonnez-vous pour débloquer toutes les simulations et corrections IA.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white60, fontSize: 13, height: 1.4),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                ctx.push('/pay-fedapay');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC55A11),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('📱 Payer par Mobile Money (Afrique)'),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () async {
                Navigator.of(ctx).pop();
                final uri = Uri.parse('https://ayeprep.com/packs');
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Colors.white24),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('💳 Payer par carte bancaire (autres pays)'),
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Plus tard', style: TextStyle(color: Colors.white38)),
          ),
        ],
      ),
    ),
  );
}
