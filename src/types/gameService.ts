import type { PropertyOwnership } from './game';
import type { Player } from './player';
import type { PaymentResult } from '../utils/playerFinance';

export interface GameStateSlice {
    players: Player[];
    propertyOwnerships: PropertyOwnership[];
}

export interface PaymentStateResult {
    players: Player[];
    result: PaymentResult;
}

export interface RentPaymentStateResult
    extends PaymentStateResult {
    ownerPlayerId: number;
    rentAmount: number;
}
