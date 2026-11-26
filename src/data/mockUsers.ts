import {
  ChatConversation,
  ChatMessage,
  DeviceState,
  FocusSession,
  NotificationItem,
  UserProfile,
} from '../types';
import { addDaysToLocalDate, calculateSessionXp, toLocalDateString } from '../utils/gamification';

export interface DemoAccountBundle {
  profile: UserProfile;
  device: DeviceState;
  sessions: FocusSession[];
  notifications: NotificationItem[];
  initialMessages: ChatMessage[];
  initialConversations: ChatConversation[];
}

function buildIso(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0).toISOString();
}

function makeDemoSession(
  id: string,
  userId: string,
  daysAgo: number,
  startTime: string,
  plannedMinutes: number,
  actualMinutes: number,
  awaySeconds: number,
  awayEvents: number,
  phoneLiftEvents: number,
  disconnectEvents: number,
  status: FocusSession['status'],
  subjectTag: string,
  reflection?: string
): FocusSession {
  const todayStr = toLocalDateString(new Date());
  const date = addDaysToLocalDate(todayStr, -daysAgo);
  const actualFocusSeconds = actualMinutes * 60;
  const startedAtIso = buildIso(date, startTime);
  const endedAtIso = new Date(
    new Date(startedAtIso).getTime() + (actualFocusSeconds + awaySeconds) * 1000
  ).toISOString();

  return {
    id,
    userId,
    date,
    startTime,
    startedAtIso,
    endedAtIso,
    plannedMinutes,
    actualFocusSeconds,
    awaySeconds,
    awayEvents,
    phoneLiftEvents,
    disconnectEvents,
    status,
    xpEarned: calculateSessionXp(actualFocusSeconds, status),
    subjectTag,
    reflection,
  };
}

