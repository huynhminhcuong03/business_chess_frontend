import { useEffect, useState } from 'react';
import Board from '../components/board/Board';
import { ApiRequestError } from '../services/axiosClient';
import { gameAPI } from '../services/gameAPI';
import type { ApiResponse } from '../types/api';
import type { GameResponse } from '../types/gameApi';
import GameSetupPage from './GameSetupPage';

const GAME_PATH_PATTERN = /^\/game\/(\d+)\/?$/;

function getGameIdFromPathname(): number | null {
    const match = window.location.pathname.match(GAME_PATH_PATTERN);

    if (!match) {
        return null;
    }

    const gameId = Number(match[1]);

    return Number.isInteger(gameId) ? gameId : null;
}

function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    if (error instanceof ApiRequestError) {
        const responseBody =
            error.responseBody as Partial<
                ApiResponse<unknown>
            > | null;

        return responseBody?.message ?? fallbackMessage;
    }

    return fallbackMessage;
}

function HomePage() {
    const [activeGame, setActiveGame] =
        useState<GameResponse | null>(null);
    const [isLoadingGame, setIsLoadingGame] = useState(() =>
        getGameIdFromPathname() !== null,
    );
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    useEffect(() => {
        async function fetchGameFromRoute(
            gameId: number,
        ): Promise<void> {
            setIsLoadingGame(true);
            setErrorMessage(null);

            try {
                const game = await gameAPI.getGame(gameId);
                setActiveGame(game);
            } catch (error) {
                const message = getApiErrorMessage(
                    error,
                    'Không thể tải lại game.',
                );

                setActiveGame(null);
                setErrorMessage(message);
            } finally {
                setIsLoadingGame(false);
            }
        }

        function handleRouteChange(): void {
            const gameId = getGameIdFromPathname();

            if (gameId === null) {
                setActiveGame(null);
                setErrorMessage(null);
                setIsLoadingGame(false);
                return;
            }

            void fetchGameFromRoute(gameId);
        }

        handleRouteChange();
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener(
                'popstate',
                handleRouteChange,
            );
        };
    }, []);

    function handleEnterGame(game: GameResponse): void {
        setActiveGame(game);
        setErrorMessage(null);

        const nextPath = `/game/${game.id}`;

        if (window.location.pathname !== nextPath) {
            window.history.pushState(null, '', nextPath);
        }
    }

    if (isLoadingGame) {
        return (
            <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 text-center text-sm font-bold text-slate-700">
                Đang tải lại game...
            </main>
        );
    }

    if (!activeGame) {
        return (
            <>
                {errorMessage && (
                    <div className="fixed left-1/2 top-4 z-50 w-[min(92vw,28rem)] -translate-x-1/2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 shadow-sm">
                        {errorMessage}
                    </div>
                )}
                <GameSetupPage onEnterGame={handleEnterGame} />
            </>
        );
    }

    return (
        <main className="game-screen flex items-center justify-center bg-slate-100">
            <Board
                key={activeGame.id}
                game={activeGame}
            />
        </main>
    );
}

export default HomePage;
