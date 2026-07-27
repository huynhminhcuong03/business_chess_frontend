import { START_REWARD } from '../../constants/gameRules';
import type { BoardCell } from '../../types/board';
import type { PropertyOwnership } from '../../types/game';
import type {
    GameStateSlice,
    PaymentStateResult,
    RentPaymentStateResult,
} from '../../types/gameService';
import type { Player } from '../../types/player';
import {
    canMortgageProperty,
    canRedeemMortgage,
    getMortgageRedeemCost,
    JAIL_POSITION,
} from '../../utils/boardGameRules';
import {
    settlePlayerPayment,
} from '../../utils/playerFinance';

export function getNextActivePlayerIndex(
    players: Player[],
    currentPlayerIndex: number,
    excludedPlayerId?: number,
): number {
    const activePlayers = players.filter(
        (player) =>
            !player.isBankrupt &&
            player.id !== excludedPlayerId,
    );

    if (activePlayers.length === 0) {
        return currentPlayerIndex;
    }

    if (activePlayers.length === 1) {
        const onlyActivePlayerIndex = players.findIndex(
            (player) =>
                player.id === activePlayers[0]?.id,
        );

        return onlyActivePlayerIndex >= 0
            ? onlyActivePlayerIndex
            : currentPlayerIndex;
    }

    for (
        let offset = 1;
        offset <= players.length;
        offset += 1
    ) {
        const nextIndex =
            (currentPlayerIndex + offset) % players.length;
        const nextPlayer = players[nextIndex];

        if (
            nextPlayer &&
            !nextPlayer.isBankrupt &&
            nextPlayer.id !== excludedPlayerId
        ) {
            return nextIndex;
        }
    }

    return currentPlayerIndex;
}

export function changePlayerMoney(
    players: Player[],
    playerId: number,
    amount: number,
): Player[] {
    return players.map((player) =>
        player.id === playerId
            ? (() => {
                const nextMoney = Math.max(
                    0,
                    player.money + amount,
                );

                return {
                    ...player,
                    money: nextMoney,
                    isBankrupt:
                        player.isBankrupt ||
                        nextMoney === 0,
                };
            })()
            : player,
    );
}

export function payBankAmount(
    players: Player[],
    playerId: number,
    amount: number,
): PaymentStateResult {
    return settlePlayerPayment(players, playerId, amount);
}

export function payRentAmount(
    players: Player[],
    tenantPlayerId: number,
    ownerPlayerId: number,
    rentAmount: number,
): PaymentStateResult {
    return settlePlayerPayment(
        players,
        tenantPlayerId,
        rentAmount,
        ownerPlayerId,
    );
}

export function buyProperty(
    state: GameStateSlice,
    player: Player,
    propertyCell: BoardCell,
): GameStateSlice {
    if (
        !propertyCell.propertyDetails ||
        player.money <
            propertyCell.propertyDetails.buyPrice ||
        state.propertyOwnerships.some(
            (ownership) =>
                ownership.boardCellId === propertyCell.id,
        )
    ) {
        return state;
    }

    return {
        players: changePlayerMoney(
            state.players,
            player.id,
            -propertyCell.propertyDetails.buyPrice,
        ),
        propertyOwnerships: [
            ...state.propertyOwnerships,
            {
                boardCellId: propertyCell.id,
                ownerPlayerId: player.id,
                houseCount: 0,
                hasHotel: false,
                mortgaged: false,
            },
        ],
    };
}

export function buildProperty(
    state: GameStateSlice,
    player: Player,
    propertyCell: BoardCell,
    ownership: PropertyOwnership,
    improvementCost: number,
): GameStateSlice {
    if (player.money < improvementCost) {
        return state;
    }

    return {
        players: changePlayerMoney(
            state.players,
            player.id,
            -improvementCost,
        ),
        propertyOwnerships: state.propertyOwnerships.map(
            (currentOwnership) => {
                if (
                    currentOwnership.boardCellId !==
                        propertyCell.id ||
                    currentOwnership.ownerPlayerId !==
                        player.id
                ) {
                    return currentOwnership;
                }

                if (ownership.houseCount >= 4) {
                    return {
                        ...currentOwnership,
                        houseCount: 0,
                        hasHotel: true,
                    };
                }

                return {
                    ...currentOwnership,
                    houseCount:
                        currentOwnership.houseCount + 1,
                };
            },
        ),
    };
}

