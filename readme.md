# Byteful Proxy Generator

Generate residential proxy lists with live Country, City, and ASN targeting,
then copy the URLs or download them as a text file. Storybook uses fixtures to
exercise the generator and reusable controls without API keys.

## Local development

Use Node.js 22.12 or later on the 22.x line, Node.js 24.x, or Node.js 26.x.

```sh
npm ci
npm run dev
```

Open the app at [localhost:3000](http://localhost:3000). Run `npm run storybook`
and open the catalog at [localhost:6006](http://localhost:6006).

## Byteful API keys

For live lookups, create a key pair in the Byteful dashboard, copy `.env.example`
to `.env.local` at the project root, and fill in `BYTEFUL_PUBLIC_KEY` and
`BYTEFUL_PRIVATE_KEY`. Restart the dev server after setting them. Git ignores
`.env.local`. Storybook and the generation endpoint work without keys.

For a deployment, set the same two variables in the hosting platform's server
environment. Keep both values server-only.

## Local API

| Route | Input |
| --- | --- |
| `GET /api/lookup/countries` | Optional `q` and `page` |
| `GET /api/lookup/cities` | Required `country_id`, optional `q` and `page` |
| `GET /api/lookup/asns` | Optional `country_id`, `q`, and `page` |
| `POST /api/residential/list` | JSON credentials, list options, and optional targeting |

The lookup routes return `{ data }` and include `X-Next-Page` when another
page is available. Generation returns `{ data, message }`.

```sh
curl -X POST http://localhost:3000/api/residential/list \
  -H 'Content-Type: application/json' \
  -d '{"proxy_user_id":"demo","proxy_user_password":"demo","list_count":2}'
```

Errors use `{ error, message }`.

| HTTP | Error | Meaning |
| --- | --- | --- |
| 400 | `missing_credentials` | A proxy username or password was missing, blank, or the wrong type. |
| 400 | `invalid_parameter` | The request body or a field failed validation. |
| 404 | `not_found` | The lookup resource is unknown. |
| 429 | `rate_limited` | Byteful rate limited the lookup. The route forwards `Retry-After` when present. |
| 500 | `internal_server_error` | An unexpected lookup or generation error occurred. |
| 502 | `upstream_failure` | Byteful was unreachable, rejected the request, or returned an unexpected response. |
| 503 | `missing_api_keys` | The server is missing one or both Byteful API keys. |

## Assumptions

- The default list is 100 HTTP proxies with sticky sessions. Count must be an
  integer from 1 to 1,000.
- We assume proxy strings are intended to be copied as single tokens without
  spaces. The form and API therefore reject whitespace in usernames and
  passwords. This is a project choice stricter than the assessment's non-empty
  credential rule. URL encoding can represent spaces, but the generator treats
  them as input mistakes.
- The form limits choices to matching lookup results. The generation API checks
  that any supplied country code is an officially assigned lowercase ISO 3166-1
  alpha-2 code and requires a country when a city is supplied.
  It builds URLs locally, so generation does not depend on lookup availability.
- Generated URLs do not verify proxy credentials or test proxy connectivity.
  The console keeps generated lists in memory until the page is reloaded.

## Verification

```sh
npm test
npm run typecheck
npm run build
npm run build-storybook
```

Backend tests and Storybook use mock responses and can run without API keys.
See [Future work](#future-work) for the remaining gaps.

## Future work

1. **Limit generated response size.** Estimate the encoded JSON response size
   before building the list, including the URL count, sticky session suffixes,
   and JSON overhead. Return `400 invalid_parameter` if it exceeds a fixed
   budget, such as 1 MiB, and ask the user to reduce **Quantity**. Test both
   sides of the limit. The frontend should also handle HTTP `413 Payload Too
   Large` from the server or reverse proxy, even when the body is HTML or
   empty. Preserve the draft and ask the user to shorten their inputs before
   submitting again.
2. **Reject redirects on authenticated Byteful requests.** Set
   `redirect: 'error'` on the server-side request so the API keys stay on the
   configured Byteful origin. Report rejected redirects as `502 upstream_failure`.
3. **Honor `Retry-After` on rate-limited lookups.** Parse delay seconds and HTTP
   dates from the forwarded header. Delay both automatic and manual retries
   until the wait expires. Use the existing backoff if the header is missing
   or invalid.
4. **Retry the page that failed.** Call `fetchNextPage()` after a pagination
   error and keep earlier pages visible. Use `refetch()` for initial lookup
   failures.
5. **Validate Unicode before URL encoding.** Reject unpaired UTF-16 surrogates
   in usernames, passwords, and city aliases in the shared validator. Return
   `400 invalid_parameter` and accept well-formed Unicode, including emoji.
6. **Verify retry recovery in Storybook.** Click **Retry** in the lookup story
   and check that country options appear. Click **Create access** again in the
   generation story and check that a result appears. Keep the lookup mock
   failing through automatic retries so the story exercises manual recovery.
