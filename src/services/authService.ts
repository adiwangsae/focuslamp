export interface AuthTokenRecord {
  token: string;
  email: string;
  kind: 'verify_email' | 'reset_password' | 'change_email';
  newEmail?: string;
  createdAtMs: number;
  expiresAtMs: number;
  used: boolean;
}

export interface PasswordDigestRecord {
  passwordSaltB64: string;
  passwordHashB64: string;
  iterations: number;
}

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_PBKDF2_ITERATIONS = 120_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function constantTimeBytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function getSubtleCrypto(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API subtle digest is unavailable in this environment.');
  }
  return subtle;
}

async function derivePbkdf2Bits(
  password: string,
  saltBytes: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const subtle = getSubtleCrypto();
  const encoder = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const saltBuffer = saltBytes.buffer.slice(
    saltBytes.byteOffset,
    saltBytes.byteOffset + saltBytes.byteLength
  ) as ArrayBuffer;
  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

export const authService = {
  async hashPasswordPbkdf2(
    password: string,
    existingSaltB64?: string,
    iterations = DEFAULT_PBKDF2_ITERATIONS
  ): Promise<PasswordDigestRecord> {
    const saltBytes = existingSaltB64
      ? base64ToBytes(existingSaltB64)
      : globalThis.crypto.getRandomValues(new Uint8Array(16));
    const derived = await derivePbkdf2Bits(password, saltBytes, iterations);
    return {
      passwordSaltB64: bytesToBase64(saltBytes),
      passwordHashB64: bytesToBase64(derived),
      iterations,
    };
  },

  async verifyPasswordPbkdf2(
    password: string,
    digest: PasswordDigestRecord
  ): Promise<boolean> {
    if (!password || !digest.passwordSaltB64 || !digest.passwordHashB64) {
      return false;
    }
    try {
      const saltBytes = base64ToBytes(digest.passwordSaltB64);
      const expectedBytes = base64ToBytes(digest.passwordHashB64);
      const derivedBytes = await derivePbkdf2Bits(
        password,
        saltBytes,
        digest.iterations || DEFAULT_PBKDF2_ITERATIONS
      );
      return constantTimeBytesEqual(derivedBytes, expectedBytes);
    } catch {
      return false;
    }
  },

  createVerificationToken(email: string, nowMs = Date.now()): AuthTokenRecord {
    const normalized = email.trim().toLowerCase();
    return {
      token: `vrf-${nowMs}-${Math.random().toString(36).slice(2, 8)}`,
      email: normalized,
      kind: 'verify_email',
      createdAtMs: nowMs,
      expiresAtMs: nowMs + EMAIL_VERIFY_TTL_MS,
      used: false,
    };
  },

  createEmailChangeToken(
    currentEmail: string,
    newEmail: string,
    nowMs = Date.now()
  ): AuthTokenRecord {
    return {
      token: `chg-${nowMs}-${Math.random().toString(36).slice(2, 8)}`,
      email: currentEmail.trim().toLowerCase(),
      newEmail: newEmail.trim().toLowerCase(),
      kind: 'change_email',
      createdAtMs: nowMs,
      expiresAtMs: nowMs + EMAIL_VERIFY_TTL_MS,
      used: false,
    };
  },

  createResetToken(email: string, nowMs = Date.now()): AuthTokenRecord {
    return {
      token: `rst-${nowMs}-${Math.random().toString(36).slice(2, 8)}`,
      email: email.trim().toLowerCase(),
      kind: 'reset_password',
      createdAtMs: nowMs,
      expiresAtMs: nowMs + PASSWORD_RESET_TTL_MS,
      used: false,
    };
  },

  validateToken(
    record: AuthTokenRecord | undefined | null,
    nowMs = Date.now()
  ): { valid: boolean; reason?: 'not_found' | 'already_used' | 'expired' } {
    if (!record) {
      return { valid: false, reason: 'not_found' };
    }
    if (record.used) {
      return { valid: false, reason: 'already_used' };
    }
    if (nowMs > record.expiresAtMs) {
      return { valid: false, reason: 'expired' };
    }
    return { valid: true };
  },
};
