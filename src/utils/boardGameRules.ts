import type {
    BoardCell,
    BoardCellType,
} from '../types/board';
import type {
    CellAction,
    PropertyOwnership,
} from '../types/game';

export const JAIL_POSITION = 10;
export const PLAYER_STEP_DELAY = 350;
export const STATION_POSITIONS = [5, 15, 25, 35];
export const UTILITY_POSITIONS = [12, 28];

export function wait(
    milliseconds: number,
): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });
}

export function isPurchasableCell(
    cellType: BoardCellType,
): boolean {
    return (
        cellType === 'PROPERTY' ||
        cellType === 'STATION' ||
        cellType === 'UTILITY'
    );
}

export function getCellAction(
    cell: BoardCell,
    propertyOwnerships: PropertyOwnership[],
    currentPlayerId: number,
): CellAction {
    if (isPurchasableCell(cell.type)) {
        const ownership = propertyOwnerships.find(
            (currentOwnership) =>
                currentOwnership.boardCellId === cell.id,
        );

        if (!ownership) {
            return 'BUY_PROPERTY';
        }

        if (ownership.ownerPlayerId === currentPlayerId) {
            return canImproveProperty(cell, ownership)
                ? 'BUILD_PROPERTY'
                : 'NONE';
        }

        if (ownership.mortgaged) {
            return 'NONE';
        }

        return 'PAY_RENT';
    }

    switch (cell.type) {
        case 'CHANCE':
            return 'DRAW_CHANCE_CARD';

        case 'COMMUNITY':
            return 'DRAW_COMMUNITY_CARD';

        case 'INCOME_TAX':
            return 'PAY_INCOME_TAX';

        case 'LUXURY_TAX':
            return 'PAY_LUXURY_TAX';

        case 'GO_TO_JAIL':
            return 'GO_TO_JAIL';

        case 'START':
        case 'JAIL':
        case 'FREE_PARKING':
            return 'NONE';

        default:
            return 'NONE';
    }
}

export function canImproveProperty(
    cell: BoardCell,
    ownership: PropertyOwnership,
): boolean {
    if (
        cell.type !== 'PROPERTY' ||
        !cell.propertyDetail ||
        ownership.mortgaged ||
        ownership.hasHotel
    ) {
        return false;
    }

    if (ownership.houseCount < 4) {
        return cell.propertyDetail.housePrice > 0;
    }

    return cell.propertyDetail.hotelPrice > 0;
}

export function canMortgageProperty(
    cell: BoardCell,
    ownership: PropertyOwnership,
): boolean {
    return (
        cell.propertyDetail !== null &&
        !ownership.mortgaged &&
        ownership.houseCount === 0 &&
        !ownership.hasHotel
    );
}

export function getMortgageRedeemCost(
    cell: BoardCell,
): number | null {
    if (!cell.propertyDetail) {
        return null;
    }

    return Math.ceil(
        cell.propertyDetail.mortgagePrice * 1.1,
    );
}

export function canRedeemMortgage(
    cell: BoardCell,
    ownership: PropertyOwnership,
    playerMoney: number,
): boolean {
    const redeemCost = getMortgageRedeemCost(cell);

    return (
        ownership.mortgaged &&
        redeemCost !== null &&
        playerMoney >= redeemCost
    );
}

export function getPropertyImprovementCost(
    cell: BoardCell | null,
    ownership: PropertyOwnership | null,
): number | null {
    if (
        !cell ||
        !ownership ||
        !cell.propertyDetail ||
        !canImproveProperty(cell, ownership)
    ) {
        return null;
    }

    return ownership.houseCount < 4
        ? cell.propertyDetail.housePrice
        : cell.propertyDetail.hotelPrice;
}

export function getPropertyRentAfterImprovement(
    cell: BoardCell | null,
    ownership: PropertyOwnership | null,
): number | null {
    if (
        !cell ||
        !ownership ||
        !cell.propertyDetail ||
        !canImproveProperty(cell, ownership)
    ) {
        return null;
    }

    if (ownership.houseCount >= 4) {
        return cell.propertyDetail.rentHotel;
    }

    switch (ownership.houseCount + 1) {
        case 1:
            return cell.propertyDetail.rentLevel1;

        case 2:
            return cell.propertyDetail.rentLevel2;

        case 3:
            return cell.propertyDetail.rentLevel3;

        case 4:
            return cell.propertyDetail.rentLevel4;

        default:
            return cell.propertyDetail.rentLevel0;
    }
}

export function getPropertyRent(
    cell: BoardCell,
    ownership: PropertyOwnership,
): number {
    const propertyDetail = cell.propertyDetail;

    if (!propertyDetail || ownership.mortgaged) {
        return 0;
    }

    if (ownership.hasHotel) {
        return propertyDetail.rentHotel;
    }

    switch (ownership.houseCount) {
        case 1:
            return propertyDetail.rentLevel1;

        case 2:
            return propertyDetail.rentLevel2;

        case 3:
            return propertyDetail.rentLevel3;

        case 4:
            return propertyDetail.rentLevel4;

        default:
            return propertyDetail.rentLevel0;
    }
}

export function findNearestPosition(
    currentPosition: number,
    targetPositions: number[],
): number {
    const sortedPositions = [...targetPositions].sort(
        (firstPosition, secondPosition) =>
            firstPosition - secondPosition,
    );

    return (
        sortedPositions.find(
            (position) => position > currentPosition,
        ) ?? sortedPositions[0]
    );
}
