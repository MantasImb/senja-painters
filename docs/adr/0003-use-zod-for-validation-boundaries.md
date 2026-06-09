# Use Zod for validation boundaries

Status: accepted

Senja Painters V1 will use Zod for Server Action input validation and environment variable parsing. Environment variables should be parsed through a centralized module, such as `lib/env.ts`, which exposes typed server and public config values and prevents scattered `process.env` reads in application code. Zod schemas provide a shared source of truth for runtime validation and inferred TypeScript types, while UI components may still use native HTML constraints for immediate browser feedback; server-side schemas remain authoritative before Prisma writes or protected mutations run.
