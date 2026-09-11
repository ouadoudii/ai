import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const COOKIE_NAME = 'factory_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function accessKey() {
  const value = process.env.FACTORY_ACCESS_KEY;
  if (!value || value.length < 24) throw new Error('FACTORY_ACCESS_KEY must be configured with at least 24 characters.');
  return value;
}

function sessionToken() {
  return createHmac('sha256', accessKey()).update('app-factory-session-v1').digest('hex');
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

function cookieValue(req: VercelRequest) {
  const cookieHeader = req.headers.cookie ?? '';
  for (const part of cookieHeader.split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === COOKIE_NAME) return decodeURIComponent(value.join('='));
  }
  return '';
}

export function isFactoryAuthenticated(req: VercelRequest) {
  try {
    return safeEqual(cookieValue(req), sessionToken());
  } catch {
    return false;
  }
}

export function verifyFactoryAccessKey(candidate: string) {
  try {
    return safeEqual(candidate, accessKey());
  } catch {
    return false;
  }
}

export function setFactorySession(res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(sessionToken())}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`,
  );
}

export function clearFactorySession(res: VercelResponse) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

export function requireFactorySession(req: VercelRequest, res: VercelResponse) {
  if (isFactoryAuthenticated(req)) return true;
  res.status(401).json({ error: 'Nicht angemeldet.' });
  return false;
}
