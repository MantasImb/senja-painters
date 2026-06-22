describe("metadata routes", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = "https://senjamalere.no";
  });

  it("lists every V1 public page in the sitemap", async () => {
    const sitemap = (await import("@/app/sitemap")).default();

    expect(sitemap.map((entry) => entry.url)).toEqual([
      "https://senjamalere.no/no",
      "https://senjamalere.no/no/senja",
      "https://senjamalere.no/no/finnsnes",
      "https://senjamalere.no/no/innvendig-maling",
      "https://senjamalere.no/no/utvendig-maling",
      "https://senjamalere.no/no/mobelmaling",
      "https://senjamalere.no/no/kontakt",
      "https://senjamalere.no/no/personvern",
    ]);
    expect(sitemap.every((entry) => entry.changeFrequency === "monthly")).toBe(
      true,
    );
  });

  it("allows public crawling while excluding admin routes", async () => {
    const robots = (await import("@/app/robots")).default();

    expect(robots).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: "/admin/",
      },
      sitemap: "https://senjamalere.no/sitemap.xml",
    });
  });
});
