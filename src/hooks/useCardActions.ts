import { useState } from 'react';
import { cardAPI } from '../services/game';
import type { CardType, GameCard } from '../types/card';
import type {
    LastMoveResult,
    PropertyOwnership,
} from '../types/game';
import type { Player } from '../types/player';

interface UseCardActionsParams {
    players: Player[];
    currentPlayer: Player | undefined;
    isWaitingForAction: boolean;
    lastMoveResult: LastMoveResult | null;
    propertyOwnerships: PropertyOwnership[];
    setPlayers: (players: Player[]) => void;
    moveToNextPlayer: (excludedPlayerId?: number) => void;
    finishWaitingAction: () => void;
}

interface UseCardActionsResult {
    drawnCard: GameCard | null;
    handleDrawChanceCard: () => void;
    handleDrawCommunityCard: () => void;
    handleExecuteCard: () => void;
}

function useCardActions({
    players,
    currentPlayer,
    isWaitingForAction,
    lastMoveResult,
    propertyOwnerships,
    setPlayers,
    moveToNextPlayer,
    finishWaitingAction,
}: UseCardActionsParams): UseCardActionsResult {
    const [drawnCard, setDrawnCard] =
        useState<GameCard | null>(null);

    function handleDrawCard(
        cardType: CardType,
    ): void {
        if (
            !isWaitingForAction ||
            drawnCard !== null
        ) {
            return;
        }

        if (
            cardType === 'CHANCE' &&
            lastMoveResult?.action !==
                'DRAW_CHANCE_CARD'
        ) {
            return;
        }

        if (
            cardType === 'COMMUNITY' &&
            lastMoveResult?.action !==
                'DRAW_COMMUNITY_CARD'
        ) {
            return;
        }

        setDrawnCard(
            cardAPI.draw(cardType),
        );
    }

    function handleDrawChanceCard(): void {
        handleDrawCard('CHANCE');
    }

    function handleDrawCommunityCard(): void {
        handleDrawCard('COMMUNITY');
    }

    function handleExecuteCard(): void {
        if (
            !drawnCard ||
            !currentPlayer ||
            !isWaitingForAction
        ) {
            return;
        }

        const result = cardAPI.execute(
            {
                players,
                propertyOwnerships,
            },
            currentPlayer,
            drawnCard,
        );

        setPlayers(result.players);

        setDrawnCard(null);
        finishWaitingAction();
        moveToNextPlayer(result.excludedPlayerId);
    }

    return {
        drawnCard,
        handleDrawChanceCard,
        handleDrawCommunityCard,
        handleExecuteCard,
    };
}

export default useCardActions;
