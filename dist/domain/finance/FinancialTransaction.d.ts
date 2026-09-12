export declare enum FinancialTransactionType {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE"
}
export type ExpenseCategory = 'PRODUCT_PURCHASE' | 'SHIPPING' | 'PACKAGING' | 'ADVERTISING' | 'SALARY' | 'OTHER';
export type IncomeCategory = 'SALES' | 'REFUND' | 'OTHER';
export type FinancialCategory = ExpenseCategory | IncomeCategory;
export interface FinancialTransactionProps {
    id: string;
    shopId: string;
    type: FinancialTransactionType;
    category: FinancialCategory;
    amount: number;
    referenceType?: string;
    referenceId?: string;
    note?: string;
    createdAt?: Date;
}
export declare class FinancialTransaction {
    readonly id: string;
    readonly shopId: string;
    readonly type: FinancialTransactionType;
    readonly category: FinancialCategory;
    readonly amount: number;
    readonly referenceType?: string;
    readonly referenceId?: string;
    readonly note?: string;
    readonly createdAt: Date;
    constructor(props: FinancialTransactionProps);
}
