import { FocusSession, Language, SessionStatus, UserProfile } from '../types';
import { calculateSessionXp, toLocalDateString } from '../utils/gamification';

export interface CompleteSessionPayload {
  sessionId: string;
  userId: string;
  plannedMinutes: number;
  startedAtIso: string;
  actualFocusSeconds: number;
  awaySeconds: number;
  awayEvents: number;
  phoneLiftEvents: number;
  disconnectEvents: number;
  status: SessionStatus;
  subjectTag?: string;
  reflection?: string;
}

export const sessionService = {
  buildCompletedSession(payload: CompleteSessionPayload): FocusSession {
    const startDate = new Date(payload.startedAtIso);
    const localDate = toLocalDateString(startDate);
    const hh = String(startDate.getHours()).padStart(2, '0');
    const mm = String(startDate.getMinutes()).padStart(2, '0');

    return {
      id: payload.sessionId,
      userId: payload.userId,
      date: localDate,
      startTime: `${hh}:${mm}`,
      startedAtIso: payload.startedAtIso,
      endedAtIso: new Date().toISOString(),
      plannedMinutes: payload.plannedMinutes,
      actualFocusSeconds: Math.max(0, Math.floor(payload.actualFocusSeconds)),
      awaySeconds: Math.max(0, Math.floor(payload.awaySeconds)),
      awayEvents: payload.awayEvents,
      phoneLiftEvents: payload.phoneLiftEvents,
      disconnectEvents: payload.disconnectEvents,
      status: payload.status,
      xpEarned: calculateSessionXp(payload.actualFocusSeconds, payload.status),
      subjectTag: payload.subjectTag?.trim() || 'General Study',
      reflection: payload.reflection?.trim() || undefined,
    };
  },

  createNewUserProfile(
    name: string,
    email: string,
    language: Language = 'en',
    explicitId?: string
  ): UserProfile {
    const nowIso = new Date().toISOString();
    const generatedId =
      explicitId ??
      `usr_reg_${
        typeof globalThis.crypto?.randomUUID === 'function'
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      }`;

    return {
      id: generatedId,
      accountType: 'registered',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      emailVerified: false,
      pendingEmail: null,
      roleLabel: language === 'id' ? 'Anggota FocusLamp' : 'FocusLamp Member',
      major: '',
      avatarUrl: '',
      joinedAt: toLocalDateString(new Date()),
      createdAtIso: nowIso,
      isDemo: false,
      onboardingCompleted: true,
      welcomeGreetingSeen: false,
      preferences: {
        language,
        theme: 'light',
        defaultFocusMinutes: 25,
        dailyTargetMinutes: 60,
        notificationsEnabled: true,
        soundCuesEnabled: true,
        studyRemindersEnabled: true,
        notificationRetention: '1m',
        phoneLiftToleranceSeconds: 10,
      },
    };
  },
};
