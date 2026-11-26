import React from 'react';
import { AlertCircle, CheckCircle2, Info, RefreshCw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ToastNotice } from '../../types';
import { FL_EASE_STANDARD } from '../../utils/motion';

export type BadgeTone = 'neutral' | 'primary' | 'sage' | 'olive' | 'success' | 'warning' | 'danger';

export const StatusBadge: React.FC<{
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}> = ({ tone = 'neutral', children, className = '' }) => {
  const toneClasses: Record<BadgeTone, string> = {
    neutral:
      'border border-[var(--fl-border)]/70 bg-[#EEF2F7]/85 text-[#52617E] backdrop-blur-sm dark:bg-[#1B2742]/80 dark:text-[#9BA8C4]',
    primary:
      'border border-[#2454FF]/15 bg-[#EAF0FC]/88 text-[#102B7A] backdrop-blur-sm dark:border-[#8BA8FF]/20 dark:bg-[#1B2742]/85 dark:text-[#8BA8FF]',
    sage:
      'border border-[#C9DED1]/80 bg-[#E9F2EC]/88 text-[#355A45] backdrop-blur-sm dark:border-[#264034] dark:bg-[#15261F]/85 dark:text-[#7FB395]',
    olive:
      'border border-[#687849]/20 bg-[#EFF2E6]/88 text-[#536139] backdrop-blur-sm dark:bg-[#212818]/85 dark:text-[#A4B57E]',
    success:
      'border border-[#C9DED1]/80 bg-[#E9F2EC]/88 text-[#2F6A4A] backdrop-blur-sm dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-[#7FB395]',
    warning:
      'border border-amber-300/60 bg-[#FDF4E4]/90 text-[#8F590A] backdrop-blur-sm dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-[#F5C26B]',
    danger:
      'border border-red-200/80 bg-red-50/90 text-red-700 backdrop-blur-sm dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]} ${className}`}
    >
      <span className="fl-lang inline-flex items-center gap-1">{children}</span>
    </span>
  );
};

export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`fl-card p-5 ${className}`}
    >
      <div className="fl-skeleton mb-3 h-4 w-32 rounded-lg" />
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={`fl-skeleton h-3 rounded-lg ${idx === lines - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="rounded-[18px] border border-dashed border-[var(--fl-border)] bg-[var(--fl-surface)] px-6 py-10 text-center">
    {icon && (
      <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fl-sage-soft)] text-[var(--fl-sage)]">
        {icon}
      </div>
    )}
    <h3 className="fl-type-card text-[var(--fl-text)]">{title}</h3>
    <p className="fl-type-support mx-auto mt-1.5 max-w-md text-[var(--fl-muted)]">
      {description}
    </p>
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

export const ErrorState: React.FC<{
  title: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}> = ({ title, message, retryLabel, onRetry }) => (
  <div
    role="alert"
    className="rounded-[18px] border border-red-200/80 bg-red-50/75 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" strokeWidth={1.5} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-xs opacity-90">{message}</p>
        {onRetry && retryLabel && (
          <button
            type="button"
            onClick={onRetry}
            className="fl-btn mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-[#0D1424] dark:text-red-300 dark:hover:bg-[#151F34]"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span className="fl-lang">{retryLabel}</span>
          </button>
        )}
      </div>
    </div>
  </div>
);

export const ToastContainer: React.FC<{
  toasts: ToastNotice[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] right-4 z-[90] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2 lg:bottom-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const icon =
            toast.tone === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-[var(--fl-sage)]" strokeWidth={1.5} />
            ) : toast.tone === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            ) : toast.tone === 'warning' ? (
              <AlertCircle className="h-4 w-4 text-[#B87412] dark:text-[#F5C26B]" strokeWidth={1.5} />
            ) : (
              <Info className="h-4 w-4 text-[var(--fl-primary)]" strokeWidth={1.5} />
            );

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
              className="fl-glass pointer-events-auto flex items-start gap-2.5 rounded-2xl px-4 py-3 text-xs text-[var(--fl-text)]"
            >
              <span className="mt-0.5 shrink-0" aria-hidden="true">
                {icon}
              </span>
              <p className="flex-1 leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-full p-1 text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)]"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
