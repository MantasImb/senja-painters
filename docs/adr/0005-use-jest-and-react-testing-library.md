# Use Jest and React Testing Library

Status: accepted

Senja Malere V1 will use Jest with `next/jest`, `jest-environment-jsdom`, React Testing Library, `@testing-library/jest-dom`, and `@testing-library/user-event` as the default test foundation. Tests should favor accessible, user-facing queries and behavior assertions for components, forms, validation helpers, Server Action boundaries, auth/session helpers, SEO helpers, and Prisma-backed workflows with suitable fakes or test data.

HTTP-level E2E and smoke automation is handled separately by Bruno, as recorded in `0012-use-bruno-for-http-e2e-automation.md`. Browser-level E2E coverage can be added later for async Server Component flows or real browser workflows that Jest and Bruno do not cover well.
