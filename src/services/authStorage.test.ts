import test from 'node:test';
import assert from 'node:assert/strict';
import { authService } from './authService.ts';
import { authStorage, STORAGE_KEYS, StorageLike } from './authStorage.ts';
import { isDemoAccount, isRegisteredAccount } from '../config/demoConfig.ts';
import { sessionService } from './sessionService.ts';

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };
}

test('PBKDF2 hashing produces salted non-plaintext digests and verifies accurately', async () => {
  const d1 = await authService.hashPasswordPbkdf2('StudySafe123');
  const d2 = await authService.hashPasswordPbkdf2('StudySafe123');

  assert.notEqual(d1.passwordSaltB64, d2.passwordSaltB64);
  assert.notEqual(d1.passwordHashB64, d2.passwordHashB64);
  assert.equal(d1.passwordHashB64.includes('StudySafe123'), false);

  assert.equal(await authService.verifyPasswordPbkdf2('StudySafe123', d1), true);
  assert.equal(await authService.verifyPasswordPbkdf2('WrongPass123', d1), false);
});

test('Registration persists account with PBKDF2 digest, rejects duplicates, and authenticates after reload', async () => {
  const storage = createMemoryStorage();

  const reg = await authStorage.registerAccount({
    name: 'Alice Wijaya',
    email: 'Alice@Study.EDU',
    password: 'Password123',
    language: 'en',
    demoEnabled: true,
    storage,
  });

  assert.equal(reg.ok, true);
  if (!reg.ok) return;

  assert.equal(reg.authRecord.accountType, 'registered');
  assert.equal(reg.authRecord.email, 'alice@study.edu');
  assert.equal(isRegisteredAccount(reg.userData.profile), true);
  assert.equal(isDemoAccount(reg.userData.profile), false);

  const rawAccountsJson = storage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS) ?? '';
  assert.equal(rawAccountsJson.includes('Password123'), false);

  // Duplicate registration rejected (case-insensitive)
  const dup = await authStorage.registerAccount({
    name: 'Alice Duplicate',
    email: 'alice@study.edu',
    password: 'OtherPass123',
    demoEnabled: true,
    storage,
  });
  assert.equal(dup.ok, false);
  if (!dup.ok) {
    assert.equal(dup.code, 'DUPLICATE_EMAIL');
  }

  // Wrong password rejected
  const wrong = await authStorage.authenticateWithCredentials({
    email: 'alice@study.edu',
    password: 'WrongPassword1',
    demoEnabled: true,
    storage,
  });
  assert.equal(wrong.ok, false);

  // Correct credentials authenticate and persist session pointer
  const okLogin = await authStorage.authenticateWithCredentials({
    email: 'alice@study.edu',
    password: 'Password123',
    demoEnabled: true,
    storage,
  });
  assert.equal(okLogin.ok, true);
  if (!okLogin.ok) return;
  assert.equal(okLogin.userData.profile.name, 'Alice Wijaya');

  // Simulated browser reload restores exact registered user
  const restored = authStorage.loadActiveUserSession(true, storage);
  assert.ok(restored);
  assert.equal(restored.userData.userId, reg.authRecord.userId);
  assert.equal(restored.userData.accountType, 'registered');
});

