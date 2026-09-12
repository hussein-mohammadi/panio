import { Telegraf } from 'telegraf';
import { env } from '../config/env.js';

export function createTelegramBot() {
  const bot = new Telegraf(env.telegramBotToken);

  bot.start(async (ctx) => {
    await ctx.reply(
      'سلام 👋\n' +
        'به فروشگاه تلگرام خوش آمدید.\n' +
        'برای ورود به پنل فروشگاه، Mini App را باز کنید.\n' +
        '/help برای راهنمایی'
    );
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(
      'دستورات موجود:\n' +
        '/start - شروع\n' +
        '/help - راهنما\n' +
        '/shop - باز کردن فروشگاه\n' +
        '/orders - سفارش‌ها'
    );
  });

  bot.command('shop', async (ctx) => {
    const miniAppUrl = `${env.appUrl}/miniapp?userId=${ctx.from?.id ?? 0}`;
    await ctx.reply(`پنل فروشگاه: ${miniAppUrl}`);
  });

  bot.command('orders', async (ctx) => {
    await ctx.reply('لیست سفارش‌ها در Mini App نمایش داده می‌شود.');
  });

  return bot;
}
