import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { AnimatedErrorMessage } from '../components/motion/MotionPrimitives';
import { PublicHeader } from '../components/navigation/PublicHeader';
import { useApp } from '../contexts/AppContext';
import { validatePasswordRule } from '../utils/validation';

export const PasswordResetPage: React.FC = () => {
  const { copy, language, authTokens, consumePasswordReset } = useApp();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') ?? '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; token?: string }>(
    {}
  );
  const [done, setDone] = useState(false);

  const tokenRecord = token ? authTokens[token] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdErr = validatePasswordRule(newPassword, language);
    const confirmErr =
      newPassword !== confirmPassword
        ? language === 'id'
          ? 'Konfirmasi kata sandi tidak cocok.'
          : 'Passwords do not match.'
        : undefined;

    if (pwdErr || confirmErr) {
      setErrors({ password: pwdErr, confirm: confirmErr });
      return;
    }

    const res = await consumePasswordReset(token.trim(), newPassword);
    if (!res.ok) {
      const msg =
        res.reason === 'expired'
          ? language === 'id'
            ? 'Token pemulihan telah kedaluwarsa (batas 30 menit).'
            : 'Recovery token has expired (30-minute limit).'
          : res.reason === 'already_used'
          ? language === 'id'
            ? 'Token pemulihan ini sudah digunakan sebelumnya.'
            : 'This recovery token has already been used.'
          : res.reason === 'not_registered'
          ? language === 'id'
            ? 'Pemulihan kata sandi hanya tersedia untuk akun terdaftar.'
            : 'Password reset is only available for registered accounts.'
          : language === 'id'
          ? 'Token pemulihan tidak ditemukan.'
          : 'Recovery token was not found.';
      setErrors({ token: msg });
      return;
    }

    setErrors({});
    setDone(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--fl-bg)] text-[var(--fl-text)]">
      <PublicHeader />
      <div aria-hidden="true" className="fl-liquid-field pointer-events-none fixed inset-0 -z-10" />
      <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="fl-panel rounded-[28px] p-6 text-center sm:p-8 lg:text-left">
          {done ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fl-sage-soft)] text-[var(--fl-sage)] lg:mx-0">
                <CheckCircle2 className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
              </div>
              <h1 className="fl-type-page">
                {language === 'id' ? 'Kata sandi diperbarui' : 'Password updated'}
              </h1>
              <p className="fl-type-support text-[var(--fl-muted)]">
                {language === 'id'
                  ? 'Kata sandi baru telah disimpan dan token pemulihan kini tidak berlaku lagi.'
                  : 'Your new password has been saved and the single-use recovery token is now invalidated.'}
              </p>
              <Link to="/login" className="fl-btn-primary w-full lg:w-auto">
                <span className="fl-lang">{copy.auth.backToLogin}</span>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="fl-type-page">{copy.auth.resetTitle}</h1>
              <p className="fl-type-support mt-1.5 text-[var(--fl-muted)]">
                {copy.auth.resetSubtitle}
              </p>

              {errors.token && (
                <div
                  role="alert"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-center text-xs text-red-800 lg:items-start lg:justify-start lg:text-left dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span className="fl-lang">{errors.token}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                <div>
                  <label htmlFor="reset-token" className="fl-type-support block text-center font-semibold lg:text-left">
                    {language === 'id' ? 'Token Pemulihan' : 'Recovery Token'}
                  </label>
                  <input
                    id="reset-token"
                    type="text"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      setErrors((p) => ({ ...p, token: undefined }));
                    }}
                    placeholder="rst-..."
                    className="fl-input fl-type-body mt-1.5 w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2.5 text-[var(--fl-text)]"
                  />
                  {tokenRecord && (
                    <p className="fl-type-label mt-1 text-center text-[var(--fl-muted)] lg:text-left">
                      {language === 'id' ? 'Untuk akun:' : 'Account:'} {tokenRecord.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="reset-pass" className="fl-type-support block text-center font-semibold lg:text-left">
                    {copy.auth.newPasswordLabel}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="reset-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrors((p) => ({
                          ...p,
                          password: validatePasswordRule(e.target.value, language),
                        }));
                      }}
                      className="fl-input fl-type-body w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] py-2.5 pr-11 pl-3.5 text-[var(--fl-text)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[var(--fl-muted)]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                  <AnimatedErrorMessage message={errors.password} />
                </div>

                <div>
                  <label htmlFor="reset-confirm" className="fl-type-support block text-center font-semibold lg:text-left">
                    {copy.auth.confirmPasswordLabel}
                  </label>
                  <input
                    id="reset-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((p) => ({ ...p, confirm: undefined }));
                    }}
                    className="fl-input fl-type-body mt-1.5 w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2.5 text-[var(--fl-text)]"
                  />
                  <AnimatedErrorMessage message={errors.confirm} />
                </div>

                <button type="submit" className="fl-btn-primary w-full !min-h-[48px]">
                  <span className="fl-lang">{copy.auth.updatePasswordButton}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
