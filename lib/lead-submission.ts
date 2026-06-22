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
  visitorId: string | null;
  sessionId: string | null;
  landingPage: string | null;
  pagesSeen: number | null;
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
  metadata: Record<string, number | string | null>;
  hashedIp: string;
  visitorId: string | null;
  sessionId: string | null;
  landingPage: string | null;
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
    .pipe(z.union([z.email("Skriv inn en gyldig e-post."), z.literal("")]))
    .optional()
    .transform((value) => value ?? ""),
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
  visitorId: optionalAttributionString(),
  sessionId: optionalAttributionString(),
  landingPage: optionalAttributionString(),
  pagesSeen: z.coerce.number().int().min(1).max(10000).optional().catch(1),
  companyWebsite: z.string().trim().optional().default(""),
});

const successMessage =
  "Takk, forespørselen er mottatt. Senja Malere tar kontakt for å avklare prosjektet og neste steg.";

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
    visitorId: optionalString(submission.visitorId),
    sessionId: optionalString(submission.sessionId),
    landingPage: optionalString(submission.landingPage),
    pagesSeen: submission.pagesSeen ?? null,
    status: "new",
    hashedIp,
    userAgent,
    createdAt: now,
  });

  await repository.recordAnalyticsEvent({
    name: "lead_submitted",
    page: submission.sourcePage,
    metadata: {
      landingPage: optionalString(submission.landingPage),
      leadId,
      pagesSeen: submission.pagesSeen ?? null,
      serviceType: submission.serviceType,
      sessionId: optionalString(submission.sessionId),
      visitorId: optionalString(submission.visitorId),
    },
    hashedIp,
    visitorId: optionalString(submission.visitorId),
    sessionId: optionalString(submission.sessionId),
    landingPage: optionalString(submission.landingPage),
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
    values[key] = formDataEntryValueToString(value);
  }

  return values;
}

function formDataEntryValueToString(value: FormDataEntryValue) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof File !== "undefined" && value instanceof File) {
    return value.name;
  }

  const namedValue = value as { name?: unknown };
  return typeof namedValue.name === "string" ? namedValue.name : String(value);
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

function optionalAttributionString() {
  return z.string().trim().max(200).optional().default("");
}
