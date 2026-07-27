import type { BoardCell } from '../../../types/board';
import type { BoardCellDirection } from '../../../types/boardCell';
import BaseBoardCell from './BaseBoardCell';

interface TaxCellProps {
    cell: BoardCell;
    direction: BoardCellDirection;
}

function TaxCell({ cell, direction }: TaxCellProps) {
    const isSideCell =
        direction === 'left' || direction === 'right';

    const paymentText =
        cell.type === 'INCOME_TAX'
            ? 'Trả 10% hoặc 200$'
            : cell.type === 'LUXURY_TAX'
              ? 'Trả 100$'
              : null;

    return (
        <BaseBoardCell cell={cell} direction={direction}>
            <div
                className={`flex min-h-0 flex-1 flex-col items-center justify-center ${
                    isSideCell ? 'px-1.5 py-1' : 'p-1'
                }`}
            >
                <span className="board-cell-name wrap-break-word font-black uppercase text-slate-800">
                    {cell.name}
                </span>

                {paymentText && (
                    <span className="board-cell-price mt-1 font-bold text-slate-600">
                        {paymentText}
                    </span>
                )}
            </div>
        </BaseBoardCell>
    );
}

export default TaxCell;
