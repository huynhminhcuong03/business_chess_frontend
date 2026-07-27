import type { LastMoveResult } from '../../types/game';
import {
    getCellActionLabel,
    getCellTypeLabel,
} from '../../utils/gameDisplayLabels';
import { formatPlayerMoney } from '../../utils/formatMoney';

interface GameStatusPanelProps {
    currentPlayerName: string;
    isPlayerMoving: boolean;
    isWaitingForAction: boolean;
    lastMoveResult: LastMoveResult | null;
}

function GameStatusPanel({
    currentPlayerName,
    isPlayerMoving,
    isWaitingForAction,
    lastMoveResult,
}: GameStatusPanelProps) {
    return (
        <aside className="w-full rounded-xl border border-slate-300 bg-white/95 px-4 py-4 text-center shadow-xl backdrop-blur">
            <p className="text-sm font-semibold text-slate-800">
                Lượt hiện tại: {currentPlayerName}
            </p>

            {isPlayerMoving && (
                <p className="mt-2 text-sm text-slate-500">
                    Người chơi đang di chuyển...
                </p>
            )}

            {!isPlayerMoving && lastMoveResult && (
                <div className="mt-3 border-t border-slate-200 pt-3">
                    <p className="text-sm font-semibold text-slate-700">
                        {lastMoveResult.playerName}
                        {' đã dừng ở ô: '}
                        {lastMoveResult.cellName}
                    </p>

                    {lastMoveResult.startReward !==
                        undefined && (
                            <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                                <p className="text-sm font-semibold text-emerald-700">
                                    Đi qua ô Bắt Đầu
                                </p>

                                <p className="mt-1 text-xs font-medium text-emerald-600">
                                    Nhận $
                                    {
                                        lastMoveResult.startReward
                                    }
                                </p>
                            </div>
                        )}

                    {lastMoveResult.taxPaid !== undefined && (
                        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                            <p className="text-sm font-semibold text-red-700">
                                Đã đóng thuế
                            </p>

                            <p className="mt-1 text-xs font-medium text-red-600">
                                Đã trả ${lastMoveResult.taxPaid}
                            </p>
                        </div>
                    )}

                    {lastMoveResult.rentPayment && (
                        <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
                            <p className="text-sm font-semibold text-blue-700">
                                Tráº£ tiá»n thuÃª
                            </p>

                            <p className="mt-1 text-xs font-medium text-blue-600">
                                {
                                    lastMoveResult.rentPayment
                                        .payerName
                                }{' '}
                                tráº£ $
                                {formatPlayerMoney(
                                    lastMoveResult
                                        .rentPayment
                                        .amountPaid,
                                )}{' '}
                                cho{' '}
                                {
                                    lastMoveResult.rentPayment
                                        .ownerName
                                }
                            </p>
                        </div>
                    )}

                    {lastMoveResult.jailMove && (
                        <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
                            <p className="text-sm font-semibold text-amber-700">
                                Vào tù
                            </p>

                            <p className="mt-1 text-xs font-medium text-amber-700">
                                {
                                    lastMoveResult.jailMove
                                        .playerName
                                }{' '}
                                bị chuyển đến nhà tù.
                            </p>
                        </div>
                    )}

                    {lastMoveResult.jailFreeCardUsed && (
                        <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                            <p className="text-sm font-semibold text-emerald-700">
                                DÃ¹ng tháº» ra tÃ¹
                            </p>

                            <p className="mt-1 text-xs font-medium text-emerald-700">
                                {
                                    lastMoveResult
                                        .jailFreeCardUsed
                                        .playerName
                                }{' '}
                                đã dùng thẻ để không phải vào tù.
                            </p>
                        </div>
                    )}

                    {lastMoveResult.bankruptcy && (
                        <div className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2">
                            <p className="text-sm font-semibold text-red-700">
                                PhÃ¡ sáº£n
                            </p>

                            <p className="mt-1 text-xs font-medium text-red-600">
                                {
                                    lastMoveResult.bankruptcy
                                        .playerName
                                }{' '}
                                {lastMoveResult.bankruptcy.reason.toLowerCase()}
                                . CÃ²n thiáº¿u $
                                {formatPlayerMoney(
                                    lastMoveResult
                                        .bankruptcy
                                        .amountDue -
                                        lastMoveResult
                                            .bankruptcy
                                            .amountPaid,
                                )}
                                .
                            </p>
                        </div>
                    )}

                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Loại ô:{' '}
                        {getCellTypeLabel(
                            lastMoveResult.cellType,
                        )}
                    </p>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Hành động:{' '}
                        {getCellActionLabel(
                            lastMoveResult.action,
                        )}
                    </p>

                    {isWaitingForAction && (
                        <p className="mt-2 text-sm font-medium text-amber-600">
                            Đang chờ người chơi thao tác...
                        </p>
                    )}
                </div>
            )}

            {!isPlayerMoving && !lastMoveResult && (
                <p className="mt-2 text-sm text-slate-500">
                    Tung xúc xắc để bắt đầu lượt.
                </p>
            )}
        </aside>
    );
}

export default GameStatusPanel;
