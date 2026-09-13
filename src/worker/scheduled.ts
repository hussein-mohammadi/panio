import { Env } from './env.js';
import { SubscriptionRepository } from '../infrastructure/db/repositories/SubscriptionRepository.js';
import { ShopRepository } from '../infrastructure/db/repositories/ShopRepository.js';
import { notifySubscriptionExpiringSoon } from './services/notifications.js';

const REMINDER_DAYS_BEFORE_EXPIRY = 3;

/** Daily cron (see wrangler.jsonc `triggers.crons`): expire lapsed subscriptions and remind shops about to expire. */
export async function runDailySubscriptionSweep(env: Env): Promise<void> {
  const subscriptions = new SubscriptionRepository(env.DB);
  const shops = new ShopRepository(env.DB);

  await subscriptions.sweepExpirations();

  const expiringSoon = await subscriptions.expiringSoon(REMINDER_DAYS_BEFORE_EXPIRY);
  for (const subscription of expiringSoon) {
    const shop = await shops.findById(subscription.shopId);
    if (shop) {
      await notifySubscriptionExpiringSoon(env, shop.ownerTelegramUserId, shop.name, subscription);
    }
  }
}
