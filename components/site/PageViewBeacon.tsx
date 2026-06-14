"use client";

import { useEffect } from "react";

export function PageViewBeacon({ page }: { page: string }) {
  useEffect(() => {
    const payload = JSON.stringify({ page });

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
