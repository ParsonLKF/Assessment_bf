# Business Context and Requirements

## Product

Byteful provides residential proxies at `residential.byteful.com:8000`. A residential proxy username can include a country, city, ASN, and sticky session ID. The console assembles URLs that users can copy or download. [Full-stack assessment](../interview-takehome-full-stack/README.md)

## Current project scope

- The workflow is Credentials, Targeting, Review, and result details. The form has one settings summary in Review. Proxy list holds results for the current page session, including the name, options, submission time, and generated lines.
- The app serves live Country, City, and ASN lookup results through local API routes. Country selection enables city search and scopes city and ASN results. ASN is selectable without a country.
- The server builds residential proxy URLs locally. Generation works without Byteful keys or lookup availability.
- Storybook provides component variants and interaction stories using local fixtures and mock responses.

## Lookup source

The browser calls the app's lookup routes, and the server fetches live results from Byteful using server-side keys. Search uses a 300 ms debounce, and the dropdown fetches more results as the user scrolls. [Upstream endpoints and query handling](architecture.md#byteful-lookups)

## List request contract

| Input | Requirement |
|---|---|
| `proxy_user_id` and `proxy_user_password` | Required strings. See the credential policy and current validator behavior below. |
| `list_count` | Optional integer from 1 to 1,000. Default is 100. |
| `list_format` | Optional `http`, `https`, `socks5`, or `socks5h`. Default is `http`. |
| `list_session_type` | Optional `sticky` or `rotating`. Default is `sticky`. |
| `country_id` | Optional officially assigned lowercase ISO 3166-1 alpha-2 code such as `us`. |
| `city_alias` | Optional non-blank string. Requires `country_id`. The form offers city results scoped to that country. |
| `asn_id` | Optional safe integer. The form offers ASN results with or without a country filter. |

Defaults apply to omitted fields. The form and backend share `validateListRequest`, with defaults, limits, and options in `src/lib/list-rules.ts`. The generation route checks targeting fields locally without consulting a city or ASN catalog. Account verification and proxy connectivity checks are outside the current scope.

### Credential policy

The project requires non-empty proxy credentials without whitespace, including leading, trailing, and embedded spaces. The shared validator enforces this policy in the form and API. The proxy builder percent-encodes accepted credentials.

## Assessment context

- **Working** covers the generator flow, request contract, and server-only keys.
- **Clean and extensible** covers separation of UI, API routes, and business logic, along with consistent errors.
- **Ready for future changes** considers additions such as presets and location node counts.

The supplied assessment describes a default upstream limit of 20 requests per second per customer. The lookup route maps upstream HTTP 429 to `rate_limited` and forwards `Retry-After` when present. [Full-stack assessment](../interview-takehome-full-stack/README.md)
