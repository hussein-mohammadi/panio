import { Bot, InlineKeyboard } from 'grammy';
import { Env } from './env.js';
import { ShopRepository } from '../infrastructure/db/repositories/ShopRepository.js';
import { InvitationRepository } from '../infrastructure/db/repositories/InvitationRepository.js';
import { SubscriptionRepository } from '../infrastructure/db/repositories/SubscriptionRepository.js';
import { PlanRepository } from '../infrastructure/db/repositories/PlanRepository.js';

const TRIAL_PLAN_ID = 'plan-pro';

export function createBot(env: Env): Bot {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);
  const shops = new ShopRepository(env.DB);
  const invitations = new InvitationRepository(env.DB);
  const subscriptions = new SubscriptionRepository(env.DB);
  const plans = new PlanRepository(env.DB);

  const appUrl = `${env.APP_URL}/app/`;
  const openAppKeyboard = new InlineKeyboard().webApp('🏪 باز کردن پنل فروشگاه', appUrl);

  bot.command('start', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const payload = ctx.match?.toString().trim();

    if (payload?.startsWith('invite_')) {
      const token = payload.replace('invite_', '');
      const invitation = await invitations.findValidByToken(token);
      if (!invitation) {
        await ctx.reply('این لینک دعوت نامعتبر یا منقضی شده است.');
        return;
      }
      await shops.addMember(invitation.shopId, userId, 'STAFF');
      await invitations.markUsed(invitation.id);
      const shop = await shops.findById(invitation.shopId);
      await ctx.reply(`✅ به فروشگاه «${shop?.name ?? ''}» پیوستید.`, { reply_markup: openAppKeyboard });
      return;
    }

    const memberships = await shops.listShopsForUser(userId);
    if (memberships.length > 0) {
      await ctx.reply(
        `سلام 👋 خوش برگشتید به پانیو.\nفروشگاه‌های شما: ${memberships.map((m) => m.shop.name).join('، ')}`,
        { reply_markup: openAppKeyboard }
      );
      return;
    }

    await ctx.reply(
      'سلام 👋\nبه پانیو خوش آمدید — مدیریت فروشگاه تلگرامی و اینستاگرامی شما.\n\n' +
        'برای شروع، فروشگاه خود را بسازید. اگر از طرف یک فروشگاه دعوت شده‌اید، از لینک دعوتی که برایتان ارسال شده استفاده کنید.',
      { reply_markup: new InlineKeyboard().webApp('🏪 ساخت فروشگاه', `${appUrl}#/onboarding`) }
    );
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(
      'دستورات موجود:\n' +
        '/start - شروع و ورود به پنل فروشگاه\n' +
        '/help - راهنما\n' +
        '/shop - باز کردن پنل فروشگاه\n' +
        '/subscribe - وضعیت و تمدید اشتراک'
    );
  });

  bot.command('shop', async (ctx) => {
    await ctx.reply('پنل فروشگاه:', { reply_markup: openAppKeyboard });
  });

  bot.command('subscribe', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const memberships = await shops.listShopsForUser(userId);
    const owned = memberships.find((m) => m.member.role === 'OWNER');
    if (!owned) {
      await ctx.reply('برای مدیریت اشتراک ابتدا باید مالک یک فروشگاه باشید.');
      return;
    }

    const subscription = await subscriptions.getCurrent(owned.shop.id);
    const plan = subscription ? await plans.findById(subscription.planId) : null;
    const daysLeft = subscription
      ? Math.max(0, Math.ceil((subscription.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      : 0;

    await ctx.reply(
      subscription
        ? `پلن فعلی: ${plan?.name ?? subscription.planId}\nوضعیت: ${subscription.status}\n${daysLeft} روز باقی‌مانده`
        : 'اشتراکی برای این فروشگاه یافت نشد.',
      { reply_markup: new InlineKeyboard().webApp('تمدید / ارتقا اشتراک', `${appUrl}#/subscription`) }
    );
  });

  return bot;
}

/** Called once when a new shop is created — every shop starts with a 14-day trial on the top plan. */
export async function startTrialSubscription(env: Env, shopId: string): Promise<void> {
  const subscriptions = new SubscriptionRepository(env.DB);
  await subscriptions.createTrial(shopId, TRIAL_PLAN_ID);
}
