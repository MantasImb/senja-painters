import { z } from "zod";

import type { LeadFormState } from "@/components/forms/LeadForm";

export const leadStatuses = [
  "new",
  "contacted",
  "sent_to_partner",
  "closed",
  "spam",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type LeadSubmissionRecord = {
  name: string;
  phone: string;
  email: string | null;
  area: string;
  serviceType: string;
  propertyType: string | null;
  desiredTimeframe: string | null;
  projectDescription: string;
  consentGiven: true;
  sourcePage: string;
  status: LeadStatus;
  hashedIp: string;
  userAgent: string | null;
  createdAt: Date;
};

export type HoneypotSubmissionRecord = {
  submittedFields: Record<string, string>;
  sourcePage: string;
  filledHoneypot: string;
  userAgent: string | null;
  hashedIp: string;
  createdAt: Date;
};

export type AnalyticsEventRecord = {
  name: "lead_submitted";
  page: string;
  metadata: Record<string, string>;
  hashedIp: string;
  createdAt: Date;
};

export type LeadSubmissionRepository = {
  countSuccessfulSubmissions(input: {
    hashedIp: string;
    since: Date;
  }): Promise<number>;
  createHoneypotSubmission(
    submission: HoneypotSubmissionRecord,
  ): Promise<void>;
  createLead(lead: LeadSubmissionRecord): Promise<string>;
  incrementBlockedSubmission(input: {
    hashedIp: string;
    now: Date;
  }): Promise<void>;
  incrementSuccessfulSubmission(input: {
    hashedIp: string;
    now: Date;
  }): Promise<void>;
  recordAnalyticsEvent(event: AnalyticsEventRecord): Promise<void>;
};

const submissionSchema = z.object({
  name: z.string().trim().min(1, "Navn er påkrevd."),
  phone: z.string().trim().min(1, "Telefon er påkrevd."),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .pipe(z.union([z.literal(""), z.email("Skriv inn en gyldig e-post.")])),
  area: z.string().trim().min(1, "Område/by er påkrevd."),
  serviceType: z.enum(
    ["Innvendig maling", "Utvendig maling", "Møbler og detaljer"],
    "Velg en tjeneste.",
  ),
  propertyType: z.string().trim().optional().default(""),
  desiredTimeframe: z.string().trim().optional().default(""),
  projectDescription: z
    .string()
    .trim()
    .min(1, "Prosjektbeskrivelse er påkrevd."),
  consent: z.literal("yes", "Samtykke er påkrevd."),
  sourcePage: z.string().trim().min(1).default("/no"),
  companyWebsite: z.string().trim().optional().default(""),
});

const successMessage =
  "Takk, forespørselen er mottatt. Senja Painters tar kontakt for å avklare prosjektet og neste steg.";

const genericFailureMessage =
  "Forespørselen kunne ikke sende akkurat nå. Prøv igjen senere.";

export async function createLeadSubmission(
  formData: FormData,
  {
    hashedIp,
    now,
    repository,
    userAgent,
  }: {
    hashedIp: string;
    now: Date;
    repository: LeadSubmissionRepository;
    userAgent: string | null;
  },
): Promise<LeadFormState> {
  const rawValues = formDataToObject(formData);
  const parsed = submissionSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Kontroller feltene og prøv igjen.",
      fieldErrors: flattenFieldErrors(parsed.error),
      values: rawValues,
    };
  }

  const submission = parsed.data;

  if (submission.companyWebsite) {
    await repository.createHoneypotSubmission({
      submittedFields: rawValues,
      sourcePage: submission.sourcePage,
      filledHoneypot: submission.companyWebsite,
      userAgent,
      hashedIp,
      createdAt: now,
    });

    return successState(rawValues);
  }

  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const successfulSubmissionCount =
    await repository.countSuccessfulSubmissions({
      hashedIp,
      since,
    });

  if (successfulSubmissionCount >= 3) {
    await repository.incrementBlockedSubmission({ hashedIp, now });

    return {
      ok: false,
      message: genericFailureMessage,
      fieldErrors: {},
      values: rawValues,
    };
  }

  await repository.incrementSuccessfulSubmission({ hashedIp, now });
  const leadId = await repository.createLead({
    name: submission.name,
    phone: submission.phone,
    email: optionalString(submission.email),
    area: submission.area,
    serviceType: submission.serviceType,
    propertyType: optionalString(submission.propertyType),
    desiredTimeframe: optionalString(submission.desiredTimeframe),
    projectDescription: submission.projectDescription,
    consentGiven: true,
    sourcePage: submission.sourcePage,
    status: "new",
    hashedIp,
    userAgent,
    createdAt: now,
  });

  await repository.recordAnalyticsEvent({
    name: "lead_submitted",
    page: submission.sourcePage,
    metadata: { leadId, serviceType: submission.serviceType },
    hashedIp,
    createdAt: now,
  });

  return {
    ...successState(rawValues),
    leadId,
  };
}

function successState(values: Record<string, string>): LeadFormState {
  return {
    ok: true,
    message: successMessage,
    fieldErrors: {},
    values,
  };
}

function formDataToObject(formData: FormData) {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    values[key] = typeof value === "string" ? value : value.name;
  }

  return values;
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: LeadFormState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field as keyof LeadFormState["fieldErrors"]] = issue.message;
    }
  }

  return fieldErrors;
}

function optionalString(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}
