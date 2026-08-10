import type { Dispatch, SetStateAction } from 'react';
import type { BoardCell as BoardCellData } from '../types/boardCell';
import type { GameCard } from '../types/card';
import type { LastMoveResult } from '../types/game';
import type {
    JailActionResponse,
    JailActionType,
    LandedPropertyResponse,
    RollDiceResponse,
} from '../types/gameApi';
import type { GamePlayerResponse } from '../types/playerApi';
import type {
    ResolvedMove,
    SelectedJailAction,
} from '../types/boardFlow';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { toResolvedMoveFromJailAction } from '../utils/boardMoveMappers';
import {
    updatePlayerAfterJailAction as applyPlayerAfterJailAction,
    updateTripleDoubleJailedPlayer,
} from '../utils/playerStateUpdates';
import { getGamePlayerName } from './useCurrentPlayerInfo';
import type { ToastKind } from './useToastNotifications';

interface UseJailActionsOptions {
    boardCells: BoardCellData[];
    currentGamePlayer: GamePlayerResponse | null;
    gamePlayers: GamePlayerResponse[];
    handleResolvedMove: (move: ResolvedMove) => Promise<void>;
    isPlayerMoving: boolean;
    isRollingDice: boolean;
    isWaitingForAction: boolean;
    playJailMoveAnimation: (
        player: GamePlayerResponse,
        fromPosition: number,
        jailPosition: number,
    ) => Promise<void>;
    playBankTransferAnimation: (
        gamePlayerId: number,
        moneyDelta: number,
    ) => Promise<void>;
    setCurrentPlayerId: Dispatch<SetStateAction<number | null>>;
    setDiceResetCount: Dispatch<SetStateAction<number>>;
    setDrawnCard: Dispatch<SetStateAction<GameCard | null>>;
    setErrorMessage: Dispatch<SetStateAction<string | null>>;
    setGamePlayers: Dispatch<
        SetStateAction<GamePlayerResponse[]>
    >;
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
    setSelectedJailAction: Dispatch<
        SetStateAction<SelectedJailAction | null>
    >;
    showToast: (message: string, kind?: ToastKind) => void;
}

export function useJailActions({
    boardCells,
    currentGamePlayer,
    gamePlayers,
    handleResolvedMove,
    isPlayerMoving,
    isRollingDice,
    isWaitingForAction,
    playJailMoveAnimation,
    playBankTransferAnimation,
    setCurrentPlayerId,
    setDiceResetCount,
    setDrawnCard,
    setErrorMessage,
    setGamePlayers,
    setIsRollingDice,
    setIsWaitingForAction,
    setLandedPropertyInfo,
    setLastMoveResult,
    setPendingNextPlayerId,
    setSelectedJailAction,
    showToast,
}: UseJailActionsOptions) {
    async function handleTripleDoubleJailMove(
        result: RollDiceResponse,
    ): Promise<void> {
        const jailPosition =
            result.jailPosition ?? result.newPosition;
        const player = gamePlayers.find(
            (gamePlayer) =>
                gamePlayer.id === result.currentPlayerId,
        );
        const jailCell = boardCells[jailPosition];

        if (player) {
            await playJailMoveAnimation(
                player,
                result.oldPosition,
                jailPosition,
            );
        }

        setGamePlayers((previousPlayers) =>
            updateTripleDoubleJailedPlayer(
                previousPlayers,
                result,
                jailPosition,
            ),
        );
        setLastMoveResult({
            playerName: getGamePlayerName(
                gamePlayers,
                result.currentPlayerId,
            ),
            cellId: jailCell?.id ?? 0,
            cellPosition: jailPosition,
            cellName: jailCell?.name ?? 'Ở tù',
            cellType: jailCell?.type ?? 'JAIL',
            action: 'GO_TO_JAIL',
            jailMove: {
                playerName: getGamePlayerName(
                    gamePlayers,
                    result.currentPlayerId,
                ),
            },
        });
        setLandedPropertyInfo(null);
        setDrawnCard(null);
        setIsWaitingForAction(false);
        setPendingNextPlayerId(null);
        setSelectedJailAction(null);
        setCurrentPlayerId(result.nextPlayerId);
        setDiceResetCount((currentCount) => currentCount + 1);
        showToast(
            `${getGamePlayerName(
                gamePlayers,
                result.currentPlayerId,
            )} đổ đôi 3 lần liên tiếp nên bị đưa vào tù.`,
            'info',
        );
        setIsRollingDice(false);
    }

    function handleJailAction(
        actionType: JailActionType,
    ): void {
        if (
            boardCells.length === 0 ||
            !currentGamePlayer ||
            !currentGamePlayer.inJail ||
            isPlayerMoving ||
            isRollingDice ||
            isWaitingForAction
        ) {
            return;
        }

        setErrorMessage(null);
        setDrawnCard(null);
        setLastMoveResult(null);
        setLandedPropertyInfo(null);
        setPendingNextPlayerId(null);
        setSelectedJailAction({
            playerId: currentGamePlayer.id,
            actionType,
        });
        setDiceResetCount((currentCount) => currentCount + 1);
    }

    async function handleJailActionRollComplete(
        jailAction: JailActionResponse,
    ): Promise<void> {
        try {
            if ((jailAction.finePaid ?? 0) > 0) {
                await playBankTransferAnimation(
                    jailAction.currentPlayerId,
                    -jailAction.finePaid,
                );
            }

            setGamePlayers((previousPlayers) =>
                applyPlayerAfterJailAction(
                    previousPlayers,
                    jailAction,
                ),
            );
            setSelectedJailAction(null);

            if (!jailAction.moved) {
                showToast(
                    'Chưa ra đôi, vẫn ở tù.',
                    'info',
                );
                setCurrentPlayerId(jailAction.nextPlayerId);
                setDiceResetCount(
                    (currentCount) => currentCount + 1,
                );
                setIsRollingDice(false);
                return;
            }

            if ((jailAction.finePaid ?? 0) > 0) {
                showToast('Đã trả 50$ để ra tù.', 'info');
            } else if (
                jailAction.actionType === 'USE_JAIL_CARD'
            ) {
                showToast('Đã dùng thẻ ra tù.', 'info');
            } else if (
                jailAction.actionType === 'ROLL_FOR_DOUBLE' &&
                jailAction.isDouble
            ) {
                showToast(
                    'Ra số đôi, được ra tù và di chuyển.',
                    'success',
                );
            }

            await handleResolvedMove(
                toResolvedMoveFromJailAction(jailAction),
            );
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể xử lý lựa chọn ra tù.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setIsRollingDice(false);
        }
    }

    return {
        handleJailAction,
        handleJailActionRollComplete,
        handleTripleDoubleJailMove,
    };
}