export function mortgageProperty(
    state: GameStateSlice,
    player: Player,
    propertyCell: BoardCell,
    ownership: PropertyOwnership,
): GameStateSlice {
    if (
        player.isBankrupt ||
        !propertyCell.propertyDetails ||
        !canMortgageProperty(propertyCell, ownership)
    ) {
        return state;
    }

    return {
        players: changePlayerMoney(
            state.players,
            player.id,
            propertyCell.propertyDetails.mortgagePrice,
        ),
        propertyOwnerships: state.propertyOwnerships.map(
            (currentOwnership) =>
                currentOwnership.boardCellId ===
                propertyCell.id
                    ? {
                        ...currentOwnership,
                        mortgaged: true,
                    }
                    : currentOwnership,
        ),
    };
}

export function redeemProperty(
    state: GameStateSlice,
    player: Player,
    propertyCell: BoardCell,
    ownership: PropertyOwnership,
): GameStateSlice {
    if (
        player.isBankrupt ||
        !canRedeemMortgage(
            propertyCell,
            ownership,
            player.money,
        )
    ) {
        return state;
    }

    const redeemCost = getMortgageRedeemCost(propertyCell);

    if (redeemCost === null) {
        return state;
    }

    return {
        players: changePlayerMoney(
            state.players,
            player.id,
            -redeemCost,
        ),
        propertyOwnerships: state.propertyOwnerships.map(
            (currentOwnership) =>
                currentOwnership.boardCellId ===
                propertyCell.id
                    ? {
                        ...currentOwnership,
                        mortgaged: false,
                    }
                    : currentOwnership,
        ),
    };
}

export function movePlayerToPosition(
    players: Player[],
    playerId: number,
    targetPosition: number,
    collectStartSalary: boolean,
): Player[] {
    const player = players.find(
        (currentPlayer) => currentPlayer.id === playerId,
    );

    if (!player) {
        return players;
    }

    const passedStart = targetPosition < player.position;

    return players.map((currentPlayer) =>
        currentPlayer.id === playerId
            ? {
                ...currentPlayer,
                position: targetPosition,
                money:
                    currentPlayer.money +
                    (collectStartSalary && passedStart
                        ? START_REWARD
                        : 0),
            }
            : currentPlayer,
    );
}

export function movePlayerOneStep(
    players: Player[],
    playerId: number,
    position: number,
): Player[] {
    return players.map((player) =>
        player.id === playerId
            ? {
                ...player,
                position,
            }
            : player,
    );
}

export function sendPlayerToJail(
    players: Player[],
    playerId: number,
): Player[] {
    return players.map((player) =>
        player.id === playerId
            ? {
                ...player,
                position: JAIL_POSITION,
                isInJail: true,
            }
            : player,
    );
}

export function releasePlayerFromJail(
    players: Player[],
    playerId: number,
): Player[] {
    return players.map((player) =>
        player.id === playerId
            ? {
                ...player,
                isInJail: false,
            }
            : player,
    );
}

export function useJailFreeCard(
    players: Player[],
    playerId: number,
): Player[] {
    return players.map((player) =>
        player.id === playerId
            ? {
                ...player,
                jailFreeCardCount:
                    (player.jailFreeCardCount ?? 0) - 1,
                isInJail: false,
            }
            : player,
    );
}

export function addJailFreeCard(
    players: Player[],
    playerId: number,
): Player[] {
    return players.map((player) =>
        player.id === playerId
            ? {
                ...player,
                jailFreeCardCount:
                    (player.jailFreeCardCount ?? 0) + 1,
            }
            : player,
    );
}

export function payPropertyRent(
    players: Player[],
    propertyOwnerships: PropertyOwnership[],
    tenantPlayerId: number,
    propertyCell: BoardCell,
    rentAmount: number,
): RentPaymentStateResult | null {
    const ownership = propertyOwnerships.find(
        (currentOwnership) =>
            currentOwnership.boardCellId === propertyCell.id,
    );

    if (
        !ownership ||
        ownership.ownerPlayerId === tenantPlayerId ||
        ownership.mortgaged
    ) {
        return null;
    }

    return {
        ownerPlayerId: ownership.ownerPlayerId,
        rentAmount,
        ...payRentAmount(
            players,
            tenantPlayerId,
            ownership.ownerPlayerId,
            rentAmount,
        ),
    };
}

export const gameAPI = {
    getNextActivePlayerIndex,
    changePlayerMoney,
    payBankAmount,
    payRentAmount,
    buyProperty,
    buildProperty,
    mortgageProperty,
    redeemProperty,
    movePlayerToPosition,
    movePlayerOneStep,
    sendPlayerToJail,
    releasePlayerFromJail,
    useJailFreeCard,
    addJailFreeCard,
    payPropertyRent,
};
