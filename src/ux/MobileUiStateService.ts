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

export class MobileUiStateService {
  createLoadingState(input: LoadingStateInput): LoadingState {
    return {
      loading: true,
      screen: input.screen,
      message: input.message,
    };
  }

  createEmptyState(input: EmptyStateInput): EmptyState {
    return {
      empty: true,
      screen: input.screen,
      title: input.title,
      actionLabel: input.actionLabel,
    };
  }

  createConfirmationState(input: ConfirmationStateInput): ConfirmationState {
    return {
      confirmationVisible: true,
      title: input.title,
      confirmLabel: input.confirmLabel,
      cancelLabel: input.cancelLabel,
    };
  }
}
