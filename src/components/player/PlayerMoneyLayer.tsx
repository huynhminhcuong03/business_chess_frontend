import {
    PLAYER_MONEY_POSITIONS,
} from '../../constants/playerMoneyStyles';
import type { GamePlayerResponse } from '../../types/gameApi';
import PlayerMoneyCard from './PlayerMoneyCard';

interface PlayerMoneyLayerProps {
    players: GamePlayerResponse[];
    currentGamePlayerId: number | null;
}

function PlayerMoneyLayer({
    players,
    currentGamePlayerId,
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
                />
            ))}
        </div>
    );
}

export default PlayerMoneyLayer;
