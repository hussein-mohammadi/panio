export class OrderItem {
    id;
    orderId;
    productId;
    productNameSnapshot;
    unitPrice;
    quantity;
    total;
    constructor(props) {
        this.id = props.id;
        this.orderId = props.orderId;
        this.productId = props.productId;
        this.productNameSnapshot = props.productNameSnapshot;
        this.unitPrice = props.unitPrice;
        this.quantity = props.quantity;
        this.total = props.total;
    }
}
export class Order {
    id;
    shopId;
    customerId;
    status;
    totalAmount;
    discountAmount;
    finalAmount;
    note;
    source;
    createdAt;
    updatedAt;
    items;
    constructor(props) {
        this.id = props.id;
        this.shopId = props.shopId;
        this.customerId = props.customerId;
        this.status = props.status ?? 'NEW';
        this.totalAmount = props.totalAmount ?? 0;
        this.discountAmount = props.discountAmount ?? 0;
        this.finalAmount = props.finalAmount ?? this.totalAmount;
        this.note = props.note;
        this.source = props.source ?? 'MANUAL';
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? this.createdAt;
        this.items = [];
    }
    addItem(item) {
        this.items.push(item);
        this.totalAmount += item.total;
        this.finalAmount = this.totalAmount - this.discountAmount;
        this.updatedAt = new Date();
    }
    finalize() {
        this.status = 'CONFIRMED';
        this.finalAmount = this.totalAmount - this.discountAmount;
        this.updatedAt = new Date();
    }
    getItems() {
        return [...this.items];
    }
}
//# sourceMappingURL=Order.js.map