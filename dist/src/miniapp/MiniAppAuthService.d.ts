export interface MiniAppAuthInput {
    telegramUserId: number;
    shopId: string;
    initData: string;
    isTrusted: boolean;
}
export interface MiniAppAuthResult {
    authorized: boolean;
    shopId?: string;
    reason?: string;
}
export declare class MiniAppAuthService {
    authorize(input: MiniAppAuthInput): MiniAppAuthResult;
}
