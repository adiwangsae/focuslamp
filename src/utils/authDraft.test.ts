import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearAuthDraft,
  getAuthDraft,
  getAuthModeDirection,
  saveAuthDraft,
  StorageLike,
} from './authDraft';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

describe('authDraft helpers', () => {
  it('persists email and name across mode transitions', () => {
    const store = createMemoryStorage();
    assert.deepEqual(getAuthDraft(store), { email: '', name: '' });

    saveAuthDraft({ email: 'student@campus.ac.id' }, store);
    assert.deepEqual(getAuthDraft(store), { email: 'student@campus.ac.id', name: '' });

    saveAuthDraft({ name: 'Nadia Pratama' }, store);
    assert.deepEqual(getAuthDraft(store), {
      email: 'student@campus.ac.id',
      name: 'Nadia Pratama',
    });

    clearAuthDraft(store);
    assert.deepEqual(getAuthDraft(store), { email: '', name: '' });
  });

  it('computes directional animation sign between login and register', () => {
    assert.equal(getAuthModeDirection('login', 'register'), 1);
    assert.equal(getAuthModeDirection('register', 'login'), -1);
    assert.equal(getAuthModeDirection('login', 'login'), 0);
  });
});
