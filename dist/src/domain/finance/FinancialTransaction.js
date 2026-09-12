export var FinancialTransactionType;
(function (FinancialTransactionType) {
    FinancialTransactionType["INCOME"] = "INCOME";
    FinancialTransactionType["EXPENSE"] = "EXPENSE";
})(FinancialTransactionType || (FinancialTransactionType = {}));
export class FinancialTransaction {
    id;
    shopId;
    type;
    category;
    amount;
    referenceType;
    referenceId;
    note;
    createdAt;
    constructor(props) {
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
//# sourceMappingURL=FinancialTransaction.js.map