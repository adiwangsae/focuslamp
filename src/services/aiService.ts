import { ChatMessage, FocusSession, Language, StreakInfo, UserProfile } from '../types';
import { deriveDashboardMetrics, MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT } from '../utils/analytics';
import { calculateTotalXp, getLevelInfo } from '../utils/gamification';

export interface AiReplyContext {
  user: UserProfile;
  sessions: FocusSession[];
  streak: StreakInfo;
  language: Language;
  deviceConnected?: boolean;
}

export type PromptCategory = 'tips' | 'motivation' | 'focus';

export interface SuggestedPrompt {
  id: string;
  category: PromptCategory;
  labelEn: string;
  labelId: string;
  promptEn: string;
  promptId: string;
}

export interface ChatSendResult {
  ok: boolean;
  reply?: string;
  errorCode?: string;
  error?: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'tips_block_length',
    category: 'tips',
    labelEn: '25m vs 45m block?',
    labelId: 'Blok 25m vs 45m?',
    promptEn: 'How should I choose between 25m and 45m FocusLamp blocks?',
    promptId: 'Kapan sebaiknya saya memilih blok FocusLamp 25 menit atau 45 menit?',
  },
  {
    id: 'tips_lamp_lighting',
    category: 'tips',
    labelEn: 'Evening lamp lighting',
    labelId: 'Setelan lampu malam',
    promptEn: 'What lamp brightness and color temperature work best for evening study?',
    promptId: 'Berapa kecerahan dan suhu warna lampu FocusLamp FL-01 yang ideal untuk belajar malam?',
  },
  {
    id: 'mot_streak_boost',
    category: 'motivation',
    labelEn: 'Streak motivation boost',
    labelId: 'Motivasi dari streak',
    promptEn: 'Give me a quick motivation boost based on my FocusLamp streak and XP',
    promptId: 'Beri saya dorongan motivasi berdasarkan streak dan XP FocusLamp saya',
  },
  {
    id: 'mot_missed_day',
    category: 'motivation',
    labelEn: 'Bounce back after a miss',
    labelId: 'Bangkit setelah terlewat',
    promptEn: 'How do I stay motivated after missing a study day on FocusLamp?',
    promptId: 'Bagaimana cara tetap termotivasi jika sempat terlewat satu hari belajar di FocusLamp?',
  },
  {
    id: 'foc_phone_dock',
    category: 'focus',
    labelEn: 'Why dock my phone?',
    labelId: 'Manfaat dock ponsel',
    promptEn: 'How does placing my phone on the FocusLamp dock reduce study distractions?',
    promptId: 'Bagaimana meletakkan ponsel di dock FocusLamp membantu mengurangi distraksi belajar?',
  },
  {
    id: 'foc_pattern_audit',
    category: 'focus',
    labelEn: 'Phone lifts & focus audit',
    labelId: 'Audit pola fokus saya',
    promptEn: 'Analyze my phone lifts, away time, and focus consistency',
    promptId: 'Analisis pola angkat ponsel, waktu jeda, dan konsistensi fokus saya',
  },
];

export function getSuggestedPrompts(
  language: Language,
  category?: PromptCategory | 'all'
): Array<{ id: string; category: PromptCategory; label: string; prompt: string }> {
  const items =
    !category || category === 'all'
      ? SUGGESTED_PROMPTS
      : SUGGESTED_PROMPTS.filter((item) => item.category === category);

  return items.map((item) => ({
    id: item.id,
    category: item.category,
    label: language === 'id' ? item.labelId : item.labelEn,
    prompt: language === 'id' ? item.promptId : item.promptEn,
  }));
}

export function buildAiContextSummary(ctx: AiReplyContext): string {
  const metrics = deriveDashboardMetrics(ctx.sessions);
  const totalXp = calculateTotalXp(ctx.sessions);
  const levelInfo = getLevelInfo(totalXp);

  return [
    `Student Name: ${ctx.user.name}`,
    `Major: ${ctx.user.major}`,
    `Default Focus Block: ${ctx.user.preferences.defaultFocusMinutes} min (daily target ${ctx.user.preferences.dailyTargetMinutes} min)`,
    `Total Recorded Sessions: ${metrics.totalSessions} (Completed: ${metrics.completedSessions}, Completion Rate: ${metrics.completionRate}%)`,
    `Total Actual Focus Minutes: ${metrics.totalFocusMinutes} min (Avg block: ${metrics.averageSessionMinutes} min)`,
    `Phone Lift Events: ${metrics.totalPhoneLiftEvents}, Desk Away Events: ${metrics.totalAwayEvents}`,
    `Current Streak: ${ctx.streak.currentStreak} day(s) (Longest: ${ctx.streak.longestStreak}, Recoveries Remaining: ${ctx.streak.recoveriesRemaining}/3)`,
    `XP & Level: Level ${levelInfo.level} (${totalXp} XP)`,
    metrics.totalSessions < MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT
      ? `Note: Only ${metrics.totalSessions} session(s) recorded (< 3 minimum for pattern claims). Do not invent patterns.`
      : 'Note: Base behavioral suggestions strictly on the counts above.',
  ].join('\n');
}

