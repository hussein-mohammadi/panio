export type ShopStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export interface ShopProps {
    id: string;
    name: string;
    ownerTelegramUserId: number;
    status?: ShopStatus;
    settings?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Shop {
    readonly id: string;
    readonly name: string;
    readonly ownerTelegramUserId: number;
    readonly status: ShopStatus;
    readonly settings: Record<string, unknown>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: ShopProps);
}
