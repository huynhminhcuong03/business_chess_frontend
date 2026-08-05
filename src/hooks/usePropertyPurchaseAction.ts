import type { Dispatch, SetStateAction } from 'react';
import { gameAPI } from '../services/gameAPI';
import type { BoardCell as BoardCellData } from '../types/boardCell';
import type { OwnedPropertyCard } from '../types/game';
import type { GamePlayerResponse } from '../types/playerApi';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { toOwnedPropertyCardFromBuy } from '../utils/boardPropertyCards';
import type { ToastKind } from './useToastNotifications';

interface UsePropertyPurchaseActionOptions {
    clearPendingAction: () => void;
    currentGamePlayer: GamePlayerResponse | null;
    gameId: number;
    landedCell: BoardCellData | null;
    setErrorMessage: Dispatch<SetStateAction<string | null>>;
    setGamePlayers: Dispatch<
        SetStateAction<GamePlayerResponse[]>
    >;
    setOwnedProperties: Dispatch<
        SetStateAction<OwnedPropertyCard[]>
    >;
    showToast: (message: string, kind?: ToastKind) => void;
}

export function usePropertyPurchaseAction({
    clearPendingAction,
    currentGamePlayer,
    gameId,
    landedCell,
    setErrorMessage,
    setGamePlayers,
    setOwnedProperties,
    showToast,
}: UsePropertyPurchaseActionOptions) {
    async function handleBuyProperty(): Promise<void> {
        if (!currentGamePlayer || !landedCell) {
            return;
        }

        setErrorMessage(null);

        try {
            const boughtProperty =
                await gameAPI.buyProperty(
                    gameId,
                    currentGamePlayer.id,
                    landedCell.id,
                );

            setGamePlayers((previousPlayers) =>
                previousPlayers.map((player) =>
                    player.id ===
                    boughtProperty.ownerGamePlayerId
                        ? {
                              ...player,
                              money: boughtProperty.ownerMoney,
                          }
                        : player,
                ),
            );
            setOwnedProperties((previousProperties) => [
                ...previousProperties.filter(
                    (property) =>
                        property.boardCellId !==
                        boughtProperty.boardCellId,
                ),
                toOwnedPropertyCardFromBuy(
                    boughtProperty,
                    landedCell,
                ),
            ]);
            showToast('Mua tài sản thành công.', 'success');
            clearPendingAction();
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể mua tài sản.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
        }
    }

    return {
        handleBuyProperty,
    };
}
