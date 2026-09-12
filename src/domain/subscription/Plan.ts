export interface PlanProps {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  isActive: boolean;
}

export class Plan {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly currency: string;
  readonly billingPeriod: string;
  readonly isActive: boolean;

  constructor(props: PlanProps) {
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
