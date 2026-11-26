import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AnimatedErrorMessage } from '../components/motion/MotionPrimitives';
import { PublicHeader } from '../components/navigation/PublicHeader';
import { useApp } from '../contexts/AppContext';
import { FL_EASE_STANDARD } from '../utils/motion';
import { validateEmailAddress } from '../utils/validation';

export const ForgotPasswordPage: React.FC = () => {
  const { copy, language, requestPasswordReset } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmailAddress(email, [], language);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    const record = requestPasswordReset(email);
    setGeneratedToken(record.token);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--fl-bg)] text-[var(--fl-text)]">
      <PublicHeader />
      <div aria-hidden="true" className="fl-liquid-field pointer-events-none fixed inset-0 -z-10" />
      <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="fl-panel rounded-[28px] p-6 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {generatedToken ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: FL_EASE_STANDARD }}
                className="space-y-4 text-center lg:text-left"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fl-sage-soft)] text-[var(--fl-sage)] lg:mx-0">
                  <CheckCircle2 className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h1 className="fl-type-page">{copy.auth.resetSentTitle}</h1>
                <p className="fl-type-support text-[var(--fl-muted)]">
                  {copy.auth.resetSentBody}
                </p>

                <div className="fl-card-soft p-3.5 text-xs">
                  <p className="font-medium text-[var(--fl-muted)]">
                    {language === 'id'
                      ? 'Tautan Reset (berlaku 30 menit, 1x pakai):'
                      : 'Password Reset Link (30m expiry, single-use):'}
                  </p>
                  <Link
                    to={`/reset-password?token=${encodeURIComponent(generatedToken)}`}
                    className="mt-1.5 inline-flex items-center gap-1.5 font-semibold text-[var(--fl-primary)] hover:underline"
                  >
                    <KeyRound className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    <span>
                      {language === 'id' ? 'Buka Halaman Reset Kata Sandi' : 'Open Password Reset Screen'}
                    </span>
                  </Link>
                </div>

                <Link to="/login" className="fl-btn-secondary w-full lg:w-auto">
                  <span className="fl-lang">{copy.auth.backToLogin}</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: FL_EASE_STANDARD }}
                className="text-center lg:text-left"
              >
                <h1 className="fl-type-page">{copy.auth.forgotTitle}</h1>
                <p className="fl-type-support mt-1.5 text-[var(--fl-muted)]">
                  {copy.auth.forgotSubtitle}
                </p>
                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="fl-type-support block text-center font-semibold lg:text-left">
                      {copy.auth.emailLabel}
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="student@university.edu"
                      className="fl-input fl-type-body mt-1.5 w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2.5 text-[var(--fl-text)]"
                    />
                    <AnimatedErrorMessage message={error} />
                  </div>
                  <button type="submit" className="fl-btn-primary w-full !min-h-[48px]">
                    <span className="fl-lang">{copy.auth.sendResetButton}</span>
                  </button>
                </form>
                <p className="fl-type-support mt-6 text-center">
                  <Link
                    to="/login"
                    className="font-semibold text-[var(--fl-primary)] hover:underline"
                  >
                    {copy.auth.backToLogin}
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