test('Multi-user data isolation keeps sessions, preferences, and facts strictly separated per user_id', async () => {
  const storage = createMemoryStorage();

  const regA = await authStorage.registerAccount({
    name: 'Alice One',
    email: 'alice1@study.edu',
    password: 'Password123',
    demoEnabled: true,
    storage,
  });
  const regB = await authStorage.registerAccount({
    name: 'Bob Two',
    email: 'bob2@study.edu',
    password: 'Password456',
    demoEnabled: true,
    storage,
  });
  assert.equal(regA.ok, true);
  assert.equal(regB.ok, true);
  if (!regA.ok || !regB.ok) return;

  // Mutate Bob's sessions & preferences
  const bobSession = sessionService.buildCompletedSession({
    sessionId: 'sess-bob-1',
    userId: regB.userData.userId,
    plannedMinutes: 25,
    startedAtIso: new Date().toISOString(),
    actualFocusSeconds: 1500,
    awaySeconds: 0,
    awayEvents: 0,
    phoneLiftEvents: 0,
    disconnectEvents: 0,
    status: 'Completed',
    subjectTag: 'Physics',
  });
  authStorage.saveUserAppData(
    {
      ...regB.userData,
      sessions: [bobSession],
      factsExploredIds: ['fact_ward_2017'],
      profile: {
        ...regB.userData.profile,
        preferences: {
          ...regB.userData.profile.preferences,
          theme: 'dark',
        },
      },
    },
    true,
    storage
  );

  // Log in as Alice and verify zero data bleed from Bob
  const loginA = await authStorage.authenticateWithCredentials({
    email: 'alice1@study.edu',
    password: 'Password123',
    demoEnabled: true,
    storage,
  });
  assert.equal(loginA.ok, true);
  if (!loginA.ok) return;
  assert.equal(loginA.userData.sessions.length, 0);
  assert.equal(loginA.userData.factsExploredIds.length, 0);
  assert.equal(loginA.userData.profile.preferences.theme, 'light');

  // Log in as Bob and verify Bob's data persists
  const loginB = await authStorage.authenticateWithCredentials({
    email: 'bob2@study.edu',
    password: 'Password456',
    demoEnabled: true,
    storage,
  });
  assert.equal(loginB.ok, true);
  if (!loginB.ok) return;
  assert.equal(loginB.userData.sessions.length, 1);
  assert.equal(loginB.userData.sessions[0].subjectTag, 'Physics');
  assert.equal(loginB.userData.profile.preferences.theme, 'dark');
});

test('Scoped demo reset clears only the target demo account and leaves registered accounts intact', async () => {
  const storage = createMemoryStorage();

  const regA = await authStorage.registerAccount({
    name: 'Alice Preserved',
    email: 'alice.preserved@study.edu',
    password: 'Password123',
    demoEnabled: true,
    storage,
  });
  assert.equal(regA.ok, true);
  if (!regA.ok) return;

  const aliceSession = sessionService.buildCompletedSession({
    sessionId: 'sess-alice-1',
    userId: regA.userData.userId,
    plannedMinutes: 25,
    startedAtIso: new Date().toISOString(),
    actualFocusSeconds: 1500,
    awaySeconds: 0,
    awayEvents: 0,
    phoneLiftEvents: 0,
    disconnectEvents: 0,
    status: 'Completed',
    subjectTag: 'Chemistry',
  });
  authStorage.saveUserAppData({ ...regA.userData, sessions: [aliceSession] }, true, storage);

  // Switch to demo Nadia, add a custom change, then reset Nadia
  const nadia = authStorage.authenticateDemoQuick({
    email: 'nadia@focuslamp.demo',
    demoEnabled: true,
    storage,
  });
  assert.ok(nadia);
  assert.equal(isDemoAccount(nadia.profile), true);

  authStorage.saveUserAppData(
    {
      ...nadia,
      profile: { ...nadia.profile, major: 'Modified Demo Major' },
    },
    true,
    storage
  );

  const resetNadia = authStorage.resetDemoUserDataset('demo-nadia', true, storage);
  assert.ok(resetNadia);
  assert.equal(resetNadia.profile.major, 'Computer Science · Year 3');

  // Verify Alice's registered account & session are completely intact
  const loginA = await authStorage.authenticateWithCredentials({
    email: 'alice.preserved@study.edu',
    password: 'Password123',
    demoEnabled: true,
    storage,
  });
  assert.equal(loginA.ok, true);
  if (!loginA.ok) return;
  assert.equal(loginA.userData.sessions.length, 1);
  assert.equal(loginA.userData.sessions[0].subjectTag, 'Chemistry');
});

