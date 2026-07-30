import { useEffect, useState } from 'react';
import useBoardGame from '../../hooks/useBoardGame';
import { ApiRequestError } from '../../services/axiosClient';
import { boardAPI } from '../../services/boardAPI';
import type { ApiResponse } from '../../types/api';
import type { BoardCell as BoardCellData } from '../../types/boardCell';
import DebugMovePanel from '../game/DebugMovePanel';
import PlayerLayer from '../player/PlayerLayer';
import PlayerMoneyLayer from '../player/PlayerMoneyLayer';
import PropertyOwnershipLayer from '../property/PropertyOwnershipLayer';
import BoardCenter from './BoardCenter';
import BoardGrid from './BoardGrid';
import GameStatusPanel from './GameStatusPanel';

function sortBoardCells(cells: BoardCellData[]): BoardCellData[] {
    return [...cells].sort(
        (firstCell, secondCell) =>
            firstCell.position - secondCell.position,
    );
}

function getBoardErrorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
        const responseBody =
            error.responseBody as Partial<
                ApiResponse<unknown>
            > | null;

        return (
            responseBody?.message ??
            (error.status === 404
                ? 'Board not found'
                : 'Khong the tai du lieu ban co.')
        );
    }

    return 'Khong the tai du lieu ban co.';
}

function Board() {
    const [boardCells, setBoardCells] =
        useState<BoardCellData[]>([]);
    const [isLoadingBoard, setIsLoadingBoard] =
        useState(true);
    const [boardError, setBoardError] =
        useState<string | null>(null);

    const {
        players,
        currentPlayer,
        isPlayerMoving,
        isWaitingForAction,
        lastMoveResult,
        propertyOwnerships,
        drawnCard,
        landedCell,
        landedPropertyOwnership,
        landedImprovementPrice,
        landedRentAfterImprovement,
        canAffordProperty,
        canAffordPropertyImprovement,
        debugMoveCurrentPlayer,
        handleRollDice,
        handleBuyProperty,
        handleSkipProperty,
        handleBuildProperty,
        handleSkipBuildProperty,
        handleMortgageProperty,
        handleRedeemProperty,
        handleUseJailFreeCard,
        handleSkipJailFreeCard,
        handleDrawChanceCard,
        handleDrawCommunityCard,
        handleExecuteCard,
    } = useBoardGame(boardCells);

    useEffect(() => {
        async function fetchBoardCells(): Promise<void> {
            setIsLoadingBoard(true);
            setBoardError(null);

            try {
                const cells =
                    await boardAPI.getBoardCells();
                setBoardCells(sortBoardCells(cells));
            } catch (error) {
                setBoardCells([]);
                setBoardError(getBoardErrorMessage(error));
            } finally {
                setIsLoadingBoard(false);
            }
        }

        void fetchBoardCells();
    }, []);

    if (!currentPlayer) {
        return null;
    }

    const hasBoardCells = boardCells.length > 0;

    return (
        <div className="board-shell relative flex items-center justify-center">
            <div className="board-frame relative aspect-square">
                <BoardGrid boardCells={boardCells}>
                    <BoardCenter
                        onRoll={handleRollDice}
                        onBuyProperty={handleBuyProperty}
                        onSkipProperty={handleSkipProperty}
                        onBuildProperty={
                            handleBuildProperty
                        }
                        onSkipBuildProperty={
                            handleSkipBuildProperty
                        }
                        onDrawChanceCard={
                            handleDrawChanceCard
                        }
                        onDrawCommunityCard={
                            handleDrawCommunityCard
                        }
                        onExecuteCard={handleExecuteCard}
                        onUseJailFreeCard={
                            handleUseJailFreeCard
                        }
                        onSkipJailFreeCard={
                            handleSkipJailFreeCard
                        }
                        isPlayerMoving={isPlayerMoving}
                        isWaitingForAction={
                            isWaitingForAction
                        }
                        currentPlayerName={
                            currentPlayer.name
                        }
                        currentPlayerInJail={
                            currentPlayer.isInJail ?? false
                        }
                        currentPlayerJailFreeCardCount={
                            currentPlayer.jailFreeCardCount ??
                            0
                        }
                        landedProperty={landedCell}
                        landedPropertyOwnership={
                            landedPropertyOwnership
                        }
                        landedImprovementPrice={
                            landedImprovementPrice
                        }
                        landedRentAfterImprovement={
                            landedRentAfterImprovement
                        }
                        canAffordProperty={
                            canAffordProperty
                        }
                        canAffordPropertyImprovement={
                            canAffordPropertyImprovement
                        }
                        lastMoveResult={lastMoveResult}
                        drawnCard={drawnCard}
                    />

                    {import.meta.env.DEV && (
                        <DebugMovePanel
                            onMove={debugMoveCurrentPlayer}
                            disabled={
                                isPlayerMoving ||
                                isWaitingForAction ||
                                !hasBoardCells
                            }
                        />
                    )}
                </BoardGrid>

                {isLoadingBoard && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 text-sm font-bold text-slate-700">
                        Dang tai ban co...
                    </div>
                )}

                {!isLoadingBoard && boardError && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 px-6 text-center text-sm font-bold text-red-600">
                        {boardError}
                    </div>
                )}

                {!isLoadingBoard &&
                    !boardError &&
                    !hasBoardCells && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 text-sm font-bold text-slate-700">
                        Khong co du lieu o ban co.
                    </div>
                )}

                <PropertyOwnershipLayer
                    propertyOwnerships={
                        propertyOwnerships
                    }
                    players={players}
                    boardCells={boardCells}
                />

                <PlayerLayer players={players} />
            </div>

            <PlayerMoneyLayer
                players={players}
                currentPlayerId={currentPlayer.id}
                propertyOwnerships={propertyOwnerships}
                boardCells={boardCells}
                onMortgageProperty={
                    handleMortgageProperty
                }
                onRedeemProperty={handleRedeemProperty}
            />

            <div className="game-status-panel fixed z-30">
                <GameStatusPanel
                    currentPlayerName={currentPlayer.name}
                    isPlayerMoving={isPlayerMoving}
                    isWaitingForAction={
                        isWaitingForAction
                    }
                    lastMoveResult={lastMoveResult}
                />
            </div>
        </div>
    );
}

export default Board;
