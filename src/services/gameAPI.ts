import type { ApiResponse } from '../types/api';
import type {
    CreateGamePlayerRequest,
    CreateGameRequest,
    GamePlayerResponse,
    GameResponse,
} from '../types/gameApi';
import { axiosClient } from './axiosClient';

const GAME_ENDPOINT = '/api/game';
const GAME_PLAYER_ENDPOINT = '/api/game_player';

export const gameAPI = {
    async createGame(
        request: CreateGameRequest = {},
    ): Promise<GameResponse> {
        const response =
            await axiosClient.post<ApiResponse<GameResponse>>(
                GAME_ENDPOINT,
                request,
            );

        return response.data;
    },

    async getGame(id: number): Promise<GameResponse> {
        const response =
            await axiosClient.get<ApiResponse<GameResponse>>(
                `${GAME_ENDPOINT}/${id}`,
            );

        return response.data;
    },

    async startGame(id: number): Promise<GameResponse> {
        const response =
            await axiosClient.post<ApiResponse<GameResponse>>(
                `${GAME_ENDPOINT}/${id}/start`,
                undefined,
            );

        return response.data;
    },

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
