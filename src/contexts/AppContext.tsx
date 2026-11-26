import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActiveSessionRuntime,
  AchievementStatus,
  ChatConversation,
  ChatMessage,
  DeviceState,
  FocusSession,
  Language,
  NotificationItem,
  SessionStatus,
  StreakInfo,
  ThemeMode,
  ToastNotice,
  UserPreferences,
  UserProfile,
} from '../types';
import { COPY, CopyDictionary } from '../data/i18n';
import {
  calculateStreakInfo,
  calculateTotalXp,
  evaluateAchievements,
  getLevelInfo,
} from '../utils/gamification';
import { appendUniqueNotification, pruneNotificationsByRetention } from '../utils/notifications';
import { sessionService } from '../services/sessionService';
import { aiService } from '../services/aiService';
import { authService, AuthTokenRecord } from '../services/authService';
import {
  authStorage,
  createDisconnectedRealDeviceState,
  STORAGE_KEYS,
  UserAppDataRecord,
} from '../services/authStorage';
import {
  createLanguageTransitionController,
  LanguageTransitionPhase,
} from '../utils/languageTransition';

interface AppContextValue {
  // Auth
  currentUser: UserProfile | null;
  allAccountEmails: string[];
  loginWithEmail: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ ok: boolean; error?: string }>;
  registerUser: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; email?: string; error?: string }>;
  completeOnboarding: (prefs: Partial<UserPreferences>) => void;
  markWelcomeGreetingSeen: () => void;
  logout: () => void;
  rememberedEmail: string;

  // Verification & Password Reset
  authTokens: Record<string, AuthTokenRecord>;
  latestVerificationTokenForUser: string | null;
  requestPasswordReset: (email: string) => AuthTokenRecord;
  consumePasswordReset: (
    token: string,
    newPassword: string
  ) => Promise<{ ok: boolean; reason?: 'not_found' | 'already_used' | 'expired' | 'not_registered' }>;
  resendVerificationEmail: () => AuthTokenRecord | null;
  verifyEmailToken: (
    token: string
  ) => { ok: boolean; reason?: 'not_found' | 'already_used' | 'expired' };

  // Preferences, Profile & Localization
  language: Language;
  selectedLanguage: Language;
  languagePhase: LanguageTransitionPhase;
  theme: ThemeMode;
  copy: CopyDictionary;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  updateProfileInfo: (updates: {
    name?: string;
    major?: string;
    email?: string;
  }) => { ok: boolean; error?: string; verificationToken?: string };

  // Device
  device: DeviceState;

  // Focus Session Engine
  activeSession: ActiveSessionRuntime | null;
  lastCompletedSession: FocusSession | null;
  startFocusSession: (plannedMinutes: number, subjectTag: string) => boolean;
  endFocusSessionManually: () => void;
  saveSessionReflection: (sessionId: string, reflection: string) => void;
  clearLastCompletedSession: () => void;

  // Sessions, Gamification & Metrics
  sessions: FocusSession[];
  totalXp: number;
  levelInfo: ReturnType<typeof getLevelInfo>;
  streakInfo: StreakInfo;
  achievements: AchievementStatus[];

  // Notifications & Toasts
  notifications: NotificationItem[];
  queuedCountDuringFocus: number;
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toasts: ToastNotice[];
  showToast: (tone: ToastNotice['tone'], message: string) => void;
  dismissToast: (id: string) => void;

  // FocusMate AI
  conversations: ChatConversation[];
  activeConversationId: string;
  chatMessages: ChatMessage[];
  aiTyping: boolean;
  aiTypingConvId: string | null;
  selectConversation: (id: string) => void;
  createNewConversation: () => void;
  sendAiMessage: (content: string, overrideConvId?: string) => Promise<void>;
  retryAiMessage: (convId: string, failedMessageId: string, prompt: string) => Promise<void>;
  aiReturnPath: string;
  setAiReturnPath: (path: string) => void;
  factsExploredIds: string[];
  markFactExplored: (factId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function playGentleCompletionCue() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.48);
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialSession = useMemo(() => authStorage.loadActiveUserSession(), []);

  const [activeAccount, setActiveAccount] = useState<UserAppDataRecord | null>(
    () => initialSession?.userData ?? null
  );
  const [allAccountEmails, setAllAccountEmails] = useState<string[]>(() =>
    authStorage.getAllKnownEmails()
  );
  const [rememberedEmail, setRememberedEmail] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) ?? '';
    } catch {
      return '';
    }
  });
  const [authTokens, setAuthTokens] = useState<Record<string, AuthTokenRecord>>(() =>
    authStorage.loadAuthTokens()
  );
  const [activeSession, setActiveSession] = useState<ActiveSessionRuntime | null>(
    () => initialSession?.activeSession ?? null
  );
  const [lastCompletedSession, setLastCompletedSession] = useState<FocusSession | null>(null);
  const [queuedNotifications, setQueuedNotifications] = useState<NotificationItem[]>([]);
  const [aiTypingConvId, setAiTypingConvId] = useState<string | null>(null);
  const [aiReturnPath, setAiReturnPath] = useState<string>('/home');
  const [guestLanguage, setGuestLanguage] = useState<Language>(() =>
    authStorage.loadGuestLanguage()
  );
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  const currentUser = activeAccount?.profile ?? null;
  const selectedLanguage: Language = currentUser?.preferences.language ?? guestLanguage;
  const [renderedLanguage, setRenderedLanguage] = useState<Language>(selectedLanguage);
  const [languagePhase, setLanguagePhase] = useState<LanguageTransitionPhase>('idle');

  const renderedLanguageRef = useRef<Language>(renderedLanguage);
  renderedLanguageRef.current = renderedLanguage;
  const prevUserIdRef = useRef<string | null>(activeAccount?.userId ?? null);
  const prevSelectedLanguageRef = useRef<Language>(selectedLanguage);

  const languageController = useMemo(
    () =>
      createLanguageTransitionController({
        getCurrentRenderedLanguage: () => renderedLanguageRef.current,
        setPhase: (nextPhase) => {
          setLanguagePhase(nextPhase);
          if (typeof document !== 'undefined') {
            document.documentElement.dataset.langPhase = nextPhase;
          }
        },
        commitRenderedLanguage: (lang) => {
          renderedLanguageRef.current = lang;
          setRenderedLanguage(lang);
        },
        scheduleTimeout: (fn, ms) => window.setTimeout(fn, ms),
        clearTimeoutHandle: (id) => window.clearTimeout(id),
        scheduleFrame: (fn) => window.requestAnimationFrame(fn),
        cancelFrame: (id) => window.cancelAnimationFrame(id),
      }),
    []
  );

  useEffect(() => {
    document.documentElement.dataset.langPhase = 'idle';
    return () => {
      languageController.dispose();
    };
  }, [languageController]);

  useEffect(() => {
    document.documentElement.lang = selectedLanguage;
    const currentUid = activeAccount?.userId ?? null;
    if (prevUserIdRef.current !== currentUid) {
      prevUserIdRef.current = currentUid;
      prevSelectedLanguageRef.current = selectedLanguage;
      languageController.snapLanguage(selectedLanguage);
      return;
    }

    if (prevSelectedLanguageRef.current !== selectedLanguage) {
      prevSelectedLanguageRef.current = selectedLanguage;
      const reducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      languageController.requestLanguageChange(selectedLanguage, reducedMotion);
    }
  }, [activeAccount?.userId, languageController, selectedLanguage]);

  const language: Language = renderedLanguage;
  const theme: ThemeMode = currentUser?.preferences.theme ?? 'light';
  const copy = COPY[language];

  // Persist active user isolated data record whenever it changes
  useEffect(() => {
    if (!activeAccount) return;
    authStorage.saveUserAppData(activeAccount);
  }, [activeAccount]);

  // Persist active session pointer + active timer runtime
  useEffect(() => {
    if (!activeAccount) {
      authStorage.setSessionPointer(null);
      return;
    }
    authStorage.setSessionPointer({
      userId: activeAccount.userId,
      accountType: activeAccount.accountType,
      activeSession,
    });
  }, [activeAccount, activeSession]);

  useEffect(() => {
    authStorage.saveAuthTokens(authTokens);
  }, [authTokens]);

  useEffect(() => {
    authStorage.saveGuestLanguage(guestLanguage);
  }, [guestLanguage]);

  // Sync Tailwind dark class cleanly on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((tone: ToastNotice['tone'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const mutateActiveAccount = useCallback(
    (updater: (prev: UserAppDataRecord) => UserAppDataRecord) => {
      setActiveAccount((prev) => {
        if (!prev) return null;
        return updater(prev);
      });
    },
    []
  );

  // Derived gamification state (strictly scoped to current activeAccount)
  const sessions = activeAccount?.sessions ?? [];
  const totalXp = useMemo(() => calculateTotalXp(sessions), [sessions]);
  const levelInfo = useMemo(() => getLevelInfo(totalXp), [totalXp]);
  const streakInfo = useMemo(() => calculateStreakInfo(sessions), [sessions]);
  const factsExploredIds = activeAccount?.factsExploredIds ?? [];
  const userAiMessageCount = useMemo(
    () =>
      (activeAccount?.conversations ?? []).reduce(
        (sum, conv) => sum + conv.messages.filter((m) => m.role === 'user').length,
        0
      ),
    [activeAccount?.conversations]
  );

  const achievements = useMemo(
    () =>
      evaluateAchievements({
        sessions,
        streakInfo,
        aiMessageCount: userAiMessageCount,
        factsExploredCount: factsExploredIds.length,
      }),
    [sessions, streakInfo, userAiMessageCount, factsExploredIds.length]
  );

  const finalizeActiveSession = useCallback(
    (runtime: ActiveSessionRuntime, finalStatus: SessionStatus) => {
      if (!currentUser || !activeAccount) return;

      if (finalStatus === 'Completed' && currentUser.preferences.soundCuesEnabled) {
        playGentleCompletionCue();
      }

      const prevAchievements = evaluateAchievements({
        sessions,
        streakInfo,
        aiMessageCount: userAiMessageCount,
        factsExploredCount: factsExploredIds.length,
      });
      const prevUnlockedIds = new Set(
        prevAchievements.filter((a) => a.unlocked).map((a) => a.id)
      );

      const completedRecord = sessionService.buildCompletedSession({
        sessionId: runtime.sessionId,
        userId: currentUser.id,
        plannedMinutes: runtime.plannedMinutes,
        startedAtIso: runtime.startedAtIso,
        actualFocusSeconds: runtime.actualFocusSeconds,
        awaySeconds: runtime.awaySeconds,
        awayEvents: runtime.awayEvents,
        phoneLiftEvents: runtime.phoneLiftEvents,
        disconnectEvents: runtime.disconnectEvents,
        status: finalStatus,
        subjectTag: runtime.subjectTag,
      });

      const nextSessions = [completedRecord, ...sessions];
      const nextStreak = calculateStreakInfo(nextSessions);
      const nextAchievements = evaluateAchievements({
        sessions: nextSessions,
        streakInfo: nextStreak,
        aiMessageCount: userAiMessageCount,
        factsExploredCount: factsExploredIds.length,
      });

      const newlyUnlocked = nextAchievements.filter(
        (a) => a.unlocked && !prevUnlockedIds.has(a.id)
      );

      const sessionNotif: NotificationItem = {
        id: `notif-sess-${completedRecord.id}`,
        eventId: `evt-sess-${completedRecord.id}`,
        category: 'Focus Session',
        titleEn: `Focus session ${finalStatus.toLowerCase()}`,
        titleId: `Sesi fokus ${finalStatus === 'Completed' ? 'selesai' : 'diakhiri'}`,
        messageEn: `Recorded ${Math.floor(completedRecord.actualFocusSeconds / 60)}m focus (+${completedRecord.xpEarned} XP).`,
        messageId: `Tercatat ${Math.floor(completedRecord.actualFocusSeconds / 60)}m fokus (+${completedRecord.xpEarned} XP).`,
        timestampIso: new Date().toISOString(),
        read: false,
        groupKey: 'session_summary',
      };

      const achNotifs: NotificationItem[] = newlyUnlocked.map((ach) => ({
        id: `notif-ach-${ach.id}-${completedRecord.id}`,
        eventId: `evt-ach-unlock-${currentUser.id}-${ach.id}`,
        category: 'Achievement',
        titleEn: `Achievement unlocked: ${ach.titleEn}`,
        titleId: `Pencapaian terbuka: ${ach.titleId}`,
        messageEn: ach.descriptionEn,
        messageId: ach.descriptionId,
        timestampIso: new Date().toISOString(),
        read: false,
        groupKey: 'achievements',
      }));

      mutateActiveAccount((acc) => {
        let updatedNotifs = acc.notifications;
        for (const qn of queuedNotifications) {
          updatedNotifs = appendUniqueNotification(updatedNotifs, qn);
        }
        updatedNotifs = appendUniqueNotification(updatedNotifs, sessionNotif);
        for (const an of achNotifs) {
          updatedNotifs = appendUniqueNotification(updatedNotifs, an);
        }
        updatedNotifs = pruneNotificationsByRetention(
          updatedNotifs,
          acc.profile.preferences.notificationRetention
        );
        return {
          ...acc,
          sessions: [completedRecord, ...acc.sessions],
          notifications: updatedNotifs,
          device: acc.device.connected
            ? {
                ...acc.device,
                dndActive: false,
                lastSyncAt: new Date().toISOString(),
              }
            : acc.device,
        };
      });

      setQueuedNotifications([]);
      setActiveSession(null);
      setLastCompletedSession(completedRecord);
    },
    [
      activeAccount,
      currentUser,
      factsExploredIds.length,
      mutateActiveAccount,
      queuedNotifications,
      sessions,
      streakInfo,
      userAiMessageCount,
    ]
  );

  const finalizeRef = useRef(finalizeActiveSession);
  useEffect(() => {
    finalizeRef.current = finalizeActiveSession;
  }, [finalizeActiveSession]);

  const isSessionActive = activeSession !== null;
  useEffect(() => {
    if (!isSessionActive) return;

    const timer = window.setInterval(() => {
      setActiveSession((curr) => {
        if (!curr) return null;

        if (curr.state === 'AWAY') {
          return {
            ...curr,
            awaySeconds: curr.awaySeconds + 1,
          };
        }

        if (curr.state === 'PHONE_LIFTED') {
          const nextTol = (curr.liftCountdownSeconds ?? 10) - 1;
          if (nextTol <= 0) {
            window.setTimeout(() => {
              finalizeRef.current(curr, 'Interrupted');
            }, 0);
            return curr;
          }
          return {
            ...curr,
            liftCountdownSeconds: nextTol,
          };
        }

        const nextRemaining = Math.max(0, curr.remainingSeconds - 1);
        const nextActual = curr.actualFocusSeconds + 1;

        if (nextRemaining === 0) {
          const finished: ActiveSessionRuntime = {
            ...curr,
            remainingSeconds: 0,
            actualFocusSeconds: nextActual,
          };
          window.setTimeout(() => {
            finalizeRef.current(finished, 'Completed');
          }, 0);
          return finished;
        }

        return {
          ...curr,
          remainingSeconds: nextRemaining,
          actualFocusSeconds: nextActual,
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSessionActive]);

  // Auth Actions
  const loginWithEmail = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean
    ): Promise<{ ok: boolean; error?: string }> => {
      const res = await authStorage.authenticateWithCredentials({
        email,
        password,
      });

      if (!res.ok) {
        return {
          ok: false,
          error:
            selectedLanguage === 'id'
              ? 'Email atau kata sandi tidak valid. Periksa kembali kredensial Anda.'
              : 'Invalid email or password. Please check your credentials and try again.',
        };
      }

      const normalized = email.trim().toLowerCase();
      try {
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, normalized);
          setRememberedEmail(normalized);
        } else {
          localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
          setRememberedEmail('');
        }
      } catch {
        // Ignore storage errors
      }

      setActiveSession(null);
      setLastCompletedSession(null);
      setQueuedNotifications([]);
      setActiveAccount(res.userData);
      return { ok: true };
    },
    [selectedLanguage]
  );

  const registerUser = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ ok: boolean; email?: string; error?: string }> => {
      const res = await authStorage.registerAccount({
        name,
        email,
        password,
        language: selectedLanguage,
      });

      if (!res.ok) {
        if (res.code === 'DUPLICATE_EMAIL') {
          return {
            ok: false,
            error:
              selectedLanguage === 'id'
                ? 'Email ini sudah terdaftar pada akun lain.'
                : 'This email is already registered.',
          };
        }
        return {
          ok: false,
          error:
            selectedLanguage === 'id'
              ? 'Data pendaftaran tidak valid.'
              : 'Invalid registration details.',
        };
      }

      setAllAccountEmails(authStorage.getAllKnownEmails());
      return { ok: true, email: res.authRecord.email };
    },
    [selectedLanguage]
  );

  const requestPasswordReset = useCallback((email: string): AuthTokenRecord => {
    const tokenRec = authService.createResetToken(email);
    setAuthTokens((prev) => ({
      ...prev,
      [tokenRec.token]: tokenRec,
    }));
    return tokenRec;
  }, []);

  const consumePasswordReset = useCallback(
    async (
      token: string,
      newPassword: string
    ): Promise<{
      ok: boolean;
      reason?: 'not_found' | 'already_used' | 'expired' | 'not_registered';
    }> => {
      const record = authTokens[token];
      const validation = authService.validateToken(record);
      if (!validation.valid || record.kind !== 'reset_password') {
        return { ok: false, reason: validation.reason ?? 'not_found' };
      }

      const updated = await authStorage.updateRegisteredPasswordByEmail(record.email, newPassword);
      if (!updated) {
        return { ok: false, reason: 'not_registered' };
      }

      setAuthTokens((prev) => ({
        ...prev,
        [token]: { ...record, used: true },
      }));
      return { ok: true };
    },
    [authTokens]
  );

  const resendVerificationEmail = useCallback((): AuthTokenRecord | null => {
    if (!currentUser) return null;
    const tokenRec = currentUser.pendingEmail
      ? authService.createEmailChangeToken(currentUser.email, currentUser.pendingEmail)
      : authService.createVerificationToken(currentUser.email);
    setAuthTokens((prev) => ({
      ...prev,
      [tokenRec.token]: tokenRec,
    }));
    return tokenRec;
  }, [currentUser]);

  const verifyEmailToken = useCallback(
    (token: string): { ok: boolean; reason?: 'not_found' | 'already_used' | 'expired' } => {
      const record = authTokens[token];
      const validation = authService.validateToken(record);
      if (
        !validation.valid ||
        (record.kind !== 'verify_email' && record.kind !== 'change_email')
      ) {
        return { ok: false, reason: validation.reason ?? 'not_found' };
      }

      setAuthTokens((prev) => ({
        ...prev,
        [token]: { ...record, used: true },
      }));

      if (activeAccount && activeAccount.profile.email === record.email) {
        if (record.kind === 'change_email' && record.newEmail) {
          const nextEmail = record.newEmail;
          authStorage.updateRegisteredProfileMeta(activeAccount.userId, { email: nextEmail });
          setAllAccountEmails(authStorage.getAllKnownEmails());
          mutateActiveAccount((acc) => ({
            ...acc,
            profile: {
              ...acc.profile,
              email: nextEmail,
              emailVerified: true,
              pendingEmail: null,
            },
          }));
        } else {
          mutateActiveAccount((acc) => ({
            ...acc,
            profile: {
              ...acc.profile,
              emailVerified: true,
            },
          }));
        }
      }

      return { ok: true };
    },
    [activeAccount, authTokens, mutateActiveAccount]
  );

  const latestVerificationTokenForUser = useMemo(() => {
    if (!currentUser) return null;
    const matches = Object.values(authTokens).filter(
      (t) =>
        !t.used &&
        t.email === currentUser.email &&
        (t.kind === 'verify_email' || t.kind === 'change_email')
    );
    if (matches.length === 0) return null;
    matches.sort((a, b) => b.createdAtMs - a.createdAtMs);
    return matches[0].token;
  }, [authTokens, currentUser]);

  const completeOnboarding = useCallback(
    (prefs: Partial<UserPreferences>) => {
      mutateActiveAccount((acc) => ({
        ...acc,
        profile: {
          ...acc.profile,
          onboardingCompleted: true,
          preferences: {
            ...acc.profile.preferences,
            ...prefs,
          },
        },
      }));
    },
    [mutateActiveAccount]
  );

  const markWelcomeGreetingSeen = useCallback(() => {
    mutateActiveAccount((acc) => {
      if (acc.profile.welcomeGreetingSeen) return acc;
      return {
        ...acc,
        profile: {
          ...acc.profile,
          welcomeGreetingSeen: true,
        },
      };
    });
  }, [mutateActiveAccount]);

  const logout = useCallback(() => {
    authStorage.setSessionPointer(null);
    setActiveSession(null);
    setLastCompletedSession(null);
    setQueuedNotifications([]);
    setActiveAccount(null);
  }, []);

  const updatePreferences = useCallback(
    (patch: Partial<UserPreferences>) => {
      if (patch.language) {
        setGuestLanguage(patch.language);
      }
      mutateActiveAccount((acc) => {
        const nextPrefs = { ...acc.profile.preferences, ...patch };
        const prunedNotifs = pruneNotificationsByRetention(
          acc.notifications,
          nextPrefs.notificationRetention
        );
        return {
          ...acc,
          profile: {
            ...acc.profile,
            preferences: nextPrefs,
          },
          notifications: prunedNotifs,
        };
      });
    },
    [mutateActiveAccount]
  );

  const updateProfileInfo = useCallback(
    (updates: {
      name?: string;
      major?: string;
      email?: string;
    }): { ok: boolean; error?: string; verificationToken?: string } => {
      if (!currentUser || !activeAccount) {
        return { ok: false, error: 'Not signed in.' };
      }

      const requestedEmail = updates.email?.trim().toLowerCase();
      const emailChanged = Boolean(requestedEmail && requestedEmail !== currentUser.email);

      if (emailChanged && requestedEmail) {
        const known = authStorage.getAllKnownEmails();
        if (known.includes(requestedEmail)) {
          return {
            ok: false,
            error:
              language === 'id'
                ? 'Email tersebut sudah digunakan oleh akun lain.'
                : 'That email address is already registered to another account.',
          };
        }
      }

      const nextName = updates.name !== undefined ? updates.name.trim() : currentUser.name;
      const nextEmail = emailChanged && requestedEmail ? requestedEmail : currentUser.email;

      authStorage.updateRegisteredProfileMeta(activeAccount.userId, {
        fullName: nextName,
        email: nextEmail,
      });
      setAllAccountEmails(authStorage.getAllKnownEmails());

      mutateActiveAccount((acc) => ({
        ...acc,
        profile: {
          ...acc.profile,
          name: nextName,
          major: updates.major !== undefined ? updates.major.trim() : acc.profile.major,
          email: nextEmail,
          pendingEmail: null,
        },
      }));

      return { ok: true };
    },
    [activeAccount, currentUser, language, mutateActiveAccount]
  );

  // Focus Session controls
  const startFocusSession = useCallback(
    (plannedMinutes: number, subjectTag: string): boolean => {
      if (!activeAccount) return false;

      if (activeAccount.device.connected && !activeAccount.device.phoneDocked) {
        return false;
      }

      setLastCompletedSession(null);
      setQueuedNotifications([]);
      const safeMins = Math.min(60, Math.max(1, Math.round(plannedMinutes)));
      const nowIso = new Date().toISOString();

      setActiveSession({
        sessionId: `sess-${Date.now()}`,
        plannedMinutes: safeMins,
        startedAtIso: nowIso,
        subjectTag: subjectTag.trim() || 'General Study',
        state: 'FOCUSING',
        remainingSeconds: safeMins * 60,
        actualFocusSeconds: 0,
        awaySeconds: 0,
        awayEvents: 0,
        phoneLiftEvents: 0,
        disconnectEvents: 0,
        liftCountdownSeconds: null,
        pausedByAway: false,
      });
      return true;
    },
    [activeAccount]
  );

  const endFocusSessionManually = useCallback(() => {
    if (!activeSession) return;
    finalizeActiveSession(activeSession, 'Manually Ended');
  }, [activeSession, finalizeActiveSession]);

  const saveSessionReflection = useCallback(
    (sessionId: string, reflection: string) => {
      mutateActiveAccount((acc) => ({
        ...acc,
        sessions: acc.sessions.map((s) =>
          s.id === sessionId ? { ...s, reflection: reflection.trim() } : s
        ),
      }));
      setLastCompletedSession((prev) =>
        prev && prev.id === sessionId ? { ...prev, reflection: reflection.trim() } : prev
      );
    },
    [mutateActiveAccount]
  );

  const clearLastCompletedSession = useCallback(() => {
    setLastCompletedSession(null);
  }, []);

  // Notification Actions
  const notifications = activeAccount?.notifications ?? [];
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      mutateActiveAccount((acc) => ({
        ...acc,
        notifications: acc.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    },
    [mutateActiveAccount]
  );

  const markAllNotificationsRead = useCallback(() => {
    mutateActiveAccount((acc) => ({
      ...acc,
      notifications: acc.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, [mutateActiveAccount]);

  // FocusMate AI Actions
  const conversations = activeAccount?.conversations ?? [];
  const activeConversationId = activeAccount?.activeConversationId ?? conversations[0]?.id ?? '';
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? conversations[0];
  const chatMessages = activeConversation?.messages ?? [];

  const selectConversation = useCallback(
    (id: string) => {
      mutateActiveAccount((acc) => {
        if (!acc.conversations.some((c) => c.id === id)) return acc;
        return {
          ...acc,
          activeConversationId: id,
        };
      });
    },
    [mutateActiveAccount]
  );

  const createNewConversation = useCallback(() => {
    if (!currentUser) return;
    const nowIso = new Date().toISOString();
    const newId = `conv-${Date.now()}`;
    const firstName = currentUser.name.trim().split(' ')[0] || 'Student';
    const greeting: ChatMessage = {
      id: `msg-init-${Date.now()}`,
      role: 'assistant',
      content:
        language === 'id'
          ? `Halo ${firstName}. Mulai obrolan baru di FocusMate AI—tanyakan pola fokus, durasi blok belajar, atau pemulihan streak Anda.`
          : `Hi ${firstName}. Started a fresh FocusMate AI thread—ask about your focus trends, block sizing, or streak pacing anytime.`,
      timestampIso: nowIso,
      status: 'sent',
    };
    const nextConv: ChatConversation = {
      id: newId,
      title: language === 'id' ? 'Percakapan baru' : 'New conversation',
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      messages: [greeting],
    };
    mutateActiveAccount((acc) => ({
      ...acc,
      conversations: [nextConv, ...acc.conversations],
      activeConversationId: newId,
    }));
  }, [currentUser, language, mutateActiveAccount]);

  const sendAiMessage = useCallback(
    async (content: string, overrideConvId?: string) => {
      if (!currentUser || !content.trim()) return;
      const trimmed = content.trim();
      const targetConvId = overrideConvId ?? activeConversationId;
      const historySnapshot =
        conversations.find((c) => c.id === targetConvId)?.messages ?? [];
      const nowIso = new Date().toISOString();
      const userMsg: ChatMessage = {
        id: `msg-u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestampIso: nowIso,
        status: 'sent',
      };

      mutateActiveAccount((acc) => ({
        ...acc,
        conversations: acc.conversations.map((conv) => {
          if (conv.id !== targetConvId) return conv;
          const isDefaultTitle =
            conv.title === 'New conversation' || conv.title === 'Percakapan baru';
          const nextTitle = isDefaultTitle
            ? trimmed.length > 42
              ? `${trimmed.slice(0, 42)}…`
              : trimmed
            : conv.title;
          return {
            ...conv,
            title: nextTitle,
            updatedAtIso: nowIso,
            messages: [...conv.messages, userMsg],
          };
        }),
      }));

      setAiTypingConvId(targetConvId);
      const res = await aiService.sendChatMessage(trimmed, historySnapshot, {
        user: currentUser,
        sessions,
        streak: streakInfo,
        language,
        deviceConnected: Boolean(activeAccount?.device.connected),
      });

      const replyIso = new Date().toISOString();
      const aiMsg: ChatMessage = res.ok && res.reply
        ? {
            id: `msg-a-${Date.now()}`,
            role: 'assistant',
            content: res.reply,
            timestampIso: replyIso,
            status: 'sent',
          }
        : {
            id: `msg-err-${Date.now()}`,
            role: 'assistant',
            content:
              language === 'id'
                ? 'Layanan AI sementara tidak tersedia. Periksa koneksi atau konfigurasi kunci API, lalu coba lagi.'
                : 'AI service temporarily unavailable. Please check API configuration or connectivity and retry.',
            timestampIso: replyIso,
            status: 'error',
            retryPrompt: trimmed,
            errorCode: res.errorCode ?? 'AI_UNAVAILABLE',
          };

      mutateActiveAccount((acc) => ({
        ...acc,
        conversations: acc.conversations.map((conv) =>
          conv.id !== targetConvId
            ? conv
            : {
                ...conv,
                updatedAtIso: replyIso,
                messages: [...conv.messages, aiMsg],
              }
        ),
      }));
      setAiTypingConvId((curr) => (curr === targetConvId ? null : curr));
    },
    [
      activeConversationId,
      conversations,
      currentUser,
      language,
      mutateActiveAccount,
      sessions,
      streakInfo,
    ]
  );

  const retryAiMessage = useCallback(
    async (convId: string, failedMessageId: string, prompt: string) => {
      if (!currentUser || !prompt.trim()) return;
      const historyWithoutError = (
        conversations.find((c) => c.id === convId)?.messages ?? []
      ).filter((m) => m.id !== failedMessageId);

      mutateActiveAccount((acc) => ({
        ...acc,
        conversations: acc.conversations.map((conv) =>
          conv.id !== convId
            ? conv
            : {
                ...conv,
                messages: conv.messages.filter((m) => m.id !== failedMessageId),
              }
        ),
      }));

      setAiTypingConvId(convId);
      const res = await aiService.sendChatMessage(prompt, historyWithoutError, {
        user: currentUser,
        sessions,
        streak: streakInfo,
        language,
        deviceConnected: Boolean(activeAccount?.device.connected),
      });

      const replyIso = new Date().toISOString();
      const aiMsg: ChatMessage = res.ok && res.reply
        ? {
            id: `msg-a-${Date.now()}`,
            role: 'assistant',
            content: res.reply,
            timestampIso: replyIso,
            status: 'sent',
          }
        : {
            id: `msg-err-${Date.now()}`,
            role: 'assistant',
            content:
              language === 'id'
                ? 'Layanan AI sementara tidak tersedia. Silakan coba lagi.'
                : 'AI service temporarily unavailable. Please try again.',
            timestampIso: replyIso,
            status: 'error',
            retryPrompt: prompt,
            errorCode: res.errorCode ?? 'AI_UNAVAILABLE',
          };

      mutateActiveAccount((acc) => ({
        ...acc,
        conversations: acc.conversations.map((conv) =>
          conv.id !== convId
            ? conv
            : {
                ...conv,
                updatedAtIso: replyIso,
                messages: [...conv.messages, aiMsg],
              }
        ),
      }));
      setAiTypingConvId((curr) => (curr === convId ? null : curr));
    },
    [conversations, currentUser, language, mutateActiveAccount, sessions, streakInfo]
  );

  const markFactExplored = useCallback(
    (factId: string) => {
      mutateActiveAccount((acc) => {
        if (acc.factsExploredIds.includes(factId)) return acc;
        return {
          ...acc,
          factsExploredIds: [...acc.factsExploredIds, factId],
        };
      });
    },
    [mutateActiveAccount]
  );

  const device = activeAccount?.device ?? createDisconnectedRealDeviceState();

  const value: AppContextValue = {
    currentUser,
    allAccountEmails,
    loginWithEmail,
    registerUser,
    completeOnboarding,
    markWelcomeGreetingSeen,
    logout,
    rememberedEmail,
    authTokens,
    latestVerificationTokenForUser,
    requestPasswordReset,
    consumePasswordReset,
    resendVerificationEmail,
    verifyEmailToken,
    language,
    selectedLanguage,
    languagePhase,
    theme,
    copy,
    updatePreferences,
    updateProfileInfo,
    device,
    activeSession,
    lastCompletedSession,
    startFocusSession,
    endFocusSessionManually,
    saveSessionReflection,
    clearLastCompletedSession,
    sessions,
    totalXp,
    levelInfo,
    streakInfo,
    achievements,
    notifications,
    queuedCountDuringFocus: queuedNotifications.length,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    toasts,
    showToast,
    dismissToast,
    conversations,
    activeConversationId,
    chatMessages,
    aiTyping: aiTypingConvId !== null && aiTypingConvId === activeConversationId,
    aiTypingConvId,
    selectConversation,
    createNewConversation,
    sendAiMessage,
    retryAiMessage,
    aiReturnPath,
    setAiReturnPath,
    factsExploredIds,
    markFactExplored,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
