export interface TelegramStarsCallbackInput {
  providerTransactionId: string;
  status: string;
  amount: number;
  currency: string;
}

export interface TelegramStarsVerificationResult {
  valid: boolean;
  status?: string;
  reason?: string;
}

export class TelegramStarsProvider {
  verifyCallback(input: TelegramStarsCallbackInput): TelegramStarsVerificationResult {
    if (!input.providerTransactionId || !input.status || !input.amount || !input.currency) {
      return { valid: false, reason: 'Invalid Telegram Stars callback.' };
    }

    if (input.status !== 'paid') {
      return { valid: false, reason: 'Callback not paid.' };
    }

    return {
      valid: true,
      status: input.status,
    };
  }
}