test('Disabling demo mode blocks demo accounts while keeping registered accounts working', async () => {
  const storage = createMemoryStorage();

  const reg = await authStorage.registerAccount({
    name: 'Prod Student',
    email: 'prod@study.edu',
    password: 'Password123',
    demoEnabled: false,
    storage,
  });
  assert.equal(reg.ok, true);

  // Demo quick login and demo credential login rejected when demoEnabled is false
  assert.equal(
    authStorage.authenticateDemoQuick({
      email: 'nadia@focuslamp.demo',
      demoEnabled: false,
      storage,
    }),
    null
  );
  const demoCred = await authStorage.authenticateWithCredentials({
    email: 'nadia@focuslamp.demo',
    password: 'DemoFocus1',
    demoEnabled: false,
    storage,
  });
  assert.equal(demoCred.ok, false);

  // Registered user logs in normally when demoEnabled is false
  const regLogin = await authStorage.authenticateWithCredentials({
    email: 'prod@study.edu',
    password: 'Password123',
    demoEnabled: false,
    storage,
  });
  assert.equal(regLogin.ok, true);
});

test('Registered accounts initialize with disconnected real device state, empty notifications, welcomeGreetingSeen=false, and clean starter chat', async () => {
  const storage = createMemoryStorage();

  const reg = await authStorage.registerAccount({
    name: 'Afif Rahman',
    email: 'afif@study.edu',
    password: 'Password123',
    language: 'en',
    demoEnabled: true,
    storage,
  });

  assert.equal(reg.ok, true);
  if (!reg.ok) return;

  const { userData } = reg;
  assert.equal(userData.profile.welcomeGreetingSeen, false);
  assert.equal(userData.profile.major, '');
  assert.equal(userData.sessions.length, 0);
  assert.equal(userData.notifications.length, 0);
  assert.equal(userData.factsExploredIds.length, 0);

  // Disconnected real hardware baseline (zero simulated sensor numbers)
  assert.equal(userData.device.connected, false);
  assert.equal(userData.device.connectionStatus, 'Disconnected');
  assert.equal(userData.device.connectionType, 'Offline');
  assert.equal(userData.device.phoneDocked, false);
  assert.equal(userData.device.lampOn, false);
  assert.equal(userData.device.dndActive, false);
  assert.equal(userData.device.wifiConnected, false);
  assert.equal(userData.device.ambientLightLux, 0);
  assert.equal(userData.device.signalStrengthDbm, 0);
  assert.equal(userData.device.batteryPercent, null);
  assert.equal(userData.device.deviceId, '');
  assert.equal(userData.device.lastSyncAt, '');

  // Starter AI message does not carry demo simulatedLabel
  assert.equal(userData.conversations.length, 1);
  assert.equal(userData.conversations[0].messages[0].simulatedLabel, undefined);

  // Authenticate to establish active session pointer
  const loginRes = await authStorage.authenticateWithCredentials({
    email: 'afif@study.edu',
    password: 'Password123',
    demoEnabled: true,
    storage,
  });
  assert.equal(loginRes.ok, true);
  if (!loginRes.ok) return;

  // Mark welcome greeting seen and verify it persists on reload without touching demo accounts
  authStorage.saveUserAppData(
    {
      ...loginRes.userData,
      profile: {
        ...loginRes.userData.profile,
        welcomeGreetingSeen: true,
      },
    },
    true,
    storage
  );

  const reloaded = authStorage.loadActiveUserSession(true, storage);
  assert.ok(reloaded);
  assert.equal(reloaded.userData.profile.welcomeGreetingSeen, true);

  // Demo account remains clearly classified as demo with populated sample data
  const demo = authStorage.authenticateDemoQuick({
    email: 'nadia@focuslamp.demo',
    demoEnabled: true,
    storage,
  });
  assert.ok(demo);
  assert.equal(isDemoAccount(demo.profile), true);
  assert.equal(demo.device.connected, true);
  assert.equal(demo.device.connectionType, 'BLE 5.3 (Simulated)');
  assert.ok(demo.sessions.length > 0);
  assert.ok(demo.notifications.length > 0);
});

