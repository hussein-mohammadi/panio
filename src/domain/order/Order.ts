export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
export type OrderSource = 'MANUAL' | 'TELEGRAM' | 'INSTAGRAM' | 'OTHER';

export interface OrderItemInput {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export class OrderItem {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly productNameSnapshot: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly total: number;

  constructor(props: OrderItemInput) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.productId = props.productId;
    this.productNameSnapshot = props.productNameSnapshot;
    this.unitPrice = props.unitPrice;
    this.quantity = props.quantity;
    this.total = props.total;
  }
}

export interface OrderProps {
  id: string;
  shopId: string;
  customerId: string;
  status?: OrderStatus;
  totalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  note?: string;
  source?: OrderSource;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order {
  readonly id: string;
  readonly shopId: string;
  readonly customerId: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  readonly note?: string;
  readonly source: OrderSource;
  readonly createdAt: Date;
  updatedAt: Date;
  private readonly items: OrderItem[];

  constructor(props: OrderProps) {
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

  addItem(item: OrderItem): void {
    this.items.push(item);
    this.totalAmount += item.total;
    this.finalAmount = this.totalAmount - this.discountAmount;
    this.updatedAt = new Date();
  }

  finalize(): void {
    this.status = 'CONFIRMED';
    this.finalAmount = this.totalAmount - this.discountAmount;
    this.updatedAt = new Date();
  }

  getItems(): OrderItem[] {
    return [...this.items];
  }
}
