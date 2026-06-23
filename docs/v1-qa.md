# V1 QA Guide

Manual inspection path for the current public, Painting Lead, admin, spam-control, and analytics behavior.

## Public Lead Flow

- Open `/no` and confirm the page presents Senja Malere in Norwegian.
- Submit the Painting Lead form with required fields only: name, phone, area/city, service type, project description, and consent.
- Confirm email, property type, and desired timeframe can be omitted.
- Confirm the success message says the request was received without promising a response time.
- Reload or navigate before submission and confirm non-consent draft fields persist.
- Confirm consent is not restored as checked after reload.
- Confirm a successful submission clears the draft.

## Spam And Privacy

- Submit with the hidden honeypot field filled and confirm the user-facing response still looks successful.
- Confirm honeypot submissions do not create Painting Leads.
- Submit repeatedly from the same hashed identity and confirm rate limiting returns the generic failure message after the configured threshold.
- Confirm raw IP addresses are not stored in lead, analytics, honeypot, or rate-limit records.

## Admin Flow

- Open `/admin` without a session and confirm it redirects to `/admin/login`.
- Try an invalid admin password and confirm access is denied.
- Log in with `ADMIN_PASSWORD` and confirm the dashboard loads.
- Confirm Painting Leads appear newest first and can be filtered by Lead Status.
- Open a Painting Lead detail page and confirm submitted contact/project fields are visible.
- Change a Lead Status and confirm the update persists and creates status history.

## Analytics

- Visit public pages and confirm page-view events are recorded without making public pages dynamic.
- Submit a Painting Lead and confirm a `lead_submitted` event is recorded.
- Confirm admin login success and failure events are recorded.
- Confirm lead status changes record `lead_status_changed`.
- Confirm the dashboard shows page views, best-effort visitors, visits, leads, conversion, grouped page/source metrics, honeypot count, blocked count, and recent events for each timeframe.
