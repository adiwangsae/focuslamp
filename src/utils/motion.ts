import type { Variants } from 'motion/react';

export const FL_EASE_STANDARD = [0.22, 1, 0.36, 1] as const;
export const FL_EASE_IN = [0.4, 0, 1, 1] as const;
export const FL_EASE_OUT = [0, 0, 0.2, 1] as const;

export const FL_DURATION = {
  micro: 0.16, // 120-180ms
  button: 0.18, // 150-220ms
  hover: 0.2, // 180-250ms
  popover: 0.2, // 180-250ms
  modalEnter: 0.26, // 220-300ms
  modalExit: 0.18,
  component: 0.36, // 300-450ms
  pageEnter: 0.28, // 250-400ms total
  pageExit: 0.15,
  authSlide: 0.28,
  collapse: 0.24,
  panel: 0.24,
  stagger: 0.045,
  langExit: 0.115,
  langEnter: 0.185,
} as const;

export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: FL_DURATION.pageEnter,
      ease: FL_EASE_STANDARD,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: FL_DURATION.pageExit,
      ease: FL_EASE_IN,
    },
  },
};

export const authFormSlideVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    y: direction >= 0 ? 6 : -6,
  }),
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: FL_EASE_STANDARD,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction >= 0 ? -6 : 6,
    transition: {
      duration: 0.22,
      ease: FL_EASE_STANDARD,
    },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: FL_DURATION.stagger,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: FL_DURATION.component,
      ease: FL_EASE_STANDARD,
    },
  },
};

export const tabContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: FL_EASE_STANDARD,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.13,
      ease: FL_EASE_IN,
    },
  },
};

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.22, ease: FL_EASE_OUT },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.16, ease: FL_EASE_IN },
  },
};

export const modalPanelVariants: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: FL_DURATION.modalEnter, ease: FL_EASE_STANDARD },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.985,
    transition: { duration: FL_DURATION.modalExit, ease: FL_EASE_IN },
  },
};
