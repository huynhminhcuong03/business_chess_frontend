import type { ApiResponse } from '../types/api';
import type { GameCard } from '../types/card';
import { axiosClient } from './axiosClient';

const CHANCE_CARD_ENDPOINT = '/api/chance_card';
const COMMUNITY_CARD_ENDPOINT = '/api/community_card';

export const cardAPI = {
    async getChanceCards(): Promise<GameCard[]> {
        const response =
            await axiosClient.get<ApiResponse<GameCard[]>>(
                CHANCE_CARD_ENDPOINT,
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
};
