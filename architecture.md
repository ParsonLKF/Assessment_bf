# Technical Architecture and System Design

The Next.js App Router serves a client-side React console and four local API endpoints. Three lookup endpoints share one dynamic route handler. The browser calls only the app's API. The console and its styles follow the supplied [design prototype](../interview-takehome-full-stack/design/index.html).

## Source map

| Location | Responsibility |
|---|---|
| `src/app/page.tsx`, `layout.tsx`, and `globals.css` | The page renders `Landing`. The root layout supplies metadata and shared Tailwind and console styles. |
| `src/components/Landing.tsx` | Owns view switching, form submission, selected result, and session history. |
| `src/components/generator/console-shell.tsx` | Provides theme, logo, breadcrumb, desktop rail, and mobile navigation drawer. |
| `src/components/generator/proxy-generator.tsx` and `generator-steps.tsx` | Render setup progress, form actions, credentials, targeting, and the single settings summary in Review. |
| `src/components/generator/proxy-list.tsx` and `proxy-list-table.tsx` | Render the submitted-list screen and activate a selected row. |
| `src/components/generator/proxy-result.tsx` and `types.ts` | Render list details and manage copy/download feedback. Types describe views, steps, and generated snapshots. |
| `src/components/generator/use-generator-draft.ts` | Manages draft defaults, selections, and form validation. |
| `src/components/generator/use-targeting-lookups.ts` and `src/components/query-provider.tsx` | Fetch and cache lookup pages, debounce search, cancel obsolete requests, and handle retry. |
| `src/components/ui/` | Reusable Card, Step Progress, Field, Text Field, Password Toggle, and ComboBox. Country, City, and ASN are searchable. Protocol and Rotation use native dropdowns. |
| `src/lib/api-client.ts` | Sends generation requests to the local API and preserves the HTTP status and error message on failure. |
| `src/lib/constants.ts` | Holds shared lookup settings and proxy gateway and session ID constants. |
| `src/lib/list-rules.ts`, `validators.ts`, `country-codes.ts`, and `api-errors.ts` | Hold shared defaults and options, input and ISO country validation, and the error catalog. |
| `src/lib/proxy-builder.ts` and `src/lib/byteful-api-client.ts` | Generate proxy URLs locally and fetch live lookups with server-side Byteful credentials, respectively. |
| `src/lib/lookup-fixtures.ts` and `tests/` | Provide Storybook lookup fixtures and backend checks that use mock upstream responses. |
| `.storybook/` and colocated `*.stories.tsx` | Configure the Next.js Vite catalog and exercise the components and screen with local mocks. |

## Console interaction

- The Tool menu offers **Proxy generator** and **Proxy list**. The rail shows the current number of generated lists and the Tool workspace card. The desktop rail is 260px wide and narrows to 220px at 1190px and below. At 720px and below, the Tool menu opens from a hamburger button in a left-side drawer. Menu selection, Escape, or a click on the backdrop closes the drawer. Light mode uses `ping_logo_b83f7f9c6b.webp` and a moon toggle. Dark mode uses `byteful-white-logo.png` and a sun toggle.
- The generator has a two-column layout with a progress rail and one form card. At 600px and below, the steps appear across the top of the form. Review contains the settings summary. Credentials and Review mask the password by default and offer a visibility toggle.
- The table shows list name, country, city, quantity, rotation, status, submission time, and View. A row click, Enter, Space, or View opens that list. Mobile scrolling is contained within the table card.
- Results show Country, City, Quantity, Format, Rotation, and Status, with Copy all lines, per-line Copy, Download .txt, and Back to Proxy list. At 720px and below the summary has two columns. Long lines scroll within each row so Copy remains visible. The optional list name is used for the download, with `residential-proxies.txt` as the fallback.
- A successful response with lines adds a history snapshot and resets the draft. Failed submissions preserve the current inputs and display a retryable error in Review. Reloading clears session history.

## Requests and validation

Country, City, and ASN use the same TanStack Query lookup hook. A search term is sent to the server after a 300 ms debounce. The dropdown requests the next page when its last row comes within 64 px of the visible list. Changing the country clears the city selection and the City and ASN search terms, and clears an ASN that no longer belongs to the selected country. A selected option stays visible while a search excludes it. The cache is keyed by resource, country scope, and search term. Data stays fresh for 60 seconds, and inactive queries are retained for 10 minutes. The hook passes TanStack Query's abort signal to fetch. It allows up to two automatic retries for network errors, server errors, and HTTP 429. The dropdown's manual Retry button refetches the lookup.

The browser and generation route use the same validator. It rejects whitespace in credentials, checks supplied country codes against assigned lowercase ISO codes, requires a country for a city alias, and accepts safe integers for ASN IDs. Lookup results scope the choices in the UI. The generation route validates submitted values locally without checking membership against a catalog. It returns a structured validation error for malformed JSON and a structured generation error for exceptions during URL assembly or response serialization.

The error catalog uses string codes typed with `type ApiErrorCode = keyof typeof statusByCode`. The `as const` status lookup maps `missing_credentials` and `invalid_parameter` to HTTP 400 and `internal_server_error` to HTTP 500. `apiErrorResponse` serializes only `error` and `message`. The network client requires an array in `data` on success and distinguishes HTTP, transport, and response-format failures. [API routes and examples](readme.md#local-api)

## Proxy URL builder

```text
<list_format>://<username>:<proxy_user_password>@residential.byteful.com:8000
<proxy_user_id>[_c_<country_id>[_city_<city_alias>]][_asn_<asn_id>][_s_<session_id>]
```

The builder percent-encodes the assembled username and password. For sticky sessions, it appends a random 16-character uppercase alphanumeric session ID to the username and enforces uniqueness within the list. Rotating lists omit the session suffix and repeat the same line. The generation endpoint adds `Cache-Control: no-store` on success.

## Byteful lookups

The browser calls the Next.js routes. The server-only Byteful client reads and trims `BYTEFUL_PUBLIC_KEY` and `BYTEFUL_PRIVATE_KEY` and sends them as `X-API-Public-Key` and `X-API-Private-Key` to `https://api.byteful.com/1.0/`. The lookup handler normalizes upstream payloads to `{ data }` and returns structured errors for missing configuration, upstream failures, and rate limits. [Full-stack assessment](../interview-takehome-full-stack/README.md)

| App route | Byteful route |
|---|---|
| `GET /api/lookup/countries` | `GET /public/user/country/search` |
| `GET /api/lookup/cities` | `GET /public/user/city/search` |
| `GET /api/lookup/asns` | `GET /public/user/asn/search` |

- City lookup converts the local `country_id=gb` to Byteful's `like_subdivision_id=gb%25`. ASN lookup passes `country_id` when supplied.
- Name searches use the resource's `like_*_name` filter and wrap the search term in wildcards. URL encoding turns the wildcards into `%25`. A numeric ASN search matches `asn_id` exactly.
- The server asks Byteful for 100 records per page. The local lookup response includes `X-Current-Page` and `X-Per-Page` on success, plus `X-Next-Page` when another page is available. The route forwards `Retry-After` when Byteful includes it in an HTTP 429 response. Client handling of that header is listed under [Future work](readme.md#future-work).
- Storybook and backend tests use local fixtures or mock responses and run without Byteful keys. `POST /api/residential/list` builds its output locally.
