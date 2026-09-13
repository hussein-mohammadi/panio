import { describe, expect, it, vi, afterEach } from 'vitest';
import { ZarinpalProvider } from '../src/infrastructure/payment/ZarinpalProvider.js';

const config = { merchantId: 'test-merchant', sandbox: true };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ZarinpalProvider', () => {
  it('requests a payment and converts toman to rial', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { code: 100, authority: 'AUTH123', message: 'ok' } }), { status: 200 })
    );
    vi.stubGlobal('fetch', fetchMock);

    const provider = new ZarinpalProvider(config);
    const result = await provider.requestPayment({
      amountToman: 149000,
      description: 'test',
      callbackUrl: 'https://example.com/callback',
    });

    expect(result.success).toBe(true);
    expect(result.authority).toBe('AUTH123');
    expect(result.paymentUrl).toContain('AUTH123');

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse(requestInit.body as string);
    expect(body.amount).toBe(1490000); // 149000 toman * 10 rial/toman
    expect(body.merchant_id).toBe('test-merchant');
  });

  it('surfaces a failure when Zarinpal rejects the request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: null, errors: ['bad merchant'] }), { status: 200 }))
    );

    const provider = new ZarinpalProvider(config);
    const result = await provider.requestPayment({
      amountToman: 1000,
      description: 'test',
      callbackUrl: 'https://example.com/callback',
    });

    expect(result.success).toBe(false);
  });

  it('verifies a successful payment', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { code: 100, ref_id: 555 } }), { status: 200 }))
    );

    const provider = new ZarinpalProvider(config);
    const result = await provider.verifyPayment({ amountToman: 149000, authority: 'AUTH123' });

    expect(result.success).toBe(true);
    expect(result.refId).toBe('555');
  });

  it('treats code 101 (already verified) as an idempotent success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { code: 101, ref_id: 555 } }), { status: 200 }))
    );

    const provider = new ZarinpalProvider(config);
    const result = await provider.verifyPayment({ amountToman: 149000, authority: 'AUTH123' });

    expect(result.success).toBe(true);
    expect(result.alreadyVerified).toBe(true);
  });

  it('fails verification when Zarinpal returns an error code', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { code: 102, message: 'invalid authority' } }), { status: 200 }))
    );

    const provider = new ZarinpalProvider(config);
    const result = await provider.verifyPayment({ amountToman: 149000, authority: 'BAD' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('invalid authority');
  });
});
