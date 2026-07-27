import { useState } from 'react';

interface CardDeckButtonProps {
    title: string;
    subtitle: string;
    enabled: boolean;
    color: 'amber' | 'red';
    onClick: () => void;
}

const colorClasses = {
    amber: {
        border: 'border-amber-500',
        background: 'bg-amber-50/90',
        icon: 'bg-amber-400',
        title: 'text-amber-600',
        pulse: 'text-amber-700',
        stack: 'bg-amber-100 border-amber-400',
    },
    red: {
        border: 'border-red-400',
        background: 'bg-red-50/90',
        icon: 'bg-red-400',
        title: 'text-red-500',
        pulse: 'text-red-600',
        stack: 'bg-red-100 border-red-400',
    },
};

function CardDeckButton({
    title,
    subtitle,
    enabled,
    color,
    onClick,
}: CardDeckButtonProps) {
    const classes = colorClasses[color];
    const [isDrawing, setIsDrawing] =
        useState(false);

    function handleDrawCard(): void {
        if (!enabled || isDrawing) {
            return;
        }

        setIsDrawing(true);
    }

    function handleDrawAnimationEnd(): void {
        if (!isDrawing) {
            return;
        }

        setIsDrawing(false);
        onClick();
    }

    return (
        <button
            type="button"
            onClick={handleDrawCard}
            disabled={!enabled || isDrawing}
            aria-label={`Rút ${subtitle.toLowerCase()}`}
            className={`card-deck-button group relative transition ${
                enabled
                    ? 'cursor-pointer hover:-translate-y-1 hover:scale-[1.03]'
                    : 'cursor-not-allowed opacity-70'
            }`}
        >
            <span
                aria-hidden="true"
                className={`absolute inset-0 translate-x-2 translate-y-2 rounded-md border-2 ${classes.stack} shadow-md`}
            />
            <span
                aria-hidden="true"
                className={`absolute inset-0 translate-x-1 translate-y-1 rounded-md border-2 ${classes.stack} shadow-md`}
            />

            <span
                onAnimationEnd={
                    handleDrawAnimationEnd
                }
                className={`absolute inset-0 flex flex-col items-center justify-center rounded-md border-2 border-dashed ${classes.border} ${classes.background} shadow-lg ${
                    isDrawing
                        ? 'card-draw-flip pointer-events-none'
                        : 'transition group-hover:shadow-xl'
                }`}
            >
                <span
                    className={`card-deck-icon rotate-45 ${classes.icon} shadow-sm`}
                />

                <span
                    className={`card-deck-title font-extrabold uppercase tracking-wide ${classes.title}`}
                >
                    {title}
                </span>

                <span className="card-deck-subtitle font-medium text-slate-500">
                    {subtitle}
                </span>

                {enabled && !isDrawing && (
                    <span
                        className={`card-deck-hint animate-pulse font-bold ${classes.pulse}`}
                    >
                        Nhấn để rút
                    </span>
                )}

                {isDrawing && (
                    <span
                        className={`card-deck-hint font-bold ${classes.pulse}`}
                    >
                        Đang lật thẻ...
                    </span>
                )}
            </span>

            {!enabled && (
                <p
                    className="sr-only"
                >
                    Chưa thể rút bộ thẻ này
                </p>
            )}
        </button>
    );
}

export default CardDeckButton;
