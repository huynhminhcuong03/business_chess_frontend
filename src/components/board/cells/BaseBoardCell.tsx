import type { ReactNode } from 'react';
import {
    CELL_BACKGROUND_CLASSES,
    CONTENT_DIRECTION_CLASSES,
} from '../../../constants/boardStyles';
import type { BoardCell } from '../../../types/board';
import type { BoardCellDirection } from '../../../types/boardCell';

interface BaseBoardCellProps {
    cell: BoardCell;
    direction: BoardCellDirection;
    children: ReactNode;
}

function BaseBoardCell({
    cell,
    direction,
    children,
}: BaseBoardCellProps) {
    const isSideCell =
        direction === 'left' || direction === 'right';
    const contentClassName = isSideCell
        ? 'h-full w-full'
        : `h-full w-full ${CONTENT_DIRECTION_CLASSES[direction]}`;

    return (
        <div
            className={`relative flex h-full w-full items-center justify-center overflow-hidden border border-slate-800 [container-type:size] ${
                CELL_BACKGROUND_CLASSES[cell.type]
            }`}
        >
            <div
                className={`flex flex-col text-center ${contentClassName}`}
            >
                {children}
            </div>
        </div>
    );
}

export default BaseBoardCell;
