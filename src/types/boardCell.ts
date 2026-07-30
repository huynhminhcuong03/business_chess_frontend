export type BoardCellDirection =
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'corner-bottom-left'
    | 'corner-top-left'
    | 'corner-top-right'
    | 'corner-bottom-right';

export type BoardCellType =
    | 'START'
    | 'PROPERTY'
    | 'CHANCE'
    | 'COMMUNITY'
    | 'JAIL'
    | 'GO_TO_JAIL'
    | 'FREE_PARKING'
    | 'INCOME_TAX'
    | 'LUXURY_TAX'
    | 'STATION'
    | 'UTILITY';

export interface PropertyDetail {
    id: number;
    buyPrice: number;
    mortgagePrice: number;
    housePrice: number;
    hotelPrice: number;
    rentLevel0: number;
    rentLevel1: number;
    rentLevel2: number;
    rentLevel3: number;
    rentLevel4: number;
    rentHotel: number;
}

export interface BoardCell {
    id: number;
    boardId: number;
    position: number;
    name: string;
    type: BoardCellType;
    color: string | null;
    image: string | null;
    propertyDetail: PropertyDetail | null;
}

export interface BoardCellProps {
    cell: BoardCell;
    direction?: BoardCellDirection;
}
