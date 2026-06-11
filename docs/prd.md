# PRD: Senja Painters V1

## Problem Statement

People in Senja and Finnsnes need a simple way to request professional painting help without calling around, comparing unclear options, or navigating a cluttered contractor website.

Senja Painters needs a Norwegian-first website that can rank for local painting searches, present the new brand as ready for work, collect qualified painting leads through a form, and let an internal admin review those leads. The first version should be minimal, credible, SEO-conscious, and ready to expand later with more locations, English content, Google Business Profile support, and partner/painter workflows.

## Solution

Build a Norwegian-first Next.js website for the new brand **Senja Painters**, focused on painting services in Senja and Finnsnes.

The public site will present Senja Painters as a local painting business, not as a generic referral marketplace. Users can submit painting requests through embedded forms on major pages and a dedicated contact page. Submitted leads are stored in a Railway Postgres database using Prisma.

The internal admin dashboard will be protected by a single environment-based admin password. Admin users can review leads, update lead statuses, and see simple analytics for page views, leads, and conversion rate.

The first implementation slice should include both the public lead path and the minimal admin path needed to operate those leads. Admin should not be postponed behind the full public page set.

V1 will keep content static in code, use conservative SEO metadata, track analytics through a small internal observability layer, and avoid unsupported business claims such as fake reviews, fake address, organization number, opening hours, or certifications.

## User Stories

1. As a homeowner in Senja, I want to find a local painter online, so that I can request help without calling multiple companies.

2. As a homeowner in Finnsnes, I want to understand whether Senja Painters serves my area, so that I know my request is relevant.

3. As a visitor, I want the website to be written primarily in Norwegian, so that it feels local and easy to understand.

4. As a visitor, I want to see painting services clearly divided into innvendig maling, utvendig maling, and møbelmaling, so that I can choose the service that matches my project.

5. As a visitor, I want to submit my name, phone number, area, service type, project description, and consent, so that Senja Painters can contact me about the job.

6. As a visitor, I want email to be optional, so that I can submit a request using only phone contact.

7. As a visitor, I want to optionally include property type and desired timeframe, so that the painter can better understand my project before contacting me.

8. As a visitor, I want the form to preserve my typed information if I navigate to another page, so that I do not lose progress accidentally.

9. As a visitor, I want the consent checkbox to require an intentional action, so that I understand what happens when I submit my information.

10. As a visitor, I want a confirmation after submitting the form, so that I know the request was received.

11. As a visitor, I want to see real project photos used tastefully, so that the site feels credible without becoming an overwhelming gallery.

12. As a visitor, I want practical information about painting work in Senja and Finnsnes, so that the site feels specific to my local context.

13. As a visitor, I want a clear privacy page, so that I understand what information is collected and why.

14. As a search user, I want location-specific pages for Senja and Finnsnes, so that search results lead me to relevant local content.

15. As a search user, I want service-specific pages for interior painting, exterior painting, and furniture painting, so that I can land on a page matching my intent.

16. As the site owner, I want leads stored in a database, so that requests are not lost and can be reviewed later.

17. As the site owner, I want an admin dashboard, so that I can see new painting requests without relying on email notifications.

18. As the site owner, I want to update lead statuses, so that I can track whether a lead is new, contacted, sent onward, closed, or spam.

19. As the site owner, I want lead status history, so that I can see when a lead changed state.

20. As the site owner, I want a simple admin login, so that the dashboard is not public.

21. As the site owner, I want analytics for page views and lead submissions, so that I can compare traffic against actual conversion.

22. As the site owner, I want analytics grouped by time period, so that I can compare last 7 days, last 30 days, and all-time performance.

23. As the site owner, I want views by page and leads by source page, so that I can understand which pages generate demand.

24. As the site owner, I want basic spam protection, so that automated submissions do not pollute the lead database.

25. As the site owner, I want IP-based rate limiting without storing raw IP addresses, so that abuse can be limited while keeping data collection restrained.

26. As the site owner, I want the architecture to support English in V2, so that the site can later add an English language option with next-intl.

27. As the site owner, I want Google Business Profile support deferred, so that V1 can launch before the business profile exists.

28. As the site owner, I want conservative structured data, so that the site does not make unsupported business claims before organization details are available.

29. As an implementer, I want page content to be static in code for V1, so that the project avoids CMS complexity.

30. As an implementer, I want observability code isolated behind a small analytics API, so that V1 analytics can later be expanded or replaced.

## Implementation Decisions

- The brand is **Senja Painters**.

- The V1 market is Norway, focused on **Senja** and **Finnsnes**.

- The website is Norwegian-first. English support is deferred to V2 using `next-intl`.

