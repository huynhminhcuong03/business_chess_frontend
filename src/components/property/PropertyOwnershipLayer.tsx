import type { CSSProperties } from 'react';
import { BOARD_GRID_TRACKS } from '../../constants/boardStyles';
import { PLAYER_TOKEN_COLOR_CLASSES } from '../../constants/playerStyles';
import type { BoardCell } from '../../types/board';
import type { PropertyOwnership } from '../../types/game';
import type { Player } from '../../types/player';
import { getBoardGridPosition } from '../../utils/getBoardGridPosition';
import HotelMarker from './HotelMarker';
import HouseMarker from './HouseMarker';

interface PropertyOwnershipLayerProps {
    propertyOwnerships: PropertyOwnership[];
    players: Player[];
    boardCells: BoardCell[];
}

function getOwnershipMarkerStyle(
    row: number,
    column: number,
): CSSProperties {
    /*
     * Cạnh trên:
     * Marker nằm ở mép trên, chính giữa ô.
     */
    if (
        row === 1 &&
        column > 1 &&
        column < 11
    ) {
        return {
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
        };
    }

    /*
     * Cạnh dưới:
     * Marker nằm ở mép dưới, chính giữa ô.
     */
    if (
        row === 11 &&
        column > 1 &&
        column < 11
    ) {
        return {
            bottom: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
        };
    }

    /*
     * Cạnh trái:
     * Marker nằm ở mép trái, chính giữa ô.
     */
    if (
        column === 1 &&
        row > 1 &&
        row < 11
    ) {
        return {
            left: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
        };
    }

    /*
     * Cạnh phải:
     * Marker nằm ở mép phải, chính giữa ô.
     */
    if (
        column === 11 &&
        row > 1 &&
        row < 11
    ) {
        return {
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
        };
    }

    /*
     * Trường hợp dự phòng.
     * Thực tế các ô góc thường không phải tài sản có thể mua.
     */
    return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    };
}

function getOwnershipMarkerClass(
    _row: number,
    column: number,
): string {
    /*
     * Ô ở cạnh trái hoặc cạnh phải:
     * Marker dựng dọc.
     */
    if (column === 1 || column === 11) {
        return 'h-7 w-2';
    }

    /*
     * Ô ở cạnh trên hoặc cạnh dưới:
     * Marker nằm ngang.
     */
    return 'h-2 w-7';
}

function getBuildingMarkerStyle(
    row: number,
    column: number,
): CSSProperties {
    if (
        row === 1 &&
        column > 1 &&
        column < 11
    ) {
        return {
            bottom: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
        };
    }

    if (
        row === 11 &&
        column > 1 &&
        column < 11
    ) {
        return {
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
        };
    }

    if (
        column === 1 &&
        row > 1 &&
        row < 11
    ) {
        return {
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
        };
    }

    if (
        column === 11 &&
        row > 1 &&
        row < 11
    ) {
        return {
            left: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
        };
    }

    return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
    };
}

function getHotelMarkerStyle(
    row: number,
    column: number,
): CSSProperties {
    if (
        row === 1 &&
        column > 1 &&
        column < 11
    ) {
        return {
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
        };
    }

    if (
        row === 11 &&
        column > 1 &&
        column < 11
    ) {
        return {
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
        };
    }

    if (
        column === 1 &&
        row > 1 &&
        row < 11
    ) {
        return {
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)',
        };
    }

    if (
        column === 11 &&
        row > 1 &&
        row < 11
    ) {
        return {
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)',
        };
    }

    return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
    };
}

function getBuildingMarkerClass(
    _row: number,
    column: number,
): string {
    if (column === 1 || column === 11) {
        return 'flex-col';
    }

    return 'flex-row';
}

