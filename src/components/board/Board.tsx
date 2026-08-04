import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { ApiRequestError } from '../../services/axiosClient';
import { boardAPI } from '../../services/boardAPI';
import { cardAPI } from '../../services/cardAPI';
import { gameAPI } from '../../services/gameAPI';
import ToastViewport from '../feedback/ToastViewport';
import TestMovePanel from '../game/TestMovePanel';
import { useStepPlayerMovement } from '../../hooks/useStepPlayerMovement';
import { useToastNotifications } from '../../hooks/useToastNotifications';
import type { ApiResponse } from '../../types/api';
import type { BoardResponse } from '../../types/board';
import type { BoardCell as BoardCellData } from '../../types/boardCell';
import type { GameCard } from '../../types/card';
import type {
    LastMoveResult,
    OwnedPropertyCard,
} from '../../types/game';
import BoardCenter from './BoardCenter';
import BoardGrid from './BoardGrid';
import MoneyTransferAnimation from '../player/MoneyTransferAnimation';
import type { MoneyTransfer } from '../player/MoneyTransferAnimation';
import PlayerLayer from '../player/PlayerLayer';
import PlayerMoneyLayer from '../player/PlayerMoneyLayer';
import type {
    BuyPropertyResponse,
    GamePropertyResponse,
    GameResponse,
    IncomeTaxOption,
    LandCellResponse,
    LandedPropertyResponse,
    PayRentResponse,
    PayTaxResponse,
    RollDiceResponse,
} from '../../types/gameApi';
import type { GamePlayerResponse } from '../../types/playerApi';

const FALLBACK_PLAYER_NAME = 'Người chơi';
const MONEY_TRANSFER_FALLBACK_DURATION = 3100;

interface BoardProps {
    game: GameResponse;
}

interface ResolvedMove {
    currentPlayerId: number;
    nextPlayerId: number;
    oldPosition: number;
    newPosition: number;
    stepCount: number;
    rentDiceTotal: number;
}

