import type { Dispatch, SetStateAction } from 'react';
import { gameAPI } from '../services/gameAPI';
import type {
    LandCellResponse,
    LandedPropertyResponse,
    PayRentResponse,
} from '../types/gameApi';
import type { LastMoveResult } from '../types/game';
import type { GamePlayerResponse } from '../types/playerApi';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import {
    updateRentOwnerMoney,
    updateRentPayerMoney,
} from '../utils/playerStateUpdates';
import { getGamePlayerName } from './useCurrentPlayerInfo';
import type { ToastKind } from './useToastNotifications';

interface UseRentPaymentActionOptions {
    gameId: number;
    gamePlayers: GamePlayerResponse[];
    playRentTransferAnimation: (
        rentPayment: PayRentResponse,
    ) => Promise<void>;
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

export function useRentPaymentAction({
    gameId,
    gamePlayers,
    playRentTransferAnimation,
    setCurrentPlayerId,
    setDiceResetCount,
    setErrorMessage,
    setGamePlayers,
    setIsWaitingForAction,
    setLandedPropertyInfo,
    setLastMoveResult,
    setPendingNextPlayerId,
    showToast,
}: UseRentPaymentActionOptions) {
    async function handlePayRentAfterLand(
        payerGamePlayerId: number,
        nextPlayerId: number,
        landResult: LandCellResponse,
        diceTotal: number,
    ): Promise<void> {
        try {
            const rentPayment = await gameAPI.payRent(
                gameId,
                payerGamePlayerId,
                {
                    diceTotal,
                },
            );

            setGamePlayers((previousPlayers) =>
                updateRentPayerMoney(
                    previousPlayers,
                    rentPayment,
                ),
            );
            await playRentTransferAnimation(rentPayment);
            setGamePlayers((previousPlayers) =>
                updateRentOwnerMoney(
                    previousPlayers,
                    rentPayment,
                ),
            );
            setLastMoveResult({
                playerName: getGamePlayerName(
                    gamePlayers,
                    payerGamePlayerId,
                ),
                cellId: landResult.cellId,
                cellPosition: landResult.cellPosition,
                cellName: landResult.cellName,
                cellType: landResult.cellType,
                action: landResult.action,
                rentPayment: {
                    payerName: getGamePlayerName(
                        gamePlayers,
                        rentPayment.payerGamePlayerId,
                    ),
                    ownerName: getGamePlayerName(
                        gamePlayers,
                        rentPayment.ownerGamePlayerId,
                    ),
                    propertyName:
                        rentPayment.boardCellName,
                    amountDue: rentPayment.rentAmount,
                    amountPaid: rentPayment.rentAmount,
                },
            });
            setLandedPropertyInfo(null);
            setIsWaitingForAction(false);
            setCurrentPlayerId(nextPlayerId);
            setPendingNextPlayerId(null);
            setDiceResetCount((currentCount) => currentCount + 1);
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể trả tiền thuê.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
            setCurrentPlayerId(nextPlayerId);
            setPendingNextPlayerId(null);
            setDiceResetCount((currentCount) => currentCount + 1);
        }
    }

    return {
        handlePayRentAfterLand,
    };
}
