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
export declare class InventoryTransaction {
    readonly id: string;
    readonly shopId: string;
    readonly productId: string;
    readonly type: InventoryTransactionType;
    readonly quantity: number;
    readonly referenceType?: string;
    readonly referenceId?: string;
    readonly note?: string;
    readonly createdAt: Date;
    constructor(props: InventoryTransactionProps);
}
