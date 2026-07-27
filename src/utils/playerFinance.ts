import type { Player } from '../types/player';

export interface PaymentResult {
    amountDue: number;
    amountPaid: number;
    payerBecameBankrupt: boolean;
}

export function settlePlayerPayment(
    players: Player[],
    payerPlayerId: number,
    amountDue: number,
    receiverPlayerId?: number,
): {
    players: Player[];
    result: PaymentResult;
} {
    const payer = players.find(
        (player) => player.id === payerPlayerId,
    );

    if (!payer || amountDue <= 0 || payer.isBankrupt) {
        return {
            players,
            result: {
                amountDue,
                amountPaid: 0,
                payerBecameBankrupt: false,
            },
        };
    }

    const amountPaid = Math.min(payer.money, amountDue);
    const nextPayerMoney = payer.money - amountPaid;
    const payerBecameBankrupt = nextPayerMoney === 0;

    return {
        players: players.map((player) => {
            if (player.id === payerPlayerId) {
                return {
                    ...player,
                    money: nextPayerMoney,
                    isBankrupt:
                        player.isBankrupt ||
                        payerBecameBankrupt,
                };
            }

            if (
                receiverPlayerId !== undefined &&
                player.id === receiverPlayerId
            ) {
                return {
                    ...player,
                    money: player.money + amountPaid,
                };
            }

            return player;
        }),
        result: {
            amountDue,
            amountPaid,
            payerBecameBankrupt,
        },
    };
}
