import { describe, expect, it } from 'vitest';
import { BotSessionValidator } from '../src/telegram/BotSessionValidator.js';
import { MiniAppAuthService } from '../src/miniapp/MiniAppAuthService.js';
import { DeepLinkResolver } from '../src/telegram/DeepLinkResolver.js';
import { ShopRepository } from '../src/infrastructure/db/repositories/ShopRepository.js';
import { ShopMember } from '../src/domain/shop/ShopMember.js';

const TEST_BOT_TOKEN = '123456:test-bot-token';

async function hmacHex(keyMaterial: ArrayBuffer, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', keyMaterial, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function buildInitData(userId: number, botToken: string, authDate = Math.floor(Date.now() / 1000)): Promise<string> {
  const params = new URLSearchParams({
    auth_date: String(authDate),
    user: JSON.stringify({ id: userId, first_name: 'Test' }),
  });
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = await crypto.subtle
    .importKey('raw', new TextEncoder().encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then((key) => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(botToken)));

  params.set('hash', await hmacHex(secretKey, dataCheckString));
  return params.toString();
}

function fakeShopRepository(membership: ShopMember | null): ShopRepository {
  return { getMembership: async () => membership } as unknown as ShopRepository;
}

describe('Phase 4 telegram and mini app', () => {
  it('rejects invalid telegram identity', () => {
    const validator = new BotSessionValidator();
    const result = validator.validate({
      userId: 123,
      authDate: 0,
      hash: 'bad',
      raw: '',
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Invalid Telegram identity.');
  });

  it('accepts a valid telegram identity payload shape', () => {
    const validator = new BotSessionValidator();
    const result = validator.validate({
      userId: 321,
      authDate: Math.floor(Date.now() / 1000),
      hash: 'ok',
      raw: 'user=321',
    });

    expect(result.valid).toBe(true);
  });

  it('resolves a valid deep-link to a shop and flow context', () => {
    const resolver = new DeepLinkResolver();
    const result = resolver.resolve({
      type: 'JOIN_SHOP',
      shopId: 'shop-9',
      inviteToken: 'abc123',
      userId: 777,
    });

    expect(result.valid).toBe(true);
    expect(result.shopId).toBe('shop-9');
    expect(result.flow).toBe('JOIN_SHOP');
  });

  it('rejects a deep link missing required parameters', () => {
    const resolver = new DeepLinkResolver();
    const result = resolver.resolve({
      type: 'JOIN_SHOP',
      userId: 777,
    } as any);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Missing invite token or shop context.');
  });

  it('allows a mini app request for an authenticated user with valid shop context', async () => {
    const member = new ShopMember({ id: 'member-1', shopId: 'shop-10', telegramUserId: 123, role: 'OWNER' });
    const auth = new MiniAppAuthService(TEST_BOT_TOKEN, fakeShopRepository(member));
    const initData = await buildInitData(123, TEST_BOT_TOKEN);

    const result = await auth.authorizeForShop(initData, 'shop-10');

    expect(result.authorized).toBe(true);
    expect(result.user?.id).toBe(123);
    expect(result.role).toBe('OWNER');
  });

  it('rejects a mini app request with a tampered initData signature', async () => {
    const auth = new MiniAppAuthService(TEST_BOT_TOKEN, fakeShopRepository(null));
    const initData = (await buildInitData(123, TEST_BOT_TOKEN)).replace(/hash=[^&]+/, 'hash=deadbeef');

    const result = await auth.authenticate(initData);

    expect(result.authorized).toBe(false);
  });

  it('rejects a mini app request for a user who is not a member of the shop', async () => {
    const auth = new MiniAppAuthService(TEST_BOT_TOKEN, fakeShopRepository(null));
    const initData = await buildInitData(123, TEST_BOT_TOKEN);

    const result = await auth.authorizeForShop(initData, 'shop-10');

    expect(result.authorized).toBe(false);
    expect(result.reason).toBe('کاربر عضو این فروشگاه نیست.');
  });
});
