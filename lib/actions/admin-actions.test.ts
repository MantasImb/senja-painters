const cookieSetMock = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    set: cookieSetMock,
  })),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/admin/admin-auth", () => ({
  requireAdminSession: jest.fn(),
}));

jest.mock("@/lib/analytics/server", () => ({
  recordAnalyticsEvent: jest.fn(),
}));

jest.mock("@/lib/admin/admin-repository", () => ({
  createPrismaAdminLeadRepository: jest.fn(),
}));

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin/admin-auth";
import { createPrismaAdminLeadRepository } from "@/lib/admin/admin-repository";
import { verifyAdminSessionCookieValue } from "@/lib/admin/admin-session";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import {
  loginAdminAction,
  updateLeadStatusAction,
} from "@/lib/actions/admin-actions";
import { leadStatuses } from "@/lib/lead-submission";

const redirectMock = jest.mocked(redirect);
const revalidatePathMock = jest.mocked(revalidatePath);
const requireAdminSessionMock = jest.mocked(requireAdminSession);
const createPrismaAdminLeadRepositoryMock = jest.mocked(
  createPrismaAdminLeadRepository,
);
const recordAnalyticsEventMock = jest.mocked(recordAnalyticsEvent);

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

describe("admin actions", () => {
  beforeEach(() => {
    cookieSetMock.mockClear();
    redirectMock.mockClear();
    revalidatePathMock.mockClear();
    requireAdminSessionMock.mockReset();
    createPrismaAdminLeadRepositoryMock.mockReset();
    recordAnalyticsEventMock.mockReset();
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

  it("keeps invalid admin login attempts out of the dashboard", async () => {
    const formData = new FormData();
    formData.set("password", "wrong-password");

    await expect(loginAdminAction(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login?error=1",
    );

    expect(cookieSetMock).not.toHaveBeenCalled();
    expect(recordAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "admin_login_failed",
        page: "/admin/login",
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?error=1");
  });

  it("creates a signed admin session cookie for a valid admin password", async () => {
    const formData = new FormData();
    formData.set("password", "correct-password");

    await expect(loginAdminAction(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/admin",
    );

    expect(cookieSetMock).toHaveBeenCalledTimes(1);
    const [cookieName, cookieValue, cookieOptions] = cookieSetMock.mock.calls[0];
    expect(cookieName).toBe("senja_admin_session");
    expect(
      verifyAdminSessionCookieValue(cookieValue, {
        now: new Date(),
        secret: "s".repeat(32),
      }),
    ).toEqual(expect.objectContaining({ role: "admin" }));
    expect(
      verifyAdminSessionCookieValue(cookieValue, {
        now: new Date(),
        secret: "wrong-secret",
      }),
    ).toBeNull();
    expect(cookieOptions).toEqual(
      expect.objectContaining({
        httpOnly: true,
        path: "/admin",
        sameSite: "lax",
      }),
    );
    expect(recordAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "admin_login_success",
        page: "/admin/login",
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/admin");
  });

  it.each(leadStatuses)(
    "lets the site owner update a painting lead to %s",
    async (status) => {
      const changeLeadStatus = jest.fn();
      createPrismaAdminLeadRepositoryMock.mockReturnValue({
        changeLeadStatus,
      });
      const formData = new FormData();
      formData.set("leadId", "lead_1");
      formData.set("status", status);

      await expect(updateLeadStatusAction(formData)).rejects.toThrow(
        "NEXT_REDIRECT:/admin/leads/lead_1",
      );

      expect(requireAdminSessionMock).toHaveBeenCalledTimes(1);
      expect(changeLeadStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          leadId: "lead_1",
          newStatus: status,
        }),
      );
      expect(revalidatePathMock).toHaveBeenCalledWith("/admin");
      expect(revalidatePathMock).toHaveBeenCalledWith(
        "/admin/leads/lead_1",
      );
      expect(redirectMock).toHaveBeenCalledWith("/admin/leads/lead_1");
    },
  );

  it("rejects unsupported status values without changing the painting lead", async () => {
    const changeLeadStatus = jest.fn();
    createPrismaAdminLeadRepositoryMock.mockReturnValue({
      changeLeadStatus,
    });
    const formData = new FormData();
    formData.set("leadId", "lead_1");
    formData.set("status", "waiting_for_quote");

    await expect(updateLeadStatusAction(formData)).rejects.toThrow(
      "Unsupported lead status",
    );

    expect(requireAdminSessionMock).toHaveBeenCalledTimes(1);
    expect(changeLeadStatus).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("does not allow an unauthenticated status update", async () => {
    requireAdminSessionMock.mockRejectedValue(new Error("Unauthorized"));
    const changeLeadStatus = jest.fn();
    createPrismaAdminLeadRepositoryMock.mockReturnValue({
      changeLeadStatus,
    });
    const formData = new FormData();
    formData.set("leadId", "lead_1");
    formData.set("status", "closed");

    await expect(updateLeadStatusAction(formData)).rejects.toThrow(
      "Unauthorized",
    );

    expect(changeLeadStatus).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
