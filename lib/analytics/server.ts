import "server-only";

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { getDb } from "@/lib/db";
import { getServerEnv } from "@/lib/env";
import { getClientIp, hashIpIdentity } from "@/lib/ip-identity";

export type AnalyticsEventName =
  | "page_view"
  | "lead_submitted"
  | "admin_login_success"
  | "admin_login_failed"
  | "lead_status_changed";

export type AnalyticsEventInput = {
  name: AnalyticsEventName;
  page?: string | null;
  metadata?: Record<string, number | string | null> | null;
  hashedIp?: string | null;
  visitorId?: string | null;
  sessionId?: string | null;
  landingPage?: string | null;
  createdAt?: Date;
};

export type PageViewAnalyticsInput = {
  headers: Headers;
  page: string;
  visitorId?: string;
  sessionId?: string;
  landingPage?: string;
  pagesSeen?: number;
};

export async function recordAnalyticsEvent(
  event: AnalyticsEventInput,
  db: PrismaClient = getDb(),
) {
  await createAnalyticsEvent(db, event);
}

export function createAnalyticsEvent(
  db: PrismaClient,
  event: AnalyticsEventInput,
) {
  return db.analyticsEvent.create({
    data: analyticsEventData(event),
  });
}

export async function recordPageViewAnalyticsEvent(
  input: PageViewAnalyticsInput,
  db: PrismaClient = getDb(),
) {
  const env = getServerEnv();
  const ipIdentity = getClientIp(input.headers);
  const landingPage = input.landingPage ?? input.page;

  await recordAnalyticsEvent(
    {
      createdAt: new Date(),
      hashedIp: hashIpIdentity(ipIdentity, env.IP_HASH_SECRET),
      landingPage,
      metadata: {
        landingPage,
        page: input.page,
        pagesSeen: input.pagesSeen ?? null,
        sessionId: input.sessionId ?? null,
        visitorId: input.visitorId ?? null,
      },
      name: "page_view",
      page: input.page,
      sessionId: input.sessionId ?? null,
      visitorId: input.visitorId ?? null,
    },
    db,
  );
}

export function analyticsEventData(event: AnalyticsEventInput) {
  return {
    createdAt: event.createdAt ?? new Date(),
    hashedIp: event.hashedIp ?? null,
    landingPage: event.landingPage ?? null,
    metadata: event.metadata ?? undefined,
    name: event.name,
    page: event.page ?? null,
    sessionId: event.sessionId ?? null,
    visitorId: event.visitorId ?? null,
  };
}
