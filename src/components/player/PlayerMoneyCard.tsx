import type { CSSProperties } from 'react';
import { useState } from 'react';
import { PROPERTY_COLOR_CLASSES } from '../../constants/boardStyles';
import {
    PLAYER_MONEY_THEMES,
} from '../../constants/playerMoneyStyles';
import type { OwnedPropertyCard } from '../../types/game';
import type { GamePlayerResponse } from '../../types/playerApi';
import { formatPlayerMoney } from '../../utils/formatMoney';
import { getCellTypeLabel } from '../../utils/gameDisplayLabels';

interface PlayerMoneyCardProps {
    player: GamePlayerResponse;
    positionClass: string;
    isCurrentPlayer: boolean;
    properties: OwnedPropertyCard[];
    deedPlacement: 'above' | 'below';
    onMoneyElementRef?: (
        element: HTMLDivElement | null,
    ) => void;
}

const PROPERTY_COLOR_VALUES: Record<string, string> = {
    RED: '#ef4444',
    GRAY: '#6b7280',
    DARK_BLUE: '#1e3a8a',
    GREEN: '#22c55e',
    ORANGE: '#f97316',
    YELLOW: '#facc15',
    PRIMARY: '#8b5cf6',
    BLUE: '#3b82f6',
};

function getPropertyColorClass(
    color: string | null,
): string {
    if (!color) {
        return 'bg-slate-400';
    }

    return (
        PROPERTY_COLOR_CLASSES[color] ?? 'bg-slate-400'
    );
}

function getPropertyDeedStyle(
    color: string | null,
): CSSProperties {
    const deedColor = color
        ? PROPERTY_COLOR_VALUES[color] ?? color
        : '#64748b';

    return {
        '--deed-color': deedColor,
        borderColor: deedColor,
    } as CSSProperties;
}

function PlayerMoneyCard({
    player,
    positionClass,
    isCurrentPlayer,
    properties,
    deedPlacement,
    onMoneyElementRef,
}: PlayerMoneyCardProps) {
    const theme =
        PLAYER_MONEY_THEMES[player.tokenColor];
    const [selectedProperty, setSelectedProperty] =
        useState<OwnedPropertyCard | null>(null);

    const propertyDeedStrip = properties.length > 0 && (
        <div
            className={`property-deed-strip grid gap-1.5 ${
                deedPlacement === 'above' ? 'mb-2' : 'mt-2'
            }`}
        >
            {properties.map((property) => (
                <button
                    key={property.gamePropertyId}
                    type="button"
                    onClick={() =>
                        setSelectedProperty(property)
                    }
                    className="property-deed-tab overflow-hidden rounded-md border-2 bg-[color-mix(in_srgb,var(--deed-color)_13%,white)] text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    style={getPropertyDeedStyle(
                        property.color,
                    )}
                >
                    <span
                        className={`block h-2 ${getPropertyColorClass(
                            property.color,
                        )}`}
                    />
                    <span className="block px-2 py-1.5">
                        <span className="block truncate text-[11px] font-black uppercase text-slate-900">
                            {property.boardCellName}
                        </span>
                        <span className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-slate-600">
                            <span>
                                {property.boardCellPosition}
                            </span>
                            <span>
                                {property.rent === null
                                    ? '-'
                                    : formatPlayerMoney(
                                          property.rent,
                                      )}
                            </span>
                        </span>
                    </span>
                </button>
            ))}
        </div>
    );

    const playerMoneyPanel = (
        <div
            className={`overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur ${
                theme.border
            } ${
                isCurrentPlayer ? `ring-4 ${theme.glow}` : ''
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

            <div
                ref={onMoneyElementRef}
                className="border-t border-slate-100 bg-slate-50/80 px-4 py-3"
            >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Số dư
                </p>

                <div className="mt-1 flex items-end justify-between">
                    <span className="text-2xl font-black text-slate-900">
                        {formatPlayerMoney(player.money)}
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
                        {(player.jailFreeCard ?? 0) > 0 && (
                            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                                Ra tù x{player.jailFreeCard}
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
    );

    return (
        <div
            className={`player-money-card pointer-events-auto absolute ${positionClass}`}
        >
            {deedPlacement === 'above' && propertyDeedStrip}
            {playerMoneyPanel}
            {deedPlacement === 'below' && propertyDeedStrip}

            {selectedProperty && (
                <PropertyDeedModal
                    property={selectedProperty}
                    onClose={() =>
                        setSelectedProperty(null)
                    }
                />
            )}
        </div>
    );
}

interface PropertyDeedModalProps {
    property: OwnedPropertyCard;
    onClose: () => void;
}

function PropertyDeedModal({
    property,
    onClose,
}: PropertyDeedModalProps) {
    const detail = property.propertyDetail;

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                <div
                    className={`h-5 ${getPropertyColorClass(
                        property.color,
                    )}`}
                />

                <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                        {getCellTypeLabel(
                            property.boardCellType,
                        )}
                    </p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">
                        {property.boardCellName}
                    </h2>
                    <p className="mt-1 text-sm font-bold text-slate-500">
                        Ô số {property.boardCellPosition}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                        <DeedInfo
                            label="Giá mua"
                            value={formatNullableMoney(
                                property.buyPrice,
                            )}
                        />
                        <DeedInfo
                            label="Thuê hiện tại"
                            value={formatNullableMoney(
                                property.rent,
                            )}
                        />
                        <DeedInfo
                            label="Số nhà"
                            value={String(
                                property.houseCount,
                            )}
                        />
                        <DeedInfo
                            label="Khách sạn"
                            value={
                                property.hasHotel
                                    ? 'Có'
                                    : 'Không'
                            }
                        />
                        <DeedInfo
                            label="Thế chấp"
                            value={
                                property.mortgaged
                                    ? 'Đang thế chấp'
                                    : 'Không'
                            }
                        />
                        <DeedInfo
                            label="Giá thế chấp"
                            value={formatNullableMoney(
                                detail?.mortgagePrice ?? null,
                            )}
                        />
                    </div>

                    {detail && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-black uppercase text-slate-500">
                                Bảng giá thuê
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-bold text-slate-700">
                                <span>Cơ bản</span>
                                <span className="text-right">
                                    {formatPlayerMoney(
                                        detail.rentLevel0,
                                    )}
                                </span>
                                <span>1 nhà</span>
                                <span className="text-right">
                                    {formatPlayerMoney(
                                        detail.rentLevel1,
                                    )}
                                </span>
                                <span>2 nhà</span>
                                <span className="text-right">
                                    {formatPlayerMoney(
                                        detail.rentLevel2,
                                    )}
                                </span>
                                <span>3 nhà</span>
                                <span className="text-right">
                                    {formatPlayerMoney(
                                        detail.rentLevel3,
                                    )}
                                </span>
                                <span>4 nhà</span>
                                <span className="text-right">
                                    {formatPlayerMoney(
                                        detail.rentLevel4,
                                    )}
                                </span>
                                <span>Khách sạn</span>
                                <span className="text-right">
                                    {formatPlayerMoney(
                                        detail.rentHotel,
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

interface DeedInfoProps {
    label: string;
    value: string;
}

function DeedInfo({ label, value }: DeedInfoProps) {
    return (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
                {value}
            </p>
        </div>
    );
}

function formatNullableMoney(value: number | null): string {
    return value === null ? '-' : formatPlayerMoney(value);
}

export default PlayerMoneyCard;
