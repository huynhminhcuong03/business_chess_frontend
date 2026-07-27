import type { BoardCellType } from './board';
import type { CardType, GameCard } from './card';
import type { PlayerTokenColor } from './player';

export interface PlayerDTO {
    id: number;
    name: string;
    position: number;
    tokenColor: PlayerTokenColor;
    money: number;
    jailFreeCardCount: number;
    isInJail: boolean;
    isBankrupt: boolean;
}

export interface PropertyOwnershipDTO {
    boardCellId: number;
    ownerPlayerId: number;
    houseCount: number;
    hasHotel: boolean;
    mortgaged: boolean;
}

export interface LastMoveDTO {
    playerName: string;
    cellId: number;
    cellPosition: number;
    cellName: string;
    cellType: BoardCellType;
    action: string;
}

export interface GameSnapshotDTO {
    gameId: string;
    players: PlayerDTO[];
    currentPlayerIndex: number;
    propertyOwnerships: PropertyOwnershipDTO[];
    lastMoveResult: LastMoveDTO | null;
    isWaitingForAction: boolean;
}

export interface GameActionResponse {
    snapshot: GameSnapshotDTO;
    message?: string;
}

export interface GameActionRequest {
    gameId: string;
    playerId: number;
}

export interface RollDiceRequest extends GameActionRequest {
    diceValue: number;
}

export interface BuyPropertyRequest extends GameActionRequest {
    boardCellId: number;
}

export interface BuildPropertyRequest
    extends GameActionRequest {
    boardCellId: number;
}

export interface MortgagePropertyRequest
    extends GameActionRequest {
    boardCellId: number;
}

export interface RedeemPropertyRequest
    extends GameActionRequest {
    boardCellId: number;
}

export interface DrawCardRequest extends GameActionRequest {
    cardType: CardType;
}

export interface DrawCardResponse {
    card: GameCard;
}

export interface ExecuteCardRequest
    extends GameActionRequest {
    cardId: number;
}
