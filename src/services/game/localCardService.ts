import { boardCells } from '../../data/boardCells';
import {
    chanceCards,
    communityCards,
    drawRandomCard,
} from '../../data/card';
import type { CardType, GameCard } from '../../types/card';
import type { PropertyOwnership } from '../../types/game';
import type { Player } from '../../types/player';
import {
    findNearestPosition,
    getPropertyRent,
    STATION_POSITIONS,
    UTILITY_POSITIONS,
} from '../../utils/boardGameRules';
import {
    addJailFreeCard,
    changePlayerMoney,
    movePlayerToPosition,
    payPropertyRent,
    payRentAmount,
    sendPlayerToJail,
} from './localGameService';

export interface CardExecutionState {
    players: Player[];
    propertyOwnerships: PropertyOwnership[];
}

export interface CardExecutionResult {
    players: Player[];
    excludedPlayerId?: number;
}

export function drawCard(cardType: CardType): GameCard {
    return cardType === 'CHANCE'
        ? drawRandomCard(chanceCards)
        : drawRandomCard(communityCards);
}

export function getMoveBackTargetPosition(
    currentPosition: number,
    steps: number,
): number {
    return (
        currentPosition -
        steps +
        boardCells.length
    ) % boardCells.length;
}

export function getNearestStationPosition(
    currentPosition: number,
): number {
    return findNearestPosition(
        currentPosition,
        STATION_POSITIONS,
    );
}

export function getNearestUtilityPosition(
    currentPosition: number,
): number {
    return findNearestPosition(
        currentPosition,
        UTILITY_POSITIONS,
    );
}

export function calculatePropertyRepairAmount(
    propertyOwnerships: PropertyOwnership[],
    ownerPlayerId: number,
    amountPerHouse: number,
    amountPerHotel: number,
): number {
    const playerProperties =
        propertyOwnerships.filter(
            (ownership) =>
                ownership.ownerPlayerId === ownerPlayerId,
        );

    const houseCount = playerProperties.reduce(
        (total, ownership) =>
            total + ownership.houseCount,
        0,
    );

    const hotelCount = playerProperties.filter(
        (ownership) => ownership.hasHotel,
    ).length;

    return (
        houseCount * amountPerHouse +
        hotelCount * amountPerHotel
    );
}

