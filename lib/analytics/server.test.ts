/** @jest-environment node */

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { recordPageViewAnalyticsEvent } from "./server";

describe("server analytics", () => {
  const originalEnv = {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    DATABASE_URL: process.env.DATABASE_URL,
    IP_HASH_SECRET: process.env.IP_HASH_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
  };

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "correct-password";
    process.env.DATABASE_URL = "postgres://example";
    process.env.IP_HASH_SECRET = "x".repeat(32);
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    process.env.SESSION_SECRET = "s".repeat(32);
  });

  afterAll(() => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("stores a hashed identity and session attribution without the raw IP", async () => {
    const create = jest.fn(async () => ({}));
    const db = {
      analyticsEvent: { create },
    } as unknown as PrismaClient;

    await recordPageViewAnalyticsEvent(
      {
        headers: new Headers({
          "x-forwarded-for": "203.0.113.10",
        }),
        landingPage: "/no",
        page: "/no/senja",
        pagesSeen: 2,
        sessionId: "session_1",
        visitorId: "visitor_1",
      },
      db,
    );

    const data = create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      landingPage: "/no",
      name: "page_view",
      page: "/no/senja",
      sessionId: "session_1",
      visitorId: "visitor_1",
    });
    expect(data.hashedIp).toHaveLength(64);
    expect(JSON.stringify(data)).not.toContain("203.0.113.10");
  });
});
