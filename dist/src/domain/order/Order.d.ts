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
export declare class Order {
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
    private readonly items;
    constructor(props: OrderProps);
    addItem(item: OrderItem): void;
    finalize(): void;
    getItems(): OrderItem[];
}
