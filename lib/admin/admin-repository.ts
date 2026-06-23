import { Prisma, type PrismaClient } from "@/lib/generated/prisma/client";
import { getDb } from "@/lib/db";
import { createAnalyticsEvent } from "@/lib/analytics/server";
import {
  buildAnalyticsSummary,
  listAdminLeads,
  type AdminAnalyticsRepository,
  type AdminLeadListItem,
  type AnalyticsTimeframe,
} from "@/lib/admin/admin-service";
import type { LeadStatus } from "@/lib/lead-submission";

const pageViewEventName = "page_view";

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
    }: {
      leadId: string;
      newStatus: LeadStatus;
      changedAt: Date;
    }) {
      await db.$transaction(async (transaction) => {
        const lead = await transaction.lead.findUnique({
          select: {
            status: true,
          },
          where: {
            id: leadId,
          },
        });

        if (!lead) {
          throw new Error("Lead not found");
        }

        if (lead.status === newStatus) {
          return;
        }

        await transaction.lead.update({
          data: {
            status: newStatus,
          },
          where: {
            id: leadId,
          },
        });
        await transaction.leadStatusEvent.create({
          data: {
            changedAt,
            leadId,
            newStatus,
            previousStatus: lead.status,
          },
        });
        await createAnalyticsEvent(transaction, {
          createdAt: changedAt,
          metadata: {
            leadId,
            newStatus,
            previousStatus: lead.status,
          },
          name: "lead_status_changed",
          page: "/admin",
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
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
    async countPageViews({ since }) {
      return db.analyticsEvent.count({
        where: pageViewWhere(since),
      });
    },
    async countSessions({ since }) {
      return countDistinctPageViewIdentity(
        db,
        Prisma.sql`COALESCE("sessionId", "visitorId", "hashedIp", "id")`,
        since,
      );
    },
    async countUniqueVisitors({ since }) {
      return countDistinctPageViewIdentity(
        db,
        Prisma.sql`COALESCE("visitorId", "hashedIp", "id")`,
        since,
      );
    },
    async listRecentAnalyticsEvents({ limit, since }) {
      return db.analyticsEvent.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
          hashedIp: true,
          id: true,
          landingPage: true,
          name: true,
          page: true,
          sessionId: true,
          visitorId: true,
        },
        where: since
          ? {
              createdAt: {
                gte: since,
              },
            }
          : undefined,
      });
    },
    async listSessionsByLandingPage({ since }) {
      const rows = await db.$queryRaw<
        { landingPage: string; count: bigint | number }[]
      >`
        SELECT
          COALESCE("landingPage", "page", 'ukjent') AS "landingPage",
          COUNT(DISTINCT COALESCE("sessionId", "visitorId", "hashedIp", "id")) AS "count"
        FROM "AnalyticsEvent"
        WHERE "name" = ${pageViewEventName}::"AnalyticsEventName"
        ${createdAtSqlCondition(since)}
        GROUP BY COALESCE("landingPage", "page", 'ukjent')
        ORDER BY "count" DESC, "landingPage" ASC
      `;

      return rows.map((row) => ({
        count: numberFromSqlCount(row.count),
        landingPage: row.landingPage,
      }));
    },
    async listViewsByPage({ since }) {
      const groupedEvents = await db.analyticsEvent.groupBy({
        by: ["page"],
        _count: {
          _all: true,
        },
        orderBy: [
          {
            _count: {
              page: "desc",
            },
          },
          {
            page: "asc",
          },
        ],
        where: {
          ...pageViewWhere(since),
          page: {
            not: null,
          },
        },
      });

      return groupedEvents.map((eventGroup) => ({
        count: eventGroup._count._all,
        page: eventGroup.page ?? "ukjent",
      }));
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
    async listLeadsByLandingPage({ since }) {
      const leads = await db.lead.findMany({
        select: {
          landingPage: true,
          sourcePage: true,
        },
        where: since
          ? {
              createdAt: {
                gte: since,
              },
            }
          : undefined,
      });

      const counts = new Map<string, number>();

      for (const lead of leads) {
        const landingPage = lead.landingPage ?? lead.sourcePage;
        counts.set(landingPage, (counts.get(landingPage) ?? 0) + 1);
      }

      return Array.from(counts.entries())
        .map(([landingPage, count]) => ({ landingPage, count }))
        .sort((a, b) => b.count - a.count || a.landingPage.localeCompare(b.landingPage));
    },
  };
}

async function countDistinctPageViewIdentity(
  db: PrismaClient,
  identitySql: Prisma.Sql,
  since?: Date,
) {
  const rows = await db.$queryRaw<{ count: bigint | number }[]>`
    SELECT COUNT(DISTINCT ${identitySql}) AS "count"
    FROM "AnalyticsEvent"
    WHERE "name" = ${pageViewEventName}::"AnalyticsEventName"
    ${createdAtSqlCondition(since)}
  `;

  return numberFromSqlCount(rows[0]?.count ?? 0);
}

function pageViewWhere(since?: Date) {
  return {
    name: "page_view" as const,
    ...(since
      ? {
          createdAt: {
            gte: since,
          },
        }
      : {}),
  };
}

function createdAtSqlCondition(since?: Date) {
  return since ? Prisma.sql`AND "createdAt" >= ${since}` : Prisma.empty;
}

function numberFromSqlCount(value: bigint | number) {
  return typeof value === "bigint" ? Number(value) : value;
}
