import { Hono } from 'hono';
import { AppEnv } from '../middleware/auth.js';
import { PlanRepository } from '../../infrastructure/db/repositories/PlanRepository.js';

export const plansRouter = new Hono<AppEnv>();

plansRouter.get('/', async (c) => {
  const plans = new PlanRepository(c.env.DB);
  const list = await plans.listActive();
  return c.json(
    list.map(({ plan, features }) => ({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billingPeriod: plan.billingPeriod,
      features: Object.fromEntries(features.map((f) => [f.featureCode, f.value])),
    }))
  );
});
