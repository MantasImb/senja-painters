import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { getServerEnv } from "@/lib/env";
import { getClientIp, hashIpIdentity } from "@/lib/ip-identity";

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

  const requestHeaders = await headers();
  const env = getServerEnv();
  const ipIdentity = getClientIp(requestHeaders);

  await getDb().analyticsEvent.create({
    data: {
      createdAt: new Date(),
      hashedIp: hashIpIdentity(ipIdentity, env.IP_HASH_SECRET),
      landingPage: parsed.data.landingPage ?? parsed.data.page,
      metadata: {
        landingPage: parsed.data.landingPage ?? parsed.data.page,
        page: parsed.data.page,
        pagesSeen: parsed.data.pagesSeen ?? null,
        sessionId: parsed.data.sessionId ?? null,
        visitorId: parsed.data.visitorId ?? null,
      },
      name: "page_view",
      page: parsed.data.page,
      sessionId: parsed.data.sessionId ?? null,
      visitorId: parsed.data.visitorId ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
