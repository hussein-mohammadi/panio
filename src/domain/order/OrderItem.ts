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
