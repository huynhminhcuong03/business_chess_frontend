import { useEffect, useState } from 'react';
import { boardAPI } from '../services/boardAPI';
import type { BoardCell as BoardCellData } from '../types/boardCell';
import type { OwnedPropertyCard } from '../types/game';
import type { GamePropertyResponse } from '../types/gameApi';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import {
    getOwnedProperties,
    sortBoardCells,
} from '../utils/boardPropertyCards';
import type { ToastKind } from './useToastNotifications';

interface UseBoardDataOptions {
    properties: GamePropertyResponse[];
    showToast: (message: string, kind?: ToastKind) => void;
}

export function useBoardData({
    properties,
    showToast,
}: UseBoardDataOptions) {
    const [boardCells, setBoardCells] =
        useState<BoardCellData[]>([]);
    const [ownedProperties, setOwnedProperties] =
        useState<OwnedPropertyCard[]>([]);
    const [isLoadingBoard, setIsLoadingBoard] =
        useState(true);
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    useEffect(() => {
        async function fetchBoardData(): Promise<void> {
            setIsLoadingBoard(true);
            setErrorMessage(null);

            try {
                const [, cellsResponse] =
                    await Promise.all([
                        boardAPI.getBoard(),
                        boardAPI.getBoardCells(),
                    ]);
                const sortedCells =
                    sortBoardCells(cellsResponse);

                setBoardCells(sortedCells);
                setOwnedProperties(
                    getOwnedProperties(
                        properties,
                        sortedCells,
                    ),
                );
            } catch (error) {
                const message = getApiErrorMessage(
                    error,
                    'Không thể tải dữ liệu bàn cờ.',
                );

                setBoardCells([]);
                setErrorMessage(message);
                showToast(message, 'error');
            } finally {
                setIsLoadingBoard(false);
            }
        }

        void fetchBoardData();
    }, [properties, showToast]);

    return {
        boardCells,
        errorMessage,
        isLoadingBoard,
        ownedProperties,
        setErrorMessage,
        setOwnedProperties,
    };
}
