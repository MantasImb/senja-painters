# Phase 1 QA Guide: First Lead And Admin Happy Path

This guide is for manually inspecting the Phase 1 implementation from `plans/senja-painters-v1.md`.

## Scope Under Test

Phase 1 added:

- Public route behavior:
  - `/` redirects to `/no`
  - `/no` renders the accepted Senja Painters landing page prototype
  - `/no` includes the compact lead form
- Lead submission behavior:
  - Required fields: name, phone, area/city, service type, project description, consent
  - Optional fields: email, property type, desired timeframe
  - Draft persistence through `localStorage`
  - Consent is not persisted as checked
  - Prisma-backed lead creation
  - Source-page capture
  - Honeypot handling
  - Hashed-IP rate limiting
  - `lead_submitted` analytics event
- Admin behavior:
  - `/admin/login`
  - `/admin`
  - `/admin/leads/[id]`
  - Signed HTTP-only admin session cookie
  - Newest-first lead list
  - Status filters
  - Lead detail
  - Status updates and status history
  - Analytics summary
- Data model:
  - `Lead`
  - `LeadStatusEvent`
  - `AnalyticsEvent`
  - `RateLimitEntry`
  - `HoneypotSubmission`

## Files To Inspect

Core public UI:

- `components/site/SenjaHomePage.tsx`
- `components/forms/LeadForm.tsx`
- `components/site/PageViewBeacon.tsx`
- `app/page.tsx`
- `app/no/page.tsx`

Lead flow:

- `lib/actions/lead-actions.ts`
- `lib/lead-submission.ts`
- `lib/prisma-lead-submission-repository.ts`
- `lib/ip-identity.ts`

Admin:

- `app/admin/login/page.tsx`
- `app/admin/page.tsx`
- `app/admin/leads/[id]/page.tsx`
- `lib/actions/admin-actions.ts`
- `lib/admin/admin-auth.ts`
- `lib/admin/admin-session.ts`
- `lib/admin/admin-service.ts`
- `lib/admin/admin-repository.ts`

Database:

- `prisma/schema.prisma`
- `prisma/migrations/20260610000000_phase1_models/migration.sql`
- `lib/db.ts`
- `lib/env.ts`

Tests:

- `app/page.test.tsx`
- `components/forms/LeadForm.test.tsx`
- `lib/lead-submission.test.ts`
- `lib/admin/admin-session.test.ts`
- `lib/admin/admin-service.test.ts`

## Required Environment

Use a disposable development database. The QA steps below write records.

Required variables:

```sh
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="choose-a-test-password"
SESSION_SECRET="long-random-test-secret"
IP_HASH_SECRET="different-long-random-test-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Apply the schema before manual QA:

```sh
bunx prisma migrate deploy
bunx prisma generate
```

Start the app:

```sh
bun run dev
```

Expected local URL:

```text
http://localhost:3000
```

## Automated Verification

Run these before manual QA:

```sh
bun run test:unit
bun run lint
bunx tsc --noEmit
bun run build
```

Expected result:

- All Jest tests pass.
- ESLint exits cleanly.
- TypeScript exits cleanly.
- Production build succeeds.
- Build output shows `/` and `/no` as static, and `/admin`, `/admin/leads/[id]`, `/admin/login`, and `/api/analytics/page-view` as dynamic.

## Manual QA Checklist

### 1. Public Route And Homepage

1. Open `http://localhost:3000/`.
2. Confirm it redirects to `/no`.
3. Confirm the page is Norwegian-first and branded as `Senja Painters`.
4. Confirm the first viewport presents Senja Painters as serving Senja and Finnsnes.
5. Confirm the accepted prototype design is still recognizable:
   - Hero image remains full-bleed.
   - CTA buttons remain visible.
   - Service image cards remain present.
   - Contact form remains in the lower section.

Pass criteria:

- No starter-template content appears.
- No public phone number, public email, fake address, fake reviews, opening hours, certifications, or organization number appears.

### 2. Lead Form Fields

Open `/no` and inspect the form.

Required fields should be present:

