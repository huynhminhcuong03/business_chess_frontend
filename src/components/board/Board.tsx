import {
    useRef,
    useState,
} from 'react';
import { gameAPI } from '../../services/gameAPI';
import ToastViewport from '../feedback/ToastViewport';
import TestMovePanel from '../game/TestMovePanel';
import { useBoardAnimations } from '../../hooks/useBoardAnimations';
import { useBoardCardActions } from '../../hooks/useBoardCardActions';
import { useBoardData } from '../../hooks/useBoardData';
import {
    getGamePlayerName,
    useCurrentPlayerInfo,
} from '../../hooks/useCurrentPlayerInfo';
import { useJailActions } from '../../hooks/useJailActions';
import { useRentPaymentAction } from '../../hooks/useRentPaymentAction';
import { useStepPlayerMovement } from '../../hooks/useStepPlayerMovement';
import { useTaxPaymentAction } from '../../hooks/useTaxPaymentAction';
import { useTestMoveActions } from '../../hooks/useTestMoveActions';
import { useToastNotifications } from '../../hooks/useToastNotifications';
import type {
    ResolvedMove,
    SelectedJailAction,
} from '../../types/boardFlow';
import type { GameCard } from '../../types/card';
import { formatPlayerMoney } from '../../utils/formatMoney';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import {
    toResolvedMoveFromRoll,
    toRollDiceResponseFromJailAction,
} from '../../utils/boardMoveMappers';
import {
    canPlayerAffordLandedProperty,
} from '../../utils/boardPropertyCards';
import { usePropertyPurchaseAction } from '../../hooks/usePropertyPurchaseAction';
import {
    updateMovedPlayer,
    updatePlayerAfterGoToJail as applyPlayerAfterGoToJail,
    updatePlayersAfterCardDraw,
} from '../../utils/playerStateUpdates';
import type {
    LastMoveResult,
} from '../../types/game';
import BoardCenter from './BoardCenter';
import BoardGrid from './BoardGrid';
import JailMoveAnimation from '../player/JailMoveAnimation';
import MoneyTransferAnimation from '../player/MoneyTransferAnimation';
import PlayerLayer from '../player/PlayerLayer';
import PlayerMoneyLayer from '../player/PlayerMoneyLayer';
import type {
    DrawCardResponse,
    GameResponse,
    JailActionResponse,
    LandCellResponse,
    LandedPropertyResponse,
    RollDiceResponse,
} from '../../types/gameApi';
import type { GamePlayerResponse } from '../../types/playerApi';

interface BoardProps {
    game: GameResponse;
}

