import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastKind = 'error' | 'success' | 'info';

export interface ToastNotification {
    id: number;
    kind: ToastKind;
    message: string;
}

const DEFAULT_TOAST_DURATION = 2000;

export function useToastNotifications(
    duration = DEFAULT_TOAST_DURATION,
) {
    const nextToastIdRef = useRef(1);
    const timeoutIdsRef = useRef<Map<number, number>>(
        new Map(),
    );
    const [notifications, setNotifications] = useState<
        ToastNotification[]
    >([]);

    const dismissToast = useCallback((id: number) => {
        const timeoutId = timeoutIdsRef.current.get(id);

        if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId);
            timeoutIdsRef.current.delete(id);
        }

        setNotifications((currentNotifications) =>
            currentNotifications.filter(
                (notification) => notification.id !== id,
            ),
        );
    }, []);

    const showToast = useCallback(
        (message: string, kind: ToastKind = 'info') => {
            const id = nextToastIdRef.current;
            nextToastIdRef.current += 1;

            setNotifications((currentNotifications) => [
                ...currentNotifications,
                {
                    id,
                    kind,
                    message,
                },
            ]);

            const timeoutId = window.setTimeout(() => {
                dismissToast(id);
            }, duration);

            timeoutIdsRef.current.set(id, timeoutId);
        },
        [dismissToast, duration],
    );

    useEffect(() => {
        const timeoutIds = timeoutIdsRef.current;

        return () => {
            timeoutIds.forEach((timeoutId) => {
                window.clearTimeout(timeoutId);
            });
            timeoutIds.clear();
        };
    }, []);

    return {
        notifications,
        showToast,
        dismissToast,
    };
}
