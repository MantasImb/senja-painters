import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  LeadForm,
  type LeadFormAction,
  leadFormDraftStorageKey,
} from "./LeadForm";

describe("LeadForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("submits without email, requires consent, captures source page, confirms success, and clears the draft", async () => {
    const user = userEvent.setup();
    const action = jest.fn<ReturnType<LeadFormAction>, Parameters<LeadFormAction>>(
      async (_previousState, formData) => {
        const values = Object.fromEntries(formData.entries());

        if (!formData.has("consent")) {
          return {
            ok: false,
            message: "Kontroller feltene og prøv igjen.",
            fieldErrors: { consent: "Samtykke er påkrevd." },
            values,
          };
        }

        return {
          ok: true,
          message:
            "Takk, forespørselen er mottatt. Senja Malere tar kontakt for å avklare prosjektet og neste steg.",
          leadId: "lead_1",
          fieldErrors: {},
          values,
        };
      },
    );

    render(
      <LeadForm
        action={action}
        sourcePage="/no"
        title="Start forespørselen"
      />,
    );

    await user.type(screen.getByLabelText(/navn/i), "Kari Test");
    await user.type(screen.getByLabelText(/telefon/i), "900 00 000");
    await user.type(screen.getByLabelText(/område\/by/i), "Finnsnes");
    await user.selectOptions(
      screen.getByLabelText(/tjeneste/i),
      "Innvendig maling",
    );
    await user.selectOptions(screen.getByLabelText(/boligtype/i), "Enebolig");
    await user.type(screen.getByLabelText(/ønsket tidspunkt/i), "Neste måned");
    await user.type(
      screen.getByLabelText(/prosjektbeskrivelse/i),
      "Male stue og kjøkken.",
    );

    expect(screen.getByLabelText(/samtykker/i)).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: /send forespørsel/i }));
    await screen.findByText(/samtykke er påkrevd/i);
    expect(action).toHaveBeenCalledTimes(1);

    await user.click(screen.getByLabelText(/samtykker/i));
    await user.click(screen.getByRole("button", { name: /send forespørsel/i }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
    const submittedFormData = action.mock.calls[1][1];
    expect(submittedFormData.get("email")).toBe("");
    expect(submittedFormData.get("sourcePage")).toBe("/no");

    expect(
      await screen.findByText(/forespørselen er mottatt/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/24 timer|samme dag/i)).not.toBeInTheDocument();
    expect(window.localStorage.getItem(leadFormDraftStorageKey)).toBeNull();
  });

  it("persists non-consent draft fields but requires consent again after reload", async () => {
    const user = userEvent.setup();
    const action = jest.fn<ReturnType<LeadFormAction>, Parameters<LeadFormAction>>(
      async () => ({
        ok: true,
        message: "Mottatt.",
        fieldErrors: {},
        values: {},
      }),
    );

    const { unmount } = render(
      <LeadForm
        action={action}
        sourcePage="/no"
        title="Start forespørselen"
      />,
    );

    await user.type(screen.getByLabelText(/navn/i), "Ola Nordmann");
    await user.type(screen.getByLabelText(/telefon/i), "911 11 111");
    await user.click(screen.getByLabelText(/samtykker/i));

    unmount();

    render(
      <LeadForm
        action={action}
        sourcePage="/no"
        title="Start forespørselen"
      />,
    );

    expect(screen.getByLabelText(/navn/i)).toHaveValue("Ola Nordmann");
    expect(screen.getByLabelText(/telefon/i)).toHaveValue("911 11 111");
    expect(screen.getByLabelText(/samtykker/i)).not.toBeChecked();
  });

  it("migrates drafts saved under the former English brand key", () => {
    window.localStorage.setItem(
      "senja-painters:lead-form-draft",
      JSON.stringify({
        name: "Kari Test",
        phone: "900 00 000",
      }),
    );

    render(
      <LeadForm
        action={async () => ({
          ok: false,
          message: "",
          fieldErrors: {},
          values: {},
        })}
        sourcePage="/no"
        title="Start forespørselen"
      />,
    );

    expect(screen.getByLabelText(/navn/i)).toHaveValue("Kari Test");
    expect(window.localStorage.getItem(leadFormDraftStorageKey)).not.toBeNull();
    expect(
      window.localStorage.getItem("senja-painters:lead-form-draft"),
    ).toBeNull();
  });

  it("renders required native controls with explicit readable colors", () => {
    const action = jest.fn<ReturnType<LeadFormAction>, Parameters<LeadFormAction>>(
      async () => ({
        ok: false,
        message: "",
        fieldErrors: {},
        values: {},
      }),
    );

    render(
      <LeadForm
        action={action}
        sourcePage="/no"
        title="Start forespørselen"
      />,
    );

    expect(screen.getByLabelText(/navn/i)).toHaveClass(
      "bg-white",
      "[color:var(--foreground)]",
      "text-neutral-950",
      "caret-neutral-950",
    );
    const serviceSelect = screen.getByLabelText(/tjeneste/i);
    expect(serviceSelect).toHaveClass(
      "bg-background",
      "[color:var(--foreground)]",
    );
    expect(serviceSelect.parentElement).toHaveClass("[&_select]:bg-white");
    expect(serviceSelect.parentElement).toHaveClass(
      "[&_select]:text-neutral-950",
    );
    expect(screen.getByLabelText(/prosjektbeskrivelse/i)).toHaveClass(
      "bg-white",
      "[color:var(--foreground)]",
      "text-neutral-950",
      "caret-neutral-950",
    );
  });
});
