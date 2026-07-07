import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PublicPage } from "@/components/site/PublicPage";
import type { LeadFormAction } from "@/components/forms/LeadForm";
import { publicPages } from "@/lib/content/public-pages";

const leadAction: LeadFormAction = async () => ({
  ok: false,
  message: "",
  fieldErrors: {},
  values: {},
});

describe("PublicPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the Senja location page with local positioning and the lead form", () => {
    render(<PublicPage leadAction={leadAction} page={publicPages.senja} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /maler på senja/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/vær, avstander og underlag/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send forespørsel/i }),
    ).toBeInTheDocument();
  });

  it("renders the core V1 pages with distinct Norwegian positioning", () => {
    const expectations = [
      {
        page: publicPages.finnsnes,
        heading: /maler i finnsnes/i,
        text: /boliger rundt finnsnes/i,
        hasForm: true,
      },
      {
        page: publicPages.innvendigMaling,
        heading: /innvendig maling/i,
        text: /vegger, tak og listverk/i,
        hasForm: true,
      },
      {
        page: publicPages.utvendigMaling,
        heading: /utvendig maling/i,
        text: /vær og kledning/i,
        hasForm: true,
      },
      {
        page: publicPages.mobelmaling,
        heading: /møbelmaling/i,
        text: /møbler, skap og detaljer/i,
        hasForm: true,
      },
      {
        page: publicPages.kontakt,
        heading: /kontakt senja malere/i,
        text: /skjemaet er hovedveien/i,
        hasForm: true,
      },
      {
        page: publicPages.personvern,
        heading: /personvern/i,
        text: /lagrer ikke rå ip-adresser/i,
        hasForm: false,
      },
    ];

    for (const expectation of expectations) {
      const { unmount } = render(
        <PublicPage leadAction={leadAction} page={expectation.page} />,
      );

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: expectation.heading,
        }),
      ).toBeInTheDocument();
      expect(screen.getAllByText(expectation.text).length).toBeGreaterThan(0);

      if (expectation.hasForm) {
        expect(
          screen.getByRole("button", { name: /send forespørsel/i }),
        ).toBeInTheDocument();
      } else {
        expect(
          screen.queryByRole("button", { name: /send forespørsel/i }),
        ).not.toBeInTheDocument();
      }

      unmount();
    }
  });

  it("submits each major page with the correct source page", async () => {
    const user = userEvent.setup();
    const majorPages = [
      publicPages.senja,
      publicPages.finnsnes,
      publicPages.innvendigMaling,
      publicPages.utvendigMaling,
      publicPages.mobelmaling,
      publicPages.kontakt,
    ];

    for (const page of majorPages) {
      const action = jest.fn<ReturnType<LeadFormAction>, Parameters<LeadFormAction>>(
        async (_previousState, formData) => ({
          ok: true,
          message: "Mottatt.",
          fieldErrors: {},
          values: Object.fromEntries(formData.entries()),
        }),
      );
      const { unmount } = render(
        <PublicPage leadAction={action} page={page} />,
      );

      await user.type(screen.getByLabelText(/navn/i), "Kari Test");
      await user.type(screen.getByLabelText(/telefon/i), "900 00 000");
      await user.type(screen.getByLabelText(/område\/by/i), "Senja");
      await user.selectOptions(
        screen.getByLabelText(/tjeneste/i),
        "Innvendig maling",
      );
      await user.type(
        screen.getByLabelText(/prosjektbeskrivelse/i),
        "Male et rom.",
      );
      await user.click(screen.getByLabelText(/samtykker/i));
      await user.click(screen.getByRole("button", { name: /send forespørsel/i }));

      await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
      expect(action.mock.calls[0][1].get("sourcePage")).toBe(page.pathname);

      unmount();
      window.localStorage.clear();
    }
  });

  it("shows the request process with every public form and keeps the shared FAQ on the contact page only", () => {
    const pagesWithForms = [
      publicPages.senja,
      publicPages.finnsnes,
      publicPages.innvendigMaling,
      publicPages.utvendigMaling,
      publicPages.mobelmaling,
      publicPages.kontakt,
    ];

    for (const page of pagesWithForms) {
      const { unmount } = render(
        <PublicPage leadAction={leadAction} page={page} />,
      );

      expect(
        screen.getAllByRole("heading", { name: /send forespørsel/i }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getByRole("heading", { name: /avklar maleprosjektet/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /planlegg neste steg/i }),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/du kan også ringe/i).length).toBeGreaterThan(
        0,
      );

      if (page.type === "contact") {
        expect(
          screen.getByRole("region", { name: /ofte stilte spørsmål/i }),
        ).toBeInTheDocument();
      } else {
        expect(
          screen.queryByRole("region", { name: /ofte stilte spørsmål/i }),
        ).not.toBeInTheDocument();
      }

      unmount();
    }
  });

  it("frames the contact page as form-first with phone as a secondary path", () => {
    render(<PublicPage leadAction={leadAction} page={publicPages.kontakt} />);

    expect(screen.getByText(/skjemaet er hovedveien/i)).toBeInTheDocument();
    expect(screen.getAllByText(/du kan også ringe/i)).toHaveLength(3);
    expect(
      screen.getAllByRole("link", { name: /\+47 986 41 443/i })[0],
    ).toHaveAttribute("href", "tel:+4798641443");
    expect(
      screen.queryByText(/eneste offentlige kontaktvei/i),
    ).not.toBeInTheDocument();
  });

  it("places the secondary phone path after the form on public form pages", () => {
    for (const page of [
      publicPages.senja,
      publicPages.finnsnes,
      publicPages.innvendigMaling,
      publicPages.utvendigMaling,
      publicPages.mobelmaling,
      publicPages.kontakt,
    ]) {
      const { unmount } = render(
        <PublicPage leadAction={leadAction} page={page} />,
      );

      const submitButton = screen.getByRole("button", {
        name: /send forespørsel/i,
      });
      const phoneLinks = screen.getAllByRole("link", {
        name: /\+47 986 41 443/i,
      });
      const phoneLinkAfterForm = phoneLinks[phoneLinks.length - 1];

      expect(
        submitButton.compareDocumentPosition(phoneLinkAfterForm) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();

      unmount();
    }
  });

  it("renders a verified page image on each launch service page", () => {
    const servicePages = [
      {
        page: publicPages.innvendigMaling,
        image: /lys entré og trapp med malte hvite vegger/i,
        src: "interior.jpg",
      },
      {
        page: publicPages.utvendigMaling,
        image: /moderne enebolig med lys malt fasade/i,
        src: "exterior.jpg",
      },
      {
        page: publicPages.mobelmaling,
        image: /hvitmalt innebygd reol og skapinnredning/i,
        src: "furniture.jpg",
      },
    ];

    for (const { page, image, src } of servicePages) {
      const { unmount } = render(
        <PublicPage leadAction={leadAction} page={page} />,
      );

      expect(screen.getByRole("img", { name: image })).toHaveAttribute(
        "src",
        expect.stringContaining(src),
      );

      unmount();
    }
  });
});
