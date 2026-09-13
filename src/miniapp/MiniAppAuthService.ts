import { verifyInitData, TelegramInitDataUser } from './verifyInitData.js';
import { ShopRepository } from '../infrastructure/db/repositories/ShopRepository.js';
import { MemberRole } from '../domain/shop/ShopMember.js';

export interface MiniAppAuthResult {
  authorized: boolean;
  user?: TelegramInitDataUser;
  reason?: string;
}

export interface ShopAuthResult {
  authorized: boolean;
  user?: TelegramInitDataUser;
  role?: MemberRole;
  reason?: string;
}

/**
 * Verifies the Telegram WebApp initData and, when a shopId is given, confirms server-side
 * that the caller is an active member of that shop. Callers must never trust a
 * client-supplied shopId without this check (see architecture-proposal.md §9).
 */
export class MiniAppAuthService {
  constructor(
    private readonly botToken: string,
    private readonly shops: ShopRepository
  ) {}

  async authenticate(initData: string): Promise<MiniAppAuthResult> {
    const result = await verifyInitData(initData, this.botToken);
    if (!result.valid) {
      return { authorized: false, reason: result.reason };
    }
    return { authorized: true, user: result.data.user };
  }

  async authorizeForShop(initData: string, shopId: string): Promise<ShopAuthResult> {
    const auth = await this.authenticate(initData);
    if (!auth.authorized || !auth.user) {
      return { authorized: false, reason: auth.reason };
    }

    const membership = await this.shops.getMembership(shopId, auth.user.id);
    if (!membership) {
      return { authorized: false, user: auth.user, reason: 'کاربر عضو این فروشگاه نیست.' };
    }

    return { authorized: true, user: auth.user, role: membership.role };
  }
}
