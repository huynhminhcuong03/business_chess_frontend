import { useState } from 'react';
import Dice from './Dice';

interface DicePanelProps {
    onRoll: (totalValue: number) => void;
    disabled: boolean;
    currentPlayerName: string;
}

const DICE_ANIMATION_DURATION = 900;

function generateDiceValue(): number {
    return Math.floor(Math.random() * 6) + 1;
}

function DicePanel({
    onRoll,
    disabled,
}: DicePanelProps) {
    const [firstDiceValue, setFirstDiceValue] =
        useState<number>(1);

    const [secondDiceValue, setSecondDiceValue] =
        useState<number>(1);

    const [isRolling, setIsRolling] =
        useState(false);

    const [hasRolled, setHasRolled] =
        useState(false);

    function handleRollDice(): void {
        if (disabled || isRolling) {
            return;
        }

        const newFirstDiceValue =
            generateDiceValue();

        const newSecondDiceValue =
            generateDiceValue();

        setHasRolled(true);
        setFirstDiceValue(newFirstDiceValue);
        setSecondDiceValue(newSecondDiceValue);
        setIsRolling(true);

        window.setTimeout(() => {
            setIsRolling(false);

            onRoll(
                newFirstDiceValue +
                newSecondDiceValue,
            );
        }, DICE_ANIMATION_DURATION);
    }

    return (
        <div className="flex flex-col items-center rotate-45">
            {!hasRolled && (
                <button
                    type="button"
                    onClick={handleRollDice}
                    disabled={disabled}
                    className="rounded-xl bg-slate-800 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    Tung xúc xắc
                </button>
            )}

            {hasRolled && (
                <div className="flex min-h-20 items-center gap-4">
                    <div
                        key={`first-${firstDiceValue}-${isRolling}`}
                        className={isRolling ? 'dice-drop-left' : ''}
                    >
                        <Dice value={firstDiceValue} />
                    </div>

                    <div
                        key={`second-${secondDiceValue}-${isRolling}`}
                        className={isRolling ? 'dice-drop-right' : ''}
                    >
                        <Dice value={secondDiceValue} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DicePanel;
