import { formats, listRules, sessionTypes, type ListRequest } from './list-rules';
import type { Asn, City } from './targeting';

export type ListErrors = Partial<Record<keyof ListRequest, string>>;
type Catalog = { cities: readonly City[]; asns: readonly Asn[] };

export function validateCredentials(username: unknown, password: unknown): ListErrors {
  const errors: ListErrors = {};
  if (typeof username !== 'string' || !username.trim()) {
    errors.proxy_user_id = 'Enter your proxy username.';
  } else if (/\s/.test(username)) {
    errors.proxy_user_id = 'The proxy username must contain no whitespace.';
  }
  if (typeof password !== 'string' || !password.trim()) {
    errors.proxy_user_password = 'Enter your proxy password.';
  } else if (/\s/.test(password)) {
    errors.proxy_user_password = 'The proxy password must contain no whitespace.';
  }
  return errors;
}

function validateCount(count: unknown) {
  if (typeof count !== 'number' || !Number.isInteger(count) || count < listRules.minCount || count > listRules.maxCount) {
    return 'Enter a whole number from 1 to 1,000.';
  }
}

export function validateListRequest(input: unknown, catalog: Catalog):
  | { ok: true; value: ListRequest }
  | { ok: false; errors: ListErrors } {
  const fields: Record<string, unknown> = input && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
  const {
    proxy_user_id, proxy_user_password, country_id, city_alias, asn_id,
    list_count = listRules.defaultCount,
    list_format = listRules.defaultFormat,
    list_session_type = listRules.defaultSessionType,
  } = fields;
  const errors = validateCredentials(proxy_user_id, proxy_user_password);
  const countError = validateCount(list_count);
  if (countError) errors.list_count = countError;
  const format = formats.find((option) => option === list_format);
  const sessionType = sessionTypes.find((option) => option === list_session_type);
  if (!format) errors.list_format = 'Choose a supported connection protocol.';
  if (!sessionType) errors.list_session_type = 'Choose a supported rotation mode.';
  if (country_id !== undefined && (typeof country_id !== 'string' || !/^[a-z]{2}$/.test(country_id))) {
    errors.country_id = 'Use a lowercase two-letter country code.';
  }
  if (city_alias !== undefined && !catalog.cities.some((city) => city.city_alias === city_alias && city.country_id === country_id)) {
    errors.city_alias = 'Choose a city in the selected country.';
  }
  if (asn_id !== undefined && (!Number.isSafeInteger(asn_id) || !catalog.asns.some((asn) =>
    asn.asn_id === asn_id && (country_id === undefined || asn.country_id === country_id)))) {
    errors.asn_id = 'Choose an available ASN for the selected country.';
  }
  if (Object.keys(errors).length || !format || !sessionType) return { ok: false, errors };

  return {
    ok: true,
    value: {
      proxy_user_id: proxy_user_id as string,
      proxy_user_password: proxy_user_password as string,
      list_count: list_count as number,
      list_format: format,
      list_session_type: sessionType,
      country_id: country_id as string | undefined,
      city_alias: city_alias as string | undefined,
      asn_id: asn_id as number | undefined,
    },
  };
}
