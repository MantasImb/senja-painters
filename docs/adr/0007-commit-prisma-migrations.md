# Commit Prisma migrations

Status: accepted

Senja Painters V1 will treat Prisma schema and committed `prisma/migrations` files as the database schema source of truth. Local schema changes should be created with Prisma Migrate and committed with their migration history, while deployed environments apply pending migrations with `bunx prisma migrate deploy` against the configured Railway Postgres database. Application code should access Prisma through a single server-only database module, such as `lib/db.ts`, rather than importing Prisma Client directly from UI components or scattered feature files.
