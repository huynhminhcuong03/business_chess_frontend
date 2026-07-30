import type { BoardCell } from '../../../types/boardCell';
import type { BoardCellDirection } from '../../../types/boardCell';
import { formatPlayerMoney } from '../../../utils/formatMoney';
import BaseBoardCell from './BaseBoardCell';

interface StationCellProps {
    cell: BoardCell;
    direction: BoardCellDirection;
}

function StationCell({
    cell,
    direction,
}: StationCellProps) {
    const buyPrice = cell.propertyDetail?.buyPrice;
    const isSideCell =
        direction === 'left' || direction === 'right';

    return (
        <BaseBoardCell cell={cell} direction={direction}>
            <div
                className={`flex min-h-0 flex-1 flex-col items-center justify-center ${
                    isSideCell ? 'px-1.5 py-1' : 'p-1'
                }`}
            >
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

export default StationCell;
