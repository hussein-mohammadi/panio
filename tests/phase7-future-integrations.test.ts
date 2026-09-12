import { describe, expect, it } from 'vitest';
import { ExternalCommerceService } from '../src/integrations/ExternalCommerceService.js';
import { InstagramProvider } from '../src/integrations/InstagramProvider.js';

describe('Phase 7 future integrations', () => {
  it('creates a potential order only after external message validation', () => {
    const service = new ExternalCommerceService();
    const result = service.processIncomingMessage({
      source: 'INSTAGRAM',
      message: 'I want 2 notebooks',
      userId: 999,
      shopId: 'shop-1',
      isValidated: true,
    });

    expect(result.success).toBe(true);
    expect(result.potentialOrder).toBeDefined();
  });

  it('rejects unvalidated external channel messages before order creation', () => {
    const service = new ExternalCommerceService();
    const result = service.processIncomingMessage({
      source: 'INSTAGRAM',
      message: 'I want 2 notebooks',
      userId: 999,
      shopId: 'shop-1',
      isValidated: false,
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe('External message must be validated before a potential order is created.');
  });

  it('keeps Instagram behind the abstraction and exposes a provider contract', () => {
    const provider = new InstagramProvider();
    const result = provider.parseMessage({
      text: '2 notebooks',
      userId: 777,
    });

    expect(result.valid).toBe(true);
    expect(result.parsedText).toBe('2 notebooks');
  });
});
