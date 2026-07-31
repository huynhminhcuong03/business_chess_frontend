import type { GamePlayerResponse } from '../../types/gameApi';
import {
    PLAYER_MONEY_THEMES,
} from '../../constants/playerMoneyStyles';
import { formatPlayerMoney } from '../../utils/formatMoney';

interface PlayerMoneyCardProps {
    player: GamePlayerResponse;
    positionClass: string;
    isCurrentPlayer: boolean;
}

function PlayerMoneyCard({
    player,
    positionClass,
    isCurrentPlayer,
}: PlayerMoneyCardProps) {
    const theme =
        PLAYER_MONEY_THEMES[player.tokenColor];

    return (
        <div
            className={`player-money-card pointer-events-auto absolute ${positionClass}`}
        >
            <div
                className={`overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur ${
                    theme.border
                } ${
                    isCurrentPlayer
                        ? `ring-4 ${theme.glow}`
                        : ''
                }`}
            >
                <div className="player-money-header flex items-center">
                    <div
                        className={`player-money-badge flex shrink-0 items-center justify-center rounded-full ${theme.badge}`}
                    >
                        <div className="h-5 w-5 rounded-full border-2 border-white bg-white/30" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="player-money-name font-bold uppercase tracking-wide text-slate-800">
                            {player.player.displayName}
                        </p>

                        <p className="player-money-name font-medium tracking-wide text-slate-600">
                            @{player.player.username}
                        </p>

                        <p
                            className={`player-money-turn-label mt-1 font-semibold ${
                                isCurrentPlayer
                                    ? theme.text
                                    : 'text-slate-400'
                            }`}
                        >
                            {isCurrentPlayer
                                ? 'Đang đến lượt'
                                : 'Đang chờ'}
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Số dư
                    </p>

                    <div className="mt-1 flex items-end justify-between">
                        <span className="text-2xl font-black text-slate-900">
                            {formatPlayerMoney(
                                player.money,
                            )}
                        </span>

                        <span className="text-sm font-bold text-emerald-600">
                            $
                        </span>
                    </div>
                </div>

                {((player.jailFreeCard ?? 0) > 0 ||
                    player.bankrupt) && (
                    <div className="border-t border-slate-100 px-4 py-2">
                        <div className="flex flex-wrap gap-1.5">
                            {(player.jailFreeCard ?? 0) >
                                0 && (
                                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                                    Ra tù x
                                    {player.jailFreeCard}
                                </span>
                            )}

                            {player.bankrupt && (
                                <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-black uppercase text-red-700">
                                    Phá sản
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlayerMoneyCard;
