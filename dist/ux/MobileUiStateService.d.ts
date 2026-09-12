export interface LoadingStateInput {
    screen: string;
    message: string;
}
export interface EmptyStateInput {
    screen: string;
    title: string;
    actionLabel: string;
}
export interface ConfirmationStateInput {
    title: string;
    confirmLabel: string;
    cancelLabel: string;
}
export interface LoadingState {
    loading: boolean;
    screen: string;
    message: string;
}
export interface EmptyState {
    empty: boolean;
    screen: string;
    title: string;
    actionLabel: string;
}
export interface ConfirmationState {
    confirmationVisible: boolean;
    title: string;
    confirmLabel: string;
    cancelLabel: string;
}
export declare class MobileUiStateService {
    createLoadingState(input: LoadingStateInput): LoadingState;
    createEmptyState(input: EmptyStateInput): EmptyState;
    createConfirmationState(input: ConfirmationStateInput): ConfirmationState;
}
