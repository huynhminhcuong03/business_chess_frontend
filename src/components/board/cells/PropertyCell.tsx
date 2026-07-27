import { PROPERTY_COLOR_CLASSES } from '../../../constants/boardStyles';
import type { BoardCell } from '../../../types/board';
import type { BoardCellDirection } from '../../../types/boardCell';
import { formatPlayerMoney } from '../../../utils/formatMoney';
import BaseBoardCell from './BaseBoardCell';

interface PropertyCellProps {
    cell: BoardCell;
    direction: BoardCellDirection;
}

function getHeaderClass(cell: BoardCell): string {
    if (!cell.color) {
        return 'bg-slate-400';
    }

    return (
        PROPERTY_COLOR_CLASSES[cell.color] ??
        'bg-slate-400'
    );
}

function PropertyCell({
    cell,
    direction,
}: PropertyCellProps) {
    const buyPrice = cell.propertyDetails?.buyPrice;
    const isSideCell =
        direction === 'left' || direction === 'right';

    if (isSideCell) {
        const sideLayoutClass =
            direction === 'left'
                ? 'flex-row-reverse'
                : 'flex-row';
        const dividerClass =
            direction === 'left' ? 'border-l' : 'border-r';

        return (
            <BaseBoardCell cell={cell} direction={direction}>
                <div
                    className={`flex h-full w-full ${sideLayoutClass}`}
                >
                    <div
                        className={`w-6 shrink-0 border-slate-800 ${dividerClass} ${getHeaderClass(
                            cell,
                        )}`}
                    />

                    <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1.5 py-1">
                        <span className="board-cell-name wrap-break-word font-bold uppercase">
                            {cell.name}
                        </span>

                        {buyPrice !== undefined && (
                            <span className="board-cell-price mt-1 font-bold text-slate-600">
                                ${formatPlayerMoney(buyPrice)}
                            </span>
                        )}
                    </div>
                </div>
            </BaseBoardCell>
        );
    }

    return (
        <BaseBoardCell cell={cell} direction={direction}>
            <div
                className={`h-6 shrink-0 border-b border-slate-800 ${getHeaderClass(
                    cell,
                )}`}
            />

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-1">
                <span className="board-cell-name wrap-break-word font-bold uppercase">
                    {cell.name}
                </span>

                {buyPrice !== undefined && (
                    <span className="board-cell-price mt-1 font-bold text-slate-600">
                        ${formatPlayerMoney(buyPrice)}
                    </span>
                )}
            </div>
        </BaseBoardCell>
    );
}

export default PropertyCell;
