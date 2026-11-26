import { formats, listRules, sessionTypes, type ListRequest } from './list-rules';
import { apiErrorMessage } from './api-errors';
import { isAssignedCountryCode } from './country-codes';

export type ListErrors = Partial<Record<keyof ListRequest, string>>;

export function validateCredentials(username: unknown, password: unknown): ListErrors {
  const errors: ListErrors = {};
  if (typeof username !== 'string' || !username.trim()) {
    errors.proxy_user_id = apiErrorMessage.credentials.usernameRequired;
  } else if (/\s/.test(username)) {
    errors.proxy_user_id = apiErrorMessage.credentials.usernameWhitespace;
  }
  if (typeof password !== 'string' || !password.trim()) {
    errors.proxy_user_password = apiErrorMessage.credentials.passwordRequired;
  } else if (/\s/.test(password)) {
    errors.proxy_user_password = apiErrorMessage.credentials.passwordWhitespace;
  }
  return errors;
}

function validateCount(count: unknown) {
  if (typeof count !== 'number' || !Number.isInteger(count) || count < listRules.minCount || count > listRules.maxCount) {
    return apiErrorMessage.validation.count;
  }
}

export function validateListRequest(input: unknown):
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
  if (!format) errors.list_format = apiErrorMessage.validation.format;
  if (!sessionType) errors.list_session_type = apiErrorMessage.validation.sessionType;
  if (country_id !== undefined && !isAssignedCountryCode(country_id)) {
    errors.country_id = apiErrorMessage.validation.country;
  }
  if (city_alias !== undefined && (typeof city_alias !== 'string' || !city_alias.trim() || !country_id)) {
    errors.city_alias = apiErrorMessage.validation.city;
  }
  if (asn_id !== undefined && !Number.isSafeInteger(asn_id)) {
    errors.asn_id = apiErrorMessage.validation.asn;
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
