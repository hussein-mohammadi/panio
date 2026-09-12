export class ExternalCommerceService {
    processIncomingMessage(input) {
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
//# sourceMappingURL=ExternalCommerceService.js.map