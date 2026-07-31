import { useState } from 'react';

interface DebugMovePanelProps {
    onMove: (stepCount: number) => void;
    disabled: boolean;
}

function DebugMovePanel({
    onMove,
    disabled,
}: DebugMovePanelProps) {
    const [stepCount, setStepCount] = useState(1);

    function handleMove(): void {
        if (
            !Number.isInteger(stepCount) ||
            stepCount < 1 ||
            stepCount > 45
        ) {
            return;
        }

        onMove(stepCount);
    }

    return (
        <div className="debug-move-panel fixed z-50 rounded-lg border border-slate-300 bg-white p-3 shadow-lg">
            <p className="mb-2 text-sm font-semibold text-slate-700">
                Kiểm thử di chuyển
            </p>

            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min={1}
                    max={45}
                    value={stepCount}
                    disabled={disabled}
                    onChange={(event) =>
                        setStepCount(
                            Number(event.target.value),
                        )
                    }
                    className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                />

                <button
                    type="button"
                    disabled={disabled}
                    onClick={handleMove}
                    className="rounded bg-slate-800 px-3 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Di chuyển
                </button>
            </div>
        </div>
    );
}

export default DebugMovePanel;
