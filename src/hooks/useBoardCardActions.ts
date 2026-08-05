import type { Dispatch, SetStateAction } from 'react';
import { gameAPI } from '../services/gameAPI';
import type { GameCard } from '../types/card';
import type { DrawCardResponse } from '../types/gameApi';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import type { ToastKind } from './useToastNotifications';

interface UseBoardCardActionsOptions {
    currentGamePlayerId: number | null;
    finishPendingTurn: () => void;
    gameId: number;
    setDrawnCard: Dispatch<SetStateAction<GameCard | null>>;
    setPendingCardResult: Dispatch<
        SetStateAction<DrawCardResponse | null>
    >;
    setErrorMessage: Dispatch<SetStateAction<string | null>>;
    setIsWaitingForAction: Dispatch<SetStateAction<boolean>>;
    showToast: (message: string, kind?: ToastKind) => void;
}

export function useBoardCardActions({
    currentGamePlayerId,
    finishPendingTurn,
    gameId,
    setDrawnCard,
    setPendingCardResult,
    setErrorMessage,
    setIsWaitingForAction,
    showToast,
}: UseBoardCardActionsOptions) {
    async function drawCard(fallbackMessage: string): Promise<void> {
        setErrorMessage(null);

        if (currentGamePlayerId === null) {
            setErrorMessage(fallbackMessage);
            showToast(fallbackMessage, 'error');
            return;
        }

        try {
            const cardResult = await gameAPI.drawCard(
                gameId,
                currentGamePlayerId,
            );

            setPendingCardResult(cardResult);
            setDrawnCard({
                ...cardResult.card,
                type: cardResult.cardType,
            });
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                fallbackMessage,
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
            finishPendingTurn();
        }
    }

    async function handleDrawChanceCard(): Promise<void> {
        await drawCard('Không thể rút thẻ Cơ hội.');
    }

    async function handleDrawCommunityCard(): Promise<void> {
        await drawCard('Không thể rút thẻ Khí vận.');
    }

    return {
        handleDrawChanceCard,
        handleDrawCommunityCard,
    };
}
