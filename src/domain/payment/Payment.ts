export enum PaymentStatus {
  CREATED = 'Created',
  PENDING = 'Pending',
  PAID = 'Paid',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled',
  REFUNDED = 'Refunded',
}

export interface PaymentProps {
  id: string;
  shopId: string;
  subscriptionId: string;
  provider: string;
  providerTransactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export class Payment {
  readonly id: string;
  readonly shopId: string;
  readonly subscriptionId: string;
  readonly provider: string;
  readonly providerTransactionId: string;
  readonly amount: number;
  readonly currency: string;
  status: PaymentStatus;
  readonly paidAt?: Date;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;

  constructor(props: PaymentProps) {
    this.id = props.id;
    this.shopId = props.shopId;
    this.subscriptionId = props.subscriptionId;
    this.provider = props.provider;
    this.providerTransactionId = props.providerTransactionId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.status = props.status;
    this.paidAt = props.paidAt;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt ?? new Date();
  }
}
