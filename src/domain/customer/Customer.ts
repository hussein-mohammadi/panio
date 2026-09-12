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

export class Customer {
  readonly id: string;
  readonly shopId: string;
  readonly name: string;
  readonly mobile?: string;
  readonly telegramUserId?: number;
  readonly instagramUserId?: number;
  readonly note?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: CustomerProps) {
    this.id = props.id;
    this.shopId = props.shopId;
    this.name = props.name;
    this.mobile = props.mobile;
    this.telegramUserId = props.telegramUserId;
    this.instagramUserId = props.instagramUserId;
    this.note = props.note;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? this.createdAt;
  }
}
