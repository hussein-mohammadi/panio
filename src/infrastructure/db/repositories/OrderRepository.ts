import { Order, OrderItem, OrderSource, OrderStatus } from '../../../domain/order/Order.js';
import { InventoryTransaction } from '../../../domain/inventory/InventoryTransaction.js';
import { FinancialTransaction, FinancialTransactionType } from '../../../domain/finance/FinancialTransaction.js';
import { Product } from '../../../domain/product/Product.js';
import { ProductRepository } from './ProductRepository.js';
import { newId, nowIso } from '../ids.js';

interface OrderRow {
  id: string;
  shop_id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  note: string | null;
  source: OrderSource;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  total: number;
}

function toOrder(row: OrderRow): Order {
  return new Order({
    id: row.id,
    shopId: row.shop_id,
    customerId: row.customer_id,
    status: row.status,
    totalAmount: row.total_amount,
    discountAmount: row.discount_amount,
    finalAmount: row.final_amount,
    note: row.note ?? undefined,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

function toOrderItem(row: OrderItemRow): OrderItem {
  return new OrderItem({
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productNameSnapshot: row.product_name_snapshot,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    total: row.total,
  });
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  shopId: string;
  customerId: string;
  items: CreateOrderItemInput[];
  source?: OrderSource;
  note?: string;
  discountAmount?: number;
}

export class InsufficientStockError extends Error {}

export class OrderRepository {
  constructor(
    private readonly db: D1Database,
    private readonly products: ProductRepository
  ) {}

  /**
   * Loads each product, applies stock/order domain rules in memory (Product.reduceStock,
   * Order.addItem — same rules the quick-sale flow uses), then persists the order, its
   * items, the inventory ledger entries, the income transaction, and the new stock levels
   * in one D1 batch so a partial write can't happen.
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    if (input.items.length === 0) {
      throw new Error('سفارش باید حداقل یک کالا داشته باشد.');
    }

    const order = new Order({
      id: newId('order'),
      shopId: input.shopId,
      customerId: input.customerId,
      source: input.source ?? 'MANUAL',
      note: input.note,
      discountAmount: input.discountAmount ?? 0,
    });

    const statements: D1PreparedStatement[] = [];
    const touchedProducts: Product[] = [];

    for (const item of input.items) {
      const product = await this.products.findById(input.shopId, item.productId);
      if (!product) {
        throw new Error('کالای انتخاب‌شده پیدا نشد.');
      }

      try {
        product.reduceStock(item.quantity);
      } catch (error) {
        throw new InsufficientStockError(error instanceof Error ? error.message : 'موجودی کافی نیست.');
      }
      touchedProducts.push(product);

      const orderItem = new OrderItem({
        id: newId('order-item'),
        orderId: order.id,
        productId: product.id,
        productNameSnapshot: product.name,
        unitPrice: product.sellingPrice,
        quantity: item.quantity,
        total: product.sellingPrice * item.quantity,
      });
      order.addItem(orderItem);

      statements.push(
        this.db
          .prepare(
            `INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, unit_price, quantity, total)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(orderItem.id, orderItem.orderId, orderItem.productId, orderItem.productNameSnapshot, orderItem.unitPrice, orderItem.quantity, orderItem.total)
      );

      const inventoryTx = new InventoryTransaction({
        id: newId('inv'),
        shopId: input.shopId,
        productId: product.id,
        type: 'SALE',
        quantity: item.quantity,
        referenceType: 'ORDER',
        referenceId: order.id,
      });
      statements.push(
        this.db
          .prepare(
            `INSERT INTO inventory_transactions (id, shop_id, product_id, type, quantity, reference_type, reference_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(inventoryTx.id, inventoryTx.shopId, inventoryTx.productId, inventoryTx.type, inventoryTx.quantity, inventoryTx.referenceType, inventoryTx.referenceId, inventoryTx.createdAt.toISOString())
      );

      statements.push(
        this.db
          .prepare(`UPDATE products SET stock = ?, updated_at = ? WHERE shop_id = ? AND id = ?`)
          .bind(product.stock, nowIso(), input.shopId, product.id)
      );
    }

    order.finalize();

    const income = new FinancialTransaction({
      id: newId('fin'),
      shopId: input.shopId,
      type: FinancialTransactionType.INCOME,
      category: 'SALES',
      amount: order.finalAmount,
      referenceType: 'ORDER',
      referenceId: order.id,
    });

    statements.unshift(
      this.db
        .prepare(
          `INSERT INTO orders (id, shop_id, customer_id, status, total_amount, discount_amount, final_amount, note, source, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(order.id, order.shopId, order.customerId, order.status, order.totalAmount, order.discountAmount, order.finalAmount, order.note ?? null, order.source, order.createdAt.toISOString(), order.updatedAt.toISOString())
    );
    statements.push(
      this.db
        .prepare(
          `INSERT INTO financial_transactions (id, shop_id, type, category, amount, reference_type, reference_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(income.id, income.shopId, income.type, income.category, income.amount, income.referenceType, income.referenceId, income.createdAt.toISOString())
    );

    await this.db.batch(statements);

    return order;
  }

  async findById(shopId: string, orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
    const row = await this.db
      .prepare(`SELECT * FROM orders WHERE shop_id = ? AND id = ?`)
      .bind(shopId, orderId)
      .first<OrderRow>();
    if (!row) return null;

    const { results } = await this.db
      .prepare(`SELECT * FROM order_items WHERE order_id = ?`)
      .bind(orderId)
      .all<OrderItemRow>();

    return { order: toOrder(row), items: results.map(toOrderItem) };
  }

  async list(shopId: string, opts: { status?: OrderStatus; limit?: number } = {}): Promise<Order[]> {
    let sql = `SELECT * FROM orders WHERE shop_id = ?`;
    const params: unknown[] = [shopId];
    if (opts.status) {
      sql += ` AND status = ?`;
      params.push(opts.status);
    }
    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(opts.limit ?? 50);

    const { results } = await this.db.prepare(sql).bind(...params).all<OrderRow>();
    return results.map(toOrder);
  }

  async updateStatus(shopId: string, orderId: string, status: OrderStatus): Promise<void> {
    await this.db
      .prepare(`UPDATE orders SET status = ?, updated_at = ? WHERE shop_id = ? AND id = ?`)
      .bind(status, nowIso(), shopId, orderId)
      .run();
  }

  async countToday(shopId: string): Promise<number> {
    const row = await this.db
      .prepare(`SELECT COUNT(*) as count FROM orders WHERE shop_id = ? AND date(created_at) = date('now')`)
      .bind(shopId)
      .first<{ count: number }>();
    return row?.count ?? 0;
  }
}
