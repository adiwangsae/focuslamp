import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Bot, Cpu, LampDesk, ShieldCheck, Timer, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { PublicHeader } from '../components/navigation/PublicHeader';
import { StaggerGrid, StaggerItem, WordReveal } from '../components/motion/MotionPrimitives';
import { useApp } from '../contexts/AppContext';
import { FL_EASE_STANDARD } from '../utils/motion';

export const LandingPage: React.FC = () => {
  const { copy, language } = useApp();
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [dockImgFailed, setDockImgFailed] = useState(false);

  const features = [
    {
      num: '01',
      icon: Timer,
      title: language === 'id' ? 'Manajemen Sesi Fokus' : 'Focus Session Management',
      body:
        language === 'id'
          ? 'Blok belajar 15–45 menit yang dapat disesuaikan dengan deteksi kehadiran meja otomatis yang mengecualikan jeda dari catatan fokus aktual.'
          : 'Configurable 15–45 minute study blocks with automatic desk-presence awareness that excludes break or away time from your actual focus record.',
    },
    {
      num: '02',
      icon: Cpu,
      title: language === 'id' ? 'Integrasi Perangkat Pintar' : 'Smart Device Integration',
      body:
        language === 'id'
          ? 'Integrasi perangkat keras FocusLamp FL-01 memantau penempatan dock ponsel, cahaya sekitar, dan koneksi ulang Bluetooth yang tangguh tanpa menghentikan sesi aktif.'
          : 'FocusLamp FL-01 companion integration tracks phone dock placement, ambient light levels, and resilient Bluetooth reconnection without terminating active sessions.',
    },
    {
      num: '03',
      icon: BarChart3,
      title: language === 'id' ? 'Analitik Belajar' : 'Study Analytics',
      body:
        language === 'id'
          ? 'Tren durasi harian yang jelas, perbandingan mingguan dan bulanan, rasio penyelesaian, serta ekspor riwayat sesi ke CSV.'
          : 'Clear daily duration trends, weekly and monthly comparisons, completion rates, and CSV-exportable session logs.',
    },
    {
      num: '04',
      icon: Bot,
      title: 'FocusMate AI',
      body:
        language === 'id'
          ? 'Asisten belajar berbasis AI yang menganalisis riwayat sesi Anda, disertai fakta sains kognitif berbasis bukti dan rujukan DOI terverifikasi.'
          : 'AI study guidance grounded in your logged focus records, paired with evidence-based cognitive psychology facts and verified DOI references.',
    },
    {
      num: '05',
      icon: Trophy,
      title: language === 'id' ? 'Gamifikasi & Kebiasaan' : 'Gamification & Habits',
      body:
        language === 'id'
          ? 'Dapatkan XP transparan dari menit fokus aktual, pertahankan streak harian 5 menit dengan 3 pemulihan bulanan, dan buka 26 pencapaian belajar.'
          : 'Earn transparent XP from actual focus minutes, maintain 5-minute daily calendar streaks with 3 monthly recoveries, and unlock 26 study milestones.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: language === 'id' ? 'Letakkan ponsel di dock FocusLamp' : 'Place your phone on the FocusLamp dock',
      desc:
        language === 'id'
          ? 'Letakkan ponsel di bantalan dock dasar FL-01 sebagai tanda siap belajar dan mengurangi godaan visual.'
          : 'Settle your phone onto the FL-01 base pad to signal study readiness and reduce visual temptation.',
    },
    {
      step: '02',
      title: language === 'id' ? 'Mulai sesi fokus' : 'Start a focus session',
      desc:
        language === 'id'
          ? 'Pilih preset atau durasi blok kustom (1–60 menit) dan tentukan topik opsional.'
          : 'Pick a preset or custom study block (1–60 minutes) and set an optional topic.',
    },
    {
      step: '03',
      title: language === 'id' ? 'Belajar dengan minim distraksi' : 'Study with reduced distractions',
      desc:
        language === 'id'
          ? 'Penghitung waktu yang tenang melacak durasi duduk aktual sambil membisukan notifikasi lampu hingga selesai.'
          : 'A distraction-minimized timer tracks actual seated study time while muting lamp notifications until completion.',
    },
    {
      step: '04',
      title: language === 'id' ? 'Tinjau progres & wawasan' : 'Review progress and insights',
      desc:
        language === 'id'
          ? 'Periksa perolehan XP, pembaruan streak, catatan perilaku, dan observasi FocusMate AI.'
          : 'Inspect earned XP, streak updates, behavioral logs, and FocusMate AI observations.',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--fl-bg)] text-[var(--fl-text)]">
      <PublicHeader showLogin={false} primaryAction="login" />

      {/* 1. Hero Section — Abstract Liquid Ultramarine Composition + Editorial 2-Column Split */}
      <section className="fl-liquid-field relative overflow-hidden py-10 sm:py-14 lg:py-20">
        {/* Soft Diffused Ultramarine & Royal Blue Organic Blobs + Fine Grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 right-[-8%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(36,84,255,0.18)_0%,rgba(30,64,175,0.06)_52%,transparent_74%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(59,130,246,0.22)_0%,transparent_74%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-44 -left-28 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(16,43,122,0.12)_0%,rgba(233,242,236,0.55)_52%,transparent_75%)] blur-xl dark:bg-[radial-gradient(circle,rgba(37,99,235,0.16)_0%,transparent_74%)]"
        />
        <div aria-hidden="true" className="fl-grain pointer-events-none absolute inset-0" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[var(--fl-bg)]"
        />

        <div className="relative mx-auto max-w-[560px] px-4 sm:px-6 lg:max-w-6xl lg:px-8">
          <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Copy & CTA Hierarchy */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.44, ease: FL_EASE_STANDARD }}
              className="flex flex-col items-center justify-center text-center lg:col-span-6 lg:items-start lg:text-left"
            >
              <WordReveal
                as="h1"
                text={copy.landing.heroTitle}
                align="start-lg"
                className="fl-type-hero max-w-xl text-[var(--fl-text)]"
              />
              <p className="fl-type-body mx-auto mt-5 max-w-lg text-[var(--fl-muted)] lg:mx-0">
                {copy.landing.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link to="/register" className="fl-btn-primary">
                  <span className="fl-lang">{copy.landing.primaryCta}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
                <a href="#features" className="fl-btn-secondary">
                  <span className="fl-lang">{copy.landing.secondaryCta}</span>
                </a>
              </div>
            </motion.div>

            {/* Right Framed Hardware Showcase with Organic Liquid Blue Aura */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.08, ease: FL_EASE_STANDARD }}
              className="relative flex flex-col justify-center lg:col-span-6"
            >
              <div className="relative px-3 pt-4 pb-6 sm:px-6">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 top-2 h-[82%] w-[86%] rounded-full bg-[radial-gradient(circle_at_60%_40%,rgba(36,84,255,0.28)_0%,rgba(16,43,122,0.14)_50%,transparent_76%)] blur-2xl dark:bg-[radial-gradient(circle_at_60%_40%,rgba(93,135,255,0.26)_0%,transparent_76%)]"
                />

                <svg
                  aria-hidden="true"
                  viewBox="0 0 420 360"
                  className="pointer-events-none absolute -right-2 -top-2 h-[88%] w-[88%] text-[#2454FF]/14 dark:text-[#8BA8FF]/16"
                  fill="currentColor"
                >
                  <path d="M84,22 C192,-12 332,18 386,112 C432,192 406,304 312,338 C218,372 78,342 32,258 C-14,174 -4,56 84,22 Z" />
                </svg>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-2 left-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(75,115,92,0.28)_0%,rgba(233,242,236,0.72)_60%,transparent_100%)] blur-[2px] dark:bg-[radial-gradient(circle,rgba(127,179,149,0.2)_0%,transparent_72%)]"
                />

                <div className="fl-panel relative overflow-hidden rounded-t-[132px] rounded-b-[24px] sm:rounded-t-[176px]">
                  {heroImgFailed ? (
                    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-[var(--fl-soft-blue)] p-8 text-center">
                      <LampDesk className="h-12 w-12 text-[var(--fl-primary)]" strokeWidth={1.5} />
                      <p className="fl-type-card mt-3">FocusLamp FL-01 Desk System</p>
                    </div>
                  ) : (
                    <img
                      src="/src/assets/images/hero_focuslamp_desk_1795318233019.jpg"
                      alt="FocusLamp FL-01 smart study lamp on an oak study desk with a smartphone resting on the integrated base dock"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="aspect-[16/11] max-h-[420px] w-full object-cover"
                    />
                  )}
                </div>

                {/* Floating Translucent Glass Hardware Badge */}
                <div className="fl-glass relative mx-auto -mt-7 flex max-w-[260px] items-center gap-3 rounded-[18px] px-4 py-3 lg:ml-auto lg:mr-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2454FF] to-[#0F2557] text-white shadow-xs dark:from-[#8BA8FF] dark:to-[#3B68F5] dark:text-[#0B1222]">
                    <LampDesk className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="fl-type-label truncate font-semibold text-[var(--fl-text)]">
                      FocusLamp FL-01
                    </p>
                    <p className="fl-type-support truncate font-medium text-[var(--fl-sage)]">
                      {language === 'id' ? 'Dock + Sensor Meja' : 'Dock + Desk Presence'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 2. Key Specifications Overview Strip — 1 col centered on tablet/mobile, 4 cols on desktop */}
          <div className="mt-12 w-full rounded-[20px] border border-[var(--fl-border)] bg-[var(--fl-surface)] shadow-[var(--fl-shadow-sm)] lg:mt-16">
            <div className="grid grid-cols-1 divide-y divide-[var(--fl-border)] lg:grid-cols-4 lg:divide-x lg:divide-y-0">
              <div className="px-5 py-5 text-center">
                <p className="fl-type-overline text-[var(--fl-muted)]">
                  {language === 'id' ? 'Model Perangkat' : 'Hardware Model'}
                </p>
                <p className="fl-type-card mt-1.5 text-[var(--fl-text)] tabular-nums">
                  FocusLamp FL-01
                </p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="fl-type-overline text-[var(--fl-muted)]">
                  {language === 'id' ? 'Rentang Blok Fokus' : 'Focus Block Range'}
                </p>
                <p className="fl-type-card mt-1.5 text-[var(--fl-text)] tabular-nums">
                  {language === 'id' ? '1–60 Menit' : '1–60 Minutes'}
                </p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="fl-type-overline text-[var(--fl-muted)]">
                  {language === 'id' ? 'Syarat Streak Harian' : 'Daily Streak Threshold'}
                </p>
                <p className="fl-type-card mt-1.5 text-[var(--fl-text)] tabular-nums">
                  {language === 'id' ? '5 Menit · 3 Pemulihan/Bln' : '5 Min · 3 Recoveries/Mo'}
                </p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="fl-type-overline text-[var(--fl-muted)]">
                  {language === 'id' ? 'Sistem Tonggak' : 'Milestone System'}
                </p>
                <p className="fl-type-card mt-1.5 text-[var(--fl-text)] tabular-nums">
                  {language === 'id' ? '6 Level · 26 Pencapaian' : '6 Levels · 26 Achievements'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Information & Capabilities — Cool Gradient Surface + Liquid Ultramarine Core Hardware Split */}
      <section
        id="features"
        className="border-t border-[var(--fl-border)] bg-[linear-gradient(180deg,var(--fl-surface)_0%,#F0F5FE_100%)] py-14 sm:py-16 lg:py-20 dark:bg-[linear-gradient(180deg,var(--fl-surface)_0%,#0D172C_100%)]"
      >
        <div className="mx-auto max-w-[560px] px-4 sm:px-6 lg:max-w-6xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="fl-type-overline text-[var(--fl-sage)]">
              {language === 'id' ? 'Ekosistem Terpadu' : 'Unified Ecosystem'}
            </p>
            <WordReveal
              as="h2"
              text={copy.landing.featuresHeading}
              className="fl-type-section mt-2 text-[var(--fl-text)]"
            />
            <p className="fl-type-body mx-auto mt-3 max-w-xl text-[var(--fl-muted)]">
              {copy.landing.featuresSubheading}
            </p>
          </div>

          <StaggerGrid className="mt-12 space-y-6">
            {/* Featured 2-Column Ultramarine Liquid Hardware Band */}
            <StaggerItem>
              <div className="overflow-hidden rounded-[24px] border border-[var(--fl-border)]/75 bg-[var(--fl-soft-blue)] shadow-[var(--fl-shadow-sm)]">
                <div className="grid items-stretch lg:grid-cols-12">
                  <div className="p-4 sm:p-6 lg:col-span-6">
                    {dockImgFailed ? (
                      <div className="flex h-full min-h-[240px] w-full items-center justify-center rounded-2xl bg-[var(--fl-surface)]">
                        <Cpu className="h-10 w-10 text-[var(--fl-primary)]" strokeWidth={1.5} />
                      </div>
                    ) : (
                      <img
                        src="/src/assets/images/lamp_dock_detail_1795318232577.jpg"
                        alt="Close-up of smartphone seated on the FocusLamp FL-01 base dock pad"
                        referrerPolicy="no-referrer"
                        onError={() => setDockImgFailed(true)}
                        className="aspect-[16/10] h-full max-h-[340px] w-full rounded-2xl object-cover shadow-xs"
                      />
                    )}
                  </div>
                  <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(115%_95%_at_86%_14%,rgba(59,130,246,0.38)_0%,transparent_54%),radial-gradient(85%_85%_at_12%_88%,rgba(36,84,255,0.26)_0%,transparent_60%),linear-gradient(142deg,#09173D_0%,#102B7A_54%,#1A42B8_100%)] p-7 text-center text-white sm:p-9 lg:col-span-6 lg:items-start lg:text-left">
                    <div aria-hidden="true" className="fl-grain pointer-events-none absolute inset-0" />
                    <span className="fl-glass-blue fl-lang fl-type-overline relative inline-flex rounded-full px-3.5 py-1 text-white tabular-nums">
                      02 · {language === 'id' ? 'PERANGKAT UTAMA' : 'CORE HARDWARE'}
                    </span>
                    <h3 className="fl-type-page relative mt-4 text-white">
                      {features[1].title}
                    </h3>
                    <p className="fl-type-body relative mx-auto mt-3 max-w-md text-white/85 lg:mx-0">
                      {features[1].body}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* 4 Capability Cards — 1 col centered on tablet/mobile, 2 cols on desktop */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {features
                .filter((_, i) => i !== 1)
                .map((feat, idx) => {
                  const Icon = feat.icon;
                  const isSageCard = idx === 3;
                  const isSoftBlueCard = idx === 1;
                  return (
                    <StaggerItem key={feat.num}>
                      <div
                        className={`flex h-full flex-col items-center p-6 text-center sm:p-7 lg:items-start lg:text-left ${
                          isSageCard
                            ? 'fl-card-sage'
                            : isSoftBlueCard
                            ? 'fl-card-soft'
                            : 'fl-card-elevated bg-[var(--fl-bg)]'
                        }`}
                      >
                        <div className="flex w-full flex-col items-center gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                              isSageCard
                                ? 'bg-[var(--fl-surface)] text-[var(--fl-sage)]'
                                : 'bg-[var(--fl-soft-blue)] text-[var(--fl-primary)]'
                            }`}
                          >
                            <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                          </div>
                          <span className="fl-type-overline text-[var(--fl-muted)] tabular-nums">
                            {feat.num}
                          </span>
                        </div>
                        <h3 className="fl-type-card mt-5 text-[var(--fl-text)]">
                          {feat.title}
                        </h3>
                        <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
                          {feat.body}
                        </p>
                      </div>
                    </StaggerItem>
                  );
                })}
            </div>
          </StaggerGrid>
        </div>
      </section>

      {/* 4. Daily Workflow — Curved Section Divider + 4 Uniform Step Cards */}
      <section
        id="how-it-works"
        className="relative bg-[var(--fl-bg)] pb-14 pt-4 sm:pb-16 lg:pb-20"
      >
        <div aria-hidden="true" className="w-full overflow-hidden text-[var(--fl-surface)]">
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="h-8 w-full sm:h-12">
            <path
              fill="currentColor"
              d="M0,0 L1440,0 L1440,22 C1120,54 780,6 420,34 C220,48 80,32 0,18 Z"
            />
          </svg>
        </div>

        <div className="mx-auto max-w-[560px] px-4 pt-8 sm:px-6 sm:pt-12 lg:max-w-6xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="fl-type-overline text-[var(--fl-sage)]">
              {language === 'id' ? 'Alur Kerja Harian' : 'Daily Workflow'}
            </p>
            <WordReveal
              as="h2"
              text={copy.landing.howHeading}
              className="fl-type-section mt-2 text-[var(--fl-text)]"
            />
            <p className="fl-type-body mx-auto mt-3 max-w-xl text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Empat langkah terencana dari duduk di meja belajar hingga meninjau metrik fokus yang jujur.'
                : 'Four deliberate steps from sitting down at your desk to reviewing honest focus metrics.'}
            </p>
          </div>

          <StaggerGrid className="mt-10 grid grid-cols-1 gap-5 lg:mt-12 lg:grid-cols-4">
            {steps.map((item, idx) => (
              <StaggerItem key={item.step}>
                <div className="fl-card-elevated flex h-full flex-col items-center p-6 text-center lg:items-start lg:text-left">
                  <span
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-bold tabular-nums ${
                      idx === 0
                        ? 'bg-[#0F2557] text-white ring-2 ring-[#7FB395]/65 dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                        : 'bg-[var(--fl-sage-soft)] text-[var(--fl-sage)]'
                    }`}
                  >
                    {item.step}
                  </span>
                  <h3 className="fl-type-card mt-4 text-[var(--fl-text)]">
                    {item.title}
                  </h3>
                  <p className="fl-type-support mt-2 text-[var(--fl-muted)]">
                    {item.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* 5. Statistics & Progress Overview */}
      <section
        id="analytics-overview"
        className="border-t border-[var(--fl-border)] bg-[var(--fl-surface)] py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-[560px] px-4 sm:px-6 lg:max-w-6xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fl-soft-blue)] text-[var(--fl-primary)]">
              <BarChart3 className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <WordReveal
              as="h2"
              text={copy.landing.analyticsHeading}
              className="fl-type-section mt-4 text-[var(--fl-text)]"
            />
            <p className="fl-type-body mx-auto mt-3 max-w-xl text-[var(--fl-muted)]">
              {copy.landing.analyticsSubheading}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-12">
            <div className="fl-card-soft flex flex-col items-center justify-between p-6 text-center sm:p-7 lg:col-span-6 lg:items-start lg:text-left">
              <div className="w-full">
                <p className="fl-type-overline text-[var(--fl-primary)]">
                  {language === 'id' ? 'Sorotan Analitik' : 'Analytics Highlight'}
                </p>
                <p className="fl-type-section mt-2 text-[var(--fl-text)]">
                  {language === 'id' ? 'Tren Harian & Mingguan' : 'Daily & Weekly Trends'}
                </p>
                <p className="fl-type-body mx-auto mt-2.5 max-w-md text-[var(--fl-muted)] lg:mx-0">
                  {language === 'id'
                    ? 'Bandingkan menit fokus minggu ini dengan minggu lalu secara berdampingan.'
                    : 'Compare this week against last week side by side with clear bar & area charts.'}
                </p>
              </div>
              <div className="mt-8 flex w-full items-end gap-2.5 pt-2" aria-hidden="true">
                {[38, 62, 54, 88, 72, 96, 68].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${Math.round(h * 0.56)}px` }}
                    className={`flex-1 rounded-t-md ${
                      i === 5
                        ? 'bg-[#0F2557] dark:bg-[#8BA8FF]'
                        : i === 3
                        ? 'bg-[#4B735C] dark:bg-[#7FB395]'
                        : 'bg-[#0F2557]/20 dark:bg-[#8BA8FF]/25'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:col-span-6">
              <div className="fl-card flex flex-col justify-center p-6 text-center sm:p-7 lg:text-left">
                <p className="fl-type-card text-[var(--fl-text)]">
                  {language === 'id' ? 'Ringkasan Bulanan 4 Minggu' : 'Rolling 4-Week Monthly View'}
                </p>
                <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
                  {language === 'id'
                    ? 'Pantau akumulasi menit belajar dan penyelesaian sesi selama 28 hari terakhir.'
                    : 'Track accumulated study minutes and completed sessions over the past 28 days.'}
                </p>
              </div>
              <div className="fl-card-sage flex flex-col justify-center p-6 text-center sm:p-7 lg:text-left">
                <p className="fl-type-card text-[var(--fl-text)]">
                  {language === 'id' ? 'Ekspor Riwayat CSV' : 'CSV Session Export'}
                </p>
                <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
                  {language === 'id'
                    ? 'Unduh riwayat sesi fokus, waktu jeda, dan XP kapan saja dalam format CSV.'
                    : 'Export session duration, away pauses, and earned XP anytime as clean CSV.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FocusMate AI Services & Guidance Section */}
      <section className="border-t border-[var(--fl-border)] bg-[var(--fl-bg)] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[560px] px-4 sm:px-6 lg:max-w-6xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fl-sage-soft)] text-[var(--fl-sage)] shadow-[var(--fl-shadow-sm)]">
              <Bot className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </div>
            <WordReveal
              as="h2"
              text={
                language === 'id'
                  ? 'Bimbingan Cerdas Bersama FocusMate AI'
                  : 'Smart Guidance with FocusMate AI'
              }
              className="fl-type-section mt-4 text-[var(--fl-text)]"
            />
            <p className="fl-type-body mx-auto mt-3 max-w-xl text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Asisten belajar yang memadukan analisis riwayat sesi Anda, obrolan interaktif, dan rekomendasi berbasis sains kognitif yang terverifikasi.'
                : 'A study companion combining your focus session metrics, interactive chat guidance, and evidence-based cognitive psychology principles.'}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-12">
            <div className="fl-card-sage flex flex-col justify-between p-6 text-center sm:p-7 lg:col-span-5 lg:text-left">
              <div>
                <p className="fl-type-overline text-[var(--fl-sage)]">
                  {language === 'id' ? 'Kontekstual' : 'Context-Aware'}
                </p>
                <p className="fl-type-section mt-2 text-[var(--fl-text)]">
                  {language === 'id' ? 'Wawasan Personal' : 'Personalized Insights'}
                </p>
                <p className="fl-type-body mt-2.5 text-[var(--fl-muted)]">
                  {language === 'id'
                    ? 'Mendeteksi pola sesi setelah 3 blok fokus tercatat'
                    : 'Detects behavioral patterns once 3 focus sessions are logged'}
                </p>
              </div>
              <div className="mt-6 border-t border-[var(--fl-sage-border)] pt-4">
                <p className="fl-type-support text-[var(--fl-muted)]">
                  {language === 'id'
                    ? 'Terhubung langsung dengan catatan durasi & jeda Anda'
                    : 'Grounded directly in your focus & pause records'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:col-span-7">
              <div className="fl-card flex flex-col justify-center p-6 text-center sm:p-7 lg:text-left">
                <p className="fl-type-card text-[var(--fl-text)]">
                  {language === 'id' ? 'Riset Sains Terverifikasi' : 'Verified Science Facts'}
                </p>
                <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
                  {language === 'id'
                    ? 'Rujukan riset terbitan DOI tentang atensi, tidur, dan memori'
                    : 'Peer-reviewed DOI references on attention, sleep, and memory'}
                </p>
              </div>
              <div className="fl-card flex flex-col justify-center p-6 text-center sm:p-7 lg:text-left">
                <p className="fl-type-card text-[var(--fl-text)]">
                  {language === 'id' ? 'Saran Pertanyaan Cepat' : 'Instant Study Prompts'}
                </p>
                <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
                  {language === 'id'
                    ? 'Panduan durasi 25m vs 45m, pencahayaan, dan motivasi'
                    : 'Guidance on 25m vs 45m blocks, lighting, and motivation'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Additional Information, Transparency & Closing CTA */}
      <section
        id="about"
        className="border-t border-[var(--fl-border)] bg-[var(--fl-surface)] py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-[560px] px-4 sm:px-6 lg:max-w-5xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <WordReveal
              as="h2"
              text={copy.landing.aboutHeading}
              className="fl-type-section text-[var(--fl-text)]"
            />
            <p className="fl-type-body mx-auto mt-3 text-[var(--fl-muted)]">
              {copy.landing.aboutBody}
            </p>
          </div>

          <div className="fl-card-soft mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 p-6 text-center lg:flex-row lg:items-center lg:gap-4 lg:text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fl-surface)] text-[var(--fl-primary)]">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="fl-type-support text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Privasi & Kejujuran Metrik: FocusLamp menghitung durasi belajar nyata dari sesi yang Anda jalankan sendiri, menjaga data akun terpisah untuk setiap pengguna, dan hanya menampilkan telemetri perangkat saat lampu FL-01 benar-benar terhubung.'
                : 'Honest Metrics & Privacy: FocusLamp computes study statistics strictly from your own logged sessions, keeps each registered account isolated, and only reports hardware sensor readings when an FL-01 lamp is physically connected.'}
            </p>
          </div>

          <div className="fl-card-primary relative mx-auto mt-10 max-w-3xl overflow-hidden p-8 text-center sm:p-11">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(93,135,255,0.34)_0%,transparent_70%)] blur-xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(127,179,149,0.24)_0%,transparent_70%)] blur-xl"
            />
            <div aria-hidden="true" className="fl-grain pointer-events-none absolute inset-0" />
            <div className="relative">
              <div className="fl-glass-blue mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                <LampDesk className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              </div>
              <h3 className="fl-type-section text-white">
                {language === 'id' ? 'Mulai Kebiasaan Fokus yang Konsisten' : 'Start Building Steady Focus Habits'}
              </h3>
              <p className="fl-type-body mx-auto mt-2.5 max-w-md text-white/85">
                {language === 'id'
                  ? 'Buat akun FocusLamp pribadi Anda atau masuk untuk melanjutkan sesi belajar Anda.'
                  : 'Create your personal FocusLamp account or sign in to continue your study workspace.'}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/register"
                  className="fl-btn fl-type-btn inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-6 text-[#0F2557] shadow-xs hover:bg-[#EAF0FC] whitespace-nowrap"
                >
                  <span className="fl-lang">{copy.landing.primaryCta}</span>
                </Link>
                <Link
                  to="/login"
                  className="fl-glass-blue fl-btn fl-type-btn inline-flex min-h-[44px] items-center justify-center rounded-full px-6 text-white hover:brightness-110 whitespace-nowrap"
                >
                  <span className="fl-lang">{copy.nav.login}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Balanced & Centered Footer */}
      <footer className="border-t border-[var(--fl-border)] bg-[var(--fl-bg)] py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-5 px-4 text-center sm:px-6">
          <div className="flex items-center justify-center gap-2 text-[var(--fl-primary)]">
            <LampDesk className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            <span data-lang-exempt="true" className="fl-type-card font-bold">
              FocusLamp
            </span>
          </div>
          <p className="fl-type-support max-w-md text-center text-[var(--fl-muted)]">
            {copy.landing.footerTagline}
          </p>

          <div className="fl-type-support flex flex-wrap items-center justify-center gap-6 text-[var(--fl-muted)]">
            <a href="#features" className="hover:text-[var(--fl-text)] hover:underline underline-offset-4">
              <span className="fl-lang">{copy.nav.features}</span>
            </a>
            <a href="#how-it-works" className="hover:text-[var(--fl-text)] hover:underline underline-offset-4">
              <span className="fl-lang">{copy.nav.howItWorks}</span>
            </a>
            <a href="#analytics-overview" className="hover:text-[var(--fl-text)] hover:underline underline-offset-4">
              <span className="fl-lang">{copy.nav.dashboard}</span>
            </a>
            <a href="#about" className="hover:text-[var(--fl-text)] hover:underline underline-offset-4">
              <span className="fl-lang">{copy.nav.about}</span>
            </a>
            <Link to="/login" className="hover:text-[var(--fl-text)] hover:underline underline-offset-4">
              <span className="fl-lang">{copy.nav.login}</span>
            </Link>
          </div>

          <p className="fl-type-label w-full max-w-md border-t border-[var(--fl-border)] pt-5 text-center text-[var(--fl-muted)]">
            {copy.landing.footerCopyright}
          </p>
        </div>
      </footer>
    </div>
  );
};