export function executeCardAction(
    state: CardExecutionState,
    currentPlayer: Player,
    card: GameCard,
): CardExecutionResult {
    const playerId = currentPlayer.id;
    const actionData = card.actionData;
    let nextPlayers = state.players;
    let excludedPlayerId: number | undefined;

    switch (card.actionType) {
        case 'RECEIVE_FROM_BANK':
            nextPlayers = changePlayerMoney(
                nextPlayers,
                playerId,
                actionData.amount ?? 0,
            );
            break;

        case 'PAY_TO_BANK':
            if (
                currentPlayer.money -
                    (actionData.amount ?? 0) <=
                0
            ) {
                excludedPlayerId = playerId;
            }

            nextPlayers = changePlayerMoney(
                nextPlayers,
                playerId,
                -(actionData.amount ?? 0),
            );
            break;

        case 'PAY_EACH_PLAYER': {
            const amountPerPlayer =
                actionData.amountPerPlayer ?? 0;
            const totalAmount =
                amountPerPlayer *
                (nextPlayers.length - 1);

            if (currentPlayer.money - totalAmount <= 0) {
                excludedPlayerId = playerId;
            }

            nextPlayers = changePlayerMoney(
                nextPlayers,
                playerId,
                -totalAmount,
            ).map((player) =>
                player.id === playerId
                    ? player
                    : {
                        ...player,
                        money:
                            player.money +
                            amountPerPlayer,
                    },
            );

            break;
        }

        case 'COLLECT_FROM_EACH_PLAYER': {
            const amountPerPlayer =
                actionData.amountPerPlayer ?? 0;
            let collectedAmount = 0;

            nextPlayers = nextPlayers.map((player) => {
                if (player.id === playerId) {
                    return player;
                }

                const paidAmount = Math.min(
                    player.money,
                    amountPerPlayer,
                );
                const nextMoney =
                    player.money - paidAmount;

                collectedAmount += paidAmount;

                return {
                    ...player,
                    money: nextMoney,
                    isBankrupt:
                        player.isBankrupt ||
                        nextMoney === 0,
                };
            });

            nextPlayers = nextPlayers.map((player) =>
                player.id === playerId
                    ? {
                        ...player,
                        money:
                            player.money +
                            collectedAmount,
                    }
                    : player,
            );

            break;
        }

        case 'MOVE_BACK': {
            const targetPosition =
                getMoveBackTargetPosition(
                    currentPlayer.position,
                    actionData.steps ?? 0,
                );

            nextPlayers = movePlayerToPosition(
                nextPlayers,
                playerId,
                targetPosition,
                false,
            );
            break;
        }

        case 'MOVE_TO_POSITION': {
            const targetPosition =
                actionData.targetPosition;

            if (targetPosition !== undefined) {
                nextPlayers = movePlayerToPosition(
                    nextPlayers,
                    playerId,
                    targetPosition,
                    actionData.collectStartSalary ??
                        false,
                );
            }
            break;
        }

        case 'MOVE_TO_NEAREST_STATION': {
            const targetPosition =
                getNearestStationPosition(
                    currentPlayer.position,
                );

            nextPlayers = movePlayerToPosition(
                nextPlayers,
                playerId,
                targetPosition,
                actionData.collectStartSalary ?? false,
            );

            const stationCell = boardCells.find(
                (cell) =>
                    cell.position === targetPosition,
            );
            const ownership =
                stationCell === undefined
                    ? undefined
                    : state.propertyOwnerships.find(
                        (currentOwnership) =>
                            currentOwnership.boardCellId ===
                            stationCell.id,
                    );

            if (stationCell && ownership) {
                const rentResult = payPropertyRent(
                    nextPlayers,
                    state.propertyOwnerships,
                    playerId,
                    stationCell,
                    getPropertyRent(
                        stationCell,
                        ownership,
                    ) *
                        (actionData.rentMultiplier ?? 1),
                );

                if (rentResult) {
                    nextPlayers = rentResult.players;

                    if (
                        rentResult.result
                            .payerBecameBankrupt
                    ) {
                        excludedPlayerId = playerId;
                    }
                }
            }

            break;
        }

        case 'MOVE_TO_NEAREST_UTILITY': {
            const targetPosition =
                getNearestUtilityPosition(
                    currentPlayer.position,
                );

            nextPlayers = movePlayerToPosition(
                nextPlayers,
                playerId,
                targetPosition,
                actionData.collectStartSalary ?? false,
            );

            const utilityCell = boardCells.find(
                (cell) =>
                    cell.position === targetPosition,
            );
            const ownership =
                utilityCell === undefined
                    ? undefined
                    : state.propertyOwnerships.find(
                        (currentOwnership) =>
                            currentOwnership.boardCellId ===
                            utilityCell.id,
                    );

            if (
                ownership &&
                ownership.ownerPlayerId !== playerId &&
                !ownership.mortgaged
            ) {
                const diceValue =
                    Math.floor(Math.random() * 6) + 1;
                const rentResult = payRentAmount(
                    nextPlayers,
                    playerId,
                    ownership.ownerPlayerId,
                    diceValue *
                        (actionData.rentMultiplier ?? 10),
                );

                nextPlayers = rentResult.players;

                if (
                    rentResult.result
                        .payerBecameBankrupt
                ) {
                    excludedPlayerId = playerId;
                }
            }

            break;
        }

        case 'GO_TO_JAIL':
            nextPlayers = sendPlayerToJail(
                nextPlayers,
                playerId,
            );
            break;

        case 'REPAIR_PROPERTIES': {
            const repairAmount =
                calculatePropertyRepairAmount(
                    state.propertyOwnerships,
                    playerId,
                    actionData.amountPerHouse ?? 0,
                    actionData.amountPerHotel ?? 0,
                );

            if (currentPlayer.money - repairAmount <= 0) {
                excludedPlayerId = playerId;
            }

            nextPlayers = changePlayerMoney(
                nextPlayers,
                playerId,
                -repairAmount,
            );
            break;
        }

        case 'GET_OUT_OF_JAIL':
            nextPlayers = addJailFreeCard(
                nextPlayers,
                playerId,
            );
            break;

        default:
            break;
    }

    return {
        players: nextPlayers,
        excludedPlayerId,
    };
}

export const cardAPI = {
    draw: drawCard,
    getMoveBackTargetPosition,
    getNearestStationPosition,
    getNearestUtilityPosition,
    calculatePropertyRepairAmount,
    execute: executeCardAction,
};
