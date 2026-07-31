import type {
    ToastKind,
    ToastNotification,
} from '../../hooks/useToastNotifications';

const TOAST_THEME_CLASSES: Record<ToastKind, string> = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success:
        'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-slate-200 bg-white text-slate-800',
};

interface ToastViewportProps {
    notifications: ToastNotification[];
    onDismiss: (id: number) => void;
}

function ToastViewport({
    notifications,
    onDismiss,
}: ToastViewportProps) {
    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed right-4 top-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm font-bold shadow-lg ${TOAST_THEME_CLASSES[notification.kind]}`}
                    role="status"
                >
                    <p className="min-w-0 flex-1 leading-5">
                        {notification.message}
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            onDismiss(notification.id)
                        }
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-base leading-none transition hover:bg-black/10"
                        aria-label="Xóa thông báo"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ToastViewport;
