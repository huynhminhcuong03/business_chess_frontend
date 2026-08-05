import { useState } from 'react';

interface TestMoveOptions {
    targetPosition: number;
    rentDiceTotal: number;
}

interface TestRollOptions {
    dice1: number;
    dice2: number;
}

interface TestMovePanelProps {
    cellCount: number;
    disabled: boolean;
    onMoveToCell: (options: TestMoveOptions) => void;
    onRollDice: (options: TestRollOptions) => void;
}

function TestMovePanel({
    cellCount,
    disabled,
    onMoveToCell,
    onRollDice,
}: TestMovePanelProps) {
    const [targetPosition, setTargetPosition] = useState(0);
    const [rentDiceTotal, setRentDiceTotal] = useState(12);
    const [dice1, setDice1] = useState(2);
    const [dice2, setDice2] = useState(2);

    function handleMoveToCell(): void {
        if (
            !Number.isInteger(targetPosition) ||
            targetPosition < 0 ||
            targetPosition >= cellCount ||
            !Number.isInteger(rentDiceTotal) ||
            rentDiceTotal < 2 ||
            rentDiceTotal > 12
        ) {
            return;
        }

        onMoveToCell({
            targetPosition,
            rentDiceTotal,
        });
    }

    function handleTestRollDice(): void {
        if (
            !Number.isInteger(dice1) ||
            !Number.isInteger(dice2) ||
            dice1 < 1 ||
            dice1 > 6 ||
            dice2 < 1 ||
            dice2 > 6
        ) {
            return;
        }

        onRollDice({
            dice1,
            dice2,
        });
    }

    return (
        <div className="test-move-panel fixed z-50 rounded-lg border border-slate-300 bg-white p-3 shadow-lg">
            <p className="mb-2 text-sm font-semibold text-slate-700">
                Test move
            </p>

            <div className="grid gap-2">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Target cell
                    <input
                        type="number"
                        min={0}
                        max={Math.max(cellCount - 1, 0)}
                        value={targetPosition}
                        disabled={disabled}
                        onChange={(event) =>
                            setTargetPosition(
                                Number(event.target.value),
                            )
                        }
                        className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                </label>

                <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Rent dice
                    <input
                        type="number"
                        min={2}
                        max={12}
                        value={rentDiceTotal}
                        disabled={disabled}
                        onChange={(event) =>
                            setRentDiceTotal(
                                Number(event.target.value),
                            )
                        }
                        className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                </label>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={handleMoveToCell}
                    className="rounded bg-slate-800 px-3 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Move
                </button>

                <div className="mt-2 border-t border-slate-200 pt-2">
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                        Test dice
                    </p>

                    <div className="flex gap-2">
                        <label className="grid gap-1 text-xs font-semibold text-slate-600">
                            D1
                            <input
                                type="number"
                                min={1}
                                max={6}
                                value={dice1}
                                disabled={disabled}
                                onChange={(event) =>
                                    setDice1(
                                        Number(
                                            event.target.value,
                                        ),
                                    )
                                }
                                className="w-12 rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                        </label>

                        <label className="grid gap-1 text-xs font-semibold text-slate-600">
                            D2
                            <input
                                type="number"
                                min={1}
                                max={6}
                                value={dice2}
                                disabled={disabled}
                                onChange={(event) =>
                                    setDice2(
                                        Number(
                                            event.target.value,
                                        ),
                                    )
                                }
                                className="w-12 rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        disabled={disabled}
                        onClick={handleTestRollDice}
                        className="mt-2 rounded bg-amber-600 px-3 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Test roll
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TestMovePanel;
