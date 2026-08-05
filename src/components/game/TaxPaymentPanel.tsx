import type { BoardCell } from '../../types/board';
import { formatPlayerMoney } from '../../utils/formatMoney';

interface TaxPaymentPanelProps {
    taxCell: BoardCell | null;
    playerName: string;
    onPayFixedIncomeTax: () => void;
    onPayPercentIncomeTax: () => void;
}

function TaxPaymentPanel({
    taxCell,
    playerName,
    onPayFixedIncomeTax,
    onPayPercentIncomeTax,
}: TaxPaymentPanelProps) {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tax-payment-title"
        >
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-sky-400 bg-white text-center shadow-2xl">
                <div className="bg-sky-500 px-6 py-4 text-white">
                    <h2
                        id="tax-payment-title"
                        className="mt-2 text-2xl font-extrabold"
                    >
                        {taxCell?.name ?? 'Thuế thu nhập'}
                    </h2>
                </div>

                <div className="p-6">
                    <p className="text-sm font-semibold text-slate-600">
                        {playerName} phải chọn cách đóng thuế trước khi tính tổng tài sản.
                    </p>

                    <div className="mt-6 grid gap-3">
                        <button
                            type="button"
                            onClick={onPayFixedIncomeTax}
                            className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
                        >
                            Trả {formatPlayerMoney(200)}$
                        </button>

                        <button
                            type="button"
                            onClick={onPayPercentIncomeTax}
                            className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900"
                        >
                            Trả 10% tổng tài sản
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaxPaymentPanel;
