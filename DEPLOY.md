# استقرار پانیو روی Cloudflare Workers

این پروژه کاملاً بدون سرور است: یک Cloudflare Worker (API + بات تلگرام) به‌همراه Cloudflare D1
(پایگاه‌داده) و Cloudflare KV، و فایل‌های استاتیک Mini App از پوشه `public/` سرو می‌شوند.

## ۱. پیش‌نیازها

```bash
npm install
npx wrangler login
```

## ۲. ساخت دیتابیس و KV

```bash
npx wrangler d1 create panio-db
npx wrangler kv namespace create BOT_SESSIONS
```

مقادیر `database_id` و `id` خروجی این دستورات را در `wrangler.jsonc` جای‌گزین
`REPLACE_WITH_D1_DATABASE_ID` و `REPLACE_WITH_KV_NAMESPACE_ID` کنید.

## ۳. اجرای مایگریشن‌ها و seed

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

برای توسعه محلی معادل `:local` را اجرا کنید (`npm run db:migrate:local` و
`npm run db:seed:local`) — این‌ها یک D1 محلی جدا از دیتابیس واقعی می‌سازند.

## ۴. تنظیم Secrets

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET   # یک رشته تصادفی دلخواه بسازید
npx wrangler secret put ZARINPAL_MERCHANT_ID      # merchant id سندباکس یا واقعی زرین‌پال
```

برای توسعه محلی، مقادیر را در `.dev.vars` (بر اساس `.dev.vars.example`) قرار دهید — این فایل
gitignore شده است.

همچنین در `wrangler.jsonc`، مقدار `vars.TELEGRAM_BOT_USERNAME` را با یوزرنیم واقعی بات (بدون @)
جایگزین کنید — برای ساخت لینک‌های دعوت استفاده می‌شود.

## ۵. Deploy

```bash
npm run deploy
```

خروجی این دستور آدرس Worker شما را نشان می‌دهد، مثل:
`https://telegram-shop-saas.<subdomain>.workers.dev`

این آدرس را در `wrangler.jsonc` روی `vars.APP_URL` قرار دهید و دوباره `npm run deploy` را
اجرا کنید (این مقدار برای ساخت لینک‌های Mini App و callback پرداخت استفاده می‌شود).

## ۶. اتصال بات تلگرام (دو درخواست یک‌باره)

با استفاده از همان توکن بات و `TELEGRAM_WEBHOOK_SECRET`:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<APP_URL>/webhook/telegram" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"

curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{"menu_button": {"type": "web_app", "text": "پنل فروشگاه", "web_app": {"url": "https://<APP_URL>/app/"}}}'
```

## ۷. تست

```bash
npm run build   # type-check
npm test        # unit tests
```

سپس در تلگرام به بات پیام `/start` بدهید، فروشگاه بسازید، و از دکمه «باز کردن پنل فروشگاه»
وارد Mini App شوید.

## نکات مهم قبل از Production واقعی

- **زرین‌پال**: `ZARINPAL_SANDBOX` را در `wrangler.jsonc` به `"false"` تغییر دهید و
  `ZARINPAL_MERCHANT_ID` واقعی را ست کنید. واحد پول را در
  [`src/infrastructure/payment/ZarinpalProvider.ts`](src/infrastructure/payment/ZarinpalProvider.ts)
  با مستندات مرچنت خودتان چک کنید (ریال در برابر تومان).
- **قیمت پلن‌ها**: مقادیر `src/infrastructure/db/seed.sql` صرفاً نمونه هستند؛ با
  `wrangler d1 execute panio-db --remote --command "UPDATE plans SET price=... WHERE code=..."`
  ویرایش کنید.
- **Cron**: یک cron روزانه (`triggers.crons` در `wrangler.jsonc`) اشتراک‌های منقضی‌شده را
  جاروب و یادآوری تمدید ارسال می‌کند — در محیط لوکال به‌صورت خودکار اجرا نمی‌شود؛ برای تست
  دستی: `curl "http://127.0.0.1:8787/cdn-cgi/local/scheduled"` هنگام اجرای `wrangler dev`.
