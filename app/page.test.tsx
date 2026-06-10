import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home", () => {
  it("renders the Senja Painters homepage", () => {
    render(<Home />);

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
});
