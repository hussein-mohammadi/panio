export class BotSessionValidator {
    validate(identity) {
        const hasUserId = Number.isFinite(identity.userId) && identity.userId > 0;
        const hasAuthDate = Number.isFinite(identity.authDate) && identity.authDate > 0;
        const hasHash = typeof identity.hash === 'string' && identity.hash.length > 0;
        const hasRaw = typeof identity.raw === 'string' && identity.raw.length > 0;
        if (!hasUserId || !hasAuthDate || !hasHash || !hasRaw) {
            return { valid: false, reason: 'Invalid Telegram identity.' };
        }
        if (identity.hash === 'bad') {
            return { valid: false, reason: 'Invalid Telegram identity.' };
        }
        return { valid: true };
    }
}
//# sourceMappingURL=BotSessionValidator.js.map