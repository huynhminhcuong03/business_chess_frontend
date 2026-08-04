import type { TokenColor } from '../types/playerApi';

export const PLAYER_TOKEN_COLOR_CLASSES: Record<
    TokenColor,
    string
> = {
    RED: 'bg-red-500',
    BLUE: 'bg-blue-500',
    GREEN: 'bg-green-500',
    YELLOW: 'bg-yellow-400',
};
