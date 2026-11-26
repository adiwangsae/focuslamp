import {
  AccountType,
  ActiveSessionRuntime,
  ChatConversation,
  ChatMessage,
  DeviceState,
  FocusSession,
  Language,
  NotificationItem,
  UserProfile,
} from '../types';
import { DEMO_MODE_ENABLED } from '../config/demoConfig';
import { createDemoAccountBundles, DEMO_ACCOUNT_CREDENTIALS } from '../data/mockUsers';
import { authService, PasswordDigestRecord, SimulatedTokenRecord } from './authService';
import { sessionService } from './sessionService';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface StoredRegisteredAuthRecord extends PasswordDigestRecord {
  userId: string;
  accountType: 'registered';
  email: string;
  fullName: string;
  createdAtIso: string;
}

export interface UserAppDataRecord {
  userId: string;
  accountType: AccountType;
  profile: UserProfile;
  device: DeviceState;
  sessions: FocusSession[];
  notifications: NotificationItem[];
  conversations: ChatConversation[];
  activeConversationId: string;
  factsExploredIds: string[];
}

export interface ActiveSessionPointer {
  userId: string;
  accountType: AccountType;
  activeSession: ActiveSessionRuntime | null;
}

export const STORAGE_KEYS = {
  REGISTERED_ACCOUNTS: 'focuslamp_registered_accounts_v1',
  REGISTERED_DATA_PREFIX: 'focuslamp_registered_data_v1::',
  DEMO_STATE: 'focuslamp_demo_state_v1',
  SESSION_POINTER: 'focuslamp_auth_session_v1',
  AUTH_TOKENS: 'focuslamp_auth_tokens_v1',
  GUEST_LANGUAGE: 'focuslamp_guest_lang_v1',
  REMEMBERED_EMAIL: 'focuslamp_remembered_email',
} as const;

function getBrowserStorage(): StorageLike | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Ignore restricted storage contexts
  }
  return null;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function createDisconnectedRealDeviceState(): DeviceState {
  return {
    deviceId: '',
    deviceName: 'FocusLamp FL-01',
    firmwareVersion: '',
    connected: false,
    connectionStatus: 'Disconnected',
    connectionType: 'Offline',
    signalStrengthDbm: 0,
    lampOn: false,
    lampBrightness: 0,
    lampColorTempK: 4000,
    phoneDocked: false,
    userPresent: false,
    ambientLightLux: 0,
    dndActive: false,
    wifiConnected: false,
    batteryPercent: null,
    syncFailed: false,
    lastSyncAt: '',
  };
}

function createInitialRegisteredUserData(
  profile: UserProfile,
  language: Language
): UserAppDataRecord {
  const nowIso = new Date().toISOString();
  const starterConvId = `conv-init-${profile.id}`;
  const firstName = profile.name.trim().split(/\s+/)[0] || profile.name.trim();
  const initialMsg: ChatMessage = {
    id: `ai-init-${profile.id}`,
    role: 'assistant',
    content:
      language === 'id'
        ? `Halo ${firstName}. FocusMate AI siap membantu strategi belajarmu. Selesaikan minimal 3 sesi fokus untuk membuka wawasan pola terpersonalisasi.`
        : `Hi ${firstName}. FocusMate AI is ready to support your study sessions. Complete at least 3 focus sessions to unlock personalized behavioral pattern insights.`,
    timestampIso: nowIso,
    status: 'sent',
  };
  const starterConv: ChatConversation = {
    id: starterConvId,
    title: language === 'id' ? 'Percakapan baru' : 'New conversation',
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    messages: [initialMsg],
  };

  return {
    userId: profile.id,
    accountType: 'registered',
    profile,
    device: createDisconnectedRealDeviceState(),
    sessions: [],
    notifications: [],
    conversations: [starterConv],
    activeConversationId: starterConvId,
    factsExploredIds: [],
  };
}

