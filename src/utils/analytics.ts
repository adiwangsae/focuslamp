import { AIInsight, FocusSession, Language, SessionStatus } from '../types';
import { addDaysToLocalDate, toLocalDateString } from './gamification';

export interface DashboardMetrics {
  totalFocusMinutes: number;
  completedSessions: number;
  totalSessions: number;
  completionRate: number;
  averageSessionMinutes: number;
  totalAwayEvents: number;
  totalPhoneLiftEvents: number;
  totalDisconnectEvents: number;
}

export interface DailyChartPoint {
  date: string;
  label: string;
  focusMinutes: number;
  sessions: number;
}

export interface WeeklyComparisonPoint {
  week: string;
  thisWeekMinutes: number;
  lastWeekMinutes: number;
}

export interface MonthlyProgressPoint {
  weekLabel: string;
  focusMinutes: number;
  completedCount: number;
}

export interface StatusDistributionPoint {
  status: SessionStatus;
  count: number;
}

export interface FrequencyBucketPoint {
  range: string;
  count: number;
}

export function deriveDashboardMetrics(sessions: FocusSession[]): DashboardMetrics {
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === 'Completed').length;
  const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.actualFocusSeconds, 0);
  const totalFocusMinutes = Math.round(totalFocusSeconds / 60);
  const completionRate =
    totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const averageSessionMinutes =
    totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;

  return {
    totalFocusMinutes,
    completedSessions,
    totalSessions,
    completionRate,
    averageSessionMinutes,
    totalAwayEvents: sessions.reduce((acc, s) => acc + s.awayEvents, 0),
    totalPhoneLiftEvents: sessions.reduce((acc, s) => acc + s.phoneLiftEvents, 0),
    totalDisconnectEvents: sessions.reduce((acc, s) => acc + s.disconnectEvents, 0),
  };
}

export function buildDailyChartData(
  sessions: FocusSession[],
  days: number = 7,
  referenceDateStr: string = toLocalDateString(new Date())
): DailyChartPoint[] {
  const result: DailyChartPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateStr = addDaysToLocalDate(referenceDateStr, -i);
    const daySessions = sessions.filter((s) => s.date === dateStr);
    const focusMinutes = Math.round(
      daySessions.reduce((acc, s) => acc + s.actualFocusSeconds, 0) / 60
    );
    const [, m, d] = dateStr.split('-');
    result.push({
      date: dateStr,
      label: `${m}/${d}`,
      focusMinutes,
      sessions: daySessions.length,
    });
  }
  return result;
}

export function buildWeeklyComparisonData(
  sessions: FocusSession[],
  referenceDateStr: string = toLocalDateString(new Date()),
  language: Language = 'en'
): WeeklyComparisonPoint[] {
  const todayLabel = language === 'id' ? 'Hari Ini' : 'Today';
  const dayPrefix = language === 'id' ? 'H' : 'D';
  const labels = [
    `${dayPrefix}-6`,
    `${dayPrefix}-5`,
    `${dayPrefix}-4`,
    `${dayPrefix}-3`,
    `${dayPrefix}-2`,
    `${dayPrefix}-1`,
    todayLabel,
  ];
  return labels.map((label, idx) => {
    const offset = idx - 6;
    const thisWeekDate = addDaysToLocalDate(referenceDateStr, offset);
    const lastWeekDate = addDaysToLocalDate(referenceDateStr, offset - 7);

    const thisWeekMinutes = Math.round(
      sessions
        .filter((s) => s.date === thisWeekDate)
        .reduce((acc, s) => acc + s.actualFocusSeconds, 0) / 60
    );
    const lastWeekMinutes = Math.round(
      sessions
        .filter((s) => s.date === lastWeekDate)
        .reduce((acc, s) => acc + s.actualFocusSeconds, 0) / 60
    );

    return {
      week: label,
      thisWeekMinutes,
      lastWeekMinutes,
    };
  });
}

export function buildMonthlyProgressData(
  sessions: FocusSession[],
  referenceDateStr: string = toLocalDateString(new Date()),
  language: Language = 'en'
): MonthlyProgressPoint[] {
  // 4 rolling 7-day windows covering the last 28 days
  const buckets: MonthlyProgressPoint[] = [];
  for (let w = 3; w >= 0; w--) {
    const endOffset = -(w * 7);
    const startOffset = endOffset - 6;
    const dates = new Set<string>();
    for (let d = startOffset; d <= endOffset; d++) {
      dates.add(addDaysToLocalDate(referenceDateStr, d));
    }
    const matching = sessions.filter((s) => dates.has(s.date));
    const focusMinutes = Math.round(
      matching.reduce((acc, s) => acc + s.actualFocusSeconds, 0) / 60
    );
    const completedCount = matching.filter((s) => s.status === 'Completed').length;
    const idx = 4 - w;
    buckets.push({
      weekLabel: language === 'id' ? `Minggu ${idx}` : `Week ${idx}`,
      focusMinutes,
      completedCount,
    });
  }
  return buckets;
}

