/** @jest-environment node */

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { createPrismaAdminLeadRepository } from "./admin-repository";

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
