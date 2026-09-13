import { Hono } from 'hono';
import { AppEnv, requireShopMember } from '../middleware/auth.js';
import { ProductRepository } from '../../infrastructure/db/repositories/ProductRepository.js';
import { readJsonBody } from '../jsonBody.js';

export const productsRouter = new Hono<AppEnv>();
productsRouter.use('*', requireShopMember);

productsRouter.get('/', async (c) => {
  const products = new ProductRepository(c.env.DB);
  const search = c.req.query('search') ?? undefined;
  const list = await products.list(c.req.param('shopId')!, { search, onlyActive: true });
  return c.json(list);
});

productsRouter.post('/', async (c) => {
  const shopId = c.req.param('shopId')!;
  const body = await readJsonBody<{
    name?: string;
    sku?: string;
    purchasePrice?: number;
    sellingPrice?: number;
    stock?: number;
    lowStockThreshold?: number;
    categoryId?: string;
    image?: string;
  }>(c.req);

  if (!body.name || !body.sku || body.sellingPrice === undefined) {
    return c.json({ error: 'نام، کد کالا و قیمت فروش الزامی است.' }, 400);
  }

  const products = new ProductRepository(c.env.DB);
  const product = await products.create({
    shopId,
    name: body.name,
    sku: body.sku,
    purchasePrice: body.purchasePrice ?? 0,
    sellingPrice: body.sellingPrice,
    stock: body.stock ?? 0,
    lowStockThreshold: body.lowStockThreshold ?? 0,
    categoryId: body.categoryId,
    image: body.image,
  });
  return c.json(product, 201);
});

productsRouter.get('/low-stock', async (c) => {
  const products = new ProductRepository(c.env.DB);
  return c.json(await products.lowStock(c.req.param('shopId')!));
});

productsRouter.get('/:productId', async (c) => {
  const products = new ProductRepository(c.env.DB);
  const product = await products.findById(c.req.param('shopId')!, c.req.param('productId'));
  if (!product) return c.json({ error: 'کالا یافت نشد.' }, 404);
  return c.json(product);
});

productsRouter.delete('/:productId', async (c) => {
  const products = new ProductRepository(c.env.DB);
  await products.softDelete(c.req.param('shopId')!, c.req.param('productId'));
  return c.json({ ok: true });
});
