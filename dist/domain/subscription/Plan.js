export class Plan {
    id;
    code;
    name;
    description;
    price;
    currency;
    billingPeriod;
    isActive;
    constructor(props) {
        this.id = props.id;
        this.code = props.code;
        this.name = props.name;
        this.description = props.description;
        this.price = props.price;
        this.currency = props.currency;
        this.billingPeriod = props.billingPeriod;
        this.isActive = props.isActive;
    }
}
//# sourceMappingURL=Plan.js.map