import type { PlayerTokenColor } from '../types/player';

export const PLAYER_MONEY_POSITIONS = [
    'left-[var(--hud-inset)] top-[var(--hud-inset)]',
    'right-[var(--hud-inset)] top-[var(--hud-inset)]',
    'right-[var(--hud-inset)] bottom-[var(--hud-inset)]',
    'left-[var(--hud-inset)] bottom-[var(--hud-inset)]',
];

export const PLAYER_MONEY_THEMES: Record<
    PlayerTokenColor,
    {
        badge: string;
        border: string;
        glow: string;
        text: string;
    }
> = {
    RED: {
        badge: 'bg-red-500',
        border: 'border-red-300',
        glow: 'ring-red-200',
        text: 'text-red-600',
    },
    BLUE: {
        badge: 'bg-blue-500',
        border: 'border-blue-300',
        glow: 'ring-blue-200',
        text: 'text-blue-600',
    },
    GREEN: {
        badge: 'bg-emerald-500',
        border: 'border-emerald-300',
        glow: 'ring-emerald-200',
        text: 'text-emerald-600',
    },
    YELLOW: {
        badge: 'bg-amber-400',
        border: 'border-amber-300',
        glow: 'ring-amber-200',
        text: 'text-amber-600',
    },
};
