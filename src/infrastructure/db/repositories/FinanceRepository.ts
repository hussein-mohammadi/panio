import {
  FinancialTransaction,
  FinancialCategory,
  FinancialTransactionType,
} from '../../../domain/finance/FinancialTransaction.js';
import { newId } from '../ids.js';

interface FinanceRow {
  id: string;
  shop_id: string;
  type: FinancialTransactionType;
  category: FinancialCategory;
  amount: number;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

function toTransaction(row: FinanceRow): FinancialTransaction {
  return new FinancialTransaction({
    id: row.id,
    shopId: row.shop_id,
    type: row.type,
    category: row.category,
    amount: row.amount,
    referenceType: row.reference_type ?? undefined,
    referenceId: row.reference_id ?? undefined,
    note: row.note ?? undefined,
    createdAt: new Date(row.created_at),
  });
}

export interface RecordExpenseInput {
  shopId: string;
  category: FinancialCategory;
  amount: number;
  note?: string;
}

export interface FinanceSummary {
  income: number;
  expense: number;
  profit: number;
}

export class FinanceRepository {
  constructor(private readonly db: D1Database) {}

  async recordExpense(input: RecordExpenseInput): Promise<FinancialTransaction> {
    const tx = new FinancialTransaction({
      id: newId('fin'),
      shopId: input.shopId,
      type: FinancialTransactionType.EXPENSE,
      category: input.category,
      amount: input.amount,
      note: input.note,
    });
    await this.db
      .prepare(
        `INSERT INTO financial_transactions (id, shop_id, type, category, amount, reference_type, reference_id, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(tx.id, tx.shopId, tx.type, tx.category, tx.amount, tx.referenceType ?? null, tx.referenceId ?? null, tx.note ?? null, tx.createdAt.toISOString())
      .run();
    return tx;
  }

  async list(shopId: string, opts: { type?: FinancialTransactionType; limit?: number } = {}): Promise<FinancialTransaction[]> {
    let sql = `SELECT * FROM financial_transactions WHERE shop_id = ?`;
    const params: unknown[] = [shopId];
    if (opts.type) {
      sql += ` AND type = ?`;
      params.push(opts.type);
    }
    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(opts.limit ?? 50);

    const { results } = await this.db.prepare(sql).bind(...params).all<FinanceRow>();
    return results.map(toTransaction);
  }

  private async summarySince(shopId: string, sinceSql: string): Promise<FinanceSummary> {
    const row = await this.db
      .prepare(
        `SELECT
           COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
           COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
         FROM financial_transactions
         WHERE shop_id = ? AND created_at >= ${sinceSql}`
      )
      .bind(shopId)
      .first<{ income: number; expense: number }>();

    const income = row?.income ?? 0;
    const expense = row?.expense ?? 0;
    return { income, expense, profit: income - expense };
  }

  summaryToday(shopId: string): Promise<FinanceSummary> {
    return this.summarySince(shopId, `datetime('now', 'start of day')`);
  }

  summaryThisWeek(shopId: string): Promise<FinanceSummary> {
    return this.summarySince(shopId, `datetime('now', 'weekday 0', '-7 days')`);
  }

  summaryThisMonth(shopId: string): Promise<FinanceSummary> {
    return this.summarySince(shopId, `datetime('now', 'start of month')`);
  }
}
