import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLogoClick, resolveBrandLogoDestination } from './navigation';

test('resolveBrandLogoDestination maps guest, onboarding, and authenticated states accurately', () => {
  assert.equal(resolveBrandLogoDestination(null), '/');
  assert.equal(resolveBrandLogoDestination(undefined), '/');
  assert.equal(resolveBrandLogoDestination({ onboardingCompleted: false }), '/onboarding');
  assert.equal(resolveBrandLogoDestination({ onboardingCompleted: true }), '/home');
});

test('evaluateLogoClick prevents reload/transition when already on destination', () => {
  assert.deepEqual(
    evaluateLogoClick({
      currentPathname: '/home',
      targetPath: '/home',
      lastNavigationAt: 0,
      now: 1000,
    }),
    { action: 'scroll-top' }
  );

  assert.deepEqual(
    evaluateLogoClick({
      currentPathname: '/',
      targetPath: '/',
      lastNavigationAt: 0,
      now: 1000,
    }),
    { action: 'scroll-top' }
  );
});

test('evaluateLogoClick blocks overlapping rapid clicks within cooldown window', () => {
  assert.deepEqual(
    evaluateLogoClick({
      currentPathname: '/focus',
      targetPath: '/home',
      lastNavigationAt: 1000,
      now: 1120,
      cooldownMs: 300,
    }),
    { action: 'ignore' }
  );

  assert.deepEqual(
    evaluateLogoClick({
      currentPathname: '/focus',
      targetPath: '/home',
      lastNavigationAt: 1000,
      now: 1350,
      cooldownMs: 300,
    }),
    { action: 'navigate', targetPath: '/home' }
  );
});
