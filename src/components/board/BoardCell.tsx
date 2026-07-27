import type { BoardCellProps } from '../../types/boardCell';
import ChanceCell from './cells/ChanceCell';
import CommunityCell from './cells/CommunityCell';
import CornerActionCell from './cells/CornerActionCell';
import PropertyCell from './cells/PropertyCell';
import StartCell from './cells/StartCell';
import StationCell from './cells/StationCell';
import TaxCell from './cells/TaxCell';
import UtilityCell from './cells/UtilityCell';

function BoardCell({
    cell,
    direction = 'top',
}: BoardCellProps) {
    switch (cell.type) {
        case 'PROPERTY':
            return (
                <PropertyCell
                    cell={cell}
                    direction={direction}
                />
            );

        case 'CHANCE':
            return (
                <ChanceCell
                    cell={cell}
                    direction={direction}
                />
            );

        case 'COMMUNITY':
            return (
                <CommunityCell
                    cell={cell}
                    direction={direction}
                />
            );

        case 'UTILITY':
            return (
                <UtilityCell
                    cell={cell}
                    direction={direction}
                />
            );

        case 'STATION':
            return (
                <StationCell
                    cell={cell}
                    direction={direction}
                />
            );

        case 'START':
            return (
                <StartCell
                    cell={cell}
                    direction={direction}
                />
            );

        case 'JAIL':
        case 'FREE_PARKING':
        case 'GO_TO_JAIL':
            return (
                <CornerActionCell
                    cell={cell}
                    direction={direction}
                />
            );

        case 'INCOME_TAX':
        case 'LUXURY_TAX':
        default:
            return (
                <TaxCell
                    cell={cell}
                    direction={direction}
                />
            );
    }
}

export default BoardCell;
