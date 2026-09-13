import { Payment, PaymentStatus } from '../../../domain/payment/Payment.js';
import { newId } from '../ids.js';

interface PaymentRow {
  id: string;
  shop_id: string;
  subscription_id: string;
  provider: string;
  provider_transaction_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  metadata: string;
  created_at: string;
}

function toPayment(row: PaymentRow): Payment {
  return new Payment({
    id: row.id,
    shopId: row.shop_id,
    subscriptionId: row.subscription_id,
    provider: row.provider,
    providerTransactionId: row.provider_transaction_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    paidAt: row.paid_at ? new Date(row.paid_at) : undefined,
    metadata: JSON.parse(row.metadata),
    createdAt: new Date(row.created_at),
  });
}

export interface CreatePaymentInput {
  shopId: string;
  subscriptionId: string;
  provider: string;
  providerTransactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
}

export class PaymentRepository {
  constructor(private readonly db: D1Database) {}

  async findByProviderTransaction(shopId: string, provider: string, providerTransactionId: string): Promise<Payment | null> {
    const row = await this.db
      .prepare(`SELECT * FROM payments WHERE shop_id = ? AND provider = ? AND provider_transaction_id = ?`)
      .bind(shopId, provider, providerTransactionId)
      .first<PaymentRow>();
    return row ? toPayment(row) : null;
  }

  async create(input: CreatePaymentInput): Promise<Payment> {
    const payment = new Payment({ id: newId('payment'), ...input });
    await this.db
      .prepare(
        `INSERT INTO payments (id, shop_id, subscription_id, provider, provider_transaction_id, amount, currency, status, paid_at, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        payment.id,
        payment.shopId,
        payment.subscriptionId,
        payment.provider,
        payment.providerTransactionId,
        payment.amount,
        payment.currency,
        payment.status,
        payment.paidAt?.toISOString() ?? null,
        JSON.stringify(payment.metadata ?? {}),
        payment.createdAt.toISOString()
      )
      .run();
    return payment;
  }

  async markPaid(paymentId: string): Promise<void> {
    await this.db
      .prepare(`UPDATE payments SET status = ?, paid_at = ? WHERE id = ?`)
      .bind(PaymentStatus.PAID, new Date().toISOString(), paymentId)
      .run();
  }

  async markFailed(paymentId: string): Promise<void> {
    await this.db.prepare(`UPDATE payments SET status = ? WHERE id = ?`).bind(PaymentStatus.FAILED, paymentId).run();
  }

  async list(shopId: string, limit = 20): Promise<Payment[]> {
    const { results } = await this.db
      .prepare(`SELECT * FROM payments WHERE shop_id = ? ORDER BY created_at DESC LIMIT ?`)
      .bind(shopId, limit)
      .all<PaymentRow>();
    return results.map(toPayment);
  }
}
