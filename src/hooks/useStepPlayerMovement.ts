import {
    type Dispatch,
    type SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import type { GamePlayerResponse } from '../types/playerApi';

const DEFAULT_PLAYER_MOVE_STEP_DURATION = 300;

interface MovePlayerOptions {
    playerId: number;
    startPosition: number;
    stepCount: number;
    onPassStart?: () => void;
}

interface UseStepPlayerMovementOptions {
    boardCellCount: number;
    setGamePlayers: Dispatch<
        SetStateAction<GamePlayerResponse[]>
    >;
    stepDuration?: number;
}

export function useStepPlayerMovement({
    boardCellCount,
    setGamePlayers,
    stepDuration = DEFAULT_PLAYER_MOVE_STEP_DURATION,
}: UseStepPlayerMovementOptions) {
    const timeoutIdsRef = useRef<number[]>([]);
    const [isPlayerMoving, setIsPlayerMoving] =
        useState(false);

    useEffect(() => {
        return () => {
            timeoutIdsRef.current.forEach((timeoutId) => {
                window.clearTimeout(timeoutId);
            });
            timeoutIdsRef.current = [];
        };
    }, []);

    const waitForMoveStep = useCallback(
        () =>
            new Promise<void>((resolve) => {
                const timeoutId = window.setTimeout(() => {
                    timeoutIdsRef.current =
                        timeoutIdsRef.current.filter(
                            (storedTimeoutId) =>
                                storedTimeoutId !==
                                timeoutId,
                        );
                    resolve();
                }, stepDuration);

                timeoutIdsRef.current.push(timeoutId);
            }),
        [stepDuration],
    );

    const movePlayer = useCallback(
        async ({
            playerId,
            startPosition,
            stepCount,
            onPassStart,
        }: MovePlayerOptions): Promise<number> => {
            if (boardCellCount <= 0) {
                return startPosition;
            }

            setIsPlayerMoving(true);

            let nextPosition = startPosition;

            try {
                for (
                    let step = 0;
                    step < stepCount;
                    step += 1
                ) {
                    await waitForMoveStep();

                    nextPosition =
                        (nextPosition + 1) %
                        boardCellCount;

                    setGamePlayers((previousPlayers) =>
                        previousPlayers.map((player) =>
                            player.id === playerId
                                ? {
                                      ...player,
                                      position: nextPosition,
                                  }
                                : player,
                        ),
                    );

                    if (nextPosition === 0 && onPassStart) {
                        onPassStart();
                    }
                }
            } finally {
                setIsPlayerMoving(false);
            }

            return nextPosition;
        },
        [
            boardCellCount,
            setGamePlayers,
            waitForMoveStep,
        ],
    );

    return {
        isPlayerMoving,
        movePlayer,
    };
}
