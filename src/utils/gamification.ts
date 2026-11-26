import {
  AchievementDefinition,
  AchievementStatus,
  FocusSession,
  LevelInfo,
  SessionStatus,
  StreakInfo,
} from '../types';

export const LEVEL_THRESHOLDS: { level: number; minXp: number }[] = [
  { level: 1, minXp: 0 },
  { level: 2, minXp: 100 },
  { level: 3, minXp: 250 },
  { level: 4, minXp: 450 },
  { level: 5, minXp: 700 },
  { level: 6, minXp: 1000 },
];

export const MAX_MONTHLY_RECOVERIES = 3;
export const MIN_STREAK_MINUTES_PER_DAY = 5;

/**
 * XP = floor(actual focus minutes) + completion bonus (5 XP for Completed).
 * Less than 1 full focus minute always yields 0 XP.
 */
export function calculateSessionXp(actualFocusSeconds: number, status: SessionStatus): number {
  const actualMinutes = Math.floor(Math.max(0, actualFocusSeconds) / 60);
  if (actualMinutes < 1) {
    return 0;
  }
  const completionBonus = status === 'Completed' ? 5 : 0;
  return actualMinutes + completionBonus;
}

export function calculateTotalXp(sessions: FocusSession[]): number {
  const seenSessionIds = new Set<string>();
  let total = 0;
  for (const session of sessions) {
    if (seenSessionIds.has(session.id)) continue;
    seenSessionIds.add(session.id);
    total += calculateSessionXp(session.actualFocusSeconds, session.status);
  }
  return total;
}

export function getLevelInfo(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp));
  let current = LEVEL_THRESHOLDS[0];
  let next: { level: number; minXp: number } | null = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (safeXp >= LEVEL_THRESHOLDS[i].minXp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] ?? null;
    }
  }

  if (!next) {
    return {
      level: current.level,
      currentXp: safeXp,
      currentLevelThreshold: current.minXp,
      nextLevelThreshold: null,
      progressPercent: 100,
      xpToNextLevel: 0,
    };
  }

  const span = next.minXp - current.minXp;
  const gainedInLevel = safeXp - current.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gainedInLevel / span) * 100)));

  return {
    level: current.level,
    currentXp: safeXp,
    currentLevelThreshold: current.minXp,
    nextLevelThreshold: next.minXp,
    progressPercent,
    xpToNextLevel: Math.max(0, next.minXp - safeXp),
  };
}

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToLocalDate(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return toLocalDateString(dt);
}

/**
 * Computes study streak using local calendar dates:
 * - At least 5 actual focus minutes per calendar day.
 * - Multiple sessions on the same day count once.
 * - Up to 3 recovery uses per calendar month, 1 missed day per recovery use.
 */
