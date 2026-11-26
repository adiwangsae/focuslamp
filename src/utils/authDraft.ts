export type AuthMode = 'login' | 'register';

export interface AuthDraftState {
  email: string;
  name: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const AUTH_DRAFT_KEY = 'focuslamp_auth_draft_v1';

function resolveSessionStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage !== undefined) return storage;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage;
  }
  return null;
}

export function getAuthDraft(storage?: StorageLike | null): AuthDraftState {
  const store = resolveSessionStorage(storage);
  if (!store) return { email: '', name: '' };
  try {
    const raw = store.getItem(AUTH_DRAFT_KEY);
    if (!raw) return { email: '', name: '' };
    const parsed = JSON.parse(raw) as Partial<AuthDraftState>;
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      name: typeof parsed.name === 'string' ? parsed.name : '',
    };
  } catch {
    return { email: '', name: '' };
  }
}

export function saveAuthDraft(
  partial: Partial<AuthDraftState>,
  storage?: StorageLike | null
): AuthDraftState {
  const current = getAuthDraft(storage);
  const next: AuthDraftState = {
    email: partial.email !== undefined ? partial.email : current.email,
    name: partial.name !== undefined ? partial.name : current.name,
  };
  const store = resolveSessionStorage(storage);
  if (store) {
    try {
      store.setItem(AUTH_DRAFT_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors in private browsing
    }
  }
  return next;
}

export function clearAuthDraft(storage?: StorageLike | null): void {
  const store = resolveSessionStorage(storage);
  if (!store) return;
  try {
    store.removeItem(AUTH_DRAFT_KEY);
  } catch {
    // Ignore storage removal errors
  }
}

export function getAuthModeDirection(prevMode: AuthMode, nextMode: AuthMode): number {
  if (prevMode === nextMode) return 0;
  return nextMode === 'register' ? 1 : -1;
}
