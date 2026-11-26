import type { Asn, City, Country } from './targeting';

export const countries: readonly Country[] = [
  { country_id: 'ca', country_name: 'Canada' },
  { country_id: 'de', country_name: 'Germany' },
  { country_id: 'gb', country_name: 'United Kingdom' },
  { country_id: 'us', country_name: 'United States' },
];

export const cities: readonly City[] = [
  { country_id: 'de', city_alias: 'berlin', city_name: 'Berlin' },
  { country_id: 'gb', city_alias: 'london', city_name: 'London' },
  { country_id: 'gb', city_alias: 'manchester', city_name: 'Manchester' },
  { country_id: 'us', city_alias: 'new_york', city_name: 'New York' },
  { country_id: 'gb', city_alias: 'norwich', city_name: 'Norwich' },
  { country_id: 'us', city_alias: 'san_francisco', city_name: 'San Francisco' },
  { country_id: 'ca', city_alias: 'toronto', city_name: 'Toronto' },
  { country_id: 'ca', city_alias: 'vancouver', city_name: 'Vancouver' },
];

export const asns: readonly Asn[] = [
  { country_id: 'us', asn_id: 7922, asn_name: 'Comcast' },
  { country_id: 'de', asn_id: 3320, asn_name: 'Deutsche Telekom' },
  { country_id: 'ca', asn_id: 812, asn_name: 'Rogers' },
  { country_id: 'gb', asn_id: 5089, asn_name: 'Virgin Media' },
];

export function fixtureCities(country: string, query: string) {
  const term = query.trim().toLowerCase();
  return cities.filter((city) => city.country_id === country && city.city_name.toLowerCase().includes(term));
}

export function fixtureAsns(country: string, query: string) {
  const term = query.trim().toLowerCase();
  return asns.filter((asn) => (!country || asn.country_id === country) &&
    (asn.asn_name.toLowerCase().includes(term) || String(asn.asn_id).includes(term)));
}
