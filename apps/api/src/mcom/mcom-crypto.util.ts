import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Derive the token-encryption key. Prefers dedicated secrets, falls back
 * to the JWT secret. Throws in production when nothing is configured
 * instead of silently using a weak default.
 */
function normalizeKey(secret?: string): Buffer {
  const raw =
    secret ||
    process.env.MCOM_TOKEN_ENCRYPTION_KEY ||
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing token encryption secret (set JWT_ACCESS_SECRET)');
    }
    return createHash('sha256').update('mcom-dev-only-fallback-key').digest();
  }
  return createHash('sha256').update(raw).digest();
}

export function encryptMcomToken(value: string, secret?: string): string {
  if (!value) throw new Error('Cannot encrypt empty token');
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, normalizeKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptMcomToken(payload: string, secret?: string): string {
  const parts = payload.split(':');
  if (parts.length !== 3) throw new Error('Malformed encrypted token');
  const [ivB64, tagB64, dataB64] = parts;
  const decipher = createDecipheriv(
    ALGO,
    normalizeKey(secret),
    Buffer.from(ivB64, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
