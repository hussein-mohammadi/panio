export class InstagramProvider {
    parseMessage(input) {
        if (!input.text || !input.userId) {
            return { valid: false, reason: 'Invalid Instagram message payload.' };
        }
        return {
            valid: true,
            parsedText: input.text,
        };
    }
}
//# sourceMappingURL=InstagramProvider.js.map