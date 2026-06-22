# Run Prisma deploy before Vercel build

Status: accepted

Senja Malere V1 will deploy the Next.js app on Vercel and use two Railway Postgres databases: one production database and one shared non-production database for development, preview, and tests. Database-backed tests may write to the shared non-production database without cleanup, so test-created records should be clearly recognizable and the non-production database must be treated as disposable. Vercel builds should prepare the configured database before building and serving the app by running Prisma Client generation and pending migrations. The repo-owned Vercel build script is `bun run vercel-build`, which runs `bunx prisma generate && bunx prisma migrate deploy && bun run build`.
