import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Bot,
  CheckCircle2,
  Cpu,
  Flame,
  LampDesk,
  Play,
  Smartphone,
  Timer,
  WifiOff,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedNumber, StaggerGrid, StaggerItem } from '../components/motion/MotionPrimitives';
import { useApp } from '../contexts/AppContext';
import { toLocalDateString } from '../utils/gamification';
import { generateDeterministicInsights } from '../utils/analytics';
import { FL_EASE_STANDARD } from '../utils/motion';

function getTimeBasedGreeting(firstName: string, language: 'en' | 'id'): string {
  const hour = new Date().getHours();
  if (language === 'id') {
    const period = hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : 'malam';
    return firstName ? `Selamat ${period}, ${firstName}` : `Selamat ${period}`;
  }
  const period = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return firstName ? `${period}, ${firstName}` : period;
}

export const HomePage: React.FC = () => {
  const {
    currentUser,
    markWelcomeGreetingSeen,
    language,
    copy,
    device,
    activeSession,
    sessions,
    totalXp,
    levelInfo,
    streakInfo,
    achievements,
  } = useApp();

  const firstName = currentUser?.name?.trim().split(/\s+/)[0] ?? '';
  const isFirstHomeVisit = Boolean(currentUser && currentUser.welcomeGreetingSeen === false);

  useEffect(() => {
    if (!isFirstHomeVisit) return;
    return () => {
      markWelcomeGreetingSeen();
    };
  }, [isFirstHomeVisit, markWelcomeGreetingSeen]);

  const todayStr = toLocalDateString(new Date());
  const todaysSessions = sessions.filter((s) => s.date === todayStr);
  const todayMinutes = Math.round(
    todaysSessions.reduce((acc, s) => acc + s.actualFocusSeconds, 0) / 60
  );
  const todayCompletedCount = todaysSessions.filter((s) => s.status === 'Completed').length;
  const targetMinutes = currentUser?.preferences.dailyTargetMinutes ?? 60;
  const targetPercent = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));

  const latestInsights = generateDeterministicInsights(sessions);
  const topInsight = latestInsights[0] ?? null;

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const latestAchievement = unlockedAchievements[unlockedAchievements.length - 1] ?? null;

  const formattedDate = new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lastSyncFormatted = device.lastSyncAt
    ? new Date(device.lastSyncAt).toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const greeting = isFirstHomeVisit
    ? language === 'id'
      ? `Selamat datang, ${firstName}!`
      : `Welcome, ${firstName}!`
    : getTimeBasedGreeting(firstName, language);

  const welcomeSubtitle = isFirstHomeVisit
    ? language === 'id'
      ? 'Senang melihatmu di FocusLamp. Mari mulai membangun kebiasaan fokus yang lebih baik.'
      : "Glad to have you on FocusLamp. Let's build better focus habits together."
    : null;

  return (
    <StaggerGrid className="space-y-8">
      {/* Page Header */}
      <StaggerItem className="flex flex-col items-center justify-between gap-4 text-center lg:flex-row lg:items-end lg:text-left">
        <div>
          <p className="fl-type-overline text-[var(--fl-muted)]">
            {formattedDate}
          </p>
          <h1 className="fl-type-page mt-1 text-[var(--fl-text)]" data-testid="home-greeting-heading">
            {greeting}
          </h1>
          {welcomeSubtitle && (
            <p
              data-testid="home-welcome-subtitle"
              className="fl-type-support mt-1 text-[var(--fl-muted)]"
            >
              {welcomeSubtitle}
            </p>
          )}
        </div>
        <Link to="/focus" className="fl-btn-primary shrink-0">
          <Play className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>
            {activeSession ? copy.home.resumeSession : copy.home.startSession}
          </span>
        </Link>
      </StaggerItem>

      {/* Top Row: Dominant Deep Navy Progress Hero Card + Hardware Status Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <StaggerItem className="lg:col-span-7">
          <section className="fl-card-primary relative flex h-full flex-col justify-between overflow-hidden p-6 sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(93,135,255,0.34)_0%,transparent_70%)] blur-xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(127,179,149,0.22)_0%,transparent_70%)] blur-xl"
            />
            <div aria-hidden="true" className="fl-grain pointer-events-none absolute inset-0" />

            <div className="relative">
              <div className="flex flex-col items-center justify-between gap-2 text-center lg:flex-row lg:text-left">
                <h2 className="fl-type-card text-white">{copy.home.todaysProgressTitle}</h2>
                <span className="fl-glass-blue fl-lang fl-type-label rounded-full px-3 py-1 font-semibold text-white tabular-nums">
                  {todayMinutes} / {targetMinutes} {language === 'id' ? 'menit' : 'min'} ({targetPercent}%)
                </span>
              </div>

              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${targetPercent}%` }}
                  transition={{ duration: 0.45, ease: FL_EASE_STANDARD }}
                  className="h-full rounded-full bg-[#7FB395]"
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center lg:text-left">
                <div className="rounded-2xl bg-white/10 p-3.5">
                  <p className="fl-type-label text-white/75">
                    {copy.home.focusMinutes}
                  </p>
                  <p className="fl-type-stat mt-1 text-white">
                    <AnimatedNumber value={todayMinutes} suffix="m" />
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5">
                  <p className="fl-type-label text-white/75">
                    {copy.home.completedSessions}
                  </p>
                  <p className="fl-type-stat mt-1 text-white">
                    <AnimatedNumber value={todayCompletedCount} />
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5">
                  <p className="fl-type-label text-white/75">
                    {copy.home.dailyTarget}
                  </p>
                  <p className="fl-type-stat mt-1 text-white">
                    <AnimatedNumber value={targetMinutes} suffix="m" />
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-4 text-center lg:flex-row lg:text-left">
              <div className="flex items-center gap-2 fl-type-support text-white/85">
                <Timer className="h-4 w-4 text-[#7FB395]" strokeWidth={1.6} aria-hidden="true" />
                <span>
                  {activeSession
                    ? `${language === 'id' ? 'Sesi aktif' : 'Active session'}: ${activeSession.subjectTag}`
                    : `${language === 'id' ? 'Durasi default' : 'Default block'}: ${
                        currentUser?.preferences.defaultFocusMinutes ?? 25
                      } ${language === 'id' ? 'menit' : 'min'}`}
                </span>
              </div>
              <Link
                to="/focus"
                className="fl-btn fl-type-btn inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[#0F2557] hover:bg-[#EAF0FC] whitespace-nowrap"
              >
                <span>{activeSession ? copy.home.resumeSession : copy.home.startSession}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </StaggerItem>

        {/* Device Status Card */}
        <StaggerItem className="lg:col-span-5">
          <section
            data-testid="home-device-card"
            className="fl-card flex h-full flex-col justify-between p-6 sm:p-7"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--fl-soft-blue)] text-[var(--fl-primary)]">
                    <Cpu className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h2 className="fl-type-card truncate">
                    {!device.connected ? copy.home.deviceCardTitle : device.deviceName}
                  </h2>
                </div>
                <Link
                  to="/device"
                  className="fl-btn fl-type-nav shrink-0 rounded-full px-3 py-1 text-[var(--fl-primary)] hover:bg-[var(--fl-soft-blue)] whitespace-nowrap"
                >
                  <span className="fl-lang">
                    {!device.connected
                      ? language === 'id'
                        ? 'Hubungkan'
                        : 'Connect'
                      : language === 'id'
                      ? 'Kelola'
                      : 'Manage'}
                  </span>
                </Link>
              </div>

              {!device.connected ? (
                <div className="mt-5 space-y-3 text-center lg:text-left" data-testid="home-no-device-state">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--fl-surface-subtle)] px-3.5 py-1.5 fl-type-label font-medium text-[var(--fl-muted)]">
                    <WifiOff className="h-3.5 w-3.5 text-[var(--fl-muted)]" strokeWidth={1.5} aria-hidden="true" />
                    <span className="fl-lang">
                      {language === 'id' ? 'Belum ada perangkat terhubung' : 'No device connected'}
                    </span>
                  </div>
                  <p className="fl-type-support text-[var(--fl-muted)]">
                    {language === 'id'
                      ? 'Belum ada perangkat FocusLamp FL-01 yang dipasangkan ke akun Anda. Hubungkan perangkat fisik atau mulai Fokus dengan mode timer perangkat lunak.'
                      : 'No FocusLamp FL-01 hardware is paired to your account yet. Connect a physical device or run focus sessions in software timer mode.'}
                  </p>
                </div>
              ) : (
                <dl className="fl-type-support mt-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--fl-muted)]">
                      {copy.device.connectionLabel}
                    </dt>
                    <dd className="inline-flex items-center gap-1.5 font-semibold">
                      {device.connectionStatus === 'Connected' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-[var(--fl-sage)]" strokeWidth={1.6} aria-hidden="true" />
                          <span className="text-[var(--fl-sage)]">
                            {copy.common.connected}
                          </span>
                        </>
                      ) : device.connectionStatus === 'Connecting' ||
                        device.connectionStatus === 'Reconnecting' ? (
                        <>
                          <Cpu className="h-4 w-4 text-[var(--fl-primary)]" strokeWidth={1.5} aria-hidden="true" />
                          <span className="text-[var(--fl-primary)]">
                            {device.connectionStatus === 'Connecting'
                              ? copy.common.connecting
                              : copy.common.reconnecting}
                          </span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-4 w-4 text-red-600" strokeWidth={1.5} aria-hidden="true" />
                          <span className="text-red-700 dark:text-red-400">
                            {device.connectionStatus === 'Connection Failed'
                              ? copy.common.connectionFailed
                              : copy.common.disconnected}
                          </span>
                        </>
                      )}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--fl-muted)]">{copy.device.dockLabel}</dt>
                    <dd className="inline-flex items-center gap-1.5 font-semibold">
                      <Smartphone
                        className={`h-4 w-4 ${
                          device.phoneDocked ? 'text-[var(--fl-sage)]' : 'text-[#D99B38] dark:text-[#F5C26B]'
                        }`}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span>{device.phoneDocked ? copy.common.docked : copy.common.notDocked}</span>
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--fl-muted)]">{copy.device.lampLabel}</dt>
                    <dd className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
                      <LampDesk
                        className={`h-4 w-4 ${
                          device.lampOn ? 'text-[#D99B38] dark:text-[#F5C26B]' : 'text-[var(--fl-muted)]'
                        }`}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span>
                        {device.lampOn ? `${copy.common.on} · ${device.lampBrightness}%` : copy.common.off}
                      </span>
                    </dd>
                  </div>

                  {lastSyncFormatted && (
                    <div className="fl-type-label flex items-center justify-between border-t border-[var(--fl-border)]/70 pt-3 text-[var(--fl-muted)]">
                      <dt>
                        {language === 'id' ? 'Sinkronisasi terakhir' : 'Last sync'}
                      </dt>
                      <dd className="tabular-nums">{lastSyncFormatted}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>

            {!device.connected && (
              <div className="mt-5 border-t border-[var(--fl-border)]/70 pt-3.5 text-center lg:text-left">
                <Link
                  to="/device"
                  className="fl-btn fl-type-btn inline-flex items-center gap-1.5 text-[var(--fl-primary)] hover:underline"
                >
                  <span>{language === 'id' ? 'Pengaturan Perangkat' : 'Device Setup Guide'}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </div>
            )}
          </section>
        </StaggerItem>
      </div>

      {/* Middle Row: Gamification + Sage FocusMate AI Insight */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Gamification Card */}
        <StaggerItem className="lg:col-span-6">
          <section className="fl-card-elevated h-full p-6 sm:p-7">
            <div className="flex flex-col items-center justify-between gap-2 text-center lg:flex-row lg:text-left">
              <h2 className="fl-type-card">{copy.home.gamificationTitle}</h2>
              <Link
                to="/profile?tab=achievements"
                className="fl-btn fl-type-nav rounded-full px-2.5 py-1 text-[var(--fl-primary)] hover:bg-[var(--fl-soft-blue)] whitespace-nowrap"
              >
                <span className="fl-lang">
                  {unlockedAchievements.length}/{achievements.length}{' '}
                  {language === 'id' ? 'Pencapaian' : 'Achievements'}
                </span>
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center lg:text-left">
              <div className="rounded-xl bg-[var(--fl-surface-subtle)] p-3.5">
                <p className="fl-type-label text-[var(--fl-muted)]">
                  {copy.common.level}
                </p>
                <p className="fl-type-stat mt-1 text-[var(--fl-primary)]">
                  L<AnimatedNumber value={levelInfo.level} />
                </p>
              </div>
              <div className="rounded-xl bg-[var(--fl-surface-subtle)] p-3.5">
                <p className="fl-type-label text-[var(--fl-muted)]">XP</p>
                <p className="fl-type-stat mt-1">
                  <AnimatedNumber value={totalXp} />
                </p>
              </div>
              <div className="rounded-xl bg-[var(--fl-surface-subtle)] p-3.5">
                <p className="fl-type-label text-[var(--fl-muted)]">Streak</p>
                <p className="fl-type-stat mt-1 inline-flex items-center justify-center gap-1 lg:justify-start">
                  <Flame className="h-5 w-5 text-[var(--fl-sage)]" strokeWidth={1.6} aria-hidden="true" />
                  <AnimatedNumber
                    value={streakInfo.currentStreak}
                    suffix={language === 'id' ? 'h' : 'd'}
                  />
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="fl-type-support flex items-center justify-between text-[var(--fl-muted)]">
                <span>
                  {levelInfo.nextLevelThreshold
                    ? language === 'id'
                      ? `${levelInfo.xpToNextLevel} XP menuju Level ${levelInfo.level + 1}`
                      : `${levelInfo.xpToNextLevel} XP to Level ${levelInfo.level + 1}`
                    : language === 'id'
                    ? 'Level maksimum tercapai'
                    : 'Maximum level reached'}
                </span>
                <span className="font-semibold tabular-nums">{levelInfo.progressPercent}%</span>
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

            {latestAchievement && (
              <div className="fl-type-support mt-4 flex items-center justify-center gap-2.5 border-t border-[var(--fl-border)]/70 pt-3.5 text-center lg:justify-start lg:text-left">
                <Award className="h-4 w-4 shrink-0 text-[var(--fl-olive)]" strokeWidth={1.6} aria-hidden="true" />
                <span className="text-[var(--fl-muted)]">
                  {language === 'id' ? 'Terbaru terbuka' : 'Latest unlocked'}:{' '}
                  <strong className="font-semibold text-[var(--fl-text)]">
                    {language === 'id' ? latestAchievement.titleId : latestAchievement.titleEn}
                  </strong>
                </span>
              </div>
            )}
          </section>
        </StaggerItem>

        {/* FocusMate AI Concise Insight — Calm Sage Green Card */}
        <StaggerItem className="lg:col-span-6">
          <section className="fl-card-sage flex h-full flex-col justify-between p-6 sm:p-7">
            <div>
              <div className="flex flex-col items-center justify-between gap-2 text-center lg:flex-row lg:text-left">
                <div className="flex items-center justify-center gap-2.5 lg:justify-start">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--fl-surface)] text-[var(--fl-sage)]">
                    <Bot className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <h2 className="fl-type-card">{copy.home.aiInsightTitle}</h2>
                </div>
                {topInsight ? (
                  <span className="fl-lang fl-type-overline text-[var(--fl-sage)]">
                    {language === 'id' ? 'Deterministik' : 'Deterministic'}
                  </span>
                ) : (
                  <span className="fl-lang fl-type-label text-[var(--fl-muted)] tabular-nums">
                    {sessions.length}/3 {language === 'id' ? 'sesi' : 'sessions'}
                  </span>
                )}
              </div>

              {topInsight ? (
                <div className="mt-4 space-y-2 text-center lg:text-left">
                  <h3 className="fl-type-card text-[var(--fl-text)]">
                    {language === 'id' ? topInsight.titleId : topInsight.titleEn}
                  </h3>
                  <p className="fl-type-support text-[var(--fl-muted)]">
                    {language === 'id' ? topInsight.observedDataId : topInsight.observedDataEn}
                  </p>
                  <p className="fl-type-label pt-1 font-semibold text-[var(--fl-sage)]">
                    {language === 'id' ? topInsight.suggestedActionId : topInsight.suggestedActionEn}
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2 text-center lg:text-left">
                  <h3 className="fl-type-card text-[var(--fl-text)]">{copy.ai.insufficientTitle}</h3>
                  <p className="fl-type-support text-[var(--fl-muted)]">
                    {copy.ai.insufficientBody}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-[var(--fl-sage-border)] pt-3.5 text-center lg:text-left">
              <Link
                to="/ai"
                className="fl-btn fl-type-btn inline-flex items-center gap-1.5 text-[var(--fl-sage)] hover:underline"
              >
                <span>{copy.home.openAiPage}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </StaggerItem>
      </div>

      {/* Recent Activity */}
      <StaggerItem>
        <section className="fl-card p-6 sm:p-7">
          <div className="flex flex-col items-center justify-between gap-2 text-center lg:flex-row lg:text-left">
            <h2 className="fl-type-card">{copy.home.recentActivityTitle}</h2>
            <Link
              to="/dashboard"
              className="fl-btn fl-type-btn rounded-full px-3 py-1 text-[var(--fl-primary)] hover:bg-[var(--fl-soft-blue)] whitespace-nowrap"
            >
              <span className="fl-lang">{copy.home.viewAllAnalytics}</span>
            </Link>
          </div>

          {sessions.length === 0 ? (
            <p className="fl-type-support py-8 text-center text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Belum ada sesi fokus. Mulai sesi pertama Anda dari menu Fokus.'
                : 'No focus sessions yet. Start your first session from Focus.'}
            </p>
          ) : (
            <div className="mt-4 divide-y divide-[var(--fl-border)]/70">
              {sessions.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-left"
                >
                  <div>
                    <p className="fl-type-body font-semibold text-[var(--fl-text)]">
                      {s.subjectTag || (language === 'id' ? 'Belajar Umum' : 'General Study')}
                    </p>
                    <p className="fl-type-support text-[var(--fl-muted)] tabular-nums">
                      {s.date} · {s.startTime} · {Math.floor(s.actualFocusSeconds / 60)}m /{' '}
                      {s.plannedMinutes}m
                    </p>
                  </div>
                  <div className="fl-type-label flex items-center gap-4 tabular-nums">
                    <span
                      className={`fl-lang font-semibold ${
                        s.status === 'Completed'
                          ? 'text-[var(--fl-sage)]'
                          : s.status === 'Interrupted'
                          ? 'text-[#B87412] dark:text-[#F5C26B]'
                          : 'text-[var(--fl-muted)]'
                      }`}
                    >
                      {language === 'id'
                        ? s.status === 'Completed'
                          ? 'Selesai'
                          : s.status === 'Interrupted'
                          ? 'Terputus'
                          : s.status === 'Manually Ended'
                          ? 'Diakhiri Manual'
                          : 'Ditinggalkan'
                        : s.status}
                    </span>
                    <span className="rounded-full bg-[var(--fl-soft-blue)] px-2.5 py-0.5 font-semibold text-[var(--fl-primary)]">
                      +{s.xpEarned} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </StaggerItem>
    </StaggerGrid>
  );
};
