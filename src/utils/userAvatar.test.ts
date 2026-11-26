import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getUserInitials } from './userAvatar';

describe('getUserInitials', () => {
  it('extracts two-letter initials from multi-word full names', () => {
    assert.equal(getUserInitials('Langit Adiwangsa'), 'LA');
    assert.equal(getUserInitials('Alex Pratama Putra'), 'AP');
    assert.equal(getUserInitials('  siti   rahma  '), 'SR');
  });

  it('uses up to two leading characters for single-word names', () => {
    assert.equal(getUserInitials('Maya'), 'MA');
    assert.equal(getUserInitials('Z'), 'Z');
  });

  it('falls back gracefully when name is empty or missing', () => {
    assert.equal(getUserInitials(''), 'FL');
    assert.equal(getUserInitials('   '), 'FL');
    assert.equal(getUserInitials(undefined), 'FL');
    assert.equal(getUserInitials(null), 'FL');
  });
});
