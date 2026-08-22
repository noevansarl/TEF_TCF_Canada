import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/providers/providers.dart';
import '../../features/onboarding/screens/onboarding_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/navigation/main_scaffold.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/catalogue/screens/catalogue_screen.dart';
import '../../features/progress/screens/progress_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/session/screens/session_screen.dart';
import '../../features/session/screens/results_screen.dart';
import '../../features/subscription/screens/fedapay_payment_screen.dart';
import '../../features/dashboard/screens/nclc_calculator_screen.dart';
import '../../features/dashboard/screens/learning_path_screen.dart';
import '../../features/dashboard/screens/diagnostic_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: false,
    redirect: (context, state) {
      final isAuthenticated = authState.hasValue && authState.value != null;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');
      
      // Si non connecté, rediriger vers login (sauf si sur Onboarding '/')
      if (!isAuthenticated && !isAuthRoute && state.matchedLocation != '/') {
        return '/auth/login';
      }
      
      // Si déjà connecté et tente d'aller sur auth, rediriger vers dashboard
      if (isAuthenticated && isAuthRoute) {
        return '/dashboard';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/', 
        builder: (ctx, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/auth',
        routes: [
          GoRoute(
            path: 'login', 
            builder: (ctx, state) => const LoginScreen(),
          ),
          GoRoute(
            path: 'register', 
            builder: (ctx, state) => const RegisterScreen(),
          ),
        ]
      ),
      ShellRoute(
        builder: (ctx, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/dashboard', 
            builder: (ctx, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/catalogue', 
            builder: (ctx, state) => const CatalogueScreen(),
          ),
          GoRoute(
            path: '/progress', 
            builder: (ctx, state) => const ProgressionScreen(),
          ),
          GoRoute(
            path: '/profile', 
            builder: (ctx, state) => const ProfileScreen(),
          ),
        ]
      ),
      GoRoute(
        path: '/session/:sessionId',
        builder: (ctx, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return SessionScreen(
            sessionId: state.pathParameters['sessionId']!,
            module: extra?['module'] ?? 'CO',
            testType: extra?['testType'] ?? 'TCF_CANADA',
            level: extra?['level'] ?? 'B2',
            isOffline: extra?['isOffline'] ?? false,
          );
        },
      ),
      GoRoute(
        path: '/results/:sessionId',
        builder: (ctx, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return ResultsScreen(
            sessionId: state.pathParameters['sessionId']!,
            score: extra?['score'] as double?,
            nclc: extra?['nclc'] as String?,
          );
        },
      ),
      GoRoute(
        path: '/pay-fedapay',
        builder: (ctx, state) => const FedaPayPaymentScreen(),
      ),
      GoRoute(
        path: '/nclc-calculator',
        builder: (ctx, state) => const NclcCalculatorScreen(),
      ),
      GoRoute(
        path: '/learning-path',
        builder: (ctx, state) => const LearningPathScreen(),
      ),
      GoRoute(
        path: '/diagnostic',
        builder: (ctx, state) => const DiagnosticScreen(),
      ),
    ],
  );
});