export function calculateStreakInfo(
  sessions: FocusSession[],
  referenceDateStr: string = toLocalDateString(new Date())
): StreakInfo {
  const minutesByDate = new Map<string, number>();
  for (const s of sessions) {
    const prev = minutesByDate.get(s.date) ?? 0;
    minutesByDate.set(s.date, prev + s.actualFocusSeconds / 60);
  }

  const todayMinutes = Math.floor(minutesByDate.get(referenceDateStr) ?? 0);
  const todayQualified = (minutesByDate.get(referenceDateStr) ?? 0) >= MIN_STREAK_MINUTES_PER_DAY;

  const qualifiedDates = new Set<string>();
  for (const [dateStr, mins] of minutesByDate.entries()) {
    if (mins >= MIN_STREAK_MINUTES_PER_DAY) {
      qualifiedDates.add(dateStr);
    }
  }

  if (qualifiedDates.size === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      todayFocusMinutes: todayMinutes,
      todayQualified: false,
      recoveriesUsedThisMonth: 0,
      recoveriesRemaining: MAX_MONTHLY_RECOVERIES,
      recoveredDates: [],
    };
  }

  const currentMonthPrefix = referenceDateStr.slice(0, 7);
  let recoveriesUsed = 0;
  const recoveredDates: string[] = [];
  let cursor = todayQualified ? referenceDateStr : addDaysToLocalDate(referenceDateStr, -1);

  let currentStreak = 0;
  let consecutiveMissed = 0;

  for (let i = 0; i < 365; i++) {
    if (qualifiedDates.has(cursor)) {
      currentStreak += 1;
      consecutiveMissed = 0;
      cursor = addDaysToLocalDate(cursor, -1);
    } else {
      consecutiveMissed += 1;
      const inCurrentMonth = cursor.startsWith(currentMonthPrefix);
      const prevDay = addDaysToLocalDate(cursor, -1);
      if (
        consecutiveMissed === 1 &&
        inCurrentMonth &&
        recoveriesUsed < MAX_MONTHLY_RECOVERIES &&
        qualifiedDates.has(prevDay)
      ) {
        recoveriesUsed += 1;
        recoveredDates.push(cursor);
        currentStreak += 1;
        cursor = addDaysToLocalDate(cursor, -1);
      } else {
        break;
      }
    }
  }

  const sortedDates = Array.from(qualifiedDates).sort();
  let longestStreak = 0;
  let running = 0;
  let prevDate: string | null = null;
  const monthlyRecoveriesForHistory = new Map<string, number>();

  for (const dateStr of sortedDates) {
    if (!prevDate) {
      running = 1;
    } else {
      const expectedNext = addDaysToLocalDate(prevDate, 1);
      const twoDaysNext = addDaysToLocalDate(prevDate, 2);
      if (dateStr === expectedNext) {
        running += 1;
      } else if (dateStr === twoDaysNext) {
        const missedDay = expectedNext;
        const monthKey = missedDay.slice(0, 7);
        const usedInMonth = monthlyRecoveriesForHistory.get(monthKey) ?? 0;
        if (usedInMonth < MAX_MONTHLY_RECOVERIES) {
          monthlyRecoveriesForHistory.set(monthKey, usedInMonth + 1);
          running += 2;
        } else {
          running = 1;
        }
      } else {
        running = 1;
      }
    }
    if (running > longestStreak) longestStreak = running;
    prevDate = dateStr;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    todayFocusMinutes: todayMinutes,
    todayQualified,
    recoveriesUsedThisMonth: recoveriesUsed,
    recoveriesRemaining: Math.max(0, MAX_MONTHLY_RECOVERIES - recoveriesUsed),
    recoveredDates,
  };
}

