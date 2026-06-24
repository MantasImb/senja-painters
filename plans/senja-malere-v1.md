# Plan: Senja Malere V1

> Source PRD: [docs/prd.md](../docs/prd.md)

## Current repository context

Repo facts:

- The app is a small Next.js project using Next 16, React 19, TypeScript, and Tailwind 4.
- The public app has moved beyond the create-next-app starter and now serves the Norwegian Senja Malere experience.
- The repo includes Prisma schema/migrations, a server-only database layer, admin routes, analytics helpers, and Jest-based tests.
- The PRD currently lives under `docs/prd.md`.

PRD requirements:

- Build a Norwegian-first public website for Senja Malere, focused on Senja and Finnsnes.
- Store submitted Painting Leads in Railway Postgres using Prisma.
- Protect the internal admin dashboard with one environment-based admin password.
- Keep content static in code for V1.
- Track V1 analytics through a small internal observability module.
- Avoid unsupported business claims such as fake reviews, fake address, organization number, opening hours, certifications, or years in business.

Current implementation state:

- The repository has working public Painting Lead, admin authentication, status workflow, spam protection, analytics, public content, and SEO boundaries.
- The remaining phases are retained as an implementation record and verification checklist, not as evidence that unchecked functionality is absent.

## Architectural decisions

Durable decisions that apply across all phases:

