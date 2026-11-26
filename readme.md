# Byteful Proxy Generator

The console can generate and download proxy lists, with country, city, and ASN
lookup fixtures for local development. Storybook covers the generator flow and
the searchable and dropdown controls. The [implementation checklist](tasks.md)
tracks the live Byteful integration.

## Local development

Use Node.js 22.12 or later on the 22.x line, Node.js 24.x, or Node.js 26.x.

```sh
npm ci
npm run dev
```

Open the app at [localhost:3000](http://localhost:3000). Run `npm run storybook`
and open the catalog at [localhost:6006](http://localhost:6006).

## Byteful API keys

The fixture-backed app and Storybook run without keys. For live lookup development,
create a key pair in the Byteful dashboard, copy `.env.example` to `.env.local`
at the project root, and fill in `BYTEFUL_PUBLIC_KEY` and `BYTEFUL_PRIVATE_KEY`.
The local file is ignored by Git.

For a deployment, set the same two variables in the hosting platform's server
environment. Keep both values server-only.

## Verification

```sh
npm run typecheck
npm run build
npm run build-storybook
```
