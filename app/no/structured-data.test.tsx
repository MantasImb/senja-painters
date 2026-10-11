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
      telephone: "+47 986 41 443",
      areaServed: [{ name: "Senja" }, { name: "Finnsnes" }],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+47 986 41 443",
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "22:00",
        },
      },
      makesOffer: [
        { itemOffered: { name: "Innvendig maling" } },
        { itemOffered: { name: "Utvendig maling" } },
        { itemOffered: { name: "Møbelmaling" } },
      ],
    });

    for (const unsupportedClaim of [
      "address",
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
