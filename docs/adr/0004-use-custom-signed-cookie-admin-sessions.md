# Use custom signed cookie admin sessions

Status: accepted

Senja Painters V1 will protect admin routes with a custom signed, HTTP-only cookie session backed by `ADMIN_PASSWORD` and `SESSION_SECRET`. The session cookie will contain only minimal admin-session claims, such as role, issued time, expiry, and an HMAC signature, with a default 12-hour expiry. This matches the single-admin-password requirement without introducing an auth provider, OAuth flow, or `AdminUser` database model; protected Server Actions must verify the admin session before reading or mutating admin-only data.
