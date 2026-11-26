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

- [ ] Add a server-only Byteful client that reads both keys at runtime and sends the required authentication headers.
- [ ] Implement the three live lookup routes. Preserve the `{ data }` response body and expose City and ASN pagination through response headers.
- [ ] Verify country-scoped city filtering, including `subdivision_id=gb%25`, and ASN search with and without a country. Add debouncing, cancellation, caching, and manual retry.
- [ ] Implement `POST /api/residential/list` with shared defaults and validation, percent-encoded credentials, unique sticky session IDs, identical rotating lines, and `Cache-Control: no-store`.
- [ ] Accept live targeting values without fixture dependencies. Document where City and ASN country membership is verified while generation stays independent of upstream requests.
- [ ] Return consistent `{ error, message }` responses for invalid input, missing keys, upstream errors, rate limits, and generation failures.

## Verification and known gaps

- [ ] Check input defaults, count limits, whitespace in credentials, combined targeting, and expected HTTP status and error bodies.
- [ ] Check lookup loading, empty results, pagination, missing keys, upstream 429, retry, and stale responses after changing country or query.
- [x] Exercise both `ComboBox` modes, the generator, history, and results with keyboard and mobile input. Verify copy, download, and draft recovery.
- [x] Recheck the generator Storybook import issue. The story imports `Landing` directly, builds, and runs through generation and retry in the browser.
- [x] Run `npm run typecheck`, `npm run build`, and `npm run build-storybook`. Keep Storybook and automated tests runnable without keys.
- [ ] With local keys configured, smoke-test all three live lookups and generation. Verify the browser calls only local routes and both keys stay out of client assets, responses, and logs.
- [ ] Finish the README with setup, assumptions, and error codes. Record the assessment walkthrough video.
