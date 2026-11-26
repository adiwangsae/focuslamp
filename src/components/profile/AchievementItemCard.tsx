import React from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Flame,
  Lock,
  Target,
  TrendingUp,
} from 'lucide-react';
import { AchievementCategory, AchievementStatus, Language } from '../../types';
import {
  getAchievementPercent,
  getAchievementRequirementSummary,
  getAchievementState,
} from '../../utils/achievementsUi';
import { AnimatedCollapse } from '../motion/MotionPrimitives';

const CATEGORY_LABELS_ID: Record<AchievementCategory, string> = {
  'Focus Milestones': 'Tonggak Fokus',
  Consistency: 'Konsistensi',
  'Learning Explorer': 'Penjelajah Belajar',
  'Session Mastery': 'Penguasaan Sesi',
  'Personal Growth': 'Pengembangan Diri',
};

function getCategoryIcon(category: AchievementCategory) {
  switch (category) {
    case 'Focus Milestones':
      return Target;
    case 'Consistency':
      return Flame;
    case 'Learning Explorer':
      return BookOpen;
    case 'Session Mastery':
      return CheckCircle2;
    case 'Personal Growth':
      return TrendingUp;
  }
}

interface AchievementItemCardProps {
  achievement: AchievementStatus;
  language: Language;
  expanded: boolean;
  onToggle: () => void;
}

export const AchievementItemCard: React.FC<AchievementItemCardProps> = ({
  achievement,
  language,
  expanded,
  onToggle,
}) => {
  const Icon = getCategoryIcon(achievement.category);
  const state = getAchievementState(achievement);
  const pct = getAchievementPercent(achievement.progress, achievement.target);
  const title = language === 'id' ? achievement.titleId : achievement.titleEn;
  const description = language === 'id' ? achievement.descriptionId : achievement.descriptionEn;
  const reward = language === 'id' ? achievement.rewardLabelId : achievement.rewardLabelEn;
  const categoryLabel =
    language === 'id' ? CATEGORY_LABELS_ID[achievement.category] : achievement.category;
  const requirementSummary = getAchievementRequirementSummary(achievement, language);

  const statusBadge =
    state === 'unlocked' ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fl-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--fl-sage)] shadow-xs">
        <CheckCircle2 className="h-3 w-3 shrink-0" strokeWidth={1.85} aria-hidden="true" />
        <span className="fl-lang">{language === 'id' ? 'Terbuka' : 'Unlocked'}</span>
      </span>
    ) : state === 'in_progress' ? (
      <span className="rounded-full bg-[var(--fl-soft-blue)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--fl-primary)] tabular-nums">
        {pct}%
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fl-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--fl-muted)]">
        <Lock className="h-3 w-3 shrink-0" strokeWidth={1.6} aria-hidden="true" />
        <span className="fl-lang">{language === 'id' ? 'Terkunci' : 'Locked'}</span>
      </span>
    );

  return (
    <div
      data-testid={`achievement-card-${achievement.id}`}
      data-achievement-state={state}
      className={`fl-card-interactive flex min-w-0 flex-col rounded-2xl transition-colors duration-200 ${
        state === 'unlocked'
          ? 'fl-card-sage'
          : state === 'in_progress'
          ? 'border border-[var(--fl-primary)]/20 bg-[var(--fl-surface)] shadow-xs'
          : 'border border-[var(--fl-border)]/80 bg-[var(--fl-surface-subtle)]/85'
      }`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex w-full cursor-pointer flex-col rounded-2xl p-4 text-center transition-colors hover:bg-black/[0.015] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--fl-primary)] lg:flex-1 lg:justify-between lg:text-left dark:hover:bg-white/[0.02]"
      >
        <div className="w-full">
          {/* Top Row: Icon + Title (+ Description on <lg) + Chevron (+ Status on <lg) */}
          <div className="flex flex-col items-center gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2.5 lg:flex-row lg:items-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  state === 'unlocked'
                    ? 'bg-[var(--fl-surface)] text-[var(--fl-sage)] shadow-xs'
                    : state === 'in_progress'
                    ? 'bg-[var(--fl-soft-blue)] text-[var(--fl-primary)]'
                    : 'bg-[var(--fl-surface)] text-[var(--fl-muted)]'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.65} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="fl-type-support break-words font-semibold leading-snug text-[var(--fl-text)]">
                  {title}
                </h3>
                <p className="fl-type-label mt-1 break-words leading-relaxed text-[var(--fl-muted)] lg:hidden">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <span className="lg:hidden">{statusBadge}</span>

              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[var(--fl-muted)] transition-transform duration-200 ${
                  expanded ? 'rotate-180' : ''
                }`}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Desktop (>=1024px) Full-Width Description utilizing full horizontal card space */}
          <p
            data-testid={`achievement-desc-${achievement.id}`}
            className="fl-type-label hidden break-words leading-relaxed text-[var(--fl-muted)] lg:mt-2.5 lg:block"
          >
            {description}
          </p>
        </div>

        {/* Dedicated Bottom Status & Progress Area */}
        {state === 'unlocked' ? (
          <div
            data-testid={`achievement-status-area-${achievement.id}`}
            className="mt-3 flex w-full flex-wrap items-center justify-center gap-2 border-t border-[var(--fl-sage-border)]/70 pt-2.5 lg:mt-3.5 lg:justify-between"
          >
            <span className="fl-type-label inline-flex items-center gap-1 break-words font-semibold text-[var(--fl-sage)]">
              <Award className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
              <span>{reward}</span>
            </span>
            <span className="fl-type-label shrink-0 font-medium text-[var(--fl-muted)] lg:hidden">
              {categoryLabel}
            </span>
            <span className="hidden lg:inline-flex shrink-0">{statusBadge}</span>
          </div>
        ) : (
          <div
            data-testid={`achievement-status-area-${achievement.id}`}
            className="mt-3 w-full lg:mt-3.5 lg:border-t lg:border-[var(--fl-border)]/65 lg:pt-2.5"
          >
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--fl-border)]/80">
              <div
                className="h-full rounded-full bg-[#1E3F9E] transition-all duration-300 dark:bg-[#8BA8FF]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="fl-type-label mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[var(--fl-muted)] tabular-nums lg:mt-2 lg:justify-between">
              <span className="min-w-0 break-words">{reward}</span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 font-semibold text-[var(--fl-text)]">
                  {achievement.progress} / {achievement.target}
                </span>
                <span className="hidden lg:inline-flex shrink-0">{statusBadge}</span>
              </div>
            </div>
          </div>
        )}
      </button>

      {/* Expandable Details */}
      <AnimatedCollapse open={expanded}>
        <div
          data-testid={`achievement-details-${achievement.id}`}
          className="space-y-2.5 border-t border-[var(--fl-border)]/70 px-4 pt-3 pb-4 text-center lg:text-left"
        >
          <div className="flex flex-col items-center justify-between gap-2 rounded-xl bg-[var(--fl-surface)]/90 px-3 py-2 text-xs lg:flex-row">
            <span className="min-w-0 break-words font-medium text-[var(--fl-muted)]">
              {requirementSummary}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--fl-primary)]">
              <Award className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
              <span>{reward}</span>
            </span>
          </div>

          <p className="fl-type-label break-words text-[var(--fl-muted)]">
            {language === 'id' ? 'Kategori' : 'Category'}:{' '}
            <span className="font-medium text-[var(--fl-text)]">{categoryLabel}</span>
          </p>
        </div>
      </AnimatedCollapse>
    </div>
  );
};
