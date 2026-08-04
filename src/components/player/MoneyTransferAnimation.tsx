import type { CSSProperties } from 'react';
import { formatPlayerMoney } from '../../utils/formatMoney';

export interface MoneyTransfer {
    id: number;
    amount: number;
    from: {
        x: number;
        y: number;
    };
    to: {
        x: number;
        y: number;
    };
}

interface MoneyTransferAnimationProps {
    transfer: MoneyTransfer | null;
    onComplete: () => void;
}

function MoneyTransferAnimation({
    transfer,
    onComplete,
}: MoneyTransferAnimationProps) {
    if (!transfer) {
        return null;
    }

    const transferStyle = {
        '--money-transfer-from-x': `${transfer.from.x}px`,
        '--money-transfer-from-y': `${transfer.from.y}px`,
        '--money-transfer-to-x': `${transfer.to.x}px`,
        '--money-transfer-to-y': `${transfer.to.y}px`,
    } as CSSProperties;

    return (
        <div className="pointer-events-none fixed inset-0 z-[90]">
            <div
                key={transfer.id}
                className="money-transfer-stack absolute"
                style={transferStyle}
                onAnimationEnd={onComplete}
            >
                <div className="money-transfer-bills">
                    <span className="money-transfer-bill">$</span>
                    <span className="money-transfer-bill">$</span>
                    <span className="money-transfer-bill">$</span>
                </div>
                <span className="money-transfer-amount">
                    -{formatPlayerMoney(transfer.amount)}
                </span>
            </div>
        </div>
    );
}

export default MoneyTransferAnimation;
