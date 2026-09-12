export interface TopProductSummary {
    productName: string;
    amount: number;
}
export interface ReportSummaryInput {
    shopId: string;
    totalSales: number;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    ordersCount: number;
    topProducts: TopProductSummary[];
}
export interface ReportSummary {
    shopId: string;
    totalSales: number;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    ordersCount: number;
    topProducts: TopProductSummary[];
}
export declare class ReportService {
    getSummary(input: ReportSummaryInput): ReportSummary;
}
