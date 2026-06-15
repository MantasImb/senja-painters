import { render, screen, within } from "@testing-library/react";

import { SenjaHomePage } from "@/components/site/SenjaHomePage";

describe("Home", () => {
  it("renders the Senja Malere homepage", () => {
    render(
      <SenjaHomePage
        leadAction={async () => ({
          ok: false,
          message: "",
          fieldErrors: {},
          values: {},
        })}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /malerhjelp for hjem på senja og i finnsnes/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send forespørsel/i }),
    ).toBeInTheDocument();
  });

  it("uses a dedicated hero outline variant for the secondary CTA", () => {
    render(
      <SenjaHomePage
        leadAction={async () => ({
          ok: false,
          message: "",
          fieldErrors: {},
          values: {},
        })}
      />,
    );

    const secondaryCta = screen.getByRole("link", { name: /se tjenester/i });

    expect(secondaryCta).toHaveClass("bg-transparent", "text-white");
    expect(secondaryCta).not.toHaveClass("bg-background");
  });

  it("lets visitors navigate from grouped top-level menu sections", () => {
    render(
      <SenjaHomePage
        leadAction={async () => ({
          ok: false,
          message: "",
          fieldErrors: {},
          values: {},
        })}
      />,
    );

    const navigation = screen.getByRole("navigation", {
      name: /hovednavigasjon/i,
    });

    expect(
      within(navigation).getByRole("button", { name: /områder/i }),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole("button", { name: /tjenester/i }),
    ).toBeInTheDocument();
    expect(
      within(navigation).queryByRole("link", { name: /innvendig maling/i }),
    ).not.toBeInTheDocument();
    expect(
      within(navigation).getByRole("link", { name: /kontakt/i }),
    ).toHaveAttribute("href", "/no/kontakt");
    expect(
      within(navigation).getByRole("link", { name: /personvern/i }),
    ).toHaveAttribute("href", "/no/personvern");
  });
});
