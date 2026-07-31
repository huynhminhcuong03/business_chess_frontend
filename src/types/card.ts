export type CardType = 'CHANCE' | 'COMMUNITY';

export type CardActionType =
    | 'RECEIVE_FROM_BANK'
    | 'PAY_TO_BANK'
    | 'PAY_EACH_PLAYER'
    | 'COLLECT_FROM_EACH_PLAYER'
    | 'MOVE_BACK'
    | 'MOVE_TO_POSITION'
    | 'MOVE_TO_NEAREST_UTILITY'
    | 'MOVE_TO_NEAREST_STATION'
    | 'GO_TO_JAIL'
    | 'REPAIR_PROPERTIES'
    | 'GET_OUT_OF_JAIL';

export interface CardActionData {
    [key: string]: unknown;
    amount?: number;
    amountPerPlayer?: number;
    steps?: number;
    targetPosition?: number;
    collectStartSalary?: boolean;
    amountPerHouse?: number;
    amountPerHotel?: number;
    keepable?: boolean;
    rentMultiplier?: number;
    canPurchaseIfUnowned?: boolean;
}

export interface GameCard {
    id: number;
    boardId: number;
    type?: CardType;
    title: string;
    description: string;
    actionType: CardActionType;
    actionData: CardActionData | unknown | null;
    amount: number | null;
    targetPosition: number | null;
}
