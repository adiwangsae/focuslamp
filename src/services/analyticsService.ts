import { FocusSession, Language } from '../types';
import {
  buildCompletionDistribution,
  buildDailyChartData,
  buildMonthlyProgressData,
  buildSessionFrequencyData,
  buildWeeklyComparisonData,
  deriveDashboardMetrics,
  exportSessionsToCsv,
  generateDeterministicInsights,
} from '../utils/analytics';

export const analyticsService = {
  getDashboardSummary(sessions: FocusSession[], language: Language) {
    return {
      metrics: deriveDashboardMetrics(sessions),
      daily: buildDailyChartData(sessions, 7),
      weekly: buildWeeklyComparisonData(sessions, undefined, language),
      monthly: buildMonthlyProgressData(sessions, undefined, language),
      distribution: buildCompletionDistribution(sessions),
      frequency: buildSessionFrequencyData(sessions),
      insights: generateDeterministicInsights(sessions),
    };
  },

  exportCsv(sessions: FocusSession[]): string {
    return exportSessionsToCsv(sessions);
  },
};
