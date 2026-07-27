import { boardCells } from '../../data/boardCells';
import useBoardGame from '../../hooks/useBoardGame';
import DebugMovePanel from '../game/DebugMovePanel';
import PlayerLayer from '../player/PlayerLayer';
import PlayerMoneyLayer from '../player/PlayerMoneyLayer';
import PropertyOwnershipLayer from '../property/PropertyOwnershipLayer';
import BoardCenter from './BoardCenter';
import BoardGrid from './BoardGrid';
import GameStatusPanel from './GameStatusPanel';

function Board() {
    const {
        players,
        currentPlayer,
        isPlayerMoving,
        isWaitingForAction,
        lastMoveResult,
        propertyOwnerships,
        drawnCard,
        landedCell,
        landedPropertyOwnership,
        landedImprovementPrice,
        landedRentAfterImprovement,
        canAffordProperty,
        canAffordPropertyImprovement,
        moveCurrentPlayer,
        handleRollDice,
        handleBuyProperty,
        handleSkipProperty,
        handleBuildProperty,
        handleSkipBuildProperty,
        handleMortgageProperty,
        handleRedeemProperty,
        handleUseJailFreeCard,
        handleSkipJailFreeCard,
        handleDrawChanceCard,
        handleDrawCommunityCard,
        handleExecuteCard,
    } = useBoardGame();

    if (!currentPlayer) {
        return null;
    }

    return (
        <div className="board-shell relative flex items-center justify-center">
            <div className="board-frame relative aspect-square">
                <BoardGrid boardCells={boardCells}>
                    <BoardCenter
                        onRoll={handleRollDice}
                        onBuyProperty={handleBuyProperty}
                        onSkipProperty={handleSkipProperty}
                        onBuildProperty={
                            handleBuildProperty
                        }
                        onSkipBuildProperty={
                            handleSkipBuildProperty
                        }
                        onDrawChanceCard={
                            handleDrawChanceCard
                        }
                        onDrawCommunityCard={
                            handleDrawCommunityCard
                        }
                        onExecuteCard={handleExecuteCard}
                        onUseJailFreeCard={
                            handleUseJailFreeCard
                        }
                        onSkipJailFreeCard={
                            handleSkipJailFreeCard
                        }
                        isPlayerMoving={isPlayerMoving}
                        isWaitingForAction={
                            isWaitingForAction
                        }
                        currentPlayerName={
                            currentPlayer.name
                        }
                        currentPlayerInJail={
                            currentPlayer.isInJail ?? false
                        }
                        currentPlayerJailFreeCardCount={
                            currentPlayer.jailFreeCardCount ??
                            0
                        }
                        landedProperty={landedCell}
                        landedPropertyOwnership={
                            landedPropertyOwnership
                        }
                        landedImprovementPrice={
                            landedImprovementPrice
                        }
                        landedRentAfterImprovement={
                            landedRentAfterImprovement
                        }
                        canAffordProperty={
                            canAffordProperty
                        }
                        canAffordPropertyImprovement={
                            canAffordPropertyImprovement
                        }
                        lastMoveResult={lastMoveResult}
                        drawnCard={drawnCard}
                    />

                    {import.meta.env.DEV && (
                        <DebugMovePanel
                            onMove={moveCurrentPlayer}
                            disabled={
                                isPlayerMoving ||
                                isWaitingForAction
                            }
                        />
                    )}
                </BoardGrid>

                <PropertyOwnershipLayer
                    propertyOwnerships={
                        propertyOwnerships
                    }
                    players={players}
                    boardCells={boardCells}
                />

                <PlayerLayer players={players} />
            </div>

            <PlayerMoneyLayer
                players={players}
                currentPlayerId={currentPlayer.id}
                propertyOwnerships={propertyOwnerships}
                boardCells={boardCells}
                onMortgageProperty={
                    handleMortgageProperty
                }
                onRedeemProperty={handleRedeemProperty}
            />

            <div className="game-status-panel fixed z-30">
                <GameStatusPanel
                    currentPlayerName={currentPlayer.name}
                    isPlayerMoving={isPlayerMoving}
                    isWaitingForAction={
                        isWaitingForAction
                    }
                    lastMoveResult={lastMoveResult}
                />
            </div>
        </div>
    );
}

export default Board;
