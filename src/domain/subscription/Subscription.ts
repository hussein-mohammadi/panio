export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  GRACE_PERIOD = 'GRACE_PERIOD',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
}

export interface SubscriptionProps {
  id: string;
  shopId: string;
  planId: string;
  status: SubscriptionStatus;
  startsAt: Date;
  expiresAt: Date;
  autoRenew?: boolean;
  paymentProvider?: string;
  providerSubscriptionId?: string;
  cancelledAt?: Date;
  gracePeriodEndsAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Subscription {
  readonly id: string;
  readonly shopId: string;
  readonly planId: string;
  status: SubscriptionStatus;
  readonly startsAt: Date;
  readonly expiresAt: Date;
  readonly autoRenew: boolean;
  readonly paymentProvider?: string;
  readonly providerSubscriptionId?: string;
  readonly cancelledAt?: Date;
  readonly gracePeriodEndsAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: SubscriptionProps) {
    this.id = props.id;
    this.shopId = props.shopId;
    this.planId = props.planId;
    this.status = props.status;
    this.startsAt = props.startsAt;
    this.expiresAt = props.expiresAt;
    this.autoRenew = props.autoRenew ?? true;
    this.paymentProvider = props.paymentProvider;
    this.providerSubscriptionId = props.providerSubscriptionId;
    this.cancelledAt = props.cancelledAt;
    this.gracePeriodEndsAt = props.gracePeriodEndsAt;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? this.createdAt;
  }
}
