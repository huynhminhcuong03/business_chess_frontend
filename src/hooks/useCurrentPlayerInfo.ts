import type { JailActionType } from '../types/gameApi';
import type { GamePlayerResponse } from '../types/playerApi';
import type { SelectedJailAction } from '../types/boardFlow';

export const FALLBACK_PLAYER_NAME = 'Người chơi';

export function getCurrentGamePlayer(
    players: GamePlayerResponse[],
    currentPlayerId: number | null,
): GamePlayerResponse | null {
    if (players.length === 0) {
        return null;
    }

    return (
        players.find(
            (player) =>
                player.id === currentPlayerId ||
                player.player.id === currentPlayerId,
        ) ?? players[0]
    );
}

export function getGamePlayerName(
    players: GamePlayerResponse[],
    gamePlayerId: number,
): string {
    return (
        players.find((player) => player.id === gamePlayerId)
            ?.player.displayName ?? FALLBACK_PLAYER_NAME
    );
}

interface UseCurrentPlayerInfoOptions {
    currentPlayerId: number | null;
    players: GamePlayerResponse[];
    selectedJailAction: SelectedJailAction | null;
}

export function useCurrentPlayerInfo({
    currentPlayerId,
    players,
    selectedJailAction,
}: UseCurrentPlayerInfoOptions): {
    currentGamePlayer: GamePlayerResponse | null;
    currentGamePlayerId: number | null;
    currentPlayerName: string;
    selectedCurrentJailActionType: JailActionType | null;
} {
    const currentGamePlayer = getCurrentGamePlayer(
        players,
        currentPlayerId,
    );
    const currentPlayerName =
        currentGamePlayer?.player.displayName ??
        FALLBACK_PLAYER_NAME;
    const currentGamePlayerId =
        currentGamePlayer?.id ?? null;
    const selectedCurrentJailActionType =
        selectedJailAction?.playerId === currentGamePlayerId
            ? selectedJailAction.actionType
            : null;

    return {
        currentGamePlayer,
        currentGamePlayerId,
        currentPlayerName,
        selectedCurrentJailActionType,
    };
}
