import { useMemo, useState } from 'react';
import ToastViewport from '../components/feedback/ToastViewport';
import { useToastNotifications } from '../hooks/useToastNotifications';
import { ApiRequestError } from '../services/axiosClient';
import { gameAPI } from '../services/gameAPI';
import type { ApiResponse } from '../types/api';
import type {
    GameMode,
    GamePlayerResponse,
    GameResponse,
    TokenColor,
} from '../types/gameApi';

const GAME_MODES: Array<{
    value: GameMode;
    title: string;
    description: string;
}> = [
    {
        value: 'NORMAL',
        title: 'Ván thường',
        description: 'Luật đầy đủ, phù hợp cho một ván dài.',
    },
    {
        value: 'QUICK',
        title: 'Ván nhanh',
        description: 'Nhịp nhanh hơn, hợp để chơi 60-90 phút.',
    },
];

const TOKEN_COLORS: Array<{
    value: TokenColor;
    label: string;
    className: string;
}> = [
    {
        value: 'RED',
        label: 'Đỏ',
        className: 'bg-red-500',
    },
    {
        value: 'BLUE',
        label: 'Xanh dương',
        className: 'bg-blue-500',
    },
    {
        value: 'GREEN',
        label: 'Xanh lá',
        className: 'bg-emerald-500',
    },
    {
        value: 'YELLOW',
        label: 'Vàng',
        className: 'bg-amber-400',
    },
];

type GameSetupPageProps = {
    onEnterGame: (game: GameResponse) => void;
};

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

