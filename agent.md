# Developer and AI Agent Guidelines

Read [requirement.md](requirement.md) for the original assessment, [context.md](context.md) and [architecture.md](architecture.md) for current behavior and implementation boundaries, and [readme.md](readme.md) for setup and future work.

## Development workflow

- Run `npm ci` from the project root using the Node.js version range in the README. Keep the lockfile with the source.
- Run `npm run dev` for the app on port 3000 and `npm run storybook` for the catalog on port 6006. The app uses live Byteful lookups. Storybook uses fixtures and works without keys.
- Run `npm test` for backend checks, `npm run typecheck` and `npm run build` for app changes, and `npm run build-storybook` for component catalog changes.

## Implementation boundaries

- Keep view routing, submission, and page-session history in `src/components/Landing.tsx`. Reuse the console, step, list, and result components under `src/components/generator/` and primitives from `src/components/ui/`. Refer to the supplied [console prototype](../interview-takehome-full-stack/design/index.html).
- Keep defaults, limits, and options in `src/lib/list-rules.ts`. Reuse the shared validator for the form and generation route. Keep targeting choices scoped in the UI and generation independent of the lookup catalog. Derive public error codes with `keyof typeof statusByCode` in `src/lib/api-errors.ts`.
- Use `src/lib/api-client.ts` for generation requests. Keep lookup caching, debounce, cancellation, pagination, and retry in `src/components/generator/use-targeting-lookups.ts`. Keep the draft available after a failed generation.
- Keep live Country, City, and ASN lookups behind the existing server routes. Store Byteful keys in the ignored `.env.local` or server environment and attach them in the server-only Byteful client. Use fixtures and mock responses in Storybook and tests. Generate URLs locally in `src/lib/proxy-builder.ts`. [Live lookup architecture](architecture.md#byteful-lookups)

## Verification checklist for future changes

- [ ] Check defaults, count limits, credential handling, targeting validation, and status/body pairs when changing request rules.
- [ ] Check city availability, country filtering, ASN selection, manual retry, and stale lookup cancellation when changing targeting.
- [ ] Check draft preservation on failure, form reset on success, and session history.
- [ ] Check keyboard and mobile interactions when changing the shell, table, or result controls.
- [ ] Exercise the relevant Storybook stories and run the relevant type and build checks. Report current blockers separately from regressions.
