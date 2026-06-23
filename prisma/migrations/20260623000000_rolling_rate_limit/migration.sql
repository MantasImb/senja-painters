DROP INDEX "RateLimitEntry_hashedIp_windowStart_key";

CREATE INDEX "RateLimitEntry_hashedIp_windowStart_idx"
  ON "RateLimitEntry"("hashedIp", "windowStart");
