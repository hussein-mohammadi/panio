export class QuickSaleService {
    createQuickOrder(request) {
        try {
            request.product.reduceStock(request.quantity);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'ثبت سفارش انجام نشد.',
            };
        }
    }
}
//# sourceMappingURL=QuickSaleService.js.map