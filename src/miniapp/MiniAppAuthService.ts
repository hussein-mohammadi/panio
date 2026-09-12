export interface MiniAppAuthInput {
  telegramUserId: number;
  shopId: string;
  initData: string;
  isTrusted: boolean;
}

export interface MiniAppAuthResult {
  authorized: boolean;
  shopId?: string;
  reason?: string;
}

export class MiniAppAuthService {
  authorize(input: MiniAppAuthInput): MiniAppAuthResult {
    const hasUser = Number.isFinite(input.telegramUserId) && input.telegramUserId > 0;
    const hasShop = typeof input.shopId === 'string' && input.shopId.length > 0;
    const hasInitData = typeof input.initData === 'string' && input.initData.length > 0;

    if (!hasUser || !hasShop || !hasInitData || !input.isTrusted) {
      return {
        authorized: false,
        reason: 'Unauthorized Mini App request.',
      };
    }

    return {
      authorized: true,
      shopId: input.shopId,
    };
  }
}
