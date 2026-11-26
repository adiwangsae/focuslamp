import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

const APP_SCROLL_ROUTES = new Set(['/home', '/focus', '/dashboard', '/device', '/profile']);

export const LenisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const { pathname, hash } = useLocation();
  const isAppScrollRoute = APP_SCROLL_ROUTES.has(pathname);
  const isFullAiRoute = pathname === '/ai';

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || isFullAiRoute) {
      lenisRef.current = null;
      return;
    }

    const appScrollContainer = isAppScrollRoute
      ? document.querySelector<HTMLElement>('[data-app-scroll-container="true"]')
      : null;

    if (isAppScrollRoute && !appScrollContainer) {
      lenisRef.current = null;
      return;
    }

    const scrollContent =
      appScrollContainer && appScrollContainer.firstElementChild instanceof HTMLElement
        ? appScrollContainer.firstElementChild
        : undefined;

    const lenis = new Lenis({
      ...(appScrollContainer
        ? {
            wrapper: appScrollContainer,
            content: scrollContent,
            eventsTarget: appScrollContainer,
          }
        : {}),
      duration: 0.72,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1,
      overscroll: false,
      stopInertiaOnNavigate: true,
      autoResize: true,
      prevent: (node) => {
        if (node.closest('[data-lenis-prevent], [role="dialog"]')) {
          return true;
        }
        const nestedScrollbar = node.closest('.fl-scrollbar');
        if (nestedScrollbar && nestedScrollbar !== appScrollContainer) {
          return true;
        }
        return false;
      },
    });

    lenisRef.current = lenis;
    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };
    rafId = window.requestAnimationFrame(raf);

    const observeTarget = scrollContent ?? document.body;
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && observeTarget
        ? new ResizeObserver(() => {
            lenis.resize();
          })
        : null;
    if (resizeObserver && observeTarget) {
      resizeObserver.observe(observeTarget);
    }

    return () => {
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isAppScrollRoute, isFullAiRoute]);

  useEffect(() => {
    const appScrollContainer = isAppScrollRoute
      ? document.querySelector<HTMLElement>('[data-app-scroll-container="true"]')
      : null;

    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(target, { offset: -72 });
        } else {
          target.scrollIntoView({ behavior: 'auto' });
        }
        return;
      }
    }

    if (appScrollContainer) {
      appScrollContainer.scrollTop = 0;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (!appScrollContainer) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, isAppScrollRoute]);

  return <>{children}</>;
};
