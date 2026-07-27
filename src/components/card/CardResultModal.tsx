import { useEffect, useState } from 'react';
import type { GameCard } from '../../types/card';

const CARD_DISPLAY_DURATION = 3;

interface CardResultModalProps {
    card: GameCard;
    playerName: string;
    onExecute: () => void;
}

function CardResultModal({
    card,
    playerName,
    onExecute,
}: CardResultModalProps) {
    const isChanceCard = card.type === 'CHANCE';
    const [remainingSeconds, setRemainingSeconds] =
        useState(CARD_DISPLAY_DURATION);

    useEffect(() => {
        const countdownInterval = window.setInterval(
            () => {
                setRemainingSeconds((currentSeconds) =>
                    Math.max(currentSeconds - 1, 0),
                );
            },
            1000,
        );

        const executeTimeout = window.setTimeout(() => {
            onExecute();
        }, CARD_DISPLAY_DURATION * 1000);

        return () => {
            window.clearInterval(countdownInterval);
            window.clearTimeout(executeTimeout);
        };
    }, [onExecute]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div
                className={`w-full max-w-md rounded-2xl border-4 bg-white p-6 text-center shadow-2xl ${
                    isChanceCard
                        ? 'border-red-400'
                        : 'border-amber-400'
                }`}
            >
                <p
                    className={`text-sm font-extrabold uppercase tracking-[0.25em] ${
                        isChanceCard
                            ? 'text-red-500'
                            : 'text-amber-600'
                    }`}
                >
                    {isChanceCard ? 'Cơ hội' : 'Khí vận'}
                </p>

                <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
                    {card.title}
                </h2>

                <p className="mt-3 text-sm font-semibold text-slate-500">
                    Người rút: {playerName}
                </p>

                <p className="mt-5 text-base leading-7 text-slate-700">
                    {card.description}
                </p>

                <p className="mt-5 text-sm font-semibold text-slate-500">
                    Tự thực hiện sau {remainingSeconds} giây
                </p>
            </div>
        </div>
    );
}

export default CardResultModal;
