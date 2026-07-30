import type { PlayerTokenColor } from '../../types/player';
import { PLAYER_BUILDING_COLORS } from './buildingMarkerColors';

interface HouseMarkerProps {
    color: PlayerTokenColor;
}

function HouseMarker({ color }: HouseMarkerProps) {
    const buildingColor =
        PLAYER_BUILDING_COLORS[color];

    return (
        <svg
            aria-hidden="true"
            className="building-marker-house drop-shadow-sm"
            viewBox="0 0 24 24"
        >
            <path
                d="M3.5 11.2 12 4.2l8.5 7v1.9h-2.1V20H5.6v-6.9H3.5Z"
                fill={buildingColor.main}
                stroke="#ffffff"
                strokeLinejoin="round"
                strokeWidth="1.4"
            />
            <path
                d="M8.7 20v-5.7h6.6V20"
                fill={buildingColor.dark}
                stroke="#ffffff"
                strokeLinejoin="round"
                strokeWidth="1.1"
            />
            <path
                d="M10 9.6h4"
                stroke={buildingColor.light}
                strokeLinecap="round"
                strokeWidth="1.2"
            />
        </svg>
    );
}

export default HouseMarker;
