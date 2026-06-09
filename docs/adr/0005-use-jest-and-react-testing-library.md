# Use Jest and React Testing Library

Status: accepted

Senja Painters V1 will use Jest with `next/jest`, `jest-environment-jsdom`, React Testing Library, `@testing-library/jest-dom`, and `@testing-library/user-event` as the default test foundation. Tests should favor accessible, user-facing queries and behavior assertions for components, forms, validation helpers, Server Action boundaries, auth/session helpers, SEO helpers, and Prisma-backed workflows with suitable fakes or test data; browser-level E2E coverage can be added later for route smoke tests and async Server Component flows that Jest does not cover well.
