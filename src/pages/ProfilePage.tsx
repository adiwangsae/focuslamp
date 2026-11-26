import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Award,
  Bell,
  ChevronDown,
  Edit3,
  Flame,
  LogOut,
  MailCheck,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AnimatedCollapse,
  AnimatedErrorMessage,
  AnimatedNumber,
  AnimatedSwitch,
  StaggerGrid,
  StaggerItem,
} from '../components/motion/MotionPrimitives';
import { StatusBadge } from '../components/common/StatePrimitives';
import { AchievementCatalogSection } from '../components/profile/AchievementCatalogSection';
import { DEMO_MODE_ENABLED, isDemoAccount } from '../config/demoConfig';
import { useApp } from '../contexts/AppContext';
import { Language, NotificationRetention, ThemeMode } from '../types';
import { FL_EASE_STANDARD, tabContentVariants } from '../utils/motion';
import { validateEmailAddress, validateFullName } from '../utils/validation';

type ProfileTab = 'account' | 'achievements';

const LIFT_TOLERANCE_OPTIONS = [5, 10, 15, 20, 30];

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    allAccountEmails,
    copy,
    language,
    selectedLanguage,
    theme,
    updatePreferences,
    updateProfileInfo,
    resetDemoData,
    logout,
    achievements,
    streakInfo,
    totalXp,
    levelInfo,
    showToast,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const prefersReduced = useReducedMotion();

  const initialTab: ProfileTab =
    searchParams.get('tab') === 'achievements' ? 'achievements' : 'account';
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [notificationsOpen, setNotificationsOpen] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name ?? '');
  const [editMajor, setEditMajor] = useState(currentUser?.major ?? '');
  const [editEmail, setEditEmail] = useState(currentUser?.email ?? '');
  const [editError, setEditError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const paramTab = searchParams.get('tab');
    setActiveTab(paramTab === 'achievements' ? 'achievements' : 'account');
  }, [searchParams]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const isDemo = DEMO_MODE_ENABLED && isDemoAccount(currentUser);

  const handleTabSwitch = (nextTab: ProfileTab) => {
    setActiveTab(nextTab);
    if (nextTab === 'achievements') {
      setSearchParams({ tab: 'achievements' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleLogout = () => {
    navigate('/', { replace: true });
    window.setTimeout(() => {
      logout();
    }, 0);
  };

  const handleOpenEdit = () => {
    setEditName(currentUser?.name ?? '');
    setEditMajor(currentUser?.major ?? '');
    setEditEmail(currentUser?.email ?? '');
    setEditError('');
    setEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validateFullName(editName, language);
    if (nameErr) {
      setEditError(nameErr);
      return;
    }
    const otherEmails = allAccountEmails.filter(
      (em) => em.toLowerCase() !== (currentUser?.email ?? '').toLowerCase()
    );
    const emailErr = validateEmailAddress(editEmail, otherEmails, language);
    if (emailErr) {
      setEditError(emailErr);
      return;
    }

    const res = updateProfileInfo({
      name: editName,
      major: editMajor,
      email: editEmail,
    });
    if (!res.ok) {
      setEditError(res.error ?? 'Unable to update profile');
      return;
    }
    setEditError('');
    setEditingProfile(false);
    if (res.verificationToken) {
      showToast(
        'info',
        language === 'id'
          ? 'Permintaan ganti email dibuat. Buka Verifikasi Email untuk menyelesaikan.'
          : 'Email change verification requested. Open Email Verification to confirm.'
      );
    } else {
      showToast(
        'success',
        language === 'id' ? 'Profil berhasil diperbarui.' : 'Profile information updated.'
      );
    }
  };

  const achievementsTabTitle = language === 'id' ? 'Pencapaian' : 'Achievements';
  const accountTabTitle = language === 'id' ? 'Akun & Pengaturan' : 'Account & Settings';

  return (
    <StaggerGrid className="space-y-6">
      {/* Page Header (No Logout button here) */}
      <StaggerItem className="text-center lg:text-left">
        <h1 className="fl-type-page">{copy.profile.title}</h1>
        <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
          {isDemo
            ? copy.profile.subtitle
            : language === 'id'
            ? 'Kelola informasi akun, preferensi belajar, notifikasi, dan 26 pencapaian.'
            : 'Manage your account details, study preferences, notifications, and 26 achievements.'}
        </p>
      </StaggerItem>

      {/* Controlled Account Navigation Tabs (fits safely down to 320px without overflow) */}
      <StaggerItem className="flex justify-center lg:justify-start">
        <div
          role="tablist"
          aria-label={language === 'id' ? 'Bagian Profil' : 'Profile sections'}
          className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-[var(--fl-border)] bg-[var(--fl-surface-subtle)] p-1 sm:rounded-full"
        >
          {(
            [
              {
                id: 'account' as ProfileTab,
                icon: SlidersHorizontal,
                label: accountTabTitle,
              },
              {
                id: 'achievements' as ProfileTab,
                icon: Award,
                label: `${achievementsTabTitle} · ${unlockedCount}/${achievements.length}`,
              },
            ]
          ).map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`profile-tab-${tab.id}`}
                onClick={() => handleTabSwitch(tab.id)}
                className={`fl-btn fl-type-label relative z-10 inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold whitespace-nowrap ${
                  active
                    ? 'text-[var(--fl-primary)]'
                    : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="fl-profile-section-tab"
                    transition={
                      prefersReduced
                        ? { duration: 0 }
                        : { duration: 0.22, ease: FL_EASE_STANDARD }
                    }
                    className="absolute inset-0 -z-10 rounded-full bg-[var(--fl-surface)] shadow-xs"
                    aria-hidden="true"
                  />
                )}
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                <span className="fl-lang">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </StaggerItem>

      {/* Active Tab Content */}
      <AnimatePresence mode="wait" initial={false}>
        {activeTab === 'account' ? (
          <motion.div
            key="profile-account-tab"
            variants={prefersReduced ? undefined : tabContentVariants}
            initial={prefersReduced ? false : 'initial'}
            animate="animate"
            exit="exit"
            className="space-y-5"
          >
            {/* Study & Display Preferences */}
            <section className="fl-card rounded-3xl p-5 text-center sm:p-6 lg:text-left">
              <h2 className="fl-type-card">{copy.profile.preferencesSection}</h2>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Language Switcher */}
                <div className="min-w-0">
                  <label className="fl-type-label block font-semibold text-[var(--fl-muted)]">
                    {copy.profile.languageLabel}
                  </label>
                  <div
                    data-lang-exempt="true"
                    className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-[var(--fl-surface-subtle)] p-1"
                  >
                    {(['en', 'id'] as Language[]).map((lng) => {
                      const active = selectedLanguage === lng;
                      return (
                        <button
                          key={lng}
                          type="button"
                          onClick={() => updatePreferences({ language: lng })}
                          aria-pressed={active}
                          className={`fl-btn fl-type-label relative z-10 min-h-[36px] rounded-full px-3 py-1.5 font-semibold ${
                            active
                              ? 'text-[var(--fl-primary)]'
                              : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="fl-profile-lang-pill"
                              transition={{ duration: 0.2, ease: FL_EASE_STANDARD }}
                              className="absolute inset-0 -z-10 rounded-full bg-[var(--fl-surface)] shadow-xs"
                              aria-hidden="true"
                            />
                          )}
                          {lng === 'en' ? 'English' : 'Indonesia'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Switcher */}
                <div className="min-w-0">
                  <label className="fl-type-label block font-semibold text-[var(--fl-muted)]">
                    {copy.profile.themeLabel}
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-[var(--fl-surface-subtle)] p-1">
                    {(['light', 'dark'] as ThemeMode[]).map((mode) => {
                      const active = theme === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => updatePreferences({ theme: mode })}
                          className={`fl-btn fl-type-label relative z-10 min-h-[36px] rounded-full px-3 py-1.5 font-semibold ${
                            active
                              ? 'text-[var(--fl-primary)]'
                              : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="fl-profile-theme-pill"
                              transition={{ duration: 0.2, ease: FL_EASE_STANDARD }}
                              className="absolute inset-0 -z-10 rounded-full bg-[var(--fl-surface)] shadow-xs"
                              aria-hidden="true"
                            />
                          )}
                          <span className="fl-lang">
                            {mode === 'light' ? copy.profile.light : copy.profile.dark}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Default Focus Duration */}
                <div className="min-w-0">
                  <label
                    htmlFor="pref-duration"
                    className="fl-type-label block break-words font-semibold text-[var(--fl-muted)]"
                  >
                    {copy.profile.defaultDurationLabel}
                  </label>
                  <select
                    id="pref-duration"
                    value={currentUser?.preferences.defaultFocusMinutes ?? 25}
                    onChange={(e) =>
                      updatePreferences({ defaultFocusMinutes: Number(e.target.value) })
                    }
                    className="fl-input fl-type-body mt-2 !min-h-[44px] w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2 text-[var(--fl-text)]"
                  >
                    {[15, 25, 30, 45, 60].map((m) => (
                      <option key={m} value={m}>
                        {m} {language === 'id' ? 'menit' : 'minutes'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Daily Target */}
                <div className="min-w-0">
                  <label
                    htmlFor="pref-target"
                    className="fl-type-label block break-words font-semibold text-[var(--fl-muted)]"
                  >
                    {copy.profile.dailyTargetLabel}
                  </label>
                  <select
                    id="pref-target"
                    value={currentUser?.preferences.dailyTargetMinutes ?? 60}
                    onChange={(e) =>
                      updatePreferences({ dailyTargetMinutes: Number(e.target.value) })
                    }
                    className="fl-input fl-type-body mt-2 !min-h-[44px] w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2 text-[var(--fl-text)]"
                  >
                    {[30, 45, 60, 90, 120].map((m) => (
                      <option key={m} value={m}>
                        {m} {language === 'id' ? 'menit / hari' : 'minutes / day'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Collapsible Notifications & Sensor Preferences (overflow-safe wrapping on < 360px) */}
            <section className="fl-card overflow-hidden rounded-3xl">
              <button
                type="button"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((v) => !v)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--fl-surface-subtle)]/50 sm:px-6"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Bell
                    className="h-4 w-4 shrink-0 text-[var(--fl-primary)]"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <h2 className="fl-type-card min-w-0 break-words">
                    {copy.profile.notificationsSection}
                  </h2>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[var(--fl-muted)] transition-transform duration-200 ${
                    notificationsOpen ? 'rotate-180' : ''
                  }`}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </button>

              <AnimatedCollapse open={notificationsOpen}>
                <div className="space-y-3 border-t border-[var(--fl-border)]/70 p-4 sm:px-6 sm:pb-6">
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[var(--fl-surface-subtle)] px-3.5 py-3 text-left">
                      <label
                        htmlFor="pref-alerts-switch"
                        className="fl-type-support min-w-0 flex-1 break-words font-semibold leading-snug text-[var(--fl-text)]"
                      >
                        {language === 'id' ? 'Aktifkan Notifikasi' : 'Enable Alerts'}
                      </label>
                      <span className="shrink-0">
                        <AnimatedSwitch
                          id="pref-alerts-switch"
                          checked={currentUser?.preferences.notificationsEnabled ?? true}
                          onChange={(next) => updatePreferences({ notificationsEnabled: next })}
                          ariaLabel={language === 'id' ? 'Aktifkan Notifikasi' : 'Enable Alerts'}
                        />
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[var(--fl-surface-subtle)] px-3.5 py-3 text-left">
                      <label
                        htmlFor="pref-reminders-switch"
                        className="fl-type-support min-w-0 flex-1 break-words font-semibold leading-snug text-[var(--fl-text)]"
                      >
                        {language === 'id' ? 'Pengingat Belajar' : 'Study Reminders'}
                      </label>
                      <span className="shrink-0">
                        <AnimatedSwitch
                          id="pref-reminders-switch"
                          checked={currentUser?.preferences.studyRemindersEnabled ?? true}
                          onChange={(next) => updatePreferences({ studyRemindersEnabled: next })}
                          ariaLabel={language === 'id' ? 'Pengingat Belajar' : 'Study Reminders'}
                        />
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[var(--fl-surface-subtle)] px-3.5 py-3 text-left">
                      <label
                        htmlFor="pref-sound-switch"
                        className="fl-type-support min-w-0 flex-1 break-words font-semibold leading-snug text-[var(--fl-text)]"
                      >
                        {language === 'id' ? 'Isyarat Suara' : 'Sound Cues'}
                      </label>
                      <span className="shrink-0">
                        <AnimatedSwitch
                          id="pref-sound-switch"
                          checked={currentUser?.preferences.soundCuesEnabled ?? true}
                          onChange={(next) => updatePreferences({ soundCuesEnabled: next })}
                          ariaLabel={language === 'id' ? 'Isyarat Suara' : 'Sound Cues'}
                        />
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div className="flex min-w-0 flex-col items-center justify-between gap-2.5 rounded-xl bg-[var(--fl-surface-subtle)] px-3.5 py-3 text-center lg:flex-row lg:text-left">
                      <span className="fl-type-support min-w-0 break-words text-[var(--fl-muted)]">
                        {copy.profile.retentionLabel}
                      </span>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {(['3d', '1w', '1m'] as NotificationRetention[]).map((ret) => (
                          <button
                            key={ret}
                            type="button"
                            onClick={() => updatePreferences({ notificationRetention: ret })}
                            className={`fl-btn fl-type-label rounded-full px-3 py-1 font-semibold whitespace-nowrap ${
                              currentUser?.preferences.notificationRetention === ret
                                ? 'bg-[#0F2557] text-white dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                                : 'bg-[var(--fl-surface)] text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                            }`}
                          >
                            <span className="fl-lang">
                              {ret === '3d'
                                ? language === 'id'
                                  ? '3 hari'
                                  : '3d'
                                : ret === '1w'
                                ? language === 'id'
                                  ? '1 mgg'
                                  : '1w'
                                : language === 'id'
                                ? '1 bln'
                                : '1m'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col items-center justify-between gap-2.5 rounded-xl bg-[var(--fl-surface-subtle)] px-3.5 py-3 text-center lg:flex-row lg:text-left">
                      <label
                        htmlFor="pref-lift-tolerance"
                        className="fl-type-support min-w-0 break-words text-[var(--fl-muted)]"
                      >
                        {language === 'id' ? 'Toleransi Angkat Ponsel' : 'Phone Lift Grace'}
                      </label>
                      <select
                        id="pref-lift-tolerance"
                        value={currentUser?.preferences.phoneLiftToleranceSeconds ?? 10}
                        onChange={(e) =>
                          updatePreferences({ phoneLiftToleranceSeconds: Number(e.target.value) })
                        }
                        className="fl-input fl-type-label !min-h-[36px] shrink-0 border border-[var(--fl-border)] bg-[var(--fl-surface)] px-3 py-1 tabular-nums text-[var(--fl-text)]"
                      >
                        {LIFT_TOLERANCE_OPTIONS.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}s
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </AnimatedCollapse>
            </section>

            {/* Standalone Refined Logout Action — Immediately Above Account Information */}
            <div
              data-testid="profile-logout-row"
              className="flex justify-center pt-1 lg:justify-end"
            >
              <button
                type="button"
                data-testid="profile-logout-button"
                onClick={handleLogout}
                className="fl-btn fl-type-btn inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-red-200/90 bg-red-50/75 px-6 text-red-700 hover:border-red-300 hover:bg-red-100/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 sm:w-auto dark:border-red-900/60 dark:bg-red-950/35 dark:text-red-300 dark:hover:bg-red-950/55"
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                <span className="fl-lang">{copy.profile.logout}</span>
              </button>
            </div>

            {/* Lower Account Information Card ("Informasi Akun" / "Account Information") */}
            <section
              data-testid="account-info-section"
              className="fl-card-elevated rounded-3xl p-5 sm:p-6"
            >
              <div className="mb-4 flex flex-col items-center justify-between gap-2 border-b border-[var(--fl-border)]/70 pb-3.5 text-center lg:flex-row lg:text-left">
                <h2 className="fl-type-card">{copy.profile.accountSection}</h2>
                {!editingProfile && (
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="fl-btn fl-type-label inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[var(--fl-border)] px-3.5 py-1.5 font-semibold text-[var(--fl-primary)] hover:bg-[var(--fl-soft-blue)]"
                  >
                    <Edit3 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    <span className="fl-lang">
                      {language === 'id' ? 'Edit Profil' : 'Edit Profile'}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center justify-between gap-5 text-center lg:flex-row lg:items-center lg:text-left">
                <div className="flex min-w-0 flex-col items-center gap-3.5 lg:flex-row lg:items-center">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      data-lang-exempt="true"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--fl-soft-blue)] text-[18px] font-bold text-[var(--fl-primary)] ring-1 ring-[var(--fl-primary)]/15"
                    >
                      {(currentUser?.name ?? 'FL')
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                      <h3 className="fl-type-card break-words">{currentUser?.name}</h3>
                      {isDemo ? (
                        <StatusBadge tone="primary">
                          {language === 'id' ? 'Akun Demo' : 'Demo Account'}
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="sage">
                          {language === 'id' ? 'Akun Terdaftar' : 'Registered Account'}
                        </StatusBadge>
                      )}
                    </div>
                    <p className="fl-type-support mt-0.5 break-words text-[var(--fl-muted)]">
                      {currentUser?.email}
                      {currentUser?.major ? ` · ${currentUser.major}` : ''}
                    </p>
                  </div>
                </div>

                {/* Inline Stat Summary Strip */}
                <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-[var(--fl-surface-subtle)] px-4 py-2.5 text-center lg:shrink-0">
                  <div>
                    <p className="fl-type-label text-[var(--fl-muted)]">Level & XP</p>
                    <p className="fl-type-support font-semibold tabular-nums">
                      L<AnimatedNumber value={levelInfo.level} /> ·{' '}
                      <AnimatedNumber value={totalXp} suffix=" XP" />
                    </p>
                  </div>
                  <div className="h-7 w-px bg-[var(--fl-border)]" aria-hidden="true" />
                  <div>
                    <p className="fl-type-label text-[var(--fl-muted)]">Streak</p>
                    <p className="fl-type-support inline-flex items-center gap-1 font-semibold tabular-nums">
                      <Flame
                        className="h-3.5 w-3.5 text-[#D99B38] dark:text-[#F5C26B]"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                      <span>
                        {streakInfo.currentStreak}
                        {language === 'id' ? 'h' : 'd'} / {streakInfo.longestStreak}
                        {language === 'id' ? 'h' : 'd'}
                      </span>
                    </p>
                  </div>
                  <div className="hidden h-7 w-px bg-[var(--fl-border)] sm:block" aria-hidden="true" />
                  <div className="hidden sm:block">
                    <p className="fl-type-label text-[var(--fl-muted)]">
                      {language === 'id' ? 'Pemulihan' : 'Recoveries'}
                    </p>
                    <p className="fl-type-support font-semibold tabular-nums">
                      {streakInfo.recoveriesRemaining}/3
                    </p>
                  </div>
                </div>
              </div>

              {isDemo && (!currentUser?.emailVerified || currentUser?.pendingEmail) && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                  <span className="inline-flex items-center gap-1.5">
                    <MailCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    {currentUser?.pendingEmail
                      ? language === 'id'
                        ? `Menunggu verifikasi: ${currentUser.pendingEmail}`
                        : `Pending verification: ${currentUser.pendingEmail}`
                      : language === 'id'
                      ? 'Email belum terverifikasi'
                      : 'Email verification pending'}
                  </span>
                  <Link
                    to="/verify-email"
                    className="font-semibold text-[var(--fl-primary)] hover:underline"
                  >
                    {language === 'id' ? 'Verifikasi' : 'Verify'}
                  </Link>
                </div>
              )}

              {/* Smooth Collapsible Inline Edit Profile Form */}
              <AnimatedCollapse open={editingProfile}>
                <form
                  onSubmit={handleSaveProfile}
                  className="mt-5 grid grid-cols-1 gap-3 border-t border-[var(--fl-border)]/70 pt-5 text-center lg:grid-cols-3 lg:text-left"
                >
                  <div>
                    <label
                      htmlFor="profile-edit-name"
                      className="fl-type-label block font-semibold text-[var(--fl-muted)]"
                    >
                      {copy.auth.fullNameLabel}
                    </label>
                    <input
                      id="profile-edit-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="fl-input fl-type-body mt-1 w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2 text-[var(--fl-text)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-edit-major"
                      className="fl-type-label block font-semibold text-[var(--fl-muted)]"
                    >
                      {language === 'id' ? 'Program Studi / Jurusan' : 'Major / Field of Study'}
                    </label>
                    <input
                      id="profile-edit-major"
                      type="text"
                      value={editMajor}
                      onChange={(e) => setEditMajor(e.target.value)}
                      className="fl-input fl-type-body mt-1 w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2 text-[var(--fl-text)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-edit-email"
                      className="fl-type-label block font-semibold text-[var(--fl-muted)]"
                    >
                      {copy.auth.emailLabel}
                    </label>
                    <input
                      id="profile-edit-email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="fl-input fl-type-body mt-1 w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2 text-[var(--fl-text)]"
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <AnimatedErrorMessage
                      message={editError}
                      className="fl-type-support font-semibold text-red-600 dark:text-red-400"
                    />
                  </div>

                  <div className="flex justify-center gap-2 lg:col-span-3 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="fl-btn-secondary !min-h-[38px] !px-4 !text-xs"
                    >
                      <span className="fl-lang">{language === 'id' ? 'Batal' : 'Cancel'}</span>
                    </button>
                    <button
                      type="submit"
                      className="fl-btn-primary !min-h-[38px] !px-4 !text-xs"
                    >
                      <span className="fl-lang">{language === 'id' ? 'Simpan' : 'Save'}</span>
                    </button>
                  </div>
                </form>
              </AnimatedCollapse>
            </section>

            {/* Demo & Prototype Notice (Demo accounts only) */}
            {isDemo && (
              <section
                data-testid="demo-security-reset-section"
                className="fl-card-soft flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--fl-primary)]/12 p-5 text-center lg:flex-row lg:text-left"
              >
                <div className="flex flex-col items-center gap-2.5 lg:flex-row lg:items-start lg:gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--fl-primary)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="fl-type-card">{copy.profile.securityTitle}</h2>
                    <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
                      {copy.profile.securityBody}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {confirmReset ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="fl-btn-secondary !min-h-[38px] !px-4 !text-xs"
                      >
                        <span className="fl-lang">{language === 'id' ? 'Batal' : 'Cancel'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resetDemoData();
                          setConfirmReset(false);
                        }}
                        className="fl-btn fl-type-label min-h-[38px] rounded-full bg-amber-600 px-4 py-1.5 font-semibold text-white hover:bg-amber-700"
                      >
                        <span className="fl-lang">
                          {language === 'id' ? 'Konfirmasi Reset' : 'Confirm Reset'}
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="fl-btn-secondary !min-h-[40px] !px-4 !text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      <span>{copy.profile.resetDemoData}</span>
                    </button>
                  )}
                </div>
              </section>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="profile-achievements-tab"
            variants={prefersReduced ? undefined : tabContentVariants}
            initial={prefersReduced ? false : 'initial'}
            animate="animate"
            exit="exit"
          >
            <AchievementCatalogSection
              achievements={achievements}
              language={language}
              title={achievementsTabTitle}
              isDemo={isDemo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerGrid>
  );
};

