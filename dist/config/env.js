import dotenv from 'dotenv';
dotenv.config();
export const env = {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
    appUrl: process.env.APP_URL ?? 'http://localhost:3000',
    port: Number(process.env.PORT ?? 3000),
};
export function assertTelegramConfig() {
    if (!env.telegramBotToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
    }
}
//# sourceMappingURL=env.js.map