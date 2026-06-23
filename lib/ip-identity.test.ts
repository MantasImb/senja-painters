/** @jest-environment node */

import { getClientIp, hashIpIdentity } from "./ip-identity";

describe("IP identity", () => {
  it("uses the first forwarded client address and falls back to unknown", () => {
    expect(
      getClientIp(
        new Headers({
          "x-forwarded-for": "203.0.113.10, 10.0.0.1",
          "x-real-ip": "198.51.100.2",
        }),
      ),
    ).toBe("203.0.113.10");
    expect(getClientIp(new Headers())).toBe("unknown");
  });

  it("produces a deterministic hash without retaining the raw address", () => {
    const rawIp = "203.0.113.10";
    const hash = hashIpIdentity(rawIp, "s".repeat(32));

    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(rawIp);
    expect(hashIpIdentity(rawIp, "s".repeat(32))).toBe(hash);
  });
});
