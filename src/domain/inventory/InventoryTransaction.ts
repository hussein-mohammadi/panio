export type InventoryTransactionType = 'INITIAL_STOCK' | 'PURCHASE' | 'SALE' | 'RETURN' | 'DAMAGE' | 'ADJUSTMENT';

export interface InventoryTransactionProps {
  id: string;
  shopId: string;
  productId: string;
  type: InventoryTransactionType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdAt?: Date;
}

export class InventoryTransaction {
  readonly id: string;
  readonly shopId: string;
  readonly productId: string;
  readonly type: InventoryTransactionType;
  readonly quantity: number;
  readonly referenceType?: string;
  readonly referenceId?: string;
  readonly note?: string;
  readonly createdAt: Date;

  constructor(props: InventoryTransactionProps) {
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
