type ApiRequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown;
    params?: unknown;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiRequestError extends Error {
    status: number;
    responseBody: unknown;

    constructor(status: number, responseBody: unknown) {
        super(`API request failed: ${status}`);
        this.name = 'ApiRequestError';
        this.status = status;
        this.responseBody = responseBody;
    }
}

function buildUrl(path: string, params?: unknown): string {
    const url = path.startsWith('http')
        ? new URL(path)
        : new URL(path, API_BASE_URL);

    if (
        params &&
        typeof params === 'object' &&
        !Array.isArray(params)
    ) {
        Object.entries(params as Record<string, unknown>).forEach(
            ([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.set(key, String(value));
                }
            },
        );
    }

    return url.toString();
}

async function request<TResponse>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<TResponse> {
    const { body, headers, params, ...requestOptions } =
        options;

    const response = await fetch(buildUrl(path, params), {
        ...requestOptions,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body:
            body === undefined
                ? undefined
                : JSON.stringify(body),
    });

    if (!response.ok) {
        let responseBody: unknown;

        try {
            responseBody = await response.json();
        } catch {
            responseBody = null;
        }

        throw new ApiRequestError(
            response.status,
            responseBody,
        );
    }

    if (response.status === 204) {
        return undefined as TResponse;
    }

    return response.json() as Promise<TResponse>;
}

export class axiosClient {
    static get<T>(url: string, params?: unknown) {
        return request<T>(url, {
            method: 'GET',
            params,
        });
    }

    static post<T>(url: string, data: unknown) {
        return request<T>(url, {
            method: 'POST',
            body: data,
        });
    }

    static put<T>(url: string, data: unknown) {
        return request<T>(url, {
            method: 'PUT',
            body: data,
        });
    }

    static patch<T>(url: string, data: unknown) {
        return request<T>(url, {
            method: 'PATCH',
            body: data,
        });
    }

    static delete<T>(url: string) {
        return request<T>(url, {
            method: 'DELETE',
        });
    }
}
