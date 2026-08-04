import {
    PLAYER_MONEY_POSITIONS,
} from '../../constants/playerMoneyStyles';
import type { OwnedPropertyCard } from '../../types/game';
import type { GamePlayerResponse } from '../../types/playerApi';
import PlayerMoneyCard from './PlayerMoneyCard';

interface PlayerMoneyLayerProps {
    players: GamePlayerResponse[];
    currentGamePlayerId: number | null;
    ownedProperties: OwnedPropertyCard[];
    onPlayerMoneyElementRef?: (
        playerId: number,
        element: HTMLDivElement | null,
    ) => void;
}

function PlayerMoneyLayer({
    players,
    currentGamePlayerId,
    ownedProperties,
    onPlayerMoneyElementRef,
}: PlayerMoneyLayerProps) {
    return (
        <div className="pointer-events-none fixed inset-0 z-20">
            {players.slice(0, 4).map((player, index) => (
                <PlayerMoneyCard
                    key={player.id}
                    player={player}
                    positionClass={
                        PLAYER_MONEY_POSITIONS[index] ?? ''
                    }
                    isCurrentPlayer={
                        player.id === currentGamePlayerId
                    }
                    properties={ownedProperties.filter(
                        (property) =>
                            property.ownerGamePlayerId ===
                            player.id,
                    )}
                    deedPlacement={
                        index >= 2 ? 'above' : 'below'
                    }
                    onMoneyElementRef={(element) =>
                        onPlayerMoneyElementRef?.(
                            player.id,
                            element,
                        )
                    }
                />
            ))}
        </div>
    );
}

export default PlayerMoneyLayer;
