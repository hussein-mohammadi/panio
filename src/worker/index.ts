import { Hono } from 'hono';
import { webhookCallback } from 'grammy';
import { Env } from './env.js';
import { AppEnv } from './middleware/auth.js';
import { createBot } from './bot.js';
import { shopsRouter } from './routes/shops.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { customersRouter } from './routes/customers.js';
import { financeRouter } from './routes/finance.js';
import { dashboardRouter } from './routes/dashboard.js';
import { plansRouter } from './routes/plans.js';
import { subscriptionsRouter } from './routes/subscriptions.js';
import { paymentsRouter } from './routes/payments.js';
import { runDailySubscriptionSweep } from './scheduled.js';

const app = new Hono<AppEnv>();

// Safety net: an unhandled exception (e.g. Zarinpal/Telegram fetch failing) becomes a clean
// Persian JSON error instead of leaking a raw stack trace / crashing the response.
app.onError((err, c) => {
  console.error('unhandled route error', err);
  return c.json({ error: 'خطایی در سرور رخ داد. لطفاً دوباره تلاش کنید.' }, 500);
});

app.get('/health', (c) => c.json({ ok: true, service: 'telegram-shop-saas' }));

app.route('/api/shops', shopsRouter);
app.route('/api/shops/:shopId/products', productsRouter);
app.route('/api/shops/:shopId/orders', ordersRouter);
app.route('/api/shops/:shopId/customers', customersRouter);
app.route('/api/shops/:shopId/finance', financeRouter);
app.route('/api/shops/:shopId/dashboard', dashboardRouter);
app.route('/api/shops/:shopId/subscription', subscriptionsRouter);
app.route('/api/plans', plansRouter);
app.route('/api/payments', paymentsRouter);

app.post('/webhook/telegram', async (c) => {
  const secret = c.req.header('X-Telegram-Bot-Api-Secret-Token');
  if (secret !== c.env.TELEGRAM_WEBHOOK_SECRET) {
    return c.json({ error: 'invalid secret token' }, 401);
  }
  const handler = webhookCallback(createBot(c.env), 'hono');
  return handler(c);
});

export default {
  fetch: app.fetch,
  scheduled: async (_event, env, ctx) => {
    ctx.waitUntil(runDailySubscriptionSweep(env));
  },
} satisfies ExportedHandler<Env>;
