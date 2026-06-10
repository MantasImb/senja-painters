# Use Bruno for HTTP E2E Automation

Status: accepted

Senja Painters V1 will use Bruno collections for scriptable HTTP-level E2E and smoke checks that can be run locally by maintainers and by Codex. Bruno tests cover public route availability, API-shaped route handlers, health checks, and deployment-facing request/response behavior.

Jest with React Testing Library remains the default harness for component behavior, validation helpers, Server Action boundaries, auth/session helpers, and browser-local interactions such as form draft persistence. Bruno should not be used to test browser-only UI behavior, and it should not depend on private Next.js Server Action transport details.

The shared local runner starts the Next.js dev server when needed and runs the committed Bruno collection against `BASE_URL`, defaulting to `http://127.0.0.1:3000`.

Bruno is intentionally separate from the default Jest test suite and the Vercel build command. Vercel builds should run the configured build command only; Bruno checks should run alongside normal checks locally or as a separate post-deploy/preview-check step against a running URL.
