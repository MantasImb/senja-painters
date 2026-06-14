import {
  createAdminSessionCookieValue,
  isValidAdminPassword,
  verifyAdminSessionCookieValue,
} from "./admin-session";

describe("admin session cookie", () => {
  it("verifies a signed unexpired admin session", () => {
    const now = new Date("2026-06-10T12:00:00.000Z");
    const cookie = createAdminSessionCookieValue({
      now,
      secret: "test-secret",
    });

    expect(
      verifyAdminSessionCookieValue(cookie, {
        now: new Date("2026-06-10T13:00:00.000Z"),
        secret: "test-secret",
      }),
    ).toEqual(
      expect.objectContaining({
        role: "admin",
      }),
    );
  });

  it("rejects tampered, expired, or wrongly signed sessions", () => {
    const now = new Date("2026-06-10T12:00:00.000Z");
    const cookie = createAdminSessionCookieValue({
      now,
      secret: "test-secret",
    });

    expect(
      verifyAdminSessionCookieValue(`${cookie}tampered`, {
        now,
        secret: "test-secret",
      }),
    ).toBeNull();
    expect(
      verifyAdminSessionCookieValue(cookie, {
        now: new Date("2026-06-11T01:00:00.000Z"),
        secret: "test-secret",
      }),
    ).toBeNull();
    expect(
      verifyAdminSessionCookieValue(cookie, {
        now,
        secret: "wrong-secret",
      }),
    ).toBeNull();
  });
});

describe("admin password", () => {
  it("accepts only the configured admin password", () => {
    expect(isValidAdminPassword("correct-password", "correct-password")).toBe(
      true,
    );
    expect(isValidAdminPassword("wrong-password", "correct-password")).toBe(
      false,
    );
    expect(isValidAdminPassword("", "correct-password")).toBe(false);
  });
});
