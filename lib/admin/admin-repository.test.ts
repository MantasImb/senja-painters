/** @jest-environment node */

import type { PrismaClient } from "@/lib/generated/prisma/client";
import {
  createPrismaAdminAnalyticsRepository,
  createPrismaAdminLeadRepository,
} from "./admin-repository";

describe("Prisma admin analytics repository", () => {
  it("counts page views within the requested timeframe", async () => {
    const count = jest.fn(async () => 4);
    const db = {
      analyticsEvent: {
        count,
      },
    } as unknown as PrismaClient;
    const since = new Date("2026-06-01T00:00:00.000Z");

    const result = await createPrismaAdminAnalyticsRepository(
      db,
    ).countPageViews({ since });

    expect(result).toBe(4);
    expect(count).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: since,
        },
        name: "page_view",
      },
    });
  });

  it("groups page views and Painting Leads within the requested timeframe", async () => {
    const analyticsGroupBy = jest.fn(async () => [
      {
        _count: { _all: 3 },
        page: "/no/senja",
      },
    ]);
    const leadGroupBy = jest.fn(async () => [
      {
        _count: { _all: 2 },
        sourcePage: "/no/kontakt",
      },
    ]);
    const db = {
      analyticsEvent: {
        groupBy: analyticsGroupBy,
      },
      lead: {
        groupBy: leadGroupBy,
      },
    } as unknown as PrismaClient;
    const since = new Date("2026-06-01T00:00:00.000Z");
    const repository = createPrismaAdminAnalyticsRepository(db);

    await expect(repository.listViewsByPage({ since })).resolves.toEqual([
      { count: 3, page: "/no/senja" },
    ]);
    await expect(repository.listLeadsBySourcePage({ since })).resolves.toEqual([
      { count: 2, sourcePage: "/no/kontakt" },
    ]);

    expect(analyticsGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ["page"],
        where: {
          createdAt: {
            gte: since,
          },
          name: "page_view",
          page: {
            not: null,
          },
        },
      }),
    );
    expect(leadGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ["sourcePage"],
        where: {
          createdAt: {
            gte: since,
          },
        },
      }),
    );
  });

  it("returns recent events and aggregate spam pressure for the timeframe", async () => {
    const since = new Date("2026-06-01T00:00:00.000Z");
    const recentEvent = {
      createdAt: new Date("2026-06-20T12:00:00.000Z"),
      hashedIp: "hash_1",
      id: "event_1",
      landingPage: "/no",
      name: "lead_submitted",
      page: "/no/kontakt",
      sessionId: "session_1",
      visitorId: "visitor_1",
    };
    const findMany = jest.fn(async () => [recentEvent]);
    const honeypotCount = jest.fn(async () => 2);
    const rateLimitAggregate = jest.fn(async () => ({
      _sum: {
        blockedSubmissionCount: 3,
      },
    }));
    const db = {
      analyticsEvent: {
        findMany,
      },
      honeypotSubmission: {
        count: honeypotCount,
      },
      rateLimitEntry: {
        aggregate: rateLimitAggregate,
      },
    } as unknown as PrismaClient;
    const repository = createPrismaAdminAnalyticsRepository(db);

    await expect(
      repository.listRecentAnalyticsEvents({ limit: 10, since }),
    ).resolves.toEqual([recentEvent]);
    await expect(
      repository.countHoneypotSubmissions({ since }),
    ).resolves.toBe(2);
    await expect(repository.countBlockedSubmissions({ since })).resolves.toBe(3);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        where: {
          createdAt: {
            gte: since,
          },
        },
      }),
    );
    expect(honeypotCount).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: since,
        },
      },
    });
    expect(rateLimitAggregate).toHaveBeenCalledWith({
      _sum: {
        blockedSubmissionCount: true,
      },
      where: {
        windowStart: {
          gte: since,
        },
      },
    });
  });

  it("omits date constraints for all-time totals", async () => {
    const pageViewCount = jest.fn(async () => 5);
    const leadCount = jest.fn(async () => 2);
    const db = {
      analyticsEvent: {
        count: pageViewCount,
      },
      lead: {
        count: leadCount,
      },
    } as unknown as PrismaClient;
    const repository = createPrismaAdminAnalyticsRepository(db);

    await expect(
      repository.countPageViews({ since: undefined }),
    ).resolves.toBe(5);
    await expect(repository.countLeads({ since: undefined })).resolves.toBe(2);

    expect(pageViewCount).toHaveBeenCalledWith({
      where: {
        name: "page_view",
      },
    });
    expect(leadCount).toHaveBeenCalledWith({
      where: undefined,
    });
  });
});

