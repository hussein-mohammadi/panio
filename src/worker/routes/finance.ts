import { Hono } from 'hono';
import { AppEnv, requireShopMember } from '../middleware/auth.js';
import { FinanceRepository } from '../../infrastructure/db/repositories/FinanceRepository.js';
import { FinancialCategory, FinancialTransactionType } from '../../domain/finance/FinancialTransaction.js';
import { readJsonBody } from '../jsonBody.js';

export const financeRouter = new Hono<AppEnv>();
financeRouter.use('*', requireShopMember);

financeRouter.get('/transactions', async (c) => {
  const finance = new FinanceRepository(c.env.DB);
  const type = c.req.query('type') as FinancialTransactionType | undefined;
  return c.json(await finance.list(c.req.param('shopId')!, { type }));
});

financeRouter.post('/expenses', async (c) => {
  const shopId = c.req.param('shopId')!;
  const body = await readJsonBody<{ category?: FinancialCategory; amount?: number; note?: string }>(c.req);
  if (!body.category || !body.amount) {
    return c.json({ error: 'دسته‌بندی و مبلغ الزامی است.' }, 400);
  }

  const finance = new FinanceRepository(c.env.DB);
  const tx = await finance.recordExpense({ shopId, category: body.category, amount: body.amount, note: body.note });
  return c.json(tx, 201);
});

financeRouter.get('/reports', async (c) => {
  const finance = new FinanceRepository(c.env.DB);
  const shopId = c.req.param('shopId')!;
  const [today, week, month] = await Promise.all([
    finance.summaryToday(shopId),
    finance.summaryThisWeek(shopId),
    finance.summaryThisMonth(shopId),
  ]);
  return c.json({ today, week, month });
});
