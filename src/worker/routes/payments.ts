import { Hono } from 'hono';
import { AppEnv } from '../middleware/auth.js';
import { confirmSubscriptionCheckout } from '../services/subscriptionPayments.js';

export const paymentsRouter = new Hono<AppEnv>();

/** Zarinpal redirects the user's browser here after checkout (see callback_url built in subscriptionPayments.ts). */
paymentsRouter.get('/zarinpal/callback', async (c) => {
  const shopId = c.req.query('shopId');
  const planId = c.req.query('planId');
  const authority = c.req.query('Authority');
  const status = c.req.query('Status') ?? 'NOK';

  if (!shopId || !planId || !authority) {
    return c.redirect(`${c.env.APP_URL}/app/#/subscription?paid=0`);
  }

  try {
    const result = await confirmSubscriptionCheckout(c.env, shopId, planId, authority, status);
    return c.redirect(`${c.env.APP_URL}/app/#/subscription?paid=${result.success ? 1 : 0}`);
  } catch (error) {
    console.error('zarinpal callback failed', error);
    return c.redirect(`${c.env.APP_URL}/app/#/subscription?paid=0`);
  }
});
