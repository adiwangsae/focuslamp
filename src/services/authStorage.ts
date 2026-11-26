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
import { authService, AuthTokenRecord, PasswordDigestRecord } from './authService';
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
  SESSION_POINTER: 'focuslamp_auth_session_v1',
  AUTH_TOKENS: 'focuslamp_auth_tokens_v1',
  GUEST_LANGUAGE: 'focuslamp_guest_lang_v1',
  REMEMBERED_EMAIL: 'focuslamp_remembered_email',
} as const;

const LEGACY_DEMO_STATE_KEY = 'focuslamp_demo_state_v1';

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

function registeredDataKey(userId: string): string {
  return `${STORAGE_KEYS.REGISTERED_DATA_PREFIX}${userId}`;
}

export const authStorage = {
  getRegisteredAccountsMap(
    storage: StorageLike | null = getBrowserStorage()
  ): Record<string, StoredRegisteredAuthRecord> {
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

  getAllKnownEmails(storage: StorageLike | null = getBrowserStorage()): string[] {
    return Object.values(this.getRegisteredAccountsMap(storage)).map((r) =>
      r.email.toLowerCase()
    );
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
      },
      factsExploredIds: Array.isArray(parsed.factsExploredIds) ? parsed.factsExploredIds : [],
    };
  },

  saveUserAppData(
    record: UserAppDataRecord,
    storage: StorageLike | null = getBrowserStorage()
  ): void {
    if (!storage) return;
    try {
      const normalized: UserAppDataRecord = {
        ...record,
        accountType: 'registered',
        profile: { ...record.profile, accountType: 'registered' },
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
    storage?: StorageLike | null;
  }): Promise<
    | { ok: true; authRecord: StoredRegisteredAuthRecord; userData: UserAppDataRecord }
    | { ok: false; code: 'DUPLICATE_EMAIL' | 'INVALID_INPUT' }
  > {
    const storage = input.storage !== undefined ? input.storage : getBrowserStorage();
    const normalizedEmail = input.email.trim().toLowerCase();
    const trimmedName = input.name.trim();

    if (!trimmedName || !normalizedEmail || !input.password) {
      return { ok: false, code: 'INVALID_INPUT' };
    }

    const existingEmails = this.getAllKnownEmails(storage);
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
    this.saveUserAppData(userData, storage);

    return { ok: true, authRecord, userData };
  },

  async authenticateWithCredentials(input: {
    email: string;
    password: string;
    storage?: StorageLike | null;
  }): Promise<
    | { ok: true; userData: UserAppDataRecord }
    | { ok: false; code: 'INVALID_CREDENTIALS' }
  > {
    const storage = input.storage !== undefined ? input.storage : getBrowserStorage();
    const normalizedEmail = input.email.trim().toLowerCase();

    const regAccount = this.findRegisteredAccountByEmail(normalizedEmail, storage);
    if (!regAccount) {
      return { ok: false, code: 'INVALID_CREDENTIALS' };
    }

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
      this.saveUserAppData(userData, storage);
    }

    this.setSessionPointer(
      { userId: regAccount.userId, accountType: 'registered', activeSession: null },
      storage
    );
    return { ok: true, userData };
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
    if (!parsed || !parsed.userId || parsed.accountType !== 'registered') {
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
    storage: StorageLike | null = getBrowserStorage()
  ): { userData: UserAppDataRecord; activeSession: ActiveSessionRuntime | null } | null {
    if (storage) {
      try {
        storage.removeItem(LEGACY_DEMO_STATE_KEY);
      } catch {
        // Ignore restricted storage contexts
      }
    }

    const pointer = this.getSessionPointer(storage);
    if (!pointer) {
      // Clear any stale legacy non-registered session pointer
      if (storage && storage.getItem(STORAGE_KEYS.SESSION_POINTER)) {
        this.setSessionPointer(null, storage);
      }
      return null;
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

  loadAuthTokens(storage: StorageLike | null = getBrowserStorage()): Record<string, AuthTokenRecord> {
    if (!storage) return {};
    const parsed = safeParseJson<Record<string, AuthTokenRecord>>(
      storage.getItem(STORAGE_KEYS.AUTH_TOKENS)
    );
    return parsed && typeof parsed === 'object' ? parsed : {};
  },

  saveAuthTokens(
    tokens: Record<string, AuthTokenRecord>,
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
