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

export class ShopMember {
  readonly id: string;
  readonly shopId: string;
  readonly telegramUserId: number;
  readonly role: MemberRole;
  readonly status: MemberStatus;
  readonly joinedAt: Date;

  constructor(props: ShopMemberProps) {
    this.id = props.id;
    this.shopId = props.shopId;
    this.telegramUserId = props.telegramUserId;
    this.role = props.role;
    this.status = props.status ?? 'ACTIVE';
    this.joinedAt = props.joinedAt ?? new Date();
  }
}
