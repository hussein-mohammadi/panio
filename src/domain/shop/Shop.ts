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

export class Shop {
  readonly id: string;
  readonly name: string;
  readonly ownerTelegramUserId: number;
  readonly status: ShopStatus;
  readonly settings: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ShopProps) {
    this.id = props.id;
    this.name = props.name;
    this.ownerTelegramUserId = props.ownerTelegramUserId;
    this.status = props.status ?? 'ACTIVE';
    this.settings = props.settings ?? {};
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? this.createdAt;
  }
}
