import { Customer } from '../../../domain/customer/Customer.js';
import { newId } from '../ids.js';

interface CustomerRow {
  id: string;
  shop_id: string;
  name: string;
  mobile: string | null;
  telegram_user_id: number | null;
  instagram_user_id: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

function toCustomer(row: CustomerRow): Customer {
  return new Customer({
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    mobile: row.mobile ?? undefined,
    telegramUserId: row.telegram_user_id ?? undefined,
    instagramUserId: row.instagram_user_id ?? undefined,
    note: row.note ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export interface CreateCustomerInput {
  shopId: string;
  name: string;
  mobile?: string;
  telegramUserId?: number;
  instagramUserId?: number;
  note?: string;
}

export class CustomerRepository {
  constructor(private readonly db: D1Database) {}

  async create(input: CreateCustomerInput): Promise<Customer> {
    const customer = new Customer({ id: newId('customer'), ...input });
    await this.db
      .prepare(
        `INSERT INTO customers (id, shop_id, name, mobile, telegram_user_id, instagram_user_id, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        customer.id,
        customer.shopId,
        customer.name,
        customer.mobile ?? null,
        customer.telegramUserId ?? null,
        customer.instagramUserId ?? null,
        customer.note ?? null,
        customer.createdAt.toISOString(),
        customer.updatedAt.toISOString()
      )
      .run();
    return customer;
  }

  async findById(shopId: string, customerId: string): Promise<Customer | null> {
    const row = await this.db
      .prepare(`SELECT * FROM customers WHERE shop_id = ? AND id = ?`)
      .bind(shopId, customerId)
      .first<CustomerRow>();
    return row ? toCustomer(row) : null;
  }

  async list(shopId: string, search?: string): Promise<Customer[]> {
    let sql = `SELECT * FROM customers WHERE shop_id = ?`;
    const params: unknown[] = [shopId];
    if (search) {
      sql += ` AND (name LIKE ? OR mobile LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY created_at DESC`;
    const { results } = await this.db.prepare(sql).bind(...params).all<CustomerRow>();
    return results.map(toCustomer);
  }

  async findOrCreateByTelegramUser(shopId: string, telegramUserId: number, name: string): Promise<Customer> {
    const row = await this.db
      .prepare(`SELECT * FROM customers WHERE shop_id = ? AND telegram_user_id = ?`)
      .bind(shopId, telegramUserId)
      .first<CustomerRow>();
    if (row) return toCustomer(row);
    return this.create({ shopId, name, telegramUserId });
  }
}
