# Use Zod for validation boundaries

Status: accepted

Senja Painters V1 will use Zod for Server Action input validation and environment variable parsing. Environment variables should be parsed through a centralized module, such as `lib/env.ts`, which exposes typed server and public config values and prevents scattered `process.env` reads in application code. Zod schemas provide a shared source of truth for runtime validation and inferred TypeScript types, and server-side schemas remain authoritative before Prisma writes or protected mutations run.

Browser-native constraint validation is not used for the public lead form or admin login form because native validation popovers are not reliably styleable and created unreadable contrast in the accepted UI. Those forms use `noValidate` and render readable inline field errors or summary alerts from the application validation flow instead.
