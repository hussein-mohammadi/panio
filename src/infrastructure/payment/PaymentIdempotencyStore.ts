export class PaymentIdempotencyStore {
  private readonly values = new Set<string>();

  markUsed(key: string): void {
    this.values.add(key);
  }

  isDuplicate(key: string): boolean {
    return this.values.has(key);
  }
}
