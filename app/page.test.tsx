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
    expect(screen.getByText("Senja")).toBeInTheDocument();
    expect(screen.getByText("Finnsnes")).toBeInTheDocument();
    expect(screen.queryByText("Silsand")).not.toBeInTheDocument();
    expect(screen.queryByText("Gibostad")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /moderne enebolig med lys fasade i skumringen/i,
      }),
    ).toHaveAttribute("src", expect.stringContaining("hero.jpg"));
    expect(
      screen.getByRole("img", {
        name: /lys entré og trapp med malte hvite vegger/i,
      }),
    ).toHaveAttribute("src", expect.stringContaining("interior.jpg"));
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

  it("keeps the homepage form first while showing secondary phone, request process, and the shared launch FAQ", () => {
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

    expect(screen.getByRole("link", { name: /be om kontakt/i })).toHaveAttribute(
      "href",
      "#foresporsel",
    );
    const submitButton = screen.getByRole("button", {
      name: /send forespørsel/i,
    });
    const processHeading = screen.getByRole("heading", {
      level: 2,
      name: /slik fungerer forespørselen/i,
    });

    expect(submitButton).toBeInTheDocument();
    expect(
      submitButton.compareDocumentPosition(processHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByText(/du kan også ringe/i)).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: /\+47 986 41 443/i })[0],
    ).toHaveAttribute("href", "tel:+4798641443");

    for (const step of [
      /send forespørsel/i,
      /avklar maleprosjektet/i,
      /planlegg neste steg/i,
    ]) {
      expect(screen.getByRole("heading", { name: step })).toBeInTheDocument();
    }

    const faq = screen.getByRole("region", {
      name: /ofte stilte spørsmål/i,
    });
    const questions = within(faq).getAllByRole("heading", { level: 3 });

    expect(questions).toHaveLength(4);
    expect(
      within(faq).getByRole("heading", {
        level: 3,
        name: /hvilke områder dekker senja malere/i,
      }),
    ).toBeInTheDocument();
    expect(within(faq).getByText(/senja og finnsnes/i)).toBeInTheDocument();
    expect(
      within(faq).getByRole("heading", {
        level: 3,
        name: /hvilke maleprosjekter kan jeg sende inn/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(faq).getByRole("heading", {
        level: 3,
        name: /kan jeg spørre om mindre prosjekter/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(faq).getByText(/dører, skap, kjøkkenfronter, innebygde løsninger og møbler/i),
    ).toBeInTheDocument();
    expect(
      within(faq).getByRole("heading", {
        level: 3,
        name: /hva skjer etter at jeg sender forespørselen/i,
      }),
    ).toBeInTheDocument();
    expect(within(faq).queryByText(/\+47 986 41 443/i)).not.toBeInTheDocument();
    expect(within(faq).queryByText(/08:00-22:00/i)).not.toBeInTheDocument();
  });
});
