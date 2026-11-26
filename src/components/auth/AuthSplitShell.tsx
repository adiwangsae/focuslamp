import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LampDesk,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AnimatedErrorMessage } from '../motion/MotionPrimitives';
import { PublicHeader } from '../navigation/PublicHeader';
import { useApp } from '../../contexts/AppContext';
import {
  AuthMode,
  clearAuthDraft,
  getAuthDraft,
  getAuthModeDirection,
  saveAuthDraft,
} from '../../utils/authDraft';
import { authFormSlideVariants, FL_EASE_STANDARD } from '../../utils/motion';
import {
  validateEmailAddress,
  validateFullName,
  validateLogin,
  validatePasswordRule,
  validateRegistration,
  ValidationErrors,
} from '../../utils/validation';
import { AuthShowcaseArtwork } from './AuthShowcaseArtwork';

interface AuthSplitShellProps {
  mode: AuthMode;
}

const LoginFormPanel: React.FC<{
  sharedEmail: string;
  onEmailSync: (email: string) => void;
}> = ({ sharedEmail, onEmailSync }) => {
  const { copy, language, loginWithEmail, rememberedEmail } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as { prefillEmail?: string } | null) ?? null;

  const initialEmail = routeState?.prefillEmail || sharedEmail || rememberedEmail || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  useEffect(() => {
    if (routeState?.prefillEmail) {
      setEmail(routeState.prefillEmail);
      onEmailSync(routeState.prefillEmail);
    }
  }, [routeState?.prefillEmail, onEmailSync]);

  const navigateHomeReplacingAuth = () => {
    clearAuthDraft();
    if (window.history.length <= 2) {
      window.history.replaceState(null, '', '/');
      navigate('/home');
    } else {
      navigate('/home', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const fieldErrors = validateLogin(email, password, language);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      const res = await loginWithEmail(email, password, rememberMe);
      if (!res.ok) {
        setErrors({ form: res.error });
        return;
      }
      navigateHomeReplacingAuth();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col md:h-full md:justify-between"
    >
      <div>
        <div className="text-center md:text-left">
          <h1 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-[var(--fl-text)] lg:text-[26px]">
            {copy.auth.loginTitle}
          </h1>
          <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
            {copy.auth.loginSubtitle}
          </p>
        </div>

        <AnimatedErrorMessage
          message={errors.form}
          className="fl-type-support mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-red-800 md:text-left dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        />

        <div className="mt-4 space-y-3.5">
          <div>
            <label
              htmlFor="login-email"
              className="fl-type-label block text-center font-semibold text-[var(--fl-text)] md:text-left"
            >
              {copy.auth.emailLabel}
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                const nextVal = e.target.value;
                setEmail(nextVal);
                onEmailSync(nextVal);
                setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
              }}
              placeholder="student@university.edu"
              className="fl-input fl-type-body mt-1 !min-h-[42px] w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2 text-[var(--fl-text)] placeholder:text-[var(--fl-muted)]"
            />
            <AnimatedErrorMessage message={errors.email} />
          </div>

          <div>
            <div className="flex flex-col items-center gap-1 md:flex-row md:items-center md:justify-between">
              <label
                htmlFor="login-password"
                className="fl-type-label block font-semibold text-[var(--fl-text)]"
              >
                {copy.auth.passwordLabel}
              </label>
              <Link
                to="/forgot-password"
                className="fl-type-label font-medium text-[var(--fl-primary)] hover:underline"
              >
                <span className="fl-lang">{copy.auth.forgotLink}</span>
              </Link>
            </div>
            <div className="relative mt-1">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
                }}
                placeholder="••••••••"
                className="fl-input fl-type-body !min-h-[42px] w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] py-2 pr-11 pl-3.5 text-[var(--fl-text)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="fl-btn absolute inset-y-0 right-0 flex items-center px-3.5 text-[var(--fl-muted)] hover:text-[var(--fl-text)]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            </div>
            <AnimatedErrorMessage message={errors.password} />
          </div>

          <label className="fl-type-label flex items-center justify-center gap-2 text-[var(--fl-muted)] md:justify-start">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--fl-border)] text-[#0F2557]"
            />
            <span>{copy.auth.rememberMe}</span>
          </label>
        </div>
      </div>

      <div className="mt-auto pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="fl-btn-auth !min-h-[44px] w-full disabled:opacity-60"
        >
          <span className="fl-lang">
            {submitting
              ? language === 'id'
                ? 'Memverifikasi...'
                : 'Signing in...'
              : copy.auth.loginButton}
          </span>
          {!submitting && <ArrowRight className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
};

const RegisterFormPanel: React.FC<{
  sharedEmail: string;
  sharedName: string;
  onEmailSync: (email: string) => void;
  onNameSync: (name: string) => void;
}> = ({ sharedEmail, sharedName, onEmailSync, onNameSync }) => {
  const { copy, language, allAccountEmails, registerUser } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(sharedName);
  const [email, setEmail] = useState(sharedEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registeredAccount, setRegisteredAccount] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [errors, setErrors] = useState<ValidationErrors & { form?: string }>({});

  const canSubmitConsent = acceptedTerms && acceptedPrivacy && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const validationErrors = validateRegistration(
      {
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms,
        acceptedPrivacy,
        existingEmails: allAccountEmails,
      },
      language
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerUser(name, email, password);
      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          email:
            res.error ??
            (language === 'id'
              ? 'Email ini sudah terdaftar pada akun lain.'
              : 'This email is already registered.'),
        }));
        return;
      }

      clearAuthDraft();
      setErrors({});
      setRegisteredAccount({
        name: name.trim(),
        email: res.email ?? email.trim().toLowerCase(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (registeredAccount) {
    return (
      <div className="space-y-4 text-center" data-testid="registration-success-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fl-sage-soft)] text-[var(--fl-sage)]">
          <CheckCircle2 className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
        </div>
        <div>
          <h1 className="fl-type-page">
            {language === 'id' ? 'Akun Berhasil Dibuat' : 'Account Created'}
          </h1>
          <p className="fl-type-support mt-1.5 text-[var(--fl-muted)]">
            {language === 'id'
              ? 'Akun FocusLamp Anda telah tersimpan. Silakan masuk menggunakan email dan kata sandi yang baru Anda daftarkan.'
              : 'Your FocusLamp account has been created and saved. Proceed to log in using your registered email and password.'}
          </p>
        </div>

        <div className="fl-card-soft p-4 text-center md:text-left">
          <p className="fl-type-overline text-[var(--fl-muted)]">
            {copy.auth.fullNameLabel}
          </p>
          <p className="fl-type-body mt-0.5 font-semibold text-[var(--fl-text)]">
            {registeredAccount.name}
          </p>
          <p className="fl-type-overline mt-2.5 text-[var(--fl-muted)]">
            {copy.auth.emailLabel}
          </p>
          <p className="fl-type-body mt-0.5 font-medium text-[var(--fl-primary)]">
            {registeredAccount.email}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate('/login', {
              state: { prefillEmail: registeredAccount.email },
            })
          }
          className="fl-btn-auth w-full"
        >
          <span>
            {language === 'id' ? 'Lanjut ke Halaman Masuk' : 'Proceed to Log In'}
          </span>
          <ArrowRight className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col md:h-full md:justify-between"
    >
      <div>
        <div className="text-center md:text-left">
          <h1 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-[var(--fl-text)] lg:text-[26px]">
            {copy.auth.registerTitle}
          </h1>
          <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
            {copy.auth.registerSubtitle}
          </p>
        </div>

        <AnimatedErrorMessage
          message={errors.form}
          className="fl-type-support mt-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-center text-red-800 md:text-left dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        />

        <div className="mt-2.5 space-y-2">
          <div>
            <label
              htmlFor="reg-name"
              className="fl-type-label block text-center font-semibold text-[var(--fl-text)] md:text-left"
            >
              {copy.auth.fullNameLabel}
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                onNameSync(val);
                setErrors((p) => ({
                  ...p,
                  name: val.trim() ? validateFullName(val, language) : undefined,
                }));
              }}
              onBlur={() =>
                setErrors((p) => ({ ...p, name: validateFullName(name, language) }))
              }
              placeholder="Alex Pratama"
              className="fl-input fl-type-body mt-1 !min-h-[38px] w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-1 text-[var(--fl-text)]"
            />
            <AnimatedErrorMessage message={errors.name} />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="fl-type-label block text-center font-semibold text-[var(--fl-text)] md:text-left"
            >
              {copy.auth.emailLabel}
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                onEmailSync(val);
                setErrors((p) => ({
                  ...p,
                  email: val.trim()
                    ? validateEmailAddress(val, allAccountEmails, language)
                    : undefined,
                }));
              }}
              onBlur={() =>
                setErrors((p) => ({
                  ...p,
                  email: validateEmailAddress(email, allAccountEmails, language),
                }))
              }
              placeholder="student@university.edu"
              className="fl-input fl-type-body mt-1 !min-h-[38px] w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-1 text-[var(--fl-text)]"
            />
            <AnimatedErrorMessage message={errors.email} />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <label
                htmlFor="reg-password"
                className="fl-type-label block text-center font-semibold text-[var(--fl-text)] md:text-left"
              >
                {copy.auth.passwordLabel}
              </label>
              <div className="relative mt-1">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassword(val);
                    setErrors((p) => ({
                      ...p,
                      password: val ? validatePasswordRule(val, language) : undefined,
                      confirmPassword:
                        confirmPassword && confirmPassword !== val
                          ? language === 'id'
                            ? 'Konfirmasi kata sandi tidak cocok.'
                            : 'Passwords do not match.'
                          : undefined,
                    }));
                  }}
                  onBlur={() =>
                    setErrors((p) => ({
                      ...p,
                      password: validatePasswordRule(password, language),
                    }))
                  }
                  placeholder={
                    language === 'id'
                      ? 'Min 8 karakter + angka'
                      : 'Min 8 chars + digit'
                  }
                  className="fl-input fl-type-body !min-h-[38px] w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] py-1 pr-10 pl-3 text-[var(--fl-text)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="fl-btn absolute inset-y-0 right-0 flex items-center px-3 text-[var(--fl-muted)] hover:text-[var(--fl-text)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  )}
                </button>
              </div>
              <AnimatedErrorMessage message={errors.password} />
            </div>

            <div>
              <label
                htmlFor="reg-confirm"
                className="fl-type-label block text-center font-semibold text-[var(--fl-text)] md:text-left"
              >
                {copy.auth.confirmPasswordLabel}
              </label>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfirmPassword(val);
                  setErrors((p) => ({
                    ...p,
                    confirmPassword:
                      val && val !== password
                        ? language === 'id'
                          ? 'Konfirmasi kata sandi tidak cocok.'
                          : 'Passwords do not match.'
                        : undefined,
                  }));
                }}
                placeholder="••••••••"
                className="fl-input fl-type-body mt-1 !min-h-[38px] w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3 py-1 text-[var(--fl-text)]"
              />
              <AnimatedErrorMessage message={errors.confirmPassword} />
            </div>
          </div>

          <div className="space-y-1 pt-0.5 text-left">
            <label className="fl-type-label flex items-start gap-2 text-[var(--fl-text)]">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  setErrors((p) => ({ ...p, acceptedTerms: undefined }));
                }}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[var(--fl-border)] text-[#0F2557]"
              />
              <span className="text-[11px] leading-tight sm:text-xs">{copy.auth.termsLabel}</span>
            </label>
            <AnimatedErrorMessage
              message={errors.acceptedTerms}
              className="text-xs text-red-600 dark:text-red-400"
            />

            <label className="fl-type-label flex items-start gap-2 text-[var(--fl-text)]">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => {
                  setAcceptedPrivacy(e.target.checked);
                  setErrors((p) => ({ ...p, acceptedPrivacy: undefined }));
                }}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[var(--fl-border)] text-[#0F2557]"
              />
              <span className="text-[11px] leading-tight sm:text-xs">{copy.auth.privacyLabel}</span>
            </label>
            <AnimatedErrorMessage
              message={errors.acceptedPrivacy}
              className="text-xs text-red-600 dark:text-red-400"
            />

            <label className="fl-type-label flex items-start gap-2 text-[var(--fl-muted)]">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[var(--fl-border)] text-[#0F2557]"
              />
              <span className="text-[11px] leading-tight sm:text-xs">{copy.auth.marketingLabel}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-2">
        <button
          type="submit"
          disabled={!canSubmitConsent}
          className="fl-btn-auth !min-h-[44px] w-full disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="fl-lang">
            {submitting
              ? language === 'id'
                ? 'Menyimpan akun...'
                : 'Creating account...'
              : copy.auth.registerButton}
          </span>
          {!submitting && <ArrowRight className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
};

export const AuthSplitShell: React.FC<AuthSplitShellProps> = ({ mode }) => {
  const { language, copy } = useApp();
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();

  const initialDraft = getAuthDraft();
  const [sharedEmail, setSharedEmail] = useState(initialDraft.email);
  const [sharedName, setSharedName] = useState(initialDraft.name);

  const prevModeRef = useRef<AuthMode>(mode);
  const direction = getAuthModeDirection(prevModeRef.current, mode);

  useEffect(() => {
    prevModeRef.current = mode;
  }, [mode]);

  const handleEmailSync = (val: string) => {
    setSharedEmail(val);
    saveAuthDraft({ email: val });
  };

  const handleNameSync = (val: string) => {
    setSharedName(val);
    saveAuthDraft({ name: val });
  };

  const showcaseHeading =
    mode === 'login'
      ? language === 'id'
        ? 'Kembali ke ritme belajar tenang Anda'
        : 'Step back into calm, intentional study'
      : language === 'id'
      ? 'Bangun kebiasaan belajar terarah setiap hari'
      : 'Build steady focus habits with FocusLamp';

  const showcaseBody =
    mode === 'login'
      ? language === 'id'
        ? 'Sinkronkan sesi fokus, pencapaian, dan insight FocusMate AI langsung dari ruang kerja Anda.'
        : 'Sync focused study blocks, streak milestones, and FocusMate AI guidance in one workspace.'
      : language === 'id'
      ? 'Gabungkan timer tenang, dukungan dock ponsel, dan analitik belajar yang jujur sejak hari pertama.'
      : 'Pair calm countdown blocks, phone-dock focus discipline, and transparent progress tracking.';

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-clip bg-[var(--fl-bg)] text-[var(--fl-text)]">
      {/* Upper header: NO duplicate Login/Get Started buttons; Translate hidden on smartphones (< md) */}
      <PublicHeader showAuthControls={false} hideTranslateOnMobile compact />

      {/* Ambient Backdrop Field */}
      <div aria-hidden="true" className="fl-liquid-field pointer-events-none fixed inset-0 -z-10" />

      <main className="fl-auth-main relative mx-auto flex w-full max-w-[1040px] flex-1 flex-col items-center justify-center px-4 py-4 sm:px-6 md:min-h-0 md:py-3 lg:py-4">
        <div
          data-testid="auth-split-container"
          data-auth-mode={mode}
          className="fl-auth-card-frame grid w-full grid-cols-1 overflow-hidden rounded-[24px] border border-[var(--fl-border)]/90 bg-[var(--fl-surface)] shadow-[0_24px_60px_-18px_rgba(15,37,87,0.16)] md:grid-cols-12 md:rounded-[28px] lg:rounded-[32px] dark:shadow-[0_24px_64px_-18px_rgba(2,6,23,0.75)]"
        >
          {/* LEFT PANEL — VISUAL SHOWCASE */}
          <section className="fl-auth-showcase relative flex flex-col justify-between overflow-hidden p-5 text-center text-white sm:p-6 md:col-span-5 md:p-6 md:text-left lg:p-7">
            <div
              aria-hidden="true"
              className="fl-liquid-drift pointer-events-none absolute -right-14 -top-16 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.42)_0%,transparent_70%)] blur-2xl"
            />
            <div
              aria-hidden="true"
              className="fl-liquid-drift-slow pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.42)_0%,transparent_72%)] blur-2xl"
            />
            <div aria-hidden="true" className="fl-grain pointer-events-none absolute inset-0" />

            {/* Top Brand Row */}
            <div className="relative flex items-center justify-center md:justify-start">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/25 transition-opacity hover:opacity-90"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#102B7A]">
                  <LampDesk className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span data-lang-exempt="true" className="text-sm font-bold tracking-tight text-white">
                  FocusLamp
                </span>
              </Link>
            </div>

            {/* Artwork Showcase (compact on tablet/desktop to preserve one-screen bounds) */}
            <div className="fl-auth-artwork-wrap relative mx-auto my-2.5 hidden w-full max-w-[250px] lg:block">
              <AuthShowcaseArtwork mode={mode} />
            </div>

            {/* Promo Copy + Subtle Highlights */}
            <div className="relative mt-3 space-y-2 md:mt-4 lg:mt-0">
              <div className="min-h-[82px] sm:min-h-[86px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: FL_EASE_STANDARD }}
                  >
                    <h2 className="text-[19px] font-bold leading-snug tracking-[-0.015em] text-white lg:text-[21px]">
                      {showcaseHeading}
                    </h2>
                    <p className="fl-type-label mx-auto mt-1 max-w-md text-white/85 md:mx-0">
                      {showcaseBody}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="fl-auth-highlights hidden grid-cols-2 gap-2 pt-1 lg:grid">
                <div className="fl-glass-blue flex items-center gap-2 rounded-xl px-2.5 py-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#A7F3D0]" strokeWidth={1.7} aria-hidden="true" />
                  <span className="text-[11px] font-medium leading-tight text-white/95">
                    {language === 'id' ? 'Sesi Fokus Terjaga' : 'Calm Session Guard'}
                  </span>
                </div>
                <div className="fl-glass-blue flex items-center gap-2 rounded-xl px-2.5 py-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#FDE68A]" strokeWidth={1.7} aria-hidden="true" />
                  <span className="text-[11px] font-medium leading-tight text-white/95">
                    {language === 'id' ? '26 Tonggak Progres' : '26 Study Milestones'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL — CLEAN FORM SURFACE (Top-anchored switcher so Login <-> Register never shifts vertically) */}
          <section className="fl-auth-form-panel flex flex-col justify-start bg-white p-6 sm:p-6 md:col-span-7 md:p-6 lg:p-7 dark:bg-[#131D33]">
            <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col md:h-full lg:max-w-[440px]">
              {/* Single Form-Level Mode Switcher Bar (Login <-> Register) */}
              <div
                role="tablist"
                data-testid="auth-form-switcher"
                aria-label={language === 'id' ? 'Pilih mode autentikasi' : 'Select authentication mode'}
                className="mb-4 grid shrink-0 grid-cols-2 gap-1 rounded-full border border-[var(--fl-border)] bg-[var(--fl-surface-subtle)] p-1"
              >
                {(['login', 'register'] as AuthMode[]).map((tabMode) => {
                  const active = mode === tabMode;
                  const targetPath = tabMode === 'login' ? '/login' : '/register';
                  return (
                    <button
                      key={tabMode}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        if (!active) navigate(targetPath);
                      }}
                      className={`fl-btn fl-type-label relative z-10 min-h-[38px] rounded-full px-2.5 py-1 font-semibold whitespace-nowrap sm:px-4 ${
                        active
                          ? 'text-[var(--fl-primary)]'
                          : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="fl-auth-mode-pill"
                          transition={
                            prefersReduced
                              ? { duration: 0 }
                              : { duration: 0.24, ease: FL_EASE_STANDARD }
                          }
                          className="absolute inset-0 -z-10 rounded-full bg-[var(--fl-surface)] shadow-xs"
                          aria-hidden="true"
                        />
                      )}
                      <span className="fl-lang">
                        {tabMode === 'login' ? copy.auth.loginButton : copy.auth.registerButton}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Animated Form Container (smooth crossfade + subtle vertical motion between Login & Register) */}
              <div className="relative w-full md:flex-1 md:min-h-0">
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  {mode === 'login' ? (
                    <motion.div
                      key="auth-login-panel"
                      custom={direction}
                      variants={prefersReduced ? undefined : authFormSlideVariants}
                      initial={prefersReduced ? false : 'initial'}
                      animate="animate"
                      exit="exit"
                      className="w-full md:h-full"
                    >
                      <LoginFormPanel
                        sharedEmail={sharedEmail}
                        onEmailSync={handleEmailSync}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="auth-register-panel"
                      custom={direction}
                      variants={prefersReduced ? undefined : authFormSlideVariants}
                      initial={prefersReduced ? false : 'initial'}
                      animate="animate"
                      exit="exit"
                      className="w-full md:h-full"
                    >
                      <RegisterFormPanel
                        sharedEmail={sharedEmail}
                        sharedName={sharedName}
                        onEmailSync={handleEmailSync}
                        onNameSync={handleNameSync}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
