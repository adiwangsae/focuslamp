import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Wifi,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AnimatedErrorMessage,
  AnimatedNumber,
  StaggerGrid,
  StaggerItem,
} from '../components/motion/MotionPrimitives';
import { StatusBadge } from '../components/common/StatePrimitives';
import { useApp } from '../contexts/AppContext';
import { SessionStatus } from '../types';
import { FL_EASE_STANDARD } from '../utils/motion';

const PRESET_DURATIONS = [15, 25, 30, 45];

function formatMmSs(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const m = String(Math.floor(safe / 60)).padStart(2, '0');
  const s = String(safe % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export const FocusPage: React.FC = () => {
  const {
    currentUser,
    copy,
    language,
    device,
    activeSession,
    lastCompletedSession,
    startFocusSession,
    endFocusSessionManually,
    saveSessionReflection,
    clearLastCompletedSession,
    levelInfo,
  } = useApp();

  const navigate = useNavigate();

  const [plannedMinutes, setPlannedMinutes] = useState<number>(
    currentUser?.preferences.defaultFocusMinutes ?? 25
  );
  const [subjectTag, setSubjectTag] = useState('');
  const [setupError, setSetupError] = useState('');
  const [reflectionInput, setReflectionInput] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const hasActiveSession = Boolean(activeSession);
  const completedSessionId = lastCompletedSession?.id;

  useEffect(() => {
    if (hasActiveSession || completedSessionId) {
      const appScrollEl = document.querySelector<HTMLElement>('[data-app-scroll-container="true"]');
      if (appScrollEl) {
        appScrollEl.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }
  }, [hasActiveSession, completedSessionId]);

  const statusLabels: Record<SessionStatus, string> =
    language === 'id'
      ? {
          Completed: 'Selesai',
          'Manually Ended': 'Diakhiri Manual',
          Interrupted: 'Terputus',
          Abandoned: 'Ditinggalkan',
        }
      : {
          Completed: 'Completed',
          'Manually Ended': 'Manually Ended',
          Interrupted: 'Interrupted',
          Abandoned: 'Abandoned',
        };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (device.connected && !device.phoneDocked) {
      setSetupError(copy.focus.dockRequiredWarning);
      return;
    }
    if (plannedMinutes < 1 || plannedMinutes > 60) {
      setSetupError(copy.focus.durationRangeNote);
      return;
    }
    setSetupError('');
    setReflectionInput('');
    setReflectionSaved(false);
    startFocusSession(plannedMinutes, subjectTag);
  };

  // VIEW B: ACTIVE FOCUS SESSION
  if (activeSession) {
    const stateLabels: Record<typeof activeSession.state, { text: string; toneClass: string; stroke: string }> = {
      FOCUSING: {
        text: language === 'id' ? 'FOKUS AKTIF' : 'FOCUSING',
        toneClass: 'bg-[var(--fl-sage-soft)] text-[var(--fl-sage)]',
        stroke: 'var(--fl-sage)',
      },
      AWAY: {
        text: language === 'id' ? 'MENINGGALKAN MEJA (JEDA)' : 'AWAY (PAUSED)',
        toneClass: 'bg-[#FDF4E4] text-[#8F590A] dark:bg-amber-950/45 dark:text-[#F5C26B]',
        stroke: '#D97706',
      },
      PHONE_LIFTED: {
        text:
          language === 'id'
            ? `PONSEL DIANGKAT (${activeSession.liftCountdownSeconds ?? 0}s)`
            : `PHONE LIFTED (${activeSession.liftCountdownSeconds ?? 0}s)`,
        toneClass: 'bg-red-50 text-red-700 dark:bg-red-950/45 dark:text-red-300',
        stroke: '#DC2626',
      },
      RECONNECTING: {
        text: language === 'id' ? 'MENYAMBUNG ULANG BLE' : 'RECONNECTING',
        toneClass: 'bg-[var(--fl-soft-blue)] text-[var(--fl-primary)]',
        stroke: 'var(--fl-primary)',
      },
      CONNECTION_LOST: {
        text: language === 'id' ? 'KONEKSI TERPUTUS (SESI BERLANJUT)' : 'CONNECTION LOST',
        toneClass: 'bg-[#FDF4E4] text-[#8F590A] dark:bg-amber-950/45 dark:text-[#F5C26B]',
        stroke: '#D97706',
      },
    };

    const currentBadge = stateLabels[activeSession.state];
    const isFocusingCalm = activeSession.state === 'FOCUSING';

    const totalPlannedSeconds = Math.max(1, activeSession.plannedMinutes * 60);
    const progressRatio = Math.max(
      0,
      Math.min(1, (totalPlannedSeconds - activeSession.remainingSeconds) / totalPlannedSeconds)
    );
    const ringRadius = 104;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference * (1 - progressRatio);

    return (
      <StaggerGrid className="mx-auto max-w-3xl space-y-8">
        {/* Distraction-Minimized Active Session Interface with Calm Liquid Blue Atmosphere */}
        <StaggerItem>
          <section className="fl-panel relative overflow-hidden p-6 text-center sm:p-10">
            <div
              aria-hidden="true"
              className="fl-liquid-field pointer-events-none absolute inset-0 opacity-90"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(36,84,255,0.18)_0%,rgba(75,115,92,0.08)_46%,transparent_72%)] blur-xl dark:bg-[radial-gradient(circle,rgba(93,135,255,0.2)_0%,rgba(21,38,31,0.35)_52%,transparent_74%)]"
            />
            <div
              aria-hidden="true"
              className="fl-grain pointer-events-none absolute inset-0"
            />
            <div className="relative">
              <p className="fl-type-overline text-[var(--fl-muted)]">
                {activeSession.subjectTag} · {activeSession.plannedMinutes}{' '}
                {language === 'id' ? 'menit' : 'min block'}
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--fl-border)]/70 px-3.5 py-1 fl-type-label font-semibold backdrop-blur-sm transition-colors duration-200 ${currentBadge.toneClass}`}
                >
                  <span className="fl-lang">{currentBadge.text}</span>
                </span>
              </div>

              {/* Clean Circular SVG Progress Ring with Calm Soft Glow */}
              <div className="relative mx-auto mt-6 flex h-[244px] w-[244px] items-center justify-center">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(36,84,255,0.1)_0%,rgba(75,115,92,0.06)_52%,transparent_74%)] dark:bg-[radial-gradient(circle,rgba(93,135,255,0.16)_0%,transparent_74%)]"
                />
                <svg
                  viewBox="0 0 240 240"
                  className="relative h-full w-full -rotate-90 drop-shadow-[0_6px_18px_rgba(36,84,255,0.1)]"
                  aria-hidden="true"
                >
                  <circle
                    cx="120"
                    cy="120"
                    r={ringRadius}
                    fill="none"
                    stroke="var(--fl-soft-blue)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r={ringRadius}
                    fill="none"
                    stroke={currentBadge.stroke}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-[stroke-dashoffset,stroke] duration-300 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                  <div
                    data-testid="active-focus-timer"
                    data-lang-exempt="true"
                    className="fl-type-timer text-[var(--fl-text)]"
                  >
                    {formatMmSs(activeSession.remainingSeconds)}
                  </div>
                </div>
              </div>

              <div className="fl-type-support mt-5 flex flex-wrap items-center justify-center gap-6 text-[var(--fl-muted)] tabular-nums">
                <span className="fl-lang">
                  {copy.focus.actualFocusLabel}: {Math.floor(activeSession.actualFocusSeconds / 60)}m{' '}
                  {activeSession.actualFocusSeconds % 60}s
                </span>
                <span className="fl-lang">
                  {copy.focus.awayTimeLabel}: {Math.floor(activeSession.awaySeconds / 60)}m{' '}
                  {activeSession.awaySeconds % 60}s
                </span>
              </div>

              <AnimatePresence>
                {activeSession.state === 'PHONE_LIFTED' && (
                  <motion.div
                    key="phone-lifted-alert"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
                    className="fl-type-support mx-auto mt-5 max-w-md rounded-2xl border border-red-200 bg-red-50 p-3.5 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                  >
                    <span className="fl-lang">
                      {language === 'id'
                        ? `Ponsel terangkat dari dock. Kembalikan dalam ${activeSession.liftCountdownSeconds} detik atau sesi akan tercatat Interrupted.`
                        : `Phone lifted from dock. Return it within ${activeSession.liftCountdownSeconds}s or the session will end as Interrupted.`}
                    </span>
                  </motion.div>
                )}

                {activeSession.state === 'CONNECTION_LOST' && (
                  <motion.div
                    key="ble-lost-alert"
                    role="status"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
                    className="fl-type-support mx-auto mt-5 max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    <span className="fl-lang">
                      {language === 'id'
                        ? 'Koneksi Bluetooth terputus, namun sesi fokus tidak dihentikan secara otomatis.'
                        : 'Bluetooth connection lost. Your focus session continues safely without auto-termination.'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Telemetry or Software Mode Summary Row */}
              {!device.connected ? (
                <div
                  data-testid="active-software-mode-strip"
                  className="fl-type-support mt-7 grid grid-cols-2 gap-3 border-t border-[var(--fl-border)]/70 pt-6 text-center lg:text-left"
                >
                  <div className="rounded-2xl bg-[var(--fl-surface-subtle)] p-3.5">
                    <p className="fl-type-label text-[var(--fl-muted)]">
                      {language === 'id' ? 'Mode Sesi' : 'Session Mode'}
                    </p>
                    <p className="mt-1 font-semibold">
                      {language === 'id' ? 'Timer Perangkat Lunak' : 'Software Study Timer'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--fl-surface-subtle)] p-3.5">
                    <p className="fl-type-label text-[var(--fl-muted)]">
                      {language === 'id' ? 'Perangkat Keras' : 'Hardware'}
                    </p>
                    <p className="mt-1 font-semibold">
                      {language === 'id' ? 'Belum ada perangkat terhubung' : 'No device connected'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="fl-type-support mt-7 grid grid-cols-3 gap-3 border-t border-[var(--fl-border)]/70 pt-6 text-center lg:text-left">
                  <div className="rounded-2xl bg-[var(--fl-surface-subtle)] p-3.5">
                    <p className="fl-type-label text-[var(--fl-muted)]">
                      {copy.device.connectionLabel}
                    </p>
                    <p className="mt-1 font-semibold">
                      {activeSession.state === 'CONNECTION_LOST'
                        ? copy.common.disconnected
                        : activeSession.state === 'RECONNECTING'
                        ? language === 'id'
                          ? 'Menyambung ulang...'
                          : 'Reconnecting...'
                        : copy.common.connected}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--fl-surface-subtle)] p-3.5">
                    <p className="fl-type-label text-[var(--fl-muted)]">
                      {copy.device.dockLabel}
                    </p>
                    <p className="mt-1 font-semibold">
                      {device.phoneDocked ? copy.common.docked : copy.common.notDocked}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--fl-surface-subtle)] p-3.5">
                    <p className="fl-type-label text-[var(--fl-muted)]">
                      {copy.device.presenceLabel}
                    </p>
                    <p className="mt-1 font-semibold">
                      {device.userPresent ? copy.common.present : copy.common.away}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={endFocusSessionManually}
                  className={`fl-glass fl-btn fl-type-btn inline-flex min-h-[44px] items-center justify-center rounded-full px-6 text-[var(--fl-text)] hover:bg-[var(--fl-soft-blue)] transition-opacity duration-200 ${
                    isFocusingCalm ? 'opacity-85 hover:opacity-100' : ''
                  }`}
                >
                  <span className="fl-lang">{copy.focus.endSession}</span>
                </button>
              </div>
            </div>
          </section>
        </StaggerItem>

      </StaggerGrid>
    );
  }

  // VIEW C: SESSION RESULT
  if (lastCompletedSession) {
    const actualMins = Math.floor(lastCompletedSession.actualFocusSeconds / 60);
    const actualRemSecs = lastCompletedSession.actualFocusSeconds % 60;

    return (
      <StaggerGrid className="mx-auto max-w-xl space-y-6">
        <StaggerItem>
          <section className="fl-panel p-6 text-center sm:p-8 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--fl-sage-soft)] px-3 py-1 text-[var(--fl-sage)]">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
              <span className="fl-lang fl-type-label font-semibold uppercase">
                {statusLabels[lastCompletedSession.status]}
              </span>
            </div>

            <h1 className="fl-type-page mt-3">{copy.focus.resultTitle}</h1>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
              {lastCompletedSession.subjectTag ||
                (language === 'id' ? 'Belajar Umum' : 'General Study')}{' '}
              · {lastCompletedSession.date}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-center lg:text-left">
              <div className="rounded-2xl bg-[var(--fl-surface-subtle)] p-4">
                <p className="fl-type-label text-[var(--fl-muted)]">
                  {copy.focus.actualFocusLabel}
                </p>
                <p className="fl-type-stat mt-1">
                  {actualMins}m {actualRemSecs}s
                </p>
              </div>
              <div className="fl-card-sage p-4">
                <p className="fl-type-label text-[var(--fl-sage)]">
                  {copy.focus.xpEarnedLabel}
                </p>
                <p className="fl-type-stat mt-1 text-[var(--fl-sage)]">
                  +<AnimatedNumber value={lastCompletedSession.xpEarned} suffix=" XP" />
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="fl-type-support flex items-center justify-between text-[var(--fl-muted)]">
                <span>
                  {copy.common.level} {levelInfo.level}
                </span>
                <span className="font-semibold tabular-nums">
                  {levelInfo.currentXp} XP ({levelInfo.progressPercent}%)
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--fl-border)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progressPercent}%` }}
                  transition={{ duration: 0.45, ease: FL_EASE_STANDARD }}
                  className="h-full rounded-full bg-gradient-to-r from-[#0F2557] to-[#4B735C] dark:from-[#8BA8FF] dark:to-[#7FB395]"
                />
              </div>
            </div>

            {/* Optional Reflection */}
            <div className="mt-6 border-t border-[var(--fl-border)] pt-5">
              <label htmlFor="session-reflection" className="fl-type-support block text-center font-semibold lg:text-left">
                {copy.focus.reflectionLabel}
              </label>
              <textarea
                id="session-reflection"
                rows={3}
                value={reflectionInput}
                onChange={(e) => {
                  setReflectionInput(e.target.value);
                  setReflectionSaved(false);
                }}
                placeholder={copy.focus.reflectionPlaceholder}
                className="fl-input fl-type-body mt-2 w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] p-3.5 text-[var(--fl-text)]"
              />
              <div className="mt-2.5 flex flex-col items-center justify-between gap-2 lg:flex-row">
                <span className="fl-lang fl-type-support text-[var(--fl-sage)] font-medium">
                  {reflectionSaved
                    ? language === 'id'
                      ? 'Catatan refleksi tersimpan.'
                      : 'Reflection note saved.'
                    : ''}
                </span>
                <button
                  type="button"
                  disabled={!reflectionInput.trim()}
                  onClick={() => {
                    saveSessionReflection(lastCompletedSession.id, reflectionInput);
                    setReflectionSaved(true);
                  }}
                  className="fl-btn-secondary !min-h-[38px] !px-4 !text-xs disabled:opacity-45"
                >
                  <span className="fl-lang">{copy.focus.saveReflection}</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3 border-t border-[var(--fl-border)] pt-5 lg:justify-start">
              <button
                type="button"
                onClick={() => {
                  clearLastCompletedSession();
                  navigate('/home');
                }}
                className="fl-btn-primary"
              >
                <span className="fl-lang">{copy.focus.returnHome}</span>
              </button>
              <button
                type="button"
                onClick={clearLastCompletedSession}
                className="fl-btn-secondary"
              >
                <span className="fl-lang">{copy.focus.startAnother}</span>
              </button>
            </div>
          </section>
        </StaggerItem>
      </StaggerGrid>
    );
  }

  // VIEW A: FOCUS SETUP
  return (
    <StaggerGrid className="mx-auto max-w-3xl space-y-8">
      <StaggerItem className="flex flex-col items-center justify-between gap-3 text-center lg:flex-row lg:items-center lg:text-left">
        <div>
          <h1 className="fl-type-page">{copy.focus.setupTitle}</h1>
          <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
            {!device.connected
              ? language === 'id'
                ? 'Pilih durasi blok belajar dan topik opsional untuk memulai sesi fokus Anda.'
                : 'Choose a study block duration and an optional topic to start your focus session.'
              : copy.focus.setupSubtitle}
          </p>
        </div>
        {!device.connected ? (
          <StatusBadge tone="sage">
            {language === 'id' ? 'Timer Perangkat Lunak' : 'Software Timer'}
          </StatusBadge>
        ) : (
          <StatusBadge tone={device.phoneDocked ? 'sage' : 'warning'}>
            {device.phoneDocked ? copy.common.ready : copy.common.notDocked}
          </StatusBadge>
        )}
      </StaggerItem>

      <StaggerItem>
        <form
          onSubmit={handleStart}
          className="fl-panel relative overflow-hidden space-y-6 p-6 sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none -top-24 -right-24 absolute h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(36,84,255,0.1)_0%,transparent_72%)] blur-lg dark:bg-[radial-gradient(circle,rgba(93,135,255,0.14)_0%,transparent_72%)]"
          />
          {/* Duration Selector */}
          <div className="relative">
            <label className="fl-type-card block text-center lg:text-left">
              {copy.focus.durationLabel}
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PRESET_DURATIONS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPlannedMinutes(mins)}
                  className={`fl-btn fl-type-btn min-h-[46px] rounded-full border py-2.5 tabular-nums ${
                    plannedMinutes === mins
                      ? 'border-[#1B42CC] bg-gradient-to-br from-[#2454FF] via-[#1B42CC] to-[#0F2557] text-white shadow-[0_8px_20px_-6px_rgba(36,84,255,0.42)] dark:border-[#8BA8FF] dark:from-[#8BA8FF] dark:via-[#5D87FF] dark:to-[#2954D6] dark:text-[#0B1222]'
                      : 'border-[var(--fl-border)] bg-[var(--fl-bg)]/90 text-[var(--fl-text)] hover:bg-[var(--fl-soft-blue)]'
                  }`}
                >
                  <span className="fl-lang">
                    {mins} {language === 'id' ? 'menit' : 'min'}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center lg:justify-start lg:text-left">
              <label
                htmlFor="custom-duration"
                className="fl-type-label text-[var(--fl-muted)]"
              >
                {copy.focus.customDurationLabel}:
              </label>
              <input
                id="custom-duration"
                type="number"
                min={1}
                max={60}
                value={plannedMinutes}
                onChange={(e) => setPlannedMinutes(Number(e.target.value))}
                className="fl-input fl-type-body w-24 border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3 py-1.5 text-center text-[var(--fl-text)] tabular-nums lg:text-left"
              />
              <span className="fl-lang fl-type-support text-[var(--fl-muted)]">
                {copy.focus.durationRangeNote}
              </span>
            </div>
          </div>

          {/* Study Topic */}
          <div>
            <label htmlFor="study-subject" className="fl-type-card block text-center lg:text-left">
              {copy.focus.subjectLabel}
            </label>
            <input
              id="study-subject"
              type="text"
              value={subjectTag}
              onChange={(e) => setSubjectTag(e.target.value)}
              placeholder={copy.focus.subjectPlaceholder}
              className="fl-input fl-type-body mt-2 w-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2.5 text-[var(--fl-text)]"
            />
          </div>

          {/* Device Readiness or Software Timer Notice */}
          {!device.connected ? (
            <div
              data-testid="focus-software-mode-card"
              className="fl-card-sage p-4 text-center sm:p-5 lg:text-left"
            >
              <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
                <h2 className="fl-type-card">
                  {language === 'id' ? 'Timer Perangkat Lunak' : 'Software Study Timer'}
                </h2>
                <span className="fl-type-label text-[var(--fl-muted)]">
                  {language === 'id' ? 'Belum ada perangkat terhubung' : 'No device connected'}
                </span>
              </div>
              <p className="fl-type-support mt-2 text-[var(--fl-muted)]">
                {language === 'id'
                  ? 'Tidak ada perangkat FocusLamp FL-01 yang terhubung. Sesi Anda berjalan menggunakan timer belajar mandiri dan tersimpan langsung ke riwayat akun Anda.'
                  : 'No FocusLamp FL-01 hardware is connected. Your session runs as a standalone study timer and logs directly to your account history.'}
              </p>
            </div>
          ) : (
            <div className="fl-card-soft p-5 text-center sm:p-6 lg:text-left">
              <h2 className="fl-type-card">{copy.focus.deviceReadiness}</h2>
              <div className="fl-type-support mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <Wifi
                    className={`h-4 w-4 ${device.connected ? 'text-[var(--fl-sage)]' : 'text-[#D99B38]'}`}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <span>
                    {copy.device.connectionLabel}:{' '}
                    <strong className="font-semibold">
                      {device.connected ? copy.common.connected : copy.common.disconnected}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <Smartphone
                    className={`h-4 w-4 ${device.phoneDocked ? 'text-[var(--fl-sage)]' : 'text-red-600'}`}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <span>
                    {copy.device.dockLabel}:{' '}
                    <strong className="font-semibold">
                      {device.phoneDocked ? copy.common.docked : copy.common.notDocked}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <CheckCircle2 className="h-4 w-4 text-[var(--fl-primary)]" strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    {language === 'id' ? 'Mode Fokus DND: ' : 'DND Focus Mode: '}
                    <strong className="font-semibold">
                      {language === 'id' ? 'Siap saat mulai' : 'Ready on start'}
                    </strong>
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {!device.phoneDocked && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
                    className="fl-type-support mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-amber-900 lg:flex-row lg:text-left dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-start">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                      <span>{copy.focus.dockRequiredWarning}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <AnimatedErrorMessage
            message={setupError}
            className="fl-type-support text-center font-semibold text-red-600 lg:text-left dark:text-red-400"
          />

          <div className="flex items-center justify-center gap-3 lg:justify-end">
            <button
              type="submit"
              disabled={device.connected ? !device.phoneDocked : false}
              className="fl-btn-primary !min-h-[48px] !px-7 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span className="fl-lang">{copy.focus.startFocus}</span>
            </button>
          </div>
        </form>
      </StaggerItem>
    </StaggerGrid>
  );
};
