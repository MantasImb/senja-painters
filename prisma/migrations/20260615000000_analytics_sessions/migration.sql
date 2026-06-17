ALTER TABLE "Lead"
  ADD COLUMN "visitorId" TEXT,
  ADD COLUMN "sessionId" TEXT,
  ADD COLUMN "landingPage" TEXT,
  ADD COLUMN "pagesSeen" INTEGER;

ALTER TABLE "AnalyticsEvent"
  ADD COLUMN "visitorId" TEXT,
  ADD COLUMN "sessionId" TEXT,
  ADD COLUMN "landingPage" TEXT;

CREATE INDEX "Lead_landingPage_idx" ON "Lead"("landingPage");
CREATE INDEX "Lead_sessionId_idx" ON "Lead"("sessionId");

CREATE INDEX "AnalyticsEvent_visitorId_idx" ON "AnalyticsEvent"("visitorId");
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");
CREATE INDEX "AnalyticsEvent_landingPage_idx" ON "AnalyticsEvent"("landingPage");
