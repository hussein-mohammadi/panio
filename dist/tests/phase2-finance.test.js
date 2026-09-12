import { describe, expect, it } from 'vitest';
import { FinancialTransaction, FinancialTransactionType } from '../src/domain/finance/FinancialTransaction.js';
import { DashboardService } from '../src/application/dashboard/DashboardService.js';
import { ReportService } from '../src/application/reports/ReportService.js';
describe('Phase 2 finance domain', () => {
    it('creates income and expense records with correct direction', () => {
        const income = new FinancialTransaction({
            id: 'ft-1',
            shopId: 'shop-1',
            type: FinancialTransactionType.INCOME,
            category: 'SALES',
            amount: 500000,
            referenceType: 'ORDER',
            referenceId: 'order-1',
            note: 'order sale',
        });
        const expense = new FinancialTransaction({
            id: 'ft-2',
            shopId: 'shop-1',
            type: FinancialTransactionType.EXPENSE,
            category: 'PRODUCT_PURCHASE',
            amount: 200000,
            referenceType: 'PURCHASE',
            referenceId: 'purchase-1',
            note: 'stock refill',
        });
        expect(income.amount).toBe(500000);
        expect(income.type).toBe(FinancialTransactionType.INCOME);
        expect(expense.amount).toBe(200000);
        expect(expense.type).toBe(FinancialTransactionType.EXPENSE);
    });
    it('calculates profit as total income minus total expense', () => {
        const transactions = [
            new FinancialTransaction({
                id: 'ft-3',
                shopId: 'shop-1',
                type: FinancialTransactionType.INCOME,
                category: 'SALES',
                amount: 2500000,
                referenceType: 'ORDER',
                referenceId: 'order-2',
            }),
            new FinancialTransaction({
                id: 'ft-4',
                shopId: 'shop-1',
                type: FinancialTransactionType.EXPENSE,
                category: 'PRODUCT_PURCHASE',
                amount: 1000000,
                referenceType: 'PURCHASE',
                referenceId: 'purchase-2',
            }),
            new FinancialTransaction({
                id: 'ft-5',
                shopId: 'shop-1',
                type: FinancialTransactionType.EXPENSE,
                category: 'SHIPPING',
                amount: 250000,
                referenceType: 'ORDER',
                referenceId: 'order-2',
            }),
        ];
        const totalIncome = transactions
            .filter((tx) => tx.type === FinancialTransactionType.INCOME)
            .reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpense = transactions
            .filter((tx) => tx.type === FinancialTransactionType.EXPENSE)
            .reduce((sum, tx) => sum + tx.amount, 0);
        expect(totalIncome).toBe(2500000);
        expect(totalExpense).toBe(1250000);
        expect(totalIncome - totalExpense).toBe(1250000);
    });
    it('builds today dashboard metrics for current shop', () => {
        const dashboard = new DashboardService();
        const metrics = dashboard.getTodayMetrics({
            shopId: 'shop-1',
            sales: 12450000,
            orders: 18,
            profit: 4200000,
            lowStockCount: 3,
            subscriptionDaysLeft: 23,
        });
        expect(metrics.sales).toBe(12450000);
        expect(metrics.orders).toBe(18);
        expect(metrics.profit).toBe(4200000);
        expect(metrics.lowStockCount).toBe(3);
        expect(metrics.subscriptionDaysLeft).toBe(23);
    });
    it('builds a simple report summary', () => {
        const report = new ReportService();
        const summary = report.getSummary({
            shopId: 'shop-1',
            totalSales: 6550000,
            totalIncome: 6550000,
            totalExpense: 2300000,
            netProfit: 4250000,
            ordersCount: 12,
            topProducts: [
                { productName: 'Notebook', amount: 2400000 },
                { productName: 'Pen', amount: 1100000 },
            ],
        });
        expect(summary.totalSales).toBe(6550000);
        expect(summary.netProfit).toBe(4250000);
        expect(summary.ordersCount).toBe(12);
        expect(summary.topProducts.length).toBe(2);
    });
});
//# sourceMappingURL=phase2-finance.test.js.map