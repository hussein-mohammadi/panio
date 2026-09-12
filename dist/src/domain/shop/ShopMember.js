export class ShopMember {
    id;
    shopId;
    telegramUserId;
    role;
    status;
    joinedAt;
    constructor(props) {
        this.id = props.id;
        this.shopId = props.shopId;
        this.telegramUserId = props.telegramUserId;
        this.role = props.role;
        this.status = props.status ?? 'ACTIVE';
        this.joinedAt = props.joinedAt ?? new Date();
    }
}
//# sourceMappingURL=ShopMember.js.map