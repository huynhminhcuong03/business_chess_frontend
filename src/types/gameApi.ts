export type GameMode = 'NORMAL' | 'QUICK';

export type GameStatus =
    | 'WAITING'
    | 'PLAYING'
    | 'FINISHED'
    | 'CANCELLED';

export type TokenColor =
    | 'RED'
    | 'BLUE'
    | 'GREEN'
    | 'YELLOW';

export interface CreateGameRequest {
    gameMode?: GameMode;
}

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
}

export interface CreateGamePlayerRequest {
    gameId: number;
    username: string;
    displayName: string;
    tokenColor: TokenColor;
}
