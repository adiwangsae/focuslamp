import { UserProfile } from '../types';

export type BrandDestination = '/' | '/home' | '/onboarding';

export type LogoClickOutcome =
  | { action: 'scroll-top' }
  | { action: 'ignore' }
  | { action: 'navigate'; targetPath: BrandDestination };

export const LOGO_NAV_COOLDOWN_MS = 300;

/**
 * Resolves the canonical home/landing destination for the FocusLamp brand logo
 * based on the current authentication and onboarding state.
 */
export const resolveBrandLogoDestination = (
  currentUser: Pick<UserProfile, 'onboardingCompleted'> | null | undefined
): BrandDestination => {
  if (!currentUser) {
    return '/';
  }
  return currentUser.onboardingCompleted ? '/home' : '/onboarding';
};

/**
 * Determines whether clicking the brand logo should navigate, smoothly scroll to top
 * (when already on the destination), or ignore rapid duplicate clicks during transitions.
 */
export const evaluateLogoClick = ({
  currentPathname,
  targetPath,
  lastNavigationAt,
  now,
  cooldownMs = LOGO_NAV_COOLDOWN_MS,
}: {
  currentPathname: string;
  targetPath: BrandDestination;
  lastNavigationAt: number;
  now: number;
  cooldownMs?: number;
}): LogoClickOutcome => {
  if (currentPathname === targetPath) {
    return { action: 'scroll-top' };
  }
  if (lastNavigationAt > 0 && now - lastNavigationAt < cooldownMs) {
    return { action: 'ignore' };
  }
  return { action: 'navigate', targetPath };
};
