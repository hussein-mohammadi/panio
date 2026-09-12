export interface CustomerProps {
    id: string;
    shopId: string;
    name: string;
    mobile?: string;
    telegramUserId?: number;
    instagramUserId?: number;
    note?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Customer {
    readonly id: string;
    readonly shopId: string;
    readonly name: string;
    readonly mobile?: string;
    readonly telegramUserId?: number;
    readonly instagramUserId?: number;
    readonly note?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: CustomerProps);
}
