import type { Dispatch, SetStateAction } from 'react';
import { gameAPI } from '../services/gameAPI';
import type { LastMoveResult } from '../types/game';
import type {
    IncomeTaxOption,
    LandCellResponse,
    LandedPropertyResponse,
    PayTaxResponse,
} from '../types/gameApi';
import type { GamePlayerResponse } from '../types/playerApi';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { updatePlayerMoneyAfterTax as applyPlayerMoneyAfterTax } from '../utils/playerStateUpdates';
import { getGamePlayerName } from './useCurrentPlayerInfo';
import type { ToastKind } from './useToastNotifications';

interface UseTaxPaymentActionOptions {
    currentGamePlayer: GamePlayerResponse | null;
    gameId: number;
    gamePlayers: GamePlayerResponse[];
    lastMoveResult: LastMoveResult | null;
    pendingNextPlayerId: number | null;
    setCurrentPlayerId: Dispatch<SetStateAction<number | null>>;
    setDiceResetCount: Dispatch<SetStateAction<number>>;
    setErrorMessage: Dispatch<SetStateAction<string | null>>;
    setGamePlayers: Dispatch<
        SetStateAction<GamePlayerResponse[]>
    >;
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

function formatTaxAmount(taxPayment: PayTaxResponse): string {
    return taxPayment.taxAmount.toLocaleString('en-US');
}

export function useTaxPaymentAction({
    currentGamePlayer,
    gameId,
    gamePlayers,
    lastMoveResult,
    pendingNextPlayerId,
    setCurrentPlayerId,
    setDiceResetCount,
    setErrorMessage,
    setGamePlayers,
    setIsWaitingForAction,
    setLandedPropertyInfo,
    setLastMoveResult,
    setPendingNextPlayerId,
    showToast,
}: UseTaxPaymentActionOptions) {
    async function handlePayTaxAfterLand(
        gamePlayerId: number,
        nextPlayerId: number,
        landResult: LandCellResponse,
        request: { incomeTaxOption?: IncomeTaxOption },
    ): Promise<void> {
        try {
            const taxPayment = await gameAPI.payTax(
                gameId,
                gamePlayerId,
                request,
            );

            setGamePlayers((previousPlayers) =>
                applyPlayerMoneyAfterTax(
                    previousPlayers,
                    gamePlayerId,
                    taxPayment,
                ),
            );
            setLastMoveResult({
                playerName: getGamePlayerName(
                    gamePlayers,
                    gamePlayerId,
                ),
                cellId: landResult.cellId,
                cellPosition: landResult.cellPosition,
                cellName: landResult.cellName,
                cellType: landResult.cellType,
                action: landResult.action,
                taxPaid: taxPayment.taxAmount,
            });
            setLandedPropertyInfo(null);
            setIsWaitingForAction(false);
            setCurrentPlayerId(nextPlayerId);
            setPendingNextPlayerId(null);
            setDiceResetCount((currentCount) => currentCount + 1);
            showToast(
                `Đã đóng thuế ${formatTaxAmount(taxPayment)}$.`,
                'success',
            );
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể đóng thuế.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
            setCurrentPlayerId(nextPlayerId);
            setPendingNextPlayerId(null);
            setDiceResetCount((currentCount) => currentCount + 1);
        }
    }

    async function handlePayIncomeTax(
        incomeTaxOption: IncomeTaxOption,
    ): Promise<void> {
        if (!currentGamePlayer || !lastMoveResult) {
            return;
        }

        await handlePayTaxAfterLand(
            currentGamePlayer.id,
            pendingNextPlayerId ?? currentGamePlayer.id,
            {
                cellId: lastMoveResult.cellId,
                cellPosition: lastMoveResult.cellPosition,
                cellName: lastMoveResult.cellName,
                cellType: lastMoveResult.cellType,
                action: lastMoveResult.action,
                property: null,
            },
            {
                incomeTaxOption,
            },
        );
    }

    function handlePayFixedIncomeTax(): void {
        void handlePayIncomeTax('FIXED');
    }

    function handlePayPercentIncomeTax(): void {
        void handlePayIncomeTax('PERCENT');
    }

    return {
        handlePayFixedIncomeTax,
        handlePayPercentIncomeTax,
        handlePayTaxAfterLand,
    };
}
