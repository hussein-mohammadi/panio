export interface IncomingExternalMessage {
    source: 'INSTAGRAM' | 'OTHER';
    message: string;
    userId: number;
    shopId: string;
    isValidated: boolean;
}
export interface PotentialOrderResult {
    success: boolean;
    potentialOrder?: {
        source: string;
        message: string;
        userId: number;
        shopId: string;
    };
    reason?: string;
}
export declare class ExternalCommerceService {
    processIncomingMessage(input: IncomingExternalMessage): PotentialOrderResult;
}
