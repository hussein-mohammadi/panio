export class PaymentIdempotencyStore {
    values = new Set();
    markUsed(key) {
        this.values.add(key);
    }
    isDuplicate(key) {
        return this.values.has(key);
    }
}
//# sourceMappingURL=PaymentIdempotencyStore.js.map