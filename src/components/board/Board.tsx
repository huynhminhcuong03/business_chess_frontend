import { useRef, useState } from "react";
import { gameAPI } from "../../services/gameAPI";
import ToastViewport from "../feedback/ToastViewport";
import TestMovePanel from "../game/TestMovePanel";
import { useBoardAnimations } from "../../hooks/useBoardAnimations";
import { useBoardCardActions } from "../../hooks/useBoardCardActions";
import { useBoardData } from "../../hooks/useBoardData";
import {
  getGamePlayerName,
  useCurrentPlayerInfo,
} from "../../hooks/useCurrentPlayerInfo";
import { useJailActions } from "../../hooks/useJailActions";
import { useRentPaymentAction } from "../../hooks/useRentPaymentAction";
import { useStepPlayerMovement } from "../../hooks/useStepPlayerMovement";
import { useTaxPaymentAction } from "../../hooks/useTaxPaymentAction";
import { useTestMoveActions } from "../../hooks/useTestMoveActions";
import { useToastNotifications } from "../../hooks/useToastNotifications";
import type { ResolvedMove, SelectedJailAction } from "../../types/boardFlow";
import type { GameCard } from "../../types/card";
import { formatPlayerMoney } from "../../utils/formatMoney";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";
import {
  toResolvedMoveFromRoll,
  toRollDiceResponseFromJailAction,
} from "../../utils/boardMoveMappers";
import { canPlayerAffordLandedProperty } from "../../utils/boardPropertyCards";
import { usePropertyPurchaseAction } from "../../hooks/usePropertyPurchaseAction";
import {
  updateMovedPlayer,
  updatePlayerAfterGoToJail as applyPlayerAfterGoToJail,
  updatePlayersAfterCardDraw,
} from "../../utils/playerStateUpdates";
import type { LastMoveResult } from "../../types/game";
import BoardCenter from "./BoardCenter";
import BoardGrid from "./BoardGrid";
import JailMoveAnimation from "../player/JailMoveAnimation";
import MoneyTransferAnimation from "../player/MoneyTransferAnimation";
import PlayerLayer from "../player/PlayerLayer";
import PlayerMoneyLayer from "../player/PlayerMoneyLayer";
import type {
  DrawCardResponse,
  GameResponse,
  JailActionResponse,
  LandCellResponse,
  LandedPropertyResponse,
  RollDiceResponse,
} from "../../types/gameApi";
import type { GamePlayerResponse } from "../../types/playerApi";

interface PendingUtilityRentPayment {
  gamePlayerId: number;
  nextPlayerId: number;
  landResult: LandCellResponse;
}

interface BoardProps {
  game: GameResponse;
}

