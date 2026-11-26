export const apiErrorMessage = {
  request: {
    invalidJson: 'Send a valid JSON request body.',
    invalidObject: 'Send a JSON object with the list settings.',
    invalidSettings: 'Check the list settings.',
    invalidCountry: 'Use a lowercase two-letter country code.',
    countryRequired: 'Choose a country before searching for cities.',
    invalidSearch: 'Search text must be from 1 to 80 characters.',
    invalidPage: 'Page must be a positive integer.',
    unknownLookup: 'This lookup does not exist.',
  },
  credentials: {
    usernameRequired: 'Enter your proxy username.',
    usernameWhitespace: 'The proxy username must contain no whitespace.',
    passwordRequired: 'Enter your proxy password.',
    passwordWhitespace: 'The proxy password must contain no whitespace.',
  },
  validation: {
    count: 'Enter a whole number from 1 to 1,000.',
    format: 'Choose a supported connection protocol.',
    sessionType: 'Choose a supported rotation mode.',
    country: 'Use an assigned lowercase ISO 3166-1 country code, such as gb or us.',
    city: 'Choose a city in the selected country.',
    asn: 'Choose an available ASN for the selected country.',
  },
  network: {
    unavailable: 'Could not reach the server. Check your connection and try again.',
    failed: 'The request failed. Try again.',
    lookupFailed: 'The lookup failed. Try again.',
    unexpectedResponse: 'The server returned an unexpected response.',
    invalidProxyList: 'The server returned an invalid proxy list. Try again.',
  },
  generation: {
    failed: 'Could not generate the proxy list. Try again.',
    empty: 'The server returned an empty proxy list. Try again.',
  },
  lookup: {
    unconfigured: 'Live lookups are not configured. Set BYTEFUL_PUBLIC_KEY and BYTEFUL_PRIVATE_KEY on the server.',
    unexpectedBytefulResponse: 'Byteful returned an unexpected lookup response.',
    unreadableBytefulResponse: 'Byteful returned an unreadable lookup response.',
    invalidCountry: 'Byteful returned an invalid country record.',
    invalidCity: 'Byteful returned an invalid city record.',
    invalidAsn: 'Byteful returned an invalid ASN record.',
    connectionFailed: 'Could not connect to Byteful. Try the lookup again.',
    rateLimited: 'Byteful lookup rate limit reached. Wait briefly and retry.',
    upstreamFailed: 'Byteful could not complete the lookup. Check the API key and try again.',
    failed: 'The lookup could not be completed. Try again.',
  },
  clipboard: {
    failed: 'Could not copy to the clipboard. You can select and copy the proxy text manually.',
  },
} as const;

const statusByCode = {
  missing_credentials: 400,
  invalid_parameter: 400,
  not_found: 404,
  missing_api_keys: 503,
  upstream_failure: 502,
  rate_limited: 429,
  internal_server_error: 500,
} as const;

export type ApiErrorCode = keyof typeof statusByCode;

export function apiErrorResponse(error: ApiErrorCode, message: string) {
  return Response.json({ error, message }, { status: statusByCode[error] });
}

export function apiErrorResponseWithHeaders(error: ApiErrorCode, message: string, headers: HeadersInit) {
  return Response.json({ error, message }, { status: statusByCode[error], headers });
}
