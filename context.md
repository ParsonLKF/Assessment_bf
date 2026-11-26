# Business Context and Requirements

## Product

Byteful provides residential proxies at `residential.byteful.com:8000`. A residential proxy username can include a country, city, ASN, and sticky session ID. The console assembles URLs that users can copy or download. [Full-stack assessment](../interview-takehome-full-stack/README.md)

## Current project scope

- The workflow is Credentials, Targeting, Review, and result details. The form has one settings summary in Review. Proxy list holds results for the current page session, including the name, options, submission time, and generated lines.
- The app serves local country, city, and ASN fixtures. Country selection enables city search, limits city results, and filters ASN choices. ASN is selectable without a country.
- The server builds residential proxy URLs locally. Byteful key setup is available to server code, and the app makes zero Byteful requests.
- Storybook provides component variants and fixture-backed interaction stories. The current generator story import issue is tracked in [tasks.md](tasks.md#verification-and-known-gaps).

## Planned lookup source

The next implementation phase follows the original assessment. The country, city, and ASN routes will fetch live results from Byteful with server-side credentials. The browser continues to call the app's existing lookup routes. Storybook continues to use local mocks. Proxy generation stays local and must accept targeting values returned by the live lookups. [Upstream endpoints and query handling](architecture.md#planned-live-byteful-lookups)

## List request contract

| Input | Requirement |
|---|---|
| `proxy_user_id` and `proxy_user_password` | Required strings. See the credential policy and current validator behavior below. |
| `list_count` | Optional integer from 1 to 1,000. Default is 100. |
| `list_format` | Optional `http`, `https`, `socks5`, or `socks5h`. Default is `http`. |
| `list_session_type` | Optional `sticky` or `rotating`. Default is `sticky`. |
| `country_id` | Optional lowercase ISO 3166-1 alpha-2 code such as `us`. Valid codes outside the fixture catalog are accepted when compatible with the targeting fields. |
| `city_alias` | Optional non-blank string. Requires `country_id` and a matching city record for that country. |
| `asn_id` | Optional safe integer. It represents an ASN from the lookup results. The current route validates it against fixtures and checks country membership when a country is supplied. The live phase removes the fixture-only constraint. |

Defaults apply to omitted fields. The form and backend share `validateListRequest`, with defaults, limits, and options in `src/lib/list-rules.ts`. Account verification and proxy connectivity checks are outside the current scope.

### Credential policy

The project requires non-empty proxy credentials without whitespace, including leading, trailing, and embedded spaces. The current validator checks `.trim().length` for blank values and forwards accepted credentials unchanged. Whitespace in otherwise non-empty credentials therefore still passes validation and becomes percent-encoded in the URL.

## Assessment context

- **Working** covers the generator flow, request contract, and server-only keys.
- **Clean and extensible** covers separation of UI, API routes, and business logic, along with consistent errors.
- **Ready for future changes** considers additions such as presets and location node counts.

The supplied assessment describes a default upstream limit of 20 requests per second per customer and HTTP 429 above it. The live lookup phase should account for that limit. [Full-stack assessment](../interview-takehome-full-stack/README.md)