- Public V1 routes are locale-prefixed with `/no` from the start. `/` redirects to `/no`, and future English routes can be added under `/en` without moving existing Norwegian URLs.

- Page identity uses internal content keys separate from public pathnames, so future English routes can use localized slugs such as `/en/interior-painting` rather than reusing Norwegian slug text.

- V1 presents Senja Painters as a new professional painting business ready for work, not as a generic lead marketplace.

- V1 must avoid inventing unavailable business details such as organization number, physical address, public phone number, opening hours, reviews, certifications, or years in business. LocalBusiness structured data may describe Senja Painters as a service-area business with `areaServed` and no physical address. Opening hours are omitted from V1 structured data unless they are also made visible in public page content.

- Public contact is form-only. No public phone number or public email is shown in V1.

- After form submission, the site tells the customer that the request was received and that Senja Painters will contact them to clarify the project and next steps. V1 does not promise a specific response time.

- V1 location pages are limited to:
  - Senja
  - Finnsnes

- Nearby cities/areas are deferred until each page can have distinct useful content.

- V1 service pages are limited to:
  - Innvendig maling
  - Utvendig maling
  - Møbelmaling

- Public pages include:
  - `/no`
  - `/no/senja`
  - `/no/finnsnes`
  - `/no/innvendig-maling`
  - `/no/utvendig-maling`
  - `/no/mobelmaling`
  - `/no/kontakt`
  - `/no/personvern`
  - Admin login/dashboard routes

- Admin routes are not localized and remain under `/admin`.

- Major public pages include the same compact full lead form.

- The lead form uses client-side draft persistence with localStorage.

- Form drafts are cleared after successful submission.

- Consent is not silently persisted as checked after reload; the user must intentionally consent before submitting.

- Lead form fields:
  - Required: name, phone, area/city, service type, project description, consent
  - Optional: email, property type, desired timeframe

- Content is static in code for V1. No CMS is included.

- V1 copy is organized in typed static content modules, such as `lib/content/`, rather than being hardcoded directly across page components. This keeps Norwegian-first content easy to review and gives V2 a cleaner migration path to `next-intl` message files.

- SEO metadata lives with the typed content modules. Each page content object includes metadata such as title, description, pathname, and Open Graph copy where needed, and page files use shared metadata helpers to generate canonical URLs from `NEXT_PUBLIC_SITE_URL`.

- Real project photos should be used selectively:
  - one strong hero/project image if available
  - a small number of supporting project photos
  - no heavy gallery in V1
  - no fake before/after claims unless the photos truly support them

- No real project photos are available yet. V1 should be designed so real photos can be added later without changing the content model or layout strategy, and it should avoid fake, stock, or unsupported project imagery.

- V1 stores real project photos as static assets under `public/` and renders them with `next/image`. No external media bucket, CMS media library, or upload flow is included in V1.

- Visual direction is friendly/local with professional polish.

- V1 uses shadcn/ui with Radix-backed primitives as the standard UI foundation for accessible public forms, navigation controls, dialogs, filters, tables, and admin screens.

- Public lead submissions and admin mutations use Next.js Server Actions with server-side validation and Prisma persistence. Route Handlers are reserved for API-shaped endpoints such as metadata, analytics beacons if needed, and future webhooks.

- Server Actions, Prisma access, admin auth/session handling, analytics, rate limiting, and route handlers that touch application data use the Node.js runtime. Edge runtime is deferred unless a later lightweight use case justifies edge-compatible database and runtime constraints.

- Public SEO pages should remain static and prerenderable as much as possible. Public page rendering should avoid request-time database reads, cookies, headers, or analytics writes that force dynamic rendering. Admin pages and mutation endpoints may be dynamic.

- SEO pages use a prerendered Server Component shell with selective Client Components for browser-only behavior such as lead-form draft persistence and analytics beacons.

- Zod is used for Server Action input validation and environment variable parsing. Server-side schemas are authoritative before Prisma writes or protected mutations run. The public lead form and admin login form render app-owned inline validation instead of native browser validation popovers so error text remains readable and consistent with the accepted UI.

- Environment variables are parsed through a centralized Zod-backed module, such as `lib/env.ts`, which exposes typed server and public config values. Application code should not read `process.env` directly outside this boundary, except framework configuration files when needed.

- Bun is the project package manager for dependency installation, lockfile management, and scripts. The repository should keep `bun.lock` as the package-manager source of truth and avoid npm, pnpm, or Yarn lockfiles.

- Hosting stack:
  - Vercel for the Next.js app
  - Railway Postgres for the database
  - Prisma for database client and migrations

- Vercel deploys prepare the configured database before building and serving the app by running Prisma Client generation and pending migrations, for example `bunx prisma generate && bunx prisma migrate deploy && bun run build`.

