export enum FinancialTransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export type ExpenseCategory =
  | 'PRODUCT_PURCHASE'
  | 'SHIPPING'
  | 'PACKAGING'
  | 'ADVERTISING'
  | 'SALARY'
  | 'OTHER';

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

export class FinancialTransaction {
  readonly id: string;
  readonly shopId: string;
  readonly type: FinancialTransactionType;
  readonly category: FinancialCategory;
  readonly amount: number;
  readonly referenceType?: string;
  readonly referenceId?: string;
  readonly note?: string;
  readonly createdAt: Date;

  constructor(props: FinancialTransactionProps) {
    if (props.amount < 0) {
      throw new Error('Amount cannot be negative.');
    }

    this.id = props.id;
    this.shopId = props.shopId;
    this.type = props.type;
    this.category = props.category;
    this.amount = props.amount;
    this.referenceType = props.referenceType;
    this.referenceId = props.referenceId;
    this.note = props.note;
    this.createdAt = props.createdAt ?? new Date();
  }
}