- `Navn *`
- `Telefon *`
- `Område/by *`
- `Tjeneste *`
- `Prosjektbeskrivelse *`
- Consent checkbox

Optional fields should be present:

- `E-post`
- `Boligtype`
- `Ønsket tidspunkt`

Pass criteria:

- Email is visibly optional.
- Consent is unchecked on first load.
- The honeypot field is not visible during normal use.

### 3. Inline Validation

1. Try submitting an empty form.
2. Fill every required field except consent and submit.
3. Fill consent and submit.

Pass criteria:

- The form does not show native browser validation popovers.
- Empty required fields show readable inline field errors.
- Missing consent shows a readable inline field error.
- The summary alert says to check the fields and try again.
- The final valid submission proceeds.

### 4. Draft Persistence

1. Fill these fields but do not submit:
   - Name
   - Phone
   - Area/city
   - Service type
   - Project description
   - Optional fields if desired
2. Check the consent box.
3. Reload the page.

Pass criteria:

- Non-consent fields are restored.
- Consent is unchecked after reload.

### 5. Successful Lead Submission

1. Fill a valid form.
2. Leave email blank.
3. Submit.

Expected confirmation:

```text
Takk, foresporselen er mottatt. Senja Painters tar kontakt for a avklare prosjektet og neste steg.
```

The rendered UI uses Norwegian characters; the key QA point is that it says the request was received and that Senja Painters will contact the customer to clarify the project and next steps.

Pass criteria:

- Submission succeeds without email.
- Confirmation does not promise a specific response time such as `24 timer`, `i dag`, or `samme dag`.
- Draft fields clear after success.

Database checks:

- A `Lead` record exists.
- `email` is `null` when omitted.
- `sourcePage` is `/no`.
- `status` is `new`.
- No raw IP address is stored.
- A related initial `LeadStatusEvent` exists.
- A `lead_submitted` `AnalyticsEvent` exists.

### 6. Honeypot Submission

This requires either a browser devtools edit or a direct request that includes `companyWebsite`.

Submit a form where `companyWebsite` has a value.

Pass criteria:

- User-facing response looks like a successful submission.
- No `Lead` record is created.
- A `HoneypotSubmission` record is created.
- `HoneypotSubmission` includes submitted fields, source page, filled honeypot value, user agent, hashed IP identity, and created timestamp.
- No raw IP address is stored.

### 7. Rate Limiting

Submit four valid lead forms from the same client identity inside 24 hours.

Pass criteria:

- First three valid submissions create leads.
- Fourth submission returns a generic failure message.
- Fourth submission does not create a `Lead`.
- Fourth submission does not create a `HoneypotSubmission`.
- `RateLimitEntry.blockedSubmissionCount` increments.
- No raw IP address is stored.

Extra attention:

- The implementation buckets rate-limit rows by hour. Verify behavior around exact 24-hour boundaries if this matters before launch.

### 8. Admin Protection

1. Open `/admin` in a clean browser session.
2. Open `/admin/leads/<known-lead-id>` in a clean browser session.

Pass criteria:

- Both redirect to `/admin/login`.

### 9. Admin Login

1. Open `/admin/login`.
2. Submit an invalid password.
3. Submit the configured `ADMIN_PASSWORD`.

Pass criteria:

- Invalid password does not grant access.
- Invalid password records `admin_login_failed`.
- Valid password redirects to `/admin`.
- Valid password records `admin_login_success`.
- Browser receives an HTTP-only admin session cookie.
- No `AdminUser` database model exists.

### 10. Admin Dashboard

Open `/admin` after login.

Pass criteria:

- Dashboard shows:
  - Total page views
  - Total leads
  - Conversion rate
  - Honeypot count
  - Rate-limited count
  - Views by page
  - Leads by source page
  - Recent events
- Timeframe controls are present:
  - `7 dager`
  - `30 dager`
  - `Alle`
- Leads are newest first.
- Status filter controls are present:
  - `new`
  - `contacted`
  - `sent_to_partner`
  - `closed`
  - `spam`

### 11. Lead Detail

Open a lead from the dashboard.

Pass criteria:

