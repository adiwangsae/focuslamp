import React, { useEffect, useState } from 'react';
import { LampDesk } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Language } from '../../types';
import { FL_EASE_STANDARD } from '../../utils/motion';

const SPLASH_SEEN_KEY = 'focuslamp_splash_seen_v1';

interface SplashScreenProps {
  language: Language;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ language }) => {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('skipSplash') === '1') {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
      return false;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    // Only show once per browser session so internal reloads stay crisp
    return sessionStorage.getItem(SPLASH_SEEN_KEY) !== '1';
  });

  useEffect(() => {
    if (!visible) return;
    const isRepeat = localStorage.getItem(SPLASH_SEEN_KEY) === '1';
    const durationMs = isRepeat ? 850 : 2100;

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
      localStorage.setItem(SPLASH_SEEN_KEY, '1');
      setVisible(false);
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [visible]);

  const dismiss = () => {
    sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    localStorage.setItem(SPLASH_SEEN_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="FocusLamp Splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.28, ease: FL_EASE_STANDARD }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[var(--fl-bg)] px-6 text-center"
        >
          {/* Abstract Soft-Blue + Sage Organic Backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(234,240,252,0.9)_0%,rgba(234,240,252,0.2)_55%,transparent_75%)] dark:bg-[radial-gradient(circle,rgba(27,39,66,0.7)_0%,transparent_75%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 left-[-8%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(233,242,236,0.85)_0%,rgba(233,242,236,0.18)_55%,transparent_75%)] dark:bg-[radial-gradient(circle,rgba(21,38,31,0.7)_0%,transparent_75%)]"
          />

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.42, ease: FL_EASE_STANDARD }}
            className="relative flex flex-col items-center"
          >
            <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0F2557] text-white shadow-sm dark:bg-[#8BA8FF] dark:text-[#0D1424]">
              <LampDesk className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
              <span
                aria-hidden="true"
                className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#7FB395]"
              />
            </div>
            <p className="fl-type-page text-[var(--fl-text)]">FocusLamp</p>
            <p className="fl-type-body mt-1.5 text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Ekosistem Lampu Belajar Pintar'
                : 'Smart Study Lamp Ecosystem'}
            </p>

            <div className="mt-6 h-1 w-36 overflow-hidden rounded-full bg-[var(--fl-border)]">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#0F2557] to-[#4B735C] dark:from-[#8BA8FF] dark:to-[#7FB395]"
              />
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="fl-btn mt-6 min-h-[40px] rounded-full px-5 py-2 text-xs font-semibold text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)] hover:text-[var(--fl-text)]"
            >
              {language === 'id' ? 'Lewati' : 'Skip'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
