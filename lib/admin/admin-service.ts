import { leadStatuses, type LeadStatus } from "@/lib/lead-submission";

export type AdminLeadListItem = {
  id: string;
  createdAt: Date;
  name: string;
  phone: string;
  area: string;
  serviceType: string;
  sourcePage: string;
  status: LeadStatus;
};

export type AdminLeadRepository = {
  changeLeadStatus(input: {
    leadId: string;
    previousStatus: LeadStatus;
    newStatus: LeadStatus;
    changedAt: Date;
  }): Promise<void>;
};

export type AnalyticsEventListItem = {
  id: string;
  name: string;
  page: string | null;
  hashedIp: string | null;
  visitorId: string | null;
  sessionId: string | null;
  landingPage: string | null;
  createdAt: Date;
};

export type AdminAnalyticsRepository = {
  countBlockedSubmissions(input: { since?: Date }): Promise<number>;
  countHoneypotSubmissions(input: { since?: Date }): Promise<number>;
  countLeads(input: { since?: Date }): Promise<number>;
  countPageViews(input: { since?: Date }): Promise<number>;
  countSessions(input: { since?: Date }): Promise<number>;
  countUniqueVisitors(input: { since?: Date }): Promise<number>;
  listRecentAnalyticsEvents(input: {
    since?: Date;
    limit: number;
  }): Promise<AnalyticsEventListItem[]>;
  listSessionsByLandingPage(input: {
    since?: Date;
  }): Promise<{ landingPage: string; count: number }[]>;
  listViewsByPage(input: { since?: Date }): Promise<{ page: string; count: number }[]>;
  listLeadsBySourcePage(input: {
    since?: Date;
  }): Promise<{ sourcePage: string; count: number }[]>;
  listLeadsByLandingPage(input: {
    since?: Date;
  }): Promise<{ landingPage: string; count: number }[]>;
};

export type AnalyticsTimeframe = "7d" | "30d" | "all";

export function listAdminLeads(
  leads: AdminLeadListItem[],
  status?: LeadStatus,
) {
  return leads
    .filter((lead) => (status ? lead.status === status : true))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function updateLeadStatus(
  {
    leadId,
    newStatus,
    previousStatus,
  }: {
    leadId: string;
    newStatus: string;
    previousStatus: LeadStatus;
  },
  {
    changedAt,
    repository,
  }: {
    changedAt: Date;
    repository: AdminLeadRepository;
  },
) {
  if (!isLeadStatus(newStatus)) {
    throw new Error(`Unsupported lead status: ${newStatus}`);
  }

  await repository.changeLeadStatus({
    changedAt,
    leadId,
    newStatus,
    previousStatus,
  });
}

export async function buildAnalyticsSummary({
  now,
  repository,
  timeframe,
}: {
  now: Date;
  repository: AdminAnalyticsRepository;
  timeframe: AnalyticsTimeframe;
}) {
  const since = getTimeframeStart(now, timeframe);
  const [
    totalPageViews,
    totalSessions,
    totalUniqueVisitors,
    viewsByPage,
    landingPagesBySession,
    recentEvents,
    totalLeads,
    leadsBySourcePage,
    leadsByLandingPage,
    honeypotCount,
    blockedCount,
  ] = await Promise.all([
    repository.countPageViews({ since }),
    repository.countSessions({ since }),
    repository.countUniqueVisitors({ since }),
    repository.listViewsByPage({ since }),
    repository.listSessionsByLandingPage({ since }),
    repository.listRecentAnalyticsEvents({ since, limit: 10 }),
    repository.countLeads({ since }),
    repository.listLeadsBySourcePage({ since }),
    repository.listLeadsByLandingPage({ since }),
    repository.countHoneypotSubmissions({ since }),
    repository.countBlockedSubmissions({ since }),
  ]);

  return {
    conversionRate:
      totalSessions > 0 ? Math.round((totalLeads / totalSessions) * 10000) / 100 : 0,
    honeypotSubmissionCount: honeypotCount,
    landingPagesBySession,
    leadsByLandingPage,
    leadsBySourcePage,
    rateLimitedSubmissionCount: blockedCount,
    recentEvents,
    totalLeads,
    totalPageViews,
    totalSessions,
    totalUniqueVisitors,
    viewsByPage,
  };
}

function getTimeframeStart(now: Date, timeframe: AnalyticsTimeframe) {
  if (timeframe === "all") {
    return undefined;
  }

  const days = timeframe === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function isLeadStatus(status: string): status is LeadStatus {
  return leadStatuses.includes(status as LeadStatus);
}
