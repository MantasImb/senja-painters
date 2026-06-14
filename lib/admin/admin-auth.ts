import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  adminSessionCookieName,
  verifyAdminSessionCookieValue,
} from "@/lib/admin/admin-session";
import { getServerEnv } from "@/lib/env";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(adminSessionCookieName)?.value;

  return verifyAdminSessionCookieValue(sessionCookie, {
    now: new Date(),
    secret: getServerEnv().SESSION_SECRET,
  });
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
