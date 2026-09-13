export interface Env {
  DB: D1Database;
  BOT_SESSIONS: KVNamespace;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_BOT_USERNAME: string;
  TELEGRAM_WEBHOOK_SECRET: string;
  APP_URL: string;
  ZARINPAL_MERCHANT_ID: string;
  ZARINPAL_SANDBOX: string;
}
