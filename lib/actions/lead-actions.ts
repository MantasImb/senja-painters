"use server";

import { headers } from "next/headers";

import type { LeadFormState } from "@/components/forms/LeadForm";
import { getServerEnv } from "@/lib/env";
import { getClientIp, hashIpIdentity } from "@/lib/ip-identity";
import { createLeadSubmission } from "@/lib/lead-submission";
import { createPrismaLeadSubmissionRepository } from "@/lib/prisma-lead-submission-repository";

export async function submitLeadAction(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const requestHeaders = await headers();
  const env = getServerEnv();
  const ipIdentity = getClientIp(requestHeaders);

  return createLeadSubmission(formData, {
    hashedIp: hashIpIdentity(ipIdentity, env.IP_HASH_SECRET),
    now: new Date(),
    repository: createPrismaLeadSubmissionRepository(),
    userAgent: requestHeaders.get("user-agent"),
  });
}
