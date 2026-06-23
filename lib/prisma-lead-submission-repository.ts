import type { PrismaClient } from "@/lib/generated/prisma/client";
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
          landingPage: lead.landingPage,
          name: lead.name,
          pagesSeen: lead.pagesSeen,
          phone: lead.phone,
          projectDescription: lead.projectDescription,
          propertyType: lead.propertyType,
          serviceType: lead.serviceType,
          sessionId: lead.sessionId,
          sourcePage: lead.sourcePage,
          status: lead.status,
          statusEvents: {
            create: {
              newStatus: lead.status,
              changedAt: lead.createdAt,
            },
          },
          userAgent: lead.userAgent,
          visitorId: lead.visitorId,
        },
        select: {
          id: true,
        },
      });

      return createdLead.id;
    },

    async incrementBlockedSubmission({ hashedIp, now }) {
      await createRateLimitEntry(db, {
        blockedSubmissionCount: 1,
        hashedIp,
        now,
        successfulSubmissionCount: 0,
      });
    },

    async incrementSuccessfulSubmission({ hashedIp, now }) {
      await createRateLimitEntry(db, {
        blockedSubmissionCount: 0,
        hashedIp,
        now,
        successfulSubmissionCount: 1,
      });
    },

    async recordAnalyticsEvent(event) {
      await createAnalyticsEvent(db, event);
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
  await db.rateLimitEntry.create({
    data: {
      blockedSubmissionCount,
      hashedIp,
      successfulSubmissionCount,
      windowStart: now,
    },
  });
}
