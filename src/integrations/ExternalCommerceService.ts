export interface IncomingExternalMessage {
  source: 'INSTAGRAM' | 'OTHER';
  message: string;
  userId: number;
  shopId: string;
  isValidated: boolean;
}

export interface PotentialOrderResult {
  success: boolean;
  potentialOrder?: {
    source: string;
    message: string;
    userId: number;
    shopId: string;
  };
  reason?: string;
}

export class ExternalCommerceService {
  processIncomingMessage(input: IncomingExternalMessage): PotentialOrderResult {
    if (!input.isValidated) {
      return {
        success: false,
        reason: 'External message must be validated before a potential order is created.',
      };
    }

    return {
      success: true,
      potentialOrder: {
        source: input.source,
        message: input.message,
        userId: input.userId,
        shopId: input.shopId,
      },
    };
  }
}
