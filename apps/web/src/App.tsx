import { lazy, Suspense, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'
import { FullPageSpinner } from './components/FullPageSpinner'
import { CookieBanner } from './components/CookieBanner'
import { WhatsAppButton } from './components/WhatsAppButton'
import { AffiliateTracker } from './components/AffiliateTracker'
import { LiveChat } from './components/LiveChat'

// ── Pages principales ──────────────────────────────────────
const LandingPage         = lazy(() => import('./pages/LandingPage'))
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage        = lazy(() => import('./pages/auth/RegisterPage'))
const AuthCallbackPage    = lazy(() => import('./pages/auth/AuthCallbackPage'))
const DashboardPage       = lazy(() => import('./pages/DashboardPage'))
const CataloguePage       = lazy(() => import('./pages/CataloguePage'))
const SessionPage         = lazy(() => import('./pages/SessionPage'))
const SimulationPage      = lazy(() => import('./pages/SimulationPage'))
const ResultsPage         = lazy(() => import('./pages/ResultsPage'))
const ProgressionPage     = lazy(() => import('./pages/ProgressionPage'))
const ProfilePage         = lazy(() => import('./pages/ProfilePage'))
const SubscribePage       = lazy(() => import('./pages/SubscribePage'))
const AdminLayout         = lazy(() => import('./pages/admin/AdminLayout'))
const ExpertLayout        = lazy(() => import('./pages/expert/ExpertLayout'))
const PrivateLayout       = lazy(() => import('./components/PrivateLayout'))

// ── Pages publiques ────────────────────────────────────────
const NclcCalculatorPage  = lazy(() => import('./pages/NclcCalculatorPage'))
const CrsCalculatorPage   = lazy(() => import('./pages/CrsCalculatorPage'))
const ComparisonPage      = lazy(() => import('./pages/ComparisonPage'))
const QuickTestPage       = lazy(() => import('./pages/QuickTestPage'))
const HelpCenterPage      = lazy(() => import('./pages/HelpCenterPage'))
const RefundPage          = lazy(() => import('./pages/RefundPage'))
const ExamPacksPage       = lazy(() => import('./pages/ExamPacksPage'))
const SuccessStoriesPage  = lazy(() => import('./pages/SuccessStoriesPage'))
const AffiliatePage       = lazy(() => import('./pages/AffiliatePage'))
const BlogPage            = lazy(() => import('./pages/BlogPage'))
const BlogPostPage        = lazy(() => import('./pages/BlogPostPage'))
const PrivacyPolicyPage   = lazy(() => import('./pages/PrivacyPolicyPage'))
const CookiesPolicyPage   = lazy(() => import('./pages/CookiesPolicyPage'))
const LegalMentionsPage   = lazy(() => import('./pages/LegalMentionsPage'))
const CgvPage             = lazy(() => import('./pages/CgvPage'))

// ── Pages protégées ────────────────────────────────────────
const LearningPathPage    = lazy(() => import('./pages/LearningPathPage'))
const InstitutionDashboard = lazy(() => import('./pages/InstitutionDashboard'))

// ── Guards ────────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  const location = useLocation()
  if (!initialized) return <FullPageSpinner />
  return user ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, initialized } = useAuthStore()
  const location = useLocation()
  if (!initialized) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function ExpertRoute({ children }: { children: React.ReactNode }) {
  const { user, role, initialized } = useAuthStore()
  const location = useLocation()
  if (!initialized) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return (role === 'expert' || role === 'admin') ? <>{children}</> : <Navigate to="/dashboard" replace />
}

// ── Root Layout (Fournit le contexte Router aux widgets) ───
function RootLayout() {
  return (
    <>
      <Outlet />
      <AffiliateTracker />
      <CookieBanner />
      <WhatsAppButton />
      <LiveChat />
    </>
  )
}

// ── Routeur ───────────────────────────────────────────────
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Pages publiques
      { path: '/',                    element: <LandingPage /> },
      { path: '/login',               element: <LoginPage /> },
      { path: '/register',            element: <RegisterPage /> },
      { path: '/auth/callback',       element: <AuthCallbackPage /> },
      { path: '/calculateur-nclc',    element: <NclcCalculatorPage /> },
      { path: '/simulateur-crs',      element: <CrsCalculatorPage /> },
      { path: '/tcf-vs-tef-canada',   element: <ComparisonPage /> },
      { path: '/test-rapide',         element: <QuickTestPage /> },
      { path: '/aide',                element: <HelpCenterPage /> },
      { path: '/remboursement',       element: <RefundPage /> },
      { path: '/packs',               element: <ExamPacksPage /> },
      { path: '/reussites',           element: <SuccessStoriesPage /> },
      { path: '/affiliation',         element: <AffiliatePage /> },
      { path: '/blog',                element: <BlogPage /> },
      { path: '/blog/:slug',          element: <BlogPostPage /> },
      { path: '/confidentialite',     element: <PrivacyPolicyPage /> },
      { path: '/cookies',             element: <CookiesPolicyPage /> },
      { path: '/mentions-legales',    element: <LegalMentionsPage /> },
      { path: '/cgv',                 element: <CgvPage /> },
      { path: '/paiement-confirme',   element: <Navigate to="/dashboard?payment=success" replace /> },

      // Pages protégées (utilisateur connecté)
      {
        element: <PrivateRoute><PrivateLayout /></PrivateRoute>,
        children: [
          { path: '/dashboard',         element: <DashboardPage /> },
          { path: '/modules',           element: <CataloguePage /> },
          { path: '/simulation',        element: <SimulationPage /> },
          { path: '/results/:sessionId',element: <ResultsPage /> },
          { path: '/progress',          element: <ProgressionPage /> },
          { path: '/profile',           element: <ProfilePage /> },
          { path: '/subscribe',         element: <SubscribePage /> },
          { path: '/subscribe/success', element: <SubscribePage /> },
          { path: '/parcours',          element: <LearningPathPage /> },
          { path: '/institution',       element: <InstitutionDashboard /> },
        ]
      },
      {
        path: '/session/:sessionId',
        element: <PrivateRoute><SessionPage /></PrivateRoute>
      },

      // Pages admin / expert
      {
        path: '/admin/*',
        element: <AdminRoute><AdminLayout /></AdminRoute>
      },
      {
        path: '/expert/*',
        element: <ExpertRoute><ExpertLayout /></ExpertRoute>
      }
    ]
  }
])

export default function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        // Bloquer l'accès si email non confirmé
        if (!session.user.email_confirmed_at) {
          await supabase.auth.signOut()
          useAuthStore.getState().setUser(null)
          useAuthStore.getState().setInitialized()
          return
        }

        // Récupérer le rôle depuis la BDD
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        useAuthStore.getState().setUser(
          { id: session.user.id, email: session.user.email! },
          profile?.role || 'user'
        )
      } else {
        useAuthStore.getState().setUser(null)
      }
      // Marquer l'auth comme initialisée après la première vérification
      useAuthStore.getState().setInitialized()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
