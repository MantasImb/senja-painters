export type AnalyticsAttribution = {
  visitorId: string;
  sessionId: string;
  landingPage: string;
  pagesSeen: number;
};

const visitorStorageKey = "senja-malere:analytics-visitor-id";
const sessionStorageKey = "senja-malere:analytics-session";
const sessionTimeoutMs = 30 * 60 * 1000;

type StoredSession = {
  id: string;
  landingPage: string;
  lastSeenAt: number;
  pagesSeen: number;
};

export function recordPageViewAttribution(
  page: string,
  now = Date.now(),
): AnalyticsAttribution | null {
  return getAttribution(page, now, true);
}

export function readCurrentAttribution(
  fallbackPage: string,
  now = Date.now(),
): AnalyticsAttribution | null {
  return getAttribution(fallbackPage, now, false);
}

function getAttribution(
  page: string,
  now: number,
  countPageView: boolean,
): AnalyticsAttribution | null {
  if (typeof window === "undefined") {
    return null;
  }

  const visitorId = getOrCreateVisitorId();
  const currentSession = readSession();
  const session =
    currentSession && now - currentSession.lastSeenAt <= sessionTimeoutMs
      ? currentSession
      : {
          id: createClientId(),
          landingPage: page,
          lastSeenAt: now,
          pagesSeen: 0,
        };

  const updatedSession = {
    ...session,
    lastSeenAt: now,
    pagesSeen: countPageView
      ? session.pagesSeen + 1
      : Math.max(session.pagesSeen, 1),
  };

  writeSession(updatedSession);

  return {
    visitorId,
    sessionId: updatedSession.id,
    landingPage: updatedSession.landingPage,
    pagesSeen: updatedSession.pagesSeen,
  };
}

function getOrCreateVisitorId() {
  const existingVisitorId = window.sessionStorage.getItem(visitorStorageKey);

  if (existingVisitorId) {
    return existingVisitorId;
  }

  const visitorId = createClientId();
  window.sessionStorage.setItem(visitorStorageKey, visitorId);
  return visitorId;
}

function readSession(): StoredSession | null {
  const rawSession = window.sessionStorage.getItem(sessionStorageKey);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as Partial<StoredSession>;

    if (
      typeof parsedSession.id !== "string" ||
      typeof parsedSession.landingPage !== "string" ||
      typeof parsedSession.lastSeenAt !== "number" ||
      typeof parsedSession.pagesSeen !== "number"
    ) {
      return null;
    }

    return {
      id: parsedSession.id,
      landingPage: parsedSession.landingPage,
      lastSeenAt: parsedSession.lastSeenAt,
      pagesSeen: parsedSession.pagesSeen,
    };
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession) {
  window.sessionStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `client_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}
