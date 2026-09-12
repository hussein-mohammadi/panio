export class InventoryTransaction {
    id;
    shopId;
    productId;
    type;
    quantity;
    referenceType;
    referenceId;
    note;
    createdAt;
    constructor(props) {
        this.id = props.id;
        this.shopId = props.shopId;
        this.productId = props.productId;
        this.type = props.type;
        this.quantity = props.type === 'SALE' ? -Math.abs(props.quantity) : Math.abs(props.quantity);
        this.referenceType = props.referenceType;
        this.referenceId = props.referenceId;
        this.note = props.note;
        this.createdAt = props.createdAt ?? new Date();
    }
}
//# sourceMappingURL=InventoryTransaction.js.map