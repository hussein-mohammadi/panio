export class Product {
    id;
    shopId;
    name;
    sku;
    purchasePrice;
    sellingPrice;
    stock;
    lowStockThreshold;
    categoryId;
    image;
    isActive;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.shopId = props.shopId;
        this.name = props.name;
        this.sku = props.sku;
        this.purchasePrice = props.purchasePrice;
        this.sellingPrice = props.sellingPrice;
        this.stock = props.stock;
        this.lowStockThreshold = props.lowStockThreshold ?? 0;
        this.categoryId = props.categoryId;
        this.image = props.image;
        this.isActive = props.isActive ?? true;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? this.createdAt;
    }
    reduceStock(quantity) {
        if (quantity < 0) {
            throw new Error('Quantity cannot be negative.');
        }
        if (this.stock < quantity) {
            throw new Error('ثبت سفارش انجام نشد. موجودی کالا کافی نیست.');
        }
        this.stock -= quantity;
        this.updatedAt = new Date();
    }
    restoreStock(quantity) {
        if (quantity < 0) {
            throw new Error('Quantity cannot be negative.');
        }
        this.stock += quantity;
        this.updatedAt = new Date();
    }
}
//# sourceMappingURL=Product.js.map