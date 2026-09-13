import { Product } from '../../../domain/product/Product.js';
import { newId, nowIso } from '../ids.js';

interface ProductRow {
  id: string;
  shop_id: string;
  name: string;
  sku: string;
  purchase_price: number;
  selling_price: number;
  stock: number;
  low_stock_threshold: number;
  category_id: string | null;
  image: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function toProduct(row: ProductRow): Product {
  return new Product({
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    sku: row.sku,
    purchasePrice: row.purchase_price,
    sellingPrice: row.selling_price,
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold,
    categoryId: row.category_id ?? undefined,
    image: row.image ?? undefined,
    isActive: row.is_active === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export interface CreateProductInput {
  shopId: string;
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold?: number;
  categoryId?: string;
  image?: string;
}

export class ProductRepository {
  constructor(private readonly db: D1Database) {}

  async create(input: CreateProductInput): Promise<Product> {
    const product = new Product({ id: newId('product'), ...input });
    await this.db
      .prepare(
        `INSERT INTO products
           (id, shop_id, name, sku, purchase_price, selling_price, stock, low_stock_threshold, category_id, image, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
      )
      .bind(
        product.id,
        product.shopId,
        product.name,
        product.sku,
        product.purchasePrice,
        product.sellingPrice,
        product.stock,
        product.lowStockThreshold,
        product.categoryId ?? null,
        product.image ?? null,
        product.createdAt.toISOString(),
        product.updatedAt.toISOString()
      )
      .run();
    return product;
  }

  async findById(shopId: string, productId: string): Promise<Product | null> {
    const row = await this.db
      .prepare(`SELECT * FROM products WHERE shop_id = ? AND id = ?`)
      .bind(shopId, productId)
      .first<ProductRow>();
    return row ? toProduct(row) : null;
  }

  async list(shopId: string, opts: { search?: string; onlyActive?: boolean } = {}): Promise<Product[]> {
    let sql = `SELECT * FROM products WHERE shop_id = ?`;
    const params: unknown[] = [shopId];

    if (opts.onlyActive) {
      sql += ` AND is_active = 1`;
    }
    if (opts.search) {
      sql += ` AND name LIKE ?`;
      params.push(`%${opts.search}%`);
    }
    sql += ` ORDER BY created_at DESC`;

    const { results } = await this.db.prepare(sql).bind(...params).all<ProductRow>();
    return results.map(toProduct);
  }

  async countActive(shopId: string): Promise<number> {
    const row = await this.db
      .prepare(`SELECT COUNT(*) as count FROM products WHERE shop_id = ? AND is_active = 1`)
      .bind(shopId)
      .first<{ count: number }>();
    return row?.count ?? 0;
  }

  async lowStock(shopId: string): Promise<Product[]> {
    const { results } = await this.db
      .prepare(
        `SELECT * FROM products WHERE shop_id = ? AND is_active = 1 AND stock <= low_stock_threshold ORDER BY stock ASC`
      )
      .bind(shopId)
      .all<ProductRow>();
    return results.map(toProduct);
  }

  /** Persists a stock change already applied to the in-memory Product (see Product.reduceStock/restoreStock). */
  async updateStock(shopId: string, productId: string, newStock: number): Promise<void> {
    await this.db
      .prepare(`UPDATE products SET stock = ?, updated_at = ? WHERE shop_id = ? AND id = ?`)
      .bind(newStock, nowIso(), shopId, productId)
      .run();
  }

  async softDelete(shopId: string, productId: string): Promise<void> {
    await this.db
      .prepare(`UPDATE products SET is_active = 0, updated_at = ? WHERE shop_id = ? AND id = ?`)
      .bind(nowIso(), shopId, productId)
      .run();
  }
}
