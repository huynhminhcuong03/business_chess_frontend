import { useState } from 'react';
import type { RollDiceResponse } from '../../types/gameApi';
import Dice from './Dice';

interface DicePanelProps {
    onRoll: () => Promise<RollDiceResponse | null>;
    onRollComplete: (result: RollDiceResponse) => void;
    disabled: boolean;
    currentPlayerName: string;
}

const DICE_ANIMATION_DURATION = 900;

function DicePanel({
    onRoll,
    onRollComplete,
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

    async function handleRollDice(): Promise<void> {
        if (disabled || isRolling) {
            return;
        }

        setIsRolling(true);

        const result = await onRoll();

        if (!result) {
            setIsRolling(false);
            return;
        }

        setHasRolled(true);
        setFirstDiceValue(result.dice1);
        setSecondDiceValue(result.dice2);

        window.setTimeout(() => {
            setIsRolling(false);
            onRollComplete(result);
        }, DICE_ANIMATION_DURATION);
    }

    return (
        <div className="dice-panel flex flex-col items-center rotate-45">
            {!hasRolled && (
                <button
                    type="button"
                    onClick={handleRollDice}
                    disabled={disabled || isRolling}
                    className="dice-roll-button rounded-xl bg-slate-800 font-bold text-white shadow-lg transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    Tung xúc xắc
                </button>
            )}

            {hasRolled && (
                <div className="dice-result flex items-center">
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
