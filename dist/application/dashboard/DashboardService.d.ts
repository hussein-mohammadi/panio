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
export declare class DashboardService {
    getTodayMetrics(input: TodayMetricsInput): TodayMetrics;
}
