import { useState } from 'react';

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Có lỗi xảy ra khi xử lý hành động.';
}

function useGameActionStatus() {
    const [isSubmittingAction, setIsSubmittingAction] =
        useState(false);
    const [actionError, setActionError] =
        useState<string | null>(null);

    async function runGameAction(
        action: () => void | Promise<void>,
    ): Promise<void> {
        if (isSubmittingAction) {
            return;
        }

        setIsSubmittingAction(true);
        setActionError(null);

        try {
            await action();
        } catch (error) {
            setActionError(getErrorMessage(error));
        } finally {
            setIsSubmittingAction(false);
        }
    }

    function clearActionError(): void {
        setActionError(null);
    }

    return {
        isSubmittingAction,
        actionError,
        runGameAction,
        clearActionError,
    };
}

export default useGameActionStatus;
