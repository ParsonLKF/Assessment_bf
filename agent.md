# Developer and AI Agent Guidelines

Read [context.md](context.md), [architecture.md](architecture.md), [readme.md](readme.md), and [tasks.md](tasks.md) for behavior, implementation boundaries, and known gaps.

## Development workflow

- Run `npm ci` from the project root using the Node.js version range in the README. Keep the lockfile with the source.
- Run `npm run dev` for the app on port 3000 and `npm run storybook` for the catalog on port 6006. The current application uses fixtures with or without keys. The next implementation phase uses real Byteful lookup data.
- Run `npm run typecheck` and `npm run build` to validate app changes. Run `npm run build-storybook` for component catalog changes. The generator story import issue is listed in the verification checklist in [tasks.md](tasks.md#verification-and-known-gaps).

## Implementation boundaries

- Keep view routing, submission, and page-session history in `src/components/Landing.tsx`. Reuse the console, step, list, and result components under `src/components/generator/` and primitives from `src/components/ui/`. Refer to the rendered [console prototype](../interview-takehome-full-stack/Byteful-Console-UI/index.html) for the supplied design.
- Keep defaults, limits, and options in `src/lib/list-rules.ts`. Reuse the shared validator for the form and route. The current route supplies the fixture catalogs. During live integration, remove that fixture dependency so values from Byteful are accepted. Keep public error codes as strings and derive their type with `keyof typeof statusByCode` in `src/lib/api-errors.ts`.
- Use `src/lib/api-client.ts` for requests to the local API. Keep lookup caching, debounce, cancellation, and manual retry in `useLookup`. Keep the draft available after a failed generation.
- Implement live country, city, and ASN lookups through the existing server routes. Store Byteful keys in the ignored `.env.local` or server environment and use the server-only helper to prepare the header pair. Keep fixtures for Storybook and automated tests. Generate URLs locally in `src/lib/proxy-builder.ts`. [Live lookup architecture](architecture.md#planned-live-byteful-lookups)

## Verification checklist for future changes

- [ ] Check defaults, count limits, credential handling, targeting membership, and status/body pairs when changing request rules.
- [ ] Check city availability, country filtering, ASN selection, manual retry, and stale lookup cancellation when changing targeting.
- [ ] Check draft preservation on failure, form reset on success, and session history.
- [ ] Check keyboard and mobile interactions when changing the shell, table, or result controls.
- [ ] Exercise the relevant Storybook stories and run the relevant type and build checks. Report current blockers separately from regressions.
