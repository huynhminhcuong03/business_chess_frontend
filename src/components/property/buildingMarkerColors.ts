import type { PlayerTokenColor } from '../../types/player';

export const PLAYER_BUILDING_COLORS: Record<
    PlayerTokenColor,
    {
        main: string;
        dark: string;
        light: string;
    }
> = {
    RED: {
        main: '#ef4444',
        dark: '#991b1b',
        light: '#fee2e2',
    },
    BLUE: {
        main: '#3b82f6',
        dark: '#1e3a8a',
        light: '#dbeafe',
    },
    GREEN: {
        main: '#10b981',
        dark: '#065f46',
        light: '#d1fae5',
    },
    YELLOW: {
        main: '#fbbf24',
        dark: '#92400e',
        light: '#fef3c7',
    },
};
