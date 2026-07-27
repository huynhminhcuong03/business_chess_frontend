import { apiRequest } from '../apiClient';
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
        return apiRequest<GameSnapshotDTO>(
            `/games/${gameId}`,
        );
    },

    rollDice(
        request: RollDiceRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/roll-dice`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    buyProperty(
        request: BuyPropertyRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/properties/buy`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    skipProperty(
        request: GameActionRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/properties/skip-buy`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    buildProperty(
        request: BuildPropertyRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/properties/build`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    skipBuildProperty(
        request: GameActionRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/properties/skip-build`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    mortgageProperty(
        request: MortgagePropertyRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/properties/mortgage`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    redeemProperty(
        request: RedeemPropertyRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/properties/redeem`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    drawCard(
        request: DrawCardRequest,
    ): Promise<DrawCardResponse> {
        return apiRequest<DrawCardResponse>(
            `/games/${request.gameId}/cards/draw`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    executeCard(
        request: ExecuteCardRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/cards/execute`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    useJailFreeCard(
        request: GameActionRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/jail/use-free-card`,
            {
                method: 'POST',
                body: request,
            },
        );
    },

    skipJailFreeCard(
        request: GameActionRequest,
    ): Promise<GameActionResponse> {
        return apiRequest<GameActionResponse>(
            `/games/${request.gameId}/jail/skip-free-card`,
            {
                method: 'POST',
                body: request,
            },
        );
    },
};
