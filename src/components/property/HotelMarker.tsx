import type { PlayerTokenColor } from '../../types/player';
import { PLAYER_BUILDING_COLORS } from './buildingMarkerColors';

interface HotelMarkerProps {
    color: PlayerTokenColor;
}

function HotelMarker({ color }: HotelMarkerProps) {
    const buildingColor =
        PLAYER_BUILDING_COLORS[color];

    return (
        <svg
            aria-hidden="true"
            className="h-6 w-9 drop-shadow-sm"
            viewBox="0 0 32 24"
        >
            <path
                d="M4 21V7C4 5.9 4.9 5 6 5h20c1.1 0 2 .9 2 2v14Z"
                fill={buildingColor.main}
                stroke="#ffffff"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />

            <path
                d="M2 21h28"
                stroke={buildingColor.light}
                strokeLinecap="round"
                strokeWidth="1.5"
            />

            <path
                d="M8 9h3M14.5 9h3M21 9h3M8 13h3M14.5 13h3M21 13h3"
                stroke={buildingColor.light}
                strokeLinecap="round"
                strokeWidth="1.4"
            />

            <path
                d="M13.5 21v-4.5h5V21"
                fill={buildingColor.dark}
            />
        </svg>
    );
}

export default HotelMarker;