import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACHIEVEMENT_CATALOG,
  calculateSessionXp,
  calculateStreakInfo,
  calculateTotalXp,
  evaluateAchievements,
  getLevelInfo,
} from './gamification.ts';
import {
  buildMonthlyProgressData,
  deriveDashboardMetrics,
  exportSessionsToCsv,
  generateDeterministicInsights,
} from './analytics.ts';
import { validateRegistration } from './validation.ts';
import {
  appendUniqueNotification,
  groupNotifications,
  pruneNotificationsByRetention,
} from './notifications.ts';
import { aiService, buildAiContextSummary, getSuggestedPrompts } from '../services/aiService.ts';
import { mlService } from '../services/mlService.ts';
import { authService } from '../services/authService.ts';
import type { FocusSession, NotificationItem, UserProfile } from '../types/index.ts';

function makeSession(overrides: Partial<FocusSession> = {}): FocusSession {
  return {
    id: 'sess-1',
    userId: 'user-1',
    date: '2026-11-21',
    startTime: '09:30',
    startedAtIso: '2026-11-21T09:30:00.000Z',
    endedAtIso: '2026-11-21T09:55:00.000Z',
    plannedMinutes: 25,
    actualFocusSeconds: 25 * 60,
    awaySeconds: 0,
    awayEvents: 0,
    phoneLiftEvents: 0,
    disconnectEvents: 0,
    status: 'Completed',
    xpEarned: 30,
    ...overrides,
  };
}

test('XP calculation follows floor(actualMinutes) + 5 completion bonus', () => {
  assert.equal(calculateSessionXp(25 * 60, 'Completed'), 30);
  assert.equal(calculateSessionXp(10 * 60 + 45, 'Manually Ended'), 10);
  assert.equal(calculateSessionXp(59, 'Manually Ended'), 0);
  assert.equal(calculateSessionXp(40, 'Completed'), 0);
});

test('Total XP deduplicates identical session IDs', () => {
  const s1 = makeSession({ id: 'dup-1', actualFocusSeconds: 25 * 60, status: 'Completed' });
  const s2 = makeSession({ id: 'dup-1', actualFocusSeconds: 25 * 60, status: 'Completed' });
  const s3 = makeSession({ id: 'uniq-2', actualFocusSeconds: 10 * 60, status: 'Manually Ended' });
  assert.equal(calculateTotalXp([s1, s2, s3]), 40);
});

test('Level thresholds map accurately from Level 1 to Level 6', () => {
  assert.equal(getLevelInfo(0).level, 1);
  assert.equal(getLevelInfo(99).level, 1);
  assert.equal(getLevelInfo(100).level, 2);
  assert.equal(getLevelInfo(250).level, 3);
  assert.equal(getLevelInfo(450).level, 4);
  assert.equal(getLevelInfo(700).level, 5);
  assert.equal(getLevelInfo(1000).level, 6);
  assert.equal(getLevelInfo(1000).nextLevelThreshold, null);
});

test('Streak requires >= 5 minutes per calendar day, counts multiple sessions once, and applies monthly recovery', () => {
  const sessions: FocusSession[] = [
    makeSession({ id: 's1', date: '2026-11-21', actualFocusSeconds: 180 }), // 3m
    makeSession({ id: 's2', date: '2026-11-21', actualFocusSeconds: 180 }), // +3m = 6m today
    // 2026-11-20 missed (1 day gap in same month -> 1 recovery used)
    makeSession({ id: 's3', date: '2026-11-19', actualFocusSeconds: 600 }),
    makeSession({ id: 's4', date: '2026-11-18', actualFocusSeconds: 900 }),
  ];

  const streak = calculateStreakInfo(sessions, '2026-11-21');
  assert.equal(streak.todayQualified, true);
  assert.equal(streak.recoveriesUsedThisMonth, 1);
  assert.equal(streak.recoveriesRemaining, 2);
  assert.equal(streak.currentStreak, 4);
  assert.deepEqual(streak.recoveredDates, ['2026-11-20']);
});

