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

export class QuickSaleService {
  createQuickOrder(request: QuickSaleRequest): QuickSaleResult {
    try {
      request.product.reduceStock(request.quantity);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ثبت سفارش انجام نشد.',
      };
    }
  }
}