// 26 achievements matching FocusLamp Master Prompt Section 18.4
export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  // 1. Focus Milestones (6)
  {
    id: 'fm_first_spark',
    category: 'Focus Milestones',
    titleEn: 'First Spark',
    titleId: 'Percikan Pertama',
    descriptionEn: 'Complete your very first focus session.',
    descriptionId: 'Selesaikan sesi fokus pertama Anda.',
    target: 1,
    rewardLabelEn: '+15 Milestone Badge',
    rewardLabelId: 'Lencana Tonggak +15',
    metric: 'completed_sessions',
  },
  {
    id: 'fm_getting_started',
    category: 'Focus Milestones',
    titleEn: 'Getting Started',
    titleId: 'Langkah Awal',
    descriptionEn: 'Accumulate 60 actual focus minutes across your sessions.',
    descriptionId: 'Kumpulkan 60 menit fokus aktual di seluruh sesi.',
    target: 60,
    rewardLabelEn: 'Starter Ribbon',
    rewardLabelId: 'Pita Pemula',
    metric: 'total_focus_minutes',
  },
  {
    id: 'fm_focus_builder',
    category: 'Focus Milestones',
    titleEn: 'Focus Builder',
    titleId: 'Pembangun Fokus',
    descriptionEn: 'Accumulate 150 actual focus minutes.',
    descriptionId: 'Kumpulkan 150 menit fokus aktual.',
    target: 150,
    rewardLabelEn: 'Bronze Lamp Badge',
    rewardLabelId: 'Lencana Lampu Perunggu',
    metric: 'total_focus_minutes',
  },
  {
    id: 'fm_deep_focus',
    category: 'Focus Milestones',
    titleEn: 'Deep Focus',
    titleId: 'Fokus Mendalam',
    descriptionEn: 'Accumulate 300 actual focus minutes.',
    descriptionId: 'Kumpulkan 300 menit fokus aktual.',
    target: 300,
    rewardLabelEn: 'Silver Lamp Badge',
    rewardLabelId: 'Lencana Lampu Perak',
    metric: 'total_focus_minutes',
  },
  {
    id: 'fm_one_hour_club',
    category: 'Focus Milestones',
    titleEn: 'One Hour Club',
    titleId: 'Klub Satu Jam',
    descriptionEn: 'Reach 60 actual focus minutes within a single calendar day.',
    descriptionId: 'Capai 60 menit fokus aktual dalam satu hari kalender.',
    target: 60,
    rewardLabelEn: 'Daily Hour Seal',
    rewardLabelId: 'Segel Satu Jam Harian',
    metric: 'best_daily_minutes',
  },
  {
    id: 'fm_long_journey',
    category: 'Focus Milestones',
    titleEn: 'Long Journey',
    titleId: 'Perjalanan Panjang',
    descriptionEn: 'Accumulate 600 actual focus minutes.',
    descriptionId: 'Kumpulkan 600 menit fokus aktual.',
    target: 600,
    rewardLabelEn: 'Gold Lamp Badge',
    rewardLabelId: 'Lencana Lampu Emas',
    metric: 'total_focus_minutes',
  },

  // 2. Consistency (6)
  {
    id: 'con_three_day_rhythm',
    category: 'Consistency',
    titleEn: 'Three-Day Rhythm',
    titleId: 'Ritme Tiga Hari',
    descriptionEn: 'Study at least 5 minutes across 3 distinct days.',
    descriptionId: 'Belajar minimal 5 menit pada 3 hari berbeda.',
    target: 3,
    rewardLabelEn: 'Habit Starter',
    rewardLabelId: 'Pemula Kebiasaan',
    metric: 'active_days',
  },
  {
    id: 'con_week_of_focus',
    category: 'Consistency',
    titleEn: 'Week of Focus',
    titleId: 'Sepekan Fokus',
    descriptionEn: 'Maintain a 7-day focus streak.',
    descriptionId: 'Pertahankan streak fokus selama 7 hari.',
    target: 7,
    rewardLabelEn: 'Weekly Ribbon',
    rewardLabelId: 'Pita Mingguan',
    metric: 'current_streak',
  },
  {
    id: 'con_two_week_discipline',
    category: 'Consistency',
    titleEn: 'Two-Week Discipline',
    titleId: 'Disiplin Dua Minggu',
    descriptionEn: 'Maintain a 14-day focus streak.',
    descriptionId: 'Pertahankan streak fokus selama 14 hari.',
    target: 14,
    rewardLabelEn: 'Streak Tier II',
    rewardLabelId: 'Tingkat Streak II',
    metric: 'current_streak',
  },
  {
    id: 'con_monthly_momentum',
    category: 'Consistency',
    titleEn: 'Monthly Momentum',
    titleId: 'Momentum Bulanan',
    descriptionEn: 'Log qualifying study days on 20 calendar days.',
    descriptionId: 'Catat hari belajar yang memenuhi syarat pada 20 hari kalender.',
    target: 20,
    rewardLabelEn: 'Monthly Emblem',
    rewardLabelId: 'Emblem Bulanan',
    metric: 'active_days',
  },
  {
    id: 'con_back_on_track',
    category: 'Consistency',
    titleEn: 'Back on Track',
    titleId: 'Kembali ke Jalur',
    descriptionEn: 'Resume a qualifying study streak after a missed day or recovery.',
    descriptionId: 'Lanjutkan kembali streak belajar setelah hari terlewat atau pemulihan.',
    target: 1,
    rewardLabelEn: 'Habit Resilience',
    rewardLabelId: 'Ketangguhan Kebiasaan',
    metric: 'comeback_events',
  },
  {
    id: 'con_consistency_champion',
    category: 'Consistency',
    titleEn: 'Consistency Champion',
    titleId: 'Juara Konsistensi',
    descriptionEn: 'Reach a 5-day streak without using any monthly recoveries.',
    descriptionId: 'Capai streak 5 hari tanpa menggunakan pemulihan bulanan.',
    target: 5,
    rewardLabelEn: 'Pure Consistency',
    rewardLabelId: 'Konsistensi Murni',
    metric: 'recoveries_unused_streak',
  },

  // 3. Session Mastery (5)
  {
    id: 'sm_session_starter',
    category: 'Session Mastery',
    titleEn: 'Session Starter',
    titleId: 'Perintis Sesi',
    descriptionEn: 'Complete 5 focus sessions.',
    descriptionId: 'Selesaikan 5 sesi fokus.',
    target: 5,
    rewardLabelEn: 'Cadence Tier I',
    rewardLabelId: 'Irama Tingkat I',
    metric: 'completed_sessions',
  },
  {
    id: 'sm_routine_maker',
    category: 'Session Mastery',
    titleEn: 'Routine Maker',
    titleId: 'Pembentuk Rutinitas',
    descriptionEn: 'Complete 15 focus sessions.',
    descriptionId: 'Selesaikan 15 sesi fokus.',
    target: 15,
    rewardLabelEn: 'Cadence Tier II',
    rewardLabelId: 'Irama Tingkat II',
    metric: 'completed_sessions',
  },
  {
    id: 'sm_focus_enthusiast',
    category: 'Session Mastery',
    titleEn: 'Focus Enthusiast',
    titleId: 'Pegiat Fokus',
    descriptionEn: 'Complete 5 sessions with zero phone-lift events.',
    descriptionId: 'Selesaikan 5 sesi tanpa mengangkat ponsel sama sekali.',
    target: 5,
    rewardLabelEn: 'Dock Discipline',
    rewardLabelId: 'Disiplin Dock',
    metric: 'zero_lift_sessions',
  },
  {
    id: 'sm_session_expert',
    category: 'Session Mastery',
    titleEn: 'Session Expert',
    titleId: 'Ahli Sesi',
    descriptionEn: 'Complete 5 sessions without leaving your study desk.',
    descriptionId: 'Selesaikan 5 sesi tanpa meninggalkan meja belajar.',
    target: 5,
    rewardLabelEn: 'Presence Anchor',
    rewardLabelId: 'Jangkar Kehadiran',
    metric: 'zero_away_sessions',
  },
  {
    id: 'sm_hundred_sessions',
    category: 'Session Mastery',
    titleEn: 'Hundred Sessions',
    titleId: 'Seratus Sesi',
    descriptionEn: 'Complete 100 focus sessions.',
    descriptionId: 'Selesaikan 100 sesi fokus.',
    target: 100,
    rewardLabelEn: 'Master Scholar Crest',
    rewardLabelId: 'Lencana Master Belajar',
    metric: 'completed_sessions',
  },

  // 4. Learning Explorer (4)
  {
    id: 'le_curious_mind',
    category: 'Learning Explorer',
    titleEn: 'Curious Mind',
    titleId: 'Pikiran Ingin Tahu',
    descriptionEn: 'Ask FocusMate AI your first study question.',
    descriptionId: 'Ajukan pertanyaan belajar pertama Anda ke FocusMate AI.',
    target: 1,
    rewardLabelEn: 'Guided Curiosity',
    rewardLabelId: 'Rasa Ingin Tahu Terarah',
    metric: 'ai_chats',
  },
  {
    id: 'le_knowledge_seeker',
    category: 'Learning Explorer',
    titleEn: 'Knowledge Seeker',
    titleId: 'Pencari Pengetahuan',
    descriptionEn: 'Explore your first evidence-based study science fact.',
    descriptionId: 'Jelajahi fakta sains belajar berbasis bukti pertama Anda.',
    target: 1,
    rewardLabelEn: 'Science Reader',
    rewardLabelId: 'Pembaca Sains',
    metric: 'facts_explored',
  },
  {
    id: 'le_learning_explorer',
    category: 'Learning Explorer',
    titleEn: 'Learning Explorer',
    titleId: 'Penjelajah Belajar',
    descriptionEn: 'Explore 3 evidence-based focus and memory science facts.',
    descriptionId: 'Jelajahi 3 fakta sains tentang fokus dan memori.',
    target: 3,
    rewardLabelEn: 'Research Curious',
    rewardLabelId: 'Penggemar Riset',
    metric: 'facts_explored',
  },
  {
    id: 'le_knowledge_collector',
    category: 'Learning Explorer',
    titleEn: 'Knowledge Collector',
    titleId: 'Kolektor Pengetahuan',
    descriptionEn: 'Explore 6 verified cognitive and sleep science facts.',
    descriptionId: 'Jelajahi 6 fakta sains kognitif dan tidur terverifikasi.',
    target: 6,
    rewardLabelEn: 'Curated Library',
    rewardLabelId: 'Pustaka Terkurasi',
    metric: 'facts_explored',
  },

  // 5. Personal Growth (5)
  {
    id: 'pg_small_improvement',
    category: 'Personal Growth',
    titleEn: 'Small Improvement',
    titleId: 'Perbaikan Kecil',
    descriptionEn: 'Save a post-session study reflection note.',
    descriptionId: 'Simpan catatan refleksi belajar setelah sesi selesai.',
    target: 1,
    rewardLabelEn: 'Self-Observer',
    rewardLabelId: 'Pengamat Diri',
    metric: 'reflections_written',
  },
  {
    id: 'pg_better_completion',
    category: 'Personal Growth',
    titleEn: 'Better Completion',
    titleId: 'Penyelesaian Lebih Baik',
    descriptionEn: 'Complete 10 sessions with zero phone-lift interruptions.',
    descriptionId: 'Selesaikan 10 sesi tanpa gangguan mengangkat ponsel.',
    target: 10,
    rewardLabelEn: 'Steady Focus',
    rewardLabelId: 'Fokus Stabil',
    metric: 'zero_lift_sessions',
  },
  {
    id: 'pg_weekly_comeback',
    category: 'Personal Growth',
    titleEn: 'Weekly Comeback',
    titleId: 'Kebangkitan Mingguan',
    descriptionEn: 'Complete a session after recovering from a connection interruption.',
    descriptionId: 'Selesaikan sesi setelah pulih dari gangguan koneksi.',
    target: 1,
    rewardLabelEn: 'Signal Resilience',
    rewardLabelId: 'Ketangguhan Sinyal',
    metric: 'reconnect_resilience',
  },
  {
    id: 'pg_personal_best',
    category: 'Personal Growth',
    titleEn: 'Personal Best',
    titleId: 'Rekor Pribadi',
    descriptionEn: 'Complete a single focus block of at least 45 actual minutes.',
    descriptionId: 'Selesaikan satu blok fokus minimal 45 menit aktual.',
    target: 45,
    rewardLabelEn: 'Deep Block Record',
    rewardLabelId: 'Rekor Blok Mendalam',
    metric: 'longest_session_minutes',
  },
  {
    id: 'pg_balanced_learner',
    category: 'Personal Growth',
    titleEn: 'Balanced Learner',
    titleId: 'Pembelajar Seimbang',
    descriptionEn: 'Log focus sessions across 3 distinct study subjects.',
    descriptionId: 'Catat sesi fokus di 3 topik belajar yang berbeda.',
    target: 3,
    rewardLabelEn: 'Broad Study Rhythm',
    rewardLabelId: 'Ritme Belajar Luas',
    metric: 'distinct_subjects',
  },
];

