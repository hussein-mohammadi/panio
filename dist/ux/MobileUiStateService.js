export class MobileUiStateService {
    createLoadingState(input) {
        return {
            loading: true,
            screen: input.screen,
            message: input.message,
        };
    }
    createEmptyState(input) {
        return {
            empty: true,
            screen: input.screen,
            title: input.title,
            actionLabel: input.actionLabel,
        };
    }
    createConfirmationState(input) {
        return {
            confirmationVisible: true,
            title: input.title,
            confirmLabel: input.confirmLabel,
            cancelLabel: input.cancelLabel,
        };
    }
}
//# sourceMappingURL=MobileUiStateService.js.map