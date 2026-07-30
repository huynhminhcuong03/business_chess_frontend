import { useState } from 'react';
import { cardAPI } from '../services/cardAPI';
import { cardActionService } from '../services/game';
import type { BoardCell } from '../types/boardCell';
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
    boardCells: BoardCell[];
    setPlayers: (players: Player[]) => void;
    moveToNextPlayer: (excludedPlayerId?: number) => void;
    finishWaitingAction: () => void;
}

interface UseCardActionsResult {
    drawnCard: GameCard | null;
    handleDrawChanceCard: () => Promise<void>;
    handleDrawCommunityCard: () => Promise<void>;
    handleExecuteCard: () => void;
}

function useCardActions({
    players,
    currentPlayer,
    isWaitingForAction,
    lastMoveResult,
    propertyOwnerships,
    boardCells,
    setPlayers,
    moveToNextPlayer,
    finishWaitingAction,
}: UseCardActionsParams): UseCardActionsResult {
    const [drawnCard, setDrawnCard] =
        useState<GameCard | null>(null);

    async function handleDrawCard(
        cardType: CardType,
    ): Promise<void> {
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

        const card = await cardAPI.draw(cardType);
        setDrawnCard(card);
    }

    function handleDrawChanceCard(): Promise<void> {
        return handleDrawCard('CHANCE');
    }

    function handleDrawCommunityCard(): Promise<void> {
        return handleDrawCard('COMMUNITY');
    }

    function handleExecuteCard(): void {
        if (
            !drawnCard ||
            !currentPlayer ||
            !isWaitingForAction
        ) {
            return;
        }

        const result = cardActionService.execute(
            {
                players,
                propertyOwnerships,
                boardCells,
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