function createInitialDemoRecords(): Record<string, UserAppDataRecord> {
  const bundles = createDemoAccountBundles();
  const records: Record<string, UserAppDataRecord> = {};
  for (const bundle of Object.values(bundles)) {
    const userId = bundle.profile.id;
    records[userId] = {
      userId,
      accountType: 'demo',
      profile: {
        ...bundle.profile,
        accountType: 'demo',
        isDemo: true,
      },
      device: bundle.device,
      sessions: bundle.sessions,
      notifications: bundle.notifications,
      conversations: bundle.initialConversations,
      activeConversationId: bundle.initialConversations[0]?.id ?? '',
      factsExploredIds:
        userId === 'demo-nadia' ? ['fact_ward_2017', 'fact_mark_2008'] : [],
    };
  }
  return records;
}

function registeredDataKey(userId: string): string {
  return `${STORAGE_KEYS.REGISTERED_DATA_PREFIX}${userId}`;
}

export const authStorage = {
  getRegisteredAccountsMap(storage: StorageLike | null = getBrowserStorage()): Record<string, StoredRegisteredAuthRecord> {
    if (!storage) return {};
    const parsed = safeParseJson<Record<string, StoredRegisteredAuthRecord>>(
      storage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS)
    );
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  },

  saveRegisteredAccountsMap(
    map: Record<string, StoredRegisteredAuthRecord>,
    storage: StorageLike | null = getBrowserStorage()
  ): void {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(map));
    } catch {
      // Ignore quota issues
    }
  },

  findRegisteredAccountByEmail(
    email: string,
    storage: StorageLike | null = getBrowserStorage()
  ): StoredRegisteredAuthRecord | null {
    const normalized = email.trim().toLowerCase();
    const map = this.getRegisteredAccountsMap(storage);
    for (const rec of Object.values(map)) {
      if (rec && rec.email.toLowerCase() === normalized) {
        return rec;
      }
    }
    return null;
  },

  getAllKnownEmails(
    demoEnabled = DEMO_MODE_ENABLED,
    storage: StorageLike | null = getBrowserStorage()
  ): string[] {
    const regEmails = Object.values(this.getRegisteredAccountsMap(storage)).map((r) =>
      r.email.toLowerCase()
    );
    if (!demoEnabled) return regEmails;
    const demoEmails = DEMO_ACCOUNT_CREDENTIALS.map((d) => d.email.toLowerCase());
    return Array.from(new Set([...regEmails, ...demoEmails]));
  },

  getDemoRecordsMap(
    demoEnabled = DEMO_MODE_ENABLED,
    storage: StorageLike | null = getBrowserStorage()
  ): Record<string, UserAppDataRecord> {
    if (!demoEnabled) return {};
    const defaults = createInitialDemoRecords();
    if (!storage) return defaults;
    const parsed = safeParseJson<Record<string, UserAppDataRecord>>(
      storage.getItem(STORAGE_KEYS.DEMO_STATE)
    );
    if (!parsed || typeof parsed !== 'object') {
      return defaults;
    }
    const merged: Record<string, UserAppDataRecord> = { ...defaults };
    for (const [id, rec] of Object.entries(parsed)) {
      if (defaults[id] && rec && rec.profile) {
        merged[id] = {
          ...rec,
          userId: id,
          accountType: 'demo',
          profile: {
            ...rec.profile,
            id,
            accountType: 'demo',
            isDemo: true,
          },
        };
      }
    }
    return merged;
  },

  saveDemoRecordsMap(
    map: Record<string, UserAppDataRecord>,
    storage: StorageLike | null = getBrowserStorage()
  ): void {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.DEMO_STATE, JSON.stringify(map));
    } catch {
      // Ignore quota issues
    }
  },

  getRegisteredUserData(
    userId: string,
    storage: StorageLike | null = getBrowserStorage()
  ): UserAppDataRecord | null {
    if (!storage || !userId) return null;
    const parsed = safeParseJson<UserAppDataRecord>(storage.getItem(registeredDataKey(userId)));
    if (!parsed || typeof parsed !== 'object' || !parsed.profile) return null;
    return {
      ...parsed,
      userId,
      accountType: 'registered',
      profile: {
        ...parsed.profile,
        id: userId,
        accountType: 'registered',
        isDemo: false,
      },
      factsExploredIds: Array.isArray(parsed.factsExploredIds) ? parsed.factsExploredIds : [],
    };
  },

  saveUserAppData(
    record: UserAppDataRecord,
    demoEnabled = DEMO_MODE_ENABLED,
    storage: StorageLike | null = getBrowserStorage()
  ): void {
    if (!storage) return;
    if (record.accountType === 'demo') {
      if (!demoEnabled) return;
      const demoMap = this.getDemoRecordsMap(demoEnabled, storage);
      demoMap[record.userId] = {
        ...record,
        accountType: 'demo',
        profile: { ...record.profile, accountType: 'demo', isDemo: true },
      };
      this.saveDemoRecordsMap(demoMap, storage);
      return;
    }
    try {
      const normalized: UserAppDataRecord = {
        ...record,
        accountType: 'registered',
        profile: { ...record.profile, accountType: 'registered', isDemo: false },
      };
      storage.setItem(registeredDataKey(record.userId), JSON.stringify(normalized));
    } catch {
      // Ignore quota issues
    }
  },

  async registerAccount(input: {
    name: string;
    email: string;
    password: string;
    language?: Language;
    demoEnabled?: boolean;
    storage?: StorageLike | null;
  }): Promise<
    | { ok: true; authRecord: StoredRegisteredAuthRecord; userData: UserAppDataRecord }
    | { ok: false; code: 'DUPLICATE_EMAIL' | 'INVALID_INPUT' }
  > {
    const storage = input.storage !== undefined ? input.storage : getBrowserStorage();
    const demoEnabled = input.demoEnabled ?? DEMO_MODE_ENABLED;
    const normalizedEmail = input.email.trim().toLowerCase();
    const trimmedName = input.name.trim();

    if (!trimmedName || !normalizedEmail || !input.password) {
      return { ok: false, code: 'INVALID_INPUT' };
    }

    const existingEmails = this.getAllKnownEmails(demoEnabled, storage);
    if (existingEmails.includes(normalizedEmail)) {
      return { ok: false, code: 'DUPLICATE_EMAIL' };
    }

    const digest = await authService.hashPasswordPbkdf2(input.password);
    const profile = sessionService.createNewUserProfile(
      trimmedName,
      normalizedEmail,
      input.language ?? 'en'
    );

    const authRecord: StoredRegisteredAuthRecord = {
      userId: profile.id,
      accountType: 'registered',
      email: normalizedEmail,
      fullName: trimmedName,
      passwordSaltB64: digest.passwordSaltB64,
      passwordHashB64: digest.passwordHashB64,
      iterations: digest.iterations,
      createdAtIso: profile.createdAtIso,
    };

    const userData = createInitialRegisteredUserData(profile, input.language ?? 'en');

    const map = this.getRegisteredAccountsMap(storage);
    map[profile.id] = authRecord;
    this.saveRegisteredAccountsMap(map, storage);
    this.saveUserAppData(userData, demoEnabled, storage);

    return { ok: true, authRecord, userData };
  },

  async authenticateWithCredentials(input: {
    email: string;
    password: string;
    demoEnabled?: boolean;
    storage?: StorageLike | null;
  }): Promise<
    | { ok: true; userData: UserAppDataRecord }
    | { ok: false; code: 'INVALID_CREDENTIALS' }
  > {
    const storage = input.storage !== undefined ? input.storage : getBrowserStorage();
    const demoEnabled = input.demoEnabled ?? DEMO_MODE_ENABLED;
    const normalizedEmail = input.email.trim().toLowerCase();

    const regAccount = this.findRegisteredAccountByEmail(normalizedEmail, storage);
    if (regAccount) {
      const passwordMatches = await authService.verifyPasswordPbkdf2(input.password, regAccount);
      if (!passwordMatches) {
        return { ok: false, code: 'INVALID_CREDENTIALS' };
      }

      let userData = this.getRegisteredUserData(regAccount.userId, storage);
      if (!userData) {
        const fallbackProfile = sessionService.createNewUserProfile(
          regAccount.fullName,
          regAccount.email,
          'en',
          regAccount.userId
        );
        fallbackProfile.createdAtIso = regAccount.createdAtIso;
        userData = createInitialRegisteredUserData(fallbackProfile, 'en');
        this.saveUserAppData(userData, demoEnabled, storage);
      }

      this.setSessionPointer(
        { userId: regAccount.userId, accountType: 'registered', activeSession: null },
        storage
      );
      return { ok: true, userData };
    }

    if (demoEnabled) {
      const demoCred = DEMO_ACCOUNT_CREDENTIALS.find(
        (d) => d.email.toLowerCase() === normalizedEmail
      );
      if (demoCred && input.password === demoCred.demoPassword) {
        const demoMap = this.getDemoRecordsMap(demoEnabled, storage);
        const demoData = demoMap[demoCred.id];
        if (demoData) {
          this.setSessionPointer(
            { userId: demoCred.id, accountType: 'demo', activeSession: null },
            storage
          );
          return { ok: true, userData: demoData };
        }
      }
    }

    return { ok: false, code: 'INVALID_CREDENTIALS' };
  },

  authenticateDemoQuick(input: {
    email: string;
    demoEnabled?: boolean;
    storage?: StorageLike | null;
  }): UserAppDataRecord | null {
    const demoEnabled = input.demoEnabled ?? DEMO_MODE_ENABLED;
    if (!demoEnabled) return null;
    const storage = input.storage !== undefined ? input.storage : getBrowserStorage();
    const normalizedEmail = input.email.trim().toLowerCase();
    const demoCred = DEMO_ACCOUNT_CREDENTIALS.find(
      (d) => d.email.toLowerCase() === normalizedEmail
    );
    if (!demoCred) return null;
    const demoMap = this.getDemoRecordsMap(demoEnabled, storage);
    const demoData = demoMap[demoCred.id];
    if (!demoData) return null;
    this.setSessionPointer(
      { userId: demoCred.id, accountType: 'demo', activeSession: null },
      storage
    );
    return demoData;
  },

  async updateRegisteredPasswordByEmail(
    email: string,
    newPassword: string,
    storage: StorageLike | null = getBrowserStorage()
  ): Promise<boolean> {
    const rec = this.findRegisteredAccountByEmail(email, storage);
    if (!rec) return false;
    const digest = await authService.hashPasswordPbkdf2(newPassword);
    const map = this.getRegisteredAccountsMap(storage);
    map[rec.userId] = {
      ...rec,
      passwordSaltB64: digest.passwordSaltB64,
      passwordHashB64: digest.passwordHashB64,
      iterations: digest.iterations,
    };
    this.saveRegisteredAccountsMap(map, storage);
    return true;
  },

  updateRegisteredProfileMeta(
    userId: string,
    updates: { email?: string; fullName?: string },
    storage: StorageLike | null = getBrowserStorage()
  ): void {
    const map = this.getRegisteredAccountsMap(storage);
    const rec = map[userId];
    if (!rec) return;
    map[userId] = {
      ...rec,
      email: updates.email ? updates.email.trim().toLowerCase() : rec.email,
      fullName: updates.fullName ? updates.fullName.trim() : rec.fullName,
    };
    this.saveRegisteredAccountsMap(map, storage);
  },

  getSessionPointer(storage: StorageLike | null = getBrowserStorage()): ActiveSessionPointer | null {
    if (!storage) return null;
    const parsed = safeParseJson<ActiveSessionPointer>(
      storage.getItem(STORAGE_KEYS.SESSION_POINTER)
    );
    if (!parsed || !parsed.userId || (parsed.accountType !== 'registered' && parsed.accountType !== 'demo')) {
      return null;
    }
    return parsed;
  },

  setSessionPointer(
    pointer: ActiveSessionPointer | null,
    storage: StorageLike | null = getBrowserStorage()
  ): void {
    if (!storage) return;
    try {
      if (!pointer) {
        storage.removeItem(STORAGE_KEYS.SESSION_POINTER);
      } else {
        storage.setItem(STORAGE_KEYS.SESSION_POINTER, JSON.stringify(pointer));
      }
    } catch {
      // Ignore quota issues
    }
  },

  loadActiveUserSession(
    demoEnabled = DEMO_MODE_ENABLED,
    storage: StorageLike | null = getBrowserStorage()
  ): { userData: UserAppDataRecord; activeSession: ActiveSessionRuntime | null } | null {
    const pointer = this.getSessionPointer(storage);
    if (!pointer) return null;

    if (pointer.accountType === 'demo') {
      if (!demoEnabled) {
        this.setSessionPointer(null, storage);
        return null;
      }
      const demoMap = this.getDemoRecordsMap(demoEnabled, storage);
      const demoData = demoMap[pointer.userId];
      if (!demoData) {
        this.setSessionPointer(null, storage);
        return null;
      }
      return { userData: demoData, activeSession: pointer.activeSession ?? null };
    }

    const regMap = this.getRegisteredAccountsMap(storage);
    if (!regMap[pointer.userId]) {
      this.setSessionPointer(null, storage);
      return null;
    }
    const regData = this.getRegisteredUserData(pointer.userId, storage);
    if (!regData) {
      this.setSessionPointer(null, storage);
      return null;
    }
    return { userData: regData, activeSession: pointer.activeSession ?? null };
  },

  resetDemoUserDataset(
    demoUserId: string,
    demoEnabled = DEMO_MODE_ENABLED,
    storage: StorageLike | null = getBrowserStorage()
  ): UserAppDataRecord | null {
    if (!demoEnabled) return null;
    const defaults = createInitialDemoRecords();
    const freshRecord = defaults[demoUserId];
    if (!freshRecord) return null;

    const currentDemoMap = this.getDemoRecordsMap(demoEnabled, storage);
    currentDemoMap[demoUserId] = freshRecord;
    this.saveDemoRecordsMap(currentDemoMap, storage);

    const pointer = this.getSessionPointer(storage);
    if (pointer && pointer.accountType === 'demo' && pointer.userId === demoUserId) {
      this.setSessionPointer({ ...pointer, activeSession: null }, storage);
    }
    return freshRecord;
  },

  loadAuthTokens(storage: StorageLike | null = getBrowserStorage()): Record<string, SimulatedTokenRecord> {
    if (!storage) return {};
    const parsed = safeParseJson<Record<string, SimulatedTokenRecord>>(
      storage.getItem(STORAGE_KEYS.AUTH_TOKENS)
    );
    return parsed && typeof parsed === 'object' ? parsed : {};
  },

  saveAuthTokens(
    tokens: Record<string, SimulatedTokenRecord>,
    storage: StorageLike | null = getBrowserStorage()
  ): void {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
    } catch {
      // Ignore quota issues
    }
  },

  loadGuestLanguage(storage: StorageLike | null = getBrowserStorage()): Language {
    if (storage) {
      const saved = storage.getItem(STORAGE_KEYS.GUEST_LANGUAGE);
      if (saved === 'en' || saved === 'id') return saved;
    }
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('id')) {
      return 'id';
    }
    return 'en';
  },

  saveGuestLanguage(lang: Language, storage: StorageLike | null = getBrowserStorage()): void {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.GUEST_LANGUAGE, lang);
    } catch {
      // Ignore quota issues
    }
  },
};
