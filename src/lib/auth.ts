import { timingSafeEqual, scryptSync, randomBytes, createHmac } from 'node:crypto';

const SESSION_COOKIE = 'gem_session';
const COOKIE_MAX_AGE = 60 * 60 * 24;

function getSigningKey(): string {
  return import.meta.env.EDIT_PASSWORD_HASH?.slice(0, 32) ?? 'dev-secret-key-1234567890abcdef';
}

function sign(value: string): string {
  const hmac = createHmac('sha256', getSigningKey());
  hmac.update(value);
  return hmac.digest('hex');
}

export function createSessionCookie(): string {
  const payload = `${Date.now()}:${randomBytes(16).toString('hex')}`;
  const sig = sign(payload);
  const cookie = `${SESSION_COOKIE}=${payload}.${sig}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`;
  if (import.meta.env.PROD) {
    return cookie + '; Secure';
  }
  return cookie;
}

export function verifySession(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  const cookies = parseCookies(cookieHeader);
  const raw = cookies[SESSION_COOKIE];
  if (!raw) return false;
  const dot = raw.lastIndexOf('.');
  if (dot === -1) return false;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyPassword(password: string): boolean {
  const hash = import.meta.env.EDIT_PASSWORD_HASH;
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

function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  header.split(';').forEach((pair) => {
    const eq = pair.indexOf('=');
    if (eq === -1) return;
    const key = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    result[key] = value;
  });
  return result;
}
