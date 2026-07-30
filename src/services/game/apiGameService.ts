import { axiosClient } from '../axiosClient';
import type {
    BuildPropertyRequest,
    BuyPropertyRequest,
    DrawCardRequest,
    DrawCardResponse,
    ExecuteCardRequest,
    GameActionRequest,
    GameActionResponse,
    GameSnapshotDTO,
    MortgagePropertyRequest,
    RedeemPropertyRequest,
    RollDiceRequest,
} from '../../types/gameApi';

export const apiGameService = {
    getSnapshot(gameId: string): Promise<GameSnapshotDTO> {
        return axiosClient.get<GameSnapshotDTO>(
            `/api/games/${gameId}`,
        );
    },

    rollDice(
        request: RollDiceRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/roll-dice`,
            request,
        );
    },

    buyProperty(
        request: BuyPropertyRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/properties/buy`,
            request,
        );
    },

    skipProperty(
        request: GameActionRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/properties/skip-buy`,
            request,
        );
    },

    buildProperty(
        request: BuildPropertyRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/properties/build`,
            request,
        );
    },

    skipBuildProperty(
        request: GameActionRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/properties/skip-build`,
            request,
        );
    },

    mortgageProperty(
        request: MortgagePropertyRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/properties/mortgage`,
            request,
        );
    },

    redeemProperty(
        request: RedeemPropertyRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/properties/redeem`,
            request,
        );
    },

    drawCard(
        request: DrawCardRequest,
    ): Promise<DrawCardResponse> {
        return axiosClient.post<DrawCardResponse>(
            `/api/games/${request.gameId}/cards/draw`,
            request,
        );
    },

    executeCard(
        request: ExecuteCardRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/cards/execute`,
            request,
        );
    },

    useJailFreeCard(
        request: GameActionRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/jail/use-free-card`,
            request,
        );
    },

    skipJailFreeCard(
        request: GameActionRequest,
    ): Promise<GameActionResponse> {
        return axiosClient.post<GameActionResponse>(
            `/api/games/${request.gameId}/jail/skip-free-card`,
            request,
        );
    },
};
