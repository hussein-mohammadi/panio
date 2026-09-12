export type MemberRole = 'OWNER' | 'STAFF';
export type MemberStatus = 'ACTIVE' | 'INVITED' | 'REMOVED';
export interface ShopMemberProps {
    id: string;
    shopId: string;
    telegramUserId: number;
    role: MemberRole;
    status?: MemberStatus;
    joinedAt?: Date;
}
export declare class ShopMember {
    readonly id: string;
    readonly shopId: string;
    readonly telegramUserId: number;
    readonly role: MemberRole;
    readonly status: MemberStatus;
    readonly joinedAt: Date;
    constructor(props: ShopMemberProps);
}
