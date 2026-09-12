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
export declare class Product {
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
    constructor(props: ProductProps);
    reduceStock(quantity: number): void;
    restoreStock(quantity: number): void;
}
