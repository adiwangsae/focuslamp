import React from 'react';
import { BrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppShell } from './components/navigation/AppShell';
import { AuthSplitShell } from './components/auth/AuthSplitShell';
import { AnimatedPage } from './components/motion/MotionPrimitives';
import { LenisProvider } from './components/common/LenisProvider';
import { SplashScreen } from './components/common/SplashScreen';
import { ToastContainer } from './components/common/StatePrimitives';
import { LandingPage } from './pages/LandingPage';
import { AuthLandingPage } from './pages/AuthLandingPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PasswordResetPage } from './pages/PasswordResetPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { FocusPage } from './pages/FocusPage';
import { DashboardPage } from './pages/DashboardPage';
import { DevicePage } from './pages/DevicePage';
import { ProfilePage } from './pages/ProfilePage';
import { FocusMatePage } from './pages/FocusMatePage';

const AUTH_SHELL_PATHS = new Set(['/home', '/focus', '/dashboard', '/device', '/profile', '/ai']);
const PUBLIC_PATHS = new Set([
  '/',
  '/auth',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/onboarding',
]);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  const location = useLocation();
  if (!currentUser) {
    if (
      AUTH_SHELL_PATHS.has(location.pathname) &&
      AUTH_SHELL_PATHS.has(window.location.pathname)
    ) {
      return <Navigate to="/login" replace />;
    }
    return null;
  }
  return <>{children}</>;
};

const renderShellPage = (pathname: string) => {
  switch (pathname) {
    case '/home':
      return <HomePage />;
    case '/focus':
      return <FocusPage />;
    case '/dashboard':
      return <DashboardPage />;
    case '/device':
      return <DevicePage />;
    case '/profile':
      return <ProfilePage />;
    case '/ai':
      return <FocusMatePage />;
    default:
      return <HomePage />;
  }
};

const ProtectedAppLayout: React.FC = () => {
  const location = useLocation();
  const isFullAi = location.pathname === '/ai';

  return (
    <ProtectedRoute>
      <AppShell>
        <AnimatePresence mode="wait" initial={false}>
          <AnimatedPage
            key={location.pathname}
            className={isFullAi ? 'flex min-h-0 flex-1 flex-col' : undefined}
          >
            {renderShellPage(location.pathname)}
          </AnimatedPage>
        </AnimatePresence>
      </AppShell>
    </ProtectedRoute>
  );
};

const AppRoutes: React.FC = () => {
  const { currentUser, language, toasts, dismissToast } = useApp();
  const location = useLocation();
  const isAppShellRoute = AUTH_SHELL_PATHS.has(location.pathname);
  const isSplitAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  if (!isAppShellRoute) {
    if (
      (location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/auth') &&
      currentUser
    ) {
      return <Navigate to={currentUser.onboardingCompleted ? '/home' : '/onboarding'} replace />;
    }
    if (location.pathname === '/onboarding' && !currentUser) {
      return <Navigate to="/login" replace />;
    }
    if (!PUBLIC_PATHS.has(location.pathname)) {
      return <Navigate to="/" replace />;
    }
  }

  const renderPublicContent = () => {
    switch (location.pathname) {
      case '/':
        return <LandingPage />;
      case '/auth':
        return <AuthLandingPage />;
      case '/forgot-password':
        return <ForgotPasswordPage />;
      case '/reset-password':
        return <PasswordResetPage />;
      case '/verify-email':
        return <EmailVerificationPage />;
      case '/onboarding':
        return <OnboardingPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <>
      <SplashScreen language={language} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AnimatePresence mode="wait" initial={false}>
        {isAppShellRoute ? (
          <motion.div
            key="__app_shell__"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProtectedAppLayout />
          </motion.div>
        ) : isSplitAuthRoute ? (
          <AnimatedPage key="__auth_split__">
            <AuthSplitShell mode={location.pathname === '/register' ? 'register' : 'login'} />
          </AnimatedPage>
        ) : (
          <AnimatedPage key={location.pathname}>
            {renderPublicContent()}
          </AnimatedPage>
        )}
      </AnimatePresence>
    </>
  );
};

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <BrowserRouter>
          <LenisProvider>
            <AppRoutes />
          </LenisProvider>
        </BrowserRouter>
      </AppProvider>
    </MotionConfig>
  );
}
