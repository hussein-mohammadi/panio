export var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["TRIAL"] = "TRIAL";
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["PAST_DUE"] = "PAST_DUE";
    SubscriptionStatus["GRACE_PERIOD"] = "GRACE_PERIOD";
    SubscriptionStatus["CANCELLED"] = "CANCELLED";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
    SubscriptionStatus["SUSPENDED"] = "SUSPENDED";
})(SubscriptionStatus || (SubscriptionStatus = {}));
export class Subscription {
    id;
    shopId;
    planId;
    status;
    startsAt;
    expiresAt;
    autoRenew;
    paymentProvider;
    providerSubscriptionId;
    cancelledAt;
    gracePeriodEndsAt;
    createdAt;
    updatedAt;
    constructor(props) {
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
//# sourceMappingURL=Subscription.js.map