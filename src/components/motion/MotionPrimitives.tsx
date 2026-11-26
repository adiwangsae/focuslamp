import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  FL_DURATION,
  FL_EASE_IN,
  FL_EASE_STANDARD,
  pageTransitionVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from '../../utils/motion';

export const AnimatedPage: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
};

export const AnimatedCollapse: React.FC<{
  open: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ open, children, className = '' }) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return open ? <div className={className}>{children}</div> : null;
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: 'auto',
            transition: {
              height: { duration: FL_DURATION.collapse, ease: FL_EASE_STANDARD },
              opacity: { duration: 0.2, ease: FL_EASE_STANDARD },
            },
          }}
          exit={{
            opacity: 0,
            height: 0,
            transition: {
              height: { duration: 0.18, ease: FL_EASE_IN },
              opacity: { duration: 0.12, ease: FL_EASE_IN },
            },
          }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const AnimatedNumber: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
}> = ({ value, suffix = '', prefix = '', durationMs = 380 }) => {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const previousRef = useRef(value);

  useEffect(() => {
    if (prefersReduced) {
      previousRef.current = value;
      setDisplayValue(value);
      return;
    }

    const from = previousRef.current;
    const to = value;
    if (from === to) return;

    let rafId = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);
      if (t < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        previousRef.current = to;
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(rafId);
      previousRef.current = to;
    };
  }, [value, durationMs, prefersReduced]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

export const AnimatedSwitch: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  id?: string;
}> = ({ checked, onChange, ariaLabel, id }) => {
  const prefersReduced = useReducedMotion();

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2557] dark:focus-visible:outline-[#8BA8FF] ${
        checked ? 'bg-[#0F2557] dark:bg-[#8BA8FF]' : 'bg-slate-300 dark:bg-[#25334E]'
      }`}
    >
      <motion.span
        aria-hidden="true"
        animate={{ x: checked ? 22 : 2 }}
        transition={
          prefersReduced
            ? { duration: 0 }
            : { duration: FL_DURATION.button, ease: FL_EASE_STANDARD }
        }
        className={`pointer-events-none inline-block h-5 w-5 rounded-full shadow-xs ${
          checked ? 'bg-white dark:bg-[#0D1424]' : 'bg-white dark:bg-[#F3F5FA]'
        }`}
      />
    </button>
  );
};

export const AnimatedErrorMessage: React.FC<{
  message?: string;
  className?: string;
}> = ({ message, className = 'mt-1.5 text-xs text-red-600 dark:text-red-400' }) => {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: FL_DURATION.micro, ease: FL_EASE_STANDARD }}
          className={className}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

export const TypingDots: React.FC<{ label: string }> = ({ label }) => {
  const prefersReduced = useReducedMotion();

  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((idx) => (
          <motion.span
            key={idx}
            animate={prefersReduced ? undefined : { opacity: [0.3, 1, 0.3] }}
            transition={
              prefersReduced
                ? undefined
                : {
                    duration: 1.1,
                    repeat: Infinity,
                    delay: idx * 0.18,
                    ease: 'easeInOut',
                  }
            }
            className="inline-block h-1.5 w-1.5 rounded-full bg-current"
          />
        ))}
      </span>
    </span>
  );
};

export const LocalizedText: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <span className={`fl-lang ${className}`}>{children}</span>
);

export const WordReveal: React.FC<{
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  staggerMs?: number;
  align?: 'center' | 'start-lg';
}> = ({ text, as = 'h2', className = '', staggerMs = 34, align = 'center' }) => {
  const prefersReduced = useReducedMotion();
  const initialTextRef = useRef(text);
  const [simpleMode, setSimpleMode] = useState(false);

  useEffect(() => {
    if (text !== initialTextRef.current) {
      setSimpleMode(true);
    }
  }, [text]);

  const Tag = as;

  if (prefersReduced || simpleMode || text !== initialTextRef.current) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.trim().split(/\s+/);
  const justifyClass = align === 'start-lg' ? 'justify-center lg:justify-start' : 'justify-center';

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={`inline-flex flex-wrap ${justifyClass} gap-x-[0.26em] gap-y-0.5`}>
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden align-top py-0.5">
            <motion.span
              initial={{ opacity: 0, y: '0.5em' }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.42,
                delay: Math.min(index * (staggerMs / 1000), 0.38),
                ease: FL_EASE_STANDARD,
              }}
              className="inline-block"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
};
