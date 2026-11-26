import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterAchievements,
  getAchievementPercent,
  getAchievementRemaining,
  getAchievementRequirementSummary,
  getAchievementState,
  getLatestUnlockedAchievement,
  splitAchievementsByUnlocked,
} from './achievementsUi';
import { AchievementStatus } from '../types';

const SAMPLE_LIST: AchievementStatus[] = [
  {
    id: 'a1',
    category: 'Focus Milestones',
    titleEn: 'First Spark',
    titleId: 'Percikan Pertama',
    descriptionEn: 'Complete 1 session.',
    descriptionId: 'Selesaikan 1 sesi.',
    target: 1,
    rewardLabelEn: '+15 Badge',
    rewardLabelId: 'Lencana +15',
    metric: 'completed_sessions',
    progress: 1,
    unlocked: true,
  },
  {
    id: 'a2',
    category: 'Focus Milestones',
    titleEn: 'Focus Builder',
    titleId: 'Pembangun Fokus',
    descriptionEn: 'Accumulate 150 minutes.',
    descriptionId: 'Kumpulkan 150 menit.',
    target: 150,
    rewardLabelEn: 'Bronze Badge',
    rewardLabelId: 'Lencana Perunggu',
    metric: 'total_focus_minutes',
    progress: 75,
    unlocked: false,
  },
  {
    id: 'a3',
    category: 'Consistency',
    titleEn: 'Week of Focus',
    titleId: 'Sepekan Fokus',
    descriptionEn: 'Maintain a 7-day streak.',
    descriptionId: 'Pertahankan streak 7 hari.',
    target: 7,
    rewardLabelEn: 'Weekly Ribbon',
    rewardLabelId: 'Pita Mingguan',
    metric: 'current_streak',
    progress: 0,
    unlocked: false,
  },
];

describe('achievementsUi helpers', () => {
  it('computes clamped percent, remaining, and state classification', () => {
    assert.equal(getAchievementPercent(75, 150), 50);
    assert.equal(getAchievementPercent(200, 150), 100);
    assert.equal(getAchievementRemaining(75, 150), 75);
    assert.equal(getAchievementRemaining(200, 150), 0);

    assert.equal(getAchievementState(SAMPLE_LIST[0]), 'unlocked');
    assert.equal(getAchievementState(SAMPLE_LIST[1]), 'in_progress');
    assert.equal(getAchievementState(SAMPLE_LIST[2]), 'locked');
  });

  it('filters by category and status', () => {
    assert.equal(filterAchievements(SAMPLE_LIST, 'All', 'all').length, 3);
    assert.equal(filterAchievements(SAMPLE_LIST, 'Focus Milestones', 'all').length, 2);
    assert.equal(filterAchievements(SAMPLE_LIST, 'All', 'unlocked').length, 1);
    assert.equal(filterAchievements(SAMPLE_LIST, 'All', 'in_progress').length, 1);
    assert.equal(filterAchievements(SAMPLE_LIST, 'Consistency', 'unlocked').length, 0);
  });

  it('builds localized requirement summaries with singular/plural units', () => {
    assert.equal(
      getAchievementRequirementSummary(SAMPLE_LIST[0], 'en'),
      'Target reached (1 session)'
    );
    assert.equal(
      getAchievementRequirementSummary(SAMPLE_LIST[1], 'id'),
      'Tersisa 75 menit untuk membuka (75/150)'
    );
  });

  it('splits unlocked vs locked groups and resolves latest unlocked milestone honestly', () => {
    const groups = splitAchievementsByUnlocked(SAMPLE_LIST);
    assert.equal(groups.unlocked.length, 1);
    assert.equal(groups.locked.length, 2);
    assert.equal(getLatestUnlockedAchievement(SAMPLE_LIST)?.id, 'a1');
    assert.equal(getLatestUnlockedAchievement(groups.locked), null);
  });
});

