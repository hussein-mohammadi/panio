import { describe, expect, it } from 'vitest';
import { verifyInitData } from '../src/miniapp/verifyInitData.js';

const BOT_TOKEN = '123456:test-bot-token';

async function hmacHex(keyMaterial: ArrayBuffer, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', keyMaterial, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sign(params: URLSearchParams, botToken: string): Promise<string> {
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = await crypto.subtle
    .importKey('raw', new TextEncoder().encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then((key) => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(botToken)));

  return hmacHex(secretKey, dataCheckString);
}

async function buildInitData(overrides: Record<string, string> = {}, botToken = BOT_TOKEN): Promise<string> {
  const params = new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify({ id: 999, first_name: 'Sara' }),
    ...overrides,
  });
  params.set('hash', await sign(params, botToken));
  return params.toString();
}

describe('verifyInitData', () => {
  it('accepts correctly signed, fresh initData', async () => {
    const initData = await buildInitData();
    const result = await verifyInitData(initData, BOT_TOKEN);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.user.id).toBe(999);
    }
  });

  it('rejects a tampered hash', async () => {
    const initData = (await buildInitData()).replace(/hash=[0-9a-f]+/, 'hash=' + '0'.repeat(64));
    const result = await verifyInitData(initData, BOT_TOKEN);
    expect(result.valid).toBe(false);
  });

  it('rejects initData signed with a different bot token', async () => {
    const initData = await buildInitData({}, 'different:token');
    const result = await verifyInitData(initData, BOT_TOKEN);
    expect(result.valid).toBe(false);
  });

  it('rejects expired initData', async () => {
    const oldAuthDate = Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60;
    const initData = await buildInitData({ auth_date: String(oldAuthDate) });
    const result = await verifyInitData(initData, BOT_TOKEN);
    expect(result.valid).toBe(false);
  });

  it('rejects initData missing the hash field', async () => {
    const result = await verifyInitData('user=%7B%22id%22%3A1%7D', BOT_TOKEN);
    expect(result.valid).toBe(false);
  });

  it('rejects an empty initData string', async () => {
    const result = await verifyInitData('', BOT_TOKEN);
    expect(result.valid).toBe(false);
  });
});
