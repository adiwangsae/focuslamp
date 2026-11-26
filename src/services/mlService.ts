import { FocusSession, MlPredictionSummary } from '../types';
import { deriveDashboardMetrics, MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT } from '../utils/analytics';

/**
 * Demonstration ML Insight Adapter (Master Prompt §16).
 * Computes a clearly labeled demonstration summary without fabricating
 * real training accuracy, precision, recall, or confidence scores.
 */
export const mlService = {
  generateDemoPrediction(sessions: FocusSession[]): MlPredictionSummary {
    const timestampIso = new Date().toISOString();
    const sampleCount = sessions.length;

    if (sampleCount < MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT) {
      return {
        isDemonstration: true,
        available: false,
        predictedClassEn: 'Insufficient session samples for demonstration classification',
        predictedClassId: 'Sampel sesi belum cukup untuk klasifikasi demonstrasi',
        confidenceScore: null,
        relevantInputsEn: [
          `Recorded sessions: ${sampleCount} (minimum ${MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT} required)`,
        ],
        relevantInputsId: [
          `Sesi tercatat: ${sampleCount} (minimal ${MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT} diperlukan)`,
        ],
        timestampIso,
        modelInfoEn:
          'Demonstration ML output using prototype session records; not evaluated against a live trained SIC model.',
        modelInfoId:
          'Output ML demonstrasi dari data sesi prototipe; belum dievaluasi oleh model terlatih langsung.',
        sampleCount,
      };
    }

    const metrics = deriveDashboardMetrics(sessions);
    const avgLifts = +(metrics.totalPhoneLiftEvents / sampleCount).toFixed(1);
    const avgAway = +(metrics.totalAwayEvents / sampleCount).toFixed(1);

    let predictedClassEn = 'Steady Desk Routine';
    let predictedClassId = 'Rutinitas Meja Stabil';

    if (metrics.completionRate >= 80 && avgLifts <= 0.4 && metrics.averageSessionMinutes >= 25) {
      predictedClassEn = 'Sustained Dock-Consistent Pattern';
      predictedClassId = 'Pola Konsisten Dock Berkelanjutan';
    } else if (avgLifts > 0.8 || metrics.completionRate < 65) {
      predictedClassEn = 'Fragmented Study Blocks';
      predictedClassId = 'Blok Belajar Terfragmentasi';
    }

    return {
      isDemonstration: true,
      available: true,
      predictedClassEn,
      predictedClassId,
      confidenceScore: null, // Intentionally omitted unless supplied by an actual trained backend model
      relevantInputsEn: [
        `Session completion rate: ${metrics.completionRate}% (${metrics.completedSessions}/${sampleCount})`,
        `Average block length: ${metrics.averageSessionMinutes} min`,
        `Average phone lifts: ${avgLifts}/session · Desk away: ${avgAway}/session`,
      ],
      relevantInputsId: [
        `Tingkat penyelesaian sesi: ${metrics.completionRate}% (${metrics.completedSessions}/${sampleCount})`,
        `Rata-rata durasi blok: ${metrics.averageSessionMinutes} menit`,
        `Rata-rata angkat ponsel: ${avgLifts}/sesi · Meninggalkan meja: ${avgAway}/sesi`,
      ],
      timestampIso,
      modelInfoEn:
        'Demonstration ML summary derived from session history. Confidence scores and evaluation metrics are hidden until a real trained backend model is connected.',
      modelInfoId:
        'Ringkasan ML demonstrasi dari riwayat sesi. Skor kepercayaan dan metrik evaluasi tidak ditampilkan sebelum model backend terlatih aktif.',
      sampleCount,
    };
  },
};
