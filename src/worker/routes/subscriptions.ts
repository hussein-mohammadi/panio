import { Hono } from 'hono';
import { AppEnv, requireShopMember, requireOwner } from '../middleware/auth.js';
import { SubscriptionRepository } from '../../infrastructure/db/repositories/SubscriptionRepository.js';
import { PlanRepository } from '../../infrastructure/db/repositories/PlanRepository.js';
import { createSubscriptionCheckout } from '../services/subscriptionPayments.js';
import { readJsonBody } from '../jsonBody.js';

export const subscriptionsRouter = new Hono<AppEnv>();
subscriptionsRouter.use('*', requireShopMember);

subscriptionsRouter.get('/', async (c) => {
  const shopId = c.req.param('shopId')!;
  const subscriptions = new SubscriptionRepository(c.env.DB);
  const plans = new PlanRepository(c.env.DB);

  const subscription = await subscriptions.getCurrent(shopId);
  if (!subscription) return c.json({ subscription: null });

  const plan = await plans.findById(subscription.planId);
  const daysLeft = Math.max(0, Math.ceil((subscription.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

  return c.json({
    status: subscription.status,
    plan: plan && { id: plan.id, name: plan.name, price: plan.price },
    startsAt: subscription.startsAt,
    expiresAt: subscription.expiresAt,
    daysLeft,
    autoRenew: subscription.autoRenew,
  });
});

subscriptionsRouter.post('/checkout', requireOwner, async (c) => {
  const shopId = c.req.param('shopId')!;
  const body = await readJsonBody<{ planId?: string }>(c.req);
  if (!body.planId) return c.json({ error: 'پلن انتخاب‌شده الزامی است.' }, 400);

  const result = await createSubscriptionCheckout(c.env, shopId, body.planId);
  if (!result.success) {
    return c.json({ error: result.error ?? 'ایجاد پرداخت ناموفق بود.' }, 400);
  }
  return c.json({ paymentUrl: result.paymentUrl });
});
