export type Language = 'en' | 'id';
export type ThemeMode = 'light' | 'dark';

export type SessionStatus = 'Completed' | 'Interrupted' | 'Abandoned' | 'Manually Ended';

export type ActiveSessionState =
  | 'FOCUSING'
  | 'AWAY'
  | 'PHONE_LIFTED'
  | 'RECONNECTING'
  | 'CONNECTION_LOST';

export type DeviceConnectionStatus =
  | 'Connected'
  | 'Disconnected'
  | 'Connecting'
  | 'Reconnecting'
  | 'Connection Failed';

export type NotificationCategory =
  | 'Device'
  | 'Focus Session'
  | 'Achievement'
  | 'AI Insight'
  | 'System'
  | 'Reminder'
  | 'Fun Facts';

export type NotificationRetention = '3d' | '1w' | '1m';

export type AchievementCategory =
  | 'Focus Milestones'
  | 'Consistency'
  | 'Session Mastery'
  | 'Learning Explorer'
  | 'Personal Growth';

export interface UserPreferences {
  language: Language;
  theme: ThemeMode;
  defaultFocusMinutes: number;
  dailyTargetMinutes: number;
  notificationsEnabled: boolean;
  soundCuesEnabled: boolean;
  studyRemindersEnabled: boolean;
  notificationRetention: NotificationRetention;
  phoneLiftToleranceSeconds: number;
}

export type AccountType = 'registered';

export interface UserProfile {
  id: string;
  accountType: AccountType;
  name: string;
  email: string;
  emailVerified: boolean;
  pendingEmail?: string | null;
  roleLabel: string;
  major: string;
  avatarUrl: string;
  joinedAt: string;
  createdAtIso: string;
  onboardingCompleted: boolean;
  welcomeGreetingSeen?: boolean;
  preferences: UserPreferences;
}

export interface DeviceState {
  deviceId: string;
  deviceName: string;
  firmwareVersion: string;
  connected: boolean;
  connectionStatus: DeviceConnectionStatus;
  connectionType: 'Hardware Companion' | 'Offline';
  signalStrengthDbm: number;
  lampOn: boolean;
  lampBrightness: number; // 0 - 100
  lampColorTempK: number; // 2700 - 6500
  phoneDocked: boolean;
  userPresent: boolean;
  ambientLightLux: number;
  dndActive: boolean;
  wifiConnected: boolean;
  batteryPercent: number | null; // Optional: only shown if hardware reports RTC/backup battery
  syncFailed?: boolean;
  lastSyncAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  date: string; // Local YYYY-MM-DD
  startTime: string; // HH:mm
  startedAtIso: string;
  endedAtIso: string;
  plannedMinutes: number;
  actualFocusSeconds: number; // Excludes AWAY time
  awaySeconds: number;
  awayEvents: number;
  phoneLiftEvents: number;
  disconnectEvents: number;
  status: SessionStatus;
  xpEarned: number;
  subjectTag?: string;
  reflection?: string;
}

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  titleEn: string;
  titleId: string;
  descriptionEn: string;
  descriptionId: string;
  target: number;
  rewardLabelEn: string;
  rewardLabelId: string;
  metric:
    | 'completed_sessions'
    | 'total_focus_minutes'
    | 'best_daily_minutes'
    | 'longest_session_minutes'
    | 'current_streak'
    | 'active_days'
    | 'zero_lift_sessions'
    | 'zero_away_sessions'
    | 'reflections_written'
    | 'ai_chats'
    | 'facts_explored'
    | 'recoveries_unused_streak'
    | 'comeback_events'
    | 'reconnect_resilience'
    | 'distinct_subjects';
}

export interface AchievementStatus extends AchievementDefinition {
  progress: number;
  unlocked: boolean;
}

export interface LevelInfo {
  level: number;
  currentXp: number;
  currentLevelThreshold: number;
  nextLevelThreshold: number | null;
  progressPercent: number;
  xpToNextLevel: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  todayFocusMinutes: number;
  todayQualified: boolean;
  recoveriesUsedThisMonth: number;
  recoveriesRemaining: number;
  recoveredDates: string[];
}

export interface NotificationItem {
  id: string;
  eventId: string;
  category: NotificationCategory;
  titleEn: string;
  titleId: string;
  messageEn: string;
  messageId: string;
  timestampIso: string;
  read: boolean;
  groupKey?: string;
}

export interface AIInsight {
  id: string;
  titleEn: string;
  titleId: string;
  observedDataEn: string;
  observedDataId: string;
  interpretationEn: string;
  interpretationId: string;
  suggestedActionEn: string;
  suggestedActionId: string;
  periodEn: string;
  periodId: string;
  sampleSize: number;
}

export interface MlPredictionSummary {
  available: boolean;
  reasonEn: string;
  reasonId: string;
  confidenceScore: number | null;
  relevantInputsEn: string[];
  relevantInputsId: string[];
  timestampIso: string;
  sampleCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestampIso: string;
  status?: 'sent' | 'error';
  retryPrompt?: string;
  errorCode?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAtIso: string;
  updatedAtIso: string;
  messages: ChatMessage[];
}

export interface ActiveSessionRuntime {
  sessionId: string;
  plannedMinutes: number;
  startedAtIso: string;
  subjectTag: string;
  state: ActiveSessionState;
  remainingSeconds: number;
  actualFocusSeconds: number;
  awaySeconds: number;
  awayEvents: number;
  phoneLiftEvents: number;
  disconnectEvents: number;
  liftCountdownSeconds: number | null;
  pausedByAway: boolean;
}

export interface ScienceFact {
  id: string;
  category: 'Attention' | 'Environment' | 'Circadian' | 'Memory' | 'Sleep' | 'Learning';
  titleEn: string;
  titleId: string;
  summaryEn: string;
  summaryId: string;
  sourceTitle: string;
  authorOrInstitution: string;
  year: number;
  verifiedUrl: string;
}

export interface ToastNotice {
  id: string;
  tone: 'info' | 'success' | 'warning' | 'error';
  message: string;
}
