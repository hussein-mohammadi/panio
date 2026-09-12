export interface TelegramIdentity {
    userId: number;
    authDate: number;
    hash: string;
    raw: string;
}
export interface ValidationResult {
    valid: boolean;
    reason?: string;
}
export declare class BotSessionValidator {
    validate(identity: TelegramIdentity): ValidationResult;
}