test('Achievement catalog has exact 26 achievements across 5 categories and evaluates progress', () => {
  assert.equal(ACHIEVEMENT_CATALOG.length, 26);
  const categories = new Set(ACHIEVEMENT_CATALOG.map((a) => a.category));
  assert.equal(categories.size, 5);

  const sessions = [makeSession({ id: 's1', actualFocusSeconds: 25 * 60, status: 'Completed' })];
  const streak = calculateStreakInfo(sessions, '2026-11-21');
  const evaluated = evaluateAchievements({
    sessions,
    streakInfo: streak,
    aiMessageCount: 1,
    factsExploredCount: 1,
  });
  const firstSpark = evaluated.find((a) => a.id === 'fm_first_spark');
  const firstAi = evaluated.find((a) => a.id === 'le_curious_mind');
  const firstFact = evaluated.find((a) => a.id === 'le_knowledge_seeker');
  assert.equal(firstSpark?.unlocked, true);
  assert.equal(firstAi?.unlocked, true);
  assert.equal(firstFact?.unlocked, true);
});

test('Analytics metrics, monthly rolling 4-week breakdown, CSV export, and ML demo adapter guard behave truthfully', () => {
  const sparse = [makeSession({ id: 's1' }), makeSession({ id: 's2' })];
  assert.equal(generateDeterministicInsights(sparse).length, 0);
  const sparseMl = mlService.generateDemoPrediction(sparse);
  assert.equal(sparseMl.isDemonstration, true);
  assert.equal(sparseMl.available, false);
  assert.equal(sparseMl.confidenceScore, null);

  const rich = [
    makeSession({ id: 's1', awayEvents: 1, phoneLiftEvents: 2 }),
    makeSession({ id: 's2', status: 'Manually Ended', actualFocusSeconds: 600 }),
    makeSession({ id: 's3', startTime: '19:00' }),
  ];
  const metrics = deriveDashboardMetrics(rich);
  assert.equal(metrics.totalSessions, 3);
  assert.equal(metrics.completedSessions, 2);
  assert.equal(metrics.completionRate, 67);
  assert.equal(metrics.totalAwayEvents, 1);
  assert.equal(metrics.totalPhoneLiftEvents, 2);

  const monthly = buildMonthlyProgressData(rich, '2026-11-21', 'en');
  assert.equal(monthly.length, 4);
  assert.equal(monthly[3].focusMinutes, 60);

  const mlSummary = mlService.generateDemoPrediction(rich);
  assert.equal(mlSummary.isDemonstration, true);
  assert.equal(mlSummary.available, true);
  assert.equal(mlSummary.confidenceScore, null); // Never fabricated

  const insights = generateDeterministicInsights(rich);
  assert.ok(insights.length >= 2);
  assert.equal(insights[0].sampleSize, 3);

  const csv = exportSessionsToCsv(rich);
  assert.ok(csv.includes('Session ID,Date,Start Time'));
  assert.ok(csv.includes('s1,2026-11-21,09:30'));
});

test('Registration validation enforces name rules, email uniqueness, password spaces/strength, and separate Terms & Privacy consent', () => {
  const invalid = validateRegistration({
    name: '12345',
    email: 'nadia@focuslamp.demo',
    password: 'pass word1',
    confirmPassword: 'other',
    acceptedTerms: false,
    acceptedPrivacy: false,
    existingEmails: ['nadia@focuslamp.demo'],
  });
  assert.ok(invalid.name);
  assert.ok(invalid.email);
  assert.ok(invalid.password);
  assert.ok(invalid.confirmPassword);
  assert.ok(invalid.acceptedTerms);
  assert.ok(invalid.acceptedPrivacy);

  const valid = validateRegistration({
    name: "Siti O'Connor-Rahma",
    email: 'siti@campus.edu',
    password: 'focuspass1',
    confirmPassword: 'focuspass1',
    acceptedTerms: true,
    acceptedPrivacy: true,
    existingEmails: ['nadia@focuslamp.demo'],
  });
  assert.deepEqual(valid, {});
});

