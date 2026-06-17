"use client";

import { useEffect, useRef } from "react";

import { recordPageViewAttribution } from "@/lib/analytics/attribution";

export function PageViewBeacon({ page }: { page: string }) {
  const lastSentPageRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastSentPageRef.current === page) {
      return;
    }

    lastSentPageRef.current = page;

    const payload = JSON.stringify({
      page,
      ...recordPageViewAttribution(page),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/page-view", payload);
      return;
    }

    if (typeof fetch !== "function") {
      return;
    }

    void fetch("/api/analytics/page-view", {
      body: payload,
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      keepalive: true,
    });
  }, [page]);

  return null;
}
