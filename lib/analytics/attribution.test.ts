import {
  readCurrentAttribution,
  recordPageViewAttribution,
} from "@/lib/analytics/attribution";

describe("analytics attribution", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps one visitor and session across multiple page views", () => {
    const firstView = recordPageViewAttribution(
      "/no",
      Date.parse("2026-06-15T10:00:00.000Z"),
    );
    const secondView = recordPageViewAttribution(
      "/no/senja",
      Date.parse("2026-06-15T10:05:00.000Z"),
    );

    expect(firstView).not.toBeNull();
    expect(secondView).toMatchObject({
      visitorId: firstView?.visitorId,
      sessionId: firstView?.sessionId,
      landingPage: "/no",
      pagesSeen: 2,
    });
  });

  it("starts a new session after thirty minutes of inactivity", () => {
    const firstView = recordPageViewAttribution(
      "/no",
      Date.parse("2026-06-15T10:00:00.000Z"),
    );
    const laterView = recordPageViewAttribution(
      "/no/kontakt",
      Date.parse("2026-06-15T10:31:00.000Z"),
    );

    expect(laterView?.visitorId).toBe(firstView?.visitorId);
    expect(laterView?.sessionId).not.toBe(firstView?.sessionId);
    expect(laterView).toMatchObject({
      landingPage: "/no/kontakt",
      pagesSeen: 1,
    });
  });

  it("reads existing attribution for lead forms without counting another page view", () => {
    recordPageViewAttribution("/no", Date.parse("2026-06-15T10:00:00.000Z"));
    const attribution = readCurrentAttribution(
      "/no/kontakt",
      Date.parse("2026-06-15T10:05:00.000Z"),
    );

    expect(attribution).toMatchObject({
      landingPage: "/no",
      pagesSeen: 1,
    });
  });
});
