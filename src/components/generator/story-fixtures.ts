import { useState } from 'react';
import { asns, cities, countries, fixtureAsns, fixtureCities } from '@/lib/lookup-fixtures';
import type { Draft, ProxySnapshot } from './types';
import type { GeneratorDraft } from './use-generator-draft';
import type { TargetingLookups } from './use-targeting-lookups';

export const exampleDraft: Draft = {
  name: 'London QA',
  username: 'demo-user',
  password: 'example-password',
  count: '2',
  format: 'https',
  rotation: 'sticky',
  country: countries.find((entry) => entry.country_id === 'gb') ?? null,
  city: cities.find((entry) => entry.city_alias === 'london') ?? null,
  asn: asns.find((entry) => entry.asn_id === 5089) ?? null,
};

export const exampleResult: ProxySnapshot = {
  id: 1,
  name: 'London QA',
  filename: 'london-qa.txt',
  country: 'United Kingdom',
  city: 'London',
  format: 'https',
  rotation: 'sticky',
  submittedAt: '2026-11-26T12:00:00Z',
  lines: [
    'https://demo-user_c_gb_city_london_asn_5089_s_A123456789012345:example-password@residential.byteful.com:8000',
    'https://demo-user_c_gb_city_london_asn_5089_s_B123456789012345:example-password@residential.byteful.com:8000',
  ],
};

const idleLookup = {
  loading: false,
  loadingMore: false,
  hasMore: false,
  error: undefined,
  retry: () => {},
  loadMore: () => {},
};

function includeSelected<T>(data: readonly T[], selected: T | null) {
  return selected && !data.includes(selected) ? [selected, ...data] : [...data];
}

export function useStoryLookups(form: GeneratorDraft): TargetingLookups {
  const [countryQuery, setCountryQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [asnQuery, setAsnQuery] = useState('');
  const country = form.draft.country?.country_id ?? '';

  return {
    countries: {
      ...idleLookup,
      data: includeSelected(countries.filter((item) => item.country_name.toLowerCase().includes(countryQuery.trim().toLowerCase())), form.draft.country),
      query: countryQuery,
      setQuery: setCountryQuery,
      select: (id) => {
        form.selectCountry(countries.find((item) => item.country_id === id) ?? null);
        setCityQuery('');
        setAsnQuery('');
      },
    },
    cities: {
      ...idleLookup,
      data: includeSelected(fixtureCities(country, cityQuery), form.draft.city),
      query: cityQuery,
      setQuery: setCityQuery,
      select: (alias) => form.update('city', cities.find((item) => item.city_alias === alias && item.country_id === country) ?? null),
    },
    asns: {
      ...idleLookup,
      data: includeSelected(fixtureAsns(country, asnQuery), form.draft.asn),
      query: asnQuery,
      setQuery: setAsnQuery,
      select: (id) => form.update('asn', asns.find((item) => String(item.asn_id) === id && (!country || item.country_id === country)) ?? null),
    },
    resetQueries: () => {
      setCountryQuery('');
      setCityQuery('');
      setAsnQuery('');
    },
  };
}