export interface AchievementEvaluationContext {
  sessions: FocusSession[];
  streakInfo: StreakInfo;
  aiMessageCount: number;
  factsExploredCount: number;
}

export function evaluateAchievements(ctx: AchievementEvaluationContext): AchievementStatus[] {
  const { sessions, streakInfo, aiMessageCount, factsExploredCount } = ctx;

  const completedSessions = sessions.filter((s) => s.status === 'Completed');
  const totalFocusMinutes = Math.floor(
    sessions.reduce((acc, s) => acc + s.actualFocusSeconds, 0) / 60
  );
  const longestSessionMinutes = sessions.reduce(
    (max, s) => Math.max(max, Math.floor(s.actualFocusSeconds / 60)),
    0
  );

  const activeDayTotals = new Map<string, number>();
  for (const s of sessions) {
    activeDayTotals.set(s.date, (activeDayTotals.get(s.date) ?? 0) + s.actualFocusSeconds / 60);
  }
  const activeDayMinutes = Array.from(activeDayTotals.values());
  const activeDaysCount = activeDayMinutes.filter(
    (m) => m >= MIN_STREAK_MINUTES_PER_DAY
  ).length;
  const bestDailyMinutes = activeDayMinutes.reduce(
    (max, mins) => Math.max(max, Math.floor(mins)),
    0
  );

  const zeroLiftSessions = completedSessions.filter((s) => s.phoneLiftEvents === 0).length;
  const zeroAwaySessions = completedSessions.filter((s) => s.awayEvents === 0).length;
  const reflectionsWritten = sessions.filter((s) => (s.reflection ?? '').trim().length > 0).length;
  const reconnectResilience = completedSessions.filter((s) => s.disconnectEvents > 0).length;
  const pureStreak =
    streakInfo.recoveriesUsedThisMonth === 0 ? streakInfo.currentStreak : 0;

  // Comeback count: either a monthly recovery used or multiple qualifying date clusters
  const sortedQualifyingDates = Array.from(activeDayTotals.entries())
    .filter(([, mins]) => mins >= MIN_STREAK_MINUTES_PER_DAY)
    .map(([d]) => d)
    .sort();
  let gapRestarts = 0;
  for (let i = 1; i < sortedQualifyingDates.length; i++) {
    if (addDaysToLocalDate(sortedQualifyingDates[i - 1], 1) !== sortedQualifyingDates[i]) {
      gapRestarts += 1;
    }
  }
  const comebackEvents = Math.max(streakInfo.recoveriesUsedThisMonth, gapRestarts);

  const distinctSubjects = new Set(
    sessions
      .map((s) => (s.subjectTag ?? '').trim().toLowerCase())
      .filter((tag) => tag.length > 0)
  ).size;

  const metricValues: Record<AchievementDefinition['metric'], number> = {
    completed_sessions: completedSessions.length,
    total_focus_minutes: totalFocusMinutes,
    best_daily_minutes: bestDailyMinutes,
    longest_session_minutes: longestSessionMinutes,
    current_streak: streakInfo.currentStreak,
    active_days: activeDaysCount,
    zero_lift_sessions: zeroLiftSessions,
    zero_away_sessions: zeroAwaySessions,
    reflections_written: reflectionsWritten,
    ai_chats: aiMessageCount,
    facts_explored: factsExploredCount,
    recoveries_unused_streak: pureStreak,
    comeback_events: comebackEvents,
    reconnect_resilience: reconnectResilience,
    distinct_subjects: distinctSubjects,
  };

  return ACHIEVEMENT_CATALOG.map((def) => {
    const raw = metricValues[def.metric] ?? 0;
    const progress = Math.min(def.target, Math.max(0, raw));
    return {
      ...def,
      progress,
      unlocked: raw >= def.target,
    };
  });
}
