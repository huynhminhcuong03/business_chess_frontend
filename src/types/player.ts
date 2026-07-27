export type PlayerTokenColor =
    | 'RED'
    | 'BLUE'
    | 'GREEN'
    | 'YELLOW';

export interface Player {
    id: number;
    name: string;
    position: number;
    tokenColor: PlayerTokenColor;
    money: number;
    jailFreeCardCount?: number;
    isInJail?: boolean;
    isBankrupt?: boolean;
}
