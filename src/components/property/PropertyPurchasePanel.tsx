import { useEffect } from 'react';
import type { BoardCell } from '../../types/board';
import { formatPlayerMoney } from '../../utils/formatMoney';
import { getCellTypeLabel } from '../../utils/gameDisplayLabels';

interface PropertyPurchasePanelProps {
    property: BoardCell | null;
    canAffordProperty: boolean;
    onBuyProperty: () => void;
    onSkipProperty: () => void;
}

const AUTO_SKIP_SECONDS = 10;
const AUTO_SKIP_DURATION = AUTO_SKIP_SECONDS * 1000;

function PropertyPurchasePanel({
    property,
    canAffordProperty,
    onBuyProperty,
    onSkipProperty,
}: PropertyPurchasePanelProps) {
    const propertyDetail = property?.propertyDetail;

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            onSkipProperty();
        }, AUTO_SKIP_DURATION);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [onSkipProperty, property?.id]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-purchase-title"
        >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border-4 border-emerald-400 bg-white text-center shadow-2xl">
                <div className="h-2 bg-slate-200">
                    <div
                        key={property?.id ?? 'property'}
                        className="property-purchase-progress h-full bg-emerald-500"
                        style={{
                            animationDuration: `${AUTO_SKIP_DURATION}ms`,
                        }}
                    />
                </div>

                <div className="p-6">
                    <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-emerald-600">
                        {property
                            ? getCellTypeLabel(property.type)
                            : 'Tài sản'}
                    </p>

                    <h2
                        id="property-purchase-title"
                        className="mt-4 text-2xl font-extrabold text-slate-900"
                    >
                        {property?.name ??
                            'Mua tài sản này?'}
                    </h2>

                    {propertyDetail && (
                        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                            <InfoItem
                                label="Giá mua"
                                value={formatPlayerMoney(
                                    propertyDetail.buyPrice,
                                )}
                            />
                            <InfoItem
                                label="Thế chấp"
                                value={formatPlayerMoney(
                                    propertyDetail.mortgagePrice,
                                )}
                            />
                            <InfoItem
                                label="Giá nhà"
                                value={formatPlayerMoney(
                                    propertyDetail.housePrice,
                                )}
                            />
                            <InfoItem
                                label="Giá khách sạn"
                                value={formatPlayerMoney(
                                    propertyDetail.hotelPrice,
                                )}
                            />
                            <InfoItem
                                label="Thuê cơ bản"
                                value={formatPlayerMoney(
                                    propertyDetail.rentLevel0,
                                )}
                            />
                            <InfoItem
                                label="Thuê 1 nhà"
                                value={formatPlayerMoney(
                                    propertyDetail.rentLevel1,
                                )}
                            />
                            <InfoItem
                                label="Thuê 2 nhà"
                                value={formatPlayerMoney(
                                    propertyDetail.rentLevel2,
                                )}
                            />
                            <InfoItem
                                label="Thuê 3 nhà"
                                value={formatPlayerMoney(
                                    propertyDetail.rentLevel3,
                                )}
                            />
                            <InfoItem
                                label="Thuê 4 nhà"
                                value={formatPlayerMoney(
                                    propertyDetail.rentLevel4,
                                )}
                            />
                            <InfoItem
                                label="Thuê khách sạn"
                                value={formatPlayerMoney(
                                    propertyDetail.rentHotel,
                                )}
                            />
                        </div>
                    )}

                    {!canAffordProperty && (
                        <p className="mt-4 text-sm font-semibold text-red-600">
                            Bạn không đủ tiền để mua tài sản này.
                        </p>
                    )}

                    <p className="mt-4 text-xs font-semibold text-slate-500">
                        Tự bỏ qua sau {AUTO_SKIP_SECONDS} giây
                        nếu không mua.
                    </p>

                    <div className="mt-7 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={onBuyProperty}
                            disabled={!canAffordProperty}
                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            Mua
                        </button>

                        <button
                            type="button"
                            onClick={onSkipProperty}
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

export default PropertyPurchasePanel;
