/** @jest-environment node */

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { createPrismaLeadSubmissionRepository } from "./prisma-lead-submission-repository";

describe("Prisma lead submission repository", () => {
  it("counts successful submissions from the exact rolling-window boundary", async () => {
    const aggregate = jest.fn(async () => ({
      _sum: { successfulSubmissionCount: 2 },
    }));
    const db = {
      rateLimitEntry: { aggregate },
    } as unknown as PrismaClient;
    const repository = createPrismaLeadSubmissionRepository(db);
    const since = new Date("2026-06-22T12:34:56.000Z");

    await expect(
      repository.countSuccessfulSubmissions({
        hashedIp: "hash_1",
        since,
      }),
    ).resolves.toBe(2);
    expect(aggregate).toHaveBeenCalledWith({
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
  });

  it("records successful and blocked attempts at their exact timestamps", async () => {
    const create = jest.fn(async () => ({}));
    const db = {
      rateLimitEntry: { create },
    } as unknown as PrismaClient;
    const repository = createPrismaLeadSubmissionRepository(db);
    const now = new Date("2026-06-23T12:34:56.789Z");

    await repository.incrementSuccessfulSubmission({
      hashedIp: "hash_1",
      now,
    });
    await repository.incrementBlockedSubmission({
      hashedIp: "hash_1",
      now,
    });

    expect(create).toHaveBeenNthCalledWith(1, {
      data: {
        blockedSubmissionCount: 0,
        hashedIp: "hash_1",
        successfulSubmissionCount: 1,
        windowStart: now,
      },
    });
    expect(create).toHaveBeenNthCalledWith(2, {
      data: {
        blockedSubmissionCount: 1,
        hashedIp: "hash_1",
        successfulSubmissionCount: 0,
        windowStart: now,
      },
    });
  });
});
