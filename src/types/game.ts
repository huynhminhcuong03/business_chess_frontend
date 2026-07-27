import type {
    BoardCellType,
} from './board';

export type CellAction =
    | 'NONE'
    | 'BUY_PROPERTY'
    | 'BUILD_PROPERTY'
    | 'PAY_RENT'
    | 'DRAW_CHANCE_CARD'
    | 'DRAW_COMMUNITY_CARD'
    | 'PAY_INCOME_TAX'
    | 'PAY_LUXURY_TAX'
    | 'GO_TO_JAIL';

export interface LastMoveResult {
    playerName: string;
    cellId: number;
    cellPosition: number;
    cellName: string;
    cellType: BoardCellType;
    action: CellAction;

    startReward?: number;
    taxPaid?: number;
    rentPayment?: {
        payerName: string;
        ownerName: string;
        propertyName: string;
        amountDue: number;
        amountPaid: number;
    };
    jailMove?: {
        playerName: string;
    };
    jailFreeCardUsed?: {
        playerName: string;
    };
    bankruptcy?: {
        playerName: string;
        reason: string;
        amountDue: number;
        amountPaid: number;
    };
}

export interface PropertyOwnership {
    boardCellId: number;
    ownerPlayerId: number;
    houseCount: number;
    hasHotel: boolean;
    mortgaged: boolean;
}
