interface JailDecisionPanelProps {
    playerName: string;
    playerMoney: number;
    jailTurn: number;
    jailFreeCardCount: number;
    onPayFine: () => void;
    onRollForDouble: () => void;
    onUseCard: () => void;
}

function JailDecisionPanel({
    playerName,
    playerMoney,
    jailTurn,
    jailFreeCardCount,
    onPayFine,
    onRollForDouble,
    onUseCard,
}: JailDecisionPanelProps) {
    const canPayFine = playerMoney >= 50;
    const canUseJailFreeCard = jailFreeCardCount > 0;

    return (
        <div className="absolute left-1/2 top-1/2 z-30 w-88 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xl border-4 border-amber-400 bg-white px-5 py-4 text-center shadow-2xl">
            <p className="text-xs font-black uppercase tracking-wide text-amber-600">
                Đang ở tù
            </p>

            <h2 className="mt-2 text-lg font-black text-slate-900">
                {playerName}
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-600">
                Lần thử thoát tù: {jailTurn}/3. Có {jailFreeCardCount} thẻ ra tù.
            </p>

            <div className="mt-4 grid gap-2">
                <button
                    type="button"
                    disabled={!canPayFine}
                    onClick={onPayFine}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300"
                >
                    Trả 50$
                </button>

                <button
                    type="button"
                    onClick={onRollForDouble}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                    Tung xúc xắc thử ra đôi
                </button>

                <button
                    type="button"
                    disabled={!canUseJailFreeCard}
                    onClick={onUseCard}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300"
                >
                    Dùng thẻ ra tù
                </button>
            </div>
        </div>
    );
}

export default JailDecisionPanel;
