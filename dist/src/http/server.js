import express from 'express';
import { createTelegramBot } from '../bot/telegramBot.js';
import { env } from '../config/env.js';
export function createHttpServer() {
    const app = express();
    const bot = createTelegramBot();
    app.use(express.json());
    app.get('/health', (_req, res) => {
        res.json({ ok: true, service: 'telegram-shop-saas' });
    });
    app.get('/miniapp', (_req, res) => {
        res.json({
            ok: true,
            message: 'Mini App is ready',
            app: 'telegram-shop-saas',
            userId: _req.query.userId ?? null,
        });
    });
    app.post('/api/telegram/webhook', (req, res) => {
        bot.handleUpdate(req.body, res);
    });
    return { app, bot };
}
export function startServer() {
    const { app } = createHttpServer();
    app.listen(env.port, () => {
        console.log(`Telegram shop server is listening on port ${env.port}`);
    });
}
//# sourceMappingURL=server.js.map