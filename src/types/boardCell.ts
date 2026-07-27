import type { BoardCell } from "./board";
export type BoardCellDirection =
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'corner-bottom-left'
    | 'corner-top-left'
    | 'corner-top-right'
    | 'corner-bottom-right';


export interface BoardCellProps {
    cell: BoardCell;
    direction?: BoardCellDirection;
}

