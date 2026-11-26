import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-client';
import { apiErrorMessage } from '@/lib/api-errors';
import type { Asn, City, Country } from '@/lib/targeting';
import type { GeneratorDraft } from './use-generator-draft';

function lookupPath(resource: string, country: string | undefined, query: string, page = 1) {
  const params = new URLSearchParams();
  if (country) params.set('country_id', country);
  if (query) params.set('q', query);
  params.set('page', String(page));
  const search = params.toString();
  return `/api/lookup/${resource}${search ? `?${search}` : ''}`;
}

async function loadLookup<T>(path: string, signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(path, { signal });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new ApiError(apiErrorMessage.network.unavailable);
  }
  const body = await response.json().catch(() => null) as { data?: unknown; error?: unknown; message?: unknown } | null;
  if (!response.ok) throw new ApiError(typeof body?.message === 'string' ? body.message : apiErrorMessage.network.lookupFailed, response.status, typeof body?.error === 'string' ? body.error : undefined);
  if (!Array.isArray(body?.data)) throw new ApiError(apiErrorMessage.network.unexpectedResponse, response.status);
  return {
    data: body.data as T[],
    nextPage: response.headers.get('X-Next-Page') ? Number(response.headers.get('X-Next-Page')) : undefined,
  };
}

function displayError(error: Error | null) {
  return error instanceof ApiError && error.status !== undefined && error.status < 500 && error.status !== 429
    ? error.message
    : error?.message;
}

function flattenPages<T>(pages: readonly { data: readonly T[] }[] | undefined) {
  return pages?.flatMap((page) => page.data) ?? [];
}

function withSelected<T>(data: readonly T[], selected: T | null, key: keyof T) {
  return selected && !data.some((option) => option[key] === selected[key]) ? [selected, ...data] : data;
}

function safeRetry(error: Error | null) {
  if (error instanceof ApiError && error.status !== undefined && error.status < 500 && error.status !== 429) return false;
  return true;
}

function retryButton(refetch: () => Promise<unknown>) {
  return () => { void refetch(); };
}

function useTargetingLookup<T>(resource: string, country: string | undefined, query: string, enabled: boolean) {
  const search = query.trim();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (!search) {
      setDebouncedSearch('');
      return;
    }
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const term = search ? debouncedSearch : '';
  const waiting = search !== term;
  const lookup = useInfiniteQuery({
    queryKey: ['lookup', lookupPath(resource, country, term)],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => loadLookup<T>(lookupPath(resource, country, term, pageParam), signal),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: enabled && !waiting,
    retry: (failureCount, error) => safeRetry(error) && failureCount < 2,
  });

  return {
    data: waiting ? [] : flattenPages(lookup.data?.pages),
    loading: enabled && (waiting || lookup.isPending),
    error: waiting ? undefined : displayError(lookup.error),
    retry: retryButton(lookup.refetch),
    hasMore: enabled && !waiting && lookup.hasNextPage,
    loadMore: () => {
      if (!lookup.isFetching) void lookup.fetchNextPage({ cancelRefetch: false });
    },
    loadingMore: !waiting && lookup.isFetchingNextPage,
  };
}

/*
 * Lookups paginate through Byteful on demand. TanStack Query shares each
 * request by query key, retains pages, and aborts obsolete queries.
 */
export function useTargetingLookups(enabled: boolean, { draft, selectCountry, update }: GeneratorDraft) {
  const [countryQuery, setCountryQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [asnQuery, setAsnQuery] = useState('');
  const country = draft.country?.country_id;
  const countries = useTargetingLookup<Country>('countries', undefined, countryQuery, enabled);
  const cities = useTargetingLookup<City>('cities', country, cityQuery, enabled && Boolean(country));
  const asns = useTargetingLookup<Asn>('asns', country, asnQuery, enabled);

  const countryOptions = withSelected(countries.data, draft.country, 'country_id');
  const cityOptions = withSelected(cities.data, draft.city, 'city_alias');
  const asnOptions = withSelected(asns.data, draft.asn, 'asn_id');

  function resetQueries() {
    setCountryQuery('');
    setCityQuery('');
    setAsnQuery('');
  }

  return {
    countries: { ...countries, data: countryOptions, query: countryQuery, setQuery: setCountryQuery, select: (id: string | null) => {
      selectCountry(countryOptions.find((item) => item.country_id === id) ?? null);
      if (id !== (country ?? null)) { setCityQuery(''); setAsnQuery(''); }
    } },
    cities: { ...cities, data: cityOptions, query: cityQuery, setQuery: setCityQuery, select: (alias: string | null) => {
      update('city', cityOptions.find((item) => item.city_alias === alias) ?? null, 'city_alias');
    } },
    asns: { ...asns, data: asnOptions, query: asnQuery, setQuery: setAsnQuery, select: (id: string | null) => {
      update('asn', asnOptions.find((item) => String(item.asn_id) === id) ?? null, 'asn_id');
    } },
    resetQueries,
  };
}

export type TargetingLookups = ReturnType<typeof useTargetingLookups>;
