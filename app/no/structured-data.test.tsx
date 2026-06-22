import { render, screen } from "@testing-library/react";

describe("public structured data", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = "https://senjamalere.no";
  });

  it("renders WebSite and restrained LocalBusiness JSON-LD for public pages", async () => {
    const PublicLayout =
      (await import("@/app/no/layout")).default;

    render(
      <PublicLayout>
        <main>Public page</main>
      </PublicLayout>,
    );

    const script = screen.getByTestId("public-json-ld");
    expect(script.textContent).not.toBeNull();
    const graph = JSON.parse(script.textContent ?? "{}");
    const website = graph["@graph"].find(
      (node: Record<string, unknown>) => node["@type"] === "WebSite",
    );
    const localBusiness = graph["@graph"].find(
      (node: Record<string, unknown>) => node["@type"] === "LocalBusiness",
    );

    expect(website).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Senja Malere",
      url: "https://senjamalere.no/no",
      inLanguage: "nb-NO",
    });
    expect(localBusiness).toMatchObject({
      "@type": "LocalBusiness",
      name: "Senja Malere",
      url: "https://senjamalere.no/no",
      areaServed: [{ name: "Senja" }, { name: "Finnsnes" }],
      makesOffer: [
        { itemOffered: { name: "Innvendig maling" } },
        { itemOffered: { name: "Utvendig maling" } },
        { itemOffered: { name: "Møbelmaling" } },
      ],
    });

    for (const unsupportedClaim of [
      "address",
      "telephone",
      "email",
      "openingHours",
      "openingHoursSpecification",
      "aggregateRating",
      "review",
      "foundingDate",
      "identifier",
      "sameAs",
    ]) {
      expect(localBusiness).not.toHaveProperty(unsupportedClaim);
    }
  });
});
