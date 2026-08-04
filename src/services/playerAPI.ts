import type { ApiResponse } from '../types/api';
import type {
    CreateGamePlayerRequest,
    GamePlayerResponse,
} from '../types/playerApi';
import { axiosClient } from './axiosClient';

const GAME_PLAYER_ENDPOINT = '/api/game_player';

export const playerAPI = {
    async createGamePlayer(
        request: CreateGamePlayerRequest,
    ): Promise<GamePlayerResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<GamePlayerResponse>
            >(GAME_PLAYER_ENDPOINT, request);

        return response.data;
    },

    async getGamePlayers(
        gameId: number,
    ): Promise<GamePlayerResponse[]> {
        const response =
            await axiosClient.get<
                ApiResponse<GamePlayerResponse[]>
            >(`${GAME_PLAYER_ENDPOINT}/game/${gameId}`);

        return response.data;
    },
};
