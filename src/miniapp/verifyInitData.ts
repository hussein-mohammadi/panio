/**
 * Verifies Telegram Mini App `initData` per Telegram's documented algorithm:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * secret_key = HMAC_SHA256(key="WebAppData", data=botToken)
 * hash       = HMAC_SHA256(key=secret_key, data=dataCheckString)  (hex)
 *
 * Uses Web Crypto (`crypto.subtle`), available identically in Cloudflare Workers and in
 * Node (for tests) — no platform-specific code path.
 */

export interface TelegramInitDataUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface VerifiedInitData {
  user: TelegramInitDataUser;
  authDate: Date;
  raw: URLSearchParams;
}

export type InitDataVerification =
  | { valid: true; data: VerifiedInitData }
  | { valid: false; reason: string };

const MAX_AGE_SECONDS = 24 * 60 * 60;

async function hmacSha256Hex(keyMaterial: ArrayBuffer, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', keyMaterial, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyInitData(initData: string, botToken: string, maxAgeSeconds = MAX_AGE_SECONDS): Promise<InitDataVerification> {
  if (!initData || !botToken) {
    return { valid: false, reason: 'initData یا توکن بات موجود نیست.' };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { valid: false, reason: 'هش در initData موجود نیست.' };
  }
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = await crypto.subtle
    .importKey('raw', new TextEncoder().encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then((key) => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(botToken)));

  const computedHash = await hmacSha256Hex(secretKey, dataCheckString);

  if (computedHash !== hash) {
    return { valid: false, reason: 'امضای initData نامعتبر است.' };
  }

  const authDateRaw = params.get('auth_date');
  const authDate = authDateRaw ? new Date(Number(authDateRaw) * 1000) : null;
  if (!authDate || Number.isNaN(authDate.getTime())) {
    return { valid: false, reason: 'auth_date نامعتبر است.' };
  }

  const ageSeconds = (Date.now() - authDate.getTime()) / 1000;
  if (ageSeconds > maxAgeSeconds || ageSeconds < -60) {
    return { valid: false, reason: 'initData منقضی شده است.' };
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return { valid: false, reason: 'اطلاعات کاربر در initData موجود نیست.' };
  }

  let user: TelegramInitDataUser;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return { valid: false, reason: 'اطلاعات کاربر قابل خواندن نیست.' };
  }

  if (!Number.isFinite(user.id) || user.id <= 0) {
    return { valid: false, reason: 'شناسه کاربر نامعتبر است.' };
  }

  return { valid: true, data: { user, authDate, raw: params } };
}
