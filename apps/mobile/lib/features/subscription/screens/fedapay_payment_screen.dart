import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/providers.dart';

// Configuration des opérateurs et pays supportés par FedaPay
final Map<String, Map<String, dynamic>> countryConfig = {
  'BJ': {
    'name': 'Bénin',
    'flag': '🇧🇯',
    'prefix': '229',
    'operators': [
      {'label': 'MTN Mobile Money', 'value': 'mtn_open'},
      {'label': 'Moov Money', 'value': 'moov_money'},
    ]
  },
  'TG': {
    'name': 'Togo',
    'flag': '🇹🇬',
    'prefix': '228',
    'operators': [
      {'label': 'Moov Money (TMoney)', 'value': 'moov_money'},
    ]
  },
  'SN': {
    'name': 'Sénégal',
    'flag': '🇸🇳',
    'prefix': '221',
    'operators': [
      {'label': 'Orange Money', 'value': 'orange_money_sn'},
      {'label': 'Wave', 'value': 'wave_money'},
    ]
  },
  'CI': {
    'name': 'Côte d\'Ivoire',
    'flag': '🇨🇮',
    'prefix': '225',
    'operators': [
      {'label': 'Orange Money', 'value': 'orange_money_ci'},
      {'label': 'MTN Mobile Money', 'value': 'mtn_open'},
      {'label': 'Moov Money', 'value': 'moov_money'},
      {'label': 'Wave', 'value': 'wave_money'},
    ]
  },
  'CM': {
    'name': 'Cameroun',
    'flag': '🇨🇲',
    'prefix': '237',
    'operators': [
      {'label': 'MTN Mobile Money', 'value': 'mtn_open'},
    ]
  },
  'ML': {
    'name': 'Mali',
    'flag': '🇲🇱',
    'prefix': '223',
    'operators': [
      {'label': 'Orange Money', 'value': 'orange_money_ml'},
    ]
  }
};

class FedaPayPaymentScreen extends ConsumerStatefulWidget {
  const FedaPayPaymentScreen({super.key});

  @override
  ConsumerState<FedaPayPaymentScreen> createState() => _FedaPayPaymentScreenState();
}

class _FedaPayPaymentScreenState extends ConsumerState<FedaPayPaymentScreen> {
  // Liste des packs conformes au serveur et au web
  final List<Map<String, dynamic>> _packs = [
    {
      'id': 'bronze',
      'name': '🥉 Pack Découverte',
      'price': 9800,
      'duration': '5 jours',
      'desc': 'Idéal pour tester la correction IA',
      'features': ['40 tests CO & CE', '1 simulation officielle', '3 corrections IA EE/EO'],
      'color': Colors.brown.shade400,
    },
    {
      'id': 'silver',
      'name': '🥈 Pack Préparation',
      'price': 19600,
      'duration': '30 jours',
      'desc': 'Le choix classique pour s\'entraîner',
      'features': ['120 tests CO & CE', '5 simulations officielles', '8 corrections IA EE/EO', 'Accès mobile hors-ligne'],
      'color': Colors.blueGrey.shade300,
    },
    {
      'id': 'gold',
      'name': '🥇 Pack Intensif',
      'price': 32700,
      'duration': '60 jours',
      'desc': 'Maximisez vos chances de NCLC 9+',
      'features': ['300 tests CO & CE', '12 simulations officielles', '15 corrections IA EE/EO', 'Accès mobile hors-ligne'],
      'color': const Color(0xFFC55A11),
    },
  ];

  String _selectedPackId = 'silver';
  String _selectedCountryCode = 'BJ';
  String _selectedOperatorValue = 'mtn_open';
  
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  
  bool _isLoading = false;
  String? _errorMessage;
  
  // Polling variables
  Timer? _pollingTimer;
  String _paymentStep = 'form'; // form, waiting, success, error