export function createDemoAccountBundles(): Record<string, DemoAccountBundle> {
  const now = new Date();
  const todayStr = toLocalDateString(now);

  // Demo User 1: Nadia Pratama — Consistent Informatics student with rich 14-day history
  const nadiaId = 'demo-nadia';
  const nadiaSessions: FocusSession[] = [
    makeDemoSession(
      'nadia-s1',
      nadiaId,
      0,
      '08:45',
      25,
      25,
      0,
      0,
      0,
      0,
      'Completed',
      'Algorithms & Data Structures',
      'Finished dynamic programming recurrence notes cleanly.'
    ),
    makeDemoSession(
      'nadia-s2',
      nadiaId,
      1,
      '09:15',
      30,
      30,
      60,
      1,
      0,
      0,
      'Completed',
      'Operating Systems',
      'Reviewed deadlock avoidance examples.'
    ),
    makeDemoSession(
      'nadia-s3',
      nadiaId,
      1,
      '19:20',
      25,
      25,
      0,
      0,
      0,
      0,
      'Completed',
      'Linear Algebra',
      'Completed eigenvalue worksheet.'
    ),
    makeDemoSession(
      'nadia-s4',
      nadiaId,
      2,
      '10:00',
      45,
      45,
      120,
      1,
      0,
      1,
      'Completed',
      'Software Engineering',
      'Drafted sequence diagrams; brief BLE reconnect recovered smoothly.'
    ),
    makeDemoSession(
      'nadia-s5',
      nadiaId,
      3,
      '14:10',
      25,
      18,
      0,
      0,
      1,
      0,
      'Manually Ended',
      'Computer Networks',
      'Ended early for lab group meeting.'
    ),
    makeDemoSession('nadia-s6', nadiaId, 4, '09:00', 30, 30, 0, 0, 0, 0, 'Completed', 'Database Systems'),
    makeDemoSession('nadia-s7', nadiaId, 5, '20:15', 25, 25, 0, 0, 0, 0, 'Completed', 'Probability'),
    makeDemoSession('nadia-s8', nadiaId, 6, '08:30', 30, 30, 0, 0, 0, 0, 'Completed', 'Algorithms & Data Structures'),
    makeDemoSession('nadia-s9', nadiaId, 8, '15:00', 45, 45, 90, 1, 0, 0, 'Completed', 'Machine Learning Intro'),
    makeDemoSession('nadia-s10', nadiaId, 9, '09:40', 25, 25, 0, 0, 0, 0, 'Completed', 'Research Writing'),
    makeDemoSession('nadia-s11', nadiaId, 10, '18:45', 30, 12, 180, 2, 2, 0, 'Interrupted', 'Operating Systems'),
    makeDemoSession('nadia-s12', nadiaId, 11, '10:30', 25, 25, 0, 0, 0, 0, 'Completed', 'Linear Algebra'),
    makeDemoSession('nadia-s13', nadiaId, 12, '16:15', 30, 30, 0, 0, 0, 0, 'Completed', 'Database Systems'),
    makeDemoSession('nadia-s14', nadiaId, 13, '09:05', 25, 25, 0, 0, 0, 0, 'Completed', 'Algorithms & Data Structures'),
  ];

  const nadiaProfile: UserProfile = {
    id: nadiaId,
    accountType: 'demo',
    name: 'Nadia Pratama',
    email: 'nadia@focuslamp.demo',
    emailVerified: true,
    pendingEmail: null,
    roleLabel: 'Informatics Undergraduate',
    major: 'Computer Science · Year 3',
    avatarUrl: '/src/assets/images/avatar_student_nadia_1795318233749.jpg',
    joinedAt: '2026-09-10',
    createdAtIso: '2026-09-10T08:00:00.000Z',
    isDemo: true,
    onboardingCompleted: true,
    preferences: {
      language: 'en',
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

  const nadiaDevice: DeviceState = {
    deviceId: 'FL-01-A942',
    deviceName: 'FocusLamp FL-01',
    firmwareVersion: 'v0.9.4-proto',
    connected: true,
    connectionStatus: 'Connected',
    connectionType: 'BLE 5.3 (Simulated)',
    signalStrengthDbm: -54,
    lampOn: true,
    lampBrightness: 72,
    lampColorTempK: 4200,
    phoneDocked: true,
    userPresent: true,
    ambientLightLux: 380,
    dndActive: false,
    wifiConnected: true,
    batteryPercent: 94,
    syncFailed: false,
    lastSyncAt: now.toISOString(),
  };

  const nadiaNotifications: NotificationItem[] = [
    {
      id: 'nadia-n1',
      eventId: 'evt-nadia-sync-1',
      category: 'Device',
      titleEn: 'FocusLamp FL-01 synced',
      titleId: 'FocusLamp FL-01 tersinkronisasi',
      messageEn: 'Morning dock telemetry and ambient lux profile updated (demo simulation).',
      messageId: 'Telemetri dock pagi dan profil cahaya sekitar diperbarui (simulasi demo).',
      timestampIso: new Date(now.getTime() - 1000 * 60 * 35).toISOString(),
      read: false,
      groupKey: 'device_sync',
    },
    {
      id: 'nadia-n2',
      eventId: 'evt-nadia-ai-1',
      category: 'AI Insight',
      titleEn: 'New morning pattern observed',
      titleId: 'Pola pagi baru teramati',
      messageEn:
        'Your simulated session history shows stronger completion before noon across 14 logged blocks.',
      messageId:
        'Riwayat sesi simulasi Anda menunjukkan penyelesaian lebih tinggi sebelum tengah hari dari 14 blok.',
      timestampIso: new Date(now.getTime() - 1000 * 60 * 140).toISOString(),
      read: false,
      groupKey: 'ai_digest',
    },
    {
      id: 'nadia-n3',
      eventId: 'evt-nadia-fact-1',
      category: 'Fun Facts',
      titleEn: 'Research note: Smartphone proximity',
      titleId: 'Catatan riset: Kedekatan ponsel',
      messageEn:
        'Ward et al. (2017) found keeping a phone docked away from immediate sight frees working memory.',
      messageId:
        'Ward et al. (2017) menemukan menjauhkan ponsel dari pandangan langsung menjaga kapasitas memori kerja.',
      timestampIso: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      read: true,
      groupKey: 'fun_facts',
    },
  ];

  const nadiaMessages: ChatMessage[] = [
    {
      id: 'nadia-m1',
      role: 'assistant',
      content:
        'Hello Nadia. FocusMate AI is connected to your demonstration profile (14 recorded sessions). Ask me about your focus patterns, streak recovery, or study block sizing.',
      timestampIso: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      simulatedLabel: true,
      status: 'sent',
    },
  ];

  const nadiaConversations: ChatConversation[] = [
    {
      id: 'nadia-conv-1',
      title: 'Focus patterns & block sizing',
      createdAtIso: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      updatedAtIso: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      messages: nadiaMessages,
    },
    {
      id: 'nadia-conv-2',
      title: '25m vs 45m Algorithms blocks',
      createdAtIso: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(),
      updatedAtIso: new Date(now.getTime() - 1000 * 60 * 60 * 25).toISOString(),
      messages: [
        {
          id: 'nadia-c2-m1',
          role: 'user',
          content: 'How should I choose between 25m and 45m FocusLamp blocks?',
          timestampIso: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(),
          status: 'sent',
        },
        {
          id: 'nadia-c2-m2',
          role: 'assistant',
          content:
            'Use 25-minute FocusLamp blocks for reading, flashcards, or lecture review so energy stays high. Choose 45-minute blocks (within the 1–60 min FL-01 firmware prototype range) for coding or multi-step problem sets. Your current default block is 25 minutes.',
          timestampIso: new Date(now.getTime() - 1000 * 60 * 60 * 25).toISOString(),
          simulatedLabel: true,
          status: 'sent',
        },
      ],
    },
    {
      id: 'nadia-conv-3',
      title: 'Evening desk lamp lighting',
      createdAtIso: new Date(now.getTime() - 1000 * 60 * 60 * 52).toISOString(),
      updatedAtIso: new Date(now.getTime() - 1000 * 60 * 60 * 51).toISOString(),
      messages: [
        {
          id: 'nadia-c3-m1',
          role: 'user',
          content: 'What lamp brightness and color temperature work best for evening study?',
          timestampIso: new Date(now.getTime() - 1000 * 60 * 60 * 52).toISOString(),
          status: 'sent',
        },
        {
          id: 'nadia-c3-m2',
          role: 'assistant',
          content:
            'For evening desk sessions on FocusLamp FL-01, a warm-to-neutral 3000K–4000K color temperature at roughly 55%–70% brightness keeps pages readable without harsh glare. You can adjust both sliders anytime on the Device page.',
          timestampIso: new Date(now.getTime() - 1000 * 60 * 60 * 51).toISOString(),
          simulatedLabel: true,
          status: 'sent',
        },
      ],
    },
  ];

  // Demo User 2: Marcus Vance — Lighter history (2 sessions -> tests insufficient personalized AI insights + different profile)
  const marcusId = 'demo-marcus';
  const marcusSessions: FocusSession[] = [
    makeDemoSession(
      'marcus-s1',
      marcusId,
      1,
      '15:30',
      25,
      25,
      0,
      0,
      1,
      0,
      'Completed',
      'Interaction Design',
      'Sketched lamp dock flow.'
    ),
    makeDemoSession(
      'marcus-s2',
      marcusId,
      3,
      '17:10',
      15,
      11,
      120,
      2,
      1,
      0,
      'Manually Ended',
      'Discrete Math'
    ),
  ];

  const marcusProfile: UserProfile = {
    id: marcusId,
    accountType: 'demo',
    name: 'Marcus Vance',
    email: 'marcus@focuslamp.demo',
    emailVerified: true,
    pendingEmail: null,
    roleLabel: 'Design & CS Sophomore',
    major: 'Human-Computer Interaction · Year 2',
    avatarUrl: '/src/assets/images/avatar_student_marcus_1795318233937.jpg',
    joinedAt: todayStr,
    createdAtIso: now.toISOString(),
    isDemo: true,
    onboardingCompleted: true,
    preferences: {
      language: 'en',
      theme: 'dark',
      defaultFocusMinutes: 15,
      dailyTargetMinutes: 45,
      notificationsEnabled: true,
      soundCuesEnabled: false,
      studyRemindersEnabled: true,
      notificationRetention: '1w',
      phoneLiftToleranceSeconds: 15,
    },
  };

  const marcusDevice: DeviceState = {
    deviceId: 'FL-01-B208',
    deviceName: 'FocusLamp FL-01',
    firmwareVersion: 'v0.9.4-proto',
    connected: true,
    connectionStatus: 'Connected',
    connectionType: 'BLE 5.3 (Simulated)',
    signalStrengthDbm: -61,
    lampOn: true,
    lampBrightness: 55,
    lampColorTempK: 3400,
    phoneDocked: false,
    userPresent: true,
    ambientLightLux: 210,
    dndActive: false,
    wifiConnected: true,
    batteryPercent: 81,
    syncFailed: false,
    lastSyncAt: now.toISOString(),
  };

  const marcusNotifications: NotificationItem[] = [
    {
      id: 'marcus-n1',
      eventId: 'evt-marcus-welcome',
      category: 'System',
      titleEn: 'Welcome to FocusLamp Prototype',
      titleId: 'Selamat Datang di Prototipe FocusLamp',
      messageEn:
        'Complete at least 3 focus sessions so FocusMate AI can unlock personalized behavioral patterns.',
      messageId:
        'Selesaikan minimal 3 sesi fokus agar FocusMate AI dapat menampilkan pola perilaku terpersonalisasi.',
      timestampIso: new Date(now.getTime() - 1000 * 60 * 50).toISOString(),
      read: false,
      groupKey: 'onboarding_tip',
    },
  ];

  const marcusMessages: ChatMessage[] = [
    {
      id: 'marcus-m1',
      role: 'assistant',
      content:
        'Hi Marcus. You currently have 2 recorded demo sessions. Once you complete 1 more session (3 minimum), FocusMate AI can generate personalized pattern insights alongside general evidence-based study tips.',
      timestampIso: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      simulatedLabel: true,
      status: 'sent',
    },
  ];

  const marcusConversations: ChatConversation[] = [
    {
      id: 'marcus-conv-1',
      title: 'Getting started with FocusMate',
      createdAtIso: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      updatedAtIso: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      messages: marcusMessages,
    },
  ];

  // Demo User 3: Starter Empty Student Profile (tests empty state UI cleanly)
  const starterId = 'demo-starter';
  const starterProfile: UserProfile = {
    id: starterId,
    accountType: 'demo',
    name: 'Rina Kusuma',
    email: 'student1@focuslamp.demo',
    emailVerified: false,
    pendingEmail: null,
    roleLabel: 'First-Year Engineering Student',
    major: 'Electrical Engineering · Year 1',
    avatarUrl: '',
    joinedAt: todayStr,
    createdAtIso: now.toISOString(),
    isDemo: true,
    onboardingCompleted: true,
    preferences: {
      language: 'en',
      theme: 'light',
      defaultFocusMinutes: 25,
      dailyTargetMinutes: 50,
      notificationsEnabled: true,
      soundCuesEnabled: true,
      studyRemindersEnabled: true,
      notificationRetention: '1m',
      phoneLiftToleranceSeconds: 10,
    },
  };

  const starterDevice: DeviceState = {
    deviceId: 'FL-01-C104',
    deviceName: 'FocusLamp FL-01',
    firmwareVersion: 'v0.9.4-proto',
    connected: false,
    connectionStatus: 'Disconnected',
    connectionType: 'Offline',
    signalStrengthDbm: -80,
    lampOn: false,
    lampBrightness: 60,
    lampColorTempK: 4000,
    phoneDocked: false,
    userPresent: false,
    ambientLightLux: 290,
    dndActive: false,
    wifiConnected: false,
    batteryPercent: null,
    syncFailed: false,
    lastSyncAt: now.toISOString(),
  };

  const starterMessages: ChatMessage[] = [
    {
      id: 'starter-m1',
      role: 'assistant',
      content:
        'Welcome Rina. Connect your simulated FocusLamp FL-01 and complete your first study block to begin building personal analytics.',
      timestampIso: now.toISOString(),
      simulatedLabel: true,
      status: 'sent',
    },
  ];

  const starterConversations: ChatConversation[] = [
    {
      id: 'starter-conv-1',
      title: 'First FocusLamp setup',
      createdAtIso: now.toISOString(),
      updatedAtIso: now.toISOString(),
      messages: starterMessages,
    },
  ];

  return {
    [nadiaProfile.email]: {
      profile: nadiaProfile,
      device: nadiaDevice,
      sessions: nadiaSessions,
      notifications: nadiaNotifications,
      initialMessages: nadiaMessages,
      initialConversations: nadiaConversations,
    },
    [marcusProfile.email]: {
      profile: marcusProfile,
      device: marcusDevice,
      sessions: marcusSessions,
      notifications: marcusNotifications,
      initialMessages: marcusMessages,
      initialConversations: marcusConversations,
    },
    [starterProfile.email]: {
      profile: starterProfile,
      device: starterDevice,
      sessions: [],
      notifications: [],
      initialMessages: starterMessages,
      initialConversations: starterConversations,
    },
  };
}

export const DEMO_ACCOUNT_CREDENTIALS = [
  {
    id: 'demo-nadia',
    email: 'nadia@focuslamp.demo',
    demoPassword: 'DemoFocus1',
    name: 'Nadia Pratama',
    summaryEn: '14 sessions · Active streak · Connected FL-01',
    summaryId: '14 sesi · Streak aktif · FL-01 terhubung',
    avatarUrl: '/src/assets/images/avatar_student_nadia_1795318233749.jpg',
  },
  {
    id: 'demo-marcus',
    email: 'marcus@focuslamp.demo',
    demoPassword: 'DemoFocus1',
    name: 'Marcus Vance',
    summaryEn: '2 sessions · Starter data · Dark theme',
    summaryId: '2 sesi · Data awal · Tema gelap',
    avatarUrl: '/src/assets/images/avatar_student_marcus_1795318233937.jpg',
  },
  {
    id: 'demo-starter',
    email: 'student1@focuslamp.demo',
    demoPassword: 'DemoFocus1',
    name: 'Rina Kusuma',
    summaryEn: '0 sessions · Empty state · Disconnected demo',
    summaryId: '0 sesi · Data kosong · Demo terputus',
    avatarUrl: '',
  },
];
