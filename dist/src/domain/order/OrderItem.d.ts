export interface OrderItemInput {
    id: string;
    orderId: string;
    productId: string;
    productNameSnapshot: string;
    unitPrice: number;
    quantity: number;
    total: number;
}
export declare class OrderItem {
    readonly id: string;
    readonly orderId: string;
    readonly productId: string;
    readonly productNameSnapshot: string;
    readonly unitPrice: number;
    readonly quantity: number;
    readonly total: number;
    constructor(props: OrderItemInput);
}
