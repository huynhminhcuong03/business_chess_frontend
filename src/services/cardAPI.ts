import type { ApiResponse } from '../types/api';
import type { CardType, GameCard } from '../types/card';
import { axiosClient } from './axiosClient';

const CHANCE_CARD_ENDPOINT = '/api/chance_card';
const COMMUNITY_CARD_ENDPOINT = '/api/community_card';

function buildDrawCardEndpoint(
    gameId: number,
    cardPath: 'chance_card' | 'community_card',
    playerId?: number | null,
): string {
    const searchParams = new URLSearchParams();

    if (playerId !== undefined && playerId !== null) {
        searchParams.set('playerId', String(playerId));
    }

    const query = searchParams.toString();

    return `/api/game/${gameId}/${cardPath}/draw${
        query ? `?${query}` : ''
    }`;
}

export const cardAPI = {
    async getChanceCards(): Promise<GameCard[]> {
        const response =
            await axiosClient.get<ApiResponse<GameCard[]>>(
                CHANCE_CARD_ENDPOINT,
            );

        return response.data;
    },

    async drawChanceCardForGame(
        gameId: number,
        playerId?: number | null,
    ): Promise<GameCard> {
        const response =
            await axiosClient.post<ApiResponse<GameCard>>(
                buildDrawCardEndpoint(
                    gameId,
                    'chance_card',
                    playerId,
                ),
                undefined,
            );

        return response.data;
    },

    async getCommunityCards(): Promise<GameCard[]> {
        const response =
            await axiosClient.get<ApiResponse<GameCard[]>>(
                COMMUNITY_CARD_ENDPOINT,
            );

        return response.data;
    },

    async drawCommunityCardForGame(
        gameId: number,
        playerId?: number | null,
    ): Promise<GameCard> {
        const response =
            await axiosClient.post<ApiResponse<GameCard>>(
                buildDrawCardEndpoint(
                    gameId,
                    'community_card',
                    playerId,
                ),
                undefined,
            );

        return response.data;
    },

    drawForGame(
        cardType: CardType,
        gameId: number,
        playerId?: number | null,
    ): Promise<GameCard> {
        return cardType === 'CHANCE'
            ? this.drawChanceCardForGame(gameId, playerId)
            : this.drawCommunityCardForGame(gameId, playerId);
    },
};
