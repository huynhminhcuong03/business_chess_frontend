import { BOARD_GRID_TRACKS } from '../../constants/boardStyles';
import type { Player } from '../../types/player';
import { getBoardGridPosition } from '../../utils/getBoardGridPosition';
import PlayerToken from './PlayerToken';

interface PlayerLayerProps {
    players: Player[];
}

function PlayerLayer({ players }: PlayerLayerProps) {
    const playersByPosition = players.reduce<
        Record<number, Player[]>
    >((groupedPlayers, player) => {
        if (!groupedPlayers[player.position]) {
            groupedPlayers[player.position] = [];
        }

        groupedPlayers[player.position].push(player);

        return groupedPlayers;
    }, {});

    return (
        <div
            className="pointer-events-none absolute inset-0 z-10 grid border-4 border-transparent"
            style={{
                gridTemplateColumns: BOARD_GRID_TRACKS,
                gridTemplateRows: BOARD_GRID_TRACKS,
            }}
        >
            {Object.entries(playersByPosition).map(
                ([position, playersAtPosition]) => {
                    const gridPosition =
                        getBoardGridPosition(Number(position));

                    return (
                        <div
                            key={position}
                            className="flex h-full w-full flex-wrap items-center justify-center gap-0.5 p-1 transition-[grid-column-start,grid-row-start] duration-300 ease-in-out"
                            style={{
                                gridColumnStart:
                                    gridPosition.column,
                                gridRowStart:
                                    gridPosition.row,
                            }}
                        >
                            {playersAtPosition.map((player) => (
                                <PlayerToken
                                    key={player.id}
                                    player={player}
                                />
                            ))}
                        </div>
                    );
                },
            )}
        </div>
    );
}

export default PlayerLayer;