function Board({ game }: BoardProps) {
    const pendingJailActionResultRef =
        useRef<JailActionResponse | null>(null);
    const [gamePlayers, setGamePlayers] = useState<
        GamePlayerResponse[]
    >(game.players ?? []);
    const [currentPlayerId, setCurrentPlayerId] =
        useState<number | null>(game.currentPlayerId);
    const [pendingNextPlayerId, setPendingNextPlayerId] =
        useState<number | null>(null);
    const [diceResetCount, setDiceResetCount] =
        useState(0);
    const [lastMoveResult, setLastMoveResult] =
        useState<LastMoveResult | null>(null);
    const [landedPropertyInfo, setLandedPropertyInfo] =
        useState<LandedPropertyResponse | null>(null);
    const [drawnCard, setDrawnCard] =
        useState<GameCard | null>(null);
    const [pendingCardResult, setPendingCardResult] =
        useState<DrawCardResponse | null>(null);
    const [
        selectedJailAction,
        setSelectedJailAction,
    ] = useState<SelectedJailAction | null>(null);
    const [isWaitingForAction, setIsWaitingForAction] =
        useState(false);
    const [isRollingDice, setIsRollingDice] =
        useState(false);
    const {
        notifications,
        showToast,
        dismissToast,
    } = useToastNotifications();
    const {
        boardCells,
        errorMessage,
        isLoadingBoard,
        ownedProperties,
        setErrorMessage,
        setOwnedProperties,
    } = useBoardData({
        properties: game.properties ?? [],
        showToast,
    });
    const { isPlayerMoving, movePlayer } =
        useStepPlayerMovement({
            boardCellCount: boardCells.length,
            setGamePlayers,
        });
    const {
        boardFrameRef,
        jailMoveAnimation,
        moneyTransfer,
        handleJailMoveAnimationComplete,
        handleMoneyTransferComplete,
        playJailMoveAnimation,
        playRentTransferAnimation,
        setPlayerMoneyElement,
    } = useBoardAnimations();
    const {
        currentGamePlayer,
        currentGamePlayerId,
        currentPlayerName,
        selectedCurrentJailActionType,
    } = useCurrentPlayerInfo({
        currentPlayerId,
        players: gamePlayers,
        selectedJailAction,
    });

    async function handleRollDice(): Promise<RollDiceResponse | null> {
        if (
            boardCells.length === 0 ||
            !currentGamePlayer ||
            isPlayerMoving ||
            isRollingDice ||
            isWaitingForAction
        ) {
            return null;
        }

        if (
            currentGamePlayer.inJail &&
            selectedCurrentJailActionType === null
        ) {
            return null;
        }

        setIsRollingDice(true);
        setErrorMessage(null);
        setIsWaitingForAction(false);
        setDrawnCard(null);
        setPendingCardResult(null);
        setLastMoveResult(null);
        setLandedPropertyInfo(null);
        setPendingNextPlayerId(null);

        try {
            if (
                currentGamePlayer.inJail &&
                selectedCurrentJailActionType !== null
            ) {
                const jailAction =
                    await gameAPI.handleJailAction(
                        game.id,
                        currentGamePlayer.id,
                        {
                            actionType:
                                selectedCurrentJailActionType,
                        },
                    );

                pendingJailActionResultRef.current =
                    jailAction;
                return toRollDiceResponseFromJailAction(
                    jailAction,
                );
            }

            return await gameAPI.rollDice(
                game.id,
                currentGamePlayer.id,
            );
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể tung xúc xắc.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setIsRollingDice(false);

            return null;
        }
    }

    function handleRollDiceComplete(
        result: RollDiceResponse,
    ): void {
        const jailAction =
            pendingJailActionResultRef.current;

        if (jailAction) {
            pendingJailActionResultRef.current = null;
            void handleJailActionRollComplete(jailAction);
            return;
        }

        if (result.sentToJail) {
            void handleTripleDoubleJailMove(result);
            return;
        }

        void handleResolvedMove(
            toResolvedMoveFromRoll(result),
        );
    }

    async function handleResolvedMove(
        move: ResolvedMove,
    ): Promise<void> {
        if (!currentGamePlayer) {
            setIsRollingDice(false);
            return;
        }

        const nextPosition = await movePlayer({
            playerId: move.currentPlayerId,
            startPosition: move.oldPosition,
            stepCount: move.stepCount,
        });
        const landedCell =
            boardCells[move.newPosition] ??
            boardCells[nextPosition];

        if (!landedCell) {
            setIsRollingDice(false);
            return;
        }

        setGamePlayers((previousPlayers) =>
            updateMovedPlayer(
                previousPlayers,
                move.currentPlayerId,
                move.newPosition,
                move.currentPlayerMoney,
            ),
        );

        if (move.startReward > 0) {
            showToast(
                `${getGamePlayerName(
                    gamePlayers,
                    move.currentPlayerId,
                )} nhận ${formatPlayerMoney(move.startReward)}$ khi đi qua ô bắt đầu.`,
                'success',
            );
        }

        let landResult: LandCellResponse;

        try {
            landResult = await gameAPI.landCell(
                game.id,
                move.currentPlayerId,
            );
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể kiểm tra ô vừa đến.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setCurrentPlayerId(move.nextPlayerId);
            setDiceResetCount((currentCount) => currentCount + 1);
            setIsRollingDice(false);
            return;
        }

        const action = landResult.action;

        setLandedPropertyInfo(landResult.property);
        setLastMoveResult({
            playerName: currentPlayerName,
            cellId: landResult.cellId,
            cellPosition: landResult.cellPosition,
            cellName: landResult.cellName,
            cellType: landResult.cellType,
            action,
            startReward: move.startReward,
        });

        if (action === 'PAY_RENT') {
            await handlePayRentAfterLand(
                move.currentPlayerId,
                move.nextPlayerId,
                landResult,
                move.rentDiceTotal,
            );
            setIsRollingDice(false);
            return;
        }

        if (action === 'PAY_LUXURY_TAX') {
            await handlePayTaxAfterLand(
                move.currentPlayerId,
                move.nextPlayerId,
                landResult,
                {},
            );
            setIsRollingDice(false);
            return;
        }

        if (action === 'GO_TO_JAIL') {
            await handleGoToJailAfterLand(
                move.currentPlayerId,
                move.nextPlayerId,
                landResult,
            );
            setIsRollingDice(false);
            return;
        }

        if (
            action === 'BUY_PROPERTY' &&
            !canPlayerAffordLandedProperty(
                gamePlayers,
                move.currentPlayerId,
                landResult,
            )
        ) {
            setLandedPropertyInfo(null);
            setIsWaitingForAction(false);
            setCurrentPlayerId(move.nextPlayerId);
            setPendingNextPlayerId(null);
            setDiceResetCount((currentCount) => currentCount + 1);
            showToast('Không đủ tiền mua tài sản.', 'info');
            setIsRollingDice(false);
            return;
        }

        setIsWaitingForAction(action !== 'NONE');
        if (action === 'NONE') {
            setCurrentPlayerId(move.nextPlayerId);
            setDiceResetCount((currentCount) => currentCount + 1);
        } else {
            setPendingNextPlayerId(move.nextPlayerId);
        }
        setIsRollingDice(false);
    }

    async function handleGoToJailAfterLand(
        gamePlayerId: number,
        nextPlayerId: number,
        landResult: LandCellResponse,
    ): Promise<void> {
        try {
            const jailedPlayer = gamePlayers.find(
                (player) => player.id === gamePlayerId,
            );
            const goToJailResult = await gameAPI.goToJail(
                game.id,
                gamePlayerId,
            );

            if (jailedPlayer) {
                await playJailMoveAnimation(
                    jailedPlayer,
                    goToJailResult.fromPosition,
                    goToJailResult.jailPosition,
                );
            }

            setGamePlayers((previousPlayers) =>
                applyPlayerAfterGoToJail(
                    previousPlayers,
                    goToJailResult,
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
                jailMove: {
                    playerName: getGamePlayerName(
                        gamePlayers,
                        gamePlayerId,
                    ),
                },
            });
            setLandedPropertyInfo(null);
            setIsWaitingForAction(false);
            setCurrentPlayerId(nextPlayerId);
            setPendingNextPlayerId(null);
            setDiceResetCount((currentCount) => currentCount + 1);
            showToast(
                `${getGamePlayerName(
                    gamePlayers,
                    gamePlayerId,
                )} bị đưa vào tù.`,
                'info',
            );
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể đưa người chơi vào tù.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
            setCurrentPlayerId(nextPlayerId);
            setPendingNextPlayerId(null);
            setDiceResetCount((currentCount) => currentCount + 1);
        }
    }

    function finishPendingTurn(): void {
        if (pendingNextPlayerId !== null) {
            setCurrentPlayerId(pendingNextPlayerId);
            setPendingNextPlayerId(null);
        }

        setDiceResetCount((currentCount) => currentCount + 1);
    }

    function clearPendingAction(): void {
        setDrawnCard(null);
        setPendingCardResult(null);
        setIsWaitingForAction(false);
        setLastMoveResult(null);
        setLandedPropertyInfo(null);
        finishPendingTurn();
    }

    function handleExecuteCard(): void {
        if (pendingCardResult !== null) {
            setGamePlayers((previousPlayers) =>
                updatePlayersAfterCardDraw(
                    previousPlayers,
                    pendingCardResult,
                ),
            );

            if (pendingCardResult.startReward > 0) {
                showToast(
                    `${getGamePlayerName(
                        gamePlayers,
                        pendingCardResult.gamePlayerId,
                    )} nhận ${formatPlayerMoney(
                        pendingCardResult.startReward,
                    )}$ khi đi qua ô bắt đầu.`,
                    'success',
                );
            }

            if (pendingCardResult.sentToJail) {
                showToast(
                    `${getGamePlayerName(
                        gamePlayers,
                        pendingCardResult.gamePlayerId,
                    )} bị đưa vào tù.`,
                    'info',
                );
            }
        }

        clearPendingAction();
    }

    const hasBoardCells = boardCells.length > 0;
    const diceResetKey = `${currentGamePlayerId ?? 'none'}-${diceResetCount}`;
    const landedCell =
        lastMoveResult === null
            ? null
            : boardCells.find(
                (cell) =>
                    cell.id === lastMoveResult.cellId,
            ) ?? null;
    const canAffordLandedProperty =
        landedPropertyInfo?.buyPrice !== undefined &&
        landedPropertyInfo.buyPrice !== null &&
        currentGamePlayer !== null &&
        currentGamePlayer.money >= landedPropertyInfo.buyPrice;
    const {
        handleJailAction,
        handleJailActionRollComplete,
        handleTripleDoubleJailMove,
    } = useJailActions({
        boardCells,
        currentGamePlayer,
        gamePlayers,
        handleResolvedMove,
        isPlayerMoving,
        isRollingDice,
        isWaitingForAction,
        playJailMoveAnimation,
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
    });
    const { handlePayRentAfterLand } =
        useRentPaymentAction({
            gameId: game.id,
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
        });
    const {
        handlePayFixedIncomeTax,
        handlePayPercentIncomeTax,
        handlePayTaxAfterLand,
    } = useTaxPaymentAction({
        currentGamePlayer,
        gameId: game.id,
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
    });
    const {
        handleDrawChanceCard,
        handleDrawCommunityCard,
    } = useBoardCardActions({
        currentGamePlayerId,
        finishPendingTurn,
        gameId: game.id,
        setDrawnCard,
        setPendingCardResult,
        setErrorMessage,
        setIsWaitingForAction,
        showToast,
    });
    const { handleBuyProperty } =
        usePropertyPurchaseAction({
            clearPendingAction,
            currentGamePlayer,
            gameId: game.id,
            landedCell,
            setErrorMessage,
            setGamePlayers,
            setOwnedProperties,
            showToast,
        });
    const {
        handleTestMoveToCell,
        handleTestRollDice,
    } = useTestMoveActions({
        boardCellCount: boardCells.length,
        currentGamePlayer,
        gameId: game.id,
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
    });

    return (
        <div className="board-shell relative flex items-center justify-center">
            <ToastViewport
                notifications={notifications}
                onDismiss={dismissToast}
            />
            <PlayerMoneyLayer
                players={gamePlayers}
                currentGamePlayerId={currentGamePlayerId}
                ownedProperties={ownedProperties}
                onPlayerMoneyElementRef={
                    setPlayerMoneyElement
                }
            />
            <MoneyTransferAnimation
                transfer={moneyTransfer}
                onComplete={handleMoneyTransferComplete}
            />

            <div
                ref={boardFrameRef}
                className="board-frame relative aspect-square"
            >
                <BoardGrid boardCells={boardCells}>
                    <BoardCenter
                        onRoll={handleRollDice}
                        onRollComplete={
                            handleRollDiceComplete
                        }
                        diceResetKey={diceResetKey}
                        onBuyProperty={handleBuyProperty}
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
                        onExecuteCard={handleExecuteCard}
                        onPayFixedIncomeTax={
                            handlePayFixedIncomeTax
                        }
                        onPayPercentIncomeTax={
                            handlePayPercentIncomeTax
                        }
                        onJailAction={handleJailAction}
                        isPlayerMoving={isPlayerMoving}
                        isRollingDice={isRollingDice}
                        isWaitingForAction={
                            isWaitingForAction
                        }
                        currentPlayerName={
                            currentPlayerName
                        }
                        currentPlayerMoney={
                            currentGamePlayer?.money ?? 0
                        }
                        currentPlayerInJail={
                            currentGamePlayer?.inJail ?? false
                        }
                        selectedJailActionType={
                            selectedCurrentJailActionType
                        }
                        currentPlayerJailTurn={
                            currentGamePlayer?.jailTurn ?? 0
                        }
                        currentPlayerJailFreeCardCount={
                            currentGamePlayer?.jailFreeCard ??
                            0
                        }
                        landedProperty={landedCell}
                        landedPropertyOwnership={null}
                        landedImprovementPrice={null}
                        landedRentAfterImprovement={null}
                        canAffordProperty={
                            canAffordLandedProperty
                        }
                        canAffordPropertyImprovement={false}
                        lastMoveResult={lastMoveResult}
                        drawnCard={drawnCard}
                    />

                    {import.meta.env.DEV && (
                        <TestMovePanel
                            cellCount={boardCells.length}
                            disabled={
                                isPlayerMoving ||
                                isRollingDice ||
                                isWaitingForAction ||
                                !hasBoardCells
                            }
                            onMoveToCell={handleTestMoveToCell}
                            onRollDice={handleTestRollDice}
                        />
                    )}
                </BoardGrid>

                <PlayerLayer
                    players={gamePlayers}
                    hiddenPlayerIds={
                        jailMoveAnimation
                            ? [jailMoveAnimation.player.id]
                            : []
                    }
                />

                {jailMoveAnimation && (
                    <JailMoveAnimation
                        key={jailMoveAnimation.id}
                        player={jailMoveAnimation.player}
                        from={jailMoveAnimation.from}
                        to={jailMoveAnimation.to}
                        onComplete={
                            handleJailMoveAnimationComplete
                        }
                    />
                )}

                {isLoadingBoard && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 text-sm font-bold text-slate-700">
                        Đang tải bàn cờ...
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
                        Không có dữ liệu ô bàn cờ.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Board;