- Database environments use two Railway Postgres databases: production uses its own database, while development, preview, and tests share one non-production database. Database-backed tests may write to the shared non-production database without cleanup, so test-created records should be clearly recognizable and the non-production database must be treated as disposable.

- Required environment variables:
  - `DATABASE_URL`
  - `ADMIN_PASSWORD`
  - `SESSION_SECRET`
  - `IP_HASH_SECRET`
  - `NEXT_PUBLIC_SITE_URL`

- `SESSION_SECRET` and `IP_HASH_SECRET` are separate required secrets. `SESSION_SECRET` signs admin session cookies. `IP_HASH_SECRET` hashes client IP identity for rate limiting and privacy-preserving analytics.

- Prisma is used for lead storage, analytics events, rate limiting, and lead status history.

- Prisma schema and committed `prisma/migrations` files are the database schema source of truth. Local schema changes use Prisma Migrate, and deployed environments apply pending migrations with `bunx prisma migrate deploy`. Generated Prisma client files under `lib/generated/prisma/` are ignored by Git and regenerated locally or during build.

- Application code accesses Prisma through a single server-only database module, such as `lib/db.ts`. UI components do not import Prisma directly.

- Project structure keeps the App Router at root `app/`. Shared UI primitives live in `components/ui/`, public site sections in `components/site/`, form UI in `components/forms/`, server and domain utilities in `lib/`, and Prisma schema/migrations in `prisma/`. V1 does not introduce a `src/` directory.

- V1 database models:
  - Lead
  - LeadStatusEvent
  - AnalyticsEvent
  - RateLimitEntry
  - HoneypotSubmission

- No AdminUser model in V1. Admin access uses one environment-based password.

- Admin sessions use a custom signed, HTTP-only cookie backed by `ADMIN_PASSWORD` and `SESSION_SECRET`. The cookie stores only minimal admin-session claims, such as role, issued time, expiry, and an HMAC signature, with a default 12-hour expiry. Protected admin pages and Server Actions verify the session before reading or mutating admin-only data.

- Every admin route and every admin Server Action must verify the signed admin session. Admin pages redirect unauthenticated users to `/admin/login`, and actions repeat authorization instead of relying on the page render as the only security boundary.

- No partner/painter tables in V1.

- No CMS/content tables in V1.

- Lead status values:
  - new
  - contacted
  - sent_to_partner
  - closed
  - spam

- `sent_to_partner` is only a manual lead status label in V1. It does not introduce partner accounts, partner assignment, notifications, or partner workflow functionality.

- The admin dashboard includes:
  - password login
  - lead list sorted newest first
  - lead detail view
  - status update
  - status filters
  - simple analytics summary
  - timeframe filter for last 7 days, last 30 days, and all time

- Admin is included from the first implementation slice, but remains limited to the decided V1 capabilities. It does not include notes, export, search, partner assignment, email notifications, or a full honeypot inbox.

- Notes, export, search, and partner assignment are deferred.

- Analytics is implemented through a small internal observability module.

- V1 analytics is server-recorded where possible without forcing public SEO pages into dynamic rendering. Page views should be recorded through a first-party client beacon or another mechanism that preserves static public page rendering, while lead/admin events are recorded inside Server Actions after successful operations.

- V1 does not use third-party analytics scripts or client fingerprinting.

- V1 analytics tracks:
  - page_view
  - lead_submitted
  - admin_login_success
  - admin_login_failed
  - lead_status_changed

- Analytics stores hashed/anonymized IP information, not raw IP addresses.

- Hashed IP identity is used only where rate limiting or event grouping requires it.

- Rate limiting uses hashed IP identity.

- IP identity is derived from the best trusted Vercel/request client IP signal available to the server, such as Vercel-overwritten `x-forwarded-for` or a platform helper. The raw IP value is used only in memory to compute the hash and is never persisted. If no client IP can be determined, the submission uses a stable `unknown` rate-limit bucket.

- Analytics dashboard shows:
  - total page views
  - total leads
  - conversion rate
  - views by page
  - leads by source page
  - honeypot submission count
  - rate-limited submission count
  - recent events
  - timeframe filter

- V1 admin analytics only shows aggregate honeypot submission counts. Detailed honeypot inspection is done directly in the database if needed.

- V1 admin analytics only shows aggregate rate-limited submission counts. Rate-limited submission payloads are not stored.

- Spam protection uses:
  - honeypot field
  - IP-hash rate limiting of 3 successful submissions per hashed IP per 24 hours

- Filled honeypot submissions are stored in a separate `HoneypotSubmission` table for spam monitoring and never create or mutate records in the main `Lead` table.

- Honeypot-triggered submissions return the same success response as valid submissions, while only writing to `HoneypotSubmission`.

