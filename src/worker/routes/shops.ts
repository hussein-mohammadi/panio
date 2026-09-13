import { Hono } from 'hono';
import { AppEnv, requireAuth, requireShopMember, requireOwner } from '../middleware/auth.js';
import { ShopRepository } from '../../infrastructure/db/repositories/ShopRepository.js';
import { InvitationRepository } from '../../infrastructure/db/repositories/InvitationRepository.js';
import { startTrialSubscription } from '../bot.js';
import { readJsonBody } from '../jsonBody.js';

export const shopsRouter = new Hono<AppEnv>();

shopsRouter.get('/me', requireAuth, async (c) => {
  const shops = new ShopRepository(c.env.DB);
  const user = c.get('user');
  const memberships = await shops.listShopsForUser(user.id);
  return c.json({
    user,
    shops: memberships.map((m) => ({ id: m.shop.id, name: m.shop.name, status: m.shop.status, role: m.member.role })),
  });
});

shopsRouter.post('/', requireAuth, async (c) => {
  const body = await readJsonBody<{ name?: string }>(c.req);
  const name = body.name?.trim();
  if (!name) {
    return c.json({ error: 'نام فروشگاه الزامی است.' }, 400);
  }

  const shops = new ShopRepository(c.env.DB);
  const shop = await shops.createShop({ name, ownerTelegramUserId: c.get('user').id });
  await startTrialSubscription(c.env, shop.id);

  return c.json({ id: shop.id, name: shop.name, status: shop.status }, 201);
});

shopsRouter.post('/join', requireAuth, async (c) => {
  const body = await readJsonBody<{ inviteToken?: string }>(c.req);
  const token = body.inviteToken?.trim();
  if (!token) {
    return c.json({ error: 'کد دعوت الزامی است.' }, 400);
  }

  const invitations = new InvitationRepository(c.env.DB);
  const invitation = await invitations.findValidByToken(token);
  if (!invitation) {
    return c.json({ error: 'کد دعوت نامعتبر یا منقضی شده است.' }, 404);
  }

  const shops = new ShopRepository(c.env.DB);
  await shops.addMember(invitation.shopId, c.get('user').id, 'STAFF');
  await invitations.markUsed(invitation.id);

  const shop = await shops.findById(invitation.shopId);
  return c.json({ id: shop?.id, name: shop?.name });
});

shopsRouter.get('/:shopId', requireShopMember, async (c) => {
  const shops = new ShopRepository(c.env.DB);
  const shop = await shops.findById(c.req.param('shopId')!);
  if (!shop) return c.json({ error: 'فروشگاه یافت نشد.' }, 404);
  return c.json({ id: shop.id, name: shop.name, status: shop.status, role: c.get('role') });
});

shopsRouter.get('/:shopId/members', requireShopMember, async (c) => {
  const shops = new ShopRepository(c.env.DB);
  const members = await shops.listMembers(c.req.param('shopId')!);
  return c.json(members.map((m) => ({ telegramUserId: m.telegramUserId, role: m.role, joinedAt: m.joinedAt })));
});

shopsRouter.post('/:shopId/invitations', requireShopMember, requireOwner, async (c) => {
  const shopId = c.req.param('shopId')!;
  const invitations = new InvitationRepository(c.env.DB);
  const invitation = await invitations.create(shopId, c.get('user').id);
  const link = `https://t.me/${c.env.TELEGRAM_BOT_USERNAME}?start=invite_${invitation.token}`;
  return c.json({ token: invitation.token, link, expiresAt: invitation.expiresAt });
});
