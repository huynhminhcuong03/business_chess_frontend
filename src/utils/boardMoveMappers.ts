import type { ResolvedMove } from '../types/boardFlow';
import type {
    JailActionResponse,
    RollDiceResponse,
} from '../types/gameApi';

export function getRollRentDiceTotal(
    rollResult: RollDiceResponse,
): number {
    return rollResult.dice1 + rollResult.dice2;
}

export function toResolvedMoveFromRoll(
    rollResult: RollDiceResponse,
): ResolvedMove {
    return {
        currentPlayerId: rollResult.currentPlayerId,
        nextPlayerId: rollResult.nextPlayerId,
        oldPosition: rollResult.oldPosition,
        newPosition: rollResult.newPosition,
        stepCount: rollResult.total,
        rentDiceTotal: getRollRentDiceTotal(rollResult),
        startReward: rollResult.startReward,
        currentPlayerMoney: rollResult.currentPlayerMoney,
    };
}

export function toResolvedMoveFromJailAction(
    jailAction: JailActionResponse,
): ResolvedMove {
    return {
        currentPlayerId: jailAction.currentPlayerId,
        nextPlayerId: jailAction.nextPlayerId,
        oldPosition: jailAction.oldPosition,
        newPosition: jailAction.newPosition,
        stepCount: jailAction.total,
        rentDiceTotal: jailAction.total,
        startReward: jailAction.startReward,
        currentPlayerMoney: jailAction.currentPlayerMoney,
    };
}

export function toRollDiceResponseFromJailAction(
    jailAction: JailActionResponse,
): RollDiceResponse {
    return {
        dice1: jailAction.dice1,
        dice2: jailAction.dice2,
        total: jailAction.total,
        isDouble: jailAction.isDouble,
        oldPosition: jailAction.oldPosition,
        newPosition: jailAction.newPosition,
        passedStart: jailAction.passedStart,
        startReward: jailAction.startReward,
        currentPlayerMoney: jailAction.currentPlayerMoney,
        currentPlayerId: jailAction.currentPlayerId,
        nextPlayerId: jailAction.nextPlayerId,
    };
}
