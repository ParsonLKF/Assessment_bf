import type { ListRequest } from './list-rules';
import { apiErrorMessage } from './api-errors';

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
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
    throw new ApiError(apiErrorMessage.network.unavailable);
  }

  const body = await response.json().catch(() => null) as { data?: unknown; message?: unknown } | null;
  if (!response.ok) {
    throw new ApiError(
      typeof body?.message === 'string' ? body.message : apiErrorMessage.network.failed,
      response.status,
    );
  }
  if (!Array.isArray(body?.data)) throw new ApiError(apiErrorMessage.network.unexpectedResponse, response.status);
  return body.data as T[];
}

export async function generateList(request: ListRequest) {
  const data = await fetchData<unknown>('/api/residential/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (data.some((line) => typeof line !== 'string' || !line.trim())) {
    throw new ApiError(apiErrorMessage.network.invalidProxyList);
  }
  return data as readonly string[];
}
