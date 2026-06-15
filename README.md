# Senja Malere Website

Norwegian-first Next.js website for Senja Malere.

## Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Testing

```bash
bun run test
bun run test:ci
bun run test:watch
bun run test:e2e
```

`bun run test` runs Jest with React Testing Library for component and application behavior. `bun run test:ci` runs the usual non-E2E verification path: Jest, lint, and build. `bun run test:e2e` is intentionally separate; it starts a local Next.js dev server when needed and runs the Bruno HTTP E2E collection in `tests/e2e/bruno`.

Use `bun run test`, not `bun test`, for this project. `bun test` invokes Bun's built-in test runner directly and bypasses the Jest `jsdom` environment that component tests need for `window` and `document`.

To run Bruno against an already-running server:

```bash
BASE_URL=http://127.0.0.1:3000 bun run test:e2e
```

Or run the collection directly when a server is already available at the local environment URL:

```bash
bun run test:e2e:bruno
```

The testing split is documented in `docs/adr/0005-use-jest-and-react-testing-library.md` and `docs/adr/0012-use-bruno-for-http-e2e-automation.md`.

Vercel deployments should use the configured build command and should not run Bruno during the build step. Run Bruno alongside the usual checks locally or in a separate post-deploy/preview-check workflow against a running URL.

## Package Manager

Use Bun for installs, lockfile updates, and scripts.

## Prisma

Prisma schema and migrations are committed under `prisma/`. The generated Prisma client is written to `lib/generated/prisma/` and intentionally ignored by Git.

Create a local `.env.local` or `.env` from `.env.example`, then point `DATABASE_URL` at the database you want to migrate.

Apply committed migrations to the configured database:

```bash
bunx prisma migrate deploy
```

Generate the ignored Prisma client:

```bash
bunx prisma generate
```

`prisma.config.ts` loads `.env.local` first and `.env` second. `bun run build` also runs `prisma generate` before `next build`.
