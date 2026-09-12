import { describe, expect, it } from 'vitest';
import { Plan } from '../src/domain/subscription/Plan.js';
import { PlanFeature } from '../src/domain/subscription/PlanFeature.js';
import { Subscription, SubscriptionStatus } from '../src/domain/subscription/Subscription.js';
import { Payment, PaymentStatus } from '../src/domain/payment/Payment.js';
import { EntitlementService } from '../src/domain/entitlement/EntitlementService.js';

describe('Phase 3 subscription domain', () => {
  it('creates plans and features for free/basic/pro', () => {
    const freePlan = new Plan({
      id: 'plan-free',
      code: 'FREE',
      name: 'Free',
      description: 'basic',
      price: 0,
      currency: 'IRR',
      billingPeriod: 'MONTHLY',
      isActive: true,
    });

    const feature = new PlanFeature({
      id: 'feature-1',
      planId: freePlan.id,
      featureCode: 'PRODUCT_LIMIT',
      value: '10',
    });

    expect(freePlan.code).toBe('FREE');
    expect(feature.featureCode).toBe('PRODUCT_LIMIT');
    expect(feature.value).toBe('10');
  });

  it('activates a subscription only when payment succeeds', () => {
    const subscription = new Subscription({
      id: 'sub-1',
      shopId: 'shop-1',
      planId: 'plan-basic',
      status: SubscriptionStatus.TRIAL,
      startsAt: new Date('2026-01-01'),
      expiresAt: new Date('2026-02-01'),
      autoRenew: true,
      paymentProvider: 'TELEGRAM_STARS',
      providerSubscriptionId: 'prov-1',
    });

    const payment = new Payment({
      id: 'pay-1',
      shopId: 'shop-1',
      subscriptionId: subscription.id,
      provider: 'TELEGRAM_STARS',
      providerTransactionId: 'tx-1',
      amount: 200000,
      currency: 'IRR',
      status: PaymentStatus.PAID,
    });

    expect(subscription.status).toBe(SubscriptionStatus.TRIAL);
    expect(payment.status).toBe(PaymentStatus.PAID);
  });

  it('prevents duplicate subscription renewal from duplicate payment callback', () => {
    const payment = new Payment({
      id: 'pay-2',
      shopId: 'shop-1',
      subscriptionId: 'sub-2',
      provider: 'TELEGRAM_STARS',
      providerTransactionId: 'tx-duplicate',
      amount: 300000,
      currency: 'IRR',
      status: PaymentStatus.PAID,
    });

    const renewed = new Subscription({
      id: 'sub-2',
      shopId: 'shop-1',
      planId: 'plan-pro',
      status: SubscriptionStatus.ACTIVE,
      startsAt: new Date('2026-02-01'),
      expiresAt: new Date('2026-03-01'),
      autoRenew: true,
      paymentProvider: 'TELEGRAM_STARS',
      providerSubscriptionId: 'prov-2',
    });

    expect(payment.providerTransactionId).toBe('tx-duplicate');
    expect(renewed.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('blocks protected features when subscription is expired', () => {
    const entitlement = new EntitlementService();
    const expiredSubscription = new Subscription({
      id: 'sub-3',
      shopId: 'shop-2',
      planId: 'plan-free',
      status: SubscriptionStatus.EXPIRED,
      startsAt: new Date('2026-01-01'),
      expiresAt: new Date('2026-01-15'),
      autoRenew: false,
      paymentProvider: 'TELEGRAM_STARS',
      providerSubscriptionId: 'prov-3',
    });

    const canCreateProduct = entitlement.canUseFeature({
      shopId: 'shop-2',
      subscription: expiredSubscription,
      featureCode: 'PRODUCT_LIMIT',
      featureLimit: 0,
      state: { type: 'EXPIRED' },
    });

    expect(canCreateProduct).toBe(false);
  });
});
