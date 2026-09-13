import { Subscription, SubscriptionStatus } from '../../../domain/subscription/Subscription.js';
import { newId, nowIso } from '../ids.js';

interface SubscriptionRow {
  id: string;
  shop_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string;
  auto_renew: number;
  payment_provider: string | null;
  provider_subscription_id: string | null;
  cancelled_at: string | null;
  grace_period_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

function toSubscription(row: SubscriptionRow): Subscription {
  return new Subscription({
    id: row.id,
    shopId: row.shop_id,
    planId: row.plan_id,
    status: row.status,
    startsAt: new Date(row.starts_at),
    expiresAt: new Date(row.expires_at),
    autoRenew: row.auto_renew === 1,
    paymentProvider: row.payment_provider ?? undefined,
    providerSubscriptionId: row.provider_subscription_id ?? undefined,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at) : undefined,
    gracePeriodEndsAt: row.grace_period_ends_at ? new Date(row.grace_period_ends_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

const TRIAL_DAYS = 14;
const GRACE_DAYS = 3;

export class SubscriptionRepository {
  constructor(private readonly db: D1Database) {}

  async createTrial(shopId: string, planId: string): Promise<Subscription> {
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const subscription = new Subscription({
      id: newId('sub'),
      shopId,
      planId,
      status: SubscriptionStatus.TRIAL,
      startsAt,
      expiresAt,
      autoRenew: false,
    });
    await this.insert(subscription);
    return subscription;
  }

  private async insert(subscription: Subscription): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO subscriptions
           (id, shop_id, plan_id, status, starts_at, expires_at, auto_renew, payment_provider, provider_subscription_id, cancelled_at, grace_period_ends_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        subscription.id,
        subscription.shopId,
        subscription.planId,
        subscription.status,
        subscription.startsAt.toISOString(),
        subscription.expiresAt.toISOString(),
        subscription.autoRenew ? 1 : 0,
        subscription.paymentProvider ?? null,
        subscription.providerSubscriptionId ?? null,
        subscription.cancelledAt?.toISOString() ?? null,
        subscription.gracePeriodEndsAt?.toISOString() ?? null,
        subscription.createdAt.toISOString(),
        subscription.updatedAt.toISOString()
      )
      .run();
  }

  /** Most recent subscription for a shop (there is always exactly one "current" row). */
  async getCurrent(shopId: string): Promise<Subscription | null> {
    const row = await this.db
      .prepare(`SELECT * FROM subscriptions WHERE shop_id = ? ORDER BY created_at DESC LIMIT 1`)
      .bind(shopId)
      .first<SubscriptionRow>();
    return row ? toSubscription(row) : null;
  }

  async findById(subscriptionId: string): Promise<Subscription | null> {
    const row = await this.db
      .prepare(`SELECT * FROM subscriptions WHERE id = ?`)
      .bind(subscriptionId)
      .first<SubscriptionRow>();
    return row ? toSubscription(row) : null;
  }

  /**
   * Renews/upgrades a subscription after a verified paid payment (PaymentGatewayService
   * guards the "verified paid payment only" rule — this method just persists the result).
   * Extends from `now` (or from the current expiry if it hasn't lapsed yet) by one billing month.
   */
  async activate(shopId: string, planId: string, provider: string): Promise<Subscription> {
    const current = await this.getCurrent(shopId);
    const base = current && current.expiresAt > new Date() ? current.expiresAt : new Date();
    const expiresAt = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (current) {
      await this.db
        .prepare(
          `UPDATE subscriptions
           SET plan_id = ?, status = ?, expires_at = ?, auto_renew = 1, payment_provider = ?, grace_period_ends_at = NULL, updated_at = ?
           WHERE id = ?`
        )
        .bind(planId, SubscriptionStatus.ACTIVE, expiresAt.toISOString(), provider, nowIso(), current.id)
        .run();
      return (await this.findById(current.id))!;
    }

    const subscription = new Subscription({
      id: newId('sub'),
      shopId,
      planId,
      status: SubscriptionStatus.ACTIVE,
      startsAt: new Date(),
      expiresAt,
      autoRenew: true,
      paymentProvider: provider,
    });
    await this.insert(subscription);
    return subscription;
  }

  /** Daily sweep (see src/worker/scheduled.ts): trial/active -> grace -> expired. */
  async sweepExpirations(): Promise<{ movedToGrace: number; expired: number }> {
    const now = nowIso();

    const graceResult = await this.db
      .prepare(
        `UPDATE subscriptions
         SET status = ?, grace_period_ends_at = datetime(expires_at, '+${GRACE_DAYS} days'), updated_at = ?
         WHERE status IN (?, ?) AND expires_at < ?`
      )
      .bind(SubscriptionStatus.GRACE_PERIOD, now, SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE, now)
      .run();

    const expiredResult = await this.db
      .prepare(
        `UPDATE subscriptions
         SET status = ?, updated_at = ?
         WHERE status = ? AND grace_period_ends_at IS NOT NULL AND grace_period_ends_at < ?`
      )
      .bind(SubscriptionStatus.EXPIRED, now, SubscriptionStatus.GRACE_PERIOD, now)
      .run();

    return {
      movedToGrace: graceResult.meta.changes ?? 0,
      expired: expiredResult.meta.changes ?? 0,
    };
  }

  /** Subscriptions expiring within `withinDays`, for a bot reminder pass. */
  async expiringSoon(withinDays: number): Promise<Subscription[]> {
    const { results } = await this.db
      .prepare(
        `SELECT * FROM subscriptions
         WHERE status IN (?, ?)
           AND expires_at BETWEEN datetime('now') AND datetime('now', '+${withinDays} days')`
      )
      .bind(SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE)
      .all<SubscriptionRow>();
    return results.map(toSubscription);
  }
}
