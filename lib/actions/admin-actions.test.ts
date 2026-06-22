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

jest.mock("@/lib/analytics/server", () => ({
  recordAnalyticsEvent: jest.fn(),
}));

jest.mock("@/lib/admin/admin-repository", () => ({
  createPrismaAdminLeadRepository: jest.fn(),
  getAdminLeadDetail: jest.fn(),
}));

import { redirect } from "next/navigation";

import { verifyAdminSessionCookieValue } from "@/lib/admin/admin-session";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { loginAdminAction } from "@/lib/actions/admin-actions";

const redirectMock = jest.mocked(redirect);
const recordAnalyticsEventMock = jest.mocked(recordAnalyticsEvent);

describe("admin actions", () => {
  beforeEach(() => {
    cookieSetMock.mockClear();
    redirectMock.mockClear();
    recordAnalyticsEventMock.mockReset();
    process.env.ADMIN_PASSWORD = "correct-password";
    process.env.DATABASE_URL = "postgres://example";
    process.env.IP_HASH_SECRET = "x".repeat(32);
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    process.env.SESSION_SECRET = "s".repeat(32);
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
});
