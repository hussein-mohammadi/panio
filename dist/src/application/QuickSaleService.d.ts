import { Product } from '../domain/product/Product.js';
export interface QuickSaleRequest {
    shopId: string;
    customerId: string;
    product: Product;
    quantity: number;
    source: 'MANUAL' | 'TELEGRAM' | 'INSTAGRAM' | 'OTHER';
}
export interface QuickSaleResult {
    success: boolean;
    error?: string;
}
export declare class QuickSaleService {
    createQuickOrder(request: QuickSaleRequest): QuickSaleResult;
}
