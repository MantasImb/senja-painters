# Phase 6: Atomic Rate Limiting

## Status

Phase 6 requires Senja Malere to accept at most three successful Painting Lead
submissions from one hashed IP identity during the preceding rolling 24 hours.
The original implementation calculated that limit correctly for a single
request, but the complete decision was not atomic.

This document explains why that is a correctness problem, how it can appear in
production, and the invariant the implementation now enforces.

The issue is resolved by `createLeadWithinRateLimit` in
`lib/prisma-lead-submission-repository.ts`. The public form and Server Action
contract did not change.

## Original submission sequence

For a valid, non-honeypot form submission, the application originally
performed these database operations separately:

1. Sum successful `RateLimitEntry` records for the hashed identity during the
   preceding 24 hours.
2. If the sum is at least three, insert a blocked-attempt `RateLimitEntry` and
   return a generic failure.
3. Otherwise, insert a successful-attempt `RateLimitEntry`.
4. Create the Painting Lead and its initial status event.
5. Create the `lead_submitted` analytics event.

Each operation was individually valid. The problem was that no transaction or
lock protected the sequence as one decision.

## The race condition

Assume one hashed identity already has two successful submissions in the
rolling window. Two requests, A and B, arrive at nearly the same time.

| Time | Request A | Request B |
| --- | --- | --- |
| 1 | Counts two successful submissions | |
| 2 | | Counts two successful submissions |
| 3 | Decides the request is allowed | |
| 4 | | Decides the request is allowed |
| 5 | Records a successful attempt and creates a Painting Lead | |
| 6 | | Records a successful attempt and creates a Painting Lead |

Both requests made their decision from the same stale count. The final result
is four successful submissions in the rolling window even though the specified
limit is three.

This is a time-of-check/time-of-use race:

- The **check** reads the number of successful submissions.
- The **use** records another successful submission and creates a Painting
  Lead.
- Another request can change the relevant state between those operations.

Normal database isolation does not make separate transactions behave as one
operation. A serverless deployment also makes process-local locks unsuitable:
concurrent requests may execute in different Node.js processes or deployment
instances.

## A second consistency failure

The successful-attempt record was inserted before the Painting Lead. If
Painting Lead creation failed after that insert, the homeowner received an
error but still lost one of the three allowed submissions.

That produces a false successful count:

- no Painting Lead exists;
- no successful user outcome occurred;
- the rate-limit history says that a successful submission occurred.

Repeated database failures could therefore block a homeowner who has not
successfully submitted three Painting Leads.

## Required invariant

For each valid, non-honeypot submission, the database must commit exactly one
of these outcomes:

### Allowed outcome

- the rolling-window successful count was below three while the identity's
  decision was protected from concurrent requests;
- one Painting Lead was created;
- one successful-attempt `RateLimitEntry` was created;
- the `lead_submitted` analytics event was created;
- all writes commit together.

### Blocked outcome

- the rolling-window successful count was already three or more;
- no Painting Lead or honeypot record was created;
- one blocked-attempt `RateLimitEntry` was created;
- the caller receives the generic failure response.

If any write in the allowed outcome fails, none of its writes may remain
committed.

## Database-level serialization

The decision must be serialized at the PostgreSQL boundary for each hashed
identity. The selected design uses a transaction-scoped PostgreSQL advisory
lock derived from the already-hashed identity:

1. Start an interactive Prisma transaction.
2. Acquire the transaction-scoped advisory lock for the hashed identity.
3. Count successful attempts in the exact preceding 24-hour window.
4. Record and return the blocked outcome when the count is at least three.
5. Otherwise create the Painting Lead, successful-attempt record, and
   analytics event inside the same transaction.
6. Commit, which also releases the advisory lock.

Requests for different hashed identities can proceed independently. Requests
for the same identity wait for the current transaction to commit, then repeat
the count against the newly committed state.

The application must use parameterized Prisma raw SQL for the lock key. Raw IP
addresses must never be passed to or stored by this operation; only the HMAC
hashed identity crosses the repository boundary.

## Implemented resolution

The repository now owns the complete allowed-or-blocked decision behind
`createLeadWithinRateLimit`.

For each valid non-honeypot submission it:

1. opens a Prisma interactive transaction at `Serializable` isolation;
2. acquires a PostgreSQL transaction-scoped advisory lock derived from the
   hashed identity;
3. counts successful attempts at or after the exact rolling-window boundary;
4. creates only a blocked-attempt record when the limit is full;
5. otherwise creates the Painting Lead, successful-attempt record, and
   analytics event in the same transaction;
6. retries Prisma `P2034` write-conflict failures up to three transaction
   attempts.

Painting Lead creation occurs before the successful-attempt insert. More
importantly, both writes belong to the same transaction, so any later failure
rolls back the complete allowed outcome.

## Verification requirements

Automated tests should demonstrate these observable behaviors:

- when concurrent requests share one hashed identity and only one slot remains,
  exactly one creates a Painting Lead and the other is blocked;
- a failed Painting Lead transaction does not consume a successful-submission
  slot;
- the fourth successful submission in the rolling 24-hour window is blocked;
- a submission exactly outside the 24-hour boundary no longer counts;
- blocked requests do not create Painting Leads or honeypot records;
- persisted rate-limit identity values are hashed and contain no raw IP
  address.

Deployment verification should additionally confirm that the committed Prisma
migrations are applied before exercising the live submission path.
