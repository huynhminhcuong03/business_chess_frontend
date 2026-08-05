import {
    useEffect,
    useState,
} from 'react';
import type { GamePlayerResponse } from '../../types/playerApi';
import PlayerToken from './PlayerToken';

interface Point {
    x: number;
    y: number;
}

interface JailMoveAnimationProps {
    player: GamePlayerResponse;
    from: Point;
    to: Point;
    onComplete: () => void;
}

const JAIL_MOVE_DURATION = 850;

function easeOutCubic(value: number): number {
    return 1 - Math.pow(1 - value, 3);
}

function getBezierPoint(
    from: Point,
    control: Point,
    to: Point,
    progress: number,
): Point {
    const inverse = 1 - progress;

    return {
        x:
            inverse * inverse * from.x +
            2 * inverse * progress * control.x +
            progress * progress * to.x,
        y:
            inverse * inverse * from.y +
            2 * inverse * progress * control.y +
            progress * progress * to.y,
    };
}

function JailMoveAnimation({
    player,
    from,
    to,
    onComplete,
}: JailMoveAnimationProps) {
    const [position, setPosition] = useState(from);

    useEffect(() => {
        let frameId = 0;
        const startedAt = performance.now();
        const control = {
            x: (from.x + to.x) / 2,
            y: Math.min(from.y, to.y) - 120,
        };

        function animate(currentTime: number): void {
            const rawProgress = Math.min(
                (currentTime - startedAt) / JAIL_MOVE_DURATION,
                1,
            );
            const easedProgress = easeOutCubic(rawProgress);

            setPosition(
                getBezierPoint(
                    from,
                    control,
                    to,
                    easedProgress,
                ),
            );

            if (rawProgress < 1) {
                frameId = window.requestAnimationFrame(animate);
                return;
            }

            onComplete();
        }

        frameId = window.requestAnimationFrame(animate);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [from, onComplete, to]);

    return (
        <div
            className="pointer-events-none absolute z-30"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%) scale(1.35)',
            }}
        >
            <PlayerToken player={player} />
        </div>
    );
}

export default JailMoveAnimation;
