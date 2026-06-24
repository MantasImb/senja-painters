/** @jest-environment node */

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { createPrismaLeadSubmissionRepository } from "./prisma-lead-submission-repository";

const now = new Date("2026-06-23T12:34:56.789Z");
const since = new Date("2026-06-22T12:34:56.789Z");

function validAtomicSubmission() {
  return {
    analyticsEvent: {
      createdAt: now,
      hashedIp: "hash_1",
      landingPage: "/no",
      metadata: {
        serviceType: "Innvendig maling",
      },
      name: "lead_submitted" as const,
      page: "/no",
      sessionId: "session_1",
      visitorId: "visitor_1",
    },
    hashedIp: "hash_1",
    lead: {
      area: "Finnsnes",
      consentGiven: true as const,
      createdAt: now,
      desiredTimeframe: null,
      email: null,
      hashedIp: "hash_1",
      landingPage: "/no",
      name: "Kari Test",
      pagesSeen: 1,
      phone: "900 00 000",
      projectDescription: "Male stue og kjøkken.",
      propertyType: null,
      serviceType: "Innvendig maling",
      sessionId: "session_1",
      sourcePage: "/no",
      status: "new" as const,
      userAgent: "jest",
      visitorId: "visitor_1",
    },
    now,
    since,
  };
}

describe("Prisma lead submission repository", () => {
  it("creates the Painting Lead and successful attempt in one locked transaction", async () => {
    const queryRaw = jest.fn(async () => []);
    const rateLimitCreate = jest.fn(async () => ({}));
    const leadCreate = jest.fn(async () => ({ id: "lead_1" }));
    const analyticsCreate = jest.fn(async () => ({}));
    const transactionClient = {
      $queryRaw: queryRaw,
      analyticsEvent: { create: analyticsCreate },
      lead: { create: leadCreate },
      rateLimitEntry: {
        aggregate: jest.fn(async () => ({
          _sum: { successfulSubmissionCount: 2 },
        })),
        create: rateLimitCreate,
      },
    };
    const transaction = jest.fn(
      async (
        operation: (tx: typeof transactionClient) => Promise<unknown>,
        options: { isolationLevel?: string },
      ) => {
        void options;
        return operation(transactionClient);
      },
    );
    const repository = createPrismaLeadSubmissionRepository({
      $transaction: transaction,
    } as unknown as PrismaClient);

    const submission = validAtomicSubmission();
    submission.lead.hashedIp = "divergent_lead_hash";
    submission.analyticsEvent.hashedIp = "divergent_analytics_hash";

    await expect(
      repository.createLeadWithinRateLimit(submission),
    ).resolves.toEqual({
      leadId: "lead_1",
      status: "created",
    });
    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(leadCreate).toHaveBeenCalledTimes(1);
    expect(transactionClient.rateLimitEntry.aggregate).toHaveBeenCalledWith({
      _sum: {
        successfulSubmissionCount: true,
      },
      where: {
        hashedIp: "hash_1",
        windowStart: {
          gte: since,
        },
      },
    });
    expect(rateLimitCreate).toHaveBeenCalledWith({
      data: {
        blockedSubmissionCount: 0,
        hashedIp: "hash_1",
        successfulSubmissionCount: 1,
        windowStart: now,
      },
    });
    expect(leadCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        hashedIp: "hash_1",
      }),
      select: {
        id: true,
      },
    });
    expect(analyticsCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        hashedIp: "hash_1",
        metadata: expect.objectContaining({
          leadId: "lead_1",
        }),
        name: "lead_submitted",
      }),
    });
    expect(transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        isolationLevel: "Serializable",
      }),
    );
  });

  it("records only a blocked attempt when the rolling window is full", async () => {
    const rateLimitCreate = jest.fn(async () => ({}));
    const leadCreate = jest.fn(async () => ({ id: "lead_1" }));
    const analyticsCreate = jest.fn(async () => ({}));
    const transactionClient = {
      $queryRaw: jest.fn(async () => []),
      analyticsEvent: { create: analyticsCreate },
      lead: { create: leadCreate },
      rateLimitEntry: {
        aggregate: jest.fn(async () => ({
          _sum: { successfulSubmissionCount: 3 },
        })),
        create: rateLimitCreate,
      },
    };
    const repository = createPrismaLeadSubmissionRepository({
      async $transaction(
        operation: (tx: typeof transactionClient) => Promise<unknown>,
      ) {
        return operation(transactionClient);
      },
    } as unknown as PrismaClient);

    await expect(
      repository.createLeadWithinRateLimit(validAtomicSubmission()),
    ).resolves.toEqual({
      status: "blocked",
    });
    expect(rateLimitCreate).toHaveBeenCalledWith({
      data: {
        blockedSubmissionCount: 1,
        hashedIp: "hash_1",
        successfulSubmissionCount: 0,
        windowStart: now,
      },
    });
    expect(leadCreate).not.toHaveBeenCalled();
    expect(analyticsCreate).not.toHaveBeenCalled();
  });

  it("does not record a successful attempt when Painting Lead creation fails", async () => {
    const rateLimitCreate = jest.fn(async () => ({}));
    const analyticsCreate = jest.fn(async () => ({}));
    const transactionClient = {
      $queryRaw: jest.fn(async () => []),
      analyticsEvent: { create: analyticsCreate },
      lead: {
        create: jest.fn(async () => {
          throw new Error("database unavailable");
        }),
      },
      rateLimitEntry: {
        aggregate: jest.fn(async () => ({
          _sum: { successfulSubmissionCount: 2 },
        })),
        create: rateLimitCreate,
      },
    };
    const repository = createPrismaLeadSubmissionRepository({
      async $transaction(
        operation: (tx: typeof transactionClient) => Promise<unknown>,
      ) {
        return operation(transactionClient);
      },
    } as unknown as PrismaClient);

    await expect(
      repository.createLeadWithinRateLimit(validAtomicSubmission()),
    ).rejects.toThrow("database unavailable");
    expect(rateLimitCreate).not.toHaveBeenCalled();
    expect(analyticsCreate).not.toHaveBeenCalled();
  });

  it("retries a serializable transaction after a Prisma write conflict", async () => {
    const transactionClient = {
      $queryRaw: jest.fn(async () => []),
      analyticsEvent: { create: jest.fn(async () => ({})) },
      lead: { create: jest.fn(async () => ({ id: "lead_1" })) },
      rateLimitEntry: {
        aggregate: jest.fn(async () => ({
          _sum: { successfulSubmissionCount: 2 },
        })),
        create: jest.fn(async () => ({})),
      },
    };
    const transaction = jest
      .fn()
      .mockRejectedValueOnce({
        code: "P2034",
      })
      .mockImplementationOnce(
        async (
          operation: (tx: typeof transactionClient) => Promise<unknown>,
        ) => operation(transactionClient),
      );
    const repository = createPrismaLeadSubmissionRepository({
      $transaction: transaction,
    } as unknown as PrismaClient);

    await expect(
      repository.createLeadWithinRateLimit(validAtomicSubmission()),
    ).resolves.toEqual({
      leadId: "lead_1",
      status: "created",
    });
    expect(transaction).toHaveBeenCalledTimes(2);
  });
});
