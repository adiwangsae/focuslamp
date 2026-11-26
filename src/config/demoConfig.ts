import type { AccountType, UserProfile } from '../types';

function readEnvFlag(name: string): string | undefined {
  try {
    const metaEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
    if (metaEnv && typeof metaEnv[name] === 'string') {
      return metaEnv[name];
    }
  } catch {
    // Ignore when running outside Vite
  }
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name];
  }
  return undefined;
}

/**
 * Centralized toggle controlling demonstration accounts, demo credentials,
 * demo reset controls, and prototype-only notices.
 * Set VITE_ENABLE_DEMO_MODE=false in production builds to strip demo flows cleanly.
 */
export const DEMO_MODE_ENABLED: boolean = readEnvFlag('VITE_ENABLE_DEMO_MODE') !== 'false';

export function resolveAccountType(
  user: Pick<UserProfile, 'accountType' | 'isDemo'> | null | undefined
): AccountType {
  if (!user) return 'registered';
  if (user.accountType === 'demo' || user.accountType === 'registered') {
    return user.accountType;
  }
  return user.isDemo ? 'demo' : 'registered';
}

export function isDemoAccount(
  user: Pick<UserProfile, 'accountType' | 'isDemo'> | null | undefined
): boolean {
  if (!user) return false;
  return resolveAccountType(user) === 'demo';
}

export function isRegisteredAccount(
  user: Pick<UserProfile, 'accountType' | 'isDemo'> | null | undefined
): boolean {
  if (!user) return false;
  return resolveAccountType(user) === 'registered';
}
