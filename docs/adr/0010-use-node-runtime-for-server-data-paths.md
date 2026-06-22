# Use Node.js runtime for server data paths

Status: accepted

Senja Malere V1 will use the Node.js runtime for Server Actions, Prisma access, admin auth/session handling, analytics, rate limiting, and route handlers that touch application data. The Node runtime is the default and keeps Railway Postgres plus regular Prisma Client straightforward; Edge runtime is deferred unless a later lightweight use case justifies edge-compatible database and runtime constraints.
