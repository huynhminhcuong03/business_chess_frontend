export type TokenColor =
    | 'RED'
    | 'BLUE'
    | 'GREEN'
    | 'YELLOW';

export interface PlayerResponse {
    id: number;
    username: string;
    displayName: string;
    createdAt: string;
}

export interface GamePlayerResponse {
    id: number;
    gameId: number;
    player: PlayerResponse;
    turnOrder: number;
    tokenColor: TokenColor;
    money: number;
    position: number;
    inJail: boolean;
    jailTurn: number;
    bankrupt: boolean;
    jailFreeCard: number;
    joinedAt: string;
}

export interface CreateGamePlayerRequest {
    gameId: number;
    username: string;
    displayName: string;
    tokenColor: TokenColor;
}