  @override
  void initState() {
    super.initState();
    // Valeurs initiales basées sur le profil
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profile = ref.read(userProfileProvider).value;
      if (profile != null) {
        setState(() {
          _nameController.text = profile['full_name'] ?? '';
          final userCountry = profile['country']?.toString().toUpperCase() ?? 'BJ';
          if (countryConfig.containsKey(userCountry)) {
            _selectedCountryCode = userCountry;
            _selectedOperatorValue = countryConfig[userCountry]!['operators'][0]['value'];
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _phoneController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _onCountryChanged(String? code) {
    if (code == null) return;
    setState(() {
      _selectedCountryCode = code;
      _selectedOperatorValue = countryConfig[code]!['operators'][0]['value'];
    });
  }

  Future<void> _initiatePayment() async {
    final String phone = _phoneController.text.trim().replaceAll(' ', '');
    final String name = _nameController.text.trim();

    if (phone.isEmpty || phone.length < 7) {
      setState(() => _errorMessage = 'Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    if (name.isEmpty) {
      setState(() => _errorMessage = 'Veuillez renseigner votre nom complet.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final String prefix = countryConfig[_selectedCountryCode]!['prefix'];
    final String fullPhone = '+$prefix$phone';

    final supabaseService = ref.read(supabaseServiceProvider);
    
    if (supabaseService.useMock) {
      // Simulation mode mock
      await Future.delayed(const Duration(seconds: 2));
      setState(() {
        _isLoading = false;
        _paymentStep = 'waiting';
      });
      return;
    }

    // Appel réel Supabase Edge Function
    try {
      final response = await supabaseService.client.functions.invoke(
        'fedapay-payment',
        body: {
          'pack_id': _selectedPackId,
          'method': _selectedOperatorValue,
          'phone_number': fullPhone,
          'phone_country': _selectedCountryCode,
          'customer_name': name,
          'customer_email': supabaseService.currentUser?.email ?? 'client@ayeprep.com',
        },
      );

      final data = response.data;
      if (response.status != 200 || data == null || data['success'] != true) {
        setState(() {
          _errorMessage = data?['error'] ?? 'Impossible d\'initier la transaction.';
          _isLoading = false;
        });
        return;
      }

      setState(() {
        _isLoading = false;
        _paymentStep = 'waiting';
      });

      _startPolling(data['transaction_id'].toString());
    } catch (e) {
      setState(() {
        _errorMessage = 'Erreur lors de l\'appel API de paiement : $e';
        _isLoading = false;
      });
    }
  }

  void _startPolling(String txId) {
    int attempts = 0;
    const int maxAttempts = 20; // 60 secondes max

    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      attempts++;
      if (attempts > maxAttempts) {
        timer.cancel();
        setState(() {
          _errorMessage = 'Le délai de validation a expiré. Veuillez vérifier votre solde Mobile Money.';
          _paymentStep = 'error';
        });
        return;
      }

      try {
        final supabaseService = ref.read(supabaseServiceProvider);
        final res = await supabaseService.client
            .from('payment_attempts')
            .select('status')
            .eq('fedapay_transaction_id', txId)
            .maybeSingle();

        if (res != null) {
          final status = res['status']?.toString();
          if (status == 'completed') {
            timer.cancel();
            // Mettre à jour l'UI globale
            ref.invalidate(userProfileProvider);
            setState(() {
              _paymentStep = 'success';
            });
          } else if (status == 'declined' || status == 'canceled') {
            timer.cancel();
            setState(() {
              _errorMessage = status == 'declined'
                  ? 'La transaction a été rejetée par l\'opérateur.'
                  : 'La transaction a été annulée.';
              _paymentStep = 'error';
            });
          }
        }
      } catch (e) {
        debugPrint('Polling error: $e');
      }
    });
  }

  void _simulateMockApproval() {
    setState(() {
      _isLoading = true;
    });

    Future.delayed(const Duration(seconds: 2), () {
      // Activer le plan mocké en mémoire
      ref.read(mockSubscriptionTierProvider.notifier).state = _selectedPackId;
      ref.invalidate(userProfileProvider);
      setState(() {
        _isLoading = false;
        _paymentStep = 'success';
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_paymentStep == 'waiting') {
      return _buildWaitingView();
    }
    if (_paymentStep == 'success') {
      return _buildSuccessView();
    }
    if (_paymentStep == 'error') {
      return _buildErrorView();
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Activer un Pack Prépa',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Packs Selection Header
                const Text(
                  '1. Choisissez votre formule d\'accès',
                  style: TextStyle(color: Colors.white60, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                
                // Pack selector
                ..._packs.map((pack) {
                  final isSelected = pack['id'] == _selectedPackId;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedPackId = pack['id']),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isSelected ? pack['color'].withOpacity(0.1) : Colors.white.withOpacity(0.01),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? pack['color'] : Colors.white.withOpacity(0.08),
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                pack['name'],
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              Text(
                                '${pack['price']} FCFA',
                                style: TextStyle(color: pack['color'], fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Durée : ${pack['duration']} (${pack['desc']})',
                            style: const TextStyle(color: Colors.white38, fontSize: 12),
                          ),
                          const SizedBox(height: 8),
                          const Divider(color: Colors.white10),
                          const SizedBox(height: 6),
                          ...List<Widget>.from(
                            (pack['features'] as List<String>).map((feat) => Padding(
                              padding: const EdgeInsets.only(bottom: 4.0),
                              child: Row(
                                children: [
                                  Icon(Icons.check, color: pack['color'], size: 14),
                                  const SizedBox(width: 8),
                                  Text(feat, style: const TextStyle(color: Colors.white60, fontSize: 11)),
                                ],
                              ),
                            ))
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),

                const SizedBox(height: 20),

                // Customer Inputs
                const Text(
                  '2. Informations de paiement Mobile Money',
                  style: TextStyle(color: Colors.white60, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.01),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Column(
                    children: [
                      // Full Name input
                      TextField(
                        controller: _nameController,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          labelText: 'Nom complet du titulaire',
                          labelStyle: const TextStyle(color: Colors.white38),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.02),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFC55A11)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Country selection dropdown
                      DropdownButtonFormField<String>(
                        dropdownColor: const Color(0xFF1E293B),
                        value: _selectedCountryCode,
                        onChanged: _onCountryChanged,
                        decoration: InputDecoration(
                          labelText: 'Pays de facturation',
                          labelStyle: const TextStyle(color: Colors.white38),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.02),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                          ),
                        ),
                        items: countryConfig.entries.map((e) {
                          return DropdownMenuItem<String>(
                            value: e.key,
                            child: Row(
                              children: [
                                Text(e.value['flag'] + '  ', style: const TextStyle(fontSize: 18)),
                                Text(e.value['name'], style: const TextStyle(color: Colors.white, fontSize: 14)),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),

                      // Operator selection dropdown
                      DropdownButtonFormField<String>(
                        dropdownColor: const Color(0xFF1E293B),
                        value: _selectedOperatorValue,
                        onChanged: (val) {
                          if (val != null) {
                            setState(() {
                              _selectedOperatorValue = val;
                            });
                          }
                        },
                        decoration: InputDecoration(
                          labelText: 'Opérateur Mobile Money',
                          labelStyle: const TextStyle(color: Colors.white38),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.02),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                          ),
                        ),
                        items: (countryConfig[_selectedCountryCode]!['operators'] as List<dynamic>).map((opt) {
                          return DropdownMenuItem<String>(
                            value: opt['value'],
                            child: Text(opt['label'], style: const TextStyle(color: Colors.white, fontSize: 14)),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),

                      // Phone input withPrefix
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 58,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 18),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.white.withOpacity(0.08)),
                            ),
                            child: Text(
                              '+${countryConfig[_selectedCountryCode]!['prefix']}',
                              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              style: const TextStyle(color: Colors.white, fontSize: 14),
                              decoration: InputDecoration(
                                labelText: 'Numéro de compte (ex : 90123456)',
                                labelStyle: const TextStyle(color: Colors.white38),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.02),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(color: Color(0xFFC55A11)),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                if (_errorMessage != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                    textAlign: TextAlign.center,
                  ),
                ],

                const SizedBox(height: 24),

                // Pay Button
                _isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFFC55A11)))
                    : ElevatedButton(
                        onPressed: _initiatePayment,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFC55A11),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text(
                          'Activer mon pack',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWaitingView() {
    final supabaseService = ref.read(supabaseServiceProvider);
    final String currentPackName = _packs.firstWhere((p) => p['id'] == _selectedPackId)['name'];
    final int currentPackPrice = _packs.firstWhere((p) => p['id'] == _selectedPackId)['price'];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.phonelink_ring, size: 80, color: Color(0xFFC55A11)),
              const SizedBox(height: 24),
              Text(
                'Demande de paiement envoyée !',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.02),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  children: [
                    Text(
                      'Veuillez valider la transaction de $currentPackPrice FCFA sur votre téléphone pour le plan $currentPackName.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                    ),
                    const SizedBox(height: 12),
                    const Divider(color: Colors.white10),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFC55A11)),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Attente de confirmation du réseau...',
                          style: TextStyle(color: Colors.white38, fontSize: 12),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // Mock activation shortcut
              if (supabaseService.useMock) ...[
                ElevatedButton(
                  onPressed: _simulateMockApproval,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Simuler la validation (Mode Mock)', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ] else ...[
                const Text(
                  'Une fois le code PIN entré, votre pack sera automatiquement débloqué dans un instant.',
                  style: TextStyle(color: Colors.white38, fontSize: 11),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessView() {
    final String currentPackName = _packs.firstWhere((p) => p['id'] == _selectedPackId)['name'];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.check_circle, size: 90, color: Colors.green),
              const SizedBox(height: 24),
              const Text(
                'Paiement Réussi !',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Text(
                'Votre plan $currentPackName a été débloqué et activé avec succès. Vous bénéficiez maintenant de l\'accès premium.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white60, fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  context.go('/dashboard');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC55A11),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Accéder à la plateforme', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorView() {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.error_outline, size: 85, color: Colors.redAccent),
              const SizedBox(height: 24),
              const Text(
                'Échec du Paiement',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.02),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Text(
                  _errorMessage ?? 'Une erreur est survenue lors de la validation du paiement.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _paymentStep = 'form';
                    _errorMessage = null;
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC55A11),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Réessayer le paiement', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
