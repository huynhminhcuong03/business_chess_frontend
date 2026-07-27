interface JailDecisionPanelProps {
    playerName: string;
    jailFreeCardCount: number;
    onUseCard: () => void;
    onSkipCard: () => void;
}

function JailDecisionPanel({
    playerName,
    jailFreeCardCount,
    onUseCard,
    onSkipCard,
}: JailDecisionPanelProps) {
    return (
        <div className="absolute left-1/2 top-1/2 z-30 w-80 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xl border-4 border-amber-400 bg-white px-5 py-4 text-center shadow-2xl">
            <p className="text-xs font-black uppercase tracking-wide text-amber-600">
                Đang ở tù
            </p>

            <h2 className="mt-2 text-lg font-black text-slate-900">
                {playerName}
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-600">
                Có {jailFreeCardCount} thẻ ra tù. Bạn có muốn dùng
                ngay lượt này không?
            </p>

            <div className="mt-4 flex justify-center gap-2">
                <button
                    type="button"
                    onClick={onUseCard}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                    Dùng thẻ
                </button>

                <button
                    type="button"
                    onClick={onSkipCard}
                    className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                    Không dùng
                </button>
            </div>
        </div>
    );
}

export default JailDecisionPanel;
