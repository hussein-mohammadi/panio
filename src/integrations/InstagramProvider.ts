export interface InstagramMessageInput {
  text: string;
  userId: number;
}

export interface InstagramParsedMessage {
  valid: boolean;
  parsedText?: string;
  reason?: string;
}

export class InstagramProvider {
  parseMessage(input: InstagramMessageInput): InstagramParsedMessage {
    if (!input.text || !input.userId) {
      return { valid: false, reason: 'Invalid Instagram message payload.' };
    }

    return {
      valid: true,
      parsedText: input.text,
    };
  }
}
