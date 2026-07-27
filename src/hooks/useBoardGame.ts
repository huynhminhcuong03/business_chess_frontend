import { useState } from 'react';
import { INCOME_TAX_AMOUNT, LUXURY_TAX_AMOUNT, START_REWARD } from '../constants/gameRules';
import { boardCells } from '../data/boardCells';
import { players as initialPlayers } from '../data/players';
import type { BoardCell } from '../types/board';
import type {
    LastMoveResult,
    PropertyOwnership,
} from '../types/game';
import type { Player } from '../types/player';
import {
    gameAPI,
} from '../services/game';
import {
    getCellAction,
    getPropertyImprovementCost,
    getPropertyRentAfterImprovement,
    getPropertyRent,
    isPurchasableCell,
    JAIL_POSITION,
    PLAYER_STEP_DELAY,
    wait,
} from '../utils/boardGameRules';
import useCardActions from './useCardActions';
import useGameActionStatus from './useGameActionStatus';

const LOCAL_GAME_ID = 'local-game';

function useBoardGame() {
    const gameId = LOCAL_GAME_ID;
    const {
        isSubmittingAction,
        actionError,
        runGameAction,
        clearActionError,
    } = useGameActionStatus();

    const [players, setPlayers] =
        useState<Player[]>(initialPlayers);

    const [currentPlayerIndex, setCurrentPlayerIndex] =
        useState<number>(0);

    const [isPlayerMoving, setIsPlayerMoving] =
        useState<boolean>(false);

    const [isWaitingForAction, setIsWaitingForAction] =
        useState<boolean>(false);

    const [lastMoveResult, setLastMoveResult] =
        useState<LastMoveResult | null>(null);

    const [
        propertyOwnerships,
        setPropertyOwnerships,
    ] = useState<PropertyOwnership[]>([]);

    const currentPlayer = players[currentPlayerIndex];

    const landedCell = lastMoveResult
        ? boardCells.find(
            (cell) =>
                cell.id === lastMoveResult.cellId,
        ) ?? null
        : null;

    const landedPropertyPrice =
        landedCell?.propertyDetails?.buyPrice ?? null;
    const landedPropertyOwnership = landedCell
        ? propertyOwnerships.find(
            (ownership) =>
                ownership.boardCellId === landedCell.id,
        ) ?? null
        : null;
    const landedImprovementPrice =
        getPropertyImprovementCost(
            landedCell,
            landedPropertyOwnership,
        );
    const landedRentAfterImprovement =
        getPropertyRentAfterImprovement(
            landedCell,
            landedPropertyOwnership,
        );

    const canAffordProperty =
        currentPlayer !== undefined &&
        landedPropertyPrice !== null &&
        currentPlayer.money >= landedPropertyPrice;
    const canAffordPropertyImprovement =
        currentPlayer !== undefined &&
        landedImprovementPrice !== null &&
        currentPlayer.money >=
            landedImprovementPrice;

    function moveToNextPlayer(
        excludedPlayerId?: number,
    ): void {
        setCurrentPlayerIndex((currentIndex) =>
            gameAPI.getNextActivePlayerIndex(
                players,
                currentIndex,
                excludedPlayerId,
            ),
        );
    }

    function finishWaitingAction(): void {
        setIsWaitingForAction(false);
    }

    function changePlayerMoney(
        playerId: number,
        amount: number,
    ): void {
        setPlayers((currentPlayers) =>
            gameAPI.changePlayerMoney(
                currentPlayers,
                playerId,
                amount,
            ),
        );
    }

    function payTax(
        playerId: number,
        taxAmount: number,
    ): {
        amountDue: number;
        amountPaid: number;
        payerBecameBankrupt: boolean;
    } {
        const { players: updatedPlayers, result } =
            gameAPI.payBankAmount(
                players,
                playerId,
                taxAmount,
            );

        setPlayers(updatedPlayers);

        return result;
    }

    function payPropertyRent(
        tenantPlayerId: number,
        propertyCell: BoardCell,
        rentMultiplier = 1,
    ):
        | {
              ownerPlayerId: number;
              rentAmount: number;
              amountDue: number;
              amountPaid: number;
              payerBecameBankrupt: boolean;
          }
        | null {
        const ownership = propertyOwnerships.find(
            (currentOwnership) =>
                currentOwnership.boardCellId ===
                propertyCell.id,
        );

        if (!ownership) {
            return null;
        }

        const rentAmount =
            getPropertyRent(propertyCell, ownership) *
            rentMultiplier;

        const rentResult = gameAPI.payPropertyRent(
            players,
            propertyOwnerships,
            tenantPlayerId,
            propertyCell,
            rentAmount,
        );

        if (!rentResult) {
            return null;
        }

        setPlayers(rentResult.players);

        return {
            ownerPlayerId: rentResult.ownerPlayerId,
            rentAmount: rentResult.rentAmount,
            ...rentResult.result,
        };
    }

    function sendPlayerToJail(playerId: number): void {
        setPlayers((currentPlayers) =>
            gameAPI.sendPlayerToJail(
                currentPlayers,
                playerId,
            ),
        );
    }

    const {
        drawnCard,
        handleDrawChanceCard,
        handleDrawCommunityCard,
        handleExecuteCard,
    } = useCardActions({
        players,
        currentPlayer,
        isWaitingForAction,
        lastMoveResult,
        propertyOwnerships,
        setPlayers,
        moveToNextPlayer,
        finishWaitingAction,
    });

    function handleBuyProperty(): void {
        if (
            !isWaitingForAction ||
            lastMoveResult?.action !==
                'BUY_PROPERTY' ||
            !currentPlayer
        ) {
            return;
        }

        const propertyCell = boardCells.find(
            (cell) =>
                cell.id === lastMoveResult.cellId,
        );

        if (
            !propertyCell ||
            !isPurchasableCell(propertyCell.type)
        ) {
            return;
        }

        const nextState = gameAPI.buyProperty(
            {
                players,
                propertyOwnerships,
            },
            currentPlayer,
            propertyCell,
        );

        setPlayers(nextState.players);
        setPropertyOwnerships(
            nextState.propertyOwnerships,
        );

        finishWaitingAction();
        moveToNextPlayer(
            nextState.players.find(
                (player) =>
                    player.id === currentPlayer.id,
            )?.isBankrupt
                ? currentPlayer.id
                : undefined,
        );
    }

    function handleSkipProperty(): void {
        if (
            !isWaitingForAction ||
            lastMoveResult?.action !==
                'BUY_PROPERTY'
        ) {
            return;
        }

        finishWaitingAction();
        moveToNextPlayer();
    }

    function handleBuildProperty(): void {
        if (
            !isWaitingForAction ||
            lastMoveResult?.action !==
                'BUILD_PROPERTY' ||
            !currentPlayer
        ) {
            return;
        }

        const propertyCell = boardCells.find(
            (cell) =>
                cell.id === lastMoveResult.cellId,
        );

        const ownership =
            propertyOwnerships.find(
                (currentOwnership) =>
                    currentOwnership.boardCellId ===
                        lastMoveResult.cellId &&
                    currentOwnership.ownerPlayerId ===
                        currentPlayer.id,
            ) ?? null;

        const improvementCost =
            getPropertyImprovementCost(
                propertyCell ?? null,
                ownership,
            );

        if (
            !propertyCell ||
            !ownership ||
            improvementCost === null
        ) {
            return;
        }

        const nextState = gameAPI.buildProperty(
            {
                players,
                propertyOwnerships,
            },
            currentPlayer,
            propertyCell,
            ownership,
            improvementCost,
        );

        setPlayers(nextState.players);
        setPropertyOwnerships(
            nextState.propertyOwnerships,
        );

        finishWaitingAction();
        moveToNextPlayer(
            nextState.players.find(
                (player) =>
                    player.id === currentPlayer.id,
            )?.isBankrupt
                ? currentPlayer.id
                : undefined,
        );
    }

    function handleSkipBuildProperty(): void {
        if (
            !isWaitingForAction ||
            lastMoveResult?.action !==
                'BUILD_PROPERTY'
        ) {
            return;
        }

        finishWaitingAction();
        moveToNextPlayer();
    }

    function handleMortgageProperty(
        boardCellId: number,
    ): void {
        if (!currentPlayer || currentPlayer.isBankrupt) {
            return;
        }

        const propertyCell = boardCells.find(
            (cell) => cell.id === boardCellId,
        );
        const ownership = propertyOwnerships.find(
            (currentOwnership) =>
                currentOwnership.boardCellId ===
                    boardCellId &&
                currentOwnership.ownerPlayerId ===
                    currentPlayer.id,
        );

        if (
            !propertyCell ||
            !ownership
        ) {
            return;
        }

        const nextState = gameAPI.mortgageProperty(
            {
                players,
                propertyOwnerships,
            },
            currentPlayer,
            propertyCell,
            ownership,
        );

        setPlayers(nextState.players);
        setPropertyOwnerships(
            nextState.propertyOwnerships,
        );
    }

    function handleRedeemProperty(
        boardCellId: number,
    ): void {
        if (!currentPlayer || currentPlayer.isBankrupt) {
            return;
        }

        const propertyCell = boardCells.find(
            (cell) => cell.id === boardCellId,
        );
        const ownership = propertyOwnerships.find(
            (currentOwnership) =>
                currentOwnership.boardCellId ===
                    boardCellId &&
                currentOwnership.ownerPlayerId ===
                    currentPlayer.id,
        );

        if (
            !propertyCell ||
            !ownership
        ) {
            return;
        }

        const nextState = gameAPI.redeemProperty(
            {
                players,
                propertyOwnerships,
            },
            currentPlayer,
            propertyCell,
            ownership,
        );

        setPlayers(nextState.players);
        setPropertyOwnerships(
            nextState.propertyOwnerships,
        );
    }

    async function moveCurrentPlayer(
        stepCount: number,
    ): Promise<void> {
        if (
            isPlayerMoving ||
            isWaitingForAction ||
            stepCount <= 0
        ) {
            return;
        }

        const movingPlayer =
            players[currentPlayerIndex];

        if (!movingPlayer) {
            return;
        }

        const movingPlayerId = movingPlayer.id;
        const movingPlayerName = movingPlayer.name;
        const startPosition = movingPlayer.position;

        setIsPlayerMoving(true);
        setLastMoveResult(null);

        let currentPosition = startPosition;
        let passedStart = false;

        for (
            let step = 0;
            step < stepCount;
            step += 1
        ) {
            const nextPosition =
                (currentPosition + 1) %
                boardCells.length;

            if (nextPosition === 0) {
                passedStart = true;
            }

            currentPosition = nextPosition;

            setPlayers((currentPlayers) =>
                gameAPI.movePlayerOneStep(
                    currentPlayers,
                    movingPlayerId,
                    currentPosition,
                ),
            );

            await wait(PLAYER_STEP_DELAY);
        }

        if (passedStart) {
            changePlayerMoney(
                movingPlayerId,
                START_REWARD,
            );
        }

        const destinationCell = boardCells.find(
            (cell) =>
                cell.position === currentPosition,
        );

        if (!destinationCell) {
            setIsPlayerMoving(false);
            return;
        }

        const action = getCellAction(
            destinationCell,
            propertyOwnerships,
            movingPlayerId,
        );

        let taxPaid: number | undefined;
        let bankruptcy:
            | LastMoveResult['bankruptcy']
            | undefined;
        let rentPayment:
            | LastMoveResult['rentPayment']
            | undefined;
        let jailMove:
            | LastMoveResult['jailMove']
            | undefined;

        if (action === 'PAY_INCOME_TAX') {
            const taxPayment = payTax(
                movingPlayerId,
                INCOME_TAX_AMOUNT,
            );
            taxPaid = taxPayment.amountPaid;

            if (taxPayment.payerBecameBankrupt) {
                bankruptcy = {
                    playerName: movingPlayerName,
                    reason: 'Số dư đã về 0 sau khi đóng thuế',
                    amountDue: taxPayment.amountDue,
                    amountPaid: taxPayment.amountPaid,
                };
            }
        }

        if (action === 'PAY_LUXURY_TAX') {
            const taxPayment = payTax(
                movingPlayerId,
                LUXURY_TAX_AMOUNT,
            );
            taxPaid = taxPayment.amountPaid;

            if (taxPayment.payerBecameBankrupt) {
                bankruptcy = {
                    playerName: movingPlayerName,
                    reason: 'Số dư đã về 0 sau khi đóng thuế',
                    amountDue: taxPayment.amountDue,
                    amountPaid: taxPayment.amountPaid,
                };
            }
        }

        if (action === 'PAY_RENT') {
            const rentResult = payPropertyRent(
                movingPlayerId,
                destinationCell,
            );
            const owner = rentResult
                ? players.find(
                    (player) =>
                        player.id ===
                        rentResult.ownerPlayerId,
                )
                : undefined;

            if (rentResult && owner) {
                rentPayment = {
                    payerName: movingPlayerName,
                    ownerName: owner.name,
                    propertyName: destinationCell.name,
                    amountDue: rentResult.amountDue,
                    amountPaid: rentResult.amountPaid,
                };

                if (rentResult.payerBecameBankrupt) {
                    bankruptcy = {
                        playerName: movingPlayerName,
                        reason: 'Số dư đã về 0 sau khi trả thuê',
                        amountDue: rentResult.amountDue,
                        amountPaid: rentResult.amountPaid,
                    };
                }
            }
        }

        if (action === 'GO_TO_JAIL') {
            sendPlayerToJail(movingPlayerId);
            jailMove = {
                playerName: movingPlayerName,
            };
        }

        setLastMoveResult({
            playerName: movingPlayerName,
            cellId: destinationCell.id,
            cellPosition: destinationCell.position,
            cellName: destinationCell.name,
            cellType: destinationCell.type,
            action,
            startReward: passedStart
                ? START_REWARD
                : undefined,
            taxPaid,
            rentPayment,
            jailMove,
            bankruptcy,
        });

        setIsPlayerMoving(false);

        if (
            action === 'BUY_PROPERTY' ||
            action === 'BUILD_PROPERTY' ||
            action === 'DRAW_CHANCE_CARD' ||
            action === 'DRAW_COMMUNITY_CARD'
        ) {
            setIsWaitingForAction(true);
            return;
        }

        moveToNextPlayer(
            bankruptcy ? movingPlayerId : undefined,
        );
    }

    async function handleRollDice(
        diceValue: number,
    ): Promise<void> {
        if (currentPlayer?.isInJail) {
            setPlayers((currentPlayers) =>
                gameAPI.releasePlayerFromJail(
                    currentPlayers,
                    currentPlayer.id,
                ),
            );
        }

        await moveCurrentPlayer(diceValue);
    }

    function handleUseJailFreeCard(): void {
        if (
            !currentPlayer ||
            !currentPlayer.isInJail ||
            (currentPlayer.jailFreeCardCount ?? 0) <= 0
        ) {
            return;
        }

        setPlayers((currentPlayers) =>
            gameAPI.useJailFreeCard(
                currentPlayers,
                currentPlayer.id,
            ),
        );

        setLastMoveResult({
            playerName: currentPlayer.name,
            cellId: JAIL_POSITION,
            cellPosition: JAIL_POSITION,
            cellName: 'Nhà tù',
            cellType: 'JAIL',
            action: 'NONE',
            jailFreeCardUsed: {
                playerName: currentPlayer.name,
            },
        });
    }

    function handleSkipJailFreeCard(): void {
        if (!currentPlayer || !currentPlayer.isInJail) {
            return;
        }

        setPlayers((currentPlayers) =>
            gameAPI.releasePlayerFromJail(
                currentPlayers,
                currentPlayer.id,
            ),
        );
    }

    return {
        players,
        gameId,
        currentPlayer,
        isPlayerMoving,
        isSubmittingAction,
        isWaitingForAction,
        actionError,
        lastMoveResult,
        propertyOwnerships,
        drawnCard,
        landedCell,
        landedPropertyPrice,
        landedPropertyOwnership,
        landedImprovementPrice,
        landedRentAfterImprovement,
        canAffordProperty,
        canAffordPropertyImprovement,
        clearActionError,
        moveCurrentPlayer: (stepCount: number) => {
            void runGameAction(() =>
                moveCurrentPlayer(stepCount),
            );
        },
        handleRollDice: (diceValue: number) => {
            void runGameAction(() =>
                handleRollDice(diceValue),
            );
        },
        handleBuyProperty: () => {
            void runGameAction(handleBuyProperty);
        },
        handleSkipProperty: () => {
            void runGameAction(handleSkipProperty);
        },
        handleBuildProperty: () => {
            void runGameAction(handleBuildProperty);
        },
        handleSkipBuildProperty: () => {
            void runGameAction(handleSkipBuildProperty);
        },
        handleMortgageProperty: (boardCellId: number) => {
            void runGameAction(() => {
                handleMortgageProperty(boardCellId);
            });
        },
        handleRedeemProperty: (boardCellId: number) => {
            void runGameAction(() => {
                handleRedeemProperty(boardCellId);
            });
        },
        handleUseJailFreeCard: () => {
            void runGameAction(handleUseJailFreeCard);
        },
        handleSkipJailFreeCard: () => {
            void runGameAction(handleSkipJailFreeCard);
        },
        handleDrawChanceCard: () => {
            void runGameAction(handleDrawChanceCard);
        },
        handleDrawCommunityCard: () => {
            void runGameAction(handleDrawCommunityCard);
        },
        handleExecuteCard: () => {
            void runGameAction(handleExecuteCard);
        },
    };
}

export default useBoardGame;
