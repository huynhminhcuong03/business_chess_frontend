import type { BoardCell as BoardCellData } from '../types/boardCell';
import type { OwnedPropertyCard } from '../types/game';
import type {
    BuyPropertyResponse,
    GamePropertyResponse,
    LandCellResponse,
} from '../types/gameApi';
import type { GamePlayerResponse } from '../types/playerApi';

export function sortBoardCells(
    cells: BoardCellData[],
): BoardCellData[] {
    return [...cells].sort(
        (firstCell, secondCell) =>
            firstCell.position - secondCell.position,
    );
}

function getRentFromProperty(
    property: GamePropertyResponse,
    cell: BoardCellData,
): number | null {
    const detail = cell.propertyDetail;

    if (!detail) {
        return null;
    }

    if (property.mortgaged) {
        return 0;
    }

    if (property.hasHotel) {
        return detail.rentHotel;
    }

    switch (property.houseCount) {
        case 1:
            return detail.rentLevel1;
        case 2:
            return detail.rentLevel2;
        case 3:
            return detail.rentLevel3;
        case 4:
            return detail.rentLevel4;
        default:
            return detail.rentLevel0;
    }
}

function toOwnedPropertyCard(
    property: GamePropertyResponse,
    cell: BoardCellData,
): OwnedPropertyCard {
    return {
        gamePropertyId: property.id,
        boardCellId: property.boardCellId,
        boardCellPosition: property.boardCellPosition,
        boardCellName: property.boardCellName,
        boardCellType: cell.type,
        color: cell.color,
        ownerGamePlayerId: property.ownerGamePlayerId,
        ownerPlayerId: property.ownerPlayerId,
        houseCount: property.houseCount,
        hasHotel: property.hasHotel,
        mortgaged: property.mortgaged,
        buyPrice: cell.propertyDetail?.buyPrice ?? null,
        rent: getRentFromProperty(property, cell),
        propertyDetail: cell.propertyDetail,
    };
}

export function getOwnedProperties(
    properties: GamePropertyResponse[],
    cells: BoardCellData[],
): OwnedPropertyCard[] {
    return properties
        .map((property) => {
            const cell = cells.find(
                (boardCell) =>
                    boardCell.id === property.boardCellId,
            );

            return cell
                ? toOwnedPropertyCard(property, cell)
                : null;
        })
        .filter(
            (
                property,
            ): property is OwnedPropertyCard =>
                property !== null,
        );
}

export function toOwnedPropertyCardFromBuy(
    property: BuyPropertyResponse,
    cell: BoardCellData,
): OwnedPropertyCard {
    return {
        gamePropertyId: property.gamePropertyId,
        boardCellId: property.boardCellId,
        boardCellPosition: property.boardCellPosition,
        boardCellName: property.boardCellName,
        boardCellType: cell.type,
        color: cell.color,
        ownerGamePlayerId: property.ownerGamePlayerId,
        ownerPlayerId: null,
        houseCount: 0,
        hasHotel: false,
        mortgaged: false,
        buyPrice: property.buyPrice,
        rent: cell.propertyDetail?.rentLevel0 ?? null,
        propertyDetail: cell.propertyDetail,
    };
}

export function canPlayerAffordLandedProperty(
    players: GamePlayerResponse[],
    gamePlayerId: number,
    landResult: LandCellResponse,
): boolean {
    const buyPrice = landResult.property?.buyPrice;

    if (buyPrice === undefined || buyPrice === null) {
        return false;
    }

    return (
        players.find((player) => player.id === gamePlayerId)
            ?.money ?? 0
    ) >= buyPrice;
}
