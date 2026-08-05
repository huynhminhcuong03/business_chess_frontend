import { getBoardGridPosition } from './getBoardGridPosition';
import type { Point } from '../types/boardFlow';

function getBoardTrackCenterRatio(track: number): number {
    const cornerTrackSize = 0.135;
    const middleTrackSize = (1 - cornerTrackSize * 2) / 9;

    if (track === 1) {
        return cornerTrackSize / 2;
    }

    if (track === 11) {
        return 1 - cornerTrackSize / 2;
    }

    return (
        cornerTrackSize +
        (track - 2) * middleTrackSize +
        middleTrackSize / 2
    );
}

export function getBoardCellCenter(
    boardFrame: HTMLDivElement | null,
    position: number,
): Point | null {
    if (!boardFrame) {
        return null;
    }

    const rect = boardFrame.getBoundingClientRect();
    const gridPosition = getBoardGridPosition(position);

    return {
        x:
            getBoardTrackCenterRatio(gridPosition.column) *
            rect.width,
        y:
            getBoardTrackCenterRatio(gridPosition.row) *
            rect.height,
    };
}
