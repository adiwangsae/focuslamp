import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LampDesk } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { FL_EASE_STANDARD } from '../../utils/motion';
import { evaluateLogoClick, resolveBrandLogoDestination } from '../../utils/navigation';

interface BrandLogoLinkProps {
  variant: 'public' | 'app';
}

export const BrandLogoLink: React.FC<BrandLogoLinkProps> = ({ variant }) => {
  const { currentUser, language } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const lastNavAtRef = useRef<number>(0);

  const targetPath = resolveBrandLogoDestination(currentUser);

  const accessibleLabel =
    language === 'id'
      ? targetPath === '/home'
        ? 'FocusLamp — Kembali ke Beranda'
        : targetPath === '/onboarding'
        ? 'FocusLamp — Lanjutkan Pengaturan Awal'
        : 'FocusLamp — Kembali ke Halaman Utama'
      : targetPath === '/home'
      ? 'FocusLamp — Return to Home'
      : targetPath === '/onboarding'
      ? 'FocusLamp — Continue Onboarding'
      : 'FocusLamp — Return to Landing Page';

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow modified clicks (new tab/window) without intercepting
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    event.preventDefault();
    const now = performance.now();
    const outcome = evaluateLogoClick({
      currentPathname: location.pathname,
      targetPath,
      lastNavigationAt: lastNavAtRef.current,
      now,
    });

    if (outcome.action === 'scroll-top') {
      if (typeof document !== 'undefined') {
        const appScrollEl = document.querySelector<HTMLElement>('[data-app-scroll-container="true"]');
        if (appScrollEl) {
          if (appScrollEl.scrollTop > 4) {
            appScrollEl.scrollTo({
              top: 0,
              behavior: prefersReduced ? 'auto' : 'smooth',
            });
          }
          return;
        }
      }
      if (typeof window !== 'undefined' && window.scrollY > 4) {
        window.scrollTo({
          top: 0,
          behavior: prefersReduced ? 'auto' : 'smooth',
        });
      }
      return;
    }

    if (outcome.action === 'ignore') {
      return;
    }

    lastNavAtRef.current = now;
    navigate(outcome.targetPath);
  };

  const isPublic = variant === 'public';

  return (
    <Link
      to={targetPath}
      onClick={handleClick}
      aria-label={accessibleLabel}
      className={`group inline-flex items-center rounded-xl whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F2557] dark:focus-visible:outline-[#8BA8FF] ${
        isPublic
          ? 'text-[17px] font-bold tracking-[-0.02em] text-[#0F2557] dark:text-[#8BA8FF]'
          : 'text-[16px] font-bold tracking-[-0.02em] text-[#0F2557] dark:text-[#8BA8FF]'
      }`}
    >
      <motion.span
        whileHover={prefersReduced ? undefined : { scale: 1.018, opacity: 0.88 }}
        whileTap={prefersReduced ? undefined : { scale: 0.97, opacity: 0.94 }}
        transition={
          prefersReduced
            ? { duration: 0 }
            : { duration: 0.16, ease: FL_EASE_STANDARD }
        }
        className={`inline-flex origin-left items-center select-none ${
          isPublic ? 'gap-2.5' : 'gap-2.5'
        }`}
      >
        <span
          className={`relative flex items-center justify-center rounded-xl bg-[#0F2557] text-white shadow-xs transition-colors duration-150 group-hover:bg-[#1A377D] dark:bg-[#8BA8FF] dark:text-[#0D1424] dark:group-hover:bg-[#A3BAFF] ${
            isPublic ? 'h-9 w-9' : 'h-8 w-8'
          }`}
        >
          <LampDesk
            className={isPublic ? 'h-[18px] w-[18px] shrink-0' : 'h-[17px] w-[17px] shrink-0'}
            strokeWidth={1.65}
            aria-hidden="true"
          />
          <span
            aria-hidden="true"
            className={`absolute rounded-full bg-[#7FB395] ${
              isPublic ? 'right-1.5 top-1.5 h-1.5 w-1.5' : 'right-1 top-1 h-1.5 w-1.5'
            }`}
          />
        </span>
        <span data-lang-exempt="true">FocusLamp</span>
      </motion.span>
    </Link>
  );
};
