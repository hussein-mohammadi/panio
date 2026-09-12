import { describe, expect, it } from 'vitest';
import { MobileUiStateService } from '../src/ux/MobileUiStateService.js';
describe('Phase 6 UX polish', () => {
    it('builds a loading state for a mobile screen', () => {
        const ui = new MobileUiStateService();
        const state = ui.createLoadingState({ screen: 'Orders', message: 'در حال بارگذاری سفارش‌ها' });
        expect(state.loading).toBe(true);
        expect(state.screen).toBe('Orders');
        expect(state.message).toBe('در حال بارگذاری سفارش‌ها');
    });
    it('builds an empty state for an empty product list', () => {
        const ui = new MobileUiStateService();
        const state = ui.createEmptyState({
            screen: 'Products',
            title: 'محصولی وجود ندارد',
            actionLabel: 'افزودن محصول',
        });
        expect(state.empty).toBe(true);
        expect(state.title).toBe('محصولی وجود ندارد');
        expect(state.actionLabel).toBe('افزودن محصول');
    });
    it('creates a confirmation state for destructive actions', () => {
        const ui = new MobileUiStateService();
        const state = ui.createConfirmationState({
            title: 'حذف سفارش؟',
            confirmLabel: 'تأیید',
            cancelLabel: 'لغو',
        });
        expect(state.confirmationVisible).toBe(true);
        expect(state.title).toBe('حذف سفارش؟');
        expect(state.confirmLabel).toBe('تأیید');
    });
});
//# sourceMappingURL=phase6-ux.test.js.map