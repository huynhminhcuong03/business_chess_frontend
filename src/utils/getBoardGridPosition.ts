export interface BoardGridPosition {
    column: number;
    row: number;
}

export function getBoardGridPosition(
    position: number,
): BoardGridPosition {
    const normalizedPosition =
        ((position % 40) + 40) % 40;

    if (normalizedPosition === 0) {
        return {
            column: 1,
            row: 11,
        };
    }

    if (normalizedPosition < 10) {
        return {
            column: 1,
            row: 11 - normalizedPosition,
        };
    }

    if (normalizedPosition === 10) {
        return {
            column: 1,
            row: 1,
        };
    }

    if (normalizedPosition < 20) {
        return {
            column: normalizedPosition - 9,
            row: 1,
        };
    }

    if (normalizedPosition === 20) {
        return {
            column: 11,
            row: 1,
        };
    }

    if (normalizedPosition < 30) {
        return {
            column: 11,
            row: normalizedPosition - 19,
        };
    }

    if (normalizedPosition === 30) {
        return {
            column: 11,
            row: 11,
        };
    }

    return {
        column: 41 - normalizedPosition,
        row: 11,
    };
}
