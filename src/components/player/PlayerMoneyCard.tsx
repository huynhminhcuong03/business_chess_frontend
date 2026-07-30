import { useState } from 'react';
import {
    PROPERTY_COLOR_CLASSES,
} from '../../constants/boardStyles';
import type { BoardCell } from '../../types/board';
import type { PropertyOwnership } from '../../types/game';
import {
    PLAYER_MONEY_THEMES,
} from '../../constants/playerMoneyStyles';
import type { Player } from '../../types/player';
import {
    canMortgageProperty,
    getMortgageRedeemCost,
} from '../../utils/boardGameRules';
import { formatPlayerMoney } from '../../utils/formatMoney';

interface OwnedProperty {
    ownership: PropertyOwnership;
    property: BoardCell;
}

interface PlayerMoneyCardProps {
    player: Player;
    positionClass: string;
    isCurrentPlayer: boolean;
    ownedProperties: OwnedProperty[];
    canManageProperties: boolean;
    onMortgageProperty: (boardCellId: number) => void;
    onRedeemProperty: (boardCellId: number) => void;
    deedPlacement: 'above' | 'below';
}

function PlayerMoneyCard({
    player,
    positionClass,
    isCurrentPlayer,
    ownedProperties,
    canManageProperties,
    onMortgageProperty,
    onRedeemProperty,
    deedPlacement,
}: PlayerMoneyCardProps) {
    const [expandedPropertyId, setExpandedPropertyId] =
        useState<number | null>(null);
    const theme =
        PLAYER_MONEY_THEMES[player.tokenColor];
    const deedListMarginClass =
        deedPlacement === 'above'
            ? 'mb-2'
            : 'mt-2';
    const deedList =
        ownedProperties.length > 0 ? (
            <div
                className={`${deedListMarginClass} max-h-[42vh] space-y-1.5 overflow-y-auto pr-1`}
            >
                <p className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 shadow-sm">
                    Bằng khoán ({ownedProperties.length})
                </p>

                {ownedProperties.map(
                    ({ ownership, property }) => (
                        <PropertyDeedCard
                            key={ownership.boardCellId}
                            property={property}
                            ownership={ownership}
                            playerMoney={player.money}
                            canManageProperties={
                                canManageProperties
                            }
                            onMortgageProperty={
                                onMortgageProperty
                            }
                            onRedeemProperty={
                                onRedeemProperty
                            }
                            isExpanded={
                                expandedPropertyId ===
                                property.id
                            }
                            onToggle={() => {
                                setExpandedPropertyId(
                                    expandedPropertyId ===
                                        property.id
                                        ? null
                                        : property.id,
                                );
                            }}
                        />
                    ),
                )}
            </div>
        ) : null;

    return (
        <div
            className={`player-money-card pointer-events-auto absolute ${positionClass}`}
        >
            {deedPlacement === 'above' && deedList}

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
                            {player.name}
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

                {((player.jailFreeCardCount ?? 0) > 0 ||
                    player.isBankrupt) && (
                    <div className="border-t border-slate-100 px-4 py-2">
                        <div className="flex flex-wrap gap-1.5">
                            {(player.jailFreeCardCount ?? 0) >
                                0 && (
                                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                                    Ra tÃ¹ x
                                    {
                                        player.jailFreeCardCount
                                    }
                                </span>
                            )}

                            {player.isBankrupt && (
                                <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-black uppercase text-red-700">
                                    PhÃ¡ sáº£n
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {deedPlacement === 'below' &&
                ownedProperties.length > 0 && (
                <div className="mt-2 max-h-[42vh] space-y-1.5 overflow-y-auto pr-1">
                    <p className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 shadow-sm">
                        Bằng khoán (
                        {ownedProperties.length})
                    </p>

                    {ownedProperties.map(
                        ({ ownership, property }) => (
                            <PropertyDeedCard
                                key={
                                    ownership.boardCellId
                                }
                                property={property}
                                ownership={ownership}
                                playerMoney={player.money}
                                canManageProperties={
                                    canManageProperties
                                }
                                onMortgageProperty={
                                    onMortgageProperty
                                }
                                onRedeemProperty={
                                    onRedeemProperty
                                }
                                isExpanded={
                                    expandedPropertyId ===
                                    property.id
                                }
                                onToggle={() => {
                                    setExpandedPropertyId(
                                        expandedPropertyId ===
                                            property.id
                                            ? null
                                            : property.id,
                                    );
                                }}
                            />
                        ),
                    )}
                </div>
            )}
        </div>
    );
}

interface PropertyDeedCardProps {
    property: BoardCell;
    ownership: PropertyOwnership;
    playerMoney: number;
    canManageProperties: boolean;
    onMortgageProperty: (boardCellId: number) => void;
    onRedeemProperty: (boardCellId: number) => void;
    isExpanded: boolean;
    onToggle: () => void;
}

function getPropertyColorClass(
    property: BoardCell,
): string {
    if (!property.color) {
        return 'bg-slate-400';
    }

    return (
        PROPERTY_COLOR_CLASSES[property.color] ??
        'bg-slate-400'
    );
}

function getBuildingSummary(
    ownership: PropertyOwnership,
): string {
    if (ownership.mortgaged) {
        return 'Đang thế chấp';
    }

    if (ownership.hasHotel) {
        return '1 khách sạn';
    }

    if (ownership.houseCount > 0) {
        return `${ownership.houseCount} nhà`;
    }

    return 'Chưa xây';
}

function PropertyDeedCard({
    property,
    ownership,
    playerMoney,
    canManageProperties,
    onMortgageProperty,
    onRedeemProperty,
    isExpanded,
    onToggle,
}: PropertyDeedCardProps) {
    const propertyDetail = property.propertyDetail;
    const deedNumber = String(
        propertyDetail?.id ?? property.id,
    ).padStart(2, '0');
    const colorClass = getPropertyColorClass(property);
    const buildingSummary =
        getBuildingSummary(ownership);
    const redeemCost =
        getMortgageRedeemCost(property);
    const canMortgage =
        canManageProperties &&
        canMortgageProperty(property, ownership);
    const canRedeem =
        canManageProperties &&
        ownership.mortgaged &&
        redeemCost !== null &&
        playerMoney >= redeemCost;

    if (!isExpanded) {
        return (
            <button
                type="button"
                onClick={onToggle}
                className="group w-full overflow-hidden rounded-md border border-slate-700 bg-white text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                title={`Xem bằng khoán ${property.name}`}
            >
                <div
                    className={`h-2 ${colorClass}`}
                />
                <div className="flex items-center gap-2 border-t border-slate-700 bg-slate-100 px-2 py-1.5">
                    <span className="text-[10px] font-black text-slate-700">
                        {deedNumber}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-black uppercase text-slate-900">
                        {property.name}
                    </span>
                </div>
            </button>
        );
    }

    return (
        <div className="overflow-hidden rounded-md border border-slate-800 bg-white text-slate-900 shadow-xl">
            <button
                type="button"
                onClick={onToggle}
                className="w-full text-left"
                title={`Ẩn bằng khoán ${property.name}`}
            >
                <div
                    className={`h-2 ${colorClass}`}
                />
                <div className="border-b border-slate-700 bg-slate-200 px-2 py-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black">
                            {deedNumber}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-black uppercase">
                            {property.name}
                        </span>
                    </div>
                </div>
            </button>

            <div className="px-3 py-2 text-[11px] leading-tight">
                {propertyDetail ? (
                    <>
                        <div className="space-y-1">
                            <DeedRow
                                label="Giá mua"
                                value={`$${formatPlayerMoney(
                                    propertyDetail.buyPrice,
                                )}`}
                            />
                            <DeedRow
                                label="Tiền thuê đất"
                                value={`$${formatPlayerMoney(
                                    propertyDetail.rentLevel0,
                                )}`}
                            />
                            {property.type ===
                                'PROPERTY' && (
                                <>
                                    <DeedRow
                                        label="Với 1 nhà"
                                        value={`$${formatPlayerMoney(
                                            propertyDetail.rentLevel1,
                                        )}`}
                                    />
                                    <DeedRow
                                        label="Với 2 nhà"
                                        value={`$${formatPlayerMoney(
                                            propertyDetail.rentLevel2,
                                        )}`}
                                    />
                                    <DeedRow
                                        label="Với 3 nhà"
                                        value={`$${formatPlayerMoney(
                                            propertyDetail.rentLevel3,
                                        )}`}
                                    />
                                    <DeedRow
                                        label="Với 4 nhà"
                                        value={`$${formatPlayerMoney(
                                            propertyDetail.rentLevel4,
                                        )}`}
                                    />
                                    <DeedRow
                                        label="Với khách sạn"
                                        value={`$${formatPlayerMoney(
                                            propertyDetail.rentHotel,
                                        )}`}
                                    />
                                </>
                            )}
                        </div>

                        <div className="mt-2 border-t border-slate-300 pt-2">
                            <DeedRow
                                label="Giá thế chấp"
                                value={`$${formatPlayerMoney(
                                    propertyDetail.mortgagePrice,
                                )}`}
                            />
                            {property.type ===
                                'PROPERTY' && (
                                <>
                                    <DeedRow
                                        label="Xây nhà"
                                        value={`$${formatPlayerMoney(
                                            propertyDetail.housePrice,
                                        )}`}
                                    />
                                    <DeedRow
                                        label="Xây khách sạn"
                                        value={`$${formatPlayerMoney(
                                            propertyDetail.hotelPrice,
                                        )}`}
                                    />
                                </>
                            )}
                            <DeedRow
                                label="Hiện có"
                                value={buildingSummary}
                            />
                            {canManageProperties && (
                                <div className="mt-2 flex gap-2 border-t border-slate-300 pt-2">
                                    {ownership.mortgaged ? (
                                        <button
                                            type="button"
                                            disabled={!canRedeem}
                                            onClick={() =>
                                                onRedeemProperty(
                                                    property.id,
                                                )
                                            }
                                            className="flex-1 rounded-md bg-emerald-600 px-2 py-1.5 text-[10px] font-black uppercase text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                            Chuộc $
                                            {formatPlayerMoney(
                                                redeemCost ?? 0,
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={!canMortgage}
                                            onClick={() =>
                                                onMortgageProperty(
                                                    property.id,
                                                )
                                            }
                                            className="flex-1 rounded-md bg-slate-700 px-2 py-1.5 text-[10px] font-black uppercase text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                            Thế chấp
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="font-semibold text-slate-600">
                        Chưa có thông tin chi tiết.
                    </p>
                )}
            </div>
        </div>
    );
}

interface DeedRowProps {
    label: string;
    value: string;
}

function DeedRow({ label, value }: DeedRowProps) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <span className="min-w-0 truncate text-slate-700">
                {label}
            </span>
            <span className="shrink-0 font-bold text-slate-950">
                {value}
            </span>
        </div>
    );
}

export default PlayerMoneyCard;
