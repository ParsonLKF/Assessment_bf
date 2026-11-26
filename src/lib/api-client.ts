import type { ListRequest } from './list-rules';

type ApiFailure = { error?: unknown; message?: unknown };

export class ApiError extends Error {
  constructor(message: string, readonly status?: number, readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchData<T>(path: string, init?: RequestInit): Promise<readonly T[]> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    throw new ApiError('Could not reach the server. Check your connection and try again.');
  }

  const body = await response.json().catch(() => null) as (ApiFailure & { data?: unknown }) | null;
  if (!response.ok) {
    throw new ApiError(
      typeof body?.message === 'string' ? body.message : 'The request failed. Try again.',
      response.status,
      typeof body?.error === 'string' ? body.error : undefined,
    );
  }
  if (!Array.isArray(body?.data)) throw new ApiError('The server returned an unexpected response.', response.status);
  return body.data as T[];
}

export async function generateList(request: ListRequest) {
  const data = await fetchData<unknown>('/api/residential/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (data.some((line) => typeof line !== 'string' || !line.trim())) {
    throw new ApiError('The server returned an invalid proxy list. Try again.');
  }
  return data as readonly string[];
}
