import type { BoardCell } from '../../../types/board';
import type { BoardCellDirection } from '../../../types/boardCell';
import communityImage from '../../../assets/images/board_img/community.png';
import BaseBoardCell from './BaseBoardCell';

interface CommunityCellProps {
    cell: BoardCell;
    direction: BoardCellDirection;
}

function CommunityCell({
    cell,
    direction,
}: CommunityCellProps) {
    const isSideCell =
        direction === 'left' || direction === 'right';

    return (
        <BaseBoardCell cell={cell} direction={direction}>
            <div
                className={`flex min-h-0 flex-1 items-center justify-center gap-1 ${
                    isSideCell
                        ? 'flex-row px-1.5 py-1'
                        : 'flex-col p-1'
                }`}
            >
                <span className="board-cell-name board-cell-name-large wrap-break-word font-black uppercase text-slate-800">
                    {cell.name}
                </span>

                <div
                    className={`flex items-center justify-center ${
                        isSideCell
                            ? 'h-full min-w-0 flex-1'
                            : 'h-[60%] w-full'
                    }`}
                >
                    <img
                        src={communityImage}
                        alt=""
                        className={`object-contain drop-shadow-sm ${
                            isSideCell
                                ? 'max-h-full max-w-full'
                                : 'h-full max-w-[76%]'
                        }`}
                    />
                </div>
            </div>
        </BaseBoardCell>
    );
}

export default CommunityCell;
