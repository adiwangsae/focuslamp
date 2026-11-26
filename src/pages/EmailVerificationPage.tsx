import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, MailCheck, RefreshCw } from 'lucide-react';
import { PublicHeader } from '../components/navigation/PublicHeader';
import { useApp } from '../contexts/AppContext';

export const EmailVerificationPage: React.FC = () => {
  const {
    copy,
    language,
    currentUser,
    latestVerificationTokenForUser,
    resendVerificationEmail,
    verifyEmailToken,
    showToast,
  } = useApp();
  const [searchParams] = useSearchParams();
  const [tokenInput, setTokenInput] = useState(
    searchParams.get('token') ?? latestVerificationTokenForUser ?? ''
  );
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const handleVerify = () => {
    const activeToken = tokenInput.trim() || latestVerificationTokenForUser || '';
    const res = verifyEmailToken(activeToken);
    if (!res.ok) {
      setErrorMsg(
        res.reason === 'expired'
          ? language === 'id'
            ? 'Tautan verifikasi kedaluwarsa (batas 24 jam). Kirim ulang verifikasi.'
            : 'Verification link expired (24-hour limit). Request a new one.'
          : res.reason === 'already_used'
          ? language === 'id'
            ? 'Token verifikasi ini sudah digunakan.'
            : 'This verification token was already used.'
          : language === 'id'
          ? 'Token verifikasi tidak valid atau tidak ditemukan.'
          : 'Invalid or missing verification token.'
      );
      return;
    }
    setErrorMsg('');
    setVerifiedSuccess(true);
    setStatusMsg(
      language === 'id'
        ? 'Email berhasil diverifikasi pada akun FocusLamp Anda.'
        : 'Email address successfully verified for your FocusLamp account.'
    );
  };

  const handleResend = () => {
    const rec = resendVerificationEmail();
    if (!rec) return;
    setTokenInput(rec.token);
    setErrorMsg('');
    showToast(
      'info',
      language === 'id'
        ? 'Token verifikasi baru (24 jam) telah dibuat.'
        : 'New 24-hour verification token issued.'
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--fl-bg)] text-[var(--fl-text)]">
      <PublicHeader />
      <div aria-hidden="true" className="fl-liquid-field pointer-events-none fixed inset-0 -z-10" />
      <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="fl-panel rounded-[28px] p-6 text-center sm:p-8 lg:text-left">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fl-sage-soft)] text-[var(--fl-sage)] lg:mx-0">
            {verifiedSuccess || currentUser?.emailVerified ? (
              <CheckCircle2 className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
            ) : (
              <MailCheck className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
            )}
          </div>

          <h1 className="fl-type-page mt-4">{copy.auth.verifyTitle}</h1>
          <p className="fl-type-support mt-1.5 text-[var(--fl-muted)]">
            {copy.auth.verifySubtitle}
          </p>

          {currentUser && (
            <div className="fl-card-soft mt-4 p-3.5 text-xs">
              <p className="font-semibold text-[var(--fl-text)]">
                {currentUser.pendingEmail
                  ? `${language === 'id' ? 'Email tertunda:' : 'Pending change:'} ${currentUser.pendingEmail}`
                  : currentUser.email}
              </p>
              <p className="mt-0.5 text-[var(--fl-muted)]">
                {language === 'id' ? 'Status:' : 'Status:'}{' '}
                {currentUser.emailVerified && !currentUser.pendingEmail
                  ? copy.common.verified
                  : copy.common.unverified}
              </p>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-center text-xs text-red-800 lg:items-start lg:justify-start lg:text-left dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span className="fl-lang">{errorMsg}</span>
            </div>
          )}

          {statusMsg && (
            <p className="mt-4 rounded-xl border border-[var(--fl-sage-border)] bg-[var(--fl-sage-soft)] p-3.5 text-xs font-medium text-[var(--fl-sage)]">
              {statusMsg}
            </p>
          )}

          {!verifiedSuccess && (
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="verify-token" className="fl-type-support block text-center font-semibold lg:text-left">
                  {language === 'id' ? 'Token Verifikasi (24 jam)' : 'Verification Token (24h window)'}
                </label>
                <input
                  id="verify-token"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="vrf-..."
                  className="fl-input fl-type-body mt-1.5 w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2.5 text-[var(--fl-text)]"
                />
              </div>

              <button
                type="button"
                onClick={handleVerify}
                className="fl-btn-primary w-full !min-h-[48px]"
              >
                <span className="fl-lang">{copy.auth.verifyNowButton}</span>
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="fl-btn-secondary w-full !min-h-[44px]"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  <span>{copy.auth.resendVerificationButton}</span>
                </button>
              )}
            </div>
          )}

          <div className="mt-6 border-t border-[var(--fl-border)] pt-4 text-center">
            <Link
              to={currentUser ? '/profile' : '/login'}
              className="fl-type-support font-semibold text-[var(--fl-primary)] hover:underline"
            >
              <span className="fl-lang">
                {currentUser
                  ? language === 'id'
                    ? 'Kembali ke Profil'
                    : 'Back to Profile'
                  : copy.auth.backToLogin}
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
