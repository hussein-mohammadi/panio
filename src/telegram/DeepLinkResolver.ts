export interface DeepLinkInput {
  type: string;
  shopId?: string;
  inviteToken?: string;
  userId?: number;
}

export interface DeepLinkResolution {
  valid: boolean;
  reason?: string;
  shopId?: string;
  flow?: string;
}

export class DeepLinkResolver {
  resolve(input: DeepLinkInput): DeepLinkResolution {
    const hasShopId = typeof input.shopId === 'string' && input.shopId.length > 0;
    const hasInvite = typeof input.inviteToken === 'string' && input.inviteToken.length > 0;
    const hasUser = Number.isFinite(input.userId) && (input.userId as number) > 0;

    if (!hasShopId || !hasInvite || !hasUser) {
      return { valid: false, reason: 'Missing invite token or shop context.' };
    }

    return {
      valid: true,
      shopId: input.shopId,
      flow: input.type,
    };
  }
}
