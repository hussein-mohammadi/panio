import { Env } from '../env.js';
import { PaymentStatus } from '../../domain/payment/Payment.js';
import { PaymentGatewayService } from '../../application/payment/PaymentGatewayService.js';
import { ZarinpalProvider } from '../../infrastructure/payment/ZarinpalProvider.js';
import { PlanRepository } from '../../infrastructure/db/repositories/PlanRepository.js';
import { SubscriptionRepository } from '../../infrastructure/db/repositories/SubscriptionRepository.js';
import { PaymentRepository } from '../../infrastructure/db/repositories/PaymentRepository.js';
import { ShopRepository } from '../../infrastructure/db/repositories/ShopRepository.js';
import { sendTelegramMessage } from '../telegramApi.js';

const PROVIDER = 'ZARINPAL';

function zarinpal(env: Env): ZarinpalProvider {
  return new ZarinpalProvider({ merchantId: env.ZARINPAL_MERCHANT_ID, sandbox: env.ZARINPAL_SANDBOX === 'true' });
}

export interface CheckoutResult {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

/** Starts a Zarinpal checkout for a shop to buy/renew a plan; the payment row starts PENDING. */
export async function createSubscriptionCheckout(env: Env, shopId: string, planId: string): Promise<CheckoutResult> {
  const plans = new PlanRepository(env.DB);
  const payments = new PaymentRepository(env.DB);
  const subscriptions = new SubscriptionRepository(env.DB);

  const plan = await plans.findById(planId);
  if (!plan || !plan.isActive) {
    return { success: false, error: 'پلن انتخاب‌شده معتبر نیست.' };
  }
  if (plan.price <= 0) {
    return { success: false, error: 'این پلن نیازی به پرداخت ندارد.' };
  }

  const current = await subscriptions.getCurrent(shopId);
  // A pending row is created up front with authority as its providerTransactionId once Zarinpal
  // returns one; subscriptionId is filled with the current subscription (or a placeholder) so the
  // callback can find it — see confirmSubscriptionCheckout.
  const callbackUrl = `${env.APP_URL}/api/payments/zarinpal/callback?shopId=${encodeURIComponent(shopId)}&planId=${encodeURIComponent(planId)}`;

  const request = await zarinpal(env).requestPayment({
    amountToman: plan.price,
    description: `اشتراک ماهانه پانیو — پلن ${plan.name}`,
    callbackUrl,
  });

  if (!request.success || !request.authority || !request.paymentUrl) {
    return { success: false, error: request.error ?? 'ایجاد پرداخت ناموفق بود.' };
  }

  await payments.create({
    shopId,
    subscriptionId: current?.id ?? 'pending',
    provider: PROVIDER,
    providerTransactionId: request.authority,
    amount: plan.price,
    currency: 'IRT',
    status: PaymentStatus.PENDING,
  });

  return { success: true, paymentUrl: request.paymentUrl };
}

export interface ConfirmResult {
  success: boolean;
  error?: string;
}

/** Verifies a Zarinpal callback and activates the subscription — idempotent on duplicate callbacks. */
export async function confirmSubscriptionCheckout(
  env: Env,
  shopId: string,
  planId: string,
  authority: string,
  zarinpalStatus: string
): Promise<ConfirmResult> {
  const plans = new PlanRepository(env.DB);
  const payments = new PaymentRepository(env.DB);
  const subscriptions = new SubscriptionRepository(env.DB);
  const shops = new ShopRepository(env.DB);

  const existingPayment = await payments.findByProviderTransaction(shopId, PROVIDER, authority);
  if (!existingPayment) {
    return { success: false, error: 'پرداخت یافت نشد.' };
  }
  if (existingPayment.status === PaymentStatus.PAID) {
    // Duplicate callback — already processed, nothing to do (idempotency guard).
    return { success: true };
  }

  if (zarinpalStatus !== 'OK') {
    await payments.markFailed(existingPayment.id);
    return { success: false, error: 'پرداخت توسط کاربر لغو شد.' };
  }

  const plan = await plans.findById(planId);
  if (!plan) {
    return { success: false, error: 'پلن یافت نشد.' };
  }

  const verification = await zarinpal(env).verifyPayment({ amountToman: plan.price, authority });

  const gateway = new PaymentGatewayService();
  const activation = gateway.activateSubscription({
    shopId,
    subscriptionId: existingPayment.subscriptionId,
    paymentStatus: verification.success ? PaymentStatus.PAID : PaymentStatus.FAILED,
    providerTransactionId: authority,
    callbackVerified: verification.success,
  });

  if (!activation.success) {
    await payments.markFailed(existingPayment.id);
    return { success: false, error: activation.error ?? 'تایید پرداخت ناموفق بود.' };
  }

  await payments.markPaid(existingPayment.id);
  await subscriptions.activate(shopId, planId, PROVIDER);

  const shop = await shops.findById(shopId);
  if (shop) {
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      shop.ownerTelegramUserId,
      `✅ اشتراک «${plan.name}» فروشگاه «${shop.name}» با موفقیت فعال شد.`
    );
  }

  return { success: true };
}
