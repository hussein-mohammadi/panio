export class TelegramStarsProvider {
    verifyCallback(input) {
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
//# sourceMappingURL=TelegramStarsProvider.js.map