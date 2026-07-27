import {
    PLAYER_MONEY_POSITIONS,
} from '../../constants/playerMoneyStyles';
import type { BoardCell } from '../../types/board';
import type { PropertyOwnership } from '../../types/game';
import type { Player } from '../../types/player';
import PlayerMoneyCard from './PlayerMoneyCard';

interface PlayerMoneyLayerProps {
    players: Player[];
    currentPlayerId: number;
    propertyOwnerships: PropertyOwnership[];
    boardCells: BoardCell[];
    onMortgageProperty: (boardCellId: number) => void;
    onRedeemProperty: (boardCellId: number) => void;
}

function PlayerMoneyLayer({
    players,
    currentPlayerId,
    propertyOwnerships,
    boardCells,
    onMortgageProperty,
    onRedeemProperty,
}: PlayerMoneyLayerProps) {
    return (
        <div className="pointer-events-none fixed inset-0 z-20">
            {players.slice(0, 4).map(
                (player, index) => {
                    const ownedProperties =
                        propertyOwnerships
                            .filter(
                                (ownership) =>
                                    ownership.ownerPlayerId ===
                                    player.id,
                            )
                            .map((ownership) => ({
                                ownership,
                                property:
                                    boardCells.find(
                                        (cell) =>
                                            cell.id ===
                                            ownership.boardCellId,
                                    ) ?? null,
                            }))
                            .filter(
                                (
                                    ownedProperty,
                                ): ownedProperty is {
                                    ownership: PropertyOwnership;
                                    property: BoardCell;
                                } =>
                                    ownedProperty.property !==
                                    null,
                            );

                    return (
                        <PlayerMoneyCard
                            key={player.id}
                            player={player}
                            positionClass={
                                PLAYER_MONEY_POSITIONS[
                                    index
                                ] ?? ''
                            }
                            isCurrentPlayer={
                                player.id ===
                                currentPlayerId
                            }
                            ownedProperties={
                                ownedProperties
                            }
                            canManageProperties={
                                player.id ===
                                    currentPlayerId &&
                                !player.isBankrupt
                            }
                            onMortgageProperty={
                                onMortgageProperty
                            }
                            onRedeemProperty={
                                onRedeemProperty
                            }
                            deedPlacement={
                                index >= 2
                                    ? 'above'
                                    : 'below'
                            }
                        />
                    );
                },
            )}
        </div>
    );
}

export default PlayerMoneyLayer;
