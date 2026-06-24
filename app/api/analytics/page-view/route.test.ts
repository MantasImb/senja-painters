/** @jest-environment node */

jest.mock("next/headers", () => ({
  headers: jest.fn(async () =>
    new Headers({
      "x-forwarded-for": "203.0.113.42",
    }),
  ),
}));

jest.mock("@/lib/db", () => ({
  getDb: jest.fn(),
}));

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { getDb } from "@/lib/db";
import { POST } from "./route";

const getDbMock = jest.mocked(getDb);

describe("page-view analytics route", () => {
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
    getDbMock.mockReset();
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

  it("records a valid public page view with privacy-preserving attribution", async () => {
    const create = jest.fn(async () => ({}));
    getDbMock.mockReturnValue({
      analyticsEvent: { create },
    } as unknown as PrismaClient);

    const response = await POST(
      new Request("https://example.test/api/analytics/page-view", {
        body: JSON.stringify({
          landingPage: "/no",
          page: "/no/senja",
          pagesSeen: 2,
          sessionId: "session_1",
          visitorId: "visitor_1",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    const data = create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      landingPage: "/no",
      name: "page_view",
      page: "/no/senja",
      sessionId: "session_1",
      visitorId: "visitor_1",
    });
    expect(data.hashedIp).toHaveLength(64);
    expect(JSON.stringify(data)).not.toContain("203.0.113.42");
  });

  it("rejects invalid page-view payloads without writing analytics", async () => {
    const create = jest.fn(async () => ({}));
    getDbMock.mockReturnValue({
      analyticsEvent: { create },
    } as unknown as PrismaClient);

    const response = await POST(
      new Request("https://example.test/api/analytics/page-view", {
        body: JSON.stringify({
          page: "",
          pagesSeen: 0,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false });
    expect(create).not.toHaveBeenCalled();
  });
});
