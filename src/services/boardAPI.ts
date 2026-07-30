import type { ApiResponse } from '../types/api';
import type { BoardResponse } from '../types/board';
import type { BoardCell } from '../types/boardCell';
import { axiosClient } from './axiosClient';

const BOARD_ENDPOINT = '/api/board';
const BOARD_CELL_ENDPOINT = '/api/board_cell';

type BoardCellApiResponse = Omit<
    BoardCell,
    'propertyDetail'
> & {
    propertyDetail?: BoardCell['propertyDetail'];
};

function toBoardCell(cell: BoardCellApiResponse): BoardCell {
    return {
        ...cell,
        propertyDetail: cell.propertyDetail ?? null,
    };
}

export const boardAPI = {
    async getBoard(): Promise<BoardResponse> {
        const response =
            await axiosClient.get<ApiResponse<BoardResponse>>(
                BOARD_ENDPOINT,
            );

        return response.data;
    },

    async getBoardCells(): Promise<BoardCell[]> {
        const response = await axiosClient.get<
            ApiResponse<BoardCellApiResponse[]>
        >(BOARD_CELL_ENDPOINT);

        return response.data.map(toBoardCell);
    },
};