- `HoneypotSubmission` stores submitted form fields, source page, filled honeypot value, user agent, hashed IP identity, and created timestamp. It does not store raw IP addresses.

- When the rate limit is exceeded, the form returns a generic failure message without revealing rate-limit internals.

- Rate-limited submissions do not create `Lead` or `HoneypotSubmission` records. `RateLimitEntry` keeps an aggregate blocked-submission counter for the current hashed identity/window so admin analytics can show rate-limit pressure without storing blocked submission payloads.

- V1 SEO includes:
  - unique page titles
  - unique meta descriptions
  - canonical URLs
  - Open Graph metadata
  - sitemap
  - robots file
  - WebSite JSON-LD
  - a simple LocalBusiness JSON-LD graph when verified business facts are available
  - unique Norwegian page content

- Canonical URLs, sitemap entries, and future language alternates are generated from the typed route/content metadata rather than duplicated manually in individual page files.

- V1 SEO does not include:
  - fake reviews
  - fake ratings
  - fake address
  - fake organization number
  - fake opening hours
  - Google Business Profile link before the profile exists

- Google Business Profile is deferred to V1.1/V1.2.

- LocalBusiness structured data may include service area and the V1 painting services. It does not include physical address or opening hours in V1, and the site should not assume eligibility for Google LocalBusiness rich results that require an address. Reviews, ratings, public phone, public email, organization number, certifications, and Google Business Profile links remain excluded until those facts are real, public, and supported by visible site content.

- English routes, translations, and hreflang are deferred until V2.

## Testing Decisions

- Tests should verify external behavior rather than implementation details.

- V1 uses Jest with `next/jest`, `jest-environment-jsdom`, React Testing Library, `@testing-library/jest-dom`, and `@testing-library/user-event` as the default test foundation.

- Tests should prefer accessible, user-facing queries such as role, label text, and visible text.

- Browser-level E2E tests are deferred until route smoke tests, async Server Component flows, or full admin workflows justify Playwright-style coverage.

- Public page tests should verify that core pages render the expected Norwegian headings, service/location positioning, and lead form.

- SEO tests should verify that key pages expose titles, descriptions, canonical metadata, and sitemap/robots behavior.

- Lead form tests should verify:
  - required fields
  - optional email behavior
  - consent requirement
  - successful submission creates a lead
  - source page is captured
  - draft data clears after successful submission

- Spam protection tests should verify:
  - honeypot submissions are rejected or ignored
  - rate limiting blocks repeated submissions from the same hashed identity
  - normal submissions are not blocked unnecessarily

- Admin auth tests should verify:
  - dashboard is inaccessible without login
  - valid password grants access
  - invalid password does not grant access
  - failed login is tracked as an analytics event

- Admin dashboard tests should verify:
  - leads appear newest first
  - status filters work
  - status updates persist
  - status history is created when status changes

- Analytics tests should verify:
  - page views are tracked
  - lead submissions are tracked
  - conversion rate is calculated correctly
  - timeframe filters produce expected aggregates
  - raw IP addresses are not stored

- Database tests should verify Prisma model behavior around leads, status events, analytics events, and rate limit entries.

- Privacy-related tests should verify that analytics and rate limiting use hashed IP values rather than raw IP storage.

## Out of Scope

- Building the actual website implementation during the PRD phase.

- English language support.

- next-intl implementation.

- Google Business Profile creation or integration.

- Reviews, ratings, public phone, public email, organization number, certifications, or Google Business Profile integration in structured data before those facts are real, public, and supported by visible site content.

- Public phone or email contact.

- Email notifications.

- CMS or admin content editing.

- Multiple admin users.

- Painter/partner accounts.

- Partner lead assignment workflow.

- Search, export, or admin notes.

- Full gallery or portfolio system.

- Nearby city pages beyond Senja and Finnsnes.

- Blog/content marketing system.

- Payment, quotes, invoices, scheduling, or calendar integration.

- reCAPTCHA, Cloudflare Turnstile, or third-party anti-spam widgets.

- Google Analytics, Plausible, PostHog, or Vercel Analytics integration in V1.

## Further Notes

The site should prioritize honest local credibility. Since Senja Painters is a new brand without organization details, Google Business Profile, reviews, or current project photos, V1 should lean on clear service descriptions, local relevance, simple UX, and a strong contact flow. Real project photos can be added later when available.

The SEO strategy should avoid thin duplicated location pages. Senja and Finnsnes are included in V1 because they are the core target areas. Nearby city pages should be added only when they can contain distinct, useful local content.

The architecture should stay minimal but not throw away future extensibility. The observability module, Prisma schema, static content structure, and route choices should make V1 fast to launch while keeping room for English localization, Google Business Profile support, richer structured data, and partner workflows later.
