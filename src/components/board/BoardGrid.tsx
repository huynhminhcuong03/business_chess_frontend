import type { ReactNode } from 'react';
import { BOARD_GRID_TRACKS } from '../../constants/boardStyles';
import type { BoardCell as BoardCellData } from '../../types/board';
import BoardCell from './BoardCell';

interface BoardGridProps {
    boardCells: BoardCellData[];
    children: ReactNode;
}

function BoardGrid({
    boardCells,
    children,
}: BoardGridProps) {
    const sortedBoardCells = [...boardCells].sort(
        (firstCell, secondCell) =>
            firstCell.position - secondCell.position,
    );

    const startCell = sortedBoardCells[0];
    const leftEdgeCells = sortedBoardCells.slice(1, 10);
    const topLeftCorner = sortedBoardCells[10];
    const topEdgeCells = sortedBoardCells.slice(11, 20);
    const topRightCorner = sortedBoardCells[20];
    const rightEdgeCells = sortedBoardCells.slice(21, 30);
    const bottomRightCorner = sortedBoardCells[30];
    const bottomEdgeCells = sortedBoardCells.slice(31, 40);

    if (
        !startCell ||
        !topLeftCorner ||
        !topRightCorner ||
        !bottomRightCorner
    ) {
        return null;
    }

    return (
        <div
            className="grid h-full w-full border-4 border-white bg-emerald-50"
            style={{
                gridTemplateColumns: BOARD_GRID_TRACKS,
                gridTemplateRows: BOARD_GRID_TRACKS,
            }}
        >
            {children}

            <div className="col-start-1 row-start-11 h-full w-full">
                <BoardCell
                    cell={startCell}
                    direction="corner-bottom-left"
                />
            </div>

            {leftEdgeCells.map((cell) => (
                <div
                    key={cell.id}
                    className="col-start-1 h-full w-full"
                    style={{
                        gridRowStart: 11 - cell.position,
                    }}
                >
                    <BoardCell
                        cell={cell}
                        direction="left"
                    />
                </div>
            ))}

            <div className="col-start-1 row-start-1 h-full w-full">
                <BoardCell
                    cell={topLeftCorner}
                    direction="corner-top-left"
                />
            </div>

            {topEdgeCells.map((cell) => (
                <div
                    key={cell.id}
                    className="row-start-1 h-full w-full"
                    style={{
                        gridColumnStart: cell.position - 9,
                    }}
                >
                    <BoardCell
                        cell={cell}
                        direction="top"
                    />
                </div>
            ))}

            <div className="col-start-11 row-start-1 h-full w-full">
                <BoardCell
                    cell={topRightCorner}
                    direction="corner-top-right"
                />
            </div>

            {rightEdgeCells.map((cell) => (
                <div
                    key={cell.id}
                    className="col-start-11 h-full w-full"
                    style={{
                        gridRowStart: cell.position - 19,
                    }}
                >
                    <BoardCell
                        cell={cell}
                        direction="right"
                    />
                </div>
            ))}

            <div className="col-start-11 row-start-11 h-full w-full">
                <BoardCell
                    cell={bottomRightCorner}
                    direction="corner-bottom-right"
                />
            </div>

            {bottomEdgeCells.map((cell) => (
                <div
                    key={cell.id}
                    className="row-start-11 h-full w-full"
                    style={{
                        gridColumnStart: 41 - cell.position,
                    }}
                >
                    <BoardCell
                        cell={cell}
                        direction="bottom"
                    />
                </div>
            ))}
        </div>
    );
}

export default BoardGrid;
