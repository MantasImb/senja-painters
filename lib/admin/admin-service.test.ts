import {
  buildAnalyticsSummary,
  listAdminLeads,
  updateLeadStatus,
  type AdminAnalyticsRepository,
  type AdminLeadRepository,
} from "./admin-service";

function createLead(overrides: Partial<Parameters<typeof listAdminLeads>[0][number]> = {}) {
  return {
    id: "lead_1",
    createdAt: new Date("2026-06-10T12:00:00.000Z"),
    name: "Kari Test",
    phone: "900 00 000",
    area: "Finnsnes",
    serviceType: "Innvendig maling",
    sourcePage: "/no",
    status: "new" as const,
    ...overrides,
  };
}

describe("listAdminLeads", () => {
  it("returns leads newest first and filters by status", () => {
    const older = createLead({
      id: "old",
      createdAt: new Date("2026-06-09T12:00:00.000Z"),
      status: "contacted",
    });
    const newer = createLead({
      id: "new",
      createdAt: new Date("2026-06-10T12:00:00.000Z"),
      status: "new",
    });

    expect(listAdminLeads([older, newer])).toEqual([newer, older]);
    expect(listAdminLeads([older, newer], "contacted")).toEqual([older]);
  });
});

describe("updateLeadStatus", () => {
  it("persists approved status updates and creates status history plus analytics", async () => {
    const events: unknown[] = [];
    const repository: AdminLeadRepository = {
      async changeLeadStatus(input) {
        events.push(input);
      },
    };

    await updateLeadStatus(
      {
        leadId: "lead_1",
        newStatus: "contacted",
        previousStatus: "new",
      },
      {
        changedAt: new Date("2026-06-10T12:00:00.000Z"),
        repository,
      },
    );

    expect(events).toEqual([
      {
        changedAt: new Date("2026-06-10T12:00:00.000Z"),
        leadId: "lead_1",
        newStatus: "contacted",
        previousStatus: "new",
      },
    ]);
  });

  it("rejects unsupported lead statuses", async () => {
    const repository: AdminLeadRepository = {
      async changeLeadStatus() {
        throw new Error("should not persist");
      },
    };

    await expect(
      updateLeadStatus(
        {
          leadId: "lead_1",
          newStatus: "unsupported",
          previousStatus: "new",
        },
        {
          changedAt: new Date("2026-06-10T12:00:00.000Z"),
          repository,
        },
      ),
    ).rejects.toThrow(/unsupported/i);
  });
});

describe("buildAnalyticsSummary", () => {
  it("summarizes visitors, sessions, page views, landing pages, leads, conversion, honeypots, blocked submissions, and recent events", async () => {
    const repository: AdminAnalyticsRepository = {
      async countBlockedSubmissions() {
        return 2;
      },
      async countHoneypotSubmissions() {
        return 1;
      },
      async countLeads() {
        return 2;
      },
      async listAnalyticsEvents() {
        return [
          {
            id: "event_1",
            name: "page_view",
            page: "/no",
            hashedIp: "hash_1",
            visitorId: "visitor_1",
            sessionId: "session_1",
            landingPage: "/no",
            createdAt: new Date("2026-06-10T12:00:00.000Z"),
          },
          {
            id: "event_2",
            name: "page_view",
            page: "/no/senja",
            hashedIp: "hash_1",
            visitorId: "visitor_1",
            sessionId: "session_1",
            landingPage: "/no",
            createdAt: new Date("2026-06-10T12:01:00.000Z"),
          },
          {
            id: "event_3",
            name: "page_view",
            page: "/no/kontakt",
            hashedIp: "hash_2",
            visitorId: "visitor_2",
            sessionId: "session_2",
            landingPage: "/no/kontakt",
            createdAt: new Date("2026-06-10T12:02:00.000Z"),
          },
          {
            id: "event_4",
            name: "lead_submitted",
            page: "/no",
            hashedIp: "hash_1",
            visitorId: "visitor_1",
            sessionId: "session_1",
            landingPage: "/no",
            createdAt: new Date("2026-06-10T12:03:00.000Z"),
          },
        ];
      },
      async listLeadsBySourcePage() {
        return [
          { sourcePage: "/no", count: 1 },
          { sourcePage: "/no/kontakt", count: 1 },
        ];
      },
      async listLeadsByLandingPage() {
        return [
          { landingPage: "/no", count: 1 },
          { landingPage: "/no/kontakt", count: 1 },
        ];
      },
    };

    const summary = await buildAnalyticsSummary({
      now: new Date("2026-06-10T12:05:00.000Z"),
      repository,
      timeframe: "7d",
    });

    expect(summary.totalPageViews).toBe(3);
    expect(summary.totalUniqueVisitors).toBe(2);
    expect(summary.totalSessions).toBe(2);
    expect(summary.totalLeads).toBe(2);
    expect(summary.conversionRate).toBe(100);
    expect(summary.viewsByPage).toEqual([
      { page: "/no", count: 1 },
      { page: "/no/kontakt", count: 1 },
      { page: "/no/senja", count: 1 },
    ]);
    expect(summary.landingPagesBySession).toEqual([
      { landingPage: "/no", count: 1 },
      { landingPage: "/no/kontakt", count: 1 },
    ]);
    expect(summary.leadsBySourcePage).toEqual([
      { sourcePage: "/no", count: 1 },
      { sourcePage: "/no/kontakt", count: 1 },
    ]);
    expect(summary.leadsByLandingPage).toEqual([
      { landingPage: "/no", count: 1 },
      { landingPage: "/no/kontakt", count: 1 },
    ]);
    expect(summary.honeypotSubmissionCount).toBe(1);
    expect(summary.rateLimitedSubmissionCount).toBe(2);
    expect(summary.recentEvents).toHaveLength(4);
  });
});
