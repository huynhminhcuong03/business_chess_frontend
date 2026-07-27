import type { BoardCellType } from '../types/board';
import type { CellAction } from '../types/game';

export function getCellTypeLabel(
    cellType: BoardCellType,
): string {
    switch (cellType) {
        case 'START':
            return 'Bắt đầu';
        case 'PROPERTY':
            return 'Tài sản';
        case 'CHANCE':
            return 'Cơ hội';
        case 'COMMUNITY':
            return 'Khí vận';
        case 'JAIL':
            return 'Nhà tù';
        case 'GO_TO_JAIL':
            return 'Vào tù';
        case 'FREE_PARKING':
            return 'Bãi đậu xe miễn phí';
        case 'INCOME_TAX':
            return 'Thuế thu nhập';
        case 'LUXURY_TAX':
            return 'Thuế xa xỉ';
        case 'STATION':
            return 'Bến xe';
        case 'UTILITY':
            return 'Công ty';
        default:
            return cellType;
    }
}

export function getCellActionLabel(
    action: CellAction,
): string {
    switch (action) {
        case 'NONE':
            return 'Không có hành động';
        case 'BUY_PROPERTY':
            return 'Mua tài sản';
        case 'BUILD_PROPERTY':
            return 'Xây nhà';
        case 'PAY_RENT':
            return 'Trả tiền thuê';
        case 'DRAW_CHANCE_CARD':
            return 'Rút thẻ Cơ hội';
        case 'DRAW_COMMUNITY_CARD':
            return 'Rút thẻ Khí vận';
        case 'PAY_INCOME_TAX':
            return 'Đóng thuế thu nhập';
        case 'PAY_LUXURY_TAX':
            return 'Đóng thuế xa xỉ';
        case 'GO_TO_JAIL':
            return 'Đi tù';
        default:
            return action;
    }
}
