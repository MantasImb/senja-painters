# Commit Prisma migrations

Status: accepted

Senja Painters V1 will treat Prisma schema and committed `prisma/migrations` files as the database schema source of truth. Local schema changes should be created with Prisma Migrate and committed with their migration history, while deployed environments apply pending migrations with `bunx prisma migrate deploy` against the configured Railway Postgres database. Generated Prisma client files under `lib/generated/prisma/` are not committed; they are ignored by Git and regenerated locally or during build steps with `bunx prisma generate`. Application code should access Prisma through a single server-only database module, such as `lib/db.ts`, rather than importing Prisma Client directly from UI components or scattered feature files.
