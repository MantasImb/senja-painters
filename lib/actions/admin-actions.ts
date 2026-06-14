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
import {
  createPrismaAdminLeadRepository,
  getAdminLeadDetail,
} from "@/lib/admin/admin-repository";
import { updateLeadStatus } from "@/lib/admin/admin-service";
import { getDb } from "@/lib/db";
import { getServerEnv } from "@/lib/env";
import { leadStatuses, type LeadStatus } from "@/lib/lead-submission";

export async function loginAdminAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const env = getServerEnv();
  const db = getDb();

  if (!isValidAdminPassword(password, env.ADMIN_PASSWORD)) {
    await db.analyticsEvent.create({
      data: {
        createdAt: new Date(),
        name: "admin_login_failed",
        page: "/admin/login",
      },
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
    secure: process.env.NODE_ENV === "production",
  });

  await db.analyticsEvent.create({
    data: {
      createdAt: now,
      name: "admin_login_success",
      page: "/admin/login",
    },
  });

  redirect("/admin");
}

export async function updateLeadStatusAction(formData: FormData) {
  await requireAdminSession();

  const leadId = String(formData.get("leadId") ?? "");
  const newStatus = String(formData.get("status") ?? "");

  if (!isLeadStatus(newStatus)) {
    throw new Error("Unsupported lead status");
  }

  const lead = await getAdminLeadDetail(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  await updateLeadStatus(
    {
      leadId,
      newStatus,
      previousStatus: lead.status,
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

function isLeadStatus(status: string): status is LeadStatus {
  return leadStatuses.includes(status as LeadStatus);
}
