import { useEffect, useState } from 'react';
import { ApiRequestError } from '../../services/axiosClient';
import { boardAPI } from '../../services/boardAPI';
import { cardAPI } from '../../services/cardAPI';
import type { ApiResponse } from '../../types/api';
import type { BoardResponse } from '../../types/board';
import type { BoardCell as BoardCellData } from '../../types/boardCell';
import type { GameCard } from '../../types/card';
import type {
    CellAction,
    LastMoveResult,
} from '../../types/game';
import BoardCenter from './BoardCenter';
import BoardGrid from './BoardGrid';

const CURRENT_PLAYER_NAME = 'Người chơi 1';

function sortBoardCells(cells: BoardCellData[]): BoardCellData[] {
    return [...cells].sort(
        (firstCell, secondCell) =>
            firstCell.position - secondCell.position,
    );
}

function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    if (error instanceof ApiRequestError) {
        const responseBody =
            error.responseBody as Partial<
                ApiResponse<unknown>
            > | null;

        return responseBody?.message ?? fallbackMessage;
    }

    return fallbackMessage;
}

function getCellAction(cell: BoardCellData): CellAction {
    if (cell.type === 'CHANCE') {
        return 'DRAW_CHANCE_CARD';
    }

    if (cell.type === 'COMMUNITY') {
        return 'DRAW_COMMUNITY_CARD';
    }

    return 'NONE';
}

function Board() {
    const [, setBoard] =
        useState<BoardResponse | null>(null);
    const [boardCells, setBoardCells] =
        useState<BoardCellData[]>([]);
    const [currentPosition, setCurrentPosition] =
        useState(0);
    const [lastMoveResult, setLastMoveResult] =
        useState<LastMoveResult | null>(null);
    const [drawnCard, setDrawnCard] =
        useState<GameCard | null>(null);
    const [isLoadingBoard, setIsLoadingBoard] =
        useState(true);
    const [isWaitingForAction, setIsWaitingForAction] =
        useState(false);
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    useEffect(() => {
        async function fetchBoardData(): Promise<void> {
            setIsLoadingBoard(true);
            setErrorMessage(null);

            try {
                const [boardResponse, cellsResponse] =
                    await Promise.all([
                        boardAPI.getBoard(),
                        boardAPI.getBoardCells(),
                    ]);

                setBoard(boardResponse);
                setBoardCells(sortBoardCells(cellsResponse));
            } catch (error) {
                setBoard(null);
                setBoardCells([]);
                setErrorMessage(
                    getApiErrorMessage(
                        error,
                        'Khong the tai du lieu ban co.',
                    ),
                );
            } finally {
                setIsLoadingBoard(false);
            }
        }

        void fetchBoardData();
    }, []);

    function handleRollDice(totalValue: number): void {
        if (boardCells.length === 0) {
            return;
        }

        const nextPosition =
            (currentPosition + totalValue) %
            boardCells.length;
        const landedCell = boardCells[nextPosition];

        if (!landedCell) {
            return;
        }

        const action = getCellAction(landedCell);

        setCurrentPosition(nextPosition);
        setDrawnCard(null);
        setLastMoveResult({
            playerName: CURRENT_PLAYER_NAME,
            cellId: landedCell.id,
            cellPosition: landedCell.position,
            cellName: landedCell.name,
            cellType: landedCell.type,
            action,
        });
        setIsWaitingForAction(action !== 'NONE');
    }

    async function handleDrawChanceCard(): Promise<void> {
        setErrorMessage(null);

        try {
            const card = await cardAPI.drawChanceCard();
            setDrawnCard({
                ...card,
                type: 'CHANCE',
            });
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    'Khong the rut the Co hoi.',
                ),
            );
            setIsWaitingForAction(false);
        }
    }

    async function handleDrawCommunityCard(): Promise<void> {
        setErrorMessage(null);

        try {
            const card = await cardAPI.drawCommunityCard();
            setDrawnCard({
                ...card,
                type: 'COMMUNITY',
            });
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    'Khong the rut the Khi van.',
                ),
            );
            setIsWaitingForAction(false);
        }
    }

    function clearPendingAction(): void {
        setDrawnCard(null);
        setIsWaitingForAction(false);
        setLastMoveResult(null);
    }

    const hasBoardCells = boardCells.length > 0;
    const landedCell =
        lastMoveResult === null
            ? null
            : boardCells.find(
                (cell) =>
                    cell.id === lastMoveResult.cellId,
            ) ?? null;

    return (
        <div className="board-shell relative flex items-center justify-center">
            <div className="board-frame relative aspect-square">
                <BoardGrid boardCells={boardCells}>
                    <BoardCenter
                        onRoll={handleRollDice}
                        onBuyProperty={clearPendingAction}
                        onSkipProperty={clearPendingAction}
                        onBuildProperty={clearPendingAction}
                        onSkipBuildProperty={
                            clearPendingAction
                        }
                        onDrawChanceCard={
                            handleDrawChanceCard
                        }
                        onDrawCommunityCard={
                            handleDrawCommunityCard
                        }
                        onExecuteCard={clearPendingAction}
                        onUseJailFreeCard={
                            clearPendingAction
                        }
                        onSkipJailFreeCard={
                            clearPendingAction
                        }
                        isPlayerMoving={false}
                        isWaitingForAction={
                            isWaitingForAction
                        }
                        currentPlayerName={
                            CURRENT_PLAYER_NAME
                        }
                        currentPlayerInJail={false}
                        currentPlayerJailFreeCardCount={0}
                        landedProperty={landedCell}
                        landedPropertyOwnership={null}
                        landedImprovementPrice={null}
                        landedRentAfterImprovement={null}
                        canAffordProperty={false}
                        canAffordPropertyImprovement={false}
                        lastMoveResult={lastMoveResult}
                        drawnCard={drawnCard}
                    />
                </BoardGrid>

                {isLoadingBoard && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 text-sm font-bold text-slate-700">
                        Dang tai ban co...
                    </div>
                )}

                {!isLoadingBoard && errorMessage && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 px-6 text-center text-sm font-bold text-red-600">
                        {errorMessage}
                    </div>
                )}

                {!isLoadingBoard &&
                    !errorMessage &&
                    !hasBoardCells && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 text-sm font-bold text-slate-700">
                        Khong co du lieu o ban co.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Board;
