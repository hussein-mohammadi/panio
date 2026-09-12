export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["CREATED"] = "Created";
    PaymentStatus["PENDING"] = "Pending";
    PaymentStatus["PAID"] = "Paid";
    PaymentStatus["FAILED"] = "Failed";
    PaymentStatus["CANCELLED"] = "Cancelled";
    PaymentStatus["REFUNDED"] = "Refunded";
})(PaymentStatus || (PaymentStatus = {}));
export class Payment {
    id;
    shopId;
    subscriptionId;
    provider;
    providerTransactionId;
    amount;
    currency;
    status;
    paidAt;
    metadata;
    createdAt;
    constructor(props) {
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
//# sourceMappingURL=Payment.js.map