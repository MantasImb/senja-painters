# Use Server Actions for app mutations

Status: accepted

Senja Painters V1 will use Next.js Server Actions for public lead submissions and admin mutations. The project is intentionally a single Next.js application rather than a separate public API, so form and dashboard writes should use the framework's server mutation path with server-side validation, Prisma persistence, and authorization checks inside protected actions; Route Handlers remain reserved for API-shaped endpoints such as metadata files, analytics beacons if needed, and future webhooks.
