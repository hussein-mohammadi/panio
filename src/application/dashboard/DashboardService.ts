export interface TodayMetricsInput {
  shopId: string;
  sales: number;
  orders: number;
  profit: number;
  lowStockCount: number;
  subscriptionDaysLeft: number;
}

export interface TodayMetrics {
  shopId: string;
  sales: number;
  orders: number;
  profit: number;
  lowStockCount: number;
  subscriptionDaysLeft: number;
}

export class DashboardService {
  getTodayMetrics(input: TodayMetricsInput): TodayMetrics {
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
