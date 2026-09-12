export class ReportService {
    getSummary(input) {
        return {
            shopId: input.shopId,
            totalSales: input.totalSales,
            totalIncome: input.totalIncome,
            totalExpense: input.totalExpense,
            netProfit: input.netProfit,
            ordersCount: input.ordersCount,
            topProducts: [...input.topProducts],
        };
    }
}
//# sourceMappingURL=ReportService.js.map