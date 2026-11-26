import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError, fetchData } from '@/lib/api-client';
import type { Asn, City, Country } from '@/lib/targeting';
import type { GeneratorDraft } from './use-generator-draft';

function lookupPath(resource: string, country: string | undefined, query: string) {
  const params = new URLSearchParams();
  if (country) params.set('country_id', country);
  if (query) params.set('q', query);
  const search = params.toString();
  return `/api/lookup/${resource}${search ? `?${search}` : ''}`;
}

async function loadLookup<T>(path: string, signal: AbortSignal) {
  try {
    return await fetchData<T>(path, { signal });
  } catch (error) {
    if (error instanceof ApiError && error.status !== undefined && error.status < 500 && error.status !== 429) {
      throw new Error(error.message);
    }
    throw error;
  }
}

function withSelected<T>(data: readonly T[], selected: T | null, key: keyof T) {
  return selected && !data.some((option) => option[key] === selected[key]) ? [selected, ...data] : data;
}

export function useTargetingLookups(enabled: boolean, { draft, selectCountry, update }: GeneratorDraft) {
  const [countryQuery, setCountryQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [asnQuery, setAsnQuery] = useState('');
  const country = draft.country?.country_id;
  const countryTerm = countryQuery.trim().toLowerCase();
  const cityTerm = cityQuery.trim();
  const asnTerm = asnQuery.trim();
  const countriesPath = '/api/lookup/countries';
  const citiesPath = country ? lookupPath('cities', country, cityTerm) : '';
  const asnsPath = lookupPath('asns', country, asnTerm);
  const countries = useQuery({
    queryKey: ['lookup', countriesPath],
    queryFn: ({ signal }) => loadLookup<Country>(countriesPath, signal),
    enabled,
  });
  const cities = useQuery({
    queryKey: ['lookup', citiesPath],
    queryFn: ({ signal }) => loadLookup<City>(citiesPath, signal),
    enabled: enabled && Boolean(country),
  });
  const asns = useQuery({
    queryKey: ['lookup', asnsPath],
    queryFn: ({ signal }) => loadLookup<Asn>(asnsPath, signal),
    enabled,
  });
  const countryData = countries.data ?? [];
  const cityData = cities.data ?? [];
  const asnData = asns.data ?? [];
  const visibleCountries = countryData.filter((item) => item.country_name.toLowerCase().includes(countryTerm) || item.country_id.includes(countryTerm));

  const countryOptions = withSelected(visibleCountries, draft.country, 'country_id');
  const cityOptions = withSelected(cityData, draft.city, 'city_alias');
  const asnOptions = withSelected(asnData, draft.asn, 'asn_id');

  function resetQueries() {
    setCountryQuery('');
    setCityQuery('');
    setAsnQuery('');
  }

  return {
    countries: { data: countryOptions, loading: countries.isPending && enabled, error: countries.error?.message, retry: () => void countries.refetch(), query: countryQuery, setQuery: setCountryQuery, select: (id: string | null) => {
      selectCountry(countryOptions.find((item) => item.country_id === id) ?? null);
      if (id !== (country ?? null)) {
        setCityQuery('');
        setAsnQuery('');
      }
    } },
    cities: { data: cityOptions, loading: cities.isPending && enabled && Boolean(country), error: cities.error?.message, retry: () => void cities.refetch(), query: cityQuery, setQuery: setCityQuery, select: (alias: string | null) => {
      update('city', cityOptions.find((item) => item.city_alias === alias) ?? null, 'city_alias');
    } },
    asns: { data: asnOptions, loading: asns.isPending && enabled, error: asns.error?.message, retry: () => void asns.refetch(), query: asnQuery, setQuery: setAsnQuery, select: (id: string | null) => {
      update('asn', asnOptions.find((item) => String(item.asn_id) === id) ?? null, 'asn_id');
    } },
    resetQueries,
  };
}

export type TargetingLookups = ReturnType<typeof useTargetingLookups>;
