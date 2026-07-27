import type { BoardCell } from '../../types/board';
import type { PropertyOwnership } from '../../types/game';
import { formatPlayerMoney } from '../../utils/formatMoney';

interface PropertyBuildPanelProps {
    property: BoardCell | null;
    ownership: PropertyOwnership | null;
    improvementPrice: number | null;
    nextRent: number | null;
    canAffordImprovement: boolean;
    onBuildProperty: () => void;
    onSkipBuild: () => void;
}

function PropertyBuildPanel({
    property,
    ownership,
    improvementPrice,
    nextRent,
    canAffordImprovement,
    onBuildProperty,
    onSkipBuild,
}: PropertyBuildPanelProps) {
    if (
        !property ||
        !ownership ||
        improvementPrice === null
    ) {
        return null;
    }

    const isHotelUpgrade =
        ownership.houseCount >= 4 &&
        !ownership.hasHotel;
    const actionLabel = isHotelUpgrade
        ? 'Xây khách sạn'
        : 'Xây nhà';
    const currentBuildingLabel = ownership.hasHotel
        ? '1 khách sạn'
        : `${ownership.houseCount}/4 nhà`;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-build-title"
        >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border-4 border-amber-400 bg-white text-center shadow-2xl">
                <div className="bg-amber-500 px-4 py-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-white">
                        Tài sản đã sở hữu
                    </p>
                </div>

                <div className="p-6">
                    <h2
                        id="property-build-title"
                        className="text-2xl font-extrabold text-slate-900"
                    >
                        {property.name}
                    </h2>

                    <p className="mt-2 text-sm font-semibold text-slate-600">
                        Bạn đã quay lại tài sản của mình.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                        <InfoItem
                            label="Hiện tại"
                            value={currentBuildingLabel}
                        />
                        <InfoItem
                            label="Chi phí"
                            value={`$${formatPlayerMoney(
                                improvementPrice,
                            )}`}
                        />
                        {nextRent !== null && (
                            <InfoItem
                                label="Thuê sau xây"
                                value={`$${formatPlayerMoney(
                                    nextRent,
                                )}`}
                            />
                        )}
                        <InfoItem
                            label="Luật"
                            value={
                                isHotelUpgrade
                                    ? 'Đổi 4 nhà lên khách sạn'
                                    : 'Xây thêm 1 nhà'
                            }
                        />
                    </div>

                    {!canAffordImprovement && (
                        <p className="mt-4 text-sm font-semibold text-red-600">
                            Bạn không đủ tiền để xây lúc này.
                        </p>
                    )}

                    <div className="mt-7 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={onBuildProperty}
                            disabled={!canAffordImprovement}
                            className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {actionLabel}
                        </button>

                        <button
                            type="button"
                            onClick={onSkipBuild}
                            className="rounded-lg bg-slate-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600"
                        >
                            Bỏ qua
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface InfoItemProps {
    label: string;
    value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold text-slate-500">
                {label}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
                {value}
            </p>
        </div>
    );
}

export default PropertyBuildPanel;
