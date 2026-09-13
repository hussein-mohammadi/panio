import { Env } from '../env.js';
import { sendTelegramMessage } from '../telegramApi.js';
import { Order } from '../../domain/order/Order.js';
import { Product } from '../../domain/product/Product.js';
import { Subscription } from '../../domain/subscription/Subscription.js';

const toman = (n: number) => `${n.toLocaleString('fa-IR')} تومان`;

export async function notifyNewOrder(env: Env, ownerTelegramUserId: number, order: Order): Promise<void> {
  await sendTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    ownerTelegramUserId,
    `🛒 سفارش جدید ثبت شد\nمبلغ: ${toman(order.finalAmount)}`
  );
}

export async function notifyLowStock(env: Env, ownerTelegramUserId: number, product: Product): Promise<void> {
  await sendTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    ownerTelegramUserId,
    `⚠️ موجودی کالای «${product.name}» کم شد (${product.stock} عدد باقی‌مانده).`
  );
}

export async function notifySubscriptionExpiringSoon(
  env: Env,
  ownerTelegramUserId: number,
  shopName: string,
  subscription: Subscription
): Promise<void> {
  const daysLeft = Math.max(0, Math.ceil((subscription.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
  await sendTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    ownerTelegramUserId,
    `⏳ اشتراک فروشگاه «${shopName}» تا ${daysLeft} روز دیگر منقضی می‌شود. برای تمدید وارد پنل فروشگاه شوید.`
  );
}
