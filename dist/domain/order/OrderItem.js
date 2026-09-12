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
//# sourceMappingURL=OrderItem.js.map