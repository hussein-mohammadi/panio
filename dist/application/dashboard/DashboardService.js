export class DashboardService {
    getTodayMetrics(input) {
        return {
            shopId: input.shopId,
            sales: input.sales,
            orders: input.orders,
            profit: input.profit,
            lowStockCount: input.lowStockCount,
            subscriptionDaysLeft: input.subscriptionDaysLeft,
        };
    }
}
//# sourceMappingURL=DashboardService.js.map