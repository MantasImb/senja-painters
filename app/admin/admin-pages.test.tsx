let mockAdminCookieValue: string | undefined;

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: jest.fn((name: string) =>
      name === "senja_admin_session" && mockAdminCookieValue
        ? { name, value: mockAdminCookieValue }
        : undefined,
    ),
  })),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: jest.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

jest.mock("@/lib/admin/admin-repository", () => ({
  getAdminAnalyticsSummary: jest.fn(),
  getAdminLeadDetail: jest.fn(),
  getAdminLeads: jest.fn(),
}));

jest.mock("@/lib/actions/admin-actions", () => ({
  updateLeadStatusAction: jest.fn(),
}));

import { render, screen, within } from "@testing-library/react";

import { createAdminSessionCookieValue } from "@/lib/admin/admin-session";
import {
  getAdminAnalyticsSummary,
  getAdminLeadDetail,
  getAdminLeads,
} from "@/lib/admin/admin-repository";
import AdminDashboardPage from "./page";
import AdminLeadDetailPage from "./leads/[id]/page";
import AdminLoginPage from "./login/page";
import { redirect } from "next/navigation";

const redirectMock = jest.mocked(redirect);
const getAdminLeadsMock = jest.mocked(getAdminLeads);
const getAdminAnalyticsSummaryMock = jest.mocked(getAdminAnalyticsSummary);
const getAdminLeadDetailMock = jest.mocked(getAdminLeadDetail);

const analyticsSummary = {
  conversionRate: 0,
  honeypotSubmissionCount: 0,
  landingPagesBySession: [],
  leadsByLandingPage: [],
  leadsBySourcePage: [],
  rateLimitedSubmissionCount: 0,
  recentEvents: [],
  totalLeads: 0,
  totalPageViews: 0,
  totalSessions: 0,
  totalUniqueVisitors: 0,
  viewsByPage: [],
};

const testEnvKeys = [
  "ADMIN_PASSWORD",
  "DATABASE_URL",
  "IP_HASH_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "SESSION_SECRET",
] as const;

const originalEnv = Object.fromEntries(
  testEnvKeys.map((key) => [key, process.env[key]]),
);

