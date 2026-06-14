CREATE TYPE "LeadStatus" AS ENUM (
  'new',
  'contacted',
  'sent_to_partner',
  'closed',
  'spam'
);

CREATE TYPE "AnalyticsEventName" AS ENUM (
  'page_view',
  'lead_submitted',
  'admin_login_success',
  'admin_login_failed',
  'lead_status_changed'
);

CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "area" TEXT NOT NULL,
  "serviceType" TEXT NOT NULL,
  "propertyType" TEXT,
  "desiredTimeframe" TEXT,
  "projectDescription" TEXT NOT NULL,
  "consentGiven" BOOLEAN NOT NULL DEFAULT true,
  "sourcePage" TEXT NOT NULL,
  "status" "LeadStatus" NOT NULL DEFAULT 'new',
  "hashedIp" TEXT,
  "userAgent" TEXT,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadStatusEvent" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "previousStatus" "LeadStatus",
  "newStatus" "LeadStatus" NOT NULL,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadStatusEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "name" "AnalyticsEventName" NOT NULL,
  "page" TEXT,
  "metadata" JSONB,
  "hashedIp" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimitEntry" (
  "id" TEXT NOT NULL,
  "hashedIp" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "successfulSubmissionCount" INTEGER NOT NULL DEFAULT 0,
  "blockedSubmissionCount" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HoneypotSubmission" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedFields" JSONB NOT NULL,
  "sourcePage" TEXT NOT NULL,
  "filledHoneypot" TEXT NOT NULL,
  "userAgent" TEXT,
  "hashedIp" TEXT NOT NULL,
  CONSTRAINT "HoneypotSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_sourcePage_idx" ON "Lead"("sourcePage");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

CREATE INDEX "LeadStatusEvent_leadId_idx" ON "LeadStatusEvent"("leadId");
CREATE INDEX "LeadStatusEvent_changedAt_idx" ON "LeadStatusEvent"("changedAt");

CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
CREATE INDEX "AnalyticsEvent_name_idx" ON "AnalyticsEvent"("name");
CREATE INDEX "AnalyticsEvent_page_idx" ON "AnalyticsEvent"("page");

CREATE UNIQUE INDEX "RateLimitEntry_hashedIp_windowStart_key" ON "RateLimitEntry"("hashedIp", "windowStart");
CREATE INDEX "RateLimitEntry_windowStart_idx" ON "RateLimitEntry"("windowStart");

CREATE INDEX "HoneypotSubmission_createdAt_idx" ON "HoneypotSubmission"("createdAt");
CREATE INDEX "HoneypotSubmission_sourcePage_idx" ON "HoneypotSubmission"("sourcePage");

ALTER TABLE "LeadStatusEvent"
  ADD CONSTRAINT "LeadStatusEvent_leadId_fkey"
  FOREIGN KEY ("leadId")
  REFERENCES "Lead"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
