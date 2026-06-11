import { createHmac, timingSafeEqual } from "crypto";

export const adminSessionCookieName = "senja_admin_session";
const sessionTtlMs = 12 * 60 * 60 * 1000;

export type AdminSessionPayload = {
  role: "admin";
  issuedAt: number;
  expiresAt: number;
};

export function createAdminSessionCookieValue({
  now,
  secret,
}: {
  now: Date;
  secret: string;
}) {
  const payload: AdminSessionPayload = {
    role: "admin",
    issuedAt: now.getTime(),
    expiresAt: now.getTime() + sessionTtlMs,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionCookieValue(
  cookieValue: string | undefined,
  {
    now,
    secret,
  }: {
    now: Date;
    secret: string;
  },
) {
  if (!cookieValue) {
    return null;
  }

  const [encodedPayload, signature, extra] = cookieValue.split(".");

  if (!encodedPayload || !signature || extra) {
    return null;
  }

  if (!safeEqual(signature, sign(encodedPayload, secret))) {
    return null;
  }

  const payload = parsePayload(encodedPayload);

  if (!payload || payload.expiresAt <= now.getTime()) {
    return null;
  }

  return payload;
}

export function isValidAdminPassword(
  submittedPassword: string,
  configuredPassword: string,
) {
  if (!submittedPassword || !configuredPassword) {
    return false;
  }

  return safeEqual(submittedPassword, configuredPassword);
}

function parsePayload(encodedPayload: string): AdminSessionPayload | null {
  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AdminSessionPayload>;

    if (
      payload.role !== "admin" ||
      typeof payload.issuedAt !== "number" ||
      typeof payload.expiresAt !== "number"
    ) {
      return null;
    }

    return payload as AdminSessionPayload;
  } catch {
    return null;
  }
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}
