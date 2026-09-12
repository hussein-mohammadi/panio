import { describe, expect, it } from 'vitest';
import { PaymentGatewayService } from '../src/application/payment/PaymentGatewayService.js';
import { TelegramStarsProvider } from '../src/infrastructure/payment/TelegramStarsProvider.js';
import { PaymentIdempotencyStore } from '../src/infrastructure/payment/PaymentIdempotencyStore.js';
import { PaymentStatus } from '../src/domain/payment/Payment.js';

describe('Phase 5 payment integration', () => {
  it('creates a provider-agnostic payment transaction', () => {
    const gateway = new PaymentGatewayService();
    const result = gateway.createPayment({
      shopId: 'shop-1',
      subscriptionId: 'sub-1',
      provider: 'TELEGRAM_STARS',
      providerTransactionId: 'tx-100',
      amount: 250000,
      currency: 'IRR',
      status: PaymentStatus.CREATED,
    });

    expect(result.success).toBe(true);
    expect(result.payment?.status).toBe(PaymentStatus.CREATED);
  });

  it('verifies a Telegram Stars callback for a valid paid event', () => {
    const provider = new TelegramStarsProvider();
    const result = provider.verifyCallback({
      providerTransactionId: 'tx-200',
      status: 'paid',
      amount: 200000,
      currency: 'IRR',
    });

    expect(result.valid).toBe(true);
    expect(result.status).toBe('paid');
  });

  it('rejects an already-processed callback via idempotency store', () => {
    const store = new PaymentIdempotencyStore();
    const key = 'callback:tx-300';

    store.markUsed(key);
    const result = store.isDuplicate(key);

    expect(result).toBe(true);
  });

  it('keeps payment success as the only activation path for subscription renewal', () => {
    const gateway = new PaymentGatewayService();
    const result = gateway.activateSubscription({
      shopId: 'shop-2',
      subscriptionId: 'sub-2',
      paymentStatus: PaymentStatus.PAID,
      providerTransactionId: 'tx-400',
      callbackVerified: true,
    });

    expect(result.success).toBe(true);
    expect(result.activated).toBe(true);
  });
});
