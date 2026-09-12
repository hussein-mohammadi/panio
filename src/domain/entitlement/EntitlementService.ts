import { Subscription, SubscriptionStatus } from '../subscription/Subscription.js';

export interface EntitlementCheckInput {
  shopId: string;
  subscription: Subscription;
  featureCode: string;
  featureLimit: number;
  state?: Record<string, unknown>;
}

export class EntitlementService {
  canUseFeature(input: EntitlementCheckInput): boolean {
    if (input.subscription.status === SubscriptionStatus.EXPIRED) {
      return false;
    }

    if (input.subscription.status === SubscriptionStatus.CANCELLED) {
      return false;
    }

    if (input.subscription.status === SubscriptionStatus.PAST_DUE) {
      return input.featureCode === 'VIEW_ORDERS';
    }

    if (input.subscription.status === SubscriptionStatus.GRACE_PERIOD) {
      return input.featureCode === 'VIEW_PRODUCTS';
    }

    if (input.featureLimit <= 0) {
      return false;
    }

    return true;
  }
}