export function buildCompletionDistribution(sessions: FocusSession[]): StatusDistributionPoint[] {
  const statuses: SessionStatus[] = ['Completed', 'Manually Ended', 'Interrupted', 'Abandoned'];
  return statuses
    .map((status) => ({
      status,
      count: sessions.filter((s) => s.status === status).length,
    }))
    .filter((entry) => entry.count > 0);
}

export function buildSessionFrequencyData(sessions: FocusSession[]): FrequencyBucketPoint[] {
  const buckets: { range: string; min: number; max: number }[] = [
    { range: '0-15m', min: 0, max: 15 },
    { range: '16-30m', min: 16, max: 30 },
    { range: '31-45m', min: 31, max: 45 },
    { range: '46m+', min: 46, max: 999 },
  ];
  return buckets.map((b) => ({
    range: b.range,
    count: sessions.filter((s) => {
      const mins = Math.round(s.actualFocusSeconds / 60);
      return mins >= b.min && mins <= b.max;
    }).length,
  }));
}

export function exportSessionsToCsv(sessions: FocusSession[]): string {
  const header = [
    'Session ID',
    'Date',
    'Start Time',
    'Planned Minutes',
    'Actual Focus Minutes',
    'Away Minutes',
    'Phone Lift Events',
    'Away Events',
    'Status',
    'XP Earned',
    'Subject',
  ].join(',');

  const rows = sessions.map((s) => {
    const actualMins = (s.actualFocusSeconds / 60).toFixed(1);
    const awayMins = (s.awaySeconds / 60).toFixed(1);
    const escapedSubject = `"${(s.subjectTag ?? '').replace(/"/g, '""')}"`;
    return [
      s.id,
      s.date,
      s.startTime,
      s.plannedMinutes,
      actualMins,
      awayMins,
      s.phoneLiftEvents,
      s.awayEvents,
      `"${s.status}"`,
      s.xpEarned,
      escapedSubject,
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

export const MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT = 3;

export function generateDeterministicInsights(sessions: FocusSession[]): AIInsight[] {
  if (sessions.length < MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT) {
    return [];
  }

  const metrics = deriveDashboardMetrics(sessions);
  const sampleSize = sessions.length;
  const insights: AIInsight[] = [];

  const avgLiftPerSession = +(metrics.totalPhoneLiftEvents / sampleSize).toFixed(1);
  insights.push({
    id: 'insight_phone_dock',
    titleEn: 'Phone Dock Adherence & Completion',
    titleId: 'Kepatuhan Dock Ponsel & Penyelesaian',
    observedDataEn: `${metrics.totalPhoneLiftEvents} phone lift event(s) recorded across ${sampleSize} sessions (avg ${avgLiftPerSession}/session), with a ${metrics.completionRate}% session completion rate.`,
    observedDataId: `${metrics.totalPhoneLiftEvents} kali ponsel diangkat tercatat dalam ${sampleSize} sesi (rata-rata ${avgLiftPerSession}/sesi), dengan tingkat penyelesaian ${metrics.completionRate}%.`,
    interpretationEn:
      avgLiftPerSession <= 0.5
        ? 'Keeping your phone seated on the FocusLamp dock correlates with steady session completion.'
        : 'Frequent phone lifts appear alongside early session interruptions.',
    interpretationId:
      avgLiftPerSession <= 0.5
        ? 'Menjaga ponsel tetap di dock FocusLamp berkorelasi dengan tingkat penyelesaian sesi yang stabil.'
        : 'Pengangkatan ponsel yang berulang muncul bersamaan dengan sesi yang terhenti lebih awal.',
    suggestedActionEn:
      avgLiftPerSession <= 0.5
        ? 'Maintain your current 25–30 minute block length with the phone placed face-down on the dock.'
        : 'Try enabling a shorter 15–20 minute block first before lifting the phone during breaks.',
    suggestedActionId:
      avgLiftPerSession <= 0.5
        ? 'Pertahankan blok 25–30 menit dengan ponsel diletakkan menghadap ke bawah di dock.'
        : 'Coba gunakan blok 15–20 menit terlebih dahulu sebelum memeriksa ponsel saat jeda.',
    periodEn: 'Recent recorded sessions',
    periodId: 'Sesi tercatat terbaru',
    sampleSize,
  });

  const morningSessions = sessions.filter((s) => Number(s.startTime.split(':')[0] ?? 12) < 12);
  const laterSessions = sessions.filter((s) => Number(s.startTime.split(':')[0] ?? 12) >= 12);
  const morningRate =
    morningSessions.length > 0
      ? Math.round(
          (morningSessions.filter((s) => s.status === 'Completed').length /
            morningSessions.length) *
            100
        )
      : 0;
  const laterRate =
    laterSessions.length > 0
      ? Math.round(
          (laterSessions.filter((s) => s.status === 'Completed').length / laterSessions.length) *
            100
        )
      : 0;

  insights.push({
    id: 'insight_time_window',
    titleEn: 'Time-of-Day Session Consistency',
    titleId: 'Konsistensi Waktu Belajar Harian',
    observedDataEn: `Morning sessions (<12:00): ${morningSessions.length} logged (${morningRate}% completed). Afternoon/Evening (>=12:00): ${laterSessions.length} logged (${laterRate}% completed).`,
    observedDataId: `Sesi pagi (<12:00): ${morningSessions.length} sesi (${morningRate}% selesai). Siang/Malam (>=12:00): ${laterSessions.length} sesi (${laterRate}% selesai).`,
    interpretationEn:
      morningRate >= laterRate && morningSessions.length > 0
        ? 'Your recorded sessions show higher completion rates earlier in the day.'
        : 'Your recorded sessions show stronger follow-through during afternoon or evening study blocks.',
    interpretationId:
      morningRate >= laterRate && morningSessions.length > 0
        ? 'Data sesi Anda menunjukkan tingkat penyelesaian lebih tinggi pada jam pagi.'
        : 'Data sesi Anda menunjukkan penyelesaian lebih stabil pada blok belajar siang atau malam.',
    suggestedActionEn:
      morningRate >= laterRate && morningSessions.length > 0
        ? 'Schedule demanding reading or problem sets in your morning window.'
        : 'Reserve your afternoon/evening window for deeper 30–45 minute study blocks.',
    suggestedActionId:
      morningRate >= laterRate && morningSessions.length > 0
        ? 'Jadwalkan materi bacaan atau latihan soal tersulit pada jendela pagi Anda.'
        : 'Gunakan jendela siang/malam Anda untuk blok belajar mendalam 30–45 menit.',
    periodEn: 'All logged sessions',
    periodId: 'Seluruh sesi tercatat',
    sampleSize,
  });

  const avgAwayPerSession = +(metrics.totalAwayEvents / sampleSize).toFixed(1);
  insights.push({
    id: 'insight_presence_pattern',
    titleEn: 'Desk Presence & Block Length Fit',
    titleId: 'Kehadiran di Meja & Kesesuaian Durasi',
    observedDataEn: `Average session duration is ${metrics.averageSessionMinutes} min with ${metrics.totalAwayEvents} away-from-desk events (${avgAwayPerSession}/session).`,
    observedDataId: `Rata-rata durasi sesi ${metrics.averageSessionMinutes} menit dengan ${metrics.totalAwayEvents} kejadian meninggalkan meja (${avgAwayPerSession}/sesi).`,
    interpretationEn:
      'Physical presence time only measures time seated near the lamp—not cognitive attention—and helps reveal whether block lengths match your natural break rhythm.',
    interpretationId:
      'Sensor kehadiran hanya mencatat keberadaan fisik di meja—bukan fokus kognitif—untuk membantu menilai apakah durasi blok sesuai dengan ritme istirahat Anda.',
    suggestedActionEn:
      avgAwayPerSession > 1
        ? 'Consider splitting 45-minute sessions into two 20-minute blocks with a planned 5-minute walk.'
        : 'Your current block duration aligns cleanly with your seated study cadence.',
    suggestedActionId:
      avgAwayPerSession > 1
        ? 'Pertimbangkan membagi sesi 45 menit menjadi dua blok 20 menit dengan jeda jalan kaki 5 menit.'
        : 'Durasi blok Anda saat ini selaras dengan ritme duduk belajar Anda.',
    periodEn: 'Recent recorded sessions',
    periodId: 'Sesi tercatat terbaru',
    sampleSize,
  });

  return insights;
}
