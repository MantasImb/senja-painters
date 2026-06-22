jest.mock("@/lib/actions/lead-actions", () => ({
  submitLeadAction: jest.fn(),
}));

describe("public page metadata", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = "https://senjamalere.no";
  });

  it("exposes page-specific Norwegian metadata with canonical and Open Graph URLs", async () => {
    const { metadata: finnsnesMetadata } =
      await import("@/app/no/finnsnes/page");

    expect(finnsnesMetadata).toMatchObject({
      title: "Maler i Finnsnes | Senja Malere",
      description:
        "Be om malerhjelp i Finnsnes og nærområdene. Senja Malere tar imot forespørsler om innvendig maling, utvendig maling og møbelmaling.",
      alternates: {
        canonical: "https://senjamalere.no/no/finnsnes",
      },
      openGraph: {
        title: "Maler i Finnsnes | Senja Malere",
        description:
          "Lokal malerhjelp for boliger i Finnsnes og nærområdene.",
        url: "https://senjamalere.no/no/finnsnes",
        locale: "nb_NO",
        siteName: "Senja Malere",
        type: "website",
      },
    });
  });

  it("exposes unique metadata for every V1 public page", async () => {
    const routes = [
      {
        pathname: "/no",
        metadata: (await import("@/app/no/page")).metadata,
      },
      {
        pathname: "/no/senja",
        metadata: (await import("@/app/no/senja/page")).metadata,
      },
      {
        pathname: "/no/finnsnes",
        metadata: (await import("@/app/no/finnsnes/page")).metadata,
      },
      {
        pathname: "/no/innvendig-maling",
        metadata: (await import("@/app/no/innvendig-maling/page")).metadata,
      },
      {
        pathname: "/no/utvendig-maling",
        metadata: (await import("@/app/no/utvendig-maling/page")).metadata,
      },
      {
        pathname: "/no/mobelmaling",
        metadata: (await import("@/app/no/mobelmaling/page")).metadata,
      },
      {
        pathname: "/no/kontakt",
        metadata: (await import("@/app/no/kontakt/page")).metadata,
      },
      {
        pathname: "/no/personvern",
        metadata: (await import("@/app/no/personvern/page")).metadata,
      },
    ];

    expect(new Set(routes.map((route) => route.metadata.title)).size).toBe(
      routes.length,
    );
    expect(
      new Set(routes.map((route) => route.metadata.description)).size,
    ).toBe(routes.length);

    for (const route of routes) {
      expect(route.metadata.alternates).toMatchObject({
        canonical: `https://senjamalere.no${route.pathname}`,
      });
      expect(route.metadata.openGraph).toMatchObject({
        url: `https://senjamalere.no${route.pathname}`,
        siteName: "Senja Malere",
        locale: "nb_NO",
        type: "website",
      });
    }
  });
});
