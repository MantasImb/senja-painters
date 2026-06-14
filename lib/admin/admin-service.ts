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
  createdAt: Date;
};

export type AdminAnalyticsRepository = {
  countBlockedSubmissions(input: { since?: Date }): Promise<number>;
  countHoneypotSubmissions(input: { since?: Date }): Promise<number>;
  countLeads(input: { since?: Date }): Promise<number>;
  listAnalyticsEvents(input: { since?: Date }): Promise<AnalyticsEventListItem[]>;
  listLeadsBySourcePage(input: {
    since?: Date;
  }): Promise<{ sourcePage: string; count: number }[]>;
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
  const [events, totalLeads, leadsBySourcePage, honeypotCount, blockedCount] =
    await Promise.all([
      repository.listAnalyticsEvents({ since }),
      repository.countLeads({ since }),
      repository.listLeadsBySourcePage({ since }),
      repository.countHoneypotSubmissions({ since }),
      repository.countBlockedSubmissions({ since }),
    ]);
  const pageViewEvents = events.filter((event) => event.name === "page_view");
  const totalPageViews = pageViewEvents.length;

  return {
    conversionRate:
      totalPageViews > 0 ? Math.round((totalLeads / totalPageViews) * 10000) / 100 : 0,
    honeypotSubmissionCount: honeypotCount,
    leadsBySourcePage,
    rateLimitedSubmissionCount: blockedCount,
    recentEvents: events
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10),
    totalLeads,
    totalPageViews,
    viewsByPage: countEventsByPage(pageViewEvents),
  };
}

function countEventsByPage(events: AnalyticsEventListItem[]) {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (!event.page) {
      continue;
    }

    counts.set(event.page, (counts.get(event.page) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count || a.page.localeCompare(b.page));
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
