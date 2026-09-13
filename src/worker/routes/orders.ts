import { Hono } from 'hono';
import { AppEnv, requireShopMember } from '../middleware/auth.js';
import { OrderRepository, InsufficientStockError } from '../../infrastructure/db/repositories/OrderRepository.js';
import { ProductRepository } from '../../infrastructure/db/repositories/ProductRepository.js';
import { CustomerRepository } from '../../infrastructure/db/repositories/CustomerRepository.js';
import { ShopRepository } from '../../infrastructure/db/repositories/ShopRepository.js';
import { OrderStatus } from '../../domain/order/Order.js';
import { notifyNewOrder, notifyLowStock } from '../services/notifications.js';
import { readJsonBody } from '../jsonBody.js';

export const ordersRouter = new Hono<AppEnv>();
ordersRouter.use('*', requireShopMember);

function repos(db: D1Database) {
  const products = new ProductRepository(db);
  return { orders: new OrderRepository(db, products), products, customers: new CustomerRepository(db), shops: new ShopRepository(db) };
}

ordersRouter.get('/', async (c) => {
  const { orders } = repos(c.env.DB);
  const status = c.req.query('status') as OrderStatus | undefined;
  return c.json(await orders.list(c.req.param('shopId')!, { status }));
});

ordersRouter.get('/:orderId', async (c) => {
  const { orders } = repos(c.env.DB);
  const found = await orders.findById(c.req.param('shopId')!, c.req.param('orderId'));
  if (!found) return c.json({ error: 'سفارش یافت نشد.' }, 404);
  return c.json(found);
});

ordersRouter.patch('/:orderId/status', async (c) => {
  const { orders } = repos(c.env.DB);
  const body = await readJsonBody<{ status?: OrderStatus }>(c.req);
  if (!body.status) return c.json({ error: 'وضعیت جدید الزامی است.' }, 400);
  await orders.updateStatus(c.req.param('shopId')!, c.req.param('orderId'), body.status);
  return c.json({ ok: true });
});

ordersRouter.post('/', async (c) => {
  const shopId = c.req.param('shopId')!;
  const body = await readJsonBody<{
    customerId?: string;
    items?: { productId: string; quantity: number }[];
    note?: string;
    discountAmount?: number;
    source?: 'MANUAL' | 'TELEGRAM' | 'INSTAGRAM' | 'OTHER';
  }>(c.req);

  if (!body.customerId || !body.items?.length) {
    return c.json({ error: 'مشتری و حداقل یک کالا الزامی است.' }, 400);
  }

  const { orders, products, shops } = repos(c.env.DB);
  try {
    const order = await orders.createOrder({
      shopId,
      customerId: body.customerId,
      items: body.items,
      note: body.note,
      discountAmount: body.discountAmount,
      source: body.source,
    });

    const shop = await shops.findById(shopId);
    if (shop) {
      await notifyNewOrder(c.env, shop.ownerTelegramUserId, order);
      for (const item of body.items) {
        const product = await products.findById(shopId, item.productId);
        if (product && product.stock <= product.lowStockThreshold) {
          await notifyLowStock(c.env, shop.ownerTelegramUserId, product);
        }
      }
    }

    return c.json(order, 201);
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return c.json({ error: error.message }, 409);
    }
    return c.json({ error: error instanceof Error ? error.message : 'ثبت سفارش ناموفق بود.' }, 400);
  }
});

/** Quick sale: one product + a customer (created on the fly by name/mobile if new), in one call. */
ordersRouter.post('/quick-sale', async (c) => {
  const shopId = c.req.param('shopId')!;
  const body = await readJsonBody<{
    productId?: string;
    quantity?: number;
    customerName?: string;
    customerMobile?: string;
    customerId?: string;
  }>(c.req);

  if (!body.productId || !body.quantity) {
    return c.json({ error: 'کالا و تعداد الزامی است.' }, 400);
  }

  const { orders, products, customers, shops } = repos(c.env.DB);

  let customerId = body.customerId;
  if (!customerId) {
    const customer = await customers.create({
      shopId,
      name: body.customerName?.trim() || 'مشتری حضوری',
      mobile: body.customerMobile,
    });
    customerId = customer.id;
  }

  try {
    const order = await orders.createOrder({
      shopId,
      customerId,
      items: [{ productId: body.productId, quantity: body.quantity }],
      source: 'MANUAL',
    });

    const shop = await shops.findById(shopId);
    if (shop) {
      await notifyNewOrder(c.env, shop.ownerTelegramUserId, order);
      const product = await products.findById(shopId, body.productId);
      if (product && product.stock <= product.lowStockThreshold) {
        await notifyLowStock(c.env, shop.ownerTelegramUserId, product);
      }
    }

    return c.json(order, 201);
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return c.json({ error: error.message }, 409);
    }
    return c.json({ error: error instanceof Error ? error.message : 'ثبت فروش ناموفق بود.' }, 400);
  }
});
