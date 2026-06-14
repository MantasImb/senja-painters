import type { PrismaClient } from "@/lib/generated/prisma/client";
import { getDb } from "@/lib/db";
import type {
  AnalyticsEventRecord,
  HoneypotSubmissionRecord,
  LeadSubmissionRepository,
} from "@/lib/lead-submission";

export function createPrismaLeadSubmissionRepository(
  db: PrismaClient = getDb(),
): LeadSubmissionRepository {
  return {
    async countSuccessfulSubmissions({ hashedIp, since }) {
      const aggregate = await db.rateLimitEntry.aggregate({
        _sum: {
          successfulSubmissionCount: true,
        },
        where: {
          hashedIp,
          windowStart: {
            gte: since,
          },
        },
      });

      return aggregate._sum.successfulSubmissionCount ?? 0;
    },

    async createHoneypotSubmission(submission) {
      await db.honeypotSubmission.create({
        data: mapHoneypotSubmission(submission),
      });
    },

    async createLead(lead) {
      const createdLead = await db.lead.create({
        data: {
          area: lead.area,
          consentGiven: lead.consentGiven,
          createdAt: lead.createdAt,
          desiredTimeframe: lead.desiredTimeframe,
          email: lead.email,
          hashedIp: lead.hashedIp,
          name: lead.name,
          phone: lead.phone,
          projectDescription: lead.projectDescription,
          propertyType: lead.propertyType,
          serviceType: lead.serviceType,
          sourcePage: lead.sourcePage,
          status: lead.status,
          statusEvents: {
            create: {
              newStatus: lead.status,
              changedAt: lead.createdAt,
            },
          },
          userAgent: lead.userAgent,
        },
        select: {
          id: true,
        },
      });

      return createdLead.id;
    },

    async incrementBlockedSubmission({ hashedIp, now }) {
      await upsertRateLimitEntry(db, {
        blockedSubmissionCount: 1,
        hashedIp,
        now,
        successfulSubmissionCount: 0,
      });
    },

    async incrementSuccessfulSubmission({ hashedIp, now }) {
      await upsertRateLimitEntry(db, {
        blockedSubmissionCount: 0,
        hashedIp,
        now,
        successfulSubmissionCount: 1,
      });
    },

    async recordAnalyticsEvent(event) {
      await db.analyticsEvent.create({
        data: mapAnalyticsEvent(event),
      });
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

function mapAnalyticsEvent(event: AnalyticsEventRecord) {
  return {
    createdAt: event.createdAt,
    hashedIp: event.hashedIp,
    metadata: event.metadata,
    name: event.name,
    page: event.page,
  };
}

async function upsertRateLimitEntry(
  db: PrismaClient,
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
  const windowStart = getRateLimitWindowStart(now);

  await db.rateLimitEntry.upsert({
    create: {
      blockedSubmissionCount,
      hashedIp,
      successfulSubmissionCount,
      windowStart,
    },
    update: {
      blockedSubmissionCount: {
        increment: blockedSubmissionCount,
      },
      successfulSubmissionCount: {
        increment: successfulSubmissionCount,
      },
    },
    where: {
      hashedIp_windowStart: {
        hashedIp,
        windowStart,
      },
    },
  });
}

function getRateLimitWindowStart(now: Date) {
  const windowStart = new Date(now);
  windowStart.setUTCMinutes(0, 0, 0);
  return windowStart;
}