export const aiService = {
  /**
   * Calls the backend Gemini proxy at POST /api/ai/chat.
   * Never masks unavailable or failed AI calls with fake LLM output.
   */
  async sendChatMessage(
    prompt: string,
    history: ChatMessage[],
    ctx: AiReplyContext
  ): Promise<ChatSendResult> {
    try {
      const compactHistory = history
        .filter((m) => m.status !== 'error')
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const metrics = deriveDashboardMetrics(ctx.sessions);
      const totalXp = calculateTotalXp(ctx.sessions);
      const levelInfo = getLevelInfo(totalXp);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          language: ctx.language,
          history: compactHistory,
          contextSummary: {
            accountType: 'registered',
            studentFirstName: ctx.user.name.trim().split(' ')[0] || 'Student',
            totalSessions: metrics.totalSessions,
            completedSessions: metrics.completedSessions,
            totalFocusMinutes: metrics.totalFocusMinutes,
            completionRate: metrics.completionRate,
            averageSessionMinutes: metrics.averageSessionMinutes,
            currentStreak: ctx.streak.currentStreak,
            longestStreak: ctx.streak.longestStreak,
            todayFocusMinutes: ctx.streak.todayFocusMinutes,
            recoveriesRemaining: ctx.streak.recoveriesRemaining,
            level: levelInfo.level,
            totalXp,
            defaultFocusMinutes: ctx.user.preferences.defaultFocusMinutes,
            deviceConnected: Boolean(ctx.deviceConnected),
          },
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        reply?: string;
        code?: string;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.reply) {
        return {
          ok: false,
          errorCode: payload.code ?? `HTTP_${response.status}`,
          error: payload.error ?? 'AI service temporarily unavailable.',
        };
      }

      return {
        ok: true,
        reply: payload.reply,
      };
    } catch (err) {
      return {
        ok: false,
        errorCode: 'NETWORK_ERROR',
        error: err instanceof Error ? err.message : 'Unable to reach AI service.',
      };
    }
  },

  /**
   * Deterministic offline formatter used purely for unit-testing context grounding.
   */
  generateOfflineContextPreview(prompt: string, ctx: AiReplyContext): string {
    const q = prompt.toLowerCase();
    const { sessions, streak, language, user } = ctx;
    const firstName = user.name.trim().split(' ')[0] || 'Student';
    const metrics = deriveDashboardMetrics(sessions);
    const totalXp = calculateTotalXp(sessions);
    const levelInfo = getLevelInfo(totalXp);

    if (language === 'id') {
      if (q.includes('lampu') || q.includes('kecerahan')) {
        return `[Pratinjau Konteks] FocusLamp FL-01 mendukung suhu warna 3000K–4000K untuk belajar malam.`;
      }
      if (q.includes('motivasi') || q.includes('streak')) {
        return `[Pratinjau Konteks] Halo ${firstName}, Level ${levelInfo.level} (${totalXp} XP) dengan streak ${streak.currentStreak} hari.`;
      }
      if (q.includes('dock')) {
        return `[Pratinjau Konteks] Meletakkan ponsel di dock FocusLamp mengurangi gangguan belajar.`;
      }
      return `[Pratinjau Konteks] Tercatat ${metrics.totalSessions} sesi (${metrics.totalFocusMinutes} menit fokus).`;
    }

    if (q.includes('lighting') || q.includes('brightness')) {
      return `[Context Preview] FocusLamp FL-01 supports 3000K–4000K lighting for comfortable evening reading.`;
    }
    if (q.includes('motivation') || q.includes('streak')) {
      return `[Context Preview] Hi ${firstName}, you are at Level ${levelInfo.level} (${totalXp} XP) with a ${streak.currentStreak}-day streak.`;
    }
    if (q.includes('dock')) {
      return `[Context Preview] Placing your phone on the FocusLamp FL-01 dock adds helpful friction against distractions.`;
    }
    return `[Context Preview] You have ${metrics.totalSessions} logged session(s) totaling ${metrics.totalFocusMinutes} actual focus minutes.`;
  },
};
