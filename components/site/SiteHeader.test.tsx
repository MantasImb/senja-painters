import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SiteHeader } from "@/components/site/SiteHeader";

describe("SiteHeader", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
      writable: true,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        addEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: jest.fn(),
      })),
      writable: true,
    });
  });

  it("starts transparent over the hero and becomes solid after scrolling", async () => {
    render(<SiteHeader overlay />);

    const header = screen.getByRole("banner");

    expect(header).toHaveAttribute("data-scrolled", "false");
    expect(header).toHaveClass("bg-transparent", "text-white");
    const areasButton = screen.getByRole("button", { name: /områder/i });

    expect(areasButton).toHaveClass(
      "!text-white/88",
      "data-[state=open]:!bg-white/12",
      "data-[state=open]:!text-white",
    );

    fireEvent.click(areasButton);

    expect(
      document.querySelector('[data-slot="navigation-menu-content"]'),
    ).toHaveClass("!bg-white", "!text-neutral-950");

    window.scrollY = 48;
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(header).toHaveAttribute("data-scrolled", "true");
    });
    expect(header).toHaveClass("bg-white/94", "text-neutral-950");
  });

  it("opens and closes the mobile navigation", () => {
    render(<SiteHeader overlay />);

    const openMenuButton = screen.getByRole("button", { name: "Åpne meny" });

    expect(
      screen.queryByRole("navigation", { name: "Mobilnavigasjon" }),
    ).not.toBeInTheDocument();

    fireEvent.click(openMenuButton);

    expect(
      screen.getByRole("navigation", { name: "Mobilnavigasjon" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lukk meny" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("banner")).toHaveClass(
      "bg-white/94",
      "text-neutral-950",
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(
      screen.queryByRole("navigation", { name: "Mobilnavigasjon" }),
    ).not.toBeInTheDocument();
  });
});
