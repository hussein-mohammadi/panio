export class Customer {
    id;
    shopId;
    name;
    mobile;
    telegramUserId;
    instagramUserId;
    note;
    createdAt;
    updatedAt;
    constructor(props) {
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
//# sourceMappingURL=Customer.js.map