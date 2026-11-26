# Implementation checklist

## Project setup

- [x] Scaffold the TypeScript Next.js App Router app and Storybook. Commit the npm lockfile.
- [x] Add the dev, typecheck, build, Storybook, and Storybook build scripts.
- [x] Add a blank `.env.example` with `BYTEFUL_PUBLIC_KEY` and `BYTEFUL_PRIVATE_KEY`. Ignore `.env.local` and document local and deployed key setup.

## Reusable UI

- [x] Build `Card`, `Field`, `TextField`, `PasswordToggle`, `ComboBox`, and `StepProgress`.
- [x] Use `ComboBox type="searchable"` for Country, City, and ASN. Use `type="dropdown"` for Protocol and Rotation. Keep search text separate from the selected value.
- [x] Build the console shell, mobile navigation, and Credentials → Targeting → Review flow. Use one settings summary and mask the password by default.
- [x] Build the session-only Proxy list and result details with keyboard-accessible rows, copy actions, and `.txt` download.
- [x] Preserve the draft after a failed submission. Reset it and add a history entry after success.

## Backend and Byteful integration

- [x] Add a server-only Byteful client that reads both keys at runtime and sends the required authentication headers.
- [x] Implement the three live lookup routes. Preserve the `{ data }` response body and expose pagination through `X-Current-Page`, `X-Per-Page`, and `X-Next-Page` headers.
- [x] Scope city lookups by country with `like_subdivision_id=gb%25` and support ASN search with or without a country. Use debounced API search, TanStack Query caching and cancellation, automatic pagination on scroll, and manual retry for Country, City, and ASN.
- [x] Implement `POST /api/residential/list` with shared defaults and validation, percent-encoded credentials, unique sticky session IDs, identical rotating lines, and `Cache-Control: no-store`.
- [x] Accept live targeting values without fixture dependencies. The client validates selected City and ASN membership against selected lookup results. The generation route validates their structure and remains independent of upstream requests.
- [x] Return consistent `{ error, message }` responses for invalid input, missing keys, upstream errors, rate limits, and generation failures.

## Verification and known gaps

- [ ] Check input defaults, count limits, whitespace in credentials, combined targeting, and expected HTTP status and error bodies.
- [ ] Check lookup loading, empty results, pagination, missing keys, upstream 429, retry, and stale responses after changing country or query.
- [x] Exercise both `ComboBox` modes, the generator, history, and results with keyboard and mobile input. Verify copy, download, and draft recovery.
- [x] Recheck the generator Storybook import issue. The story imports `Landing` directly, builds, and runs through generation and retry in the browser.
- [x] Run `npm run typecheck` and `npm run build`. Keep Storybook and automated tests runnable without keys.
- [ ] With local keys configured, smoke-test all three live lookups and generation. Verify the browser calls only local routes and both keys stay out of client assets, responses, and logs.
- [ ] Finish the README with setup, assumptions, and error codes. Record the assessment walkthrough video.
