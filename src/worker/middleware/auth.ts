import { Context, Next } from 'hono';
import { Env } from '../env.js';
import { MiniAppAuthService } from '../../miniapp/MiniAppAuthService.js';
import { ShopRepository } from '../../infrastructure/db/repositories/ShopRepository.js';
import { TelegramInitDataUser } from '../../miniapp/verifyInitData.js';
import { MemberRole } from '../../domain/shop/ShopMember.js';

export type AppEnv = {
  Bindings: Env;
  Variables: {
    user: TelegramInitDataUser;
    role: MemberRole;
  };
};

function initDataFrom(c: Context<AppEnv>): string {
  return c.req.header('X-Telegram-Init-Data') ?? '';
}

/** Verifies the Telegram initData signature only — use for endpoints not scoped to a shop (POST /api/shops). */
export async function requireAuth(c: Context<AppEnv>, next: Next) {
  const shops = new ShopRepository(c.env.DB);
  const auth = new MiniAppAuthService(c.env.TELEGRAM_BOT_TOKEN, shops);
  const result = await auth.authenticate(initDataFrom(c));

  if (!result.authorized || !result.user) {
    return c.json({ error: result.reason ?? 'احراز هویت ناموفق بود.' }, 401);
  }

  c.set('user', result.user);
  await next();
}

/** Verifies initData AND that the caller is an active member of :shopId — required for every shop-scoped route. */
export async function requireShopMember(c: Context<AppEnv>, next: Next) {
  const shopId = c.req.param('shopId')!;
  const shops = new ShopRepository(c.env.DB);
  const auth = new MiniAppAuthService(c.env.TELEGRAM_BOT_TOKEN, shops);
  const result = await auth.authorizeForShop(initDataFrom(c), shopId);

  if (!result.authorized || !result.user || !result.role) {
    return c.json({ error: result.reason ?? 'دسترسی به این فروشگاه مجاز نیست.' }, 403);
  }

  c.set('user', result.user);
  c.set('role', result.role);
  await next();
}

/** Guards owner-only actions (invite members, manage subscription) within an already shop-scoped route. */
export async function requireOwner(c: Context<AppEnv>, next: Next) {
  if (c.get('role') !== 'OWNER') {
    return c.json({ error: 'فقط مالک فروشگاه به این بخش دسترسی دارد.' }, 403);
  }
  await next();
}