- **Brand**: The public brand is Senja Malere.
- **Market**: V1 targets Norway, specifically Senja and Finnsnes.
- **Language**: Norwegian is the primary V1 language. English and `next-intl` are deferred to V2.
- **Positioning**: The site presents Senja Malere as a new professional painting business ready for work, not as a generic lead marketplace.
- **Routes**: V1 public pages are locale-prefixed under `/no`: `/no`, `/no/senja`, `/no/finnsnes`, `/no/innvendig-maling`, `/no/utvendig-maling`, `/no/mobelmaling`, `/no/kontakt`, and `/no/personvern`. `/` redirects to `/no`.
- **Localized slugs**: Page identity uses internal content keys separate from public pathnames, so future English routes can use localized slugs such as `/en/interior-painting` rather than reusing Norwegian slug text.
- **Admin routes**: Admin routes are not localized and remain under `/admin`.
- **Public contact**: Public contact is form-only. V1 does not show a public phone number or public email address.
- **Lead form**: The shared compact form appears on major public pages and collects required name, phone, area/city, service type, project description, and consent. Email, property type, and desired timeframe are optional.
- **Draft behavior**: Lead form drafts persist in localStorage, but consent is not silently restored as checked. Drafts clear after successful submission.
- **Painting Lead storage**: Prisma is used to store Painting Leads in Railway Postgres.
- **Schema migrations**: Prisma schema and committed `prisma/migrations` files are the database schema source of truth. Local schema changes use Prisma Migrate, and deployed environments apply pending migrations with `bunx prisma migrate deploy`.
- **Database boundary**: Application code accesses Prisma through a single server-only database module, such as `lib/db.ts`. UI components do not import Prisma directly.
- **Project structure**: Keep the App Router at root `app/`. Shared UI primitives live in `components/ui/`, public site sections in `components/site/`, form UI in `components/forms/`, server and domain utilities in `lib/`, and Prisma schema/migrations in `prisma/`. V1 does not introduce a `src/` directory.
- **Key models**: V1 models are Lead, LeadStatusEvent, AnalyticsEvent, RateLimitEntry, and HoneypotSubmission.
- **Lead statuses**: Status values are new, contacted, sent_to_partner, closed, and spam.
- **Partner status restraint**: `sent_to_partner` is only a manual lead status label in V1. It does not introduce partner accounts, partner assignment, notifications, or partner workflow functionality.
- **Admin auth**: V1 has no AdminUser model. Admin access uses `ADMIN_PASSWORD` and `SESSION_SECRET`.
- **Admin sessions**: Admin auth uses a custom signed, HTTP-only cookie session with minimal claims, an HMAC signature, and a default 12-hour expiry. Protected admin pages and Server Actions verify the session before reading or mutating admin-only data.
- **Admin authorization**: Every admin route and every admin Server Action must verify the signed admin session. Admin pages redirect unauthenticated users to `/admin/login`, and actions repeat authorization instead of relying on the page render as the only security boundary.
- **Environment**: Required environment variables are `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `IP_HASH_SECRET`, and `NEXT_PUBLIC_SITE_URL`. `SESSION_SECRET` signs admin session cookies. `IP_HASH_SECRET` hashes client IP identity for rate limiting and privacy-preserving analytics.
- **Deployment workflow**: Vercel deploys prepare the configured database before building and serving the app with `bun run vercel-build`, which runs Prisma Client generation, pending migrations, and the normal build.
- **Database environments**: V1 uses two Railway Postgres databases. Production uses its own database, while development, preview, and tests share one non-production database. Database-backed tests may write to the shared non-production database without cleanup, so test-created records should be clearly recognizable and the non-production database must be treated as disposable.
- **Analytics boundary**: Analytics is isolated behind a small internal observability module.
- **Analytics collection**: V1 analytics is server-recorded where possible without forcing public SEO pages into dynamic rendering. Page views should be recorded through a first-party client beacon or another mechanism that preserves static public page rendering, while lead/admin events are recorded inside Server Actions after successful operations. V1 does not use third-party analytics scripts or client fingerprinting.
- **Analytics events**: V1 tracks page_view, lead_submitted, admin_login_success, admin_login_failed, and lead_status_changed.
- **Honeypot visibility**: V1 admin analytics only shows aggregate honeypot submission counts. Detailed honeypot inspection is done directly in the database if needed.
- **Rate-limit visibility**: V1 admin analytics only shows aggregate rate-limited submission counts. Rate-limited submission payloads are not stored.
- **Privacy**: Analytics and rate limiting store hashed or anonymized IP information and session-scoped browser attribution IDs for best-effort grouping, not raw IP addresses.
- **Browser attribution**: Browser analytics identifiers are scoped to the current browser session and stored as session data, not as a persistent cross-session analytics identifier before consent.
- **IP identity**: IP identity is derived from the best trusted Vercel/request client IP signal available to the server, such as Vercel-overwritten `x-forwarded-for` or a platform helper. The raw IP value is used only in memory to compute the hash and is never persisted. If no client IP can be determined, the submission uses a stable `unknown` rate-limit bucket.
- **Spam protection**: V1 uses a honeypot field and IP-hash rate limiting of 3 successful submissions per hashed IP in the preceding rolling 24 hours. Filled honeypot submissions are stored in a separate HoneypotSubmission table for spam monitoring and never create or mutate records in the main Lead table. Honeypot-triggered submissions return the same success response as valid submissions, while only writing to HoneypotSubmission. HoneypotSubmission stores submitted form fields, source page, filled honeypot value, user agent, hashed IP identity, and created timestamp, but not raw IP addresses. When the rate limit is exceeded, the form returns a generic failure message without revealing rate-limit internals. Rate-limited submissions do not create Lead or HoneypotSubmission records; RateLimitEntry timestamps successful and blocked attempts for rolling-window and aggregate-pressure calculations. Third-party anti-spam widgets are out of scope.
- **SEO**: V1 includes unique page titles, meta descriptions, canonical URLs, Open Graph metadata, sitemap, robots, WebSite JSON-LD, and a simple LocalBusiness JSON-LD graph when verified business facts are available.
- **SEO restraint**: LocalBusiness structured data may describe Senja Malere as a service-area business with `areaServed` and no physical address. It may include service area and the V1 painting services, but omits opening hours unless they are also made visible in public page content. The site should not assume eligibility for Google LocalBusiness rich results that require an address. V1 excludes fake reviews, ratings, fake address, organization number, fake opening hours, public phone, public email, certifications, and Google Business Profile links before those facts are real, public, and supported by visible site content.
- **Content**: Content is static in code. V1 copy is organized in typed static content modules, such as `lib/content/`, rather than being hardcoded directly across page components. This keeps Norwegian-first content easy to review and gives V2 a cleaner migration path to `next-intl` message files. No CMS, admin content editing, blog, or gallery system is included in V1.
- **SEO metadata ownership**: SEO metadata lives with the typed content modules. Each page content object includes metadata such as title, description, pathname, and Open Graph copy where needed, and page files use shared metadata helpers to generate canonical URLs from `NEXT_PUBLIC_SITE_URL`. Sitemap entries and future language alternates are generated from the typed route/content metadata rather than duplicated manually in individual page files.
- **Photos**: No real Senja Malere project photos are available yet. V1 uses the approved decorative home, interior, exterior, and cabinetry photos under `public/` for visual context, without presenting them as Senja Malere projects, completed work, local properties, or before/after evidence. Real project photos should be used selectively when available.
- **Media storage**: V1 stores approved decorative imagery and future verified project photos as static assets under `public/` and renders them with `next/image`. No external media bucket, CMS media library, or upload flow is included in V1.
- **UI foundation**: V1 uses shadcn/ui with Radix-backed primitives, repo-owned components, Tailwind 4 CSS variables, and Lucide icons for accessible public and admin UI.
- **Mutation boundary**: Public lead submissions and admin mutations use Next.js Server Actions with server-side validation, Prisma persistence, and authorization checks inside protected actions. Route Handlers are reserved for API-shaped endpoints.
- **Runtime boundary**: Server Actions, Prisma access, admin auth/session handling, analytics, rate limiting, and route handlers that touch application data use the Node.js runtime. Edge runtime is deferred unless a later lightweight use case justifies edge-compatible database and runtime constraints.
- **Public rendering**: Public SEO pages should remain static and prerenderable as much as possible. Public page rendering should avoid request-time database reads, cookies, headers, or analytics writes that force dynamic rendering. Admin pages and mutation endpoints may be dynamic.
- **Client islands**: SEO pages use a prerendered Server Component shell with selective Client Components for browser-only behavior such as lead-form draft persistence and analytics beacons.
- **Validation boundary**: Zod validates Server Action inputs and environment variables. Zod schemas are authoritative before writes and protected mutations, and app-owned validation messaging is preferred where native browser validation UI cannot be made readable and consistent.
- **Environment boundary**: Environment variables are parsed through a centralized Zod-backed module, such as `lib/env.ts`, which exposes typed server and public config values. Application code should not read `process.env` directly outside this boundary. Build/framework configuration may read it directly, while runtime checks such as `NODE_ENV` are exposed through helpers in `lib/env.ts`.
- **Form validation presentation**: Server-side Zod schemas are authoritative for lead and admin form validation. The public lead form and admin login form use app-owned inline validation instead of native browser validation popovers, because native popovers are not reliably styleable and caused unreadable contrast in the accepted UI.
- **Test foundation**: V1 uses Jest with `next/jest`, `jest-environment-jsdom`, React Testing Library, `@testing-library/jest-dom`, and `@testing-library/user-event` for component behavior, validation helpers, Server Action boundaries, auth/session helpers, and browser-local interactions. The current Bruno collection provides a deployment-facing homepage smoke check; additional public-route, API-handler, and health checks can be added when operationally useful. Tests should prefer accessible, user-facing queries and behavior assertions where UI is involved; browser-level E2E coverage is deferred until route smoke tests or async Server Component flows justify it.
- **Package manager**: Bun is used for dependency installation, lockfile management, and project scripts. `bun.lock` is the source-of-truth lockfile, and npm, pnpm, or Yarn lockfiles should not be introduced.
- **Deferred workflows**: English routes, Google Business Profile support, partner accounts, lead assignment, notes, export, search, email notifications, payments, quotes, scheduling, and calendar workflows are out of scope for V1.

---

## Phase 1: First Lead And Admin Happy Path

**User stories**: 1, 3, 5, 6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 29, 30

### What to build

Replace the starter homepage with a Norwegian Senja Malere landing page and build the minimal internal admin path needed to operate real Painting Leads from day one. The slice should include the compact lead form, client-side draft persistence, validation, explicit consent handling, Prisma-backed Painting Lead creation, source-page capture, draft clearing, spam controls, and a clear confirmation that Senja Malere will contact the Homeowner to clarify the Painting Project and next steps.

The admin slice should include password login, signed admin session, protected dashboard, newest-first Painting Lead list, status filters, Painting Lead detail, status updates with status history, and a simple analytics summary for the metrics already decided. It should not add notes, export, search, partner assignment, email notifications, or a full honeypot inbox.

The confirmation copy should avoid promising a specific response time.

This phase should establish the V1 database shape needed for leads, status history, analytics events, rate limiting, and honeypot monitoring. Public SEO page expansion can still happen after the operational lead/admin path exists.

Implementation note: Phase 1 is implemented. The manual QA guide in `docs/v1-qa.md` tracks the current inspection path.

### Acceptance criteria

- [x] The homepage renders Norwegian Senja Malere content instead of starter-template content.
- [x] The homepage presents Senja Malere as a local painting business serving Senja and Finnsnes.
- [x] The compact lead form includes all required and optional V1 lead fields.
- [x] Email can be omitted while the form still submits successfully.
- [x] Name, phone, area/city, service type, project description, and consent are required.
- [x] Consent requires an intentional action and is not restored as checked after reload.
- [x] Non-consent draft fields persist when navigating or reloading before submission.
- [x] A successful submission stores a lead in the database with the correct source page.
- [x] The form draft clears after successful submission.
- [x] The homeowner sees a confirmation after submission.
- [x] Confirmation copy does not promise a specific response time.
- [x] Admin routes are inaccessible without login.
- [x] A valid `ADMIN_PASSWORD` grants access to the admin dashboard.
- [x] An invalid password does not grant access.
- [x] Painting Leads appear newest first in the admin dashboard.
- [x] The Site Owner can filter Painting Leads by status.
- [x] The Site Owner can open a Painting Lead detail view with submitted contact and project information.
- [x] The Site Owner can update Painting Lead status to new, contacted, sent_to_partner, closed, or spam.
- [x] Status updates persist and create LeadStatusEvent records.
- [x] Simple admin analytics shows total page views, total leads, conversion rate, views by page, leads by source page, honeypot submission count, rate-limited submission count, and recent events for the selected timeframe.
- [x] Tests cover required fields, optional email, consent, source-page capture, persistence, successful lead creation, draft clearing, admin login, protected admin access, lead review, status updates, and simple analytics summary behavior.

---

## Phase 2: Core Public Pages

**User stories**: 2, 4, 11, 12, 13, 14, 15, 29

### What to build

Add the V1 public page set around the already-working lead flow: Senja, Finnsnes, innvendig maling, utvendig maling, møbelmaling, Kontakt, and Personvern. Each page should use static Norwegian content, have a distinct purpose, include the compact form where appropriate, and preserve the same successful lead submission behavior from Phase 1.

The location and service pages should be locally useful rather than thin duplicates. Real project photos should be integrated tastefully if available, without a heavy gallery or unsupported before/after claims.

### Acceptance criteria

- [x] Senja and Finnsnes location pages exist with distinct Norwegian local content.
- [x] Innvendig maling, utvendig maling, and møbelmaling service pages exist with distinct Norwegian service content.
- [x] The Kontakt page provides the same form-only contact path without showing a public phone number or email address.
- [x] The Personvern page explains what information is collected, why it is collected, and how analytics and rate limiting avoid raw IP storage.
- [x] Major public pages include the compact full lead form.
- [x] Painting Leads submitted from each major page capture the correct source page.
- [x] The navigation lets visitors reach the core location, service, contact, and privacy pages.
- [x] The page designs use approved decorative imagery without presenting it as project evidence and can accept verified real project photos later.
- [x] Tests verify that core pages render expected Norwegian headings, service or location positioning, and the lead form.

---

## Phase 3: Search And Metadata Foundation

**User stories**: 14, 15, 27, 28

### What to build

Make the public page set search-conscious without adding unsupported business claims. Every public page should expose appropriate metadata for its specific search intent, and the site should include sitemap, robots, canonical URLs, Open Graph metadata, and JSON-LD.

This phase should include WebSite JSON-LD and a simple service-area LocalBusiness JSON-LD graph when verified business facts are available. Google Business Profile support and richer LocalBusiness fields remain deferred until those facts are real, public, and supported by visible site content.

### Acceptance criteria

- [x] Each public page has a unique Norwegian title and meta description.
- [x] Canonical URLs are generated from `NEXT_PUBLIC_SITE_URL`.
- [x] Open Graph metadata is present and aligned with each page.
- [x] Sitemap includes all V1 public pages.
- [x] Robots behavior is defined for public and admin routes.
- [x] WebSite JSON-LD is present.
- [x] LocalBusiness JSON-LD is present as a service-area business with `areaServed` and V1 painting services.
- [x] LocalBusiness JSON-LD omits opening hours unless those hours are also visible in public page content.
- [x] Metadata does not include fake reviews, ratings, fake address, organization number, fake opening hours, public phone, public email, certifications, or Google Business Profile links.
- [x] Tests verify titles, descriptions, canonical metadata, sitemap behavior, robots behavior, and structured-data restraint.

---

## Phase 4: Admin Review Hardening

**User stories**: 17, 20

### What to build

Review and harden the admin path introduced in Phase 1. The Site Owner can log in with the environment-based admin password, reach a protected dashboard, see submitted Painting Leads sorted newest first, filter by status, and open a Painting Lead detail view.

This phase should not add new admin product scope. It should close gaps left by Phase 1, improve tests, and keep notes, search, export, partner assignment, email notifications, and a full honeypot inbox out of V1.

### Acceptance criteria

- [x] Admin routes are inaccessible without login.
- [x] A valid `ADMIN_PASSWORD` grants access to the admin dashboard.
- [x] An invalid password does not grant access.
- [x] Session behavior uses `SESSION_SECRET`.
- [x] Painting Leads appear newest first in the admin dashboard.
- [x] The Site Owner can filter Painting Leads by status.
- [x] The Site Owner can open a Painting Lead detail view with submitted contact and project information.
- [x] No AdminUser model is introduced.
- [x] Tests cover inaccessible dashboard, valid login, invalid login, newest-first ordering, status filters, and lead detail visibility.

---

## Phase 5: Lead Status Workflow Hardening

**User stories**: 18, 19

### What to build

Review and harden the Painting Lead status workflow introduced in Phase 1. Each status change should persist the new status and create a status-history event so the Site Owner can see when the Painting Lead changed state.

This phase should use only the approved V1 status values and should not add partner assignment, admin notes, search, or export.

The `sent_to_partner` status is only a manual label and must not introduce partner accounts, assignment, notifications, or partner workflow behavior in V1.

### Acceptance criteria

- [x] The Site Owner can update a Painting Lead status to new, contacted, sent_to_partner, closed, or spam.
- [x] Status updates persist and are visible after reload.
- [x] Each status change creates a LeadStatusEvent.
- [x] Lead detail shows status history in chronological or reverse-chronological order.
- [x] Status filters reflect updated lead states.
- [x] Invalid or unsupported status values are rejected.
- [x] Tests cover status updates, persistence, history creation, filter behavior, and unsupported status rejection.

---

## Phase 6: Spam And Privacy Controls

**User stories**: 24, 25

### What to build

Add basic V1 spam protection to the public submission path while keeping data collection restrained. The form should include a honeypot field, and repeated submissions from the same hashed IP identity should be rate limited to 3 successful submissions in the preceding rolling 24 hours. Each successful or blocked attempt is timestamped in `RateLimitEntry`, allowing the rolling boundary to be evaluated without storing raw IP addresses. Filled honeypot submissions should be stored separately from real Painting Leads so the Site Owner can monitor spam pressure without polluting the lead workflow.

This phase should protect the lead database without introducing reCAPTCHA, Cloudflare Turnstile, or any third-party anti-spam widget.

### Acceptance criteria

- [x] Public forms include a honeypot field that normal visitors do not interact with.
- [x] Honeypot submissions create HoneypotSubmission records without creating valid Painting Leads.
- [x] HoneypotSubmission records do not appear in the main Painting Lead workflow.
- [x] Honeypot-triggered submissions return the same success response as valid submissions.
- [x] HoneypotSubmission stores submitted form fields, source page, filled honeypot value, user agent, hashed IP identity, and created timestamp.
- [x] HoneypotSubmission does not store raw IP addresses.
- [x] Repeated submissions from the same hashed identity are rate limited.
- [x] The rate limit allows 3 successful submissions per hashed IP in the preceding rolling 24 hours.
- [x] Rate-limit failures return a generic message without exposing rate-limit internals.
- [x] Rate-limited submissions do not create Lead or HoneypotSubmission records.
- [x] RateLimitEntry timestamps successful and blocked attempts so aggregate pressure and the rolling window can be calculated.
- [x] Normal submissions are not blocked unnecessarily.
- [x] RateLimitEntry stores hashed identity data only.
- [x] IP identity is derived from a trusted Vercel/request client IP signal when available.
- [x] Raw IP values are used only in memory to compute hashed identity and are never persisted.
- [x] Requests without a determinable client IP use a stable `unknown` rate-limit bucket.
- [x] Raw IP addresses are not stored in Painting Leads, rate-limit entries, or analytics events.
- [x] Tests cover honeypot handling, rolling rate limiting, normal submission behavior, and raw-IP privacy boundaries.

---

## Phase 7: Internal Analytics Hardening

**User stories**: 21, 22, 23, 30

### What to build

Review and harden the internal observability layer and admin analytics summary introduced in Phase 1. The site should track page views, lead submissions, admin login success, admin login failure, and lead status changes. The dashboard should summarize traffic and conversions over last 7 days, last 30 days, and all time, grouped by page and source page where relevant.

This phase should keep analytics internal and Prisma-backed. Google Analytics, Plausible, PostHog, Vercel Analytics, and similar services remain out of scope for V1.

### Acceptance criteria

- [x] Analytics is isolated behind a small internal observability module.
- [x] Page views are tracked for public pages without forcing public SEO pages into dynamic rendering.
- [x] Painting Lead submissions are tracked after successful Painting Lead creation.
- [x] Admin login success and failure are tracked.
- [x] Painting Lead status changes are tracked.
- [x] AnalyticsEvent stores hashed or anonymized IP information and session-scoped browser attribution data only.
- [x] Admin analytics shows total page views, total Painting Leads, and conversion rate.
- [x] Admin analytics supports last 7 days, last 30 days, and all-time filters.
- [x] Admin analytics shows views by page, Painting Leads by source page, and recent events.
- [x] Admin analytics shows aggregate honeypot submission counts.
- [x] Admin analytics shows aggregate rate-limited submission counts.
- [x] V1 does not include a full honeypot submission inbox.
- [x] Tests cover page-view tracking, Painting Lead submission tracking, conversion-rate calculation, timeframe filters, grouped metrics, recent events, and raw-IP privacy boundaries.
