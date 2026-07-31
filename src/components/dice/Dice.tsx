interface DiceProps {
    value: number;
}

const DOT_POSITIONS: Record<number, string[]> = {
    1: ['col-start-2 row-start-2'],
    2: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-3',
    ],
    3: [
        'col-start-1 row-start-1',
        'col-start-2 row-start-2',
        'col-start-3 row-start-3',
    ],
    4: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
    ],
    5: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-2 row-start-2',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
    ],
    6: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-1 row-start-2',
        'col-start-3 row-start-2',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
    ],
};

function Dice({ value }: DiceProps) {
    const dotPositions = DOT_POSITIONS[value] ?? [];

    return (
        <div
            className="dice-face grid grid-cols-3 grid-rows-3 rounded-xl border-2 border-slate-800 bg-white shadow-md"
            aria-label={`Xúc xắc ra ${value} điểm`}
        >
            {dotPositions.map((position, index) => (
                <span
                    key={`${position}-${index}`}
                    className={`dice-dot place-self-center rounded-full bg-slate-800 ${position}`}
                />
            ))}
        </div>
    );
}

export default Dice;
