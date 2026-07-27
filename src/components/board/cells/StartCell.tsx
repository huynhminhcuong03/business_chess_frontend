import type { BoardCell } from '../../../types/board';
import type { BoardCellDirection } from '../../../types/boardCell';
import BaseBoardCell from './BaseBoardCell';

interface StartCellProps {
    cell: BoardCell;
    direction: BoardCellDirection;
}

function StartCell({
    cell,
    direction,
}: StartCellProps) {
    const startLabel = cell.name.toLocaleUpperCase('vi-VN');

    return (
        <BaseBoardCell cell={cell} direction={direction}>
            <div className="relative h-full w-full -rotate-45">
                <svg
                    aria-label={cell.name}
                    className="h-full w-full"
                    viewBox="0 0 100 100"
                    role="img"
                    textRendering="geometricPrecision"
                >
                    <path
                        d="M20 82V58"
                        stroke="#be123c"
                        strokeLinecap="round"
                        strokeWidth="2"
                    />
                    <path
                        d="M20 48 15 59h10Z"
                        fill="#be123c"
                    />
                    <path
                        d="M17 87h6M20 82v5"
                        stroke="#be123c"
                        strokeLinecap="round"
                        strokeWidth="1.6"
                    />

                    <g transform="rotate(45 50 50)">
                        <text
                            x="52"
                            y="60"
                            fill="#be123c"
                            fontFamily="Arial, Helvetica, sans-serif"
                            fontSize="15"
                            fontWeight="900"
                            letterSpacing="0"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {startLabel}
                        </text>
                    </g>

                    <g transform="rotate(45 67 29)">
                        <text
                            x="67"
                            y="20"
                            fill="#374151"
                            fontFamily="Arial, Helvetica, sans-serif"
                            fontSize="8"
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            Lương nhận
                        </text>
                        <text
                            x="67"
                            y="30"
                            fill="#be123c"
                            fontFamily="Arial, Helvetica, sans-serif"
                            fontSize="10"
                            fontWeight="900"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            $200
                        </text>
                        <text
                            x="67"
                            y="40"
                            fill="#374151"
                            fontFamily="Arial, Helvetica, sans-serif"
                            fontSize="8"
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            khi qua ô
                        </text>
                    </g>
                </svg>
            </div>
        </BaseBoardCell>
    );
}

export default StartCell;