test('Simulated auth token validation enforces expiration and single-use behavior', () => {
  const now = 1_700_000_000_000;
  const reset = authService.createResetToken('nadia@focuslamp.demo', now);
  assert.equal(authService.validateToken(reset, now + 60_000).valid, true);
  assert.equal(authService.validateToken(reset, now + 31 * 60_000).reason, 'expired');
  assert.equal(authService.validateToken({ ...reset, used: true }, now + 60_000).reason, 'already_used');

  const verify = authService.createVerificationToken('siti@campus.edu', now);
  assert.equal(authService.validateToken(verify, now + 12 * 60 * 60_000).valid, true);
  assert.equal(authService.validateToken(verify, now + 25 * 60 * 60_000).reason, 'expired');
});

test('Notification retention pruning, deduplication, and grouping preserve individual timestamps', () => {
  const now = new Date('2026-11-21T12:00:00.000Z').getTime();
  const n1: NotificationItem = {
    id: 'n1',
    eventId: 'evt-1',
    category: 'Device',
    titleEn: 'Lamp connected',
    titleId: 'Lampu terhubung',
    messageEn: 'Connected',
    messageId: 'Terhubung',
    timestampIso: '2026-11-21T11:00:00.000Z',
    read: false,
    groupKey: 'ble_connect',
  };
  const n2: NotificationItem = {
    ...n1,
    id: 'n2',
    eventId: 'evt-2',
    timestampIso: '2026-11-21T10:00:00.000Z',
  };
  const oldItem: NotificationItem = {
    ...n1,
    id: 'n-old',
    eventId: 'evt-old',
    timestampIso: '2026-11-10T10:00:00.000Z',
  };

  let list = appendUniqueNotification([], n1);
  list = appendUniqueNotification(list, n1); // duplicate eventId ignored
  list = appendUniqueNotification(list, n2);
  list = appendUniqueNotification(list, oldItem);
  assert.equal(list.length, 3);

  const pruned = pruneNotificationsByRetention(list, '3d', now);
  assert.equal(pruned.length, 2);

  const grouped = groupNotifications(pruned);
  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].items.length, 2);
  assert.equal(grouped[0].items[0].timestampIso, '2026-11-21T11:00:00.000Z');
  assert.equal(grouped[0].items[1].timestampIso, '2026-11-21T10:00:00.000Z');
});

test('FocusMate AI suggested prompts cover study tips, motivation, and focus strategies with context summary', () => {
  const enAll = getSuggestedPrompts('en', 'all');
  const idAll = getSuggestedPrompts('id', 'all');
  assert.ok(enAll.length >= 6);
  assert.equal(enAll.length, idAll.length);
  assert.equal(getSuggestedPrompts('en', 'tips').length, 2);
  assert.equal(getSuggestedPrompts('en', 'motivation').length, 2);
  assert.equal(getSuggestedPrompts('en', 'focus').length, 2);

  const mockUser: UserProfile = {
    id: 'u1',
    accountType: 'demo',
    name: 'Nadia Pratama',
    email: 'nadia@focuslamp.demo',
    emailVerified: true,
    pendingEmail: null,
    roleLabel: 'Student',
    major: 'Computer Science',
    avatarUrl: '',
    joinedAt: '2026-11-01',
    createdAtIso: '2026-11-01T08:00:00.000Z',
    isDemo: true,
    onboardingCompleted: true,
    preferences: {
      language: 'en',
      theme: 'light',
      defaultFocusMinutes: 25,
      dailyTargetMinutes: 60,
      phoneLiftToleranceSeconds: 10,
      notificationsEnabled: true,
      studyRemindersEnabled: true,
      soundCuesEnabled: true,
      notificationRetention: '1m',
    },
  };
  const sessions = [makeSession({ id: 's1' }), makeSession({ id: 's2' }), makeSession({ id: 's3' })];
  const streak = calculateStreakInfo(sessions, '2026-11-21');

  const summary = buildAiContextSummary({ user: mockUser, sessions, streak, language: 'en' });
  assert.ok(summary.includes('Nadia Pratama'));
  assert.ok(summary.includes('Total Recorded Sessions: 3'));

  for (const item of enAll) {
    const preview = aiService.generateOfflineContextPreview(item.prompt, {
      user: mockUser,
      sessions,
      streak,
      language: 'en',
    });
    assert.ok(preview.startsWith('[Context Preview]'));
    assert.ok(preview.length > 35);
  }
});
