import type { JailActionType } from './gameApi';
import type { GamePlayerResponse } from './playerApi';

export interface ResolvedMove {
    currentPlayerId: number;
    nextPlayerId: number;
    oldPosition: number;
    newPosition: number;
    stepCount: number;
    rentDiceTotal: number;
    startReward: number;
    currentPlayerMoney: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface JailMoveAnimationState {
    id: number;
    player: GamePlayerResponse;
    from: Point;
    to: Point;
}

export interface TestMoveOptions {
    targetPosition: number;
    rentDiceTotal: number;
}

export interface TestRollOptions {
    dice1: number;
    dice2: number;
}

export interface SelectedJailAction {
    playerId: number;
    actionType: JailActionType;
}
