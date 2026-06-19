import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { recordPageViewAnalyticsEvent } from "@/lib/analytics/server";

export const runtime = "nodejs";

const pageViewSchema = z.object({
  page: z.string().min(1).max(200),
  visitorId: z.string().trim().min(1).max(200).optional(),
  sessionId: z.string().trim().min(1).max(200).optional(),
  landingPage: z.string().trim().min(1).max(200).optional(),
  pagesSeen: z.number().int().min(1).max(10000).optional(),
});

export async function POST(request: Request) {
  const parsed = pageViewSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await recordPageViewAnalyticsEvent({
    headers: await headers(),
    landingPage: parsed.data.landingPage,
    page: parsed.data.page,
    pagesSeen: parsed.data.pagesSeen,
    sessionId: parsed.data.sessionId,
    visitorId: parsed.data.visitorId,
  });

  return NextResponse.json({ ok: true });
}
