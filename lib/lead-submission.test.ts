import {
  createLeadSubmission,
  type LeadSubmissionRepository,
} from "./lead-submission";

function formData(entries: Record<string, string>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }

  return data;
}

function validSubmission(overrides: Record<string, string> = {}) {
  return formData({
    name: "Kari Test",
    phone: "900 00 000",
    email: "",
    area: "Finnsnes",
    serviceType: "Innvendig maling",
    propertyType: "",
    desiredTimeframe: "",
    projectDescription: "Male stue og kjøkken.",
    consent: "yes",
    sourcePage: "/no",
    visitorId: "visitor_1",
    sessionId: "session_1",
    landingPage: "/no/senja",
    pagesSeen: "3",
    companyWebsite: "",
    ...overrides,
  });
}

function createRepository(): LeadSubmissionRepository & {
  leads: unknown[];
  honeypots: unknown[];
  analytics: unknown[];
  blockedCount: number;
  successfulCount: number;
} {
  return {
    analytics: [],
    blockedCount: 0,
    honeypots: [],
    leads: [],
    successfulCount: 0,
    async countSuccessfulSubmissions() {
      return this.successfulCount;
    },
    async createHoneypotSubmission(submission) {
      this.honeypots.push(submission);
    },
    async createLead(lead) {
      this.leads.push(lead);
      return "lead_1";
    },
    async incrementBlockedSubmission() {
      this.blockedCount += 1;
    },
    async incrementSuccessfulSubmission() {
      this.successfulCount += 1;
    },
    async recordAnalyticsEvent(event) {
      this.analytics.push(event);
    },
  };
}

describe("createLeadSubmission", () => {
  it("creates a new lead without requiring email and records source page plus analytics", async () => {
    const repository = createRepository();

    const result = await createLeadSubmission(validSubmission(), {
      hashedIp: "hash_1",
      now: new Date("2026-06-10T12:00:00.000Z"),
      repository,
      userAgent: "jest",
    });

    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/forespørselen er mottatt/i);
    expect(repository.leads).toEqual([
      expect.objectContaining({
        email: null,
        landingPage: "/no/senja",
        pagesSeen: 3,
        sessionId: "session_1",
        sourcePage: "/no",
        status: "new",
        visitorId: "visitor_1",
      }),
    ]);
    expect(repository.successfulCount).toBe(1);
    expect(repository.analytics).toEqual([
      expect.objectContaining({
        name: "lead_submitted",
        page: "/no",
        landingPage: "/no/senja",
        sessionId: "session_1",
        visitorId: "visitor_1",
      }),
    ]);
  });

  it("rejects missing required fields and non-consent before persistence", async () => {
    const repository = createRepository();

    const result = await createLeadSubmission(
      validSubmission({
        consent: "",
        name: "",
      }),
      {
        hashedIp: "hash_1",
        now: new Date("2026-06-10T12:00:00.000Z"),
        repository,
        userAgent: "jest",
      },
    );

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.name).toBeDefined();
    expect(result.fieldErrors.consent).toBeDefined();
    expect(repository.leads).toEqual([]);
  });

  it("stores honeypot submissions separately and returns the same success response", async () => {
    const repository = createRepository();

    const result = await createLeadSubmission(
      validSubmission({ companyWebsite: "https://spam.example" }),
      {
        hashedIp: "hash_1",
        now: new Date("2026-06-10T12:00:00.000Z"),
        repository,
        userAgent: "jest",
      },
    );

    expect(result.ok).toBe(true);
    expect(repository.leads).toEqual([]);
    expect(repository.honeypots).toEqual([
      expect.objectContaining({
        filledHoneypot: "https://spam.example",
        hashedIp: "hash_1",
        sourcePage: "/no",
      }),
    ]);
    expect(repository.honeypots[0]).not.toHaveProperty("rawIpAddress");
  });

  it("blocks the fourth successful submission for the same hashed identity", async () => {
    const repository = createRepository();
    repository.successfulCount = 3;

    const result = await createLeadSubmission(validSubmission(), {
      hashedIp: "hash_1",
      now: new Date("2026-06-10T12:00:00.000Z"),
      repository,
      userAgent: "jest",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/kunne ikke sende/i);
    expect(repository.blockedCount).toBe(1);
    expect(repository.leads).toEqual([]);
  });
});
