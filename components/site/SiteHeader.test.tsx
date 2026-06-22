import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SiteHeader } from "@/components/site/SiteHeader";

describe("SiteHeader", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
      writable: true,
    });
  });

  it("starts transparent over the hero and becomes solid after scrolling", async () => {
    render(<SiteHeader overlay />);

    const header = screen.getByRole("banner");

    expect(header).toHaveAttribute("data-scrolled", "false");
    expect(header).toHaveClass("bg-transparent", "text-white");
    expect(screen.getByRole("button", { name: /områder/i })).toHaveClass(
      "!text-white/88",
      "data-[state=open]:!bg-white/12",
      "data-[state=open]:!text-white",
    );

    window.scrollY = 48;
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(header).toHaveAttribute("data-scrolled", "true");
    });
    expect(header).toHaveClass("bg-white/94", "text-neutral-950");
  });
});
