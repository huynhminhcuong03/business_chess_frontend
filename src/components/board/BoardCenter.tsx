import bgBoardCenter from '../../assets/images/bg_board.jfif';
import type { BoardCell } from '../../types/board';
import type { GameCard } from '../../types/card';
import type {
    LastMoveResult,
    PropertyOwnership,
} from '../../types/game';
import CardDeckButton from '../card/CardDeckButton';
import CardResultModal from '../card/CardResultModal';
import DicePanel from '../dice/DicePanel';
import JailDecisionPanel from '../game/JailDecisionPanel';
import PropertyBuildPanel from '../property/PropertyBuildPanel';
import PropertyPurchasePanel from '../property/PropertyPurchasePanel';

interface BoardCenterProps {
    onRoll: (totalValue: number) => void;
    onBuyProperty: () => void;
    onSkipProperty: () => void;
    onBuildProperty: () => void;
    onSkipBuildProperty: () => void;
    onDrawChanceCard: () => void;
    onDrawCommunityCard: () => void;
    onExecuteCard: () => void;
    onUseJailFreeCard: () => void;
    onSkipJailFreeCard: () => void;
    isPlayerMoving: boolean;
    isWaitingForAction: boolean;
    currentPlayerName: string;
    currentPlayerInJail: boolean;
    currentPlayerJailFreeCardCount: number;
    landedProperty: BoardCell | null;
    landedPropertyOwnership: PropertyOwnership | null;
    landedImprovementPrice: number | null;
    landedRentAfterImprovement: number | null;
    canAffordProperty: boolean;
    canAffordPropertyImprovement: boolean;
    lastMoveResult: LastMoveResult | null;
    drawnCard: GameCard | null;
}

function BoardCenter({
    onRoll,
    onBuyProperty,
    onSkipProperty,
    onBuildProperty,
    onSkipBuildProperty,
    onDrawChanceCard,
    onDrawCommunityCard,
    onExecuteCard,
    onUseJailFreeCard,
    onSkipJailFreeCard,
    isPlayerMoving,
    isWaitingForAction,
    currentPlayerName,
    currentPlayerInJail,
    currentPlayerJailFreeCardCount,
    landedProperty,
    landedPropertyOwnership,
    landedImprovementPrice,
    landedRentAfterImprovement,
    canAffordProperty,
    canAffordPropertyImprovement,
    lastMoveResult,
    drawnCard,
}: BoardCenterProps) {
    const canChoosePropertyAction =
        isWaitingForAction &&
        lastMoveResult?.action === 'BUY_PROPERTY';

    const canChooseBuildAction =
        isWaitingForAction &&
        lastMoveResult?.action === 'BUILD_PROPERTY';

    const canDrawChanceCard =
        isWaitingForAction &&
        lastMoveResult?.action ===
            'DRAW_CHANCE_CARD' &&
        drawnCard === null;

    const canDrawCommunityCard =
        isWaitingForAction &&
        lastMoveResult?.action ===
            'DRAW_COMMUNITY_CARD' &&
        drawnCard === null;

    const isWaitingForCardDraw =
        canDrawChanceCard ||
        canDrawCommunityCard;
    const shouldChooseJailFreeCard =
        currentPlayerInJail &&
        currentPlayerJailFreeCardCount > 0 &&
        !isPlayerMoving &&
        !isWaitingForAction &&
        drawnCard === null;

    const shouldShowDice =
        !canChoosePropertyAction &&
        !canChooseBuildAction &&
        !isWaitingForCardDraw &&
        !shouldChooseJailFreeCard &&
        drawnCard === null;

    return (
        <div className="relative col-start-2 col-end-11 row-start-2 row-end-11 overflow-hidden bg-emerald-50">
            <img
                src={bgBoardCenter}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
            />

            <div className="absolute inset-0 -rotate-45">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="board-center-card-decks flex items-center">
                        <CardDeckButton
                            title="Khí vận"
                            subtitle="Thẻ khí vận"
                            color="amber"
                            enabled={
                                canDrawCommunityCard
                            }
                            onClick={
                                onDrawCommunityCard
                            }
                        />

                        <CardDeckButton
                            title="Cơ hội"
                            subtitle="Thẻ cơ hội"
                            color="red"
                            enabled={canDrawChanceCard}
                            onClick={
                                onDrawChanceCard
                            }
                        />
                    </div>
                </div>

                {shouldShowDice && (
                    <div className="absolute left-1/2 top-[50%] z-20 -translate-x-1/2 -translate-y-1/2">
                        <DicePanel
                            key={currentPlayerName}
                            onRoll={onRoll}
                            disabled={
                                isPlayerMoving ||
                                isWaitingForAction
                            }
                            currentPlayerName={
                                currentPlayerName
                            }
                        />
                    </div>
                )}

                {shouldChooseJailFreeCard && (
                    <JailDecisionPanel
                        playerName={currentPlayerName}
                        jailFreeCardCount={
                            currentPlayerJailFreeCardCount
                        }
                        onUseCard={onUseJailFreeCard}
                        onSkipCard={onSkipJailFreeCard}
                    />
                )}
            </div>

            {canChoosePropertyAction && (
                <PropertyPurchasePanel
                    property={landedProperty}
                    canAffordProperty={
                        canAffordProperty
                    }
                    onBuyProperty={onBuyProperty}
                    onSkipProperty={onSkipProperty}
                />
            )}

            {canChooseBuildAction && (
                <PropertyBuildPanel
                    property={landedProperty}
                    ownership={landedPropertyOwnership}
                    improvementPrice={
                        landedImprovementPrice
                    }
                    nextRent={landedRentAfterImprovement}
                    canAffordImprovement={
                        canAffordPropertyImprovement
                    }
                    onBuildProperty={onBuildProperty}
                    onSkipBuild={onSkipBuildProperty}
                />
            )}

            {drawnCard && (
                <CardResultModal
                    card={drawnCard}
                    playerName={currentPlayerName}
                    onExecute={onExecuteCard}
                />
            )}
        </div>
    );
}

export default BoardCenter;
