import { AchievementCategory, AchievementStatus, Language } from '../types';

export type AchievementStateKind = 'unlocked' | 'in_progress' | 'locked';
export type AchievementStatusFilter = 'all' | 'unlocked' | 'in_progress';

export function getAchievementPercent(progress: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((progress / target) * 100)));
}

export function getAchievementRemaining(progress: number, target: number): number {
  return Math.max(0, target - Math.max(0, progress));
}

export function getAchievementState(
  ach: Pick<AchievementStatus, 'unlocked' | 'progress'>
): AchievementStateKind {
  if (ach.unlocked) return 'unlocked';
  if (ach.progress > 0) return 'in_progress';
  return 'locked';
}

export function filterAchievements(
  achievements: AchievementStatus[],
  category: 'All' | AchievementCategory,
  statusFilter: AchievementStatusFilter = 'all'
): AchievementStatus[] {
  return achievements.filter((ach) => {
    if (category !== 'All' && ach.category !== category) return false;
    if (statusFilter === 'unlocked') return ach.unlocked;
    if (statusFilter === 'in_progress') return !ach.unlocked && ach.progress > 0;
    return true;
  });
}

export function getAchievementMetricUnit(
  metric: AchievementStatus['metric'],
  language: Language,
  count = 2
): string {
  const isId = language === 'id';
  const singular = count === 1;
  switch (metric) {
    case 'completed_sessions':
    case 'zero_lift_sessions':
    case 'zero_away_sessions':
      return isId ? 'sesi' : singular ? 'session' : 'sessions';
    case 'total_focus_minutes':
    case 'best_daily_minutes':
    case 'longest_session_minutes':
      return isId ? 'menit' : singular ? 'minute' : 'minutes';
    case 'current_streak':
    case 'active_days':
    case 'recoveries_unused_streak':
      return isId ? 'hari' : singular ? 'day' : 'days';
    case 'reflections_written':
      return isId ? 'catatan' : singular ? 'note' : 'notes';
    case 'ai_chats':
      return isId ? 'pesan' : singular ? 'prompt' : 'prompts';
    case 'facts_explored':
      return isId ? 'fakta' : singular ? 'fact' : 'facts';
    case 'distinct_subjects':
      return isId ? 'topik' : singular ? 'subject' : 'subjects';
    case 'comeback_events':
    case 'reconnect_resilience':
      return isId ? 'kali' : singular ? 'time' : 'times';
  }
}

export function getAchievementRequirementSummary(
  ach: AchievementStatus,
  language: Language
): string {
  const remaining = getAchievementRemaining(ach.progress, ach.target);
  if (ach.unlocked) {
    const targetUnit = getAchievementMetricUnit(ach.metric, language, ach.target);
    return language === 'id'
      ? `Target tercapai (${ach.target} ${targetUnit})`
      : `Target reached (${ach.target} ${targetUnit})`;
  }
  const remUnit = getAchievementMetricUnit(ach.metric, language, remaining);
  return language === 'id'
    ? `Tersisa ${remaining} ${remUnit} untuk membuka (${ach.progress}/${ach.target})`
    : `${remaining} ${remUnit} remaining to unlock (${ach.progress}/${ach.target})`;
}

export function getLatestUnlockedAchievement(
  achievements: AchievementStatus[]
): AchievementStatus | null {
  const unlocked = achievements.filter((ach) => ach.unlocked);
  if (unlocked.length === 0) return null;
  return unlocked[unlocked.length - 1];
}

export function splitAchievementsByUnlocked(achievements: AchievementStatus[]): {
  unlocked: AchievementStatus[];
  locked: AchievementStatus[];
} {
  const unlocked: AchievementStatus[] = [];
  const locked: AchievementStatus[] = [];
  for (const ach of achievements) {
    if (ach.unlocked) {
      unlocked.push(ach);
    } else {
      locked.push(ach);
    }
  }
  return { unlocked, locked };
}

