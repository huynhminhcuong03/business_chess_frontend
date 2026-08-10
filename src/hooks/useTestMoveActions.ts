import type { Dispatch, SetStateAction } from 'react';
import { gameAPI } from '../services/gameAPI';
import type { GameCard } from '../types/card';
import type { LastMoveResult } from '../types/game';
import type {
    LandedPropertyResponse,
    RollDiceResponse,
} from '../types/gameApi';
import type { GamePlayerResponse } from '../types/playerApi';
import type {
    ResolvedMove,
    TestMoveOptions,
    TestRollOptions,
} from '../types/boardFlow';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { toResolvedMoveFromRoll } from '../utils/boardMoveMappers';
import type { ToastKind } from './useToastNotifications';

interface UseTestMoveActionsOptions {
    boardCellCount: number;
    currentGamePlayer: GamePlayerResponse | null;
    gameId: number;
    handleResolvedMove: (move: ResolvedMove) => Promise<void>;
    handleTripleDoubleJailMove: (
        result: RollDiceResponse,
    ) => Promise<void>;
    isPlayerMoving: boolean;
    isRollingDice: boolean;
    isWaitingForAction: boolean;
    setDrawnCard: Dispatch<SetStateAction<GameCard | null>>;
    setErrorMessage: Dispatch<SetStateAction<string | null>>;
    setIsRollingDice: Dispatch<SetStateAction<boolean>>;
    setIsWaitingForAction: Dispatch<SetStateAction<boolean>>;
    setLandedPropertyInfo: Dispatch<
        SetStateAction<LandedPropertyResponse | null>
    >;
    setLastMoveResult: Dispatch<
        SetStateAction<LastMoveResult | null>
    >;
    setPendingNextPlayerId: Dispatch<
        SetStateAction<number | null>
    >;
    showToast: (message: string, kind?: ToastKind) => void;
}

export function useTestMoveActions({
    boardCellCount,
    currentGamePlayer,
    gameId,
    handleResolvedMove,
    handleTripleDoubleJailMove,
    isPlayerMoving,
    isRollingDice,
    isWaitingForAction,
    setDrawnCard,
    setErrorMessage,
    setIsRollingDice,
    setIsWaitingForAction,
    setLandedPropertyInfo,
    setLastMoveResult,
    setPendingNextPlayerId,
    showToast,
}: UseTestMoveActionsOptions) {
    async function handleTestMoveToCell({
        targetPosition,
        rentDiceTotal,
    }: TestMoveOptions): Promise<void> {
        if (
            boardCellCount === 0 ||
            !currentGamePlayer ||
            currentGamePlayer.inJail ||
            isPlayerMoving ||
            isRollingDice ||
            isWaitingForAction
        ) {
            return;
        }

        setIsRollingDice(true);
        setErrorMessage(null);
        setIsWaitingForAction(false);
        setDrawnCard(null);
        setLastMoveResult(null);
        setLandedPropertyInfo(null);
        setPendingNextPlayerId(null);

        try {
            const testMoveResult = await gameAPI.testMove(
                gameId,
                currentGamePlayer.id,
                {
                    targetPosition,
                    diceTotal: rentDiceTotal,
                },
            );

            await handleResolvedMove({
                ...toResolvedMoveFromRoll(testMoveResult),
                rentDiceTotal,
            });
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể test bước đi. Backend cần hỗ trợ API test-move.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
            setIsRollingDice(false);
        }
    }

    async function handleTestRollDice({
        dice1,
        dice2,
    }: TestRollOptions): Promise<void> {
        if (
            boardCellCount === 0 ||
            !currentGamePlayer ||
            currentGamePlayer.inJail ||
            isPlayerMoving ||
            isRollingDice ||
            isWaitingForAction
        ) {
            return;
        }

        setIsRollingDice(true);
        setErrorMessage(null);
        setIsWaitingForAction(false);
        setDrawnCard(null);
        setLastMoveResult(null);
        setLandedPropertyInfo(null);
        setPendingNextPlayerId(null);

        try {
            const testRollResult = await gameAPI.testRoll(
                gameId,
                currentGamePlayer.id,
                {
                    dice1,
                    dice2,
                },
            );

            if (testRollResult.sentToJail) {
                await handleTripleDoubleJailMove(
                    testRollResult,
                );
                return;
            }

            await handleResolvedMove(
                toResolvedMoveFromRoll(testRollResult),
            );
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể test xúc xắc.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
            setIsRollingDice(false);
        }
    }

    return {
        handleTestMoveToCell,
        handleTestRollDice,
    };
}