interface TestMoveOptions {
    targetPosition: number;
    rentDiceTotal: number;
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

function getRentFromProperty(
    property: GamePropertyResponse,
    cell: BoardCellData,
): number | null {
    const detail = cell.propertyDetail;

    if (!detail) {
        return null;
    }

    if (property.mortgaged) {
        return 0;
    }

    if (property.hasHotel) {
        return detail.rentHotel;
    }

    switch (property.houseCount) {
        case 1:
            return detail.rentLevel1;
        case 2:
            return detail.rentLevel2;
        case 3:
            return detail.rentLevel3;
        case 4:
            return detail.rentLevel4;
        default:
            return detail.rentLevel0;
    }
}

function toOwnedPropertyCard(
    property: GamePropertyResponse,
    cell: BoardCellData,
): OwnedPropertyCard {
    return {
        gamePropertyId: property.id,
        boardCellId: property.boardCellId,
        boardCellPosition: property.boardCellPosition,
        boardCellName: property.boardCellName,
        boardCellType: cell.type,
        color: cell.color,
        ownerGamePlayerId: property.ownerGamePlayerId,
        ownerPlayerId: property.ownerPlayerId,
        houseCount: property.houseCount,
        hasHotel: property.hasHotel,
        mortgaged: property.mortgaged,
        buyPrice: cell.propertyDetail?.buyPrice ?? null,
        rent: getRentFromProperty(property, cell),
        propertyDetail: cell.propertyDetail,
    };
}

function getOwnedProperties(
    properties: GamePropertyResponse[],
    cells: BoardCellData[],
): OwnedPropertyCard[] {
    return properties
        .map((property) => {
            const cell = cells.find(
                (boardCell) =>
                    boardCell.id === property.boardCellId,
            );

            return cell
                ? toOwnedPropertyCard(property, cell)
                : null;
        })
        .filter(
            (
                property,
            ): property is OwnedPropertyCard =>
                property !== null,
        );
}

function toOwnedPropertyCardFromBuy(
    property: BuyPropertyResponse,
    cell: BoardCellData,
): OwnedPropertyCard {
    return {
        gamePropertyId: property.gamePropertyId,
        boardCellId: property.boardCellId,
        boardCellPosition: property.boardCellPosition,
        boardCellName: property.boardCellName,
        boardCellType: cell.type,
        color: cell.color,
        ownerGamePlayerId: property.ownerGamePlayerId,
        ownerPlayerId: null,
        houseCount: 0,
        hasHotel: false,
        mortgaged: false,
        buyPrice: property.buyPrice,
        rent: cell.propertyDetail?.rentLevel0 ?? null,
        propertyDetail: cell.propertyDetail,
    };
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

function getGamePlayerName(
    players: GamePlayerResponse[],
    gamePlayerId: number,
): string {
    return (
        players.find((player) => player.id === gamePlayerId)
            ?.player.displayName ?? FALLBACK_PLAYER_NAME
    );
}

function canPlayerAffordLandedProperty(
    players: GamePlayerResponse[],
    gamePlayerId: number,
    landResult: LandCellResponse,
): boolean {
    const buyPrice = landResult.property?.buyPrice;

    if (buyPrice === undefined || buyPrice === null) {
        return false;
    }

    return (
        players.find((player) => player.id === gamePlayerId)
            ?.money ?? 0
    ) >= buyPrice;
}

function getRollRentDiceTotal(
    rollResult: RollDiceResponse,
): number {
    return rollResult.dice1 + rollResult.dice2;
}

function toResolvedMoveFromRoll(
    rollResult: RollDiceResponse,
): ResolvedMove {
    return {
        currentPlayerId: rollResult.currentPlayerId,
        nextPlayerId: rollResult.nextPlayerId,
        oldPosition: rollResult.oldPosition,
        newPosition: rollResult.newPosition,
        stepCount: rollResult.total,
        rentDiceTotal: getRollRentDiceTotal(rollResult),
    };
}

function Board({ game }: BoardProps) {
    const playerMoneyElementsRef = useRef<
        Map<number, HTMLDivElement>
    >(new Map());
    const moneyTransferResolveRef =
        useRef<(() => void) | null>(null);
    const [, setBoard] =
        useState<BoardResponse | null>(null);
    const [boardCells, setBoardCells] =
        useState<BoardCellData[]>([]);
    const [gamePlayers, setGamePlayers] = useState<
        GamePlayerResponse[]
    >(game.players ?? []);
    const [ownedProperties, setOwnedProperties] =
        useState<OwnedPropertyCard[]>([]);
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
    const [isLoadingBoard, setIsLoadingBoard] =
        useState(true);
    const [isWaitingForAction, setIsWaitingForAction] =
        useState(false);
    const [isRollingDice, setIsRollingDice] =
        useState(false);
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);
    const [moneyTransfer, setMoneyTransfer] =
        useState<MoneyTransfer | null>(null);
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

    const setPlayerMoneyElement = useCallback(
        (
            playerId: number,
            element: HTMLDivElement | null,
        ) => {
            if (element) {
                playerMoneyElementsRef.current.set(
                    playerId,
                    element,
                );
                return;
            }

            playerMoneyElementsRef.current.delete(playerId);
        },
        [],
    );

    function getElementCenter(
        element: HTMLElement,
    ): { x: number; y: number } {
        const rect = element.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }

    function handleMoneyTransferComplete(): void {
        setMoneyTransfer(null);
        moneyTransferResolveRef.current?.();
        moneyTransferResolveRef.current = null;
    }

    function playRentTransferAnimation(
        rentPayment: PayRentResponse,
    ): Promise<void> {
        const payerElement =
            playerMoneyElementsRef.current.get(
                rentPayment.payerGamePlayerId,
            );
        const ownerElement =
            playerMoneyElementsRef.current.get(
                rentPayment.ownerGamePlayerId,
            );

        if (!payerElement || !ownerElement) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            moneyTransferResolveRef.current = resolve;
            setMoneyTransfer({
                id: Date.now(),
                amount: rentPayment.rentAmount,
                from: getElementCenter(payerElement),
                to: getElementCenter(ownerElement),
            });

            window.setTimeout(() => {
                if (moneyTransferResolveRef.current) {
                    handleMoneyTransferComplete();
                }
            }, MONEY_TRANSFER_FALLBACK_DURATION);
        });
    }

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

                const sortedCells =
                    sortBoardCells(cellsResponse);

                setBoard(boardResponse);
                setBoardCells(sortedCells);
                setOwnedProperties(
                    getOwnedProperties(
                        game.properties ?? [],
                        sortedCells,
                    ),
                );
            } catch (error) {
                const message = getApiErrorMessage(
                    error,
                    'Không thể tải dữ liệu bàn cờ.',
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
    }, [game.properties, showToast]);

    const currentGamePlayer = getCurrentGamePlayer(
        gamePlayers,
        currentPlayerId,
    );
    const currentPlayerName =
        currentGamePlayer?.player.displayName ??
        FALLBACK_PLAYER_NAME;
    const currentGamePlayerId =
        currentGamePlayer?.id ?? null;

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

        setIsRollingDice(true);
        setErrorMessage(null);
        setIsWaitingForAction(false);
        setDrawnCard(null);
        setLastMoveResult(null);
        setLandedPropertyInfo(null);
        setPendingNextPlayerId(null);

        try {
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
        void handleResolvedMove(
            toResolvedMoveFromRoll(result),
        );
    }

    async function handleTestMoveToCell({
        targetPosition,
        rentDiceTotal,
    }: TestMoveOptions): Promise<void> {
        if (
            boardCells.length === 0 ||
            !currentGamePlayer ||
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
                game.id,
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
            previousPlayers.map((player) =>
                player.id === move.currentPlayerId
                    ? {
                          ...player,
                          position: move.newPosition,
                      }
                    : player,
            ),
        );

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

    async function handlePayRentAfterLand(
        payerGamePlayerId: number,
        nextPlayerId: number,
        landResult: LandCellResponse,
        diceTotal: number,
    ): Promise<void> {
        try {
            const rentPayment = await gameAPI.payRent(
                game.id,
                payerGamePlayerId,
                {
                    diceTotal,
                },
            );

            updatePayerMoneyAfterRent(rentPayment);
            await playRentTransferAnimation(rentPayment);
            updateOwnerMoneyAfterRent(rentPayment);
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

    function updatePayerMoneyAfterRent(
        rentPayment: PayRentResponse,
    ): void {
        setGamePlayers((previousPlayers) =>
            previousPlayers.map((player) => {
                if (
                    player.id ===
                    rentPayment.payerGamePlayerId
                ) {
                    return {
                        ...player,
                        money: rentPayment.payerMoney,
                    };
                }

                return player;
            }),
        );
    }

    function updateOwnerMoneyAfterRent(
        rentPayment: PayRentResponse,
    ): void {
        setGamePlayers((previousPlayers) =>
            previousPlayers.map((player) =>
                player.id === rentPayment.ownerGamePlayerId
                    ? {
                          ...player,
                          money: rentPayment.ownerMoney,
                      }
                    : player,
            ),
        );
    }

    async function handlePayTaxAfterLand(
        gamePlayerId: number,
        nextPlayerId: number,
        landResult: LandCellResponse,
        request: { incomeTaxOption?: IncomeTaxOption },
    ): Promise<void> {
        try {
            const taxPayment = await gameAPI.payTax(
                game.id,
                gamePlayerId,
                request,
            );

            updatePlayerMoneyAfterTax(gamePlayerId, taxPayment);
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
                `ÄÃ£ Ä‘Ã³ng thuáº¿ ${formatTaxAmount(taxPayment)}.`,
                'success',
            );
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'KhÃ´ng thá»ƒ Ä‘Ã³ng thuáº¿.',
            );

            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
            setCurrentPlayerId(nextPlayerId);
            setPendingNextPlayerId(null);
            setDiceResetCount((currentCount) => currentCount + 1);
        }
    }

    function updatePlayerMoneyAfterTax(
        gamePlayerId: number,
        taxPayment: PayTaxResponse,
    ): void {
        setGamePlayers((previousPlayers) =>
            previousPlayers.map((player) =>
                player.id === gamePlayerId
                    ? {
                          ...player,
                          money: taxPayment.playerMoney,
                      }
                    : player,
            ),
        );
    }

    function formatTaxAmount(
        taxPayment: PayTaxResponse,
    ): string {
        return taxPayment.taxAmount.toLocaleString('en-US');
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
                'Không thể rút thẻ Cơ hội.',
            );
            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
            finishPendingTurn();
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
                'Không thể rút thẻ Khí vận.',
            );
            setErrorMessage(message);
            showToast(message, 'error');
            setIsWaitingForAction(false);
            finishPendingTurn();
        }
    }

    async function handleBuyProperty(): Promise<void> {
        if (!currentGamePlayer || !landedCell) {
            return;
        }

        setErrorMessage(null);

        try {
            const boughtProperty =
                await gameAPI.buyProperty(
                    game.id,
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

    function handlePayFixedIncomeTax(): void {
        void handlePayIncomeTax('FIXED');
    }

    function handlePayPercentIncomeTax(): void {
        void handlePayIncomeTax('PERCENT');
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

    function finishPendingTurn(): void {
        if (pendingNextPlayerId !== null) {
            setCurrentPlayerId(pendingNextPlayerId);
            setPendingNextPlayerId(null);
        }

        setDiceResetCount((currentCount) => currentCount + 1);
    }

    function clearPendingAction(): void {
        setDrawnCard(null);
        setIsWaitingForAction(false);
        setLastMoveResult(null);
        setLandedPropertyInfo(null);
        finishPendingTurn();
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

            <div className="board-frame relative aspect-square">
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
                        onExecuteCard={clearPendingAction}
                        onPayFixedIncomeTax={
                            handlePayFixedIncomeTax
                        }
                        onPayPercentIncomeTax={
                            handlePayPercentIncomeTax
                        }
                        onUseJailFreeCard={
                            clearPendingAction
                        }
                        onSkipJailFreeCard={
                            clearPendingAction
                        }
                        isPlayerMoving={isPlayerMoving}
                        isRollingDice={isRollingDice}
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
                        />
                    )}
                </BoardGrid>

                <PlayerLayer
                    players={gamePlayers}
                />

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
