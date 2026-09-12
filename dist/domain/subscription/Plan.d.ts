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
export declare class Plan {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly description: string;
    readonly price: number;
    readonly currency: string;
    readonly billingPeriod: string;
    readonly isActive: boolean;
    constructor(props: PlanProps);
}