describe("admin pages", () => {
  beforeEach(() => {
    mockAdminCookieValue = undefined;
    redirectMock.mockClear();
    getAdminLeadsMock.mockReset();
    getAdminAnalyticsSummaryMock.mockReset();
    getAdminLeadDetailMock.mockReset();
    process.env.ADMIN_PASSWORD = "correct-password";
    process.env.DATABASE_URL = "postgres://example";
    process.env.IP_HASH_SECRET = "x".repeat(32);
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    process.env.SESSION_SECRET = "s".repeat(32);
  });

  afterEach(() => {
    for (const key of testEnvKeys) {
      const originalValue = originalEnv[key];

      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    }
  });

  it("redirects unauthenticated dashboard visitors to the admin login page", async () => {
    await expect(
      AdminDashboardPage({
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/login");

    expect(redirectMock).toHaveBeenCalledWith("/admin/login");
  });

  it("redirects unauthenticated lead detail visitors to the admin login page", async () => {
    await expect(
      AdminLeadDetailPage({
        params: Promise.resolve({ id: "lead-detail" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/login");

    expect(getAdminLeadDetailMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/admin/login");
  });

  it("renders the admin password control with an explicit readable color", async () => {
    render(
      await AdminLoginPage({
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByLabelText("Passord")).toHaveClass(
      "bg-white",
      "text-neutral-950",
      "caret-neutral-950",
    );
  });

  it("renders authenticated dashboard leads for the selected status filter", async () => {
    mockAdminCookieValue = createAdminSessionCookieValue({
      now: new Date(),
      secret: "s".repeat(32),
    });
    getAdminLeadsMock.mockResolvedValue([
      {
        id: "lead-newer",
        createdAt: new Date("2026-06-12T12:00:00.000Z"),
        name: "Nyere Lead",
        phone: "900 00 001",
        area: "Senja",
        serviceType: "Innvendig maling",
        sourcePage: "/no/senja",
        status: "contacted",
      },
      {
        id: "lead-older",
        createdAt: new Date("2026-06-11T12:00:00.000Z"),
        name: "Eldre Lead",
        phone: "900 00 002",
        area: "Finnsnes",
        serviceType: "Utvendig maling",
        sourcePage: "/no/finnsnes",
        status: "contacted",
      },
    ]);
    getAdminAnalyticsSummaryMock.mockResolvedValue(analyticsSummary);

    render(
      await AdminDashboardPage({
        searchParams: Promise.resolve({ status: "contacted" }),
      }),
    );

    expect(getAdminLeadsMock).toHaveBeenCalledWith("contacted");
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Nyere Lead")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Eldre Lead")).toBeInTheDocument();
    expect(
      within(rows[1]).getByRole("link", { name: /åpne/i }),
    ).toHaveAttribute("href", "/admin/leads/lead-newer");
    expect(screen.getByRole("link", { name: "7 dager" })).toHaveClass(
      "bg-neutral-950",
      "text-white",
    );
    expect(screen.getByRole("link", { name: "30 dager" })).toHaveClass(
      "bg-white",
      "text-neutral-950",
    );
    expect(screen.getByRole("link", { name: "contacted" })).toHaveClass(
      "bg-neutral-950",
      "text-white",
    );
  });

  it("keeps the selected Painting Lead status when changing analytics timeframe", async () => {
    mockAdminCookieValue = createAdminSessionCookieValue({
      now: new Date(),
      secret: "s".repeat(32),
    });
    getAdminLeadsMock.mockResolvedValue([]);
    getAdminAnalyticsSummaryMock.mockResolvedValue(analyticsSummary);

    render(
      await AdminDashboardPage({
        searchParams: Promise.resolve({
          status: "contacted",
          timeframe: "30d",
        }),
      }),
    );

    expect(screen.getByRole("link", { name: "7 dager" })).toHaveAttribute(
      "href",
      "/admin?status=contacted&timeframe=7d",
    );
    expect(screen.getAllByRole("link", { name: "Alle" })[0]).toHaveAttribute(
      "href",
      "/admin?status=contacted&timeframe=all",
    );
  });

  it("keeps the selected analytics timeframe when changing Painting Lead status", async () => {
    mockAdminCookieValue = createAdminSessionCookieValue({
      now: new Date(),
      secret: "s".repeat(32),
    });
    getAdminLeadsMock.mockResolvedValue([]);
    getAdminAnalyticsSummaryMock.mockResolvedValue(analyticsSummary);

    render(
      await AdminDashboardPage({
        searchParams: Promise.resolve({ timeframe: "30d" }),
      }),
    );

    expect(screen.getByRole("link", { name: "contacted" })).toHaveAttribute(
      "href",
      "/admin?status=contacted&timeframe=30d",
    );
    expect(screen.getAllByRole("link", { name: "Alle" })[1]).toHaveAttribute(
      "href",
      "/admin?timeframe=30d",
    );
  });

  it.each([
    ["30d", "30 dager"],
    ["all", "Alle"],
  ] as const)(
    "loads and highlights the %s analytics timeframe",
    async (timeframe, label) => {
      mockAdminCookieValue = createAdminSessionCookieValue({
        now: new Date(),
        secret: "s".repeat(32),
      });
      getAdminLeadsMock.mockResolvedValue([]);
      getAdminAnalyticsSummaryMock.mockResolvedValue(analyticsSummary);

      render(
        await AdminDashboardPage({
          searchParams: Promise.resolve({ timeframe }),
        }),
      );

      expect(getAdminAnalyticsSummaryMock).toHaveBeenCalledWith(timeframe);
      const matchingLinks = screen.getAllByRole("link", { name: label });
      expect(matchingLinks[0]).toHaveClass("bg-neutral-950", "text-white");
    },
  );

  it("shows submitted contact and project information on the lead detail page", async () => {
    mockAdminCookieValue = createAdminSessionCookieValue({
      now: new Date(),
      secret: "s".repeat(32),
    });
    getAdminLeadDetailMock.mockResolvedValue({
      id: "lead-detail",
      createdAt: new Date("2026-06-12T12:00:00.000Z"),
      name: "Kari Nordmann",
      phone: "900 00 123",
      email: "kari@example.test",
      area: "Finnsnes",
      serviceType: "Møbelmaling",
      sourcePage: "/no/kontakt",
      status: "new",
      propertyType: "Enebolig",
      desiredTimeframe: "Sommer",
      projectDescription: "Male kjøkkenfronter og et skap.",
      statusEvents: [
        {
          id: "event-2",
          previousStatus: "new",
          newStatus: "contacted",
          changedAt: new Date("2026-06-13T12:00:00.000Z"),
        },
        {
          id: "event-1",
          previousStatus: null,
          newStatus: "new",
          changedAt: new Date("2026-06-12T12:00:00.000Z"),
        },
      ],
    });

    render(
      await AdminLeadDetailPage({
        params: Promise.resolve({ id: "lead-detail" }),
      }),
    );

    expect(getAdminLeadDetailMock).toHaveBeenCalledWith("lead-detail");
    expect(
      screen.getByRole("heading", { level: 1, name: "Kari Nordmann" }),
    ).toBeInTheDocument();
    expect(screen.getByText("900 00 123")).toBeInTheDocument();
    expect(screen.getByText("kari@example.test")).toBeInTheDocument();
    expect(screen.getByText("Finnsnes")).toBeInTheDocument();
    expect(screen.getByText("Møbelmaling")).toBeInTheDocument();
    expect(
      screen.getByText("Male kjøkkenfronter og et skap."),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/→/).map((event) => event.textContent),
    ).toEqual(["new → contacted", "opprettet → new"]);
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["new", "contacted", "sent_to_partner", "closed", "spam"]);
  });
});
