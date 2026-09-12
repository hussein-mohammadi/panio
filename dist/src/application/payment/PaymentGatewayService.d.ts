import { Payment, PaymentStatus } from '../../domain/payment/Payment.js';
export interface CreatePaymentInput {
    shopId: string;
    subscriptionId: string;
    provider: string;
    providerTransactionId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
}
export interface ActivateSubscriptionInput {
    shopId: string;
    subscriptionId: string;
    paymentStatus: PaymentStatus;
    providerTransactionId: string;
    callbackVerified: boolean;
}
export interface GatewayResult {
    success: boolean;
    payment?: Payment;
    activated?: boolean;
    error?: string;
}
export declare class PaymentGatewayService {
    createPayment(input: CreatePaymentInput): GatewayResult;
    activateSubscription(input: ActivateSubscriptionInput): GatewayResult;
}