function Board({ game }: BoardProps) {
  const pendingJailActionResultRef = useRef<JailActionResponse | null>(null);
  const [gamePlayers, setGamePlayers] = useState<GamePlayerResponse[]>(
    game.players ?? [],
  );
  const [pendingUtilityRentPayment, setPendingUtilityRentPayment] =
    useState<PendingUtilityRentPayment | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<number | null>(
    game.currentPlayerId,
  );
  const [pendingNextPlayerId, setPendingNextPlayerId] = useState<number | null>(
    null,
  );
  const [diceResetCount, setDiceResetCount] = useState(0);
  const [lastMoveResult, setLastMoveResult] = useState<LastMoveResult | null>(
    null,
  );
  const [landedPropertyInfo, setLandedPropertyInfo] =
    useState<LandedPropertyResponse | null>(null);
  const [drawnCard, setDrawnCard] = useState<GameCard | null>(null);
  const [pendingCardResult, setPendingCardResult] =
    useState<DrawCardResponse | null>(null);
  const [selectedJailAction, setSelectedJailAction] =
    useState<SelectedJailAction | null>(null);
  const [isWaitingForAction, setIsWaitingForAction] = useState(false);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const { notifications, showToast, dismissToast } = useToastNotifications();
  const {
    boardCells,
    errorMessage,
    isLoadingBoard,
    ownedProperties,
    setErrorMessage,
    setOwnedProperties,
  } = useBoardData({
    properties: game.properties ?? [],
    showToast,
  });
  const { isPlayerMoving, movePlayer } = useStepPlayerMovement({
    boardCellCount: boardCells.length,
    setGamePlayers,
  });
  const {
    boardFrameRef,
    jailMoveAnimation,
    moneyTransfer,
    handleJailMoveAnimationComplete,
    handleMoneyTransferComplete,
    playJailMoveAnimation,
    playBankTransferAnimation,
    playRentTransferAnimation,
    setPlayerMoneyElement,
  } = useBoardAnimations();
  const {
    currentGamePlayer,
    currentGamePlayerId,
    currentPlayerName,
    selectedCurrentJailActionType,
  } = useCurrentPlayerInfo({
    currentPlayerId,
    players: gamePlayers,
    selectedJailAction,
  });

  async function handleRollDice(): Promise<RollDiceResponse | null> {
    if (
      boardCells.length === 0 ||
      !currentGamePlayer ||
      isPlayerMoving ||
      isRollingDice ||
      isWaitingForAction
    ) {
      return null;
    }

    if (currentGamePlayer.inJail && selectedCurrentJailActionType === null) {
      return null;
    }

    if (pendingUtilityRentPayment) {
      setIsRollingDice(true);
      setErrorMessage(null);

      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;

      return {
        dice1,
        dice2,
        total: dice1 + dice2,
        isDouble: dice1 === dice2,
        oldPosition: currentGamePlayer.position,
        newPosition: currentGamePlayer.position,
        passedStart: false,
        startReward: 0,
        currentPlayerMoney: currentGamePlayer.money,
        currentPlayerId: currentGamePlayer.id,
        nextPlayerId: pendingUtilityRentPayment.nextPlayerId,
      } as RollDiceResponse;
    }

    setIsRollingDice(true);
    setErrorMessage(null);
    setIsWaitingForAction(false);
    setDrawnCard(null);
    setPendingCardResult(null);
    setLastMoveResult(null);
    setLandedPropertyInfo(null);
    setPendingNextPlayerId(null);

    try {
      if (currentGamePlayer.inJail && selectedCurrentJailActionType !== null) {
        const jailAction = await gameAPI.handleJailAction(
          game.id,
          currentGamePlayer.id,
          {
            actionType: selectedCurrentJailActionType,
          },
        );

        pendingJailActionResultRef.current = jailAction;
        return toRollDiceResponseFromJailAction(jailAction);
      }

      return await gameAPI.rollDice(game.id, currentGamePlayer.id);
    } catch (error) {
      const message = getApiErrorMessage(error, "Không thể tung xúc xắc.");

      setErrorMessage(message);
      showToast(message, "error");
      setIsRollingDice(false);

      return null;
    }
  }

  function handleRollDiceComplete(result: RollDiceResponse): void {
    if (pendingUtilityRentPayment) {
      void handleUtilityRentRollComplete(result);
      return;
    }

    const jailAction = pendingJailActionResultRef.current;

    if (jailAction) {
      pendingJailActionResultRef.current = null;
      void handleJailActionRollComplete(jailAction);
      return;
    }

    if (result.sentToJail) {
      void handleTripleDoubleJailMove(result);
      return;
    }

    void handleResolvedMove(toResolvedMoveFromRoll(result));
  }

  async function handleUtilityRentRollComplete(
    result: RollDiceResponse,
  ): Promise<void> {
    const pending = pendingUtilityRentPayment;

    if (!pending) {
      setIsRollingDice(false);
      return;
    }

    setPendingUtilityRentPayment(null);

    try {
      await handlePayRentAfterLand(
        pending.gamePlayerId,
        pending.nextPlayerId,
        pending.landResult,
        result.total,
      );
    } finally {
      setIsRollingDice(false);
    }
  }

  async function handleResolvedMove(move: ResolvedMove): Promise<void> {
    if (!currentGamePlayer) {
      setIsRollingDice(false);
      return;
    }

    const nextPosition = await movePlayer({
      playerId: move.currentPlayerId,
      startPosition: move.oldPosition,
      stepCount: move.stepCount,
      onPassStart: () => {
        if (move.startReward > 0) {
          void playBankTransferAnimation(
            move.currentPlayerId,
            move.startReward,
          );
          showToast(
            `${getGamePlayerName(gamePlayers, move.currentPlayerId)} nhận ${formatPlayerMoney(move.startReward)}$ khi đi qua ô bắt đầu.`,
            "success",
          );
        }
      },
    });
    const landedCell = boardCells[move.newPosition] ?? boardCells[nextPosition];

    if (!landedCell) {
      setIsRollingDice(false);
      return;
    }

    setGamePlayers((previousPlayers) =>
      updateMovedPlayer(
        previousPlayers,
        move.currentPlayerId,
        move.newPosition,
        move.currentPlayerMoney,
      ),
    );

    await resolveLandedCell(move.currentPlayerId, move.nextPlayerId, {
      startReward: move.startReward,
      rentDiceTotal: move.rentDiceTotal,
    });
    setIsRollingDice(false);
  }

  async function resolveLandedCell(
    gamePlayerId: number,
    nextPlayerId: number,
    options: {
      startReward?: number;
      rentDiceTotal?: number;
    } = {},
  ): Promise<void> {
    const startReward = options.startReward ?? 0;
    let landResult: LandCellResponse;

    try {
      landResult = await gameAPI.landCell(game.id, gamePlayerId);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể kiểm tra ô vừa đến.",
      );
      setErrorMessage(message);
      showToast(message, "error");
      setCurrentPlayerId(nextPlayerId);
      setDiceResetCount((currentCount) => currentCount + 1);
      return;
    }

    const action = landResult.action;

    setLandedPropertyInfo(landResult.property);
    setLastMoveResult({
      playerName: currentPlayerName,
      cellId: landResult.cellId,
      cellPosition: landResult.cellPosition,
      cellName: landResult.cellName,
      cellType: landResult.cellType,
      action,
      startReward,
    });

    if (
      action === "PAY_RENT" &&
      landResult.property?.diceRollRequired
    ) {
      setPendingUtilityRentPayment({
        gamePlayerId,
        nextPlayerId,
        landResult,
      });
      setIsWaitingForAction(false);
      setPendingNextPlayerId(null);
      showToast(
        `Đã dừng tại tiện ích đã có chủ. Hãy tung xúc xắc để tính tiền thuê; tổng chỉ dùng cho tính tiền và sẽ không di chuyển thêm.`,
        "info",
      );
      return;
    }

    if (action === "PAY_RENT") {
      await handlePayRentAfterLand(
        gamePlayerId,
        nextPlayerId,
        landResult,
        // Rút thẻ không đi kèm lượt xúc xắc, nên chưa có tổng xúc xắc
        // cho trường hợp đáp vào ô Tiện ích (Utility) của người khác.
        options.rentDiceTotal ?? 0,
      );
      return;
    }

    if (action === "PAY_LUXURY_TAX") {
      await handlePayTaxAfterLand(gamePlayerId, nextPlayerId, landResult, {});
      return;
    }

    if (action === "GO_TO_JAIL") {
      await handleGoToJailAfterLand(gamePlayerId, nextPlayerId, landResult);
      return;
    }

    if (
      action === "BUY_PROPERTY" &&
      !canPlayerAffordLandedProperty(gamePlayers, gamePlayerId, landResult)
    ) {
      setLandedPropertyInfo(null);
      setIsWaitingForAction(false);
      setCurrentPlayerId(nextPlayerId);
      setPendingNextPlayerId(null);
      setDiceResetCount((currentCount) => currentCount + 1);
      showToast("Không đủ tiền mua tài sản.", "info");
      return;
    }

    setIsWaitingForAction(action !== "NONE");
    if (action === "NONE") {
      setCurrentPlayerId(nextPlayerId);
      setDiceResetCount((currentCount) => currentCount + 1);
    } else {
      setPendingNextPlayerId(nextPlayerId);
    }
  }

  async function handleGoToJailAfterLand(
    gamePlayerId: number,
    nextPlayerId: number,
    landResult: LandCellResponse,
  ): Promise<void> {
    try {
      const jailedPlayer = gamePlayers.find(
        (player) => player.id === gamePlayerId,
      );
      const goToJailResult = await gameAPI.goToJail(game.id, gamePlayerId);

      if (jailedPlayer) {
        await playJailMoveAnimation(
          jailedPlayer,
          goToJailResult.fromPosition,
          goToJailResult.jailPosition,
        );
      }

      setGamePlayers((previousPlayers) =>
        applyPlayerAfterGoToJail(previousPlayers, goToJailResult),
      );
      setLastMoveResult({
        playerName: getGamePlayerName(gamePlayers, gamePlayerId),
        cellId: landResult.cellId,
        cellPosition: landResult.cellPosition,
        cellName: landResult.cellName,
        cellType: landResult.cellType,
        action: landResult.action,
        jailMove: {
          playerName: getGamePlayerName(gamePlayers, gamePlayerId),
        },
      });
      setLandedPropertyInfo(null);
      setIsWaitingForAction(false);
      setCurrentPlayerId(nextPlayerId);
      setPendingNextPlayerId(null);
      setDiceResetCount((currentCount) => currentCount + 1);
      showToast(
        `${getGamePlayerName(gamePlayers, gamePlayerId)} bị đưa vào tù.`,
        "info",
      );
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể đưa người chơi vào tù.",
      );

      setErrorMessage(message);
      showToast(message, "error");
      setIsWaitingForAction(false);
      setCurrentPlayerId(nextPlayerId);
      setPendingNextPlayerId(null);
      setDiceResetCount((currentCount) => currentCount + 1);
    }
  }

  function finishPendingTurn(): void {
    if (pendingNextPlayerId !== null) {
      setCurrentPlayerId(pendingNextPlayerId);
      setPendingNextPlayerId(null);
    }

    setDiceResetCount((currentCount) => currentCount + 1);
  }

  function clearPendingAction(): void {
    setDrawnCard(null);
    setPendingCardResult(null);
    setPendingUtilityRentPayment(null);
    setIsWaitingForAction(false);
    setLastMoveResult(null);
    setLandedPropertyInfo(null);
    finishPendingTurn();
  }

  async function handleExecuteCard(): Promise<void> {
    const cardResult = pendingCardResult;

    if (cardResult === null) {
      clearPendingAction();
      return;
    }

    setDrawnCard(null);
    setPendingCardResult(null);
    setIsWaitingForAction(false);

    const changedPlayerIds = new Set<number>();

    for (const moneyChange of cardResult.moneyChanges) {
      changedPlayerIds.add(moneyChange.gamePlayerId);
      await playBankTransferAnimation(
        moneyChange.gamePlayerId,
        moneyChange.moneyDelta,
      );
    }

    if (!changedPlayerIds.has(cardResult.gamePlayerId)) {
      const currentCardPlayer = gamePlayers.find(
        (player) => player.id === cardResult.gamePlayerId,
      );
      const moneyDelta =
        currentCardPlayer === undefined
          ? 0
          : cardResult.currentPlayerMoney - currentCardPlayer.money;
      await playBankTransferAnimation(cardResult.gamePlayerId, moneyDelta);
    }

    setGamePlayers((previousPlayers) =>
      updatePlayersAfterCardDraw(previousPlayers, cardResult),
    );

    if (cardResult.startReward > 0) {
      showToast(
        `${getGamePlayerName(gamePlayers, cardResult.gamePlayerId)} nhận ${formatPlayerMoney(cardResult.startReward)}$ khi đi qua ô bắt đầu.`,
        "success",
      );
    }

    // Thẻ GO_TO_JAIL đã được backend xử lý xong hoàn toàn (đưa thẳng vào tù),
    // nên chỉ cần animation và kết thúc lượt.
    if (cardResult.sentToJail) {
      const cardPlayer = gamePlayers.find(
        (player) => player.id === cardResult.gamePlayerId,
      );

      if (cardPlayer) {
        await playJailMoveAnimation(
          cardPlayer,
          cardResult.oldPosition,
          cardResult.jailPosition ?? cardResult.newPosition,
        );
      }

      showToast(
        `${getGamePlayerName(gamePlayers, cardResult.gamePlayerId)} bị đưa vào tù.`,
        "info",
      );
      setLastMoveResult(null);
      setLandedPropertyInfo(null);
      finishPendingTurn();
      return;
    }

    // Thẻ có di chuyển (MOVE_BACK / MOVE_TO_POSITION / MOVE_TO_NEAREST_STATION /
    // MOVE_TO_NEAREST_UTILITY) thì phải kiểm tra lại ô vừa dừng chân, y hệt luồng
    // tung xúc xắc — nếu không sẽ bỏ qua việc mua đất / trả tiền thuê / đóng thuế.
    if (cardResult.moved) {
      const cardPlayer = gamePlayers.find(
        (player) => player.id === cardResult.gamePlayerId,
      );

      if (cardPlayer) {
        await playJailMoveAnimation(
          cardPlayer,
          cardResult.oldPosition,
          cardResult.newPosition,
        );
      }

      const nextPlayerId = pendingNextPlayerId ?? cardResult.gamePlayerId;
      await resolveLandedCell(cardResult.gamePlayerId, nextPlayerId, {
        rentDiceTotal: 0,
      });
      return;
    }

    // Thẻ chỉ đổi tiền, không di chuyển (RECEIVE_FROM_BANK, PAY_TO_BANK,
    // COLLECT/PAY_EACH_PLAYER, GET_OUT_OF_JAIL, REPAIR_PROPERTIES...) thì
    // người chơi vẫn đứng ở ô Cơ hội/Khí vận cũ → kết thúc lượt như cũ.
    setLastMoveResult(null);
    setLandedPropertyInfo(null);
    finishPendingTurn();
  }

  const hasBoardCells = boardCells.length > 0;
  const diceResetKey = `${currentGamePlayerId ?? "none"}-${diceResetCount}`;
  const landedCell =
    lastMoveResult === null
      ? null
      : (boardCells.find((cell) => cell.id === lastMoveResult.cellId) ?? null);
  const canAffordLandedProperty =
    landedPropertyInfo?.buyPrice !== undefined &&
    landedPropertyInfo.buyPrice !== null &&
    currentGamePlayer !== null &&
    currentGamePlayer.money >= landedPropertyInfo.buyPrice;
  const {
    handleJailAction,
    handleJailActionRollComplete,
    handleTripleDoubleJailMove,
  } = useJailActions({
    boardCells,
    currentGamePlayer,
    gamePlayers,
    handleResolvedMove,
    isPlayerMoving,
    isRollingDice,
    isWaitingForAction,
    playJailMoveAnimation,
    playBankTransferAnimation,
    setCurrentPlayerId,
    setDiceResetCount,
    setDrawnCard,
    setErrorMessage,
    setGamePlayers,
    setIsRollingDice,
    setIsWaitingForAction,
    setLandedPropertyInfo,
    setLastMoveResult,
    setPendingNextPlayerId,
    setSelectedJailAction,
    showToast,
  });
  const { handlePayRentAfterLand } = useRentPaymentAction({
    gameId: game.id,
    gamePlayers,
    playRentTransferAnimation,
    setCurrentPlayerId,
    setDiceResetCount,
    setErrorMessage,
    setGamePlayers,
    setIsWaitingForAction,
    setLandedPropertyInfo,
    setLastMoveResult,
    setPendingNextPlayerId,
    showToast,
  });
  const {
    handlePayFixedIncomeTax,
    handlePayPercentIncomeTax,
    handlePayTaxAfterLand,
  } = useTaxPaymentAction({
    currentGamePlayer,
    gameId: game.id,
    gamePlayers,
    lastMoveResult,
    pendingNextPlayerId,
    playBankTransferAnimation,
    setCurrentPlayerId,
    setDiceResetCount,
    setErrorMessage,
    setGamePlayers,
    setIsWaitingForAction,
    setLandedPropertyInfo,
    setLastMoveResult,
    setPendingNextPlayerId,
    showToast,
  });
  const { handleDrawChanceCard, handleDrawCommunityCard } = useBoardCardActions(
    {
      currentGamePlayerId,
      finishPendingTurn,
      gameId: game.id,
      setDrawnCard,
      setPendingCardResult,
      setErrorMessage,
      setIsWaitingForAction,
      showToast,
    },
  );
  const { handleBuyProperty } = usePropertyPurchaseAction({
    clearPendingAction,
    currentGamePlayer,
    gameId: game.id,
    landedCell,
    playBankTransferAnimation,
    setErrorMessage,
    setGamePlayers,
    setOwnedProperties,
    showToast,
  });
  const { handleTestMoveToCell, handleTestRollDice } = useTestMoveActions({
    boardCellCount: boardCells.length,
    currentGamePlayer,
    gameId: game.id,
    handleResolvedMove,
    handleTripleDoubleJailMove,
    isPlayerMoving,
    isRollingDice,
    isWaitingForAction,
    setDrawnCard,
    setErrorMessage,
    setIsRollingDice,
    setIsWaitingForAction,
    setLandedPropertyInfo,
    setLastMoveResult,
    setPendingNextPlayerId,
    showToast,
  });

  return (
    <div className="board-shell relative flex items-center justify-center">
      <ToastViewport notifications={notifications} onDismiss={dismissToast} />
      <PlayerMoneyLayer
        players={gamePlayers}
        currentGamePlayerId={currentGamePlayerId}
        ownedProperties={ownedProperties}
        onPlayerMoneyElementRef={setPlayerMoneyElement}
      />
      <MoneyTransferAnimation
        transfer={moneyTransfer}
        onComplete={handleMoneyTransferComplete}
      />

      <div ref={boardFrameRef} className="board-frame relative aspect-square">
        <BoardGrid boardCells={boardCells}>
          <BoardCenter
            onRoll={handleRollDice}
            onRollComplete={handleRollDiceComplete}
            diceResetKey={diceResetKey}
            onBuyProperty={handleBuyProperty}
            onSkipProperty={clearPendingAction}
            onBuildProperty={clearPendingAction}
            onSkipBuildProperty={clearPendingAction}
            onDrawChanceCard={handleDrawChanceCard}
            onDrawCommunityCard={handleDrawCommunityCard}
            onExecuteCard={handleExecuteCard}
            onPayFixedIncomeTax={handlePayFixedIncomeTax}
            onPayPercentIncomeTax={handlePayPercentIncomeTax}
            onJailAction={handleJailAction}
            isPlayerMoving={isPlayerMoving}
            isRollingDice={isRollingDice}
            isWaitingForAction={isWaitingForAction}
            currentPlayerName={currentPlayerName}
            currentPlayerMoney={currentGamePlayer?.money ?? 0}
            currentPlayerInJail={currentGamePlayer?.inJail ?? false}
            selectedJailActionType={selectedCurrentJailActionType}
            currentPlayerJailTurn={currentGamePlayer?.jailTurn ?? 0}
            currentPlayerJailFreeCardCount={
              currentGamePlayer?.jailFreeCard ?? 0
            }
            landedProperty={landedCell}
            landedPropertyOwnership={null}
            landedImprovementPrice={null}
            landedRentAfterImprovement={null}
            canAffordProperty={canAffordLandedProperty}
            canAffordPropertyImprovement={false}
            lastMoveResult={lastMoveResult}
            drawnCard={drawnCard}
            pendingUtilityRentPayment={
              pendingUtilityRentPayment !== null
            }
            diceButtonLabel={
              pendingUtilityRentPayment
                ? 'Tung xúc xắc'
                : undefined
            }
          />

          {import.meta.env.DEV && (
            <TestMovePanel
              cellCount={boardCells.length}
              disabled={
                isPlayerMoving ||
                isRollingDice ||
                isWaitingForAction ||
                !hasBoardCells
              }
              onMoveToCell={handleTestMoveToCell}
              onRollDice={handleTestRollDice}
            />
          )}
        </BoardGrid>

        <PlayerLayer
          players={gamePlayers}
          hiddenPlayerIds={
            jailMoveAnimation ? [jailMoveAnimation.player.id] : []
          }
        />

        {jailMoveAnimation && (
          <JailMoveAnimation
            key={jailMoveAnimation.id}
            player={jailMoveAnimation.player}
            from={jailMoveAnimation.from}
            to={jailMoveAnimation.to}
            onComplete={handleJailMoveAnimationComplete}
          />
        )}

        {isLoadingBoard && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 text-sm font-bold text-slate-700">
            Đang tải bàn cờ...
          </div>
        )}

        {!isLoadingBoard && errorMessage && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 px-6 text-center text-sm font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        {!isLoadingBoard && !errorMessage && !hasBoardCells && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 text-sm font-bold text-slate-700">
            Không có dữ liệu ô bàn cờ.
          </div>
        )}
      </div>
    </div>
  );
}

export default Board;
