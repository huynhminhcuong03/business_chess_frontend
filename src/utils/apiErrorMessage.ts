import type { ApiResponse } from '../types/api';
import { ApiRequestError } from '../services/axiosClient';

export function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    if (error instanceof ApiRequestError) {
        const responseBody =
            error.responseBody as Partial<
                ApiResponse<unknown>
            > | null;

        return responseBody?.message ?? fallbackMessage;
    }

    return fallbackMessage;
}
