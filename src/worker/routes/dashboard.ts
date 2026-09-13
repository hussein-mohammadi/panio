import { Hono } from 'hono';
import { AppEnv, requireShopMember } from '../middleware/auth.js';
import { OrderRepository } from '../../infrastructure/db/repositories/OrderRepository.js';
import { ProductRepository } from '../../infrastructure/db/repositories/ProductRepository.js';
import { FinanceRepository } from '../../infrastructure/db/repositories/FinanceRepository.js';
import { SubscriptionRepository } from '../../infrastructure/db/repositories/SubscriptionRepository.js';

export const dashboardRouter = new Hono<AppEnv>();
dashboardRouter.use('*', requireShopMember);

dashboardRouter.get('/', async (c) => {
  const shopId = c.req.param('shopId')!;
  const products = new ProductRepository(c.env.DB);
  const orders = new OrderRepository(c.env.DB, products);
  const finance = new FinanceRepository(c.env.DB);
  const subscriptions = new SubscriptionRepository(c.env.DB);

  const [todaySummary, ordersToday, lowStock, subscription] = await Promise.all([
    finance.summaryToday(shopId),
    orders.countToday(shopId),
    products.lowStock(shopId),
    subscriptions.getCurrent(shopId),
  ]);

  const subscriptionDaysLeft = subscription
    ? Math.max(0, Math.ceil((subscription.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  return c.json({
    salesToday: todaySummary.income,
    profitToday: todaySummary.profit,
    ordersToday,
    lowStockCount: lowStock.length,
    lowStockProducts: lowStock.slice(0, 5),
    subscription: subscription && {
      status: subscription.status,
      planId: subscription.planId,
      daysLeft: subscriptionDaysLeft,
    },
  });
});
