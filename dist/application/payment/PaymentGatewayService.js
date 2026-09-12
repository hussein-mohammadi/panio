import { Payment, PaymentStatus } from '../../domain/payment/Payment.js';
export class PaymentGatewayService {
    createPayment(input) {
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
    activateSubscription(input) {
        if (input.paymentStatus !== PaymentStatus.PAID || !input.callbackVerified) {
            return { success: false, error: 'Payment must be verified and paid before activation.', };
        }
        return { success: true, activated: true };
    }
}
//# sourceMappingURL=PaymentGatewayService.js.map