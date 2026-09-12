export interface PlanFeatureProps {
  id: string;
  planId: string;
  featureCode: string;
  value: string;
}

export class PlanFeature {
  readonly id: string;
  readonly planId: string;
  readonly featureCode: string;
  readonly value: string;

  constructor(props: PlanFeatureProps) {
    this.id = props.id;
    this.planId = props.planId;
    this.featureCode = props.featureCode;
    this.value = props.value;
  }
}
