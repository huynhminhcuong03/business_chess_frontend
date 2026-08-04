import { useState } from 'react';

interface TestMoveOptions {
    targetPosition: number;
    rentDiceTotal: number;
}

interface TestMovePanelProps {
    cellCount: number;
    disabled: boolean;
    onMoveToCell: (options: TestMoveOptions) => void;
}

function TestMovePanel({
    cellCount,
    disabled,
    onMoveToCell,
}: TestMovePanelProps) {
    const [targetPosition, setTargetPosition] = useState(0);
    const [rentDiceTotal, setRentDiceTotal] = useState(12);

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

    return (
        <div className="test-move-panel fixed z-50 rounded-lg border border-slate-300 bg-white p-3 shadow-lg">
            <p className="mb-2 text-sm font-semibold text-slate-700">
                Test bước đi
            </p>

            <div className="grid gap-2">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Ô muốn tới
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
                    Xúc xắc thuê
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
                    Tới ô
                </button>
            </div>
        </div>
    );
}

export default TestMovePanel;
