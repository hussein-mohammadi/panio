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

export class PaymentGatewayService {
  createPayment(input: CreatePaymentInput): GatewayResult {
    const payment = new Payment({
      id: `payment-${input.providerTransactionId}`,
      shopId: input.shopId,
      subscriptionId: input.subscriptionId,
      provider: input.provider,
      providerTransactionId: input.providerTransactionId,
      amount: input.amount,
      currency: input.currency,
      status: input.status,
    });

    return { success: true, payment };
  }

  activateSubscription(input: ActivateSubscriptionInput): GatewayResult {
    if (input.paymentStatus !== PaymentStatus.PAID || !input.callbackVerified) {
      return { success: false, error: 'Payment must be verified and paid before activation.', }; 
    }

    return { success: true, activated: true };
  }
}
