import type {
    DrawCardResponse,
    GoToJailResponse,
    JailActionResponse,
    PayRentResponse,
    PayTaxResponse,
    RollDiceResponse,
} from '../types/gameApi';
import type { GamePlayerResponse } from '../types/playerApi';

export function updateMovedPlayer(
    players: GamePlayerResponse[],
    gamePlayerId: number,
    position: number,
    money: number,
): GamePlayerResponse[] {
    return players.map((player) =>
        player.id === gamePlayerId
            ? {
                  ...player,
                  position,
                  money,
              }
            : player,
    );
}

export function updateTripleDoubleJailedPlayer(
    players: GamePlayerResponse[],
    result: RollDiceResponse,
    jailPosition: number,
): GamePlayerResponse[] {
    return players.map((player) =>
        player.id === result.currentPlayerId
            ? {
                  ...player,
                  position: jailPosition,
                  money: result.currentPlayerMoney,
                  inJail: result.inJail ?? true,
                  jailTurn: result.jailTurn ?? 0,
                  jailFreeCard:
                      result.jailFreeCard ??
                      player.jailFreeCard,
              }
            : player,
    );
}

export function updatePlayerAfterJailAction(
    players: GamePlayerResponse[],
    jailAction: JailActionResponse,
): GamePlayerResponse[] {
    return players.map((player) =>
        player.id === jailAction.currentPlayerId
            ? {
                  ...player,
                  money: jailAction.currentPlayerMoney,
                  inJail: jailAction.inJail,
                  jailTurn: jailAction.jailTurn,
                  jailFreeCard: jailAction.jailFreeCard,
              }
            : player,
    );
}

export function updateRentPayerMoney(
    players: GamePlayerResponse[],
    rentPayment: PayRentResponse,
): GamePlayerResponse[] {
    return players.map((player) =>
        player.id === rentPayment.payerGamePlayerId
            ? {
                  ...player,
                  money: rentPayment.payerMoney,
              }
            : player,
    );
}

export function updateRentOwnerMoney(
    players: GamePlayerResponse[],
    rentPayment: PayRentResponse,
): GamePlayerResponse[] {
    return players.map((player) =>
        player.id === rentPayment.ownerGamePlayerId
            ? {
                  ...player,
                  money: rentPayment.ownerMoney,
              }
            : player,
    );
}

export function updatePlayerAfterGoToJail(
    players: GamePlayerResponse[],
    goToJailResult: GoToJailResponse,
): GamePlayerResponse[] {
    return players.map((player) =>
        player.id === goToJailResult.gamePlayerId
            ? {
                  ...player,
                  position: goToJailResult.jailPosition,
                  inJail: goToJailResult.inJail,
                  jailTurn: goToJailResult.jailTurn,
                  jailFreeCard: goToJailResult.jailFreeCard,
              }
            : player,
    );
}

export function updatePlayerMoneyAfterTax(
    players: GamePlayerResponse[],
    gamePlayerId: number,
    taxPayment: PayTaxResponse,
): GamePlayerResponse[] {
    return players.map((player) =>
        player.id === gamePlayerId
            ? {
                  ...player,
                  money: taxPayment.playerMoney,
              }
            : player,
    );
}

export function updatePlayersAfterCardDraw(
    players: GamePlayerResponse[],
    cardResult: DrawCardResponse,
): GamePlayerResponse[] {
    return players.map((player) => {
        const moneyChange = cardResult.moneyChanges.find(
            (change) => change.gamePlayerId === player.id,
        );

        if (player.id !== cardResult.gamePlayerId && !moneyChange) {
            return player;
        }

        return {
            ...player,
            money:
                moneyChange?.moneyAfter ??
                (player.id === cardResult.gamePlayerId
                    ? cardResult.currentPlayerMoney
                    : player.money),
            position:
                player.id === cardResult.gamePlayerId &&
                cardResult.moved
                    ? cardResult.newPosition
                    : player.position,
            inJail:
                player.id === cardResult.gamePlayerId &&
                cardResult.sentToJail
                    ? true
                    : player.inJail,
            jailTurn:
                player.id === cardResult.gamePlayerId &&
                cardResult.sentToJail
                    ? 0
                    : player.jailTurn,
        };
    });
}