function GameSetupPage({
    onEnterGame,
}: GameSetupPageProps) {
    const [selectedMode, setSelectedMode] =
        useState<GameMode>('NORMAL');
    const [createdGame, setCreatedGame] =
        useState<GameResponse | null>(null);
    const [players, setPlayers] = useState<
        GamePlayerResponse[]
    >([]);
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [tokenColor, setTokenColor] =
        useState<TokenColor>('RED');
    const [isCreatingGame, setIsCreatingGame] =
        useState(false);
    const [isAddingPlayer, setIsAddingPlayer] =
        useState(false);
    const [isStartingGame, setIsStartingGame] =
        useState(false);
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);
    const {
        notifications,
        showToast,
        dismissToast,
    } = useToastNotifications();

    const usedTokenColors = useMemo(
        () =>
            new Set(
                players.map((player) => player.tokenColor),
            ),
        [players],
    );

    const canAddPlayer =
        createdGame !== null &&
        displayName.trim().length > 0 &&
        username.trim().length > 0 &&
        !usedTokenColors.has(tokenColor);

    async function handleCreateGame(): Promise<void> {
        setIsCreatingGame(true);
        setErrorMessage(null);

        try {
            const game = await gameAPI.createGame({
                gameMode: selectedMode,
            });

            setCreatedGame(game);
            setPlayers(game.players ?? []);
            showToast('Tạo game thành công.', 'success');
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể tạo game mới.',
            );
            setErrorMessage(message);
            showToast(message, 'error');
        } finally {
            setIsCreatingGame(false);
        }
    }

    async function handleAddPlayer(): Promise<void> {
        if (!createdGame || !canAddPlayer) {
            return;
        }

        setIsAddingPlayer(true);
        setErrorMessage(null);

        try {
            const player = await gameAPI.createGamePlayer({
                gameId: createdGame.id,
                username: username.trim(),
                displayName: displayName.trim(),
                tokenColor,
            });

            const nextPlayers = [...players, player];
            const nextColor = TOKEN_COLORS.find(
                (color) =>
                    color.value !== tokenColor &&
                    !nextPlayers.some(
                        (gamePlayer) =>
                            gamePlayer.tokenColor ===
                            color.value,
                    ),
            );

            setPlayers(nextPlayers);
            setDisplayName('');
            setUsername('');
            showToast('Đã thêm người chơi.', 'success');

            if (nextColor) {
                setTokenColor(nextColor.value);
            }
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể thêm người chơi.',
            );
            setErrorMessage(message);
            showToast(message, 'error');
        } finally {
            setIsAddingPlayer(false);
        }
    }

    async function handleStartGame(): Promise<void> {
        if (!createdGame) {
            return;
        }

        setIsStartingGame(true);
        setErrorMessage(null);

        try {
            const game = await gameAPI.startGame(createdGame.id);
            onEnterGame(game);
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                'Không thể bắt đầu game.',
            );
            setErrorMessage(message);
            showToast(message, 'error');
        } finally {
            setIsStartingGame(false);
        }
    }

    if (!createdGame) {
        return (
            <main className="min-h-dvh overflow-y-auto bg-zinc-100 text-slate-950">
                <ToastViewport
                    notifications={notifications}
                    onDismiss={dismissToast}
                />
                <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                    <header className="border-b border-slate-200 pb-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
                            Business Chess
                        </p>
                        <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
                            Chọn ván game
                        </h1>
                    </header>

                    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-black text-slate-950">
                            Chế độ chơi
                        </h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {GAME_MODES.map((mode) => {
                                const isSelected =
                                    selectedMode ===
                                    mode.value;

                                return (
                                    <button
                                        key={mode.value}
                                        type="button"
                                        onClick={() =>
                                            setSelectedMode(
                                                mode.value,
                                            )
                                        }
                                        className={`rounded-md border p-4 text-left transition ${
                                            isSelected
                                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="block text-base font-black text-slate-950">
                                            {mode.title}
                                        </span>
                                        <span className="mt-1 block text-sm font-medium leading-6 text-slate-600">
                                            {mode.description}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {errorMessage && (
                            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleCreateGame}
                            disabled={isCreatingGame}
                            className="mt-5 h-12 w-full rounded-md bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {isCreatingGame
                                ? 'Đang tạo...'
                                : 'Tạo game'}
                        </button>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-dvh overflow-y-auto bg-zinc-100 text-slate-950">
            <ToastViewport
                notifications={notifications}
                onDismiss={dismissToast}
            />
            <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
                            Business Chess
                        </p>
                        <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
                            Tạo người chơi
                        </h1>
                    </div>
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                        Game #{createdGame.id} ·{' '}
                        {createdGame.status}
                    </div>
                </header>

                <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-black text-slate-950">
                            Người chơi
                        </h2>

                        <div className="mt-4 grid gap-3">
                            <label className="grid gap-1 text-sm font-bold text-slate-700">
                                Tên hiển thị
                                <input
                                    value={displayName}
                                    onChange={(event) =>
                                        setDisplayName(
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 rounded-md border border-slate-200 px-3 text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-500 disabled:bg-slate-100"
                                    placeholder="Người chơi 1"
                                />
                            </label>

                            <label className="grid gap-1 text-sm font-bold text-slate-700">
                                Username
                                <input
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 rounded-md border border-slate-200 px-3 text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-500 disabled:bg-slate-100"
                                    placeholder="player_1"
                                />
                            </label>

                            <div className="grid gap-2">
                                <span className="text-sm font-bold text-slate-700">
                                    Màu quân
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    {TOKEN_COLORS.map(
                                        (color) => {
                                            const isUsed =
                                                usedTokenColors.has(
                                                    color.value,
                                                );
                                            const isSelected =
                                                tokenColor ===
                                                color.value;

                                            return (
                                                <button
                                                    key={
                                                        color.value
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setTokenColor(
                                                            color.value,
                                                        )
                                                    }
                                                    disabled={
                                                        isUsed
                                                    }
                                                    className={`flex h-11 items-center gap-2 rounded-md border px-3 text-sm font-black transition ${
                                                        isSelected
                                                            ? 'border-slate-950 bg-slate-50'
                                                            : 'border-slate-200 bg-white'
                                                    } disabled:cursor-not-allowed disabled:opacity-45`}
                                                >
                                                    <span
                                                        className={`h-4 w-4 rounded-full ${color.className}`}
                                                    />
                                                    {color.label}
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddPlayer}
                                disabled={
                                    !canAddPlayer ||
                                    isAddingPlayer
                                }
                                className="h-11 rounded-md bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {isAddingPlayer
                                    ? 'Đang thêm...'
                                    : 'Thêm người chơi'}
                            </button>
                        </div>
                    </div>

                    <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-xl font-black text-slate-950">
                                Danh sách trong phòng
                            </h2>
                            <button
                                type="button"
                                onClick={handleStartGame}
                                disabled={
                                    players.length === 0 ||
                                    isStartingGame
                                }
                                className="h-11 rounded-md bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {isStartingGame
                                    ? 'Đang bắt đầu...'
                                    : 'Bắt đầu game'}
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        {players.length === 0 ? (
                            <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                                Chưa có người chơi nào.
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {players.map((gamePlayer) => {
                                    const token =
                                        TOKEN_COLORS.find(
                                            (color) =>
                                                color.value ===
                                                gamePlayer.tokenColor,
                                        ) ?? TOKEN_COLORS[0];

                                    return (
                                        <article
                                            key={gamePlayer.id}
                                            className="rounded-md border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`h-4 w-4 rounded-full ${token.className}`}
                                                />
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-base font-black text-slate-950">
                                                        {
                                                            gamePlayer
                                                                .player
                                                                .displayName
                                                        }
                                                    </h3>
                                                    <p className="truncate text-sm font-semibold text-slate-500">
                                                        @
                                                        {
                                                            gamePlayer
                                                                .player
                                                                .username
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <dt className="font-semibold text-slate-500">
                                                        Lượt
                                                    </dt>
                                                    <dd className="font-black text-slate-950">
                                                        #
                                                        {
                                                            gamePlayer.turnOrder
                                                        }
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="font-semibold text-slate-500">
                                                        Tiền
                                                    </dt>
                                                    <dd className="font-black text-slate-950">
                                                        $
                                                        {
                                                            gamePlayer.money
                                                        }
                                                    </dd>
                                                </div>
                                            </dl>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </section>
            </div>
        </main>
    );
}

export default GameSetupPage;
