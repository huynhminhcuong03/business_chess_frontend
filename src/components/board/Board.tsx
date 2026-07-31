import { useEffect, useState } from 'react';
import { ApiRequestError } from '../../services/axiosClient';
import { boardAPI } from '../../services/boardAPI';
import { cardAPI } from '../../services/cardAPI';
import ToastViewport from '../feedback/ToastViewport';
import { useStepPlayerMovement } from '../../hooks/useStepPlayerMovement';
import { useToastNotifications } from '../../hooks/useToastNotifications';
import type { ApiResponse } from '../../types/api';
import type { BoardResponse } from '../../types/board';
import type { BoardCell as BoardCellData } from '../../types/boardCell';
import type { GameCard } from '../../types/card';
import type {
    CellAction,
    LastMoveResult,
} from '../../types/game';
import DebugMovePanel from '../game/DebugMovePanel';
import BoardCenter from './BoardCenter';
import BoardGrid from './BoardGrid';
import PlayerLayer from '../player/PlayerLayer';
import PlayerMoneyLayer from '../player/PlayerMoneyLayer';
import type {
    GamePlayerResponse,
    GameResponse,
} from '../../types/gameApi';

const FALLBACK_PLAYER_NAME = 'Người chơi';

interface BoardProps {
    game: GameResponse;
}

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

function getCurrentGamePlayer(
    players: GamePlayerResponse[],
    currentPlayerId: number | null,
): GamePlayerResponse | null {
    if (players.length === 0) {
        return null;
    }

    return (
        players.find(
            (player) =>
                player.id === currentPlayerId ||
                player.player.id === currentPlayerId,
        ) ?? players[0]
    );
}

function Board({ game }: BoardProps) {
    const [, setBoard] =
        useState<BoardResponse | null>(null);
    const [boardCells, setBoardCells] =
        useState<BoardCellData[]>([]);
    const [gamePlayers, setGamePlayers] = useState<
        GamePlayerResponse[]
    >(game.players ?? []);
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
    const { isPlayerMoving, movePlayer } =
        useStepPlayerMovement({
            boardCellCount: boardCells.length,
            setGamePlayers,
        });
    const {
        notifications,
        showToast,
        dismissToast,
    } = useToastNotifications();

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
                const message = getApiErrorMessage(
                    error,
                    'Khong the tai du lieu ban co.',
                );

                setBoard(null);
                setBoardCells([]);
                setErrorMessage(message);
                showToast(message, 'error');
            } finally {
                setIsLoadingBoard(false);
            }
        }

        void fetchBoardData();
    }, [showToast]);

    const currentGamePlayer = getCurrentGamePlayer(
        gamePlayers,
        game.currentPlayerId,
    );
    const currentPlayerName =
        currentGamePlayer?.player.displayName ??
        FALLBACK_PLAYER_NAME;
    const currentPosition =
        currentGamePlayer?.position ?? 0;
    const currentGamePlayerId =
        currentGamePlayer?.id ?? null;

    function handleRollDice(totalValue: number): void {
        if (
            boardCells.length === 0 ||
            !currentGamePlayer ||
            isPlayerMoving
        ) {
            return;
        }

        void handleMoveAfterRoll(totalValue);
    }

    function handleDebugMove(stepCount: number): void {
        if (
            boardCells.length === 0 ||
            !currentGamePlayer ||
            isPlayerMoving ||
            isWaitingForAction
        ) {
            return;
        }

        moveCurrentPlayerImmediately(stepCount);
    }

    function moveCurrentPlayerImmediately(
        stepCount: number,
    ): void {
        if (!currentGamePlayer) {
            return;
        }

        const nextPosition =
            (currentPosition + stepCount) %
            boardCells.length;
        const landedCell = boardCells[nextPosition];

        if (!landedCell) {
            return;
        }

        const action = getCellAction(landedCell);

        setGamePlayers((previousPlayers) =>
            previousPlayers.map((player) =>
                player.id === currentGamePlayer.id
                    ? {
                          ...player,
                          position: nextPosition,
                      }
                    : player,
            ),
        );
        setDrawnCard(null);
        setLastMoveResult({
            playerName: currentPlayerName,
            cellId: landedCell.id,
            cellPosition: landedCell.position,
            cellName: landedCell.name,
            cellType: landedCell.type,
            action,
        });
        setIsWaitingForAction(action !== 'NONE');
    }

    async function handleMoveAfterRoll(
        totalValue: number,
    ): Promise<void> {
        if (!currentGamePlayer) {
            return;
        }

        setIsWaitingForAction(false);
        setDrawnCard(null);
        setLastMoveResult(null);

        const nextPosition = await movePlayer({
            playerId: currentGamePlayer.id,
            startPosition: currentPosition,
            stepCount: totalValue,
        });
        const landedCell = boardCells[nextPosition];

        if (!landedCell) {
            return;
        }

        const action = getCellAction(landedCell);

        setLastMoveResult({
            playerName: currentPlayerName,
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
            const card = await cardAPI.drawChanceCardForGame(
                game.id,
                currentGamePlayerId,
            );
            setDrawnCard({
                ...card,
                type: 'CHANCE',
            });
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Khong the rut the Co hoi.',
            );
            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
        }
    }

    async function handleDrawCommunityCard(): Promise<void> {
        setErrorMessage(null);

        try {
            const card =
                await cardAPI.drawCommunityCardForGame(
                    game.id,
                    currentGamePlayerId,
                );
            setDrawnCard({
                ...card,
                type: 'COMMUNITY',
            });
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Khong the rut the Khi van.',
            );
            setErrorMessage(message);
            showToast(message, 'error');
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
            <ToastViewport
                notifications={notifications}
                onDismiss={dismissToast}
            />
            <PlayerMoneyLayer
                players={gamePlayers}
                currentGamePlayerId={currentGamePlayerId}
            />

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
                        isPlayerMoving={isPlayerMoving}
                        isWaitingForAction={
                            isWaitingForAction
                        }
                        currentPlayerName={
                            currentPlayerName
                        }
                        currentPlayerInJail={
                            currentGamePlayer?.inJail ?? false
                        }
                        currentPlayerJailFreeCardCount={
                            currentGamePlayer?.jailFreeCard ??
                            0
                        }
                        landedProperty={landedCell}
                        landedPropertyOwnership={null}
                        landedImprovementPrice={null}
                        landedRentAfterImprovement={null}
                        canAffordProperty={false}
                        canAffordPropertyImprovement={false}
                        lastMoveResult={lastMoveResult}
                        drawnCard={drawnCard}
                    />

                    {import.meta.env.DEV && (
                        <DebugMovePanel
                            onMove={handleDebugMove}
                            disabled={
                                isPlayerMoving ||
                                isWaitingForAction ||
                                !hasBoardCells
                            }
                        />
                    )}
                </BoardGrid>

                <PlayerLayer
                    players={gamePlayers}
                />

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
