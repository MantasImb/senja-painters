import { render, screen } from "@testing-library/react";

import { SenjaHomePage } from "@/components/site/SenjaHomePage";

describe("Home", () => {
  it("renders the Senja Painters homepage", () => {
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
});
