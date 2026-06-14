import type { PrismaClient } from "@/lib/generated/prisma/client";
import { getDb } from "@/lib/db";
import {
  buildAnalyticsSummary,
  listAdminLeads,
  type AdminAnalyticsRepository,
  type AdminLeadListItem,
  type AnalyticsTimeframe,
} from "@/lib/admin/admin-service";
import type { LeadStatus } from "@/lib/lead-submission";

export type AdminLeadDetail = AdminLeadListItem & {
  email: string | null;
  propertyType: string | null;
  desiredTimeframe: string | null;
  projectDescription: string;
  statusEvents: {
    id: string;
    previousStatus: LeadStatus | null;
    newStatus: LeadStatus;
    changedAt: Date;
  }[];
};

export async function getAdminLeads(status?: LeadStatus) {
  const leads = await getDb().lead.findMany({
    select: {
      area: true,
      createdAt: true,
      id: true,
      name: true,
      phone: true,
      serviceType: true,
      sourcePage: true,
      status: true,
    },
  });

  return listAdminLeads(leads, status);
}

export async function getAdminLeadDetail(id: string) {
  return getDb().lead.findUnique({
    where: { id },
    select: {
      area: true,
      createdAt: true,
      desiredTimeframe: true,
      email: true,
      id: true,
      name: true,
      phone: true,
      projectDescription: true,
      propertyType: true,
      serviceType: true,
      sourcePage: true,
      status: true,
      statusEvents: {
        orderBy: {
          changedAt: "desc",
        },
        select: {
          changedAt: true,
          id: true,
          newStatus: true,
          previousStatus: true,
        },
      },
    },
  });
}

export function createPrismaAdminLeadRepository(db: PrismaClient = getDb()) {
  return {
    async changeLeadStatus({
      changedAt,
      leadId,
      newStatus,
      previousStatus,
    }: {
      leadId: string;
      previousStatus: LeadStatus;
      newStatus: LeadStatus;
      changedAt: Date;
    }) {
      await db.$transaction([
        db.lead.update({
          data: {
            status: newStatus,
          },
          where: {
            id: leadId,
          },
        }),
        db.leadStatusEvent.create({
          data: {
            changedAt,
            leadId,
            newStatus,
            previousStatus,
          },
        }),
        db.analyticsEvent.create({
          data: {
            createdAt: changedAt,
            metadata: { leadId, newStatus, previousStatus },
            name: "lead_status_changed",
            page: "/admin",
          },
        }),
      ]);
    },
  };
}

export async function getAdminAnalyticsSummary(timeframe: AnalyticsTimeframe) {
  return buildAnalyticsSummary({
    now: new Date(),
    repository: createPrismaAdminAnalyticsRepository(),
    timeframe,
  });
}

function createPrismaAdminAnalyticsRepository(
  db: PrismaClient = getDb(),
): AdminAnalyticsRepository {
  return {
    async countBlockedSubmissions({ since }) {
      const aggregate = await db.rateLimitEntry.aggregate({
        _sum: {
          blockedSubmissionCount: true,
        },
        where: since
          ? {
              windowStart: {
                gte: since,
              },
            }
          : undefined,
      });

      return aggregate._sum.blockedSubmissionCount ?? 0;
    },
    async countHoneypotSubmissions({ since }) {
      return db.honeypotSubmission.count({
        where: since
          ? {
              createdAt: {
                gte: since,
              },
            }
          : undefined,
      });
    },
    async countLeads({ since }) {
      return db.lead.count({
        where: since
          ? {
              createdAt: {
                gte: since,
              },
            }
          : undefined,
      });
    },
    async listAnalyticsEvents({ since }) {
      return db.analyticsEvent.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
          id: true,
          name: true,
          page: true,
        },
        take: 100,
        where: since
          ? {
              createdAt: {
                gte: since,
              },
            }
          : undefined,
      });
    },
    async listLeadsBySourcePage({ since }) {
      const groupedLeads = await db.lead.groupBy({
        by: ["sourcePage"],
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            sourcePage: "desc",
          },
        },
        where: since
          ? {
              createdAt: {
                gte: since,
              },
            }
          : undefined,
      });

      return groupedLeads.map((leadGroup) => ({
        count: leadGroup._count._all,
        sourcePage: leadGroup.sourcePage,
      }));
    },
  };
}
