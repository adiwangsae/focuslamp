import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, LampDesk, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { FL_EASE_STANDARD, tabContentVariants } from '../utils/motion';

export const OnboardingPage: React.FC = () => {
  const { completeOnboarding, copy, language } = useApp();
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      icon: LampDesk,
      title: language === 'id' ? '1. Bangun Kebiasaan Fokus Lebih Baik' : '1. Build Better Focus Habits',
      description:
        language === 'id'
          ? 'Mulai blok belajar terarah dengan FocusLamp FL-01. Pencahayaan meja yang nyaman dan timer tenang membantu Anda membangun konsistensi 5 menit atau lebih setiap hari.'
          : 'Begin intentional study blocks with FocusLamp FL-01. Balanced task lighting and calm session timing help you build steady 5+ minute daily study streaks.',
      highlight:
        language === 'id'
          ? 'Rentang blok fokus: 1–60 menit · XP dihitung dari menit fokus aktual.'
          : 'Focus block range: 1–60 minutes · XP earned from actual focus minutes.',
    },
    {
      icon: ShieldCheck,
      title: language === 'id' ? '2. Kurangi Distraksi Digital' : '2. Reduce Digital Distractions',
      description:
        language === 'id'
          ? 'Letakkan ponsel di dock dasar FocusLamp sebelum memulai sesi. Selama Mode Fokus aktif, notifikasi lampu dibisukan sementara dan waktu meninggalkan meja dikecualikan secara jujur.'
          : 'Place your phone onto the FocusLamp base dock before starting. During active blocks, lamp notifications stay muted and desk-away breaks are excluded honestly.',
      highlight:
        language === 'id'
          ? 'Koneksi Bluetooth terputus sementara tidak menghentikan timer sesi Anda.'
          : 'Temporary Bluetooth drops do not prematurely end your active timer.',
    },
    {
      icon: BarChart3,
      title: language === 'id' ? '3. Pahami Progres Belajar Anda' : '3. Understand Your Progress',
      description:
        language === 'id'
          ? 'Tinjau grafik tren mingguan dan bulanan, ringkasan sensor perilaku, 26 tonggak pencapaian, serta wawasan FocusMate AI berbasis bukti.'
          : 'Review weekly and monthly charts, transparent behavioral summaries, 26 achievement milestones, and evidence-based FocusMate AI guidance.',
      highlight:
        language === 'id'
          ? 'Sesuaikan tema, bahasa, dan target harian kapan saja di halaman Profil.'
          : 'Customize theme, language, and daily targets anytime from Profile.',
    },
  ];

  const finishAndGoHome = () => {
    completeOnboarding({});
    if (window.history.length <= 2) {
      window.history.replaceState(null, '', '/');
      navigate('/home');
    } else {
      navigate('/home', { replace: true });
    }
  };

  const activeSlide = slides[slideIndex];
  const Icon = activeSlide.icon;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-clip bg-[var(--fl-bg)] px-4 py-10 text-[var(--fl-text)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(234,240,252,0.9)_0%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(27,39,66,0.5)_0%,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(233,242,236,0.85)_0%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(21,38,31,0.5)_0%,transparent_72%)]"
      />

      <div className="fl-panel relative w-full max-w-xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="fl-lang fl-type-overline text-[var(--fl-primary)] tabular-nums">
            {copy.onboarding.stepOf} {slideIndex + 1} / {slides.length}
          </span>
          <button
            type="button"
            onClick={finishAndGoHome}
            className="fl-btn fl-type-label rounded-full px-3 py-1.5 text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)] hover:text-[var(--fl-text)]"
          >
            <span className="fl-lang">{copy.onboarding.skipOptional}</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--fl-border)]">
          <motion.div
            animate={{ width: `${((slideIndex + 1) / slides.length) * 100}%` }}
            transition={{ duration: 0.25, ease: FL_EASE_STANDARD }}
            className="h-full rounded-full bg-gradient-to-r from-[#0F2557] to-[#4B735C] dark:from-[#8BA8FF] dark:to-[#7FB395]"
          />
        </div>

        <div className="mt-8 min-h-[230px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slideIndex}
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fl-soft-blue)] text-[var(--fl-primary)]">
                <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
                {slideIndex === 0 && (
                  <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--fl-sage)]" />
                )}
              </div>
              <h1 className="fl-type-page mt-5">{activeSlide.title}</h1>
              <p className="fl-type-body mt-2.5 max-w-md text-[var(--fl-muted)]">
                {activeSlide.description}
              </p>
              <p className="fl-type-label mt-5 rounded-full border border-[var(--fl-sage-border)] bg-[var(--fl-sage-soft)] px-4 py-2 font-medium text-[var(--fl-sage)]">
                {activeSlide.highlight}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-[var(--fl-border)] pt-5">
          <button
            type="button"
            disabled={slideIndex === 0}
            onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            className="fl-btn-secondary disabled:opacity-40"
          >
            <span className="fl-lang">{copy.onboarding.back}</span>
          </button>

          {slideIndex < slides.length - 1 ? (
            <button
              type="button"
              onClick={() => setSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
              className="fl-btn-primary"
            >
              <span className="fl-lang">{copy.onboarding.next}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={finishAndGoHome}
              className="fl-btn-primary"
            >
              <span className="fl-lang">{copy.onboarding.finish}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
