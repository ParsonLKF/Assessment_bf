# Technical Architecture and System Design

The Next.js App Router serves a client-side React console and four local API routes. The browser calls only the app's API. The console and its styles follow the supplied [design prototype](../interview-takehome-full-stack/Byteful-Console-UI/index.html).

## Source map

| Location | Responsibility |
|---|---|
| `src/app/page.tsx`, `layout.tsx`, and `globals.css` | The page renders `Landing`. The root layout supplies metadata and shared Tailwind and console styles. |
| `src/components/Landing.tsx` | Owns view switching, form submission, selected result, and session history. |
| `src/components/generator/console-shell.tsx` | Provides theme, logo, breadcrumb, desktop rail, and mobile navigation drawer. |
| `src/components/generator/proxy-generator.tsx` and `generator-steps.tsx` | Render setup progress, form actions, credentials, targeting, and the single settings summary in Review. |
| `src/components/generator/proxy-list.tsx` and `proxy-list-table.tsx` | Render the submitted-list screen and activate a selected row. |
| `src/components/generator/proxy-result.tsx` and `types.ts` | Render list details and manage copy/download feedback. Types describe views, steps, and generated snapshots. |
| `src/components/generator/use-generator-draft.ts` and `use-targeting-lookups.ts` | Manage draft defaults, selections, lookup query paths, and client-side validation. |
| `src/components/ui/` | Reusable Card, Step Progress, Field, Text Field, Password Toggle, and Select Field. |
| `src/components/use-lookup.ts` | Stores successful lookup responses by path, debounces, cancels obsolete requests, and exposes retry. |
| `src/lib/api-client.ts` | Fetches array results from local routes and preserves server error codes, messages, and statuses. |
| `src/lib/list-rules.ts`, `validators.ts`, and `api-errors.ts` | Hold shared defaults and options, input and fixture-membership checks, and the error catalog. |
| `src/lib/lookup-fixtures.ts`, `proxy-builder.ts`, and `byteful-api-client.ts` | Provide local lookup data, generate URLs, and prepare optional server-only Byteful auth headers. |
| `.storybook/` and colocated `*.stories.tsx` | Configure the Next.js Vite catalog and exercise the components and screen with local mocks. |

## Console interaction

- The Tool menu offers **Proxy generator** and **Proxy list**. The rail shows the current number of generated lists and the Tool workspace card. The desktop rail is 260px wide and narrows to 220px at 1190px and below. At 720px and below, the Tool menu opens from a hamburger button in a left-side drawer. Menu selection, Escape, or a click on the backdrop closes the drawer. Light mode uses `ping_logo_b83f7f9c6b.webp` and a moon toggle. Dark mode uses `byteful-white-logo.png` and a sun toggle.
- The generator has a two-column layout with a progress rail and one form card. At 600px and below, the steps appear across the top of the form. Review contains the settings summary. Credentials and Review mask the password by default and offer a visibility toggle.
- The table shows list name, country, city, quantity, rotation, status, submission time, and View. A row click, Enter, Space, or View opens that list. Mobile scrolling is contained within the table card.
- Results show Country, City, Quantity, Format, Rotation, and Status, with Copy all lines, per-line Copy, Download .txt, and Back to Proxy list. At 720px and below the summary has two columns. Long lines scroll within each row so Copy remains visible. The optional list name is used for the download, with `residential-proxies.txt` as the fallback.
- A successful response with lines adds a history snapshot and resets the draft. Failed submissions preserve the current inputs and display a retryable error in Review. Reloading clears session history.

## Requests and validation

Country and ASN data are fetched through `useLookup`. City search uses a 300ms debounce when a search term is present. Changing the country clears the city selection and search, and clears an ASN that no longer belongs to the selected country. A selected city stays in the option list while a search excludes it. Each lookup cache is keyed by full request path and lasts for the mounted console. Successful responses are cached. Obsolete requests are aborted. Retry is manual.

The browser and generation route use the same validator. The browser supplies its selected city and ASN records. The route supplies the full fixture catalogs. The route catches malformed JSON separately and returns the structured generation failure for an exception during URL assembly or success response serialization.

The error catalog uses string codes typed with `type ApiErrorCode = keyof typeof statusByCode`. The `as const` status lookup maps `missing_credentials` and `invalid_parameter` to HTTP 400 and `internal_server_error` to HTTP 500. `apiErrorResponse` serializes only `error` and `message`. The network client requires an array in `data` on success and distinguishes HTTP, transport, and response-format failures. [API routes and examples](readme.md#local-api)

## Proxy URL builder

```text
<list_format>://<username>:<proxy_user_password>@residential.byteful.com:8000
<proxy_user_id>[_c_<country_id>[_city_<city_alias>]][_asn_<asn_id>][_s_<session_id>]
```

The builder percent-encodes the assembled username and password. For sticky sessions, it appends a random 16-character uppercase alphanumeric session ID to the username and enforces uniqueness within the list. Rotating lists omit the session suffix and repeat the same line. The generation endpoint adds `Cache-Control: no-store` on success.

## Current fixture baseline

The country fixtures are Canada, Germany, United Kingdom, and United States. The city fixtures are Berlin, London, Manchester, New York, Norwich, San Francisco, Toronto, and Vancouver, with their respective country codes. The ASN fixtures are Comcast 7922, Deutsche Telekom 3320, Rogers 812, and Virgin Media 5089. Their exact values and order are in `src/lib/lookup-fixtures.ts`.

The server-only helper trims `BYTEFUL_PUBLIC_KEY` and `BYTEFUL_PRIVATE_KEY` and prepares `X-API-Public-Key` and `X-API-Private-Key` when both are present. Current routes make zero upstream requests.

## Byteful lookups

The browser will keep calling the Next.js routes. The Next.js server will require both keys and send them as authentication headers to `https://api.byteful.com/1.0/`. The route adapters will normalize upstream payloads to the existing `{ data }` response shape, with safe error messages for missing configuration, upstream errors, and rate limits. [Full-stack assessment](../interview-takehome-full-stack/README.md)

| App route | Byteful route |
|---|---|
| `GET /api/lookup/countries` | `GET /public/user/country/search` |
| `GET /api/lookup/cities` | `GET /public/user/city/search` |
| `GET /api/lookup/asns` | `GET /public/user/asn/search` |

- Translate city `country_id` to the upstream `subdivision_id` wildcard filter. For `gb`, pass `gb%` as the query value and let URL encoding produce `subdivision_id=gb%25`. Keep the app's optional city search query and the ASN country filter.
- Keep the browser's debounce, successful-response cache, cancellation, and manual retry. Account for the assessment's default limit of 20 requests per second and HTTP 429 responses when designing the server lookups.
- Update generation validation so valid city and ASN values from Byteful pass without relying on the fixture catalog. Keep `POST /api/residential/list` independent of upstream requests and build its output locally.
- Keep fixture data in Storybook and automated tests so they run without keys or upstream availability.
