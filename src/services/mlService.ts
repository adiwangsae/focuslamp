import { FocusSession, MlPredictionSummary } from '../types';
import { deriveDashboardMetrics, MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT } from '../utils/analytics';

/**
 * Honest ML Insight Status Adapter.
 * Reports availability truthfully without generating fake classifications or confidence scores.
 */
export const mlService = {
  getMlStatus(sessions: FocusSession[]): MlPredictionSummary {
    const timestampIso = new Date().toISOString();
    const sampleCount = sessions.length;
    const hasEnoughData = sampleCount >= MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT;
    const metrics = deriveDashboardMetrics(sessions);

    return {
      available: false,
      reasonEn: hasEnoughData
        ? 'ML pattern classification is currently unavailable because no live trained model endpoint is connected.'
        : `Insufficient session data (${sampleCount}/${MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT} sessions) and no live trained ML model endpoint is connected.`,
      reasonId: hasEnoughData
        ? 'Klasifikasi pola ML saat ini belum tersedia karena layanan model terlatih langsung belum terhubung.'
        : `Data sesi belum mencukupi (${sampleCount}/${MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT} sesi) dan layanan model ML terlatih belum terhubung.`,
      confidenceScore: null,
      relevantInputsEn:
        sampleCount > 0
          ? [
              `Recorded sessions: ${sampleCount} (${metrics.completionRate}% completion rate)`,
              `Average block length: ${metrics.averageSessionMinutes} min`,
            ]
          : ['Recorded sessions: 0'],
      relevantInputsId:
        sampleCount > 0
          ? [
              `Sesi tercatat: ${sampleCount} (tingkat penyelesaian ${metrics.completionRate}%)`,
              `Rata-rata durasi blok: ${metrics.averageSessionMinutes} menit`,
            ]
          : ['Sesi tercatat: 0'],
      timestampIso,
      sampleCount,
    };
  },
};

