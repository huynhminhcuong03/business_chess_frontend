import type { ApiResponse } from '../types/api';
import type {
    BuyPropertyResponse,
    CreateGameRequest,
    DrawCardResponse,
    GameResponse,
    GoToJailResponse,
    JailActionRequest,
    JailActionResponse,
    LandCellResponse,
    PayRentRequest,
    PayRentResponse,
    PayTaxRequest,
    PayTaxResponse,
    RollDiceResponse,
    TestMoveRequest,
    TestRollRequest,
} from '../types/gameApi';
import { axiosClient } from './axiosClient';

const GAME_ENDPOINT = '/api/game';

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

    async rollDice(
        gameId: number,
        gamePlayerId: number,
    ): Promise<RollDiceResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<RollDiceResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/roll-dice`,
                undefined,
            );

        return response.data;
    },

    async testMove(
        gameId: number,
        gamePlayerId: number,
        request: TestMoveRequest,
    ): Promise<RollDiceResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<RollDiceResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/test-move`,
                request,
            );

        return response.data;
    },

    async testRoll(
        gameId: number,
        gamePlayerId: number,
        request: TestRollRequest,
    ): Promise<RollDiceResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<RollDiceResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/test-roll`,
                request,
            );

        return response.data;
    },

    async landCell(
        gameId: number,
        gamePlayerId: number,
    ): Promise<LandCellResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<LandCellResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/land`,
                undefined,
            );

        return response.data;
    },

    async buyProperty(
        gameId: number,
        gamePlayerId: number,
        boardCellId: number,
    ): Promise<BuyPropertyResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<BuyPropertyResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/properties/${boardCellId}/buy`,
                undefined,
            );

        return response.data;
    },

    async payRent(
        gameId: number,
        gamePlayerId: number,
        request: PayRentRequest,
    ): Promise<PayRentResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<PayRentResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/rent/pay`,
                request,
            );

        return response.data;
    },

    async payTax(
        gameId: number,
        gamePlayerId: number,
        request: PayTaxRequest = {},
    ): Promise<PayTaxResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<PayTaxResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/tax/pay`,
                request,
            );

        return response.data;
    },

    async drawCard(
        gameId: number,
        gamePlayerId: number,
    ): Promise<DrawCardResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<DrawCardResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/cards/draw`,
                undefined,
            );

        return response.data;
    },

    async goToJail(
        gameId: number,
        gamePlayerId: number,
    ): Promise<GoToJailResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<GoToJailResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/jail/go-to-jail`,
                undefined,
            );

        return response.data;
    },

    async handleJailAction(
        gameId: number,
        gamePlayerId: number,
        request: JailActionRequest,
    ): Promise<JailActionResponse> {
        const response =
            await axiosClient.post<
                ApiResponse<JailActionResponse>
            >(
                `${GAME_ENDPOINT}/${gameId}/play/players/${gamePlayerId}/jail/action`,
                request,
            );

        return response.data;
    },
};
