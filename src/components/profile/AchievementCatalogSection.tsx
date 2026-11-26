import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { AchievementCategory, AchievementStatus, Language } from '../../types';
import {
  AchievementStatusFilter,
  filterAchievements,
  getAchievementPercent,
  getLatestUnlockedAchievement,
  splitAchievementsByUnlocked,
} from '../../utils/achievementsUi';
import { AchievementItemCard } from './AchievementItemCard';

const ACHIEVEMENT_CATEGORIES: ('All' | AchievementCategory)[] = [
  'All',
  'Focus Milestones',
  'Consistency',
  'Learning Explorer',
  'Session Mastery',
  'Personal Growth',
];

const CATEGORY_LABELS_ID: Record<'All' | AchievementCategory, string> = {
  All: 'Semua',
  'Focus Milestones': 'Tonggak Fokus',
  Consistency: 'Konsistensi',
  'Learning Explorer': 'Penjelajah Belajar',
  'Session Mastery': 'Penguasaan Sesi',
  'Personal Growth': 'Pengembangan Diri',
};

interface AchievementCatalogSectionProps {
  achievements: AchievementStatus[];
  language: Language;
  title: string;
}

export const AchievementCatalogSection: React.FC<AchievementCatalogSectionProps> = ({
  achievements,
  language,
  title,
}) => {
  const [category, setCategory] = useState<'All' | AchievementCategory>('All');
  const [statusFilter, setStatusFilter] = useState<AchievementStatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unlockedCount = useMemo(
    () => achievements.filter((a) => a.unlocked).length,
    [achievements]
  );
  const overallPct = getAchievementPercent(unlockedCount, achievements.length);
  const latestUnlocked = useMemo(
    () => getLatestUnlockedAchievement(achievements),
    [achievements]
  );

  const filtered = useMemo(
    () => filterAchievements(achievements, category, statusFilter),
    [achievements, category, statusFilter]
  );

  const { unlocked: unlockedFiltered, locked: lockedFiltered } = useMemo(
    () => splitAchievementsByUnlocked(filtered),
    [filtered]
  );

  const latestTitle = latestUnlocked
    ? language === 'id'
      ? latestUnlocked.titleId
      : latestUnlocked.titleEn
    : '';
  const latestReward = latestUnlocked
    ? language === 'id'
      ? latestUnlocked.rewardLabelId
      : latestUnlocked.rewardLabelEn
    : '';

  return (
    <div className="space-y-5">
      {/* A. Achievement Overview Card */}
      <section
        data-testid="achievement-overview-section"
        className="fl-card rounded-3xl p-5 sm:p-6"
      >
        <div className="flex flex-col items-center justify-between gap-4 text-center lg:flex-row lg:items-center lg:text-left">
          <div className="flex min-w-0 flex-col items-center gap-3 lg:flex-row lg:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fl-olive-soft)] text-[var(--fl-olive)]">
              <Award className="h-5 w-5" strokeWidth={1.65} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <h2 className="fl-type-card break-words">
                  {title} · {unlockedCount}/{achievements.length}
                </h2>
              </div>
              <p className="fl-type-label mt-0.5 break-words text-[var(--fl-muted)]">
                {language === 'id'
                  ? `${unlockedCount} dari ${achievements.length} tonggak terbuka (${overallPct}%). Ketuk kartu untuk melihat syarat lengkap.`
                  : `${unlockedCount} of ${achievements.length} milestones unlocked (${overallPct}%). Select any milestone for unlock details.`}
              </p>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="inline-flex max-w-full flex-wrap justify-center rounded-full bg-[var(--fl-surface-subtle)] p-1">
            {(
              [
                { id: 'all', en: 'All', idLabel: 'Semua' },
                { id: 'unlocked', en: 'Unlocked', idLabel: 'Terbuka' },
                { id: 'in_progress', en: 'In Progress', idLabel: 'Berjalan' },
              ] as const
            ).map((item) => {
              const active = statusFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id)}
                  className={`fl-btn fl-type-label rounded-full px-3 py-1 font-semibold whitespace-nowrap ${
                    active
                      ? 'bg-[var(--fl-surface)] text-[var(--fl-primary)] shadow-xs'
                      : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                  }`}
                >
                  <span className="fl-lang">{language === 'id' ? item.idLabel : item.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slim Global Completion Bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--fl-surface-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--fl-sage)] transition-all duration-300"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <span className="fl-type-label shrink-0 font-semibold text-[var(--fl-text)] tabular-nums">
            {overallPct}%
          </span>
        </div>

        {/* Meaningful Highlight Strip (earned highlight or honest zero-state for fresh registered users) */}
        <div className="mt-4 rounded-2xl border border-[var(--fl-border)]/75 bg-[var(--fl-surface-subtle)]/75 px-4 py-3 text-center lg:text-left">
          {latestUnlocked ? (
            <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
              <div className="flex min-w-0 flex-col items-center gap-1.5 lg:flex-row lg:gap-2.5">
                <Sparkles
                  className="h-4 w-4 shrink-0 text-[var(--fl-sage)]"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <span className="fl-type-label font-semibold text-[var(--fl-muted)]">
                  {language === 'id' ? 'Pencapaian Terbaru:' : 'Highlighted Milestone:'}
                </span>
                <span className="fl-type-support break-words font-semibold text-[var(--fl-text)]">
                  {latestTitle}
                </span>
              </div>
              <span className="fl-type-label shrink-0 font-semibold text-[var(--fl-sage)]">
                {latestReward}
              </span>
            </div>
          ) : (
            <p className="fl-type-support break-words text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Belum ada pencapaian terbuka. Selesaikan sesi fokus pertama Anda untuk membuka tonggak pertama.'
                : 'No achievements unlocked yet. Complete your first focus session to earn your first milestone.'}
            </p>
          )}
        </div>

        {/* Category Filter Row */}
        <div className="mt-4 flex flex-wrap justify-center gap-1.5 lg:justify-start">
          {ACHIEVEMENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`fl-btn fl-type-label rounded-full px-3 py-1.5 font-medium whitespace-nowrap shrink-0 ${
                category === cat
                  ? 'bg-[#0F2557] text-white dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                  : 'bg-[var(--fl-surface-subtle)] text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
              }`}
            >
              <span className="fl-lang">
                {language === 'id' ? CATEGORY_LABELS_ID[cat] : cat}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Empty Filter State */}
      {filtered.length === 0 ? (
        <section className="fl-card rounded-3xl p-8 text-center">
          <p className="fl-type-support break-words text-[var(--fl-muted)]">
            {statusFilter === 'unlocked' && unlockedCount === 0
              ? language === 'id'
                ? 'Anda belum membuka pencapaian apa pun. Mulai sesi fokus untuk meraih pencapaian pertama.'
                : 'You have not unlocked any achievements yet. Start a focus session to earn your first badge.'
              : language === 'id'
              ? 'Belum ada pencapaian pada filter kategori ini.'
              : 'No achievements match this filter yet.'}
          </p>
        </section>
      ) : (
        <>
          {/* B. Unlocked Achievements Group */}
          {unlockedFiltered.length > 0 && statusFilter !== 'in_progress' && (
            <section
              data-testid="achievements-unlocked-section"
              className="fl-card rounded-3xl p-5 sm:p-6"
            >
              <div className="mb-4 flex flex-col items-center justify-between gap-2 text-center lg:flex-row lg:text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-4.5 w-4.5 shrink-0 text-[var(--fl-sage)]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <h3 className="fl-type-card">
                    <span className="fl-lang">
                      {language === 'id' ? 'Pencapaian Terbuka' : 'Unlocked Achievements'}
                    </span>{' '}
                    <span className="font-normal text-[var(--fl-muted)] tabular-nums">
                      ({unlockedFiltered.length})
                    </span>
                  </h3>
                </div>
                <p className="fl-type-label text-[var(--fl-muted)]">
                  {language === 'id'
                    ? 'Tonggak belajar yang telah Anda selesaikan.'
                    : 'Study milestones you have earned.'}
                </p>
              </div>

              <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
                {unlockedFiltered.map((ach) => (
                  <AchievementItemCard
                    key={ach.id}
                    achievement={ach}
                    language={language}
                    expanded={expandedId === ach.id}
                    onToggle={() => setExpandedId((prev) => (prev === ach.id ? null : ach.id))}
                  />
                ))}
              </div>
            </section>
          )}

          {/* C. Locked & In-Progress Achievements Group */}
          {lockedFiltered.length > 0 && statusFilter !== 'unlocked' && (
            <section
              data-testid="achievements-locked-section"
              className="fl-card rounded-3xl p-5 sm:p-6"
            >
              <div className="mb-4 flex flex-col items-center justify-between gap-2 text-center lg:flex-row lg:text-left">
                <div className="flex items-center gap-2">
                  <Lock
                    className="h-4 w-4 shrink-0 text-[var(--fl-muted)]"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  <h3 className="fl-type-card">
                    <span className="fl-lang">
                      {statusFilter === 'in_progress'
                        ? language === 'id'
                          ? 'Sedang Dalam Progres'
                          : 'In Progress'
                        : language === 'id'
                        ? 'Pencapaian Terkunci'
                        : 'Locked Achievements'}
                    </span>{' '}
                    <span className="font-normal text-[var(--fl-muted)] tabular-nums">
                      ({lockedFiltered.length})
                    </span>
                  </h3>
                </div>
                <p className="fl-type-label text-[var(--fl-muted)]">
                  {language === 'id'
                    ? 'Target berikutnya lengkap dengan progres menuju pembukaan.'
                    : 'Upcoming milestones with progress toward unlock criteria.'}
                </p>
              </div>

              <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
                {lockedFiltered.map((ach) => (
                  <AchievementItemCard
                    key={ach.id}
                    achievement={ach}
                    language={language}
                    expanded={expandedId === ach.id}
                    onToggle={() => setExpandedId((prev) => (prev === ach.id ? null : ach.id))}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
