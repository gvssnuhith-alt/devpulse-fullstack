import crypto from 'node:crypto';

// ponytail: basic HMAC-SHA256 JWT & scrypt hashing. Swap to jsonwebtoken / bcryptjs if rotation or multi-algo needed.
const SECRET = process.env.JWT_SECRET || 'devpulse-fallback-secret-2026';

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
}

export function signToken(payload, expiresInSec = 86400) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const body = b64url(JSON.stringify({ ...payload, exp }));
  const signature = b64url(crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest());
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = b64url(crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest());
  if (signature !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
