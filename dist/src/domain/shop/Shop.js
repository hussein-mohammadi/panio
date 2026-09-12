export class Shop {
    id;
    name;
    ownerTelegramUserId;
    status;
    settings;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.ownerTelegramUserId = props.ownerTelegramUserId;
        this.status = props.status ?? 'ACTIVE';
        this.settings = props.settings ?? {};
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? this.createdAt;
    }
}
//# sourceMappingURL=Shop.js.map