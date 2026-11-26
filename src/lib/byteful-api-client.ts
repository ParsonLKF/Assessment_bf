import 'server-only';
import { apiErrorResponse, apiErrorResponseWithHeaders, type ApiErrorCode } from '@/lib/api-errors';
import type { Asn, City, Country } from '@/lib/targeting';
import { apiErrorMessage } from '@/lib/api-errors';

const baseUrl = 'https://api.byteful.com/1.0/public/user';
const pageSize = 100;
type Resource = 'country' | 'city' | 'asn';
type UnknownRecord = Record<string, unknown>;
type SearchResponse = { data: unknown[]; page: number; perPage: number; totalCount: number };
type SearchOptions = { countryId?: string; query?: string; page?: number };

export class BytefulError extends Error {
  constructor(readonly status: 503 | 502 | 429, message: string, readonly retryAfter?: string) {
    super(message);
    this.name = 'BytefulError';
  }
}

export function bytefulErrorResponse(error: unknown) {
  if (error instanceof BytefulError) {
    const code: ApiErrorCode = error.status === 503 ? 'missing_api_keys' : error.status === 429 ? 'rate_limited' : 'upstream_failure';
    return apiErrorResponseWithHeaders(code, error.message, error.retryAfter ? { 'Retry-After': error.retryAfter } : {});
  }
  return apiErrorResponse('internal_server_error', apiErrorMessage.lookup.failed);
}

function keys() {
  const publicKey = process.env.BYTEFUL_PUBLIC_KEY?.trim();
  const privateKey = process.env.BYTEFUL_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey) throw new BytefulError(503, apiErrorMessage.lookup.unconfigured);
  return { publicKey, privateKey };
}

function record(value: unknown): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BytefulError(502, apiErrorMessage.lookup.unexpectedBytefulResponse);
  return value as UnknownRecord;
}

function positiveInteger(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function normalizeRecord(resource: Resource, input: unknown, requestedCountry?: string): Country | City | Asn {
  const item = record(input);
  if (resource === 'country') {
    if (typeof item.country_id !== 'string' || typeof item.country_name !== 'string') throw new BytefulError(502, apiErrorMessage.lookup.invalidCountry);
    return { country_id: item.country_id, country_name: item.country_name };
  }
  if (resource === 'city') {
    if (typeof item.city_alias !== 'string' || typeof item.city_name !== 'string' || typeof item.subdivision_id !== 'string') {
      throw new BytefulError(502, apiErrorMessage.lookup.invalidCity);
    }
    return {
      country_id: requestedCountry ?? '',
      city_alias: item.city_alias,
      city_name: item.city_name,
    };
  }
  if (typeof item.asn_name !== 'string' || !Number.isSafeInteger(Number(item.asn_id)) || typeof item.country_id !== 'string') {
    throw new BytefulError(502, apiErrorMessage.lookup.invalidAsn);
  }
  return { country_id: item.country_id, asn_id: Number(item.asn_id), asn_name: item.asn_name };
}

export function buildBytefulSearchUrl(resource: Resource, options: SearchOptions = {}) {
  const url = new URL(`${baseUrl}/${resource}/search`);
  url.searchParams.set('page', String(options.page ?? 1));
  url.searchParams.set('per_page', String(pageSize));
  if (resource === 'country') {
    if (options.query) url.searchParams.set('like_country_name', `%${options.query}%`);
  } else if (resource === 'city') {
    if (!options.countryId) throw new BytefulError(502, apiErrorMessage.request.countryRequired);
    url.searchParams.set('like_subdivision_id', `${options.countryId}%`);
    if (options.query) url.searchParams.set('like_city_name', `%${options.query}%`);
  } else if (resource === 'asn') {
    if (options.countryId) url.searchParams.set('country_id', options.countryId);
    if (options.query) {
      const numeric = /^\d+$/.test(options.query);
      url.searchParams.set(numeric ? 'asn_id' : 'like_asn_name', numeric ? options.query : `%${options.query}%`);
    }
  }
  return url.toString();
}

export async function searchByteful(resource: Resource, options: SearchOptions = {}, signal?: AbortSignal) {
  const credentials = keys();
  const url = buildBytefulSearchUrl(resource, options);
  const startedAt = Date.now();
  console.info('[byteful-lookup] upstream request', { resource, page: options.page ?? 1, url });
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'X-API-Public-Key': credentials.publicKey,
        'X-API-Private-Key': credentials.privateKey,
        Accept: 'application/json',
      },
      signal,
      cache: 'no-store',
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    console.error('[byteful-lookup] upstream network error', { resource, page: options.page ?? 1, elapsedMs: Date.now() - startedAt });
    throw new BytefulError(502, apiErrorMessage.lookup.connectionFailed);
  }

  console.info('[byteful-lookup] upstream response', {
    resource,
    page: options.page ?? 1,
    status: response.status,
    elapsedMs: Date.now() - startedAt,
    requestId: response.headers.get('x-request-id') ?? response.headers.get('x-api-request-id') ?? undefined,
  });

  if (response.status === 429) {
    throw new BytefulError(429, apiErrorMessage.lookup.rateLimited, response.headers.get('Retry-After') ?? undefined);
  }
  if (!response.ok) {
    throw new BytefulError(502, apiErrorMessage.lookup.upstreamFailed);
  }

  let payload: UnknownRecord;
  try {
    payload = record(await response.json());
  } catch (error) {
    if (error instanceof BytefulError) throw error;
    throw new BytefulError(502, apiErrorMessage.lookup.unreadableBytefulResponse);
  }
  if (!Array.isArray(payload.data)) throw new BytefulError(502, apiErrorMessage.lookup.unexpectedBytefulResponse);

  const page = positiveInteger(payload.page, options.page ?? 1);
  const perPage = positiveInteger(payload.per_page, pageSize);
  const totalCount = Number(payload.total_count);
  const totalPages = Number.isSafeInteger(totalCount) && totalCount >= 0 ? Math.ceil(totalCount / perPage) : null;
  const lastPage = payload.data.length < perPage || (totalPages !== null && page >= totalPages);
  return {
    data: payload.data.map((item) => normalizeRecord(resource, item, options.countryId)),
    page,
    perPage,
    totalCount: Number.isSafeInteger(totalCount) ? totalCount : -1,
    nextPage: lastPage ? null : page + 1,
  } satisfies SearchResponse & { nextPage: number | null };
}

export function lookupResponse(result: Awaited<ReturnType<typeof searchByteful>>) {
  const headers = new Headers({ 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' });
  headers.set('X-Current-Page', String(result.page));
  headers.set('X-Per-Page', String(result.perPage));
  if (result.nextPage !== null) headers.set('X-Next-Page', String(result.nextPage));
  return Response.json({ data: result.data }, { headers });
}
