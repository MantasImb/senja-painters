import {
  Prisma,
  type PrismaClient,
} from "@/lib/generated/prisma/client";
import { createAnalyticsEvent } from "@/lib/analytics/server";
import { getDb } from "@/lib/db";
import type {
  HoneypotSubmissionRecord,
  LeadSubmissionRepository,
} from "@/lib/lead-submission";

export function createPrismaLeadSubmissionRepository(
  db: PrismaClient = getDb(),
): LeadSubmissionRepository {
  return {
    async createHoneypotSubmission(submission) {
      await db.honeypotSubmission.create({
        data: mapHoneypotSubmission(submission),
      });
    },

    async createLeadWithinRateLimit(input) {
      return runSerializableTransactionWithRetry(async () =>
        db.$transaction(
          async (transaction) => {
            await transaction.$queryRaw`
              SELECT 1 AS "acquired"
              FROM (
                SELECT pg_advisory_xact_lock(
                  hashtextextended(${input.hashedIp}, 0)
                )
              ) AS "identity_lock"
            `;

            const aggregate = await transaction.rateLimitEntry.aggregate({
              _sum: {
                successfulSubmissionCount: true,
              },
              where: {
                hashedIp: input.hashedIp,
                windowStart: {
                  gte: input.since,
                },
              },
            });

            if ((aggregate._sum.successfulSubmissionCount ?? 0) >= 3) {
              await createRateLimitEntry(transaction, {
                blockedSubmissionCount: 1,
                hashedIp: input.hashedIp,
                now: input.now,
                successfulSubmissionCount: 0,
              });

              return {
                status: "blocked" as const,
              };
            }

            const createdLead = await transaction.lead.create({
              data: {
                area: input.lead.area,
                consentGiven: input.lead.consentGiven,
                createdAt: input.lead.createdAt,
                desiredTimeframe: input.lead.desiredTimeframe,
                email: input.lead.email,
                hashedIp: input.hashedIp,
                landingPage: input.lead.landingPage,
                name: input.lead.name,
                pagesSeen: input.lead.pagesSeen,
                phone: input.lead.phone,
                projectDescription: input.lead.projectDescription,
                propertyType: input.lead.propertyType,
                serviceType: input.lead.serviceType,
                sessionId: input.lead.sessionId,
                sourcePage: input.lead.sourcePage,
                status: input.lead.status,
                statusEvents: {
                  create: {
                    newStatus: input.lead.status,
                    changedAt: input.lead.createdAt,
                  },
                },
                userAgent: input.lead.userAgent,
                visitorId: input.lead.visitorId,
              },
              select: {
                id: true,
              },
            });

            await createRateLimitEntry(transaction, {
              blockedSubmissionCount: 0,
              hashedIp: input.hashedIp,
              now: input.now,
              successfulSubmissionCount: 1,
            });
            await createAnalyticsEvent(transaction, {
              ...input.analyticsEvent,
              hashedIp: input.hashedIp,
              metadata: {
                ...input.analyticsEvent.metadata,
                leadId: createdLead.id,
              },
            });

            return {
              leadId: createdLead.id,
              status: "created" as const,
            };
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        ),
      );
    },
  };
}

function mapHoneypotSubmission(submission: HoneypotSubmissionRecord) {
  return {
    createdAt: submission.createdAt,
    filledHoneypot: submission.filledHoneypot,
    hashedIp: submission.hashedIp,
    sourcePage: submission.sourcePage,
    submittedFields: submission.submittedFields,
    userAgent: submission.userAgent,
  };
}

async function createRateLimitEntry(
  db: Prisma.TransactionClient,
  {
    blockedSubmissionCount,
    hashedIp,
    now,
    successfulSubmissionCount,
  }: {
    blockedSubmissionCount: number;
    hashedIp: string;
    now: Date;
    successfulSubmissionCount: number;
  },
) {
  await db.rateLimitEntry.create({
    data: {
      blockedSubmissionCount,
      hashedIp,
      successfulSubmissionCount,
      windowStart: now,
    },
  });
}

async function runSerializableTransactionWithRetry<T>(
  operation: () => Promise<T>,
) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransactionConflict(error) || attempt === maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error("Serializable transaction retry limit exceeded");
}

function isTransactionConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}
