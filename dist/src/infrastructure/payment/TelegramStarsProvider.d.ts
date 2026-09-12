export interface TelegramStarsCallbackInput {
    providerTransactionId: string;
    status: string;
    amount: number;
    currency: string;
}
export interface TelegramStarsVerificationResult {
    valid: boolean;
    status?: string;
    reason?: string;
}
export declare class TelegramStarsProvider {
    verifyCallback(input: TelegramStarsCallbackInput): TelegramStarsVerificationResult;
}
