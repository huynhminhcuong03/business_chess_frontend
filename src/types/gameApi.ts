import type { GamePlayerResponse } from './playerApi';
import type { BoardCellType } from './boardCell';
import type {
    CardActionType,
    CardType,
    GameCard,
} from './card';
import type { CellAction } from './game';

export type GameMode = 'NORMAL' | 'QUICK';

export type GameStatus =
    | 'WAITING'
    | 'PLAYING'
    | 'FINISHED'
    | 'CANCELLED';

export interface CreateGameRequest {
    gameMode?: GameMode;
}

export interface GameResponse {
    id: number;
    boardId: number;
    status: GameStatus;
    gameMode: GameMode;
    currentPlayerId: number | null;
    winnerId: number | null;
    consecutiveDoubles: number;
    createdAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    updatedAt: string;
    players: GamePlayerResponse[];
    properties: GamePropertyResponse[];
}

export interface RollDiceResponse {
    dice1: number;
    dice2: number;
    total: number;
    isDouble: boolean;
    oldPosition: number;
    newPosition: number;
    passedStart: boolean;
    startReward: number;
    currentPlayerMoney: number;
    currentPlayerId: number;
    nextPlayerId: number;
    sentToJail?: boolean;
    jailPosition?: number | null;
    inJail?: boolean;
    jailTurn?: number;
    jailFreeCard?: number;
}

export interface TestMoveRequest {
    targetPosition: number;
    diceTotal: number;
}

export interface TestRollRequest {
    dice1: number;
    dice2: number;
}

export interface GamePropertyResponse {
    id: number;
    boardCellId: number;
    boardCellPosition: number;
    boardCellName: string;
    ownerGamePlayerId: number;
    ownerPlayerId: number;
    houseCount: number;
    hasHotel: boolean;
    mortgaged: boolean;
}

export interface LandedPropertyResponse {
    gamePropertyId: number | null;
    ownerGamePlayerId: number | null;
    ownerPlayerId: number | null;
    buyPrice: number;
    rent: number | null;
    houseCount: number;
    hasHotel: boolean;
    mortgaged: boolean;
}

export interface LandCellResponse {
    cellId: number;
    cellPosition: number;
    cellName: string;
    cellType: BoardCellType;
    action: CellAction;
    property: LandedPropertyResponse | null;
}

export interface BuyPropertyResponse {
    gamePropertyId: number;
    boardCellId: number;
    boardCellPosition: number;
    boardCellName: string;
    ownerGamePlayerId: number;
    ownerMoney: number;
    buyPrice: number;
}

export interface PayRentResponse {
    boardCellId: number;
    boardCellPosition: number;
    boardCellName: string;
    payerGamePlayerId: number;
    ownerGamePlayerId: number;
    rentAmount: number;
    payerMoney: number;
    ownerMoney: number;
}

export interface PayRentRequest {
    diceTotal: number;
}

export type IncomeTaxOption = 'FIXED' | 'PERCENT';

export interface PayTaxRequest {
    incomeTaxOption?: IncomeTaxOption;
}

export interface PayTaxResponse {
    boardCellId: number;
    boardCellPosition: number;
    boardCellName: string;
    taxType: 'INCOME_TAX' | 'LUXURY_TAX';
    incomeTaxOption: IncomeTaxOption | null;
    taxAmount: number;
    playerMoney: number;
    netWorth: number | null;
}

export interface CardPlayerMoneyChangeResponse {
    gamePlayerId: number;
    moneyDelta: number;
    moneyAfter: number;
}

export interface DrawCardResponse {
    card: GameCard;
    cardType: CardType;
    actionType: CardActionType;
    gamePlayerId: number;
    oldPosition: number;
    newPosition: number;
    moved: boolean;
    passedStart: boolean;
    startReward: number;
    sentToJail: boolean;
    jailPosition: number | null;
    currentPlayerMoney: number;
    nextPlayerId: number | null;
    moneyChanges: CardPlayerMoneyChangeResponse[];
}

export type JailActionType =
    | 'PAY_FINE'
    | 'ROLL_FOR_DOUBLE'
    | 'USE_JAIL_CARD';

export interface JailActionRequest {
    actionType: JailActionType;
}

export interface JailActionResponse {
    actionType: JailActionType;
    dice1: number;
    dice2: number;
    total: number;
    isDouble: boolean;
    moved: boolean;
    oldPosition: number;
    newPosition: number;
    passedStart: boolean;
    startReward: number;
    currentPlayerMoney: number;
    currentPlayerId: number;
    nextPlayerId: number;
    inJail: boolean;
    jailTurn: number;
    jailFreeCard: number;
    finePaid: number;
}

export interface GoToJailResponse {
    gamePlayerId: number;
    fromPosition: number;
    jailPosition: number;
    inJail: boolean;
    jailTurn: number;
    jailFreeCard: number;
}
