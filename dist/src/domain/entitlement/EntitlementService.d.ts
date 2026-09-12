import { Subscription } from '../subscription/Subscription.js';
export interface EntitlementCheckInput {
    shopId: string;
    subscription: Subscription;
    featureCode: string;
    featureLimit: number;
    state?: Record<string, unknown>;
}
export declare class EntitlementService {
    canUseFeature(input: EntitlementCheckInput): boolean;
}
