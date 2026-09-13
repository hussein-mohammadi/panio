import { Hono } from 'hono';
import { AppEnv, requireShopMember } from '../middleware/auth.js';
import { CustomerRepository } from '../../infrastructure/db/repositories/CustomerRepository.js';
import { readJsonBody } from '../jsonBody.js';

export const customersRouter = new Hono<AppEnv>();
customersRouter.use('*', requireShopMember);

customersRouter.get('/', async (c) => {
  const customers = new CustomerRepository(c.env.DB);
  const search = c.req.query('search') ?? undefined;
  return c.json(await customers.list(c.req.param('shopId')!, search));
});

customersRouter.post('/', async (c) => {
  const shopId = c.req.param('shopId')!;
  const body = await readJsonBody<{ name?: string; mobile?: string; note?: string }>(c.req);
  if (!body.name) return c.json({ error: 'نام مشتری الزامی است.' }, 400);

  const customers = new CustomerRepository(c.env.DB);
  const customer = await customers.create({ shopId, name: body.name, mobile: body.mobile, note: body.note });
  return c.json(customer, 201);
});

customersRouter.get('/:customerId', async (c) => {
  const customers = new CustomerRepository(c.env.DB);
  const customer = await customers.findById(c.req.param('shopId')!, c.req.param('customerId'));
  if (!customer) return c.json({ error: 'مشتری یافت نشد.' }, 404);
  return c.json(customer);
});
