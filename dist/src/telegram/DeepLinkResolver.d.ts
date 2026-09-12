export interface DeepLinkInput {
    type: string;
    shopId?: string;
    inviteToken?: string;
    userId?: number;
}
export interface DeepLinkResolution {
    valid: boolean;
    reason?: string;
    shopId?: string;
    flow?: string;
}
export declare class DeepLinkResolver {
    resolve(input: DeepLinkInput): DeepLinkResolution;
}
