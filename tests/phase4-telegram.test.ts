import { describe, expect, it } from 'vitest';
import { BotSessionValidator } from '../src/telegram/BotSessionValidator.js';
import { MiniAppAuthService } from '../src/miniapp/MiniAppAuthService.js';
import { DeepLinkResolver } from '../src/telegram/DeepLinkResolver.js';

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

  it('allows a mini app request for an authenticated user with valid shop context', () => {
    const auth = new MiniAppAuthService();
    const result = auth.authorize({
      telegramUserId: 123,
      shopId: 'shop-10',
      initData: 'valid',
      isTrusted: true,
    });

    expect(result.authorized).toBe(true);
    expect(result.shopId).toBe('shop-10');
  });
});
