export declare class PaymentIdempotencyStore {
    private readonly values;
    markUsed(key: string): void;
    isDuplicate(key: string): boolean;
}