function getBuildingRotationClass(
    row: number,
    column: number,
): string {
    if (
        row === 1 &&
        column > 1 &&
        column < 11
    ) {
        return 'rotate-180';
    }

    if (
        column === 1 &&
        row > 1 &&
        row < 11
    ) {
        return 'rotate-90';
    }

    if (
        column === 11 &&
        row > 1 &&
        row < 11
    ) {
        return '-rotate-90';
    }

    return 'rotate-0';
}

function PropertyOwnershipLayer({
    propertyOwnerships,
    players,
    boardCells,
}: PropertyOwnershipLayerProps) {
    return (
        <div
            className="pointer-events-none absolute inset-0 z-10 grid border-4 border-transparent"
            style={{
                gridTemplateColumns: BOARD_GRID_TRACKS,
                gridTemplateRows: BOARD_GRID_TRACKS,
            }}
        >
            {propertyOwnerships.map(
                (ownership) => {
                    const owner = players.find(
                        (player) =>
                            player.id ===
                            ownership.ownerPlayerId,
                    );

                    const propertyCell =
                        boardCells.find(
                            (cell) =>
                                cell.id ===
                                ownership.boardCellId,
                        );

                    if (
                        !owner ||
                        !propertyCell
                    ) {
                        return null;
                    }

                    const gridPosition =
                        getBoardGridPosition(
                            propertyCell.position,
                        );

                    const markerPosition =
                        getOwnershipMarkerStyle(
                            gridPosition.row,
                            gridPosition.column,
                        );

                    const markerSize =
                        getOwnershipMarkerClass(
                            gridPosition.row,
                            gridPosition.column,
                        );
                    const buildingPosition =
                        getBuildingMarkerStyle(
                            gridPosition.row,
                            gridPosition.column,
                        );
                    const hotelPosition =
                        getHotelMarkerStyle(
                            gridPosition.row,
                            gridPosition.column,
                        );
                    const buildingDirection =
                        getBuildingMarkerClass(
                            gridPosition.row,
                            gridPosition.column,
                        );
                    const buildingRotation =
                        getBuildingRotationClass(
                            gridPosition.row,
                            gridPosition.column,
                        );
                    const shouldShowBuildings =
                        ownership.houseCount > 0 ||
                        ownership.hasHotel;

                    return (
                        <div
                            key={
                                ownership.boardCellId
                            }
                            className="relative h-full w-full"
                            style={{
                                gridColumnStart:
                                    gridPosition.column,
                                gridRowStart:
                                    gridPosition.row,
                            }}
                        >
                            <div
                                title={`${propertyCell.name} - Chủ sở hữu: ${owner.name}`}
                                aria-label={`${propertyCell.name} thuộc sở hữu của ${owner.name}`}
                                className={`absolute rounded-full border border-white/80 shadow-md ${markerSize} ${
                                    PLAYER_TOKEN_COLOR_CLASSES[
                                        owner.tokenColor
                                    ]
                                }`}
                                style={
                                    markerPosition
                                }
                            />

                            {shouldShowBuildings && (
                                <div
                                    className={`absolute flex items-center justify-center gap-0.5 ${buildingDirection}`}
                                    style={
                                        ownership.hasHotel
                                            ? hotelPosition
                                            : buildingPosition
                                    }
                                >
                                    {ownership.hasHotel ? (
                                        <span
                                            title="Khách sạn"
                                            className={`block ${buildingRotation}`}
                                        >
                                            <HotelMarker
                                                color={
                                                    owner.tokenColor
                                                }
                                            />
                                        </span>
                                    ) : (
                                        Array.from({
                                            length:
                                                ownership.houseCount,
                                        }).map(
                                            (
                                                _house,
                                                houseIndex,
                                            ) => (
                                                <span
                                                    key={
                                                        houseIndex
                                                    }
                                                    title="Nhà"
                                                    className={`block ${buildingRotation}`}
                                                >
                                                    <HouseMarker
                                                        color={
                                                            owner.tokenColor
                                                        }
                                                    />
                                                </span>
                                            ),
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    );
                },
            )}
        </div>
    );
}

export default PropertyOwnershipLayer;
