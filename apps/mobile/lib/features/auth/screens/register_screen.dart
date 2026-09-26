import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../shared/providers/providers.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isLoading = false;
  bool _isSubmitted = false;
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final supabaseService = ref.read(supabaseServiceProvider);
      final response = await supabaseService.signUp(
        _emailController.text.trim(),
        _passwordController.text,
        _nameController.text.trim(),
      );

      if (!mounted) return;

      final session = (response is AuthResponse) ? response.session : null;
      final user = (response is AuthResponse) ? response.user : null;

      if (session == null || user?.emailConfirmedAt == null) {
        // La confirmation par e-mail est requise avant de pouvoir se connecter.
        setState(() {
          _isSubmitted = true;
          _isLoading = false;
        });
      } else {
        context.go('/dashboard');
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Inscription échouée. E-mail déjà utilisé ou format invalide.';
        _isLoading = false;
      });
    }
  }

  Widget _buildEmailConfirmationView() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 60),
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFF2E75B6).withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF2E75B6).withOpacity(0.2)),
            ),
            alignment: Alignment.center,
            child: const Text('✉️', style: TextStyle(fontSize: 36)),
          ),
          const SizedBox(height: 24),
          const Text(
            'Confirmez votre e-mail',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 12),
          Text(
            "Un e-mail de confirmation a été envoyé à l'adresse ${_emailController.text.trim()}.",
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.5),
          ),
          const SizedBox(height: 8),
          const Text(
            'Veuillez cliquer sur le lien contenu dans cet e-mail pour valider votre compte. Après confirmation, vous pourrez vous connecter.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white54, fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1B3A6B).withOpacity(0.2),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF1B3A6B).withOpacity(0.3)),
            ),
            child: const Text(
              "💡 Astuce : si vous ne recevez rien d'ici quelques minutes, vérifiez votre dossier Spams / Courriers indésirables.",
              style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => context.go('/login'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Colors.white24),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text("Aller à l'écran de connexion"),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.white,
      ),
      body: _isSubmitted
          ? SingleChildScrollView(child: _buildEmailConfirmationView())
          : SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Créer un compte',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Préparez votre avenir au Canada dès aujourd\'hui.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white60,
                  ),
                ),
                const SizedBox(height: 30),

                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF991B1B).withOpacity(0.2),
                      border: Border.all(color: const Color(0xFFEF4444)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 14),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Full Name
                TextFormField(
                  controller: _nameController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Nom complet',
                    labelStyle: const TextStyle(color: Colors.white60),
                    prefixIcon: const Icon(Icons.person_outline, color: Colors.white60),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.05),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFC55A11)),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Veuillez saisir votre nom';
                    }
                    if (value.trim().length < 2) {
                      return 'Le nom doit comporter au moins 2 caractères';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Email
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Adresse e-mail',
                    labelStyle: const TextStyle(color: Colors.white60),
                    prefixIcon: const Icon(Icons.email_outlined, color: Colors.white60),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.05),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFC55A11)),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Veuillez saisir votre e-mail';
                    }
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value.trim())) {
                      return 'Veuillez saisir un e-mail valide';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Password
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Mot de passe',
                    labelStyle: const TextStyle(color: Colors.white60),
                    prefixIcon: const Icon(Icons.lock_outlined, color: Colors.white60),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.toggle_off_outlined : Icons.toggle_on_outlined,
                        color: Colors.white60,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.05),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFC55A11)),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Veuillez saisir un mot de passe';
                    }
                    if (value.length < 6) {
                      return 'Le mot de passe doit faire au moins 6 caractères';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Confirm Password
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscurePassword,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Confirmer le mot de passe',
                    labelStyle: const TextStyle(color: Colors.white60),
                    prefixIcon: const Icon(Icons.lock_outlined, color: Colors.white60),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.05),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: Color(0xFFC55A11)),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  validator: (value) {
                    if (value != _passwordController.text) {
                      return 'Les mots de passe ne correspondent pas';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 30),

                // Register Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC55A11),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'S\'inscrire',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
                const SizedBox(height: 24),

                // Login Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Déjà inscrit ? ',
                      style: TextStyle(color: Colors.white70),
                    ),
                    GestureDetector(
                      onTap: () => context.pushReplacement('/auth/login'),
                      child: const Text(
                        'Se connecter',
                        style: TextStyle(
                          color: Color(0xFFC55A11),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
