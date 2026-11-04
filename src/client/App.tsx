import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
import { ThemeProvider } from './lib/theme-context';
import { MacOSWindowFrame } from './components/MacOSWindowFrame';
import { CommandPalette } from './components/CommandPalette';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateCommitmentPage } from './pages/CreateCommitmentPage';
import { CommitmentDetailPage } from './pages/CommitmentDetailPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-neutral-400">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-neutral-400">
        Authenticating session...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const HomeRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-neutral-400">
        Authenticating session...
      </div>
    );
  }

  return user ? <DashboardPage /> : <LandingPage />;
};

const MacAppLayout: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <div className="w-full h-screen min-h-screen bg-[#f7f8f9] dark:bg-[#0d0e12] text-[#111827] dark:text-[#f2f3f5] flex flex-col font-sans select-none overflow-hidden relative">
      {/* Main Full-Bleed Application Shell */}
      <MacOSWindowFrame
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      >
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateCommitmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commitments/:id"
            element={
              <ProtectedRoute>
                <CommitmentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MacOSWindowFrame>

      {/* Spotlight Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MacAppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