describe("Prisma admin lead repository", () => {
  it("persists a status update with history based on the current stored status", async () => {
    const changedAt = new Date("2026-06-23T09:00:00.000Z");
    const state = {
      analyticsEvents: [] as Record<string, unknown>[],
      status: "new",
      statusEvents: [] as Record<string, unknown>[],
    };

    const transactionClient = {
      analyticsEvent: {
        async create({ data }: { data: Record<string, unknown> }) {
          state.analyticsEvents.push(data);
          return data;
        },
      },
      lead: {
        async findUnique() {
          return { status: state.status };
        },
        async update({
          data,
        }: {
          data: { status: string };
        }) {
          state.status = data.status;
          return { status: state.status };
        },
      },
      leadStatusEvent: {
        async create({ data }: { data: Record<string, unknown> }) {
          state.statusEvents.push(data);
          return data;
        },
      },
    };
    const db = {
      async $transaction(
        operation: (tx: typeof transactionClient) => Promise<void>,
        options: { isolationLevel?: string },
      ) {
        expect(options).toEqual({
          isolationLevel: "Serializable",
        });
        return operation(transactionClient);
      },
    } as unknown as PrismaClient;

    await createPrismaAdminLeadRepository(db).changeLeadStatus({
      changedAt,
      leadId: "lead_1",
      newStatus: "contacted",
    });

    expect(state.status).toBe("contacted");
    expect(state.statusEvents).toEqual([
      {
        changedAt,
        leadId: "lead_1",
        newStatus: "contacted",
        previousStatus: "new",
      },
    ]);
    expect(state.analyticsEvents).toEqual([
      expect.objectContaining({
        createdAt: changedAt,
        metadata: {
          leadId: "lead_1",
          newStatus: "contacted",
          previousStatus: "new",
        },
        name: "lead_status_changed",
      }),
    ]);
  });

  it("does not create history when the submitted status is already current", async () => {
    const writes = {
      analytics: jest.fn(),
      status: jest.fn(),
      statusEvent: jest.fn(),
    };
    const transactionClient = {
      analyticsEvent: {
        create: writes.analytics,
      },
      lead: {
        async findUnique() {
          return { status: "contacted" };
        },
        update: writes.status,
      },
      leadStatusEvent: {
        create: writes.statusEvent,
      },
    };
    const db = {
      async $transaction(
        operation: (tx: typeof transactionClient) => Promise<void>,
      ) {
        return operation(transactionClient);
      },
    } as unknown as PrismaClient;

    await createPrismaAdminLeadRepository(db).changeLeadStatus({
      changedAt: new Date("2026-06-23T09:00:00.000Z"),
      leadId: "lead_1",
      newStatus: "contacted",
    });

    expect(writes.status).not.toHaveBeenCalled();
    expect(writes.statusEvent).not.toHaveBeenCalled();
    expect(writes.analytics).not.toHaveBeenCalled();
  });

  it("rejects a status update when the painting lead does not exist", async () => {
    const transactionClient = {
      lead: {
        async findUnique() {
          return null;
        },
      },
    };
    const db = {
      async $transaction(
        operation: (tx: typeof transactionClient) => Promise<void>,
      ) {
        return operation(transactionClient);
      },
    } as unknown as PrismaClient;

    await expect(
      createPrismaAdminLeadRepository(db).changeLeadStatus({
        changedAt: new Date("2026-06-23T09:00:00.000Z"),
        leadId: "missing_lead",
        newStatus: "contacted",
      }),
    ).rejects.toThrow("Lead not found");
  });
});
