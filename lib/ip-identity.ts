import { createHmac } from "crypto";

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    headers.get("x-real-ip") ||
    headers.get("x-vercel-forwarded-for") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function hashIpIdentity(ipIdentity: string, secret: string) {
  return createHmac("sha256", secret).update(ipIdentity).digest("hex");
}
