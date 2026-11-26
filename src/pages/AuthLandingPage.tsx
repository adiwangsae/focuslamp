import React from 'react';
import { Link } from 'react-router-dom';
import { LampDesk, LogIn, UserPlus } from 'lucide-react';
import { PublicHeader } from '../components/navigation/PublicHeader';
import { useApp } from '../contexts/AppContext';

export const AuthLandingPage: React.FC = () => {
  const { copy } = useApp();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--fl-bg)] text-[var(--fl-text)]">
      <PublicHeader />
      <div aria-hidden="true" className="fl-liquid-field pointer-events-none fixed inset-0 -z-10" />
      <main className="relative mx-auto max-w-[560px] px-4 py-16 sm:px-6 lg:max-w-4xl">
        <div className="relative mx-auto max-w-xl text-center">
          <div className="fl-auth-showcase mx-auto flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-md">
            <LampDesk className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <h1 className="fl-type-page mt-4">{copy.auth.authLandingTitle}</h1>
          <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
            {copy.auth.authLandingSubtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="fl-btn-auth">
              <LogIn className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
              <span>{copy.auth.loginButton}</span>
            </Link>
            <Link to="/register" className="fl-btn-secondary">
              <UserPlus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              <span>{copy.auth.registerButton}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
