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
  integer from 1 to 1,000. The form and API reject whitespace in credentials.
- The form limits choices to matching lookup results. The generation API checks
  the shape of targeting values and requires a country when a city is supplied.
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

See the [verification checklist](tasks.md#verification-and-known-gaps) for the
checks run and any remaining gaps.