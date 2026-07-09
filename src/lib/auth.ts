import { timingSafeEqual, scryptSync, randomBytes } from 'node:crypto';

export function verifyPassword(password: string): boolean {
  const hash = process.env.EDIT_PASSWORD_HASH;
  if (!hash) return false;
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const derivedHex = derived.toString('hex');
  try {
    return timingSafeEqual(Buffer.from(derivedHex), Buffer.from(key));
  } catch {
    return false;
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}
