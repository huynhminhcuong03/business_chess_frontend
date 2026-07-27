type ApiRequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

function buildUrl(path: string): string {
    if (path.startsWith('http')) {
        return path;
    }

    return `${API_BASE_URL}${path}`;
}

export async function apiRequest<TResponse>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<TResponse> {
    const { body, headers, ...requestOptions } = options;

    const response = await fetch(buildUrl(path), {
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
        throw new Error(
            `API request failed: ${response.status}`,
        );
    }

    if (response.status === 204) {
        return undefined as TResponse;
    }

    return response.json() as Promise<TResponse>;
}
