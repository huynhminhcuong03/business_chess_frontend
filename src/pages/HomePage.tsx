import { useState } from 'react';
import Board from '../components/board/Board';
import type { GameResponse } from '../types/gameApi';
import GameSetupPage from './GameSetupPage';

function HomePage() {
    const [activeGame, setActiveGame] =
        useState<GameResponse | null>(null);

    if (!activeGame) {
        return <GameSetupPage onEnterGame={setActiveGame} />;
    }

    return (
        <main className="game-screen flex items-center justify-center bg-slate-100">
            <Board game={activeGame} />
        </main>
    );
}

export default HomePage;
