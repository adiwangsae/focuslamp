import React, { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, ChevronRight, Cpu, Home, Play, Timer, Trophy, User } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { FL_EASE_STANDARD } from '../../utils/motion';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { FloatingFocusMate } from '../ai/FloatingFocusMate';
import { BrandLogoLink } from './BrandLogoLink';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { copy, language, activeSession, achievements, setAiReturnPath } = useApp();
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const isFullAiPage = location.pathname === '/ai';

  const isAchievementsView =
    location.pathname === '/profile' &&
    new URLSearchParams(location.search).get('tab') === 'achievements';

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  useEffect(() => {
    if (location.pathname !== '/ai') {
      setAiReturnPath(location.pathname);
    }
  }, [location.pathname, setAiReturnPath]);

  // Exact 5 primary navigation items in exact order:
  // 1. Focus, 2. Dashboard, 3. Home (emphasized), 4. Device, 5. Profile
  const navItems = [
    { to: '/focus', label: copy.nav.focus, icon: Timer, isHome: false },
    { to: '/dashboard', label: copy.nav.dashboard, icon: BarChart3, isHome: false },
    { to: '/home', label: copy.nav.home, icon: Home, isHome: true },
    { to: '/device', label: copy.nav.device, icon: Cpu, isHome: false },
    { to: '/profile', label: copy.nav.profile, icon: User, isHome: false },
  ];

  const activeNavIndex = navItems.findIndex((item) => location.pathname === item.to);

  const achievementsLabel = language === 'id' ? 'Pencapaian' : 'Achievements';

  const currentPageTitle =
    location.pathname === '/home'
      ? copy.nav.home
      : location.pathname === '/focus'
      ? copy.nav.focus
      : location.pathname === '/dashboard'
      ? copy.nav.dashboard
      : location.pathname === '/device'
      ? copy.nav.device
      : isAchievementsView
      ? achievementsLabel
      : location.pathname === '/profile'
      ? copy.nav.profile
      : location.pathname === '/ai'
      ? copy.ai.title
      : 'FocusLamp';

  return (
    <div
      className={
        isFullAiPage
          ? 'flex h-[100dvh] flex-col overflow-hidden bg-[var(--fl-bg)] text-[var(--fl-text)] pb-[7.25rem] lg:flex-row lg:pb-0'
          : 'min-h-screen bg-[var(--fl-bg)] text-[var(--fl-text)] pb-36 lg:flex lg:pb-24'
      }
    >
      {/* Desktop Minimalist Modern Sidebar (lg and up: >= 1024px) */}
      <aside
        aria-label="Workspace Sidebar"
        className="hidden lg:flex lg:w-[248px] shrink-0 flex-col justify-between border-r border-[var(--fl-border)]/80 bg-[var(--fl-surface)] sticky top-0 h-[100dvh]"
      >
        <div className="flex flex-col px-4 pt-5 pb-4">
          <div className="px-2">
            <BrandLogoLink variant="app" />
          </div>

          <div className="mt-6">
            <p className="fl-type-overline px-3 text-[var(--fl-muted)]">
              {language === 'id' ? 'Navigasi Utama' : 'Workspace'}
            </p>
            <nav aria-label="Main Application" className="mt-2.5 flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.to === '/profile'
                    ? location.pathname === '/profile' && !isAchievementsView
                    : location.pathname === item.to;

                if (item.isHome) {
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`fl-btn fl-type-nav relative flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2 transition-colors ${
                        active
                          ? 'bg-[#0F2557] font-semibold text-white shadow-xs dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                          : 'border border-[var(--fl-border)]/85 bg-[var(--fl-bg)] font-semibold text-[#0F2557] hover:bg-[var(--fl-soft-blue)] dark:text-[#8BA8FF]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className="h-[18px] w-[18px] shrink-0"
                          strokeWidth={active ? 2 : 1.65}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </span>
                    </NavLink>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`fl-btn fl-type-nav relative flex min-h-[42px] items-center justify-between rounded-xl px-3.5 py-2 transition-colors ${
                      active
                        ? 'font-semibold text-[#0F2557] dark:text-[#8BA8FF]'
                        : 'text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)]/55 hover:text-[var(--fl-text)]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="fl-desktop-nav-active"
                        transition={{ duration: 0.2, ease: FL_EASE_STANDARD }}
                        className="absolute inset-0 -z-10 rounded-xl bg-[var(--fl-soft-blue)]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className="h-[18px] w-[18px] shrink-0"
                        strokeWidth={active ? 2 : 1.55}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </span>
                    {item.to === '/focus' && activeSession && (
                      <span
                        data-lang-exempt="true"
                        className="rounded-full bg-[#4B735C] px-2 py-0.5 text-[10px] font-semibold tracking-wide leading-[1.2] text-white dark:bg-[#7FB395] dark:text-[#0D1424]"
                      >
                        LIVE
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Repurposed Bottom Sidebar Slot -> Dedicated Achievements Access */}
        <div className="border-t border-[var(--fl-border)]/75 p-3.5">
          <Link
            to="/profile?tab=achievements"
            data-testid="desktop-nav-achievements"
            aria-current={isAchievementsView ? 'page' : undefined}
            className={`fl-btn group flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-colors ${
              isAchievementsView
                ? 'border-[var(--fl-sage-border)] bg-[var(--fl-sage-soft)] text-[var(--fl-text)]'
                : 'border-[var(--fl-border)]/80 bg-[var(--fl-bg)] hover:border-[var(--fl-primary)]/30 hover:bg-[var(--fl-soft-blue)]/65'
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isAchievementsView
                  ? 'bg-[var(--fl-surface)] text-[var(--fl-sage)] shadow-xs'
                  : 'bg-[var(--fl-olive-soft)] text-[var(--fl-olive)]'
              }`}
            >
              <Trophy className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="fl-type-support truncate font-semibold text-[var(--fl-text)]">
                <span className="fl-lang">{achievementsLabel}</span>
              </p>
              <p className="fl-type-label truncate text-[var(--fl-muted)] tabular-nums">
                {unlockedCount} / {achievements.length}{' '}
                <span className="fl-lang">{language === 'id' ? 'terbuka' : 'unlocked'}</span>
              </p>
            </div>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-[var(--fl-muted)] transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </Link>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Tablet & Mobile Compact Header (< lg, 56px) — NO duplicate Profile link */}
        <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--fl-border)]/75 bg-white/90 backdrop-blur-md transition-colors duration-200 lg:hidden dark:bg-[#0D162B]/90">
          <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between gap-2 px-4 sm:px-6">
            <BrandLogoLink variant="app" />

            <div className="flex items-center gap-2 shrink-0">
              {/* Dedicated Tablet Achievement link (repurposing removed top-right Profile icon on Tablet md..lg) */}
              <Link
                to="/profile?tab=achievements"
                data-testid="tablet-nav-achievements"
                aria-label={achievementsLabel}
                aria-current={isAchievementsView ? 'page' : undefined}
                className={`fl-btn fl-type-label hidden h-9 items-center gap-1.5 rounded-full border px-3 font-semibold transition-colors md:inline-flex ${
                  isAchievementsView
                    ? 'border-[var(--fl-sage-border)] bg-[var(--fl-sage-soft)] text-[var(--fl-sage)]'
                    : 'border-[var(--fl-border)] bg-[var(--fl-surface)] text-[var(--fl-text)] hover:bg-[var(--fl-soft-blue)]'
                }`}
              >
                <Trophy className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                <span className="fl-lang">{achievementsLabel}</span>
                <span className="tabular-nums opacity-75">
                  {unlockedCount}/{achievements.length}
                </span>
              </Link>
              <NotificationCenter />
            </div>
          </div>
        </header>

        {/* Slim Desktop Workspace Utility Bar (lg and up) */}
        <header className="sticky top-0 z-30 hidden h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--fl-border)]/70 bg-white/88 px-8 backdrop-blur-md lg:flex dark:bg-[#0B1222]/88">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="fl-lang fl-type-nav truncate font-semibold text-[var(--fl-text)]">
              {currentPageTitle}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {location.pathname !== '/focus' && (
              <Link
                to="/focus"
                className="fl-btn fl-type-label inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--fl-sage-border)] bg-[var(--fl-sage-soft)] px-3.5 font-semibold text-[var(--fl-sage)] hover:brightness-95 whitespace-nowrap"
              >
                <Play className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>{activeSession ? copy.home.resumeSession : copy.home.startSession}</span>
              </Link>
            )}
            <NotificationCenter />
          </div>
        </header>

        {/* Main Content */}
        <main
          className={
            isFullAiPage
              ? 'mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3 lg:w-[min(100%-48px,1160px)] lg:px-0 lg:py-5'
              : 'mx-auto w-full max-w-[580px] px-4 py-6 sm:px-6 lg:max-w-6xl lg:px-8 lg:py-8'
          }
        >
          {children}
        </main>
      </div>

      {/* Magic Floating Bottom Navigation (Smartphone & Tablet < lg) — Nearly-opaque readable surface */}
      <nav
        aria-label="Mobile Primary"
        data-testid="mobile-bottom-nav"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-[420px] lg:hidden"
      >
        <div className="fl-bottom-nav relative h-[64px] rounded-[28px] px-1.5">
          {/* Gliding Magic Active Indicator Circle */}
          {activeNavIndex !== -1 && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-1.5 inset-y-0"
            >
              <motion.div
                initial={false}
                animate={{ left: `${activeNavIndex * 20 + 10}%` }}
                transition={
                  prefersReduced
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 420, damping: 32, mass: 0.85 }
                }
                style={{ transform: 'translateX(-50%)' }}
                className="absolute -top-[21px] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[var(--fl-bg)] p-[4px] shadow-[0_-2px_10px_rgba(15,37,87,0.06)] ring-1 ring-[var(--fl-border)]/80 dark:shadow-[0_-2px_12px_rgba(2,6,23,0.45)]"
              >
                <div className="h-full w-full rounded-full bg-gradient-to-br from-[#2454FF] via-[#1B42CC] to-[#0F2557] shadow-[0_10px_24px_rgba(36,84,255,0.44)] ring-1 ring-white/40 dark:from-[#8BA8FF] dark:via-[#5D87FF] dark:to-[#2954D6] dark:shadow-[0_10px_24px_rgba(93,135,255,0.36)] dark:ring-white/30" />
              </motion.div>
            </div>
          )}

          {/* 5 Equal Navigation Slots */}
          <div className="relative z-10 grid h-full grid-cols-5 items-stretch">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex h-full min-w-[44px] flex-col items-center justify-end rounded-2xl px-1 pb-[8px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-electric)] ${
                    active
                      ? 'text-[#1B42CC] dark:text-[#8BA8FF]'
                      : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                  }`}
                >
                  <motion.span
                    initial={false}
                    animate={
                      active
                        ? { y: -21, scale: 1.12 }
                        : { y: 0, scale: 1 }
                    }
                    transition={
                      prefersReduced
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 440, damping: 30 }
                    }
                    className={`relative flex h-6 w-6 items-center justify-center transition-colors duration-150 ${
                      active ? 'text-white dark:text-[#0B1222]' : ''
                    }`}
                  >
                    <Icon
                      className="h-[19px] w-[19px]"
                      strokeWidth={active ? 2 : 1.65}
                      aria-hidden="true"
                    />
                    {item.to === '/focus' && activeSession && !active && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 top-0 h-1.5 w-1.5 rounded-full bg-[#4B735C] ring-2 ring-[var(--fl-surface)] dark:bg-[#7FB395]"
                      />
                    )}
                  </motion.span>
                  <span
                    className={`mt-1 text-[11px] leading-none whitespace-nowrap transition-colors duration-150 ${
                      active ? 'font-semibold' : 'font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Floating FocusMate AI Panel */}
      <FloatingFocusMate />
    </div>
  );
};
