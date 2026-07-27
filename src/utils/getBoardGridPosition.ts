interface BoardGridPosition {
    column: number;
    row: number;
}

export function getBoardGridPosition(
    position: number,
): BoardGridPosition {
    if (position < 0 || position > 39) {
        throw new Error(`Invalid board position: ${position}`);
    }

    // Bottom-left corner
    if (position === 0) {
        return {
            column: 1,
            row: 11,
        };
    }

    // Left edge: positions 1-9
    if (position >= 1 && position <= 9) {
        return {
            column: 1,
            row: 11 - position,
        };
    }

    // Top-left corner
    if (position === 10) {
        return {
            column: 1,
            row: 1,
        };
    }

    // Top edge: positions 11-19
    if (position >= 11 && position <= 19) {
        return {
            column: position - 9,
            row: 1,
        };
    }

    // Top-right corner
    if (position === 20) {
        return {
            column: 11,
            row: 1,
        };
    }

    // Right edge: positions 21-29
    if (position >= 21 && position <= 29) {
        return {
            column: 11,
            row: position - 19,
        };
    }

    // Bottom-right corner
    if (position === 30) {
        return {
            column: 11,
            row: 11,
        };
    }

    // Bottom edge: positions 31-39
    return {
        column: 41 - position,
        row: 11,
    };
}