import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LampDesk, LogIn, UserPlus } from 'lucide-react';
import { PublicHeader } from '../components/navigation/PublicHeader';
import { DEMO_MODE_ENABLED } from '../config/demoConfig';
import { useApp } from '../contexts/AppContext';
import { DEMO_ACCOUNT_CREDENTIALS } from '../data/mockUsers';

export const AuthLandingPage: React.FC = () => {
  const { copy, language, loginDemoUser } = useApp();
  const navigate = useNavigate();

  const handleDemo = (email: string) => {
    if (!DEMO_MODE_ENABLED) return;
    if (loginDemoUser(email)) {
      navigate('/home', { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--fl-bg)] text-[var(--fl-text)]">
      <PublicHeader />
      <div aria-hidden="true" className="fl-liquid-field pointer-events-none fixed inset-0 -z-10" />
      <main className="relative mx-auto max-w-[560px] px-4 py-12 sm:px-6 lg:max-w-4xl">
        <div className="relative mx-auto max-w-xl text-center">
          <div className="fl-auth-showcase mx-auto flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-md">
            <LampDesk className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <h1 className="fl-type-page mt-4">{copy.auth.authLandingTitle}</h1>
          <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
            {DEMO_MODE_ENABLED
              ? copy.auth.authLandingSubtitle
              : language === 'id'
              ? 'Masuk dengan akun mahasiswa Anda atau buat akun baru.'
              : 'Sign in with your student account or create a new account.'}
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

        {DEMO_MODE_ENABLED && (
          <section className="fl-panel relative mx-auto mt-10 max-w-2xl p-6 sm:p-7">
            <h2 className="fl-type-card text-center">{copy.auth.demoQuickTitle}</h2>
            <p className="fl-type-support mt-1 text-center text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Pilih salah satu profil simulasi di bawah ini untuk langsung melihat alur aplikasi.'
                : 'Pick a simulated profile below to explore the workspace immediately.'}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
              {DEMO_ACCOUNT_CREDENTIALS.map((demo) => {
                const initials = demo.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleDemo(demo.email)}
                    className="fl-card fl-card-interactive flex flex-col items-center bg-[var(--fl-bg)] p-4 text-center hover:border-[var(--fl-sage)] hover:bg-[var(--fl-sage-soft)]"
                  >
                    {demo.avatarUrl ? (
                      <img
                        src={demo.avatarUrl}
                        alt={demo.name}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        data-lang-exempt="true"
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--fl-soft-blue)] text-sm font-semibold text-[var(--fl-primary)]"
                      >
                        {initials}
                      </span>
                    )}
                    <p className="fl-type-body mt-2.5 font-semibold">{demo.name}</p>
                    <p className="fl-type-label mt-1 text-[var(--fl-sage)]">
                      {language === 'id' ? demo.summaryId : demo.summaryEn}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--fl-muted)]">
                      <span>{copy.nav.getStarted}</span>
                      <ArrowRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
