export interface ProductProps {
  id: string;
  shopId: string;
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold?: number;
  categoryId?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  readonly id: string;
  readonly shopId: string;
  readonly name: string;
  readonly sku: string;
  readonly purchasePrice: number;
  readonly sellingPrice: number;
  stock: number;
  readonly lowStockThreshold: number;
  readonly categoryId?: string;
  readonly image?: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: ProductProps) {
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

  reduceStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }

    if (this.stock < quantity) {
      throw new Error('ثبت سفارش انجام نشد. موجودی کالا کافی نیست.');
    }

    this.stock -= quantity;
    this.updatedAt = new Date();
  }

  restoreStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }

    this.stock += quantity;
    this.updatedAt = new Date();
  }
}
