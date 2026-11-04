/**
 * Standard WebCrypto password hashing and random token utilities.
 * Native zero-dependency implementation compatible with Cloudflare Workers, Bun, and Node.js.
 */

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const keyBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(keyBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2$100000$${saltHex}$${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return false;
  }
  const iterations = parseInt(parts[1], 10);
  const saltHex = parts[2];
  const targetHashHex = parts[3];

  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const keyBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  const hashHex = Array.from(new Uint8Array(keyBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(hashHex, targetHashHex);
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const aLen = a.length;
  const bLen = b.length;
  let diff = aLen ^ bLen;
  for (let i = 0; i < aLen; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i % (bLen || 1));
  }
  return diff === 0;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateSecureToken(): string {
  const buffer = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}
