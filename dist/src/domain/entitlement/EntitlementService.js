import { SubscriptionStatus } from '../subscription/Subscription.js';
export class EntitlementService {
    canUseFeature(input) {
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
//# sourceMappingURL=EntitlementService.js.map