import { useCallback, useRef, useState } from 'react';
import type { JailMoveAnimationState } from '../types/boardFlow';
import type { PayRentResponse } from '../types/gameApi';
import type { GamePlayerResponse } from '../types/playerApi';
import { getBoardCellCenter } from '../utils/boardCellCenter';
import type { MoneyTransfer } from '../components/player/MoneyTransferAnimation';

const MONEY_TRANSFER_FALLBACK_DURATION = 3100;
const JAIL_MOVE_FALLBACK_DURATION = 1100;

function getElementCenter(
    element: HTMLElement,
): { x: number; y: number } {
    const rect = element.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
}

export function useBoardAnimations() {
    const boardFrameRef = useRef<HTMLDivElement>(null);
    const playerMoneyElementsRef = useRef<
        Map<number, HTMLDivElement>
    >(new Map());
    const moneyTransferResolveRef =
        useRef<(() => void) | null>(null);
    const jailMoveResolveRef =
        useRef<(() => void) | null>(null);
    const [moneyTransfer, setMoneyTransfer] =
        useState<MoneyTransfer | null>(null);
    const [jailMoveAnimation, setJailMoveAnimation] =
        useState<JailMoveAnimationState | null>(null);

    const setPlayerMoneyElement = useCallback(
        (
            playerId: number,
            element: HTMLDivElement | null,
        ) => {
            if (element) {
                playerMoneyElementsRef.current.set(
                    playerId,
                    element,
                );
                return;
            }

            playerMoneyElementsRef.current.delete(playerId);
        },
        [],
    );

    function handleMoneyTransferComplete(): void {
        setMoneyTransfer(null);
        moneyTransferResolveRef.current?.();
        moneyTransferResolveRef.current = null;
    }

    function handleJailMoveAnimationComplete(): void {
        setJailMoveAnimation(null);
        jailMoveResolveRef.current?.();
        jailMoveResolveRef.current = null;
    }

    function playRentTransferAnimation(
        rentPayment: PayRentResponse,
    ): Promise<void> {
        const payerElement =
            playerMoneyElementsRef.current.get(
                rentPayment.payerGamePlayerId,
            );
        const ownerElement =
            playerMoneyElementsRef.current.get(
                rentPayment.ownerGamePlayerId,
            );

        if (!payerElement || !ownerElement) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            moneyTransferResolveRef.current = resolve;
            setMoneyTransfer({
                id: Date.now(),
                amount: rentPayment.rentAmount,
                from: getElementCenter(payerElement),
                to: getElementCenter(ownerElement),
            });

            window.setTimeout(() => {
                if (moneyTransferResolveRef.current) {
                    handleMoneyTransferComplete();
                }
            }, MONEY_TRANSFER_FALLBACK_DURATION);
        });
    }

    function playJailMoveAnimation(
        player: GamePlayerResponse,
        fromPosition: number,
        jailPosition: number,
    ): Promise<void> {
        const from = getBoardCellCenter(
            boardFrameRef.current,
            fromPosition,
        );
        const to = getBoardCellCenter(
            boardFrameRef.current,
            jailPosition,
        );

        if (!from || !to) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            jailMoveResolveRef.current = resolve;
            setJailMoveAnimation({
                id: Date.now(),
                player,
                from,
                to,
            });

            window.setTimeout(() => {
                if (jailMoveResolveRef.current) {
                    handleJailMoveAnimationComplete();
                }
            }, JAIL_MOVE_FALLBACK_DURATION);
        });
    }

    return {
        boardFrameRef,
        jailMoveAnimation,
        moneyTransfer,
        handleJailMoveAnimationComplete,
        handleMoneyTransferComplete,
        playJailMoveAnimation,
        playRentTransferAnimation,
        setPlayerMoneyElement,
    };
}
