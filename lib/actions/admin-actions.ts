"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  adminSessionCookieName,
  createAdminSessionCookieValue,
  isValidAdminPassword,
} from "@/lib/admin/admin-session";
import { requireAdminSession } from "@/lib/admin/admin-auth";
import { createPrismaAdminLeadRepository } from "@/lib/admin/admin-repository";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { updateLeadStatus } from "@/lib/admin/admin-service";
import { getServerEnv, isProductionEnvironment } from "@/lib/env";

export async function loginAdminAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const env = getServerEnv();

  if (!isValidAdminPassword(password, env.ADMIN_PASSWORD)) {
    await recordAnalyticsEvent({
      createdAt: new Date(),
      name: "admin_login_failed",
      page: "/admin/login",
    });
    redirect("/admin/login?error=1");
  }

  const now = new Date();
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieName, createAdminSessionCookieValue({
    now,
    secret: env.SESSION_SECRET,
  }), {
    expires: new Date(now.getTime() + 12 * 60 * 60 * 1000),
    httpOnly: true,
    path: "/admin",
    sameSite: "lax",
    secure: isProductionEnvironment(),
  });

  await recordAnalyticsEvent({
    createdAt: now,
    name: "admin_login_success",
    page: "/admin/login",
  });

  redirect("/admin");
}

export async function updateLeadStatusAction(formData: FormData) {
  await requireAdminSession();

  const leadId = String(formData.get("leadId") ?? "");
  const newStatus = String(formData.get("status") ?? "");

  await updateLeadStatus(
    {
      leadId,
      newStatus,
    },
    {
      changedAt: new Date(),
      repository: createPrismaAdminLeadRepository(),
    },
  );

  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${leadId}`);
  redirect(`/admin/leads/${leadId}`);
}
