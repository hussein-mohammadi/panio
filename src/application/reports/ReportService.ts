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

export class ReportService {
  getSummary(input: ReportSummaryInput): ReportSummary {
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