- Lead detail shows:
  - Name
  - Phone
  - Email or `Ikke oppgitt`
  - Area/city
  - Service type
  - Property type or `Ikke oppgitt`
  - Desired timeframe or `Ikke oppgitt`
  - Source page
  - Created timestamp
  - Project description
- Status history is visible.

### 12. Status Update

1. Open a lead detail page.
2. Change the status to each approved value:
   - `new`
   - `contacted`
   - `sent_to_partner`
   - `closed`
   - `spam`
3. Return to dashboard and use filters.

Pass criteria:

- Status persists after reload.
- A `LeadStatusEvent` is created for each status change.
- A `lead_status_changed` analytics event is created.
- Dashboard filters reflect the updated status.
- `sent_to_partner` behaves only as a manual label; no partner accounts, assignment, notifications, or partner workflow appears.

### 13. Page View Analytics

1. Open `/no` in a browser.
2. Wait briefly for the client beacon.

Pass criteria:

- A `page_view` `AnalyticsEvent` is created.
- `page` is `/no`.
- IP identity is hashed.
- No third-party analytics script is loaded for this feature.
- The production build still prerenders `/no` as static.

## Database Inspection Queries

Use Prisma Studio if preferred:

```sh
bunx prisma studio
```

Tables to inspect:

- `Lead`
- `LeadStatusEvent`
- `AnalyticsEvent`
- `RateLimitEntry`
- `HoneypotSubmission`

Suggested SQL checks:

```sql
SELECT id, name, email, "sourcePage", status, "createdAt"
FROM "Lead"
ORDER BY "createdAt" DESC;
```

```sql
SELECT "leadId", "previousStatus", "newStatus", "changedAt"
FROM "LeadStatusEvent"
ORDER BY "changedAt" DESC;
```

```sql
SELECT name, page, "hashedIp", "createdAt"
FROM "AnalyticsEvent"
ORDER BY "createdAt" DESC;
```

```sql
SELECT "hashedIp", "successfulSubmissionCount", "blockedSubmissionCount", "windowStart"
FROM "RateLimitEntry"
ORDER BY "windowStart" DESC;
```

```sql
SELECT "sourcePage", "filledHoneypot", "hashedIp", "createdAt"
FROM "HoneypotSubmission"
ORDER BY "createdAt" DESC;
```

Privacy pass criteria:

- No table contains a raw IP address column.
- `hashedIp` values are hashes, not readable IP strings.

## Current Inspection Notes

Observed implementation status:

- The accepted homepage prototype was preserved by moving it into `components/site/SenjaHomePage.tsx`.
- `/` now redirects to `/no`.
- The lead form is a client island with local draft persistence.
- Server-side lead validation is centralized in `lib/lead-submission.ts` and uses Zod.
- Prisma access is centralized through `lib/db.ts`.
- Admin auth uses a signed custom cookie and has no `AdminUser` table.
- Admin Server Actions call `requireAdminSession()` before protected mutations.
- Page views are recorded through a first-party route handler and client beacon.
- Tests exist for the most important behavior boundaries.

Areas to inspect carefully before launch:

- Real database migration against the intended Railway development database.
- Full form submission in a real browser against a real database.
- Admin login and status updates against a real database.
- Rate-limit behavior around exact 24-hour boundaries.
- Phase 2 public links in the footer point to pages that are not implemented yet, which is expected for Phase 1 but should be handled in Phase 2.

Decisions already made during Phase 1:

- Generated Prisma client files under `lib/generated/prisma/` are ignored by Git and generated locally or in build steps.
- The public lead form and admin login form use `noValidate` so validation messages are rendered by the app instead of native browser popovers.

## Known Out Of Scope For Phase 1

- `/no/senja`
- `/no/finnsnes`
- `/no/innvendig-maling`
- `/no/utvendig-maling`
- `/no/mobelmaling`
- `/no/kontakt`
- `/no/personvern`
- Sitemap, robots, canonical metadata, Open Graph, and JSON-LD hardening
- Partner accounts or partner assignment
- Admin notes, export, search, email notifications, scheduling, quotes, payments, or CMS editing
